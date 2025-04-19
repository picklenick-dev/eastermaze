// filepath: c:\Development\easter-labrynth\js\highscore.js
// High score og poeng-system for spillet
import { CONFIG } from './config.js';
import { UIModule } from './ui.js';

export const HighScoreModule = {
    // Initialize the high score system
    init: function() {
        // Only load from cloud
        this.loadHighScoresFromCloud()
            .then(() => {
                // Load player name still from localStorage (not related to high scores)
                this.loadPlayerName();
                this.resetLevelScore();
            });
        
        // Add event listener for the leaderboard close button
        document.getElementById('close-leaderboard-btn')?.addEventListener('click', () => {
            document.getElementById('leaderboard').style.display = 'none';
        });
    },
    
    // Reset level-specific score information
    resetLevelScore: function() {
        CONFIG.levelScore = 0;  // Reset only the level score
        CONFIG.comboCount = 0;
        CONFIG.comboMultiplier = 1;
        CONFIG.lastEggTime = 0;
        this.updateScoreDisplay();
        this.updateComboDisplay();
    },
    
    // Update the score when an egg is collected
    addEggPoints: function() {
        const now = Date.now();
        const baseEggPoints = 100;
        
        // Check if combo is active (egg collected within time window)
        if (CONFIG.lastEggTime > 0 && (now - CONFIG.lastEggTime) < CONFIG.comboTimeWindow) {
            // Increase combo count and multiplier when eggs are collected in succession
            CONFIG.comboCount++;
            CONFIG.comboMultiplier = 1 + (CONFIG.comboCount * 0.5); // x1.5, x2, x2.5, etc.
            
            // Flash the combo text to highlight increase
            const comboElement = document.getElementById('combo');
            comboElement.classList.remove('combo-flash');
            setTimeout(() => comboElement.classList.add('combo-flash'), 10);
            
            // Keep track of the max combo for level completion bonus
            if (CONFIG.comboCount > CONFIG.maxCombo) {
                CONFIG.maxCombo = CONFIG.comboCount;
            }
        } else {
            // Reset combo if too much time has passed
            CONFIG.comboCount = 0;
            CONFIG.comboMultiplier = 1;
        }
        
        // Update last egg collection time
        CONFIG.lastEggTime = now;
        
        // Add points with combo multiplier
        const points = Math.round(baseEggPoints * CONFIG.comboMultiplier);
        CONFIG.score += points;
        CONFIG.levelScore += points;
        CONFIG.totalScore += points; // Update total score as well
        
        // Update UI
        this.updateScoreDisplay();
        this.updateComboDisplay();
        
        // Start the combo timer animation
        this.startComboTimer();
        
        return points;
    },
    
    // Add time bonus when completing a level
    addTimeBonus: function() {
        // Points based on remaining time (10 points per second)
        const timeBonus = CONFIG.remainingTime * 10;
        
        // Add bonus for not losing lives (100 points per life)
        const lifeBonus = CONFIG.playerLives * 100;
        
        // Combo bonus based on max combo achieved
        const comboBonus = CONFIG.maxCombo * 50;
        
        // Add bonuses to score
        const totalBonus = timeBonus + lifeBonus + comboBonus;
        CONFIG.score += totalBonus;
        CONFIG.levelScore += totalBonus;
        CONFIG.totalScore += CONFIG.levelScore;
        
        // Update UI
        this.updateScoreDisplay();
        
        return {
            timeBonus: timeBonus,
            lifeBonus: lifeBonus,
            comboBonus: comboBonus,
            totalBonus: totalBonus
        };
    },
    
    // Start the combo timer animation (visual countdown)
    startComboTimer: function() {
        // Reset the timer bar
        const comboBar = document.getElementById('combo-bar');
        comboBar.style.width = '100%';
        
        // Animate countdown only if combo exists
        if (CONFIG.comboCount > 0) {
            // Clear any existing combo timer
            if (this.comboTimerId) {
                clearInterval(this.comboTimerId);
            }
            
            const startTime = Date.now();
            const duration = CONFIG.comboTimeWindow;
            
            this.comboTimerId = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, duration - elapsed);
                const percent = (remaining / duration) * 100;
                
                comboBar.style.width = `${percent}%`;
                
                // If combo timer runs out, reset combo
                if (remaining <= 0) {
                    clearInterval(this.comboTimerId);
                    CONFIG.comboCount = 0;
                    CONFIG.comboMultiplier = 1;
                    this.updateComboDisplay();
                }
            }, 50); // Update every 50ms for smooth animation
        }
    },
    
    // Update the score display
    updateScoreDisplay: function() {
        document.getElementById('score-display').textContent = CONFIG.totalScore;
    },
    
    // Update the combo display
    updateComboDisplay: function() {
        const comboText = CONFIG.comboCount > 0 
            ? `x${CONFIG.comboMultiplier.toFixed(1)}` 
            : 'x1.0';
        document.getElementById('combo-display').textContent = comboText;
        
        // Update the combo bar visibility
        if (CONFIG.comboCount === 0) {
            document.getElementById('combo-bar').style.width = '0%';
        }
    },
    
    // Save high scores to localStorage
    saveHighScores: function() {
        localStorage.setItem('easterLabyrinth_highScores', JSON.stringify(CONFIG.highScores));
    },
    
    // Load high scores from localStorage
    loadHighScores: function() {
        const scores = localStorage.getItem('easterLabyrinth_highScores');
        if (scores) {
            CONFIG.highScores = JSON.parse(scores);
        } else {
            CONFIG.highScores = []; // Initialize empty array if no scores exist
        }
    },
    
    // Add a new high score entry
    addHighScore: function(name, score, level) {
        // Sanitize the name to prevent JSON issues
        const sanitizedName = this.sanitizePlayerName(name);
        
        const newScore = {
            name: sanitizedName,
            score: score,
            level: level,
            date: new Date().toISOString()
        };
        
        CONFIG.highScores.push(newScore);
        
        // Sort high scores (highest first)
        CONFIG.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 50 scores
        if (CONFIG.highScores.length > 50) {
            CONFIG.highScores = CONFIG.highScores.slice(0, 50);
        }
        
        // Save directly to cloud immediately
        this.saveHighScoresToCloud();
        
        return CONFIG.highScores.findIndex(entry => entry === newScore) + 1; // Position (1-based)
    },
    
    // Sanitize player name to ensure it's safe for JSON
    sanitizePlayerName: function(name) {
        // Trim and limit length to 24 characters
        let sanitized = name.trim().slice(0, 24);
        
        // Replace characters that might cause issues in JSON
        sanitized = sanitized.replace(/["\\\/\b\f\n\r\t]/g, '');
        
        // Default name if empty
        if (!sanitized) {
            sanitized = 'Anonym kanin';
        }
        
        return sanitized;
    },
    
    // Save player name to localStorage
    savePlayerName: function(name) {
        const sanitizedName = this.sanitizePlayerName(name);
        CONFIG.playerName = sanitizedName;
        localStorage.setItem('easterLabyrinth_playerName', sanitizedName);
    },
    
    // Load player name from localStorage
    loadPlayerName: function() {
        const savedName = localStorage.getItem('easterLabyrinth_playerName');
        if (savedName) {
            CONFIG.playerName = savedName;
        }
    },
    
    // Show high scores in leaderboard UI
    showLeaderboard: function(currentScore = null, highlightCurrentScore = false) {
        let leaderboardElement = document.getElementById('leaderboard');
        
        // Create the leaderboard element if it doesn't exist
        if (!leaderboardElement) {
            leaderboardElement = document.createElement('div');
            leaderboardElement.id = 'leaderboard';
            leaderboardElement.className = 'message-overlay';
            leaderboardElement.style.display = 'none';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            const heading = document.createElement('h2');
            heading.textContent = 'Poengtavle';
            
            const entriesDiv = document.createElement('div');
            entriesDiv.id = 'leaderboard-entries';
            
            const closeButton = document.createElement('button');
            closeButton.id = 'close-leaderboard-btn';
            closeButton.textContent = 'Lukk';
            
            // Add event listener for the close button
            closeButton.addEventListener('click', () => {
                leaderboardElement.style.display = 'none';
            });
            
            contentDiv.appendChild(heading);
            contentDiv.appendChild(entriesDiv);
            contentDiv.appendChild(closeButton);
            leaderboardElement.appendChild(contentDiv);
            
            document.body.appendChild(leaderboardElement);
        }
        
        const entriesElement = document.getElementById('leaderboard-entries');
        
        // If entries element doesn't exist, create it
        if (!entriesElement) {
            const entriesDiv = document.createElement('div');
            entriesDiv.id = 'leaderboard-entries';
            
            const contentDiv = leaderboardElement.querySelector('.message-content');
            if (contentDiv) {
                const heading = contentDiv.querySelector('h2');
                if (heading) {
                    heading.insertAdjacentElement('afterend', entriesDiv);
                } else {
                    contentDiv.appendChild(entriesDiv);
                }
            } else {
                leaderboardElement.appendChild(entriesDiv);
            }
        }
        
        // Ensure we have a valid reference to the entries element
        const validEntriesElement = document.getElementById('leaderboard-entries');
        
        // Clear existing entries
        if (validEntriesElement) {
            validEntriesElement.innerHTML = '';
            
            if (CONFIG.highScores.length === 0 && !currentScore) {
                validEntriesElement.innerHTML = '<p>Ingen poeng registrert ennå</p>';
            } else {
                // Create a copy of high scores to work with
                let scores = [...CONFIG.highScores];
                
                // Add current score temporarily for display if provided and not already in the list
                let currentScoreIndex = -1;
                if (currentScore && !highlightCurrentScore) {
                    // Only add current score temporarily if we're not already highlighting it
                    // (which means it has already been saved)
                    const tempScore = {
                        name: CONFIG.playerName,
                        score: currentScore,
                        level: CONFIG.currentLevel,
                        date: new Date().toISOString(),
                        isCurrentScore: true
                    };
                    
                    scores.push(tempScore);
                    scores.sort((a, b) => b.score - a.score);
                    currentScoreIndex = scores.findIndex(s => s.isCurrentScore);
                } else if (currentScore && highlightCurrentScore) {
                    // If we're highlighting an already saved score, find it in the array
                    currentScoreIndex = scores.findIndex(s => 
                        s.score === currentScore && 
                        s.level === CONFIG.currentLevel);
                    
                    // Mark it for highlighting
                    if (currentScoreIndex >= 0) {
                        scores[currentScoreIndex].isCurrentScore = true;
                    }
                }
                
                // Only display top 50 scores
                const displayLimit = 50;
                const displayCount = Math.min(scores.length, displayLimit);
                
                // Render each score entry
                for (let i = 0; i < displayCount; i++) {
                    // Skip if not in top 50 and not the current score
                    if (i >= displayLimit && i !== currentScoreIndex) continue;
                    
                    const score = scores[i];
                    const entry = document.createElement('div');
                    entry.className = 'leaderboard-entry';
                    if (score.isCurrentScore && highlightCurrentScore) {
                        entry.classList.add('highlight-entry');
                    }
                    
                    const rank = document.createElement('div');
                    rank.className = 'leaderboard-rank';
                    rank.textContent = (i + 1) + '.';
                    
                    const name = document.createElement('div');
                    name.className = 'leaderboard-name';
                    name.textContent = score.name;
                    
                    const scoreElement = document.createElement('div');
                    scoreElement.className = 'leaderboard-score';
                    scoreElement.textContent = score.score;
                    
                    entry.appendChild(rank);
                    entry.appendChild(name);
                    entry.appendChild(scoreElement);
                    validEntriesElement.appendChild(entry);
                }
            }
            
            // If we have a current score and need a name input, show the form
            if (currentScore !== null && !highlightCurrentScore) {
                const formDiv = document.createElement('div');
                formDiv.className = 'player-name-form';
                formDiv.innerHTML = `
                    <p>Legg til ditt nye resultat på poengtavlen:</p>
                    <input type="text" id="player-name-input" placeholder="Anonym kanin" value="" maxlength="24">
                    <button id="lagre-score-btn">Lagre</button>
                `;
                validEntriesElement.insertAdjacentElement('afterend', formDiv);
                
                // Focus on the name input for immediate typing
                setTimeout(() => {
                    const nameInput = document.getElementById('player-name-input');
                    if (nameInput) nameInput.focus();
                }, 100);
                
                // Add event listener to save score
                document.getElementById('lagre-score-btn').addEventListener('click', () => {
                    const saveButton = document.getElementById('lagre-score-btn');
                    saveButton.disabled = true;
                    saveButton.textContent = 'Lagrer...';
                    
                    const nameInput = document.getElementById('player-name-input');
                    const playerName = nameInput.value.trim() || 'Anonym kanin';
                    
                    // Save the player name for future use
                    this.savePlayerName(playerName);
                    
                    // Add the score and refresh the leaderboard
                    const position = this.addHighScore(playerName, currentScore, CONFIG.currentLevel);
                    
                    // Update button text
                    saveButton.textContent = 'Lagret!';
                    
                    // Remove the form
                    formDiv.remove();
                    
                    // Refresh from cloud and then briefly show the leaderboard with highlighted score
                    this.loadHighScoresFromCloud().then(() => {
                        this.showLeaderboard(currentScore, true);
                        
                        // After a short delay, hide the leaderboard and show the intro screen
                        setTimeout(() => {
                            // Hide the leaderboard
                            document.getElementById('leaderboard').style.display = 'none';
                            
                            // Show the intro screen
                            UIModule.showIntroScreen();
                        }, 2000); // Show the leaderboard for 2 seconds before returning to the menu
                    });
                });
                
                // Also handle Enter key press
                document.getElementById('player-name-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        document.getElementById('save-score-btn').click();
                    }
                });
            }
        } else {
            console.error('Could not find or create leaderboard-entries element');
        }
        
        // Show the leaderboard
        leaderboardElement.style.display = 'flex';
    },
    
    // Save high scores to JSONBin.io
    saveHighScoresToCloud: function() {
        // Skip if there are no scores to save
        if (CONFIG.highScores.length === 0) return Promise.resolve();
        
        // Create a unique ID for the game site
        const siteId = window.location.hostname || 'local-development';
        
        // Use JSONBin.io with your specific bin ID and access key
        return fetch('https://api.jsonbin.io/v3/b/6803b4438960c979a588a4a9', {
            method: 'PUT', // Update the existing bin
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': '$2a$10$MTu7fRVFNHbkhIBhitRdKOaZ66g.Bn35RbXJoLqw/IsCgZyt70a1y'
            },
            body: JSON.stringify({
                siteId: siteId,
                scores: CONFIG.highScores,
                lastUpdated: new Date().toISOString()
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error saving to JSONBin: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Successfully saved scores to JSONBin.io:", data.metadata?.id);
            return data;
        })
        .catch(error => {
            console.error('Error saving high scores to cloud:', error);
            return Promise.reject(error);
        });
    },
    
    // Load high scores from JSONBin.io
    loadHighScoresFromCloud: function() {
        // Create a unique ID for the game site
        const siteId = window.location.hostname || 'local-development';
        
        // Set empty array as default
        CONFIG.highScores = [];
        
        return fetch('https://api.jsonbin.io/v3/b/6803b4438960c979a588a4a9/latest', {
            headers: {
                'X-Access-Key': '$2a$10$MTu7fRVFNHbkhIBhitRdKOaZ66g.Bn35RbXJoLqw/IsCgZyt70a1y'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error loading from JSONBin: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.record && data.record.scores && Array.isArray(data.record.scores)) {
                // Use cloud scores directly
                const cloudScores = [...data.record.scores];
                
                // Sort scores
                cloudScores.sort((a, b) => b.score - a.score);
                
                // Store in CONFIG
                CONFIG.highScores = cloudScores.slice(0, 50);
                console.log(`Loaded ${CONFIG.highScores.length} scores from JSONBin.io`);
            } else {
                console.log('No scores found in JSONBin.io or invalid format');
            }
            return CONFIG.highScores;
        })
        .catch(error => {
            console.error('Error loading high scores from cloud:', error);
            // Still return a resolved promise to not break the chain
            return Promise.resolve(CONFIG.highScores);
        });
    }
};