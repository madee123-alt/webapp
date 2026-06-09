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
const badgeGrid = document.getElementById('badge-grid');
const enableEncouragementToggle = document.getElementById('enable-encouragement');
const accountabilityGroupContainer = document.getElementById('accountability-group');
const joinGroupBtn = document.getElementById('join-group-btn');
const calendarGrid = document.getElementById('calendar-grid');
const encouragementBanner = document.getElementById('encouragement-banner');

// Default categories with emojis
const defaultCategories = [
    { name: 'Health', emoji: '💚' },
    { name: 'Learning', emoji: '📚' },
    { name: 'Fitness', emoji: '💪' },
    { name: 'Mindfulness', emoji: '🧘' },
    { name: 'Work', emoji: '💼' },
    { name: 'Social', emoji: '👥' }
];

// Preset starter habits for users who want a fast setup
const predefinedHabits = [
    { name: 'Drink 8 glasses of water', time: '', frequency: 'daily', category: '0', customDays: '', customUnit: 'day', completionDates: [] },
    { name: 'Exercise for 30 minutes', time: '06:00', frequency: 'daily', category: '2', customDays: '', customUnit: 'day', completionDates: [] },
    { name: 'Read for 20 minutes', time: '20:00', frequency: 'daily', category: '1', customDays: '', customUnit: 'day', completionDates: [] }
];

// Load or initialize state
let categories = JSON.parse(localStorage.getItem('habitCategories')) || defaultCategories;
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Badge service stores earned badges and evaluates milestones
class BadgeService {
    constructor() {
        this.storageKey = 'habitBadges';
        this.badges = this.loadBadges();
        this.definitions = [
            { key: '7-day-streak', title: '7-Day Streak', description: 'Complete habits for 7 days in a row.' },
            { key: '30-day-streak', title: '30-Day Streak', description: 'Keep momentum for 30 consecutive days.' },
            { key: '100-day-streak', title: '100-Day Streak', description: 'Build a long-term habit routine.' },
            { key: '10-completions', title: '10 Completions', description: 'Complete 10 tasks (total).' },
            { key: '50-completions', title: '50 Completions', description: 'Complete 50 tasks (total).' },
            { key: '100-completions', title: '100 Completions', description: 'Complete 100 tasks (total).' },
            { key: 'early-bird', title: 'Early Bird', description: 'Complete a habit before 8 AM.' },
            { key: 'night-owl', title: 'Night Owl', description: 'Complete a habit after 10 PM.' },
            { key: 'perfect-week', title: 'Perfect Week', description: 'Complete at least one habit each day for 7 days.' }
        ];
    }

    loadBadges() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    }

    saveBadges() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.badges));
    }

    awardBadge(key) {
        if (!this.badges[key]) {
            this.badges[key] = { earnedAt: new Date().toISOString() };
            this.saveBadges();
            return true;
        }
        return false;
    }

    getBadgeList() {
        return this.definitions.map(def => ({
            ...def,
            earned: Boolean(this.badges[def.key]),
            earnedAt: this.badges[def.key]?.earnedAt
        }));
    }

    formatDate(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().slice(0, 10);
    }

    evaluateStreak(completedDates) {
        let streak = 0;
        const today = new Date();
        while (true) {
            const dateKey = this.formatDate(today);
            if (!completedDates.has(dateKey)) {
                break;
            }
            streak += 1;
            today.setDate(today.getDate() - 1);
        }

        if (streak >= 7) this.awardBadge('7-day-streak');
        if (streak >= 30) this.awardBadge('30-day-streak');
        if (streak >= 100) this.awardBadge('100-day-streak');
        return streak;
    }

    evaluatePerfectWeek(completedDates) {
        const today = new Date();
        for (let offset = 0; offset < 7; offset += 1) {
            const dateKey = this.formatDate(today);
            if (!completedDates.has(dateKey)) {
                return false;
            }
            today.setDate(today.getDate() - 1);
        }
        return this.awardBadge('perfect-week');
    }

    awardSpecialBadge(key) {
        return this.awardBadge(key);
    }
}

