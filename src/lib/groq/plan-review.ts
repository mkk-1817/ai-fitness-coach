import { AIMealPlanResponse, AIWorkoutPlanResponse, GenerationProfile, ResolvedWorkoutOptions } from '@/types/ai';

// ==============================================================================
// SEMANTIC REVIEW OF SCHEMA-VALID AI RESPONSES
// "hard" issues are never shown to the user (the plan is regenerated and, if
// the model keeps failing, the request errors). "soft" issues trigger a
// corrective retry while attempts remain and are otherwise surfaced as warnings.
// ==============================================================================

export interface ReviewIssue {
  severity: 'hard' | 'soft';
  message: string;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function containsTerm(haystack: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (t.length < 3) return false;
  return new RegExp(`\\b${escapeRegExp(t)}(e?s)?\\b`, 'i').test(haystack);
}

const ACTIVITY_SYNONYMS: Record<string, string[]> = {
  cycling: ['bike', 'biking', 'cycle', 'spin'],
  skipping: ['jump rope', 'rope skipping', 'skip rope'],
  football: ['soccer', 'futsal'],
  walking: ['walk', 'hike', 'hiking'],
  swimming: ['swim', 'laps'],
};

/** "Running" matches "Easy Run", "Tempo run" etc.: exact term, -ing stem prefix, or a known synonym. */
function mentionsActivity(text: string, activity: string): boolean {
  const term = activity.trim().toLowerCase();
  if (containsTerm(text, term)) return true;
  const stem = term.replace(/ing$/, '').replace(/([^aeiou])\1$/, '$1');
  if (stem !== term && stem.length >= 3 && new RegExp(`\\b${escapeRegExp(stem)}`, 'i').test(text)) return true;
  return (ACTIVITY_SYNONYMS[term] || []).some(syn => new RegExp(`\\b${escapeRegExp(syn)}`, 'i').test(text));
}

// ------------------------------------------------------------------------------
// WORKOUT
// ------------------------------------------------------------------------------

export function reviewWorkoutPlan(
  plan: AIWorkoutPlanResponse,
  profile: GenerationProfile,
  options: ResolvedWorkoutOptions
): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  const orders = plan.days.map(d => d.dayOrder).sort((a, b) => a - b);
  if (orders.join(',') !== '1,2,3,4,5,6,7') {
    issues.push({ severity: 'hard', message: 'days must have dayOrder 1..7 exactly once each (Monday to Sunday).' });
  }

  const trainingDays = plan.days.filter(d => !d.isRestDay);
  if (trainingDays.length !== options.daysPerWeek) {
    issues.push({
      severity: 'soft',
      message: `The week must contain exactly ${options.daysPerWeek} training days (found ${trainingDays.length}).`,
    });
  }

  for (const day of plan.days) {
    if (day.isRestDay !== (day.sessionType === 'rest')) {
      issues.push({ severity: 'soft', message: `${day.dayName}: sessionType must be "rest" if and only if isRestDay is true.` });
    }
    for (const ex of day.exercises) {
      if ((ex.category === 'cardio' || ex.category === 'sports' || ex.category === 'mobility') && !ex.durationMins) {
        issues.push({ severity: 'soft', message: `${day.dayName} / ${ex.exerciseName}: durationMins is required for ${ex.category} blocks.` });
      }
    }
  }

  const allText = plan.days
    .flatMap(d => [d.focus, ...d.exercises.map(e => `${e.exerciseName} ${e.reps}`)])
    .join(' | ');

  for (const avoided of profile.avoidExercises) {
    if (avoided.trim().length >= 3 && allText.toLowerCase().includes(avoided.trim().toLowerCase())) {
      issues.push({ severity: 'hard', message: `The plan includes "${avoided}", which the user must avoid.` });
    }
  }

  const missingActivities = options.preferredActivities.filter(a => !mentionsActivity(allText, a));
  if (missingActivities.length > 0) {
    issues.push({
      severity: 'soft',
      message: `Include the user's preferred activities in the week: ${missingActivities.join(', ')}.`,
    });
  }

  if (options.workoutType === 'sports' && !trainingDays.some(d => d.exercises.some(e => e.category === 'sports'))) {
    issues.push({ severity: 'soft', message: 'A sports-focused plan must contain exercises with category "sports".' });
  }
  if (options.workoutType === 'cardio' && !trainingDays.some(d => d.exercises.some(e => e.category === 'cardio'))) {
    issues.push({ severity: 'soft', message: 'A cardio-focused plan must contain exercises with category "cardio".' });
  }

  return issues;
}

// ------------------------------------------------------------------------------
// MEAL PLAN
// ------------------------------------------------------------------------------

