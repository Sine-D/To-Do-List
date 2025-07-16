class TaskManager {
    constructor() {
        this.tasks = [];
        this.taskIdCounter = 1;
        this.quotes = [
            "Stay positive, work hard, make it happen!",
            "Success is the sum of small efforts repeated day in and day out.",
            "You are capable of amazing things.",
            "Dream big. Start small. Act now.",
            "Don’t watch the clock; do what it does. Keep going.",
            "Every accomplishment starts with the decision to try.",
            "Progress, not perfection.",
            "The secret of getting ahead is getting started.",
            "Small steps every day.",
            "Your only limit is your mind."
        ];
        this.streak = 0;
        this.lastCompleteDate = null;
        this.confettiAudio = null;
        this.init();
    }

    init() {
        this.loadTasks();
        this.loadStreak();
        this.bindEvents();
        this.updateStats();
        this.toggleEmptyState();
        this.showRandomQuote();
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.tasks = parsed;
                    // Update taskIdCounter
                    this.taskIdCounter = this.tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
                    this.refreshTaskList();
                }
            } catch (e) {
                
            }
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadStreak() {
        const streak = localStorage.getItem('streak');
        const lastDate = localStorage.getItem('lastCompleteDate');
        this.streak = streak ? parseInt(streak) : 0;
        this.lastCompleteDate = lastDate ? lastDate : null;
        this.updateStreakDisplay();
    }

    saveStreak() {
        localStorage.setItem('streak', this.streak);
        localStorage.setItem('lastCompleteDate', this.lastCompleteDate);
    }

    updateStreakDisplay() {
        const streakCount = document.getElementById('streakCount');
        if (streakCount) streakCount.textContent = this.streak;
    }

    showRandomQuote() {
        const quoteBox = document.getElementById('motivationalQuote');
        if (quoteBox) {
            const idx = Math.floor(Math.random() * this.quotes.length);
            quoteBox.textContent = this.quotes[idx];
        }
    }

    bindEvents() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        
        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const taskText = taskInput.value.trim();
        const category = categorySelect.value;
        const dueDate = dueDateInput.value;
        
        if (!taskText) {
            taskInput.focus();
            taskInput.classList.add('pulse');
            setTimeout(() => taskInput.classList.remove('pulse'), 600);
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: taskText,
            category: category,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.updateStats();
        this.toggleEmptyState();
        this.showRandomQuote();
        
        taskInput.value = '';
        taskInput.focus();
        categorySelect.selectedIndex = 0;
        dueDateInput.value = '';
        
        // Add celebration effect
        this.showAddEffect();
    }

    renderTask(task) {
        const taskList = document.getElementById('taskList');
        const taskItem = document.createElement('div');
        const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().toDateString());
        taskItem.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        taskItem.setAttribute('data-id', task.id);

        let dueDateHtml = '';
        if (task.dueDate) {
            dueDateHtml = `<span class="task-due-date">Due: ${this.escapeHtml(task.dueDate)}</span>`;
        }

        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <span class="task-category category-${task.category.toLowerCase()}">${this.escapeHtml(task.category)}</span>
            ${dueDateHtml}
            <div class="task-actions">
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        `;

        this.bindTaskEvents(taskItem);
        taskList.appendChild(taskItem);
    }

    bindTaskEvents(taskItem) {
        const checkbox = taskItem.querySelector('.task-checkbox');
        const editBtn = taskItem.querySelector('.edit-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        const taskId = parseInt(taskItem.getAttribute('data-id'));

        checkbox.addEventListener('change', () => this.toggleTask(taskId));
        editBtn.addEventListener('click', () => this.editTask(taskId));
        deleteBtn.addEventListener('click', () => this.deleteTask(taskId));
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            const taskItem = document.querySelector(`[data-id="${taskId}"]`);
            taskItem.classList.toggle('completed', task.completed);
            this.updateStats();
            
            if (task.completed) {
                this.showCompletionEffect(taskItem);
                this.handleStreakOnComplete();
                this.showRandomQuote();
                this.checkAllTasksCompleted();
            }
        }
    }

    editTask(taskId) {
        const taskItem = document.querySelector(`[data-id="${taskId}"]`);
        const taskText = taskItem.querySelector('.task-text');
        const taskActions = taskItem.querySelector('.task-actions');
        const currentText = taskText.textContent;

        taskText.innerHTML = `<input type="text" class="edit-input" value="${this.escapeHtml(currentText)}" maxlength="200">`;
        taskActions.innerHTML = `
            <button class="action-btn save-btn">Save</button>
            <button class="action-btn cancel-btn">Cancel</button>
        `;

        const editInput = taskText.querySelector('.edit-input');
        const saveBtn = taskActions.querySelector('.save-btn');
        const cancelBtn = taskActions.querySelector('.cancel-btn');

        editInput.focus();
        editInput.select();

        const saveEdit = () => {
            const newText = editInput.value.trim();
            if (newText) {
                const task = this.tasks.find(t => t.id === taskId);
                task.text = newText;
                this.saveTasks();
                this.refreshTaskList();
            } else {
                editInput.focus();
                editInput.classList.add('pulse');
                setTimeout(() => editInput.classList.remove('pulse'), 600);
            }
        };

        const cancelEdit = () => {
            this.refreshTaskList();
        };

        saveBtn.addEventListener('click', saveEdit);
        cancelBtn.addEventListener('click', cancelEdit);
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
            if (e.key === 'Escape') cancelEdit();
        });
    }

    deleteTask(taskId) {
        const taskItem = document.querySelector(`[data-id="${taskId}"]`);
        taskItem.classList.add('deleting');
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.refreshTaskList();
            this.updateStats();
            this.toggleEmptyState();
        }, 300);
    }

    refreshTaskList() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';
        
        this.tasks.forEach(task => this.renderTask(task));
        this.toggleEmptyState();
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        this.animateNumber('totalTasks', totalTasks);
        this.animateNumber('completedTasks', completedTasks);
        this.animateNumber('pendingTasks', pendingTasks);

        // Update progress bar
        const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
        const progressBarFill = document.getElementById('progressBarFill');
        const progressBarLabel = document.getElementById('progressBarLabel');
        if (progressBarFill) progressBarFill.style.width = percent + '%';
        if (progressBarLabel) progressBarLabel.textContent = percent + '% Complete';
    }

    animateNumber(elementId, newValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue !== newValue) {
            element.style.transform = 'scale(1.2)';
            element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }

    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        emptyState.style.display = this.tasks.length === 0 ? 'block' : 'none';
    }

    showAddEffect() {
        const addBtn = document.getElementById('addBtn');
        addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
        }, 100);
    }

    showCompletionEffect(taskItem) {
        taskItem.style.animation = 'pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            taskItem.style.animation = '';
        }, 600);
    }

    handleStreakOnComplete() {
        const today = new Date().toISOString().slice(0, 10);
        if (this.lastCompleteDate === today) return; // Already counted today
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (this.lastCompleteDate === yesterday) {
            this.streak += 1;
        } else {
            this.streak = 1;
        }
        this.lastCompleteDate = today;
        this.saveStreak();
        this.updateStreakDisplay();
    }

    checkAllTasksCompleted() {
        if (this.tasks.length > 0 && this.tasks.every(t => t.completed)) {
            this.launchConfetti();
            this.playCelebrateSound();
        }
    }

    launchConfetti() {
        
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.left = 0;
        confetti.style.top = 0;
        confetti.style.width = '100vw';
        confetti.style.height = '100vh';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = 9999;
        confetti.innerHTML = Array.from({length: 60}).map(() => `<span style="font-size:${24 + Math.random()*24}px;position:absolute;left:${Math.random()*100}vw;top:-40px;animation:confetti-fall 1.5s linear forwards;">🎉</span>`).join('');
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1600);
    }

    playCelebrateSound() {
        if (!this.confettiAudio) {
            this.confettiAudio = new Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae1c3.mp3');
        }
        this.confettiAudio.currentTime = 0;
        this.confettiAudio.play();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


const style = document.createElement('style');
style.innerHTML = `@keyframes confetti-fall { to { top: 100vh; transform: rotate(360deg); opacity: 0.7; } }`;
document.head.appendChild(style);


document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});