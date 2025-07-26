const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
let isError = false;

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}
// Apply entry for consumed food or exercise
function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"], select.exercise-type').length + 1;
  let HTMLString = '';
  if (entryDropdown.value === 'exercise') {
    HTMLString = `
      <label for="${entryDropdown.value}-${entryNumber}-type">Hva trente du i dag? 🏋️</label>
      <select id="${entryDropdown.value}-${entryNumber}-type" class="exercise-type">
        <option value="Bryst & Triceps">Bryst & Triceps</option>
        <option value="Rygg & Biceps">Rygg & Biceps</option>
        <option value="Bein & Skuldre">Bein & Skuldre</option>
      </select>
      <label for="${entryDropdown.value}-${entryNumber}-calories">Kalorier brent 🔥</label>
      <input
        type="number"
        min="0"
        id="${entryDropdown.value}-${entryNumber}-calories"
        placeholder="1 time trening tilsvarer omtrent 300 kalorier. Tast inn kalorier"
      />`;
  } else {
    HTMLString = `
      <label for="${entryDropdown.value}-${entryNumber}-name"> ${entryNumber}. Måltid 🍽️</label>
      <input type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Hva spiste du?"😄 />
      <label for="${entryDropdown.value}-${entryNumber}-calories"> Kalorier 🔥</label>
      <input
        type="number"
        min="0"
        id="${entryDropdown.value}-${entryNumber}-calories"
        placeholder="Kalorier"
      />`;
  }
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
}

// Restore budget from localStorage on load
window.addEventListener('DOMContentLoaded', () => {
  const savedBudget = localStorage.getItem('budget');
  if (savedBudget !== null) {
    budgetNumberInput.value = savedBudget;
  }

  // Show today's output if present in calorieHistory
  const today = new Date().toISOString().slice(0, 10);
  let calorieHistory = JSON.parse(localStorage.getItem('calorieHistory') || '[]');
  let todayEntry = calorieHistory.find(entry => entry.date === today);
  if (todayEntry) {
    const surplusOrDeficit = todayEntry.calories < 0 ? 'kalorioverskudd 🍕🤢' : 'kaloriunderskudd 🥦💪';
    output.innerHTML = `
      <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(todayEntry.calories)} Kalorier i ${surplusOrDeficit}</span>
      <hr>
      <p>${todayEntry.budget} Kalorigrense 🎯</p>
      <p>${todayEntry.consumed} Kalorier spist 🍔</p>
      <p>${todayEntry.exercise} Kalorier brent 💪🔥</p>
    `;
    output.classList.remove('hide');
  }
});

// Save budget to localStorage on change
budgetNumberInput.addEventListener('input', () => {
  localStorage.setItem('budget', budgetNumberInput.value);
});

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll("#breakfast input[type='number']");
  const lunchNumberInputs = document.querySelectorAll("#lunch input[type='number']");
  const dinnerNumberInputs = document.querySelectorAll("#dinner input[type='number']");
  const snacksNumberInputs = document.querySelectorAll("#snacks input[type='number']");
  const exerciseNumberInputs = document.querySelectorAll("#exercise input[type='number']");

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
  // Collect foods and their calories for each meal
  function collectFoods(fieldsetId) {
    if (fieldsetId === 'exercise') {
      const types = Array.from(document.querySelectorAll(`#${fieldsetId} select.exercise-type`));
      const cals = Array.from(document.querySelectorAll(`#${fieldsetId} input[type='number']`));
      const foods = [];
      for (let i = 0; i < types.length; i++) {
        const name = types[i].value;
        const calories = cals[i] ? Number(cals[i].value) : 0;
        if (name || calories) {
          foods.push({ name, calories });
        }
      }
      return foods;
    } else {
      const names = Array.from(document.querySelectorAll(`#${fieldsetId} input[type='text']`));
      const cals = Array.from(document.querySelectorAll(`#${fieldsetId} input[type='number']`));
      const foods = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        const calories = cals[i] ? Number(cals[i].value) : 0;
        if (name || calories) {
          foods.push({ name, calories });
        }
      }
      return foods;
    }
  }
  const foods = [
    ...collectFoods('breakfast'),
    ...collectFoods('lunch'),
    ...collectFoods('dinner'),
    ...collectFoods('snacks'),
    ...collectFoods('exercise')
  ];

  // --- Merge with existing entry for today if present ---
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let calorieHistory = JSON.parse(localStorage.getItem('calorieHistory') || '[]');
  let existing = calorieHistory.find(entry => entry.date === today);
  if (existing) {
    // Budget: keep the highest
    const newBudget = Math.max(Number(existing.budget || 0), Number(budgetCalories));
    // Check if new food/exercise was entered
    const isOnlyBudgetChange = consumedCalories === 0 && exerciseCalories === 0 && foods.length === 0;
    let newConsumed = Number(existing.consumed || 0);
    let newExercise = Number(existing.exercise || 0);
    let newFoods = (existing.foods || []);
    if (!isOnlyBudgetChange) {
      newConsumed += consumedCalories;
      newExercise += exerciseCalories;
      newFoods = newFoods.concat(foods);
    }
    // Recalculate remaining calories
    const newRemaining = newBudget - newConsumed + newExercise;
    // Remove old entry and push new
    calorieHistory = calorieHistory.filter(entry => entry.date !== today);
    calorieHistory.push({ date: today, calories: newRemaining, budget: newBudget, consumed: newConsumed, exercise: newExercise, foods: newFoods });
    // Update output
    const surplusOrDeficit = newRemaining < 0 ? 'kalorioverskudd 🍕🤢' : 'kaloriunderskudd 🥦💪';
    output.innerHTML = `
      <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(newRemaining)} Kalorier i ${surplusOrDeficit}</span>
      <hr>
      <p>${newBudget} Kalorigrense 🎯</p>
      <p>${newConsumed} Kalorier spist 🍔</p>
      <p>${newExercise} Kalorier brent 💪🔥</p>
    `;
  } else {
    // No entry for today, just push new
    const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
    const surplusOrDeficit = remainingCalories < 0 ? 'kalorioverskudd 🍕🤢' : 'kaloriunderskudd 🥦💪';
    output.innerHTML = `
      <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Kalorier i ${surplusOrDeficit}</span>
      <hr>
      <p>${budgetCalories} Kalorigrense 🎯</p>
      <p>${consumedCalories} Kalorier spist 🍔</p>
      <p>${exerciseCalories} Kalorier brent 💪🔥</p>
    `;
    calorieHistory.push({ date: today, calories: remainingCalories, budget: budgetCalories, consumed: consumedCalories, exercise: exerciseCalories, foods });
  }
  output.classList.remove('hide');
  localStorage.setItem('calorieHistory', JSON.stringify(calorieHistory));

  // Clear all food/exercise input fields (except budget)
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));
  for (const container of inputContainers) {
    container.innerHTML = '';
  }
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Ugyldig verdi: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));

  for (const container of inputContainers) {
    container.innerHTML = '';
  }

  budgetNumberInput.value = '';
  output.innerText = '';
  output.classList.add('hide');
}

addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm)