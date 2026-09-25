import { FitnessProfile, WorkoutSession } from '@/types/fitness';
import { GenerationProfile, ResolvedDietOptions, ResolvedWorkoutOptions } from '@/types/ai';

const list = (items: string[] | undefined, fallback = 'None') =>
  items && items.length > 0 ? items.join(', ') : fallback;

const humanize = (v: string | null | undefined) => (v ? v.replace(/_/g, ' ') : 'None');

// ==============================================================================
// JSON CONTRACTS (mirrors the zod schemas in src/types/ai.ts)
// ==============================================================================

export const WORKOUT_JSON_CONTRACT = `{
  "title": string,
  "description": string,                      // 1-3 sentences explaining the weekly structure
  "splitType": string,                        // e.g. "Upper/Lower + Sport", "Run & Strength Hybrid"
  "goalSummary": string,
  "coachAdvice": string,                      // progression guidance for the next 4 weeks
  "days": [                                   // EXACTLY 7 entries, Monday (dayOrder 1) to Sunday (dayOrder 7)
    {
      "dayName": "Monday",
      "dayOrder": 1,
      "focus": string,                        // e.g. "Lower Body Strength", "Badminton Match Play", "Easy Zone 2 Run"
      "sessionType": "strength" | "cardio" | "sports" | "hiit" | "mobility" | "mixed" | "rest",
      "isRestDay": boolean,
      "estimatedDurationMins": number,
      "warmup": string[],
      "exercises": [                          // [] only when isRestDay is true
        {
          "exerciseName": string,             // any appropriate exercise, drill or activity
          "category": "strength" | "cardio" | "sports" | "hiit" | "mobility",
          "targetMuscle": string,             // or energy system for cardio/sports, e.g. "Aerobic Endurance"
          "equipment": string,                // must be available to the user, or "Bodyweight" / the sport's own gear
          "sets": number,                     // 1 for continuous cardio/sport blocks
          "reps": string,                     // "8-10", "45s", "20 min", "5 x 400m"
          "durationMins": number | null,      // REQUIRED for cardio, sports and mobility blocks
          "intensity": string | null,         // e.g. "RPE 7", "Zone 2 (conversational pace)"
          "restSeconds": number,
          "tempo": string | null,
          "formNotes": string | null,
          "instructions": string[],           // 2-4 short how-to steps
          "alternatives": string[]            // 1-3 substitutions
        }
      ],
      "cooldown": string[]
    }
  ]
}`;

export const MEAL_JSON_CONTRACT = `{
  "title": string,
  "cuisineNotes": string,                     // nutrition strategy and cuisine rationale
  "hydrationAdvice": string,
  "days": [                                   // EXACTLY 7 entries, Monday (dayOrder 1) to Sunday (dayOrder 7)
    {
      "dayName": "Monday",
      "dayOrder": 1,
      "theme": string | null,                 // e.g. "Chettinad-style day"
      "meals": [
        {
          "mealType": "breakfast" | "mid_morning" | "lunch" | "evening_snack" | "dinner" | "post_workout",
          "title": string,                    // a real dish name
          "portionDescription": string,       // household measures + grams
          "ingredients": string[],            // main ingredients only
          "calories": number,
          "proteinG": number,
          "carbsG": number,
          "fatG": number,
          "fiberG": number,
          "prepNotes": string | null,
          "alternatives": [                   // 1-2 swaps with similar calories & protein
            { "title": string, "portion": string, "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "notes": string | null }
          ]
        }
      ]
    }
  ]
}`;

export const FOOD_LOOKUP_JSON_CONTRACT = `{
  "items": [                                  // 1-5 best matches, most likely first
    { "name": string, "portion": string, "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "fiberG": number, "cuisine": string | null }
  ]
}`;

function profileSummary(p: GenerationProfile): string {
  return `- Name: ${p.name || 'User'}, Age: ${p.age}, Gender: ${p.gender}, Country: ${p.country || 'Not specified'}
- Height: ${p.heightCm} cm, Weight: ${p.weightKg} kg, Target weight: ${p.targetWeightKg ?? 'Not specified'} kg
- Activity level: ${humanize(p.activityLevel)}
- Primary goal: ${humanize(p.primaryGoal)}, Secondary goal: ${humanize(p.secondaryGoal)}
- Experience: ${p.experienceLevel} (${p.trainingYears} years training)`;
}

// ==============================================================================
// WORKOUT PROMPT
// ==============================================================================

const WORKOUT_TYPE_GUIDANCE: Record<ResolvedWorkoutOptions['workoutType'], string> = {
  strength: 'Resistance training is the core of every training day. Add at most one short low-intensity cardio finisher if it supports the goal.',
  cardio: 'Cardiovascular training (walking, running, cycling, swimming, skipping, rowing) is the core of every training day. Mix easy aerobic, tempo and interval days; add brief strength or mobility accessory work only for injury prevention.',
  sports: 'Sport sessions are the core of the week: include the chosen sports as match play, skill drills and sport-specific conditioning, supported by athletic strength/plyometric work that reduces injury risk for those sports.',
  hiit: 'Every training day is interval-based conditioning (circuits, EMOMs, Tabata, sprint intervals) with clear work:rest ratios in "reps" and "intensity". Keep high-impact volume appropriate for the experience level.',
  mobility: 'Focus on mobility, flexibility, yoga-style flows, breath work and low-intensity active recovery (e.g. easy walking or swimming). Durations and holds instead of heavy loading.',
  mixed: 'Blend strength days with cardio / sport / conditioning days across the week so each quality is trained at least once, balancing fatigue between days.',
};