// Encouragement display for positive and gentle messages
class EncouragementMessage {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.storageKey = 'encouragementEnabled';
        this.enabled = JSON.parse(localStorage.getItem(this.storageKey));
        if (this.enabled === null) {
            this.enabled = true;
        }
        this.successMessages = [
            'Great job!',
            'You\'re on fire!',
            'Another step closer to your goal!',
            'Nice work, keep that momentum going!',
            'Every win counts — well done!'
        ];
        this.missedMessages = [
            'It\'s okay, tomorrow is a new opportunity.',
            'Slips happen. You\'ve got this!',
            'Reset and keep moving forward.',
            'A pause doesn\'t erase your progress.',
            'Stay kind to yourself — keep going.'
        ];
        this.hideTimeout = null;
        this.updateToggle();
    }

    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    showSuccess() {
        if (!this.enabled || !this.container) return;
        this.showMessage(this.getRandomMessage(this.successMessages));
    }

    showMissed() {
        if (!this.enabled || !this.container) return;
        this.showMessage(this.getRandomMessage(this.missedMessages));
    }

    showMessage(message) {
        if (!this.container) return;
        this.container.textContent = message;
        this.container.classList.add('visible');
        clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.container.classList.remove('visible');
        }, 4800);
    }

    toggle(enabled) {
        this.enabled = enabled;
        localStorage.setItem(this.storageKey, JSON.stringify(enabled));
        this.updateToggle();
    }

    updateToggle() {
        if (enableEncouragementToggle) {
            enableEncouragementToggle.checked = this.enabled;
        }
    }
}

// Accountability group component for joining and viewing stats
class AccountabilityGroup {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.storageKey = 'accountabilityGroup';
        this.data = this.loadData();
    }

    loadData() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || {
            joined: false,
            members: 25,
            points: 0,
            joinDate: null
        };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    joinGroup() {
        if (!this.data.joined) {
            this.data.joined = true;
            this.data.joinDate = new Date().toISOString();
            this.data.members += Math.floor(Math.random() * 8) + 3;
            this.data.points += 30;
            this.saveData();
            this.render();
        }
    }

    recordProgress() {
        if (this.data.joined) {
            this.data.points += 5;
            this.saveData();
            this.render();
        }
    }

    render() {
        if (!this.container) return;

        if (!this.data.joined) {
            this.container.innerHTML = `
                <p class="panel-text">Join the accountability group to stay motivated with supportive progress tracking.</p>
                <button id="join-now-btn" class="primary small">Join Now</button>
            `;
            const joinNowBtn = document.getElementById('join-now-btn');
            if (joinNowBtn) {
                joinNowBtn.addEventListener('click', () => this.joinGroup());
            }
            return;
        }

        const joinedDate = new Date(this.data.joinDate);
        this.container.innerHTML = `
            <div class="group-stats">
                <div>
                    <p class="stat-number">${this.data.members}</p>
                    <p class="stat-label">Members</p>
                </div>
                <div>
                    <p class="stat-number">${this.data.points}</p>
                    <p class="stat-label">Community Points</p>
                </div>
                <div>
                    <p class="stat-number">${joinedDate.toLocaleDateString()}</p>
                    <p class="stat-label">Joined</p>
                </div>
            </div>
            <p class="panel-text">Keep contributing by marking habits complete and tracking progress together.</p>
        `;
    }
}

const badgeService = new BadgeService();
const encouragement = new EncouragementMessage('encouragement-banner');
const accountabilityGroup = new AccountabilityGroup('accountability-group');

// Small completion popup (toast)
function showCompletionPopup(message) {
    const toast = document.createElement('div');
    toast.className = 'completion-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 50);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

// Lightweight confetti launcher using DOM elements
function launchConfetti(count = 24) {
    const colors = ['#ef4444','#f59e0b','#f97316','#10b981','#3b82f6','#8b5cf6'];
    const pieces = [];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-10vh';
        el.style.background = colors[Math.floor(Math.random() * colors.length)];
        el.style.transform = `rotate(${Math.random() * 360}deg)`;
        const delay = Math.random() * 0.2;
        const duration = 1.2 + Math.random() * 1.2;
        el.style.animation = `confetti-fall ${duration}s ${delay}s cubic-bezier(.2,.7,.2,1) forwards`;
        document.body.appendChild(el);
        pieces.push(el);
    }
    // cleanup after animation
    setTimeout(() => {
        pieces.forEach(p => p.remove());
    }, 3000);
}

