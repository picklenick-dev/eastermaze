// filepath: c:\Development\easter-labrynth\js\game.js
// Hovedspillmodul som koordinerer spillet
import { CONFIG } from './config.js';
import { MazeModule } from './maze.js';
import { PlayerModule } from './player.js';
import { EggModule } from './eggs.js';
import { UIModule } from './ui.js';
import { RendererModule } from './renderer.js';
import { SoundModule } from './sound.js';
import { CrocodileModule } from './crocodile.js';
import { HighScoreModule } from './highscore.js';

export const GameModule = {
    // Initalisering av spillet
    init: function() {
        // Initialiser renderer og scene
        RendererModule.init();
        
        // Initialiser lyd
        SoundModule.init();
        
        // Initialiser high score system
        HighScoreModule.init();
        
        // Try to load high scores from cloud
        HighScoreModule.loadHighScoresFromCloud().finally(() => {
            // Last inn første nivå
            this.loadLevel();
            
            // Sett opp kontroller
            PlayerModule.setupControls();
            
            // Start animasjonsløkken
            this.animate();
            
            // Vis introduksjonsskjerm først
            UIModule.showIntroScreen();
        });
    },
    
    // Last inn et nivå
    loadLevel: function() {
        // Opprette labyrint
        MazeModule.createMaze();
        
        // Opprette spiller
        PlayerModule.createPlayer();
        
        // Opprette påskeegg
        EggModule.createEggs();
        
        // Opprett krokodiller hvis de er aktivert
        if (CONFIG.crocodilesEnabled) {
            CrocodileModule.createCrocodiles();
        }
        
        // Reset retry status når vi går til nytt nivå
        if (!CONFIG.currentLevelRetried) {
            CONFIG.retryAvailable = true;
        }
        
        // Oppdater UI
        UIModule.updateScoreDisplay();
        UIModule.updateLivesDisplay();
        
        // Reset tilstanden
        CONFIG.isLevelCompleted = false;
        CONFIG.isGameOver = false;
        
        // Initialiser timer for nivået
        this.initializeTimer();
    },
    
    // Initialiser timer for gjeldende nivå
    initializeTimer: function() {
        const currentLevelNumber = CONFIG.currentLevel;
        const timeLimit = CONFIG.levelTimeLimits[currentLevelNumber];
        
        // Sett opp timer-variabler
        CONFIG.timerActive = false;  // Settes til true når nivået starter
        CONFIG.startTime = null;     // Settes når nivået starter
        CONFIG.remainingTime = timeLimit;
        
        // Oppdater timer-visningen
        UIModule.updateTimerDisplay(timeLimit);
    },
    
    // Start timeren for gjeldende nivå
    startTimer: function() {
        if (!CONFIG.timerActive && !CONFIG.isGameOver && !CONFIG.isLevelCompleted) {
            CONFIG.timerActive = true;
            CONFIG.startTime = Date.now();
            
            // Spill startlyd når nivået starter (første gang)
            if (CONFIG.currentLevel === 1) {
                SoundModule.playGameStart();
            }
        }
    },
    
    // Oppdater timeren
    updateTimer: function() {
        if (CONFIG.timerActive && !CONFIG.isGameOver && !CONFIG.isLevelCompleted) {
            const currentLevelNumber = CONFIG.currentLevel;
            const timeLimit = CONFIG.levelTimeLimits[currentLevelNumber];
            const elapsedSeconds = Math.floor((Date.now() - CONFIG.startTime) / 1000);
            
            CONFIG.remainingTime = Math.max(0, timeLimit - elapsedSeconds);
            
            // Oppdatere timer-visningen
            UIModule.updateTimerDisplay(CONFIG.remainingTime);
            
            // Sjekk om tiden har gått ut
            if (CONFIG.remainingTime <= 0) {
                this.handleTimeUp();
            }
            // Advarsel når det er mindre enn 10 sekunder igjen
            else if (CONFIG.remainingTime <= 10) {
                document.getElementById('timer-display').classList.add('time-warning');
            }
        }
    },
    
    // Håndter situasjonen når tiden er ute
    handleTimeUp: function() {
        CONFIG.timerActive = false;
        CONFIG.isGameOver = true;
        
        // Vis "tid ute" melding
        UIModule.showTimeUpMessage();
    },
    
    // Last neste nivå
    loadNextLevel: function() {
        // Fjern gamle objekter
        MazeModule.removeMaze();
        EggModule.removeAllEggs();
        PlayerModule.removePlayer(); // Remove old player from scene
        CrocodileModule.removeAllCrocodiles(); // Fjern alle krokodiller
        
        // Clean up any remaining sparkle particles
        PlayerModule.cleanupSparkles();
        
        // Øk nivånummeret
        CONFIG.currentLevel++;
        
        // Restore player lives to maximum when completing a level
        CONFIG.playerLives = CONFIG.maxPlayerLives;
        
        // Store the current total score
        const currentTotalScore = CONFIG.totalScore;
        
        // Reset level-specific score variables but keep total score
        HighScoreModule.resetLevelScore();
        
        // Restore the total score
        CONFIG.totalScore = currentTotalScore;
        
        // Oppdater UI
        UIModule.updateScoreDisplay();
        
        // Last inn det nye nivået
        this.loadLevel();
        
        // Vis velkomstmelding for det nye nivået
        UIModule.showWelcomeMessage();
        
        // Spill startlyd for det nye nivået
        SoundModule.playGameStart();
    },
    
    // Nullstill spillet
    resetGame: function() {
        // Fjern gamle objekter
        MazeModule.removeMaze();
        EggModule.removeAllEggs();
        PlayerModule.removePlayer(); // Remove old player from scene
        CrocodileModule.removeAllCrocodiles(); // Fjern alle krokodiller
        
        // Clean up any remaining sparkle particles
        PlayerModule.cleanupSparkles();
        
        // Reset variabler
        CONFIG.currentLevel = 1;
        CONFIG.eggsFound = 0;
        CONFIG.totalEggs = 0;
        CONFIG.isGameOver = false;
        CONFIG.isLevelCompleted = false;
        CONFIG.timerActive = false;
        CONFIG.playerLives = CONFIG.maxPlayerLives; // Reset player lives
        CONFIG.currentLevelRetried = false;
        CONFIG.score = 0;
        CONFIG.totalScore = 0;
        CONFIG.levelScore = 0;
        CONFIG.maxCombo = 0;
        
        // Reset combo system
        HighScoreModule.resetLevelScore();
        
        // Last inn første nivå
        this.loadLevel();
        
        // Vis introduksjonsskjerm i stedet for velkomstmelding når spillet restartes
        UIModule.showIntroScreen();
    },
    
    // Retry current level (for when eaten by a crocodile)
    retryCurrentLevel: function() {
        // Fjern gamle objekter
        MazeModule.removeMaze();
        EggModule.removeAllEggs();
        PlayerModule.removePlayer();
        CrocodileModule.removeAllCrocodiles();
        
        // Clean up any remaining sparkle particles
        PlayerModule.cleanupSparkles();
        
        // Mark that the current level has been retried
        CONFIG.currentLevelRetried = true;
        
        // Reset game state but keep current level
        CONFIG.eggsFound = 0;
        CONFIG.totalEggs = 0;
        CONFIG.isGameOver = false;
        CONFIG.isLevelCompleted = false;
        CONFIG.timerActive = false;
        CONFIG.playerLives = CONFIG.maxPlayerLives; // Reset player lives when retrying level
        
        // Reset the score for this level attempt
        CONFIG.levelScore = 0;
        
        // Store the current total score
        const currentTotalScore = CONFIG.totalScore;
        
        // Reset combo without affecting total score
        HighScoreModule.resetLevelScore();
        
        // Restore the total score
        CONFIG.totalScore = currentTotalScore;
        
        // Last inn nivået på nytt
        this.loadLevel();
        
        // Vis velkomstmelding for nivået
        UIModule.showWelcomeMessage();
        
        // Spill startlyd
        SoundModule.playGameStart();
    },
    
    // Animasjonsløkke
    animate: function() {
        requestAnimationFrame(() => this.animate());
        
        // Oppdater timer
        this.updateTimer();
        
        // Oppdater spillerposisjon
        PlayerModule.updatePosition();
        
        // Oppdater eggenes rotasjon
        EggModule.update();
        
        // Oppdater krokodillene på alle nivåer
        CrocodileModule.update();
        
        // Oppdater veggenes synlighet
        MazeModule.updateWallVisibility();
        
        // Renderer scenen
        RendererModule.render();
    }
};