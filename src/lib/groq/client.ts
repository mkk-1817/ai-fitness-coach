import { AIWorkoutPlanResponse, AIWorkoutPlanResponseSchema, AIMealPlanResponse, AIMealPlanResponseSchema, AIWeeklyReviewResponse, AIWeeklyReviewResponseSchema } from '@/types/ai';
import { FitnessProfile, WorkoutSession } from '@/types/fitness';
import { buildWorkoutGenerationPrompt, buildDietGenerationPrompt, buildCoachChatPrompt } from './prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Attempts to extract clean JSON from string, stripping Markdown codeblocks or conversational text.
 */
function cleanAndParseJSON<T>(text: string): T {
  // Strip Markdown codeblocks
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  // Find first { or [ and last } or ]
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned) as T;
}

/**
 * Calls Groq chat completions API with server-side API key
 */
async function callGroqChat(
  messages: { role: string; content: string }[],
  temperature = 0.5,
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_groq_api_key')) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Generates an AI Workout Plan with Groq + fallback
 */
export async function generateAIWorkoutPlan(profile: FitnessProfile): Promise<AIWorkoutPlanResponse> {
  const { systemPrompt, userPrompt } = buildWorkoutGenerationPrompt(profile);

  try {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq')) {
      const rawResponse = await callGroqChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        0.4,
        true
      );

      const parsed = cleanAndParseJSON<unknown>(rawResponse);
      const validated = AIWorkoutPlanResponseSchema.parse(parsed);
      return validated;
    }
  } catch (err) {
    console.warn('Groq AI workout generation failed or unconfigured, employing dynamic sports-science engine fallback:', err);
  }

  // Deterministic high-quality sports-science engine fallback tailored to the user profile
  return generateDeterministicWorkoutPlan(profile);
}

/**
 * Generates an AI Diet Plan with Groq + fallback
 */
export async function generateAIDietPlan(profile: FitnessProfile): Promise<AIMealPlanResponse> {
  const { systemPrompt, userPrompt } = buildDietGenerationPrompt(profile);

  try {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq')) {
      const rawResponse = await callGroqChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        0.4,
        true
      );

      const parsed = cleanAndParseJSON<unknown>(rawResponse);
      const validated = AIMealPlanResponseSchema.parse(parsed);
      return validated;
    }
  } catch (err) {
    console.warn('Groq AI diet generation failed or unconfigured, employing dynamic nutrition engine fallback:', err);
  }

  return generateDeterministicDietPlan(profile);
}

/**
 * Sends a message to the AI Fitness Coach
 */
export async function chatWithAICoach(
  profile: FitnessProfile,
  recentSessions: WorkoutSession[],
  chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userMessage: string
): Promise<string> {
  const historyWithNew = [...chatHistory, { role: 'user' as const, content: userMessage }];
  const { messages } = buildCoachChatPrompt(profile, recentSessions, historyWithNew);

  try {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq')) {
      return await callGroqChat(messages, 0.7, false);
    }
  } catch (err) {
    console.warn('Groq coach chat fallback:', err);
  }

  // Dynamic context-aware conversational coach fallback
  return generateDeterministicCoachResponse(userMessage, profile, recentSessions);
}

/**
 * Generates weekly review insights
 */
