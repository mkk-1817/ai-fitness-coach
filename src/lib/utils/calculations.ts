import { ActivityLevel, FitnessGoalType, Gender, UserMetrics } from '@/types/fitness';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0) return 22;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-emerald-400' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-orange-400' };
  return { label: 'Obese range', color: 'text-rose-400' };
}

export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor Equation
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  // Default to male / non-binary standard
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}

export function calculateNutritionTargets(
  tdee: number,
  goal: FitnessGoalType,
  weightKg: number
): { targetCalories: number; targetProteinG: number; targetCarbsG: number; targetFatG: number } {
  let calorieAdjustment = 0;
  let proteinPerKg = 2.0;

  switch (goal) {
    case 'fat_loss':
      calorieAdjustment = -500; // Moderate 500 kcal deficit
      proteinPerKg = 2.2; // High protein for muscle retention
      break;
    case 'muscle_gain':
      calorieAdjustment = 300; // Controlled 300 kcal surplus
      proteinPerKg = 2.0;
      break;
    case 'strength':
      calorieAdjustment = 200;
      proteinPerKg = 2.0;
      break;
    case 'body_recomp':
      calorieAdjustment = -150;
      proteinPerKg = 2.2;
      break;
    case 'endurance':
      calorieAdjustment = 0;
      proteinPerKg = 1.6;
      break;
    default:
      calorieAdjustment = 0;
      proteinPerKg = 1.8;
  }

  const targetCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));
  const targetProteinG = Math.round(Math.min(weightKg * proteinPerKg, 220));
  
  // Calculate remaining calories for fats and carbs
  const proteinCalories = targetProteinG * 4;
  // Fat: 25% of calories
  const fatCalories = targetCalories * 0.25;
  const targetFatG = Math.round(fatCalories / 9);
  
  // Remaining goes to carbohydrates
  const carbsCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const targetCarbsG = Math.round(carbsCalories / 4);

  return {
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}

export function computeAllMetrics(
  age: number,
  gender: Gender,
  heightCm: number,
  weightKg: number,
  activityLevel: ActivityLevel,
  primaryGoal: FitnessGoalType,
  targetWeightKg?: number
): UserMetrics {
  const bmi = calculateBMI(weightKg, heightCm);
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const { targetCalories, targetProteinG, targetCarbsG, targetFatG } = calculateNutritionTargets(
    tdee,
    primaryGoal,
    weightKg
  );

  return {
    age,
    gender,
    heightCm,
    weightKg,
    targetWeightKg,
    activityLevel,
    bmi,
    bmr,
    tdee,
    targetCalories,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}