export function buildWorkoutGenerationPrompt(
  profile: GenerationProfile,
  options: ResolvedWorkoutOptions
): { systemPrompt: string; userPrompt: string } {
  const restDays = 7 - options.daysPerWeek;

  const systemPrompt = `You are AuraFit AI, an elite strength & conditioning coach and sports scientist.
You design safe, effective, fully personalised weekly training plans. You are NOT limited to any fixed exercise catalogue: choose any exercise, drill, sport session or cardio activity that best fits the user.

RULES:
1. Output one JSON object only (no markdown, no commentary) that matches this contract exactly:
${WORKOUT_JSON_CONTRACT}
2. The week has EXACTLY ${options.daysPerWeek} training days and ${restDays} rest day(s) (isRestDay=true, sessionType="rest", exercises=[]; put light recovery suggestions such as a walk or stretching in "warmup"/"cooldown"). Spread rest days sensibly.
3. Workout type: ${options.workoutType.toUpperCase()}. ${WORKOUT_TYPE_GUIDANCE[options.workoutType]}
4. Equipment: only prescribe gym/strength exercises possible with [${list(profile.availableEquipment, 'Bodyweight')}] (bodyweight is always allowed). Sports and outdoor cardio (walking, running, cricket, football...) may use the sport's own gear and venue.
5. Safety: respect injuries [${list(profile.injuries)}] and health conditions [${list(profile.healthConditions)}]. Never include: [${list(profile.avoidExercises)}].
6. Match the ${profile.experienceLevel} level: beginners get simpler movements, lower volume and clear cues; intermediate/advanced get progressive overload and more complex work.
7. Each training day must fit in about ${options.sessionDurationMins} minutes including warm-up and cool-down.
8. For cardio, sports and mobility blocks set "sets": 1 (or the interval count), put the prescription in "reps" (e.g. "30 min", "6 x 3 min") and ALWAYS fill "durationMins" and "intensity".`;

  const activityLine = options.preferredActivities.length > 0
    ? `- Preferred sports / cardio activities (MUST appear in the week, each at least once, on appropriate days): ${options.preferredActivities.join(', ')}`
    : '- Preferred sports / cardio activities: none specified (choose suitable ones if the workout type calls for it)';

  const userPrompt = `Create this week's plan for:
${profileSummary(profile)}
- Workout type requested: ${options.workoutType}
${activityLine}
- Target muscle emphasis: ${list(options.targetMuscles, 'Balanced / none specified')}
- Schedule: ${options.daysPerWeek} training days/week, ~${options.sessionDurationMins} min per session, preferred time: ${profile.preferredWorkoutTime}
- Training location: ${profile.trainingLocation}
- Equipment available: ${list(profile.availableEquipment, 'Bodyweight only')}
- Injuries / pain areas: ${list(profile.injuries, 'None reported')}
- Health conditions: ${list(profile.healthConditions, 'None reported')}
- Exercises to avoid: ${list(profile.avoidExercises)}
${options.adjustment ? `- Adaptation requested: ${humanize(options.adjustment)}\n` : ''}${options.notes ? `- Additional user notes: ${options.notes}\n` : ''}
Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}

// ==============================================================================
// 7-DAY DIET PROMPT
// ==============================================================================

export function buildDietGenerationPrompt(
  profile: GenerationProfile,
  options: ResolvedDietOptions
): { systemPrompt: string; userPrompt: string } {
  const cuisines = options.cuisines.length > 0 ? options.cuisines : profile.cuisinePreferences;

  const systemPrompt = `You are AuraFit AI, an expert sports nutritionist and registered dietitian.
You create realistic, delicious, culturally authentic 7-day meal plans with accurate macronutrient estimates. You are NOT limited to any food database: choose real dishes people in the preferred cuisines actually cook and eat, including regional dishes (e.g. Tamil / Chettinad / Kongu / Kerala / Andhra home-style food when those cuisines are requested).

RULES:
1. Output one JSON object only (no markdown, no commentary) that matches this contract exactly:
${MEAL_JSON_CONTRACT}
2. EXACTLY 7 days and EXACTLY ${profile.mealsPerDay} meals per day. Vary dishes across the week — do not repeat the same main dish more than twice.
3. Each day's meals must add up to about ${profile.targetCalories} kcal (±10%) and ${profile.targetProteinG} g protein (±10%), with roughly ${profile.targetCarbsG} g carbs and ${profile.targetFatG} g fat. Compute the numbers carefully.
4. Diet type "${humanize(profile.dietType)}" is strict: vegetarian = no meat, fish, seafood or eggs; eggetarian = vegetarian + eggs; vegan = no animal products at all (no dairy, ghee, honey, eggs); pescatarian = vegetarian + fish/seafood + eggs; non vegetarian = anything.
5. NEVER include allergens [${list(profile.allergies)}] or avoided foods [${list(profile.foodsAvoided)}], including inside alternatives.
6. Give portions in household measures and grams (e.g. "3 idli (≈180 g) + 1 cup sambar").
7. Every meal gets exactly 1 concise alternative with similar calories and protein that also respects all rules.
8. Keep every string short and practical. Use compact ingredient lists, portion descriptions, prep notes and alternative notes so the complete 7-day JSON fits in the response.`;

  const userPrompt = `Create a 7-day meal plan for:
${profileSummary(profile)}
- Diet type: ${humanize(profile.dietType)}
- Preferred cuisines: ${list(cuisines, 'Any balanced cuisine')}
- Foods liked: ${list(profile.foodsLiked, 'No specific preferences')}
- Foods avoided: ${list(profile.foodsAvoided)}
- Allergies: ${list(profile.allergies)}
- Daily targets: ${profile.targetCalories} kcal, protein ${profile.targetProteinG} g, carbs ${profile.targetCarbsG} g, fat ${profile.targetFatG} g
- Meals per day: ${profile.mealsPerDay}
- Training: ${profile.workoutDaysPerWeek} days/week, preferred time ${profile.preferredWorkoutTime}
- Water target: ${Math.round(profile.waterTargetMl / 100) / 10} L/day
${options.notes ? `- Additional user notes: ${options.notes}\n` : ''}
Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}

