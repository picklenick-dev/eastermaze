// Håndterer brukergrensesnittet
const UIModule = {
    // Oppdaterer poengsummen
    updateScoreDisplay: function() {
        document.getElementById('eggsFound').textContent = CONFIG.eggsFound;
        document.getElementById('totalEggs').textContent = CONFIG.totalEggs;
        document.getElementById('currentLevel').textContent = CONFIG.currentLevel;
    },
    
    // Oppretter og viser melding når nivå er fullført
    showLevelCompletedMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const levelCompletedDiv = document.createElement('div');
        levelCompletedDiv.id = 'level-completed-message';
        levelCompletedDiv.className = 'message-overlay';
        levelCompletedDiv.innerHTML = `
            <div class="message-content">
                <h2>Nivå ${CONFIG.currentLevel} fullført!</h2>
                <p>Du har funnet alle påskeeggene!</p>
                <p>${LEVELS[CONFIG.currentLevel].message || ''}</p>
                <button id="next-level-btn">Neste nivå</button>
            </div>
        `;
        document.body.appendChild(levelCompletedDiv);
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.loadNextLevel();
        });
    },
    
    // Oppretter og viser meldingen når hele spillet er fullført
    showGameCompletedMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const gameCompletedDiv = document.createElement('div');
        gameCompletedDiv.id = 'game-completed-message';
        gameCompletedDiv.className = 'message-overlay';
        gameCompletedDiv.innerHTML = `
            <div class="message-content">
                <h2>Gratulerer!</h2>
                <p>Du har fullført alle nivåene og funnet alle påskeeggene!</p>
                <p>God påske!</p>
                <button id="restart-game-btn">Spill igjen</button>
            </div>
        `;
        document.body.appendChild(gameCompletedDiv);
        
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
    },
    
    // Oppretter og viser velkomstmeldingen for gjeldende nivå
    showWelcomeMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcome-message';
        welcomeDiv.className = 'message-overlay';
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <h2>Nivå ${CONFIG.currentLevel}</h2>
                <p>${currentLevel.message}</p>
                <button id="start-level-btn">Start</button>
            </div>
        `;
        document.body.appendChild(welcomeDiv);
        
        document.getElementById('start-level-btn').addEventListener('click', () => {
            this.removeMessages();
        });
    },
    
    // Fjerner alle meldinger fra DOM
    removeMessages: function() {
        const messages = document.querySelectorAll('.message-overlay');
        messages.forEach(message => {
            message.remove();
        });
    }
};