function getTotalCompletions() {
    let total = 0;
    habits.forEach(h => {
        if (Array.isArray(h.completionDates)) total += h.completionDates.length;
    });
    return total;
}

function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10);
}

function getAllCompletionDates() {
    const dates = new Set();
    habits.forEach(habit => {
        if (Array.isArray(habit.completionDates)) {
            habit.completionDates.forEach(date => dates.add(date));
        }
    });
    return dates;
}

// --- Smart habit recommendation mappings ---
const suggestionMappings = {
    exercise: ['Drink Water', 'Stretch', 'Sleep 8 Hours', 'Take a Walk'],
    study: ['Review Notes', 'Organize Tasks', 'Read for 20 Minutes', 'Limit Phone Usage'],
    read: ['Journal', 'Learn New Vocabulary', 'Read Before Bed', 'Visit the Library'],
    'sleep earlier': ['No Screens Before Bed', 'Meditation', 'Evening Routine'],
    'drink water': ['Exercise', 'Healthy Eating', 'Track Daily Intake']
};

const defaultSuggestions = ['Drink Water', 'Walk 10 Minutes', 'Read 10 Pages', 'Make Your Bed', 'Practice Gratitude'];

// Listen for typing in the new habit input and show suggestions
const suggestionsEl = document.getElementById('suggestions');
newHabitInput.addEventListener('input', function (e) {
    const query = (e.target.value || '').trim().toLowerCase();
    const suggestions = generateSuggestions(query);
    renderSuggestions(suggestions);
});

// Generate 3-5 suggestions based on simple keyword matching
function generateSuggestions(query) {
    if (!query) return defaultSuggestions.slice(0, 5);

    const results = new Set();

    // match mapping keys
    Object.keys(suggestionMappings).forEach(key => {
        if (key.includes(query) || query.includes(key) || key.split(' ').some(k => query.includes(k))) {
            suggestionMappings[key].forEach(s => results.add(s));
        }
    });

    // match categories by keywords
    const categoryKeywords = {
        health: ['health', 'water', 'drink', 'sleep', 'wellness'],
        fitness: ['exercise', 'workout', 'run', 'walk', 'fitness'],
        productivity: ['study', 'task', 'organize', 'productivity', 'work'],
        learning: ['read', 'learn', 'study', 'vocabulary'],
        wellness: ['meditation', 'mindfulness', 'wellness'],
        growth: ['habit', 'growth', 'improve', 'practice']
    };

    Object.entries(categoryKeywords).forEach(([cat, keys]) => {
        keys.forEach(k => {
            if (query.includes(k)) {
                // add some default related suggestions for the category
                if (cat === 'health') ['Drink Water', 'Track Daily Intake', 'Healthy Eating'].forEach(s => results.add(s));
                if (cat === 'fitness') ['Take a Walk', 'Stretch', 'Exercise'].forEach(s => results.add(s));
                if (cat === 'productivity') ['Organize Tasks', 'Review Notes', 'Plan Tomorrow'].forEach(s => results.add(s));
                if (cat === 'learning') ['Read for 20 Minutes', 'Learn New Vocabulary', 'Visit the Library'].forEach(s => results.add(s));
                if (cat === 'wellness') ['Meditation', 'No Screens Before Bed', 'Evening Routine'].forEach(s => results.add(s));
                if (cat === 'growth') ['Practice Gratitude', 'Journal', 'Try Something New'].forEach(s => results.add(s));
            }
        });
    });

    // fallback to default when nothing matched
    if (results.size === 0) {
        defaultSuggestions.forEach(s => results.add(s));
    }

    // return up to 5 suggestions
    return Array.from(results).slice(0, 5);
}

// Render suggestions into the dropdown; clicking a suggestion will add it
function renderSuggestions(list) {
    if (!suggestionsEl) return;
    suggestionsEl.innerHTML = '';
    list.forEach(text => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = text;
        div.addEventListener('click', () => {
            addSuggestedHabit(text);
            suggestionsEl.innerHTML = '';
            newHabitInput.value = '';
        });
        suggestionsEl.appendChild(div);
    });
}

