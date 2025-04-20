// filepath: c:\Development\easter-labrynth\js\ui.js
// Håndterer brukergrensesnittet
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { GameModule } from './game.js';
import { HighScoreModule } from './highscore.js';
import { SoundModule } from './sound.js';

export const UIModule = {
    // Flag to track if debug dropdown is visible
    debugModeActive: false,

    // Oppdaterer poengsummen
    updateScoreDisplay: function() {
        const eggsFound = document.getElementById('eggsFound');
        const totalEggs = document.getElementById('totalEggs');
        const currentLevel = document.getElementById('currentLevel');
        
        if (eggsFound) eggsFound.textContent = CONFIG.eggsFound;
        if (totalEggs) totalEggs.textContent = CONFIG.totalEggs;
        if (currentLevel) currentLevel.textContent = `${CONFIG.currentLevel} av ${CONFIG.totalLevels}`;
    },
    
    // Oppdaterer hjertedisplay (liv)
    updateLivesDisplay: function() {
        const heartsContainer = document.getElementById('hearts-container');
        if (!heartsContainer) return; // Exit if element doesn't exist
        
        const hearts = '❤️'.repeat(CONFIG.playerLives) + '🖤'.repeat(CONFIG.maxPlayerLives - CONFIG.playerLives);
        heartsContainer.textContent = hearts;
        
        // Legg til animasjon hvis spilleren mistet et liv nylig
        if (CONFIG.playerLives < CONFIG.maxPlayerLives) {
            heartsContainer.classList.add('pulse');
            setTimeout(() => {
                const container = document.getElementById('hearts-container');
                if (container) {
                    container.classList.remove('pulse');
                }
            }, 1000);
        }
    },
    
    // Oppdaterer timer-visningen
    updateTimerDisplay: function(seconds) {
        const timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) return; // Exit if element doesn't exist
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = formattedTime;
        
        // Fjern warning-klassen hvis tiden er mer enn 10 sekunder
        if (seconds > 10) {
            timerDisplay.classList.remove('time-warning');
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
                <div class="sound-option">
                    <label>
                        <input type="checkbox" id="crocodiles-toggle" checked>
                        Spill med krokodiller
                    </label>
                </div>
                <div class="sound-option">
                    <label>
                        <input type="checkbox" id="graphics-toggle" checked>
                        Forbedret påskegrafikkk
                    </label>
                </div>
                <div class="button-container">
                    <button id="start-game-btn">Start spillet</button>
                    <button id="view-leaderboard-btn" class="secondary-btn">Vis poengtavle</button>
                </div>
                <div id="level-selector-container" style="display: none;">
                    <label for="level-selector">Velg nivå:</label>
                    <select id="level-selector">
                        ${LEVELS.map((level, index) => `<option value="${index + 1}">Nivå ${index + 1}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
        document.body.appendChild(introDiv);
        
        document.getElementById('start-game-btn').addEventListener('click', () => {
            // Sett lyd-innstillingen basert på checkbox
            CONFIG.soundEnabled = document.getElementById('sound-toggle').checked;
            CONFIG.crocodilesEnabled = document.getElementById('crocodiles-toggle').checked;
            CONFIG.enhancedGraphics = document.getElementById('graphics-toggle').checked;
            this.removeMessages();
            this.showWelcomeMessage();
        });
        
        // Add event listener for the view leaderboard button
        document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
            // Load high scores from cloud before showing leaderboard
            HighScoreModule.loadHighScoresFromCloud().then(() => {
                HighScoreModule.showLeaderboard();
            });
        });

        // Add event listener for Shift key to toggle level selector
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.debugModeActive = true;
                document.getElementById('level-selector-container').style.display = 'block';
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.debugModeActive = false;
                document.getElementById('level-selector-container').style.display = 'none';
            }
        });

        // Add event listener for level selector
        document.getElementById('level-selector').addEventListener('change', (e) => {
            CONFIG.currentLevel = parseInt(e.target.value, 10);
            
            // Load the selected level when dropdown changes
            this.removeMessages();
            GameModule.resetGame();
            GameModule.loadLevel();
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
                <div class="score-summary">
                    <p>Din poengsum:</p>
                    <div class="bonus-row total"><span>Totalpoeng:</span> <span>${CONFIG.totalScore}</span></div>
                </div>
                <button id="save-score-btn">Lagre poengsum</button>
                <button id="restart-game-btn">Start på nytt</button>
            </div>
        `;
        document.body.appendChild(timeUpDiv);
        
        document.getElementById('save-score-btn').addEventListener('click', () => {
            // Disable the button to prevent multiple submissions
            const saveButton = document.getElementById('save-score-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Lagrer...';
            
            // Show input form for the player name
            HighScoreModule.showLeaderboard(CONFIG.totalScore);
        });
        
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
        
        // Try to save scores to the cloud
        HighScoreModule.saveHighScoresToCloud();
    },
    
    // Oppretter og viser melding når nivå er fullført
    showLevelCompletedMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        // Calculate bonus points for level completion
        const bonuses = HighScoreModule.addTimeBonus();
        
        const levelCompletedDiv = document.createElement('div');
        levelCompletedDiv.id = 'level-completed-message';
        levelCompletedDiv.className = 'message-overlay';
        levelCompletedDiv.innerHTML = `
            <div class="message-content">
                <h2>Nivå ${CONFIG.currentLevel} fullført!</h2>
                <p>Du har funnet alle påskeeggene!</p>
                <div class="score-summary">
                    <p>Bonuspoeng:</p>
                    <div class="bonus-row"><span>Gjenstående tid:</span> <span>+${bonuses.timeBonus}</span></div>
                    <div class="bonus-row"><span>Gjenværende liv:</span> <span>+${bonuses.lifeBonus}</span></div>
                    <div class="bonus-row"><span>Maks combo (x${CONFIG.maxCombo}):</span> <span>+${bonuses.comboBonus}</span></div>
                    <div class="bonus-row total"><span>Total bonuspoeng:</span> <span>+${bonuses.totalBonus}</span></div>
                </div>
                <p class="level-score">Nivåpoeng: ${CONFIG.levelScore}</p>
                <p>${LEVELS[CONFIG.currentLevel].message || ''}</p>
                <button id="next-level-btn">Neste nivå</button>
                <button id="show-leaderboard-btn">Vis poengtavle</button>
            </div>
        `;
        document.body.appendChild(levelCompletedDiv);
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.loadNextLevel();
        });
        
        document.getElementById('show-leaderboard-btn').addEventListener('click', () => {
            HighScoreModule.showLeaderboard();
        });
    },
    
    // Oppretter og viser meldingen når hele spillet er fullført
    showGameCompletedMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        // Play game completion sound
        SoundModule.playGameComplete();
        
        // Calculate final bonus
        const finalBonus = CONFIG.currentLevel * 1000; // 1000 points per completed level
        CONFIG.totalScore += finalBonus;
        
        const gameCompletedDiv = document.createElement('div');
        gameCompletedDiv.id = 'game-completed-message';
        gameCompletedDiv.className = 'message-overlay';
        gameCompletedDiv.innerHTML = `
            <div class="message-content">
                <h2>Gratulerer! 🎉🥚🎊</h2>
                <p>Du har fullført alle 10 nivåene og funnet alle påskeeggene!</p>
                <p>Du er en ekte påskemester!</p>
                <div class="score-summary">
                    <p>Din sluttpoengsum:</p>
                    <div class="bonus-row"><span>Spillpoeng:</span> <span>${CONFIG.totalScore - finalBonus}</span></div>
                    <div class="bonus-row"><span>Fullført spill bonus:</span> <span>+${finalBonus}</span></div>
                    <div class="bonus-row total"><span>Totalpoeng:</span> <span>${CONFIG.totalScore}</span></div>
                </div>
                <p>Skriv inn navnet ditt for å lagre din poengsum på poengtavlen!</p>
                <div class="name-input-container">
                    <input type="text" id="completion-name-input" placeholder="Ditt navn" value="${CONFIG.playerName}" maxlength="24">
                </div>
                <p>God påske og takk for at du spilte Påskelabyrinten!</p>
                <button id="save-score-btn">Lagre poengsum</button>
                <button id="view-leaderboard-btn">Vis poengtavle</button>
                <button id="restart-game-btn">Spill igjen</button>
            </div>
        `;
        document.body.appendChild(gameCompletedDiv);
        
        // Focus on name input
        setTimeout(() => {
            const nameInput = document.getElementById('completion-name-input');
            if (nameInput) nameInput.focus();
        }, 100);
        
        // Save score when button is clicked
        document.getElementById('save-score-btn').addEventListener('click', () => {
            // Disable the button to prevent multiple submissions
            const saveButton = document.getElementById('save-score-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Lagrer...';
            
            const nameInput = document.getElementById('completion-name-input');
            const playerName = nameInput.value.trim() || 'Anonym kanin';
            
            // Save the player name for future use
            HighScoreModule.savePlayerName(playerName);
            
            // Add the score and show leaderboard
            HighScoreModule.addHighScore(playerName, CONFIG.totalScore, CONFIG.currentLevel);
            
            // Show a confirmation that the score was saved
            const messagePara = document.createElement('p');
            messagePara.className = 'score-saved-message';
            messagePara.textContent = 'Poengsum lagret!';
            messagePara.style.color = '#4CAF50';
            messagePara.style.fontWeight = 'bold';
            
            const nameContainer = document.querySelector('.name-input-container');
            if (nameContainer && !document.querySelector('.score-saved-message')) {
                nameContainer.insertAdjacentElement('afterend', messagePara);
            }
            
            // Update button text to show completion
            saveButton.textContent = 'Lagret!';
            
            // Also show the leaderboard with the newly added score (passing true to highlight it)
            setTimeout(() => {
                HighScoreModule.loadHighScoresFromCloud().then(() => {
                    HighScoreModule.showLeaderboard(CONFIG.totalScore, true);
                    
                    // After a short delay, hide the leaderboard and show the intro screen
                    setTimeout(() => {
                        // Hide the leaderboard
                        document.getElementById('leaderboard').style.display = 'none';
                        
                        // Show the intro screen
                        this.removeMessages();
                        this.showIntroScreen();
                    }, 2000); // Show the leaderboard for 2 seconds before returning to the menu
                });
            }, 500);
        });
        
        // Handle Enter key in name input
        document.getElementById('completion-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                // Get a reference to the button directly
                const saveButton = document.getElementById('save-score-btn');
                if (saveButton) {
                    // Explicitly call the click handler manually instead of using click()
                    const nameInput = document.getElementById('completion-name-input');
                    const playerName = nameInput.value.trim() || 'Anonym kanin';
                    
                    // Disable the button to prevent multiple submissions
                    saveButton.disabled = true;
                    saveButton.textContent = 'Lagrer...';
                    
                    // Save the player name for future use
                    HighScoreModule.savePlayerName(playerName);
                    
                    // Add the score and show leaderboard
                    HighScoreModule.addHighScore(playerName, CONFIG.totalScore, CONFIG.currentLevel);
                    
                    // Show a confirmation that the score was saved
                    const messagePara = document.createElement('p');
                    messagePara.className = 'score-saved-message';
                    messagePara.textContent = 'Poengsum lagret!';
                    messagePara.style.color = '#4CAF50';
                    messagePara.style.fontWeight = 'bold';
                    
                    const nameContainer = document.querySelector('.name-input-container');
                    if (nameContainer && !document.querySelector('.score-saved-message')) {
                        nameContainer.insertAdjacentElement('afterend', messagePara);
                    }
                    
                    // Update button text to show completion
                    saveButton.textContent = 'Lagret!';
                    
                    // Show the leaderboard with the newly added score
                    setTimeout(() => {
                        HighScoreModule.loadHighScoresFromCloud().then(() => {
                            HighScoreModule.showLeaderboard(CONFIG.totalScore, true);
                            
                            // After a short delay, hide the leaderboard and show the intro screen
                            setTimeout(() => {
                                // Hide the leaderboard
                                document.getElementById('leaderboard').style.display = 'none';
                                
                                // Show the intro screen
                                UIModule.removeMessages();
                                UIModule.showIntroScreen();
                            }, 2000);
                        });
                    }, 500);
                } else {
                    // If button not found, just try to click it anyway (fallback)
                    document.getElementById('save-score-btn').click();
                }
            }
        });
        
        // View leaderboard button
        document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
            HighScoreModule.showLeaderboard(CONFIG.totalScore);
        });
        
        // Restart button
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
        
        // Try to save scores to the cloud
        HighScoreModule.saveHighScoresToCloud();
        
        CONFIG.isGameOver = true;
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
    
    // Oppretter og viser melding når spilleren har mistet alle liv
    showNoLivesMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const noLivesDiv = document.createElement('div');
        noLivesDiv.id = 'no-lives-message';
        noLivesDiv.className = 'message-overlay';
        noLivesDiv.innerHTML = `
            <div class="message-content">
                <h2>Ingen liv igjen!</h2>
                <p>Å nei! Kaninen har blitt spist av krokodillene for mange ganger.</p>
                <div class="score-summary">
                    <p>Din endelige poengsum:</p>
                    <div class="bonus-row total"><span>Poeng:</span> <span>${CONFIG.totalScore}</span></div>
                </div>
                <p>Du har ikke flere liv igjen og må starte på nytt.</p>
                <button id="save-score-btn">Lagre poengsum</button>
                <button id="restart-game-btn">Start på nytt</button>
            </div>
        `;
        document.body.appendChild(noLivesDiv);
        
        // Event listener for saving score
        document.getElementById('save-score-btn').addEventListener('click', () => {
            // Disable the button to prevent multiple submissions
            const saveButton = document.getElementById('save-score-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Lagrer...';
            
            // Show input form for the player name
            HighScoreModule.showLeaderboard(CONFIG.totalScore);
        });
        
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
        
        // Try to save scores to the cloud
        HighScoreModule.saveHighScoresToCloud();
    },
    
    // Oppretter og viser melding når spilleren blir spist av en krokodille
    showCrocodileDeathMessage: function() {
        // Fjern eventuelle eksisterende meldinger
        this.removeMessages();
        
        const crocodileDeathDiv = document.createElement('div');
        crocodileDeathDiv.id = 'crocodile-death-message';
        crocodileDeathDiv.className = 'message-overlay';
        
        // Sjekk om spilleren har et retry tilgjengelig
        if (CONFIG.retryAvailable && !CONFIG.currentLevelRetried) {
            crocodileDeathDiv.innerHTML = `
                <div class="message-content">
                    <h2>Spist av en krokodille!</h2>
                    <p>Å nei! Kaninen ble spist av en av de farlige krokodillene!</p>
                    <div class="score-summary">
                        <p>Din poengsum så langt:</p>
                        <div class="bonus-row total"><span>Poeng:</span> <span>${CONFIG.totalScore}</span></div>
                    </div>
                    <p>Du har én mulighet til å prøve dette nivået på nytt.</p>
                    <button id="retry-level-btn">Prøv igjen</button>
                    <button id="save-score-btn">Lagre poengsum</button>
                    <button id="restart-game-btn">Start på nytt</button>
                </div>
            `;
        } else {
            crocodileDeathDiv.innerHTML = `
                <div class="message-content">
                    <h2>Spist av en krokodille!</h2>
                    <p>Å nei! Kaninen ble spist av en av de farlige krokodillene!</p>
                    <div class="score-summary">
                        <p>Din endelige poengsum:</p>
                        <div class="bonus-row total"><span>Poeng:</span> <span>${CONFIG.totalScore}</span></div>
                    </div>
                    <p>Vær forsiktig og pass på krokodillene neste gang!</p>
                    <button id="save-score-btn">Lagre poengsum</button>
                    <button id="restart-game-btn">Start på nytt</button>
                </div>
            `;
            
            // Try to save scores to the cloud when the game is actually over
            HighScoreModule.saveHighScoresToCloud();
        }
        
        document.body.appendChild(crocodileDeathDiv);
        
        // Event listener for saving score
        document.getElementById('save-score-btn').addEventListener('click', () => {
            // Disable the button to prevent multiple submissions
            const saveButton = document.getElementById('save-score-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Lagrer...';
            
            // Show input form for the player name
            HighScoreModule.showLeaderboard(CONFIG.totalScore);
        });
        
        // Legg til event listener for restart-knapp
        document.getElementById('restart-game-btn').addEventListener('click', () => {
            this.removeMessages();
            GameModule.resetGame();
        });
        
        // Legg til event listener for retry-knapp hvis tilgjengelig
        if (CONFIG.retryAvailable && !CONFIG.currentLevelRetried) {
            document.getElementById('retry-level-btn').addEventListener('click', () => {
                this.removeMessages();
                GameModule.retryCurrentLevel();
            });
        }
    },
    
    // Fjerner alle meldinger fra DOM
    removeMessages: function() {
        const messages = document.querySelectorAll('.message-overlay');
        messages.forEach(message => {
            message.remove();
        });
    }
};