// ==============================================================================
// FOOD LOOKUP PROMPT
// ==============================================================================

export function buildFoodLookupPrompt(
  query: string,
  context: { cuisines?: string[]; dietType?: string }
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a nutrition database assistant. Estimate realistic nutrition values for the food the user describes, using standard home-cooked recipes and typical serving sizes.
Output one JSON object only (no markdown) matching:
${FOOD_LOOKUP_JSON_CONTRACT}
If the user gives a quantity, use it as the portion. Otherwise use one typical serving and state it in household measures and grams.`;

  const userPrompt = `Food eaten: "${query}"
User's usual cuisines: ${list(context.cuisines, 'Not specified')}; diet type: ${humanize(context.dietType)}.
Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}

// ==============================================================================
// COACH CHAT PROMPT
// ==============================================================================

export function buildCoachChatPrompt(
  profile: FitnessProfile,
  recentSessions: WorkoutSession[],
  chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[]
): { systemPrompt: string; messages: { role: 'system' | 'user' | 'assistant'; content: string }[] } {
  const sessionSummaries = recentSessions.slice(-3).map(s =>
    `- Date: ${s.startedAt.split('T')[0]}, Workout: "${s.title}", Duration: ${Math.round(s.durationSeconds / 60)}m, Volume: ${s.totalVolumeKg}kg, RPE: ${s.rpeScore || 'N/A'}/10, Pain reported: ${s.painReported ? s.painNotes || 'Yes' : 'None'}`
  ).join('\n');

  const systemPrompt = `You are AuraFit AI, the user's dedicated personal AI fitness coach and sports scientist.
You have complete context of their profile, biometric metrics, training split, diet, and recent workout history:

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}, Height: ${profile.heightCm}cm, Weight: ${profile.weightKg}kg (Target: ${profile.targetWeightKg || 'N/A'}kg)
- Goals: Primary: ${profile.primaryGoal}, Secondary: ${profile.secondaryGoal || 'None'}
- Experience: ${profile.experienceLevel} (${profile.trainingYears} yrs)
- Training: ${profile.workoutDaysPerWeek} days/week, ${profile.workoutDurationMins} min/session at ${profile.trainingLocation}
- Preferred workout type: ${profile.preferredWorkoutType || 'Not specified'}; sports & cardio: ${list(profile.preferredActivities)}
- Equipment: ${profile.availableEquipment.join(', ')}
- Health/Injuries: ${profile.injuries.join(', ') || 'None'}. Avoid: ${profile.avoidExercises.join(', ') || 'None'}
- Diet: ${profile.dietType}, Cuisines: ${profile.cuisinePreferences.join(', ')}, Targets: ${profile.targetCalories} kcal, ${profile.targetProteinG}g protein

RECENT WORKOUT SESSIONS:
${sessionSummaries || 'No recent workouts logged yet.'}

GUIDANCE RULES:
1. Always address the user with warmth, high expertise, and motivation.
2. Ground all advice in their specific equipment, injuries, sports and cuisine preferences.
3. If they report pain, NEVER tell them to push through pain. Recommend stopping the aggravating motion, offer safe biomechanical alternatives, and advise consulting a medical doctor/physiotherapist for persistent pain.
4. Keep answers concise, actionable, and encouraging with bullet points where appropriate.`;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(m => ({ role: m.role, content: m.content }))
  ];

  return { systemPrompt, messages };
}
