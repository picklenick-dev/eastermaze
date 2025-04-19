// filepath: c:\Development\easter-labrynth\js\ui.js
// Håndterer brukergrensesnittet
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { GameModule } from './game.js';

export const UIModule = {
    // Oppdaterer poengsummen
    updateScoreDisplay: function() {
        document.getElementById('eggsFound').textContent = CONFIG.eggsFound;
        document.getElementById('totalEggs').textContent = CONFIG.totalEggs;
        document.getElementById('currentLevel').textContent = `${CONFIG.currentLevel} av ${CONFIG.totalLevels}`;
    },
    
    // Oppdaterer timer-visningen
    updateTimerDisplay: function(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = formattedTime;
        
        // Fjern warning-klassen hvis tiden er mer enn 10 sekunder
        if (seconds > 10) {
            document.getElementById('timer-display').classList.remove('time-warning');
        }
    },
    
    // Viser introduksjonsskjermen med informasjon om skaperne
    showIntroScreen: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const introDiv = document.createElement('div');
        introDiv.id = 'intro-screen';
        introDiv.className = 'message-overlay';
        introDiv.innerHTML = `
            <div class="message-content intro-content">
                <h2>Påskelabyrinten</h2>
                <p>Laget av Oliver Grant, Ella Louise og Nicklas</p>
                <p>© Påsken 2025</p>
                <p class="intro-description">Hjelp kaninen med å finne alle påskeeggene i labyrinten!</p>
                <div class="sound-option">
                    <label>
                        <input type="checkbox" id="sound-toggle" checked>
                        Spill med lyd
                    </label>
                </div>
                <button id="start-game-btn">Start spillet</button>
            </div>
        `;
        document.body.appendChild(introDiv);
        
        document.getElementById('start-game-btn').addEventListener('click', () => {
            // Sett lyd-innstillingen basert på checkbox
            CONFIG.soundEnabled = document.getElementById('sound-toggle').checked;
            this.removeMessages();
            this.showWelcomeMessage();
        });
    },
    
    // Oppretter og viser melding når tiden er ute
    showTimeUpMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const timeUpDiv = document.createElement('div');
        timeUpDiv.id = 'time-up-message';
        timeUpDiv.className = 'message-overlay';
        timeUpDiv.innerHTML = `
            <div class="message-content">
                <h2>Tiden er ute!</h2>
                <p>Beklager, du rakk ikke å finne alle påskeeggene i tide.</p>
                <p>Du må starte helt fra begynnelsen igjen.</p>
                <button id="restart-game-btn">Start på nytt</button>
            </div>
        `;
        document.body.appendChild(timeUpDiv);
        
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
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
        const timeLimit = CONFIG.levelTimeLimits[CONFIG.currentLevel];
        const minutes = Math.floor(timeLimit / 60);
        const seconds = timeLimit % 60;
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'welcome-message';
        welcomeDiv.className = 'message-overlay';
        welcomeDiv.innerHTML = `
            <div class="message-content">
                <h2>Nivå ${CONFIG.currentLevel}</h2>
                <div class="credits-info">
                    <p><strong>Påskelabyrinten</strong> — Utviklet av Oliver Grant, Ella Louise og Nicklas © 2025</p>
                </div>
                <p>${currentLevel.message}</p>
                <p>Du har ${minutes} minutt${minutes !== 1 ? 'er' : ''} og ${seconds} sekund${seconds !== 1 ? 'er' : ''} på å fullføre nivået!</p>
                <button id="start-level-btn">Start</button>
            </div>
        `;
        document.body.appendChild(welcomeDiv);
        
        document.getElementById('start-level-btn').addEventListener('click', () => {
            this.removeMessages();
            // Start timeren når brukeren klikker på Start-knappen
            GameModule.startTimer();
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