class TVPlusApp {
    constructor() {
        this.currentTime = 0;
        this.duration = 7200; // 2 saat mock süre
        this.isPlaying = false;
        this.roomId = 'room_1';
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.lastMessageTime = 0;
        this.websocket = null;
        
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupVideoControls();
        this.setupChat();
        this.setupVoting();
        this.setupExpenses();
        this.connectWebSocket();
        this.startTimer();
        
        console.log('TV+ App initialized with user:', this.userId);
    }

    // Tab Management
    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                
                // Remove active class from all
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked
                btn.classList.add('active');
                document.getElementById(targetTab + '-tab').classList.add('active');
            });
        });
    }

    // Video Controls
    setupVideoControls() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const playIcon = document.getElementById('play-btn');
        const progressBar = document.querySelector('.progress-bar');
        const syncBtn = document.getElementById('sync-btn');

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        playIcon.addEventListener('click', () => this.togglePlayPause());
        progressBar.addEventListener('click', (e) => this.seek(e));
        syncBtn.addEventListener('click', () => this.syncVideo());

        // Update progress every second
        setInterval(() => {
            if (this.isPlaying) {
                this.currentTime += 1;
                this.updateProgress();
            }
        }, 1000);
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const playPauseBtn = document.getElementById('play-pause-btn');
        const playIcon = document.getElementById('play-btn');
        
        if (this.isPlaying) {
            playPauseBtn.textContent = '⏸ Pause';
            playIcon.textContent = '⏸';
        } else {
            playPauseBtn.textContent = '▶ Play';
            playIcon.textContent = '▶';
        }

        // Send WebSocket event
        this.sendWebSocketEvent('play_pause', { 
            action: this.isPlaying ? 'play' : 'pause',
            position: this.currentTime 
        });
    }

    seek(e) {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        this.currentTime = Math.floor(percentage * this.duration);
        this.updateProgress();

        // Send WebSocket event
        this.sendWebSocketEvent('seek', { position: this.currentTime });
    }

    syncVideo() {
        // Request sync from server
        this.sendWebSocketEvent('sync_request', { user_id: this.userId });
        
        // Show feedback
        const syncBtn = document.getElementById('sync-btn');
        const originalText = syncBtn.textContent;
        syncBtn.textContent = '✓ Senkronize edildi';
        setTimeout(() => {
            syncBtn.textContent = originalText;
        }, 2000);
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        const timeDisplay = document.getElementById('time-display');
        
        const percentage = (this.currentTime / this.duration) * 100;
        progress.style.width = percentage + '%';
        
        const currentFormatted = this.formatTime(this.currentTime);
        const durationFormatted = this.formatTime(this.duration);
        timeDisplay.textContent = `${currentFormatted} / ${durationFormatted}`;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Chat System
    setupChat() {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const emojiButtons = document.querySelectorAll('.emoji-btn');

        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        emojiButtons.forEach(btn => {
            btn.addEventListener('click', () => this.sendEmoji(btn.dataset.emoji));
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Rate limiting check
        const now = Date.now();
        if (now - this.lastMessageTime < 2000) {
            this.showNotification('Çok hızlı mesaj gönderiyorsunuz. 2 saniye bekleyin.');
            return;
        }
        
        this.lastMessageTime = now;
        messageInput.value = '';
        
        // Add to chat locally
        this.addChatMessage(this.userId, message);
        
        // Send via WebSocket
        this.sendWebSocketEvent('chat', { message, user_id: this.userId });
    }

    sendEmoji(emoji) {
        // Rate limiting check
        const now = Date.now();
        if (now - this.lastMessageTime < 2000) {
            this.showNotification('Çok hızlı emoji gönderiyorsunuz. 2 saniye bekleyin.');
            return;
        }
        
        this.lastMessageTime = now;
        
        // Add to chat locally
        this.addChatMessage(this.userId, emoji);
        
        // Send via WebSocket
        this.sendWebSocketEvent('emoji', { emoji, user_id: this.userId });
    }

    addChatMessage(username, text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <span class="username">${username}:</span>
            <span class="text">${text}</span>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Voting System
    setupVoting() {
        const voteButtons = document.querySelectorAll('.vote-btn');
        
        voteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const contentId = btn.dataset.content;
                this.vote(contentId);
            });
        });
        
        // Load candidates
        this.loadCandidates();
    }

    async loadCandidates() {
        try {
            const response = await fetch(`/votes/${this.roomId}/candidates`);
            const data = await response.json();
            // Update UI with real candidates
            console.log('Candidates loaded:', data);
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    }

    async vote(contentId) {
        try {
            const response = await fetch('/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: this.roomId,
                    content_id: contentId,
                    user_id: this.userId
                })
            });
            
            if (response.ok) {
                this.showNotification('Oyunuz kaydedildi!');
                this.loadVoteTally();
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    }

    async loadVoteTally() {
        try {
            const response = await fetch(`/votes/${this.roomId}/tally`);
            const data = await response.json();
            // Update vote counts in UI
            console.log('Vote tally:', data);
        } catch (error) {
            console.error('Error loading vote tally:', error);
        }
    }

    // Expense Management
    setupExpenses() {
        const addExpenseBtn = document.getElementById('add-expense-btn');
        
        addExpenseBtn.addEventListener('click', () => this.addExpense());
        
        this.loadExpenses();
    }

    async addExpense() {
        const desc = document.getElementById('expense-desc').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        
        if (!desc || !amount) {
            this.showNotification('Lütfen açıklama ve tutar girin.');
            return;
        }
        
        try {
            const response = await fetch('/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expense_id: 'exp_' + Date.now(),
                    room_id: this.roomId,
                    user_id: this.userId,
                    amount: amount,
                    description: desc,
                    weight: 1.0
                })
            });
            
            if (response.ok) {
                document.getElementById('expense-desc').value = '';
                document.getElementById('expense-amount').value = '';
                this.showNotification('Masraf eklendi!');
                this.loadExpenses();
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    }

    async loadExpenses() {
        try {
            const response = await fetch(`/expenses/${this.roomId}`);
            const data = await response.json();
            this.updateExpensesUI(data.expenses);
            
            const balanceResponse = await fetch(`/expenses/${this.roomId}/balances`);
            const balanceData = await balanceResponse.json();
            this.updateBalancesUI(balanceData.balances);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }

    updateExpensesUI(expenses) {
        const expensesList = document.getElementById('expenses-list');
        expensesList.innerHTML = '<h4>Masraflar:</h4>';
        
        expenses.forEach(expense => {
            const div = document.createElement('div');
            div.className = 'expense-item';
            div.innerHTML = `
                <span>${expense.note}</span>
                <span>₺${expense.amount}</span>
            `;
            expensesList.appendChild(div);
        });
    }

    updateBalancesUI(balances) {
        const balancesDiv = document.getElementById('balances');
        balancesDiv.innerHTML = '<h4>Bakiyeler:</h4>';
        
        balances.forEach(balance => {
            const div = document.createElement('div');
            div.className = 'balance-item';
            const net = parseFloat(balance.net);
            const color = net >= 0 ? '#28a745' : '#dc3545';
            div.innerHTML = `
                <span>${balance.user_id}</span>
                <span style="color: ${color}">₺${balance.net}</span>
            `;
            balancesDiv.appendChild(div);
        });
    }

    // WebSocket Connection
    connectWebSocket() {
        const wsUrl = `ws://localhost:8000/ws/${this.roomId}/${this.userId}`;
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
            // Reconnect after 3 seconds
            setTimeout(() => this.connectWebSocket(), 3000);
        };
    }

    sendWebSocketEvent(type, data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type, ...data }));
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'chat':
                this.addChatMessage(data.user_id, data.message);
                break;
            case 'emoji':
                this.addChatMessage(data.user_id, data.emoji);
                break;
            case 'play_pause':
                // Sync play/pause state
                this.isPlaying = data.action === 'play';
                this.currentTime = data.position;
                this.updateProgress();
                break;
            case 'seek':
                // Sync position
                this.currentTime = data.position;
                this.updateProgress();
                break;
        }
    }

    // Utility
    startTimer() {
        // Mock countdown timer
        const countdownElement = document.getElementById('countdown');
        let timeLeft = 3600; // 1 hour
        
        setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                countdownElement.textContent = 'Başladı!';
                return;
            }
            
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    showNotification(message) {
        // Simple notification
        alert(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TVPlusApp();
});
