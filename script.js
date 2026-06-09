// Select elements
const habitList = document.getElementById('habits');
const habitForm = document.getElementById('habit-form');
const newHabitInput = document.getElementById('new-habit');
const habitTimeInput = document.getElementById('habit-time');
const habitFrequencySelect = document.getElementById('habit-frequency');
const customFrequencyGroup = document.getElementById('custom-frequency-group');
const habitCustomDays = document.getElementById('habit-custom-days');
const habitCustomUnit = document.getElementById('habit-custom-unit');
const habitCategorySelect = document.getElementById('habit-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoriesSection = document.getElementById('categories-section');
const categoriesList = document.getElementById('categories-list');
const yesBtn = document.getElementById('yes-btn');
const customizeBtn = document.getElementById('customize-btn');
const closeBtn = document.getElementById('close-chat');
const chatbox = document.getElementById('chatbox');

// Default categories with emojis
const defaultCategories = [
    { name: 'Health', emoji: '💚' },
    { name: 'Learning', emoji: '📚' },
    { name: 'Fitness', emoji: '💪' },
    { name: 'Mindfulness', emoji: '🧘' },
    { name: 'Work', emoji: '💼' },
    { name: 'Social', emoji: '👥' }
];

// Load or initialize categories
let categories = JSON.parse(localStorage.getItem('habitCategories')) || defaultCategories;
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Function to save data
function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitCategories', JSON.stringify(categories));
}

// Function to update category select options
function updateCategorySelect() {
    habitCategorySelect.innerHTML = '<option value="">Select or create category...</option>';
    categories.forEach((cat, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${cat.emoji} ${cat.name}`;
        habitCategorySelect.appendChild(option);
    });
}

// Function to render categories management
function renderCategories() {
    categoriesList.innerHTML = '';
    categories.forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
            <div class="category-display">
                <span class="category-emoji">${cat.emoji}</span>
                <input type="text" value="${cat.name}" data-index="${index}" class="category-name-input">
            </div>
            <button type="button" class="delete-category-btn" data-index="${index}">Delete</button>
        `;
        categoriesList.appendChild(div);
    });
}

// Event listener for adding new category
addCategoryBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const categoryName = prompt('Enter category name:');
    if (categoryName) {
        const emoji = prompt('Enter emoji for this category (e.g., 🎯):');
        if (emoji) {
            categories.push({ name: categoryName, emoji: emoji || '📌' });
            saveData();
            updateCategorySelect();
            categoriesSection.style.display = 'block';
            renderCategories();
        }
    }
});

// Event listener for frequency change
habitFrequencySelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customFrequencyGroup.style.display = 'block';
    } else {
        customFrequencyGroup.style.display = 'none';
    }
});

// Function to add a habit to the list
function addHabitToList(habitObj) {
    const li = document.createElement('li');
    const categoryName = habitObj.category !== '' ? categories[habitObj.category].name : 'Uncategorized';
    const categoryEmoji = habitObj.category !== '' ? categories[habitObj.category].emoji : '📌';
    const timeText = habitObj.time ? `⏰ ${habitObj.time}` : '';
    const frequencyText = habitObj.frequency === 'custom' 
        ? `↻ Every ${habitObj.customDays} ${habitObj.customUnit}(s)` 
        : `↻ ${habitObj.frequency.charAt(0).toUpperCase() + habitObj.frequency.slice(1)}`;

    li.innerHTML = `
        <div class="habit-content">
            <input type="checkbox" class="habit-checkbox">
            <div class="habit-details">
                <span class="habit-name">${habitObj.name}</span>
                <div class="habit-meta">
                    <span class="category-badge">${categoryEmoji} ${categoryName}</span>
                    ${timeText ? `<span class="time-badge">${timeText}</span>` : ''}
                    <span class="frequency-badge">${frequencyText}</span>
                </div>
            </div>
        </div>
        <button class="delete-btn">Delete</button>
    `;
    habitList.appendChild(li);
}

// Predefined habits
const predefinedHabits = [
    { name: 'Drink 8 glasses of water', time: '', frequency: 'daily', category: '0', customDays: '', customUnit: 'day' },
    { name: 'Exercise for 30 minutes', time: '06:00', frequency: 'daily', category: '2', customDays: '', customUnit: 'day' },
    { name: 'Read for 20 minutes', time: '20:00', frequency: 'daily', category: '1', customDays: '', customUnit: 'day' }
];

// Add event listener for "Yes, keep them" button
yesBtn.addEventListener('click', function() {
    habits = predefinedHabits.map(h => ({ ...h }));
    saveData();
    renderHabits();
    chatbox.style.display = 'none';
});

// Add event listener for close button
closeBtn.addEventListener('click', function() {
    chatbox.style.display = 'none';
});

// Function to render all habits
function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach((habit, index) => {
        addHabitToList(habit);
    });
}

// Add event listener for adding a new habit
habitForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const habitName = newHabitInput.value;
    const habitTime = habitTimeInput.value;
    const habitFrequency = habitFrequencySelect.value;
    const habitCategory = habitCategorySelect.value;
    const customDays = habitCustomDays.value;
    const customUnit = habitCustomUnit.value;

    if (habitName === '') {
        alert('Please enter a habit name!');
        return;
    }

    if (habitFrequency === 'custom' && !customDays) {
        alert('Please enter custom frequency details!');
        return;
    }

    const habitObj = {
        name: habitName,
        time: habitTime,
        frequency: habitFrequency,
        category: habitCategory,
        customDays: customDays,
        customUnit: customUnit
    };

    habits.push(habitObj);
    saveData();
    addHabitToList(habitObj);

    // Clear form
    newHabitInput.value = '';
    habitTimeInput.value = '';
    habitFrequencySelect.value = 'daily';
    habitCategorySelect.value = '';
    habitCustomDays.value = '';
    customFrequencyGroup.style.display = 'none';
});

// Add event listener for marking habits as complete
habitList.addEventListener('change', function(e) {
    if (e.target.classList.contains('habit-checkbox')) {
        const checkbox = e.target;
        const habitDetails = checkbox.parentElement.querySelector('.habit-name');

        if (checkbox.checked) {
            habitDetails.style.textDecoration = 'line-through';
            habitDetails.style.color = '#a0aec0';
        } else {
            habitDetails.style.textDecoration = 'none';
            habitDetails.style.color = '#2c3e3d';
        }
    }
});

// Add event listener for deleting habits
habitList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        const index = Array.from(habitList.children).indexOf(li);
        habits.splice(index, 1);
        saveData();
        li.remove();
    }
});

// Event listener for deleting categories
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-category-btn')) {
        const index = e.target.getAttribute('data-index');
        categories.splice(index, 1);
        saveData();
        updateCategorySelect();
        renderCategories();
    }
});

// Event listener for editing category names
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('category-name-input')) {
        const index = e.target.getAttribute('data-index');
        categories[index].name = e.target.value;
        saveData();
        updateCategorySelect();
    }
});

// Initialize
updateCategorySelect();
if (habits.length > 0) {
    renderHabits();
}