// Add the suggested habit directly to the habits list and render
function addSuggestedHabit(text) {
    // basic habit object; user can edit later
    const habitObj = {
        name: text,
        time: '',
        frequency: 'daily',
        category: '',
        customDays: '',
        customUnit: 'day',
        completionDates: []
    };
    habits.push(habitObj);
    saveData();
    renderHabits();
    showCompletionPopup(`Added habit: ${text}`);
}

function renderCalendar() {
    if (!calendarGrid) return;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const completedDates = getAllCompletionDates();

    calendarGrid.innerHTML = '';
    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const dateKey = formatDate(date);
        const isToday = dateKey === formatDate(new Date());
        const completed = completedDates.has(dateKey);

        const dayNode = document.createElement('div');
        dayNode.className = `calendar-day ${completed ? 'active' : ''} ${isToday ? 'today' : ''}`;
        dayNode.innerHTML = `
            <span class="day-number">${day}</span>
            <span class="day-label">${date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
        `;
        calendarGrid.appendChild(dayNode);
    }
}

function renderBadges() {
    if (!badgeGrid) return;
    const badges = badgeService.getBadgeList();
    badgeGrid.innerHTML = badges.map(badge => `
        <div class="badge-card ${badge.earned ? 'earned' : 'locked'}">
            <div class="badge-icon">${badge.earned ? '🏅' : '🔒'}</div>
            <p class="badge-title">${badge.title}</p>
            <p class="badge-description">${badge.description}</p>
            <span class="badge-status ${badge.earned ? 'earned' : 'locked'}">
                ${badge.earned ? 'Awarded' : 'Locked'}
            </span>
        </div>
    `).join('');
}

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

function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitCategories', JSON.stringify(categories));
}