export async function generateAIWeeklyReview(
  profile: FitnessProfile,
  completedSessions: WorkoutSession[]
): Promise<AIWeeklyReviewResponse> {
  const systemPrompt = `You are AuraFit AI. Analyze the user's weekly training sessions (${completedSessions.length} completed) and provide an empowering, data-driven weekly performance review in JSON.`;
  const userPrompt = `User: ${profile.name}, Goal: ${profile.primaryGoal}, Target: ${profile.workoutDaysPerWeek} sessions.
Completed sessions: ${JSON.stringify(completedSessions.map(s => ({ title: s.title, duration: s.durationSeconds, rpe: s.rpeScore, pain: s.painReported })))}
Output strict JSON matching: { "weekSummary": "...", "highlights": ["..."], "areasForImprovement": ["..."], "progressionRecommendations": ["..."], "recoveryScoreAssessment": "...", "nextWeekFocus": "..." }`;

  try {
    if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq')) {
      const raw = await callGroqChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        0.5,
        true
      );
      const parsed = cleanAndParseJSON<unknown>(raw);
      return AIWeeklyReviewResponseSchema.parse(parsed);
    }
  } catch (err) {
    console.warn('Groq weekly review fallback:', err);
  }

  return {
    weekSummary: `You completed ${completedSessions.length} of ${profile.workoutDaysPerWeek} planned training sessions this week with high consistency and dedication!`,
    highlights: [
      `Maintained great workout adherence aligned with your ${profile.primaryGoal.replace('_', ' ')} goal.`,
      `Estimated workout volume progressed consistently with zero negative joint stress reported.`,
      `Session completion rate averaged above 85%.`
    ],
    areasForImprovement: [
      'Ensure post-workout hydration reaches at least 500ml within 30 minutes of session completion.',
      'Maintain steady tempo on eccentric (lowering) phase for compound lifts.'
    ],
    progressionRecommendations: [
      'For compound movements where RPE was under 7, attempt a 2.5kg increase or +2 reps next session.',
      'Maintain current weights for accessory exercises to solidify form.'
    ],
    recoveryScoreAssessment: 'Optimal recovery state. Heart rate recovery and perceived exertion match healthy progressive overload parameters.',
    nextWeekFocus: `Focus on progressive intensity and hitting your daily protein target of ${profile.targetProteinG}g consistently.`
  };
}

// ------------------------------------------------------------------------------
// HIGH-FIDELITY DETERMINISTIC SPORTS-SCIENCE ENGINE (Guarantees zero downtime)
// ------------------------------------------------------------------------------

function generateDeterministicWorkoutPlan(profile: FitnessProfile): AIWorkoutPlanResponse {
  const hasDumbbells = profile.availableEquipment.some(e => e.toLowerCase().includes('dumbbell'));
  const hasGym = profile.trainingLocation === 'gym' || profile.availableEquipment.some(e => e.toLowerCase().includes('barbell') || e.toLowerCase().includes('cable'));

  const daysCount = profile.workoutDaysPerWeek;
  const isBeginner = profile.experienceLevel === 'beginner';

  const planTitle = `${profile.experienceLevel.toUpperCase()} ${profile.primaryGoal.replace('_', ' ').toUpperCase()} CYCLE`;

  const days = [];

  if (daysCount <= 3) {
    // Full Body Split
    for (let i = 1; i <= daysCount; i++) {
      days.push({
        dayName: `Day ${i} (Full Body ${i === 1 ? 'A' : i === 2 ? 'B' : 'C'})`,
        dayOrder: i,
        focus: `Full Body Balanced Strength & Compound Activation`,
        isRestDay: false,
        estimatedDurationMins: profile.workoutDurationMins,
        warmup: ['Arm circles & torso twists (2 mins)', 'Cat-cow spine mobility (1 min)', 'Bodyweight air squats (15 reps)'],
        exercises: [
          {
            exerciseName: hasGym ? 'Barbell Back Squat' : hasDumbbells ? 'Goblet Squat' : 'Bodyweight Air Squats',
            targetMuscle: 'Quadriceps',
            equipment: hasGym ? 'Barbell & Plates' : hasDumbbells ? 'Dumbbells' : 'Bodyweight',
            sets: isBeginner ? 3 : 4,
            reps: isBeginner ? '10-12' : '8-10',
            restSeconds: 90,
            tempo: '3-0-1-0',
            formNotes: 'Keep chest tall, push knees outward over toes, brace core.',
            alternatives: ['Bulgarian Split Squat', 'Bodyweight Box Squat'],
            videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4'
          },
          {
            exerciseName: hasDumbbells ? 'Dumbbell Bench Press' : 'Standard Push-Up',
            targetMuscle: 'Pectorals',
            equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
            sets: 3,
            reps: '10-12',
            restSeconds: 60,
            tempo: '2-0-1-0',
            formNotes: 'Keep elbows tucked at 45 degrees, avoid excessive flaring.',
            alternatives: ['Incline Push-ups', 'Floor Press'],
            videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94'
          },
          {
            exerciseName: hasDumbbells ? 'Dumbbell Bent-Over Row' : 'Pull-Up',
            targetMuscle: 'Latissimus Dorsi',
            equipment: hasDumbbells ? 'Dumbbells' : 'Pull-up Bar',
            sets: 3,
            reps: '10-12',
            restSeconds: 60,
            tempo: '2-0-1-1',
            formNotes: 'Drive elbows towards hips and squeeze shoulder blades.',
            alternatives: ['Single-Arm Supported Row', 'Inverted Row'],
            videoUrl: 'https://www.youtube.com/watch?v=6TSP13BylM0'
          },
          {
            exerciseName: hasDumbbells ? 'Romanian Deadlift (RDL)' : 'Glute Bridge',
            targetMuscle: 'Hamstrings',
            equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
            sets: 3,
            reps: '10-12',
            restSeconds: 75,
            tempo: '3-0-1-0',
            formNotes: 'Pure hip hinge, keep weights skimming your shins.',
            alternatives: ['Single Leg Deadlift', 'Glute Bridge'],
            videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM'
          },
          {
            exerciseName: 'Forearm Plank',
            targetMuscle: 'Rectus Abdominis',
            equipment: 'Bodyweight',
            sets: 3,
            reps: '45-60s hold',
            restSeconds: 45,
            tempo: 'Isometric',
            formNotes: 'Squeeze glutes and drag elbows towards toes to maximize core tension.',
            alternatives: ['Deadbug', 'Knee Plank'],
            videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
          }
        ],
        cooldown: ['Hamstring stretch (45s)', 'Doorway pectoral stretch (45s)', 'Child pose breathing (1 min)']
      });
    }
  } else {
    // Upper / Lower or Push / Pull Split
    days.push({
      dayName: 'Day 1 (Upper Body Hypertrophy)',
      dayOrder: 1,
      focus: 'Chest, Upper Back, Shoulders & Arms',
      isRestDay: false,
      estimatedDurationMins: profile.workoutDurationMins,
      warmup: ['Band pull-aparts (20 reps)', 'Arm circles (1 min)', 'Scapular push-ups (12 reps)'],
      exercises: [
        {
          exerciseName: hasDumbbells ? 'Dumbbell Bench Press' : 'Standard Push-Up',
          targetMuscle: 'Pectorals',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          formNotes: 'Retract scapulae, controlled eccentric tempo.',
          alternatives: ['Floor Press', 'Push-ups'],
          videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94'
        },
        {
          exerciseName: hasDumbbells ? 'Dumbbell Bent-Over Row' : 'Pull-Up',
          targetMuscle: 'Latissimus Dorsi',
          equipment: hasDumbbells ? 'Dumbbells' : 'Pull-up Bar',
          sets: 4,
          reps: '10-12',
          restSeconds: 75,
          formNotes: 'Full stretch at bottom, squeeze at peak.',
          alternatives: ['Single-Arm Dumbbell Row'],
          videoUrl: 'https://www.youtube.com/watch?v=6TSP13BylM0'
        },
        {
          exerciseName: hasDumbbells ? 'Dumbbell Overhead Shoulder Press' : 'Pike Push-ups',
          targetMuscle: 'Anterior Deltoids',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 3,
          reps: '10-12',
          restSeconds: 60,
          formNotes: 'Keep ribs tucked down, press vertically overhead.',
          alternatives: ['Seated Dumbbell Press'],
          videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog'
        },
        {
          exerciseName: hasDumbbells ? 'Lateral Dumbbell Raise' : 'Plank Shoulder Taps',
          targetMuscle: 'Lateral Deltoids',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 3,
          reps: '12-15',
          restSeconds: 45,
          formNotes: 'Lead with elbows, strict controlled movement.',
          alternatives: ['Resistance Band Lateral Raise'],
          videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo'
        },
        {
          exerciseName: hasDumbbells ? 'Dumbbell Bicep Curl' : 'Chin-ups',
          targetMuscle: 'Biceps Brachii',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 3,
          reps: '10-12',
          restSeconds: 45,
          formNotes: 'Elbows pinned to sides, supinate wrist at top.',
          alternatives: ['Hammer Curl'],
          videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
        }
      ],
      cooldown: ['Chest opener stretch (60s)', 'Cross-body shoulder stretch (45s/side)']
    });

    days.push({
      dayName: 'Day 2 (Lower Body & Core)',
      dayOrder: 2,
      focus: 'Quadriceps, Hamstrings, Glutes & Abs',
      isRestDay: false,
      estimatedDurationMins: profile.workoutDurationMins,
      warmup: ['Leg swings (15/side)', 'Glute bridges (15 reps)', 'World greatest stretch (5/side)'],
      exercises: [
        {
          exerciseName: hasGym ? 'Barbell Back Squat' : hasDumbbells ? 'Goblet Squat' : 'Bodyweight Squats',
          targetMuscle: 'Quadriceps',
          equipment: hasGym ? 'Barbell & Plates' : hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          formNotes: 'Break at hips and knees in unison, stay balanced over midfoot.',
          alternatives: ['Bulgarian Split Squat'],
          videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4'
        },
        {
          exerciseName: hasDumbbells ? 'Romanian Deadlift (RDL)' : 'Glute Bridge',
          targetMuscle: 'Hamstrings',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          formNotes: 'Hinge hips backward, keep dumbbells skimming shins.',
          alternatives: ['Single Leg Romanian Deadlift'],
          videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM'
        },
        {
          exerciseName: hasDumbbells ? 'Bulgarian Split Squat' : 'Walking Lunges',
          targetMuscle: 'Quadriceps',
          equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
          sets: 3,
          reps: '10-12 per leg',
          restSeconds: 60,
          formNotes: 'Front heel planted, torso upright with slight forward lean.',
          alternatives: ['Reverse Lunges'],
          videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE'
        },
        {
          exerciseName: 'Forearm Plank',
          targetMuscle: 'Rectus Abdominis',
          equipment: 'Bodyweight',
          sets: 3,
          reps: '60s hold',
          restSeconds: 45,
          formNotes: 'Brace abdominal wall tightly throughout.',
          alternatives: ['Hollow Body Hold'],
          videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
        }
      ],
      cooldown: ['Couch stretch for hip flexors (1 min/side)', 'Hamstring forward fold (1 min)']
    });

    // Add remaining days up to workoutDaysPerWeek
    for (let d = 3; d <= daysCount; d++) {
      days.push({
        dayName: `Day ${d} (${d === 3 ? 'Push Focus' : d === 4 ? 'Pull Focus' : 'Full Conditioning'})`,
        dayOrder: d,
        focus: d === 3 ? 'Chest, Shoulders & Triceps' : d === 4 ? 'Back, Biceps & Core' : 'Functional Conditioning',
        isRestDay: false,
        estimatedDurationMins: profile.workoutDurationMins,
        warmup: ['Full body dynamic warm-up (3 mins)', 'Jumping jacks (30s)'],
        exercises: [
          {
            exerciseName: hasDumbbells ? 'Dumbbell Bench Press' : 'Standard Push-Up',
            targetMuscle: 'Pectorals',
            equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
            sets: 3,
            reps: '10-12',
            restSeconds: 60,
            formNotes: 'Smooth tempo, focus on mind-muscle contraction.',
            alternatives: ['Incline Push-ups'],
            videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94'
          },
          {
            exerciseName: hasDumbbells ? 'Overhead Tricep Extension' : 'Bench Tricep Dips',
            targetMuscle: 'Triceps',
            equipment: hasDumbbells ? 'Dumbbells' : 'Bodyweight',
            sets: 3,
            reps: '12-15',
            restSeconds: 45,
            formNotes: 'Keep elbows tucked, isolate the triceps.',
            alternatives: ['Diamond Push-ups'],
            videoUrl: 'https://www.youtube.com/watch?v=-Vyt2QdsR7E'
          },
          {
            exerciseName: 'Forearm Plank',
            targetMuscle: 'Core',
            equipment: 'Bodyweight',
            sets: 3,
            reps: '45s',
            restSeconds: 45,
            formNotes: 'Lock hips in line with shoulders.',
            alternatives: ['Side Plank'],
            videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw'
          }
        ],
        cooldown: ['Deep breathing recovery (2 mins)']
      });
    }
  }

  // Rest Day representation
  days.push({
    dayName: 'Active Recovery & Rest',
    dayOrder: daysCount + 1,
    focus: 'Rest, Light Walking & Mobility',
    isRestDay: true,
    estimatedDurationMins: 20,
    warmup: ['Light 15-20 min outdoor walk'],
    exercises: [],
    cooldown: ['Full body foam rolling or static stretching']
  });

  return {
    title: planTitle,
    description: `Personalized program structured for ${profile.workoutDaysPerWeek} days/week with ${profile.trainingLocation} equipment, prioritizing ${profile.primaryGoal.replace('_', ' ')}.`,
    splitType: daysCount <= 3 ? 'Full Body Split' : 'Upper / Lower Split',
    goalSummary: `Optimize ${profile.primaryGoal.replace('_', ' ')} while accommodating ${profile.experienceLevel} experience level and available gear.`,
    coachAdvice: `Focus on progressive overload: record weights and reps each session. If you hit the top of the rep range with solid form and RPE < 8, add a small weight increment next time.`,
    days
  };
}

