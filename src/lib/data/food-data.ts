export interface FoodItemReference {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'protein_source' | 'carbs';
  cuisine: 'South Indian' | 'North Indian' | 'Western' | 'Global';
  portion: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  dietType: 'veg' | 'non_veg' | 'vegan' | 'eggetarian';
}

export const FOOD_DATABASE: FoodItemReference[] = [
  // South Indian / Tamil
  {
    id: 'food-idli-sambar',
    name: 'Idli with Sambar & Chutney (3 pcs)',
    category: 'breakfast',
    cuisine: 'South Indian',
    portion: '3 pieces (180g) + 1 bowl sambar',
    calories: 270,
    proteinG: 9.5,
    carbsG: 52.0,
    fatG: 2.8,
    fiberG: 5.5,
    dietType: 'vegan'
  },
  {
    id: 'food-masala-dosa',
    name: 'Plain / Masala Dosa with Sambar',
    category: 'breakfast',
    cuisine: 'South Indian',
    portion: '1 large dosa (150g) + sambar',
    calories: 340,
    proteinG: 7.2,
    carbsG: 54.0,
    fatG: 10.5,
    fiberG: 4.2,
    dietType: 'vegan'
  },
  {
    id: 'food-boiled-eggs',
    name: 'Boiled Eggs (2 whole eggs)',
    category: 'breakfast',
    cuisine: 'Global',
    portion: '2 large whole eggs (100g)',
    calories: 144,
    proteinG: 12.6,
    carbsG: 0.8,
    fatG: 9.8,
    fiberG: 0,
    dietType: 'eggetarian'
  },
  {
    id: 'food-egg-white-omlette',
    name: 'Egg White Omelette with Onions & Chillies',
    category: 'breakfast',
    cuisine: 'South Indian',
    portion: '3 egg whites (100g)',
    calories: 95,
    proteinG: 18.0,
    carbsG: 2.5,
    fatG: 1.2,
    fiberG: 0.8,
    dietType: 'eggetarian'
  },
  {
    id: 'food-sundal',
    name: 'Kondakadalai / Chana Sundal',
    category: 'snack',
    cuisine: 'South Indian',
    portion: '1 cup (150g)',
    calories: 220,
    proteinG: 11.5,
    carbsG: 34.0,
    fatG: 4.2,
    fiberG: 8.5,
    dietType: 'vegan'
  },
  {
    id: 'food-chicken-curry-rice',
    name: 'South Indian Pepper Chicken with Rice',
    category: 'lunch',
    cuisine: 'South Indian',
    portion: '150g chicken breast curry + 1 cup rice',
    calories: 460,
    proteinG: 38.5,
    carbsG: 52.0,
    fatG: 8.5,
    fiberG: 3.5,
    dietType: 'non_veg'
  },
  {
    id: 'food-curd-rice',
    name: 'Curd Rice (Thayir Sadam) with tadka',
    category: 'lunch',
    cuisine: 'South Indian',
    portion: '1 medium bowl (200g)',
    calories: 240,
    proteinG: 6.8,
    carbsG: 42.0,
    fatG: 5.2,
    fiberG: 1.5,
    dietType: 'veg'
  },
  {
    id: 'food-paneer-bhurji',
    name: 'Paneer Bhurji / Tikka',
    category: 'dinner',
    cuisine: 'North Indian',
    portion: '150g paneer with tomatoes & spices',
    calories: 360,
    proteinG: 22.0,
    carbsG: 8.0,
    fatG: 26.0,
    fiberG: 2.0,
    dietType: 'veg'
  },
  {
    id: 'food-dal-tadka-roti',
    name: 'Dal Tadka with 2 Whole Wheat Phulkas',
    category: 'dinner',
    cuisine: 'North Indian',
    portion: '1 bowl dal (150g) + 2 rotis',
    calories: 340,
    proteinG: 14.2,
    carbsG: 58.0,
    fatG: 5.5,
    fiberG: 9.0,
    dietType: 'vegan'
  },
  {
    id: 'food-grilled-chicken-salad',
    name: 'Grilled Herb Chicken Breast & Salad',
    category: 'lunch',
    cuisine: 'Western',
    portion: '180g chicken breast + mixed greens',
    calories: 320,
    proteinG: 42.0,
    carbsG: 6.0,
    fatG: 7.0,
    fiberG: 3.0,
    dietType: 'non_veg'
  },
  {
    id: 'food-greek-yogurt-berries',
    name: 'Greek Yogurt with Mixed Berries & Almonds',
    category: 'snack',
    cuisine: 'Western',
    portion: '150g Greek yogurt + 1 tbsp almonds',
    calories: 195,
    proteinG: 16.0,
    carbsG: 14.0,
    fatG: 6.5,
    fiberG: 2.5,
    dietType: 'veg'
  },
  {
    id: 'food-whey-protein',
    name: 'Whey Protein Shake in Water',
    category: 'snack',
    cuisine: 'Global',
    portion: '1 scoop (30g powder in 250ml water)',
    calories: 125,
    proteinG: 25.0,
    carbsG: 2.5,
    fatG: 1.5,
    fiberG: 0,
    dietType: 'veg'
  },
  {
    id: 'food-oatmeal-banana',
    name: 'Rolled Oats with Milk & Banana slices',
    category: 'breakfast',
    cuisine: 'Western',
    portion: '50g oats + 200ml milk + 1 banana',
    calories: 380,
    proteinG: 14.5,
    carbsG: 68.0,
    fatG: 6.0,
    fiberG: 7.5,
    dietType: 'veg'
  },
  {
    id: 'food-fish-curry',
    name: 'Meen / Fish Curry with Rice',
    category: 'lunch',
    cuisine: 'South Indian',
    portion: '150g fish fillet curry + 1 cup rice',
    calories: 410,
    proteinG: 32.0,
    carbsG: 48.0,
    fatG: 9.0,
    fiberG: 2.5,
    dietType: 'non_veg'
  }
];
