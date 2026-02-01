// TaskNest - Smart To-Do & Focus Assistant
// Main application logic

class TaskNest {
    constructor() {
        this.tasks = [];
        this.currentTask = null;
        this.timerInterval = null;
        this.accountabilityInterval = null;
        this.distractionTimeout = null;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.isPaused = false;
        
        // Motivational content
        this.quotes = [
            "Start small. Stay consistent.",
            "Discipline today = Freedom tomorrow.",
            "One task. Full focus. Let's go.",
            "This 25 minutes could be the reason your future self thanks you.",
            "Someone with your dream is working right now.",
            "Focus on progress, not perfection.",
            "Your future self is watching you right now.",
            "Small steps daily lead to big changes yearly.",
            "The pain of discipline weighs ounces, the pain of regret weighs tons.",
            "Don't stop when you're tired. Stop when you're done.",
            "Success is the sum of small efforts repeated day in and day out.",
            "The secret of getting ahead is getting started.",
            "You don't have to be great to start, but you have to start to be great.",
            "Focus on being productive instead of busy.",
            "The way to get started is to quit talking and begin doing."
        ];
        
        this.reminders = [
            "Social media can wait. Your goals can't.",
            "This moment matters more than your notifications.",
            "Your dreams are worth the focus.",
            "Great things never come from comfort zones.",
            "The time will pass anyway. Make it count.",
            "You're building your future, one focused minute at a time.",
            "Distraction is the enemy of greatness.",
            "Your focus is your superpower.",
            "Every minute focused is an investment in your dreams.",
            "The world needs what you're creating right now."
        ];
        
        this.init();
    }
    
    init() {
        this.setupLoadingScreen();
        this.loadTasks();
        this.loadStats();
        this.setupEventListeners();
        this.updateMotivationQuote();
        this.renderTasks();
        this.updateDashboard();
        this.setupDistractionDetection();
    }
    