function updateCategorySelect() {
    habitCategorySelect.innerHTML = '<option value="">Select or create category...</option>';
    categories.forEach((cat, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${cat.emoji} ${cat.name}`;
        habitCategorySelect.appendChild(option);
    });
}

function addHabitToList(habitObj, index) {
    const li = document.createElement('li');
    li.dataset.index = index;
    li.className = 'habit-item';
    const categoryName = habitObj.category !== '' ? categories[habitObj.category]?.name : 'Uncategorized';
    const categoryEmoji = habitObj.category !== '' ? categories[habitObj.category]?.emoji : '📌';
    const timeText = habitObj.time ? `⏰ ${habitObj.time}` : '';
    const frequencyText = habitObj.frequency === 'custom'
        ? `↻ Every ${habitObj.customDays} ${habitObj.customUnit}(s)`
        : `↻ ${habitObj.frequency.charAt(0).toUpperCase() + habitObj.frequency.slice(1)}`;

    const completedToday = Array.isArray(habitObj.completionDates) && habitObj.completionDates.includes(formatDate(new Date()));

    li.innerHTML = `
        <div class="habit-content">
            <input type="checkbox" class="habit-checkbox" ${completedToday ? 'checked' : ''}>
            <div class="habit-details">
                <span class="habit-name">${habitObj.name}</span>
                <div class="habit-meta">
                    <span class="category-badge">${categoryEmoji} ${categoryName}</span>
                    ${timeText ? `<span class="time-badge">${timeText}</span>` : ''}
                    <span class="frequency-badge">${frequencyText}</span>
                </div>
            </div>
        </div>
        <div class="habit-actions">
            <button type="button" class="missed-btn secondary">Missed</button>
            <button type="button" class="delete-btn">Delete</button>
        </div>
    `;
    habitList.appendChild(li);
}

function getGlobalCompletionDates() {
    const dates = new Set();
    habits.forEach(habit => {
        if (Array.isArray(habit.completionDates)) {
            habit.completionDates.forEach(date => dates.add(date));
        }
    });
    return dates;
}

function handleHabitCompletion(index, isChecked) {
    const habit = habits[index];
    if (!habit) return;

    if (!Array.isArray(habit.completionDates)) {
        habit.completionDates = [];
    }

    if (isChecked) {
        const now = new Date();
        const dateKey = formatDate(now);
        if (!habit.completionDates.includes(dateKey)) {
            habit.completionDates.push(dateKey);
        }
        habit.lastCompleted = now.toISOString();
        saveData();
        encouragement.showSuccess();

        // Show a short popup/toast for completion
        showCompletionPopup(`Well done — you completed "${habit.name}"`);
        // show confetti celebration
        launchConfetti();

        // Award badges based on raw completion counts
        const total = getTotalCompletions();
        if (total >= 10) badgeService.awardBadge('10-completions');
        if (total >= 50) badgeService.awardBadge('50-completions');
        if (total >= 100) badgeService.awardBadge('100-completions');

        const completedDates = getGlobalCompletionDates();
        badgeService.evaluateStreak(completedDates);
        badgeService.evaluatePerfectWeek(completedDates);

        if (now.getHours() < 8) {
            badgeService.awardSpecialBadge('early-bird');
        } else if (now.getHours() >= 22) {
            badgeService.awardSpecialBadge('night-owl');
        }

        accountabilityGroup.recordProgress();
        renderBadges();
        renderCalendar();
        renderAccountability();
    } else {
        encouragement.showMissed();
    }
}

function handleHabitMissed(index) {
    const habit = habits[index];
    if (!habit) return;
    encouragement.showMissed();
    if (!habit.missedDays) {
        habit.missedDays = 0;
    }
    habit.missedDays += 1;
    saveData();
}

function renderHabits() {
    habitList.innerHTML = '';
    habits.forEach((habit, index) => {
        if (!Array.isArray(habit.completionDates)) {
            habit.completionDates = [];
        }
        addHabitToList(habit, index);
    });
}

function renderAccountability() {
    accountabilityGroup.render();
}

function initialize() {
    updateCategorySelect();
    renderCategories();
    renderHabits();
    renderCalendar();
    renderBadges();
    renderAccountability();
    encouragement.updateToggle();

    // Respect user's preference to skip the intro/chatbox
    try {
        const skip = localStorage.getItem('skipIntro');
        if (skip === 'true' && chatbox) {
            chatbox.style.display = 'none';
        }
    } catch (e) {
        // ignore
    }
}


habitFrequencySelect.addEventListener('change', function() {
    if (this.value === 'custom') {
        customFrequencyGroup.style.display = 'block';
    } else {
        customFrequencyGroup.style.display = 'none';
    }
});

yesBtn.addEventListener('click', function() {
    habits = predefinedHabits.map(h => ({ ...h, completionDates: [] }));
    saveData();
    renderHabits();
    renderCalendar();
    renderBadges();
    chatbox.style.display = 'none';
});

// When the user clicks Customize: hide the intro/chatbox and remember preference
if (customizeBtn) {
    customizeBtn.addEventListener('click', function() {
        localStorage.setItem('skipIntro', 'true');
        if (chatbox) chatbox.style.display = 'none';
        if (newHabitInput) newHabitInput.focus();
    });
}

closeBtn.addEventListener('click', function() {
    chatbox.style.display = 'none';
});

joinGroupBtn.addEventListener('click', function() {
    accountabilityGroup.joinGroup();
});

enableEncouragementToggle.addEventListener('change', function() {
    encouragement.toggle(this.checked);
});

habitForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const habitName = newHabitInput.value.trim();
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
        customUnit: customUnit,
        completionDates: []
    };

    habits.push(habitObj);
    saveData();
    renderHabits();

    newHabitInput.value = '';
    habitTimeInput.value = '';
    habitFrequencySelect.value = 'daily';
    habitCategorySelect.value = '';
    habitCustomDays.value = '';
    customFrequencyGroup.style.display = 'none';
});

habitList.addEventListener('change', function(e) {
    if (e.target.classList.contains('habit-checkbox')) {
        const listItem = e.target.closest('li');
        const index = Number(listItem.dataset.index);
        handleHabitCompletion(index, e.target.checked);
    }
});

habitList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const listItem = e.target.closest('li');
        const index = Number(listItem.dataset.index);
        habits.splice(index, 1);
        saveData();
        renderHabits();
        renderCalendar();
        renderBadges();
    }

    if (e.target.classList.contains('missed-btn')) {
        const listItem = e.target.closest('li');
        const index = Number(listItem.dataset.index);
        handleHabitMissed(index);
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-category-btn')) {
        const index = Number(e.target.getAttribute('data-index'));
        categories.splice(index, 1);
        saveData();
        updateCategorySelect();
        renderCategories();
    }
});

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('category-name-input')) {
        const index = Number(e.target.getAttribute('data-index'));
        categories[index].name = e.target.value;
        saveData();
        updateCategorySelect();
    }
});

renderCategories();
initialize();