const MEAT_TERMS = ['chicken', 'mutton', 'lamb', 'goat', 'beef', 'pork', 'bacon', 'ham', 'meat', 'keema', 'turkey', 'duck', 'sausage', 'salami'];
const SEAFOOD_TERMS = ['fish', 'prawn', 'shrimp', 'crab', 'squid', 'tuna', 'salmon', 'sardine', 'mackerel', 'anchovy', 'seafood', 'meen', 'nethili', 'vanjaram', 'lobster', 'mussel'];
const EGG_TERMS = ['egg', 'omelette', 'omelet'];
const DAIRY_TERMS = ['milk', 'curd', 'yogurt', 'yoghurt', 'paneer', 'ghee', 'butter', 'cheese', 'whey', 'cream', 'buttermilk', 'honey'];
const PLANT_QUALIFIERS = /\b(coconut|almond|soy|soya|oat|peanut|cashew|rice|plant|vegan|tofu)\s+(milk|curd|yogurt|yoghurt|butter|cheese|cream)\b/gi;

function forbiddenTermsFor(dietType: string): { hard: string[]; soft: string[] } {
  switch (dietType) {
    case 'vegetarian':
      return { hard: [...MEAT_TERMS, ...SEAFOOD_TERMS, ...EGG_TERMS], soft: [] };
    case 'eggetarian':
      return { hard: [...MEAT_TERMS, ...SEAFOOD_TERMS], soft: [] };
    case 'vegan':
      return { hard: [...MEAT_TERMS, ...SEAFOOD_TERMS, ...EGG_TERMS], soft: DAIRY_TERMS };
    case 'pescatarian':
      return { hard: MEAT_TERMS, soft: [] };
    default:
      return { hard: [], soft: [] };
  }
}

export interface MealDayTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function computeMealDayTotals(meals: { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number }[]): MealDayTotals {
  const sum = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
      fiberG: acc.fiberG + m.fiberG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );
  return {
    calories: Math.round(sum.calories),
    proteinG: Math.round(sum.proteinG),
    carbsG: Math.round(sum.carbsG),
    fatG: Math.round(sum.fatG),
    fiberG: Math.round(sum.fiberG),
  };
}

export function reviewMealPlan(plan: AIMealPlanResponse, profile: GenerationProfile): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  const orders = plan.days.map(d => d.dayOrder).sort((a, b) => a - b);
  if (orders.join(',') !== '1,2,3,4,5,6,7') {
    issues.push({ severity: 'hard', message: 'days must have dayOrder 1..7 exactly once each (Monday to Sunday).' });
  }

  const forbidden = forbiddenTermsFor(profile.dietType);
  const restricted = [...profile.allergies, ...profile.foodsAvoided].filter(t => t.trim().length >= 3);

  for (const day of plan.days) {
    if (day.meals.length !== profile.mealsPerDay) {
      issues.push({ severity: 'soft', message: `${day.dayName}: must have exactly ${profile.mealsPerDay} meals (found ${day.meals.length}).` });
    }

    const totals = computeMealDayTotals(day.meals);
    const calDiff = Math.abs(totals.calories - profile.targetCalories) / profile.targetCalories;
    if (calDiff > 0.15) {
      issues.push({
        severity: 'soft',
        message: `${day.dayName}: meals total ${totals.calories} kcal but the target is ${profile.targetCalories} kcal — adjust portions.`,
      });
    }
    const protDiff = (profile.targetProteinG - totals.proteinG) / profile.targetProteinG;
    if (protDiff > 0.15) {
      issues.push({
        severity: 'soft',
        message: `${day.dayName}: meals total ${totals.proteinG} g protein but the target is ${profile.targetProteinG} g — add protein.`,
      });
    }

    for (const meal of day.meals) {
      const options = [
        { label: meal.title, text: [meal.title, meal.portionDescription, ...meal.ingredients].join(' | ') },
        ...meal.alternatives.map(a => ({ label: `${a.title} (alternative)`, text: [a.title, a.portion].join(' | ') })),
      ];
      for (const option of options) {
        const normalized = option.text.replace(PLANT_QUALIFIERS, ' ');
        const hardHit = forbidden.hard.find(t => containsTerm(normalized, t));
        if (hardHit) {
          issues.push({ severity: 'hard', message: `${day.dayName} / ${option.label}: contains "${hardHit}", which is not allowed for a ${profile.dietType.replace(/_/g, ' ')} diet.` });
        }
        const softHit = forbidden.soft.find(t => containsTerm(normalized, t));
        if (softHit) {
          issues.push({ severity: 'soft', message: `${day.dayName} / ${option.label}: "${softHit}" may not be vegan — use a plant-based ingredient.` });
        }
        const restrictedHit = restricted.find(t => containsTerm(option.text, t));
        if (restrictedHit) {
          issues.push({ severity: 'hard', message: `${day.dayName} / ${option.label}: contains "${restrictedHit}", which the user is allergic to or avoids.` });
        }
      }
    }
  }

  return issues;
}
