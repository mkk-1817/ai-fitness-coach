'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, CheckCircle2, Utensils } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { FOOD_DATABASE, FoodItemReference } from '@/lib/data/food-data';

export function NutritionLogger() {
  const { mealLogs, logMeal, deleteMealLog } = useFitnessStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('lunch');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Custom Form State
  const [customName, setCustomName] = useState('');
  const [customPortion, setCustomPortion] = useState('1 serving');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealLogs.filter(m => m.date === today);

  const filteredFoods = FOOD_DATABASE.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogPredefined = (food: FoodItemReference) => {
    logMeal({
      date: today,
      mealType: selectedMealType,
      foodName: food.name,
      portion: food.portion,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
      fiberG: food.fiberG,
    });
    setSearchQuery('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    logMeal({
      date: today,
      mealType: selectedMealType,
      foodName: customName.trim(),
      portion: customPortion,
      calories: parseInt(customCalories) || 250,
      proteinG: parseFloat(customProtein) || 15,
      carbsG: parseFloat(customCarbs) || 30,
      fatG: parseFloat(customFat) || 8,
      fiberG: 2,
    });

    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setShowCustomForm(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-400" />
            Log Foods & Custom Meals
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Quick search from verified Indian & global nutritional database</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Meal type selector */}
          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="evening_snack">Evening Snack</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Other Snack</option>
          </select>

          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition"
          >
            {showCustomForm ? 'Close Custom' : '+ Custom Meal'}
          </button>
        </div>
      </div>

      {/* CUSTOM MEAL FORM */}
      {showCustomForm && (
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Add Custom Food Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Food name (e.g. Curd with berries)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
              required
            />
            <input
              type="text"
              placeholder="Portion (e.g. 1 cup / 150g)"
              value={customPortion}
              onChange={(e) => setCustomPortion(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Calories"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={customProtein}
              onChange={(e) => setCustomProtein(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={customCarbs}
              onChange={(e) => setCustomCarbs(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={customFat}
              onChange={(e) => setCustomFat(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-emerald-400 transition"
          >
            Log Custom Food
          </button>
        </form>
      )}

      {/* SEARCH DATABASE */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Indian & global food items (e.g. Idli, Dosa, Chicken, Paneer, Sundal, Eggs)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* SEARCH RESULTS DROP-LIST */}
      {searchQuery && (
        <div className="max-h-60 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-950 border border-white/10">
          {filteredFoods.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No matching food found. Try custom meal logging!</p>
          ) : (
            filteredFoods.slice(0, 6).map(food => (
              <div
                key={food.id}
                className="p-2.5 rounded-xl hover:bg-slate-900 flex items-center justify-between transition"
              >
                <div>
                  <p className="text-xs font-bold text-white">{food.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {food.portion} • {food.calories} kcal • <span className="text-rose-400 font-semibold">{food.proteinG}g P</span>
                  </p>
                </div>
                <button
                  onClick={() => handleLogPredefined(food)}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold rounded-lg transition"
                >
                  + Add
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TODAY'S LOGGED MEALS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Today&apos;s Consumed Items ({todayMeals.length})
        </h3>

        {todayMeals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-white/5">
            No foods logged yet today. Use the search bar above or log directly from your meal plan!
          </div>
        ) : (
          <div className="space-y-2">
            {todayMeals.map(m => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{m.foodName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 uppercase">
                      {m.mealType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {m.portion} • {m.calories} kcal • {m.proteinG}g protein • {m.carbsG}g carbs • {m.fatG}g fat
                  </p>
                </div>

                <button
                  onClick={() => deleteMealLog(m.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition"
                  title="Remove log"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