    setupLoadingScreen() {
        // Show loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        
        // Hide loading screen and start entrance animations after delay
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            this.startEntranceAnimations();
        }, 1500);
    }
    
    startEntranceAnimations() {
        // Animate elements in sequence
        const elements = document.querySelectorAll('.entrance-hidden');
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.remove('entrance-hidden');
                element.classList.add('entrance-animate');
            }, index * 100);
        });
        
        // Start background animations
        const backgroundAnimation = document.querySelector('.background-animation');
        if (backgroundAnimation) {
            setTimeout(() => {
                backgroundAnimation.classList.add('background-reveal');
            }, 500);
        }
    }
    
    // Local Storage Management
    saveTasks() {
        localStorage.setItem('tasknest_tasks', JSON.stringify(this.tasks));
    }
    
    loadTasks() {
        const saved = localStorage.getItem('tasknest_tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
        }
    }
    
    saveStats() {
        const stats = {
            tasksCompleted: parseInt(document.getElementById('tasksCompleted').textContent),
            focusMinutes: parseInt(document.getElementById('focusMinutes').textContent),
            focusStreak: parseInt(document.getElementById('focusStreak').textContent),
            lastActiveDate: new Date().toDateString()
        };
        localStorage.setItem('tasknest_stats', JSON.stringify(stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('tasknest_stats');
        if (saved) {
            const stats = JSON.parse(saved);
            document.getElementById('tasksCompleted').textContent = stats.tasksCompleted || 0;
            document.getElementById('focusMinutes').textContent = stats.focusMinutes || 0;
            
            // Check streak
            const today = new Date().toDateString();
            const lastActive = stats.lastActiveDate;
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            
            if (lastActive === today || lastActive === yesterday) {
                document.getElementById('focusStreak').textContent = stats.focusStreak || 1;
            } else {
                document.getElementById('focusStreak').textContent = 1;
                this.saveStats();
            }
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Time controls
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const change = parseInt(btn.dataset.change);
                const timeInput = document.getElementById('focusTime');
                const newValue = parseInt(timeInput.value) + change;
                if (newValue >= 1 && newValue <= 180) {
                    timeInput.value = newValue;
                }
            });
        });
        
        // Timer controls
        document.getElementById('startTimer').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resumeTimer').addEventListener('click', () => this.resumeTimer());
        document.getElementById('closeTimer').addEventListener('click', () => this.closeTimer());
        
        // Modal controls
        document.getElementById('accountabilityYes').addEventListener('click', () => {
            this.closeModal('accountabilityModal');
            this.showToast("Great! Keep up the focus!", "success");
        });
        
        document.getElementById('accountabilityNo').addEventListener('click', () => {
            this.closeModal('accountabilityModal');
            this.showDistractionReminder();
        });
        
        document.getElementById('refocusYes').addEventListener('click', () => {
            this.closeModal('distractionModal');
            this.resumeTimer();
            this.showToast("Welcome back! Let's focus.", "info");
        });
        
        document.getElementById('refocusNo').addEventListener('click', () => {
            this.closeModal('distractionModal');
            this.showToast("Take a mindful break. We'll be here when you're ready.", "info");
        });
        
        document.getElementById('successClose').addEventListener('click', () => {
            this.closeModal('successModal');
        });
        
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    // Task Management
    addTask() {
        const nameInput = document.getElementById('taskName');
        const descInput = document.getElementById('taskDescription');
        const timeInput = document.getElementById('focusTime');
        
        const task = {
            id: Date.now(),
            name: nameInput.value.trim(),
            description: descInput.value.trim(),
            focusTime: parseInt(timeInput.value),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        
        // Reset form
        nameInput.value = '';
        descInput.value = '';
        timeInput.value = 25;
        
        this.showToast("Task added successfully! Ready to focus?", "success");
        this.updateMotivationQuote();
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.showToast("Task removed", "info");
    }
    
    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            
            if (task.completed) {
                this.incrementTasksCompleted();
                this.showToast("Amazing work! Task completed! 🎉", "success");
                this.updateMotivationQuote();
            }
        }
    }
    
    startTaskTimer(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task && !task.completed) {
            this.currentTask = task;
            this.timeRemaining = task.focusTime * 60;
            this.totalTime = task.focusTime * 60;
            this.showTimer();
            this.updateMotivationQuote();
            this.showToast(`Starting focus session for "${task.name}"`, "info");
        }
    }
    
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.tasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        tasksList.innerHTML = this.tasks.map((task, index) => `
            <div class="task-card ${task.completed ? 'completed' : ''} fade-in-up" style="animation-delay: ${index * 0.1}s">
                <div class="task-header">
                    <div class="task-info">
                        <div class="task-name">${this.escapeHtml(task.name)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                        <div class="task-meta">
                            <div class="task-time">
                                <i class="fas fa-clock"></i>
                                <span>${task.focusTime} min</span>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        ${!task.completed ? `
                            <button class="task-btn complete-btn" onclick="taskNest.toggleTaskComplete(${task.id})" title="Mark complete">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="task-btn" onclick="taskNest.startTaskTimer(${task.id})" title="Start focus timer">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : ''}
                        <button class="task-btn delete-btn" onclick="taskNest.deleteTask(${task.id})" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Timer Management
    showTimer() {
        if (!this.currentTask) return;
        
        document.getElementById('timerSection').classList.remove('hidden');
        document.getElementById('currentTaskName').textContent = this.currentTask.name;
        this.updateTimerDisplay();
        this.updateProgressCircle();
        
        // Scroll to timer
        document.getElementById('timerSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    closeTimer() {
        this.stopTimer();
        document.getElementById('timerSection').classList.add('hidden');
        this.currentTask = null;
        this.showToast("Timer closed", "info");
    }
    
    startTimer() {
        if (!this.currentTask) return;
        
        this.isPaused = false;
        document.getElementById('startTimer').classList.add('hidden');
        document.getElementById('pauseTimer').classList.remove('hidden');
        document.getElementById('timerStatus').textContent = 'Focus mode active';
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            this.updateProgressCircle();
            
            if (this.timeRemaining <= 0) {
                this.completeTimer();
            }
        }, 1000);
        
        this.startAccountabilityCheck();
        this.resetDistractionDetection();
    }
    
    pauseTimer() {
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.stopAccountabilityCheck();
        
        document.getElementById('pauseTimer').classList.add('hidden');
        document.getElementById('resumeTimer').classList.remove('hidden');
        document.getElementById('timerStatus').textContent = 'Paused';
    }
    
    resumeTimer() {
        if (!this.isPaused) return;
        
        this.startTimer();
    }
    
    stopTimer() {
        clearInterval(this.timerInterval);
        this.stopAccountabilityCheck();
        this.clearDistractionTimeout();
        
        document.getElementById('startTimer').classList.remove('hidden');
        document.getElementById('pauseTimer').classList.add('hidden');
        document.getElementById('resumeTimer').classList.add('hidden');
        document.getElementById('timerStatus').textContent = 'Ready to focus';
    }
    
    completeTimer() {
        this.stopTimer();
        
        // Update stats
        const minutesCompleted = Math.floor(this.totalTime / 60);
        this.incrementFocusMinutes(minutesCompleted);
        
        // Show success modal
        document.getElementById('successModal').classList.add('active');
        this.updateMotivationQuote();
        
        // Play premium completion sound
        premiumSounds.playCompletionSound();
        
        // Reset timer display
        this.timeRemaining = this.totalTime;
        this.updateTimerDisplay();
        this.updateProgressCircle();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('timeRemaining').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgressCircle() {
        const circle = document.getElementById('progressCircle');
        const radius = 110;
        const circumference = 2 * Math.PI * radius;
        
        const progress = (this.totalTime - this.timeRemaining) / this.totalTime;
        const offset = circumference - (progress * circumference);
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
    }
    
    // Accountability System
    startAccountabilityCheck() {
        this.stopAccountabilityCheck();
        
        this.accountabilityInterval = setInterval(() => {
            if (!this.isPaused && this.currentTask) {
                this.showAccountabilityCheck();
            }
        }, 10 * 60 * 1000); // Every 10 minutes
    }
    
    stopAccountabilityCheck() {
        if (this.accountabilityInterval) {
            clearInterval(this.accountabilityInterval);
            this.accountabilityInterval = null;
        }
    }
    
    showAccountabilityCheck() {
        if (!this.currentTask) return;
        
        document.getElementById('accountabilityTaskName').textContent = this.currentTask.name;
        this.showModal('accountabilityModal');
    }
    
    // Distraction Detection
    setupDistractionDetection() {
        let lastActivity = Date.now();
        
        const updateActivity = () => {
            lastActivity = Date.now();
            this.resetDistractionDetection();
        };
        
        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('mousemove', updateActivity);
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentTask && !this.isPaused) {
                this.pauseTimer();
                this.showDistractionAlert();
            }
        });
    }
    
    resetDistractionDetection() {
        this.clearDistractionTimeout();
        
        this.distractionTimeout = setTimeout(() => {
            if (this.currentTask && !this.isPaused) {
                this.showDistractionAlert();
            }
        }, 5 * 60 * 1000); // 5 minutes of inactivity
    }
    
    clearDistractionTimeout() {
        if (this.distractionTimeout) {
            clearTimeout(this.distractionTimeout);
            this.distractionTimeout = null;
        }
    }
    
    showDistractionAlert() {
        this.showModal('distractionModal');
    }
    
    showDistractionReminder() {
        const reminder = this.reminders[Math.floor(Math.random() * this.reminders.length)];
        this.showToast(reminder, "warning");
        this.updateMotivationQuote();
    }
    
    // Motivation Engine
    updateMotivationQuote() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const quoteElement = document.getElementById('motivationQuote');
        
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = quote;
            quoteElement.style.opacity = '1';
        }, 300);
    }
    
    // Dashboard Updates
    updateDashboard() {
        // Dashboard is updated in real-time through other methods
    }
    
    incrementTasksCompleted() {
        const element = document.getElementById('tasksCompleted');
        element.textContent = parseInt(element.textContent) + 1;
        this.saveStats();
    }
    
    incrementFocusMinutes(minutes) {
        const element = document.getElementById('focusMinutes');
        element.textContent = parseInt(element.textContent) + minutes;
        this.saveStats();
    }
    
    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.classList.add('hidden'), 300);
        });
    }
    
    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<div class="toast-message">${this.escapeHtml(message)}</div>`;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const taskNest = new TaskNest();

// Add particle animation system
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.init();
        this.animate();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            hue: Math.random() * 60 + 200 // Blue to purple range
        };
    }
    
    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
        
        // Subtle opacity change
        particle.opacity += (Math.random() - 0.5) * 0.01;
        particle.opacity = Math.max(0.1, Math.min(0.6, particle.opacity));
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = `hsl(${particle.hue}, 70%, 60%)`;
        
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        // Draw connections between nearby particles
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.save();
                    this.ctx.globalAlpha = (1 - distance / 150) * 0.2;
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.lineWidth = 0.5;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
}

// Remove particle system for professional look
// const particleSystem = new ParticleSystem();

// Add premium sound effects
class PremiumSoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Audio not supported');
        }
    }
    
    playCompletionSound() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Subtle, elegant completion sound
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.6);
    }
    
    playClickSound() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.03);
        
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }
    
    playHoverSound() {
        // Remove hover sound for professional look
    }
}

// Initialize premium sound effects
const premiumSounds = new PremiumSoundEffects();

// Add premium hover effects to buttons only
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.premium-btn, .task-btn, .modal-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            premiumSounds.playClickSound();
        });
    });
});

// Remove old SVG gradient code since we're using inline SVG in HTML