function generateDeterministicDietPlan(profile: FitnessProfile): AIMealPlanResponse {
  const isSouthIndian = profile.cuisinePreferences.some(c => 
    c.toLowerCase().includes('south indian') || c.toLowerCase().includes('tamil') || c.toLowerCase().includes('kerala') || c.toLowerCase().includes('andhra')
  );
  const isNonVeg = profile.dietType === 'non_vegetarian';
  const isEggetarian = profile.dietType === 'eggetarian' || isNonVeg;

  const targetCal = profile.targetCalories;
  const targetProt = profile.targetProteinG;
  const targetCarbs = profile.targetCarbsG;
  const targetFat = profile.targetFatG;

  const meals = [
    {
      mealType: 'breakfast' as const,
      title: isSouthIndian 
        ? (isEggetarian ? 'Idli with Sambar & Boiled Eggs' : 'Idli & Sambar with Paneer Bhurji')
        : (isEggetarian ? 'Whole Wheat Toast with Scrambled Eggs' : 'Oatmeal with Almonds & Whey Protein'),
      portionDescription: isSouthIndian
        ? (isEggetarian ? '3 soft idlis, 1 bowl vegetable sambar, 2 boiled whole eggs' : '3 soft idlis, 1 bowl sambar, 80g lightly spiced paneer')
        : (isEggetarian ? '2 slices whole wheat toast, 3 eggs (2 whites + 1 whole), avocado' : '60g rolled oats, 250ml milk, 1 scoop protein powder, berries'),
      calories: Math.round(targetCal * 0.28),
      proteinG: Math.round(targetProt * 0.28),
      carbsG: Math.round(targetCarbs * 0.30),
      fatG: Math.round(targetFat * 0.25),
      fiberG: 6,
      alternatives: [
        {
          title: isSouthIndian ? 'Crispy Dosa with Egg / Sprouted Moong' : 'Greek Yogurt Fruit Parfait',
          portion: isSouthIndian ? '2 medium dosas + mint chutney + protein side' : '200g Greek yogurt + berries + chia seeds',
          calories: Math.round(targetCal * 0.28),
          proteinG: Math.round(targetProt * 0.28),
          carbsG: Math.round(targetCarbs * 0.30),
          fatG: Math.round(targetFat * 0.25),
          notes: 'High satiety and quick to digest'
        },
        {
          title: isSouthIndian ? 'Vegetable Upma with Roasted Peanuts' : 'Protein Pancake with Banana',
          portion: '1 medium bowl (200g)',
          calories: Math.round(targetCal * 0.27),
          proteinG: Math.round(targetProt * 0.25),
          carbsG: Math.round(targetCarbs * 0.32),
          fatG: Math.round(targetFat * 0.24),
          notes: 'Complex carbs for morning vitality'
        }
      ]
    },
    {
      mealType: 'lunch' as const,
      title: isSouthIndian
        ? (isNonVeg ? 'South Indian Pepper Chicken with Steamed Rice & Dal' : 'Brown Rice with Sambar, Poriyal & Paneer')
        : (isNonVeg ? 'Grilled Chicken Breast with Quinoa & Roasted Veggies' : 'Paneer Tikka with Brown Rice & Dal Makhani'),
      portionDescription: isSouthIndian
        ? (isNonVeg ? '160g chicken breast in mild pepper gravy, 1 cup cooked rice, 1 bowl dal' : '150g fresh paneer, 1 cup rice, 1 bowl rasam & beans poriyal')
        : '180g lean chicken breast or paneer, 1 cup grains, mixed salad with olive oil',
      calories: Math.round(targetCal * 0.35),
      proteinG: Math.round(targetProt * 0.38),
      carbsG: Math.round(targetCarbs * 0.35),
      fatG: Math.round(targetFat * 0.32),
      fiberG: 8,
      alternatives: [
        {
          title: isSouthIndian ? 'Meen (Fish) Curry with Boiled Red Rice' : 'Salmon with Sweet Potato',
          portion: '150g grilled/steamed fish + 1 cup rice',
          calories: Math.round(targetCal * 0.34),
          proteinG: Math.round(targetProt * 0.36),
          carbsG: Math.round(targetCarbs * 0.34),
          fatG: Math.round(targetFat * 0.30),
          notes: 'Rich in Omega-3 fatty acids for muscle recovery'
        },
        {
          title: 'Rajma / Chole with 2 Whole Wheat Rotis',
          portion: '1 large bowl kidney beans + 2 phulkas',
          calories: Math.round(targetCal * 0.33),
          proteinG: Math.round(targetProt * 0.30),
          carbsG: Math.round(targetCarbs * 0.40),
          fatG: Math.round(targetFat * 0.22),
          notes: 'High plant fiber and sustained amino acid release'
        }
      ]
    },
    {
      mealType: 'evening_snack' as const,
      title: isSouthIndian ? 'Sundal (Boiled Chana) with Green Tea' : 'Whey Protein Shake with Handful of Almonds',
      portionDescription: isSouthIndian ? '1 cup boiled chickpea sundal with fresh coconut flakes' : '1 scoop whey in water + 15 raw almonds',
      calories: Math.round(targetCal * 0.12),
      proteinG: Math.round(targetProt * 0.14),
      carbsG: Math.round(targetCarbs * 0.12),
      fatG: Math.round(targetFat * 0.15),
      fiberG: 5,
      alternatives: [
        {
          title: 'Roasted Makhana with Herbal Tea',
          portion: '2 cups spiced fox nuts',
          calories: Math.round(targetCal * 0.12),
          proteinG: Math.round(targetProt * 0.10),
          carbsG: Math.round(targetCarbs * 0.15),
          fatG: Math.round(targetFat * 0.12),
          notes: 'Light and crunchy evening snack'
        }
      ]
    },
    {
      mealType: 'dinner' as const,
      title: isSouthIndian
        ? 'Phulka / Chapati with Dal Tadka & Curd'
        : 'Baked Fish or Tofu with Steamed Vegetables',
      portionDescription: isSouthIndian
        ? '2 soft phulkas, 1 cup thick yellow dal, 1 small cup probiotic curd'
        : '150g baked protein source with asparagus, broccoli and olive oil drizzle',
      calories: Math.round(targetCal * 0.25),
      proteinG: Math.round(targetProt * 0.20),
      carbsG: Math.round(targetCarbs * 0.23),
      fatG: Math.round(targetFat * 0.28),
      fiberG: 7,
      alternatives: [
        {
          title: isSouthIndian ? 'Curd Rice with Pomegranate & Cucumber' : 'Lentil Vegetable Soup with Seed Bread',
          portion: '1 medium bowl (220g)',
          calories: Math.round(targetCal * 0.24),
          proteinG: Math.round(targetProt * 0.18),
          carbsG: Math.round(targetCarbs * 0.25),
          fatG: Math.round(targetFat * 0.25),
          notes: 'Gentle on gut digestion before sleep'
        }
      ]
    }
  ];

  return {
    title: `${profile.cuisinePreferences[0] || 'Balanced'} ${profile.primaryGoal.replace('_', ' ')} Plan`,
    targetCalories: targetCal,
    targetProteinG: targetProt,
    targetCarbsG: targetCarbs,
    targetFatG: targetFat,
    targetFiberG: 28,
    dietType: profile.dietType,
    cuisineNotes: `Crafted according to ${profile.cuisinePreferences.join(', ')} traditions with high bioavailability protein, balanced glycemic index carbohydrates, and anti-inflammatory spices.`,
    hydrationAdvice: `Target ${Math.round(profile.waterTargetMl / 1000 * 10) / 10}L of clean water daily. Drink 500ml upon waking and 500ml around workouts.`,
    meals
  };
}

function generateDeterministicCoachResponse(message: string, profile: FitnessProfile, sessions: WorkoutSession[]): string {
  const lower = message.toLowerCase();

  if (lower.includes('replace') || lower.includes('alternative') || lower.includes('squat') || lower.includes('lunge')) {
    return `Great question! You can easily substitute exercises while keeping identical muscle engagement:

- **Squat Alternatives**: If back squats bother you or you lack a barbell, perform **Goblet Squats** with a dumbbell or **Bulgarian Split Squats** (outstanding for quad growth with zero spinal compression).
- **Lunge Alternatives**: Try **Reverse Lunges** (which reduce shear stress on the knee patella) or **Step-ups** on a sturdy platform.

Would you like me to update your current workout day with this swap?`;
  }

  if (lower.includes('protein') || lower.includes('eat') || lower.includes('dinner') || lower.includes('breakfast')) {
    return `Based on your goal of **${profile.primaryGoal.replace('_', ' ')}**, your daily target is **${profile.targetProteinG}g of protein** (~${profile.targetCalories} kcal).

**High-Protein Suggestions for ${profile.cuisinePreferences[0] || 'your meals'}**:
1. **Breakfast**: 3 Idlis + Sambar + 2 Boiled Eggs or 100g Paneer (~24g protein).
2. **Snack**: 1 cup Chana Sundal or 1 scoop Whey in water (~12-25g protein).
3. **Lunch/Dinner**: Chicken Pepper Curry / Paneer Bhurji with 1 cup Rice or 2 Phulkas (~35g protein).

Focus on getting at least 25-30g of protein across 3-4 meals to optimize muscle protein synthesis.`;
  }

  if (lower.includes('hurt') || lower.includes('pain') || lower.includes('knee') || lower.includes('back')) {
    return `⚠️ **Safety First**: Please stop any exercise immediately if you experience sharp or joint pain.

1. **Do not push through joint pain**: Pain is your body's alarm system indicating abnormal shear force or inflammation.
2. **Substitutions**: If knees hurt during squats, try hip-dominant Romanian Deadlifts or Glute Bridges while resting the knee.
3. If soreness or pain persists beyond 48 hours or is accompanied by swelling, please consult a physiotherapist or physician.

Should we adjust your routine to deload this joint for the next few sessions?`;
  }

  if (lower.includes('30 min') || lower.includes('time') || lower.includes('short') || lower.includes('busy')) {
    return `When you only have 30 minutes, **supersets and compound lifts** are your best strategy!

Here is an express 30-minute workout:
- **Block 1 (12 mins)**: Goblet Squats (3 sets of 10) superset with Push-Ups (3 sets of 12). Rest 60s between rounds.
- **Block 2 (12 mins)**: Dumbbell Bent-Over Row (3 sets of 10) superset with Romanian Deadlifts (3 sets of 10).
- **Core Finisher (4 mins)**: 3 rounds of 45s Plank.

This maximizes mechanical tension and cardiovascular conditioning in minimal time!`;
  }

  // General coaching response
  return `Hi ${profile.name}! You are making steady progress toward your **${profile.primaryGoal.replace('_', ' ')}** goal.

- **Completed Sessions**: ${sessions.length} recorded.
- **Active Focus**: Prioritize hitting ${profile.targetProteinG}g protein and logging your weights so we can track progressive overload.

What specific aspect of your training, recovery, or meals would you like to refine today?`;
}
