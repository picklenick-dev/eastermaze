// filepath: c:\Development\easter-labrynth\js\game.js
// Hovedspillmodul som koordinerer spillet
import { CONFIG } from './config.js';
import { MazeModule } from './maze.js';
import { PlayerModule } from './player.js';
import { EggModule } from './eggs.js';
import { UIModule } from './ui.js';
import { RendererModule } from './renderer.js';
import { SoundModule } from './sound.js';

export const GameModule = {
    // Initalisering av spillet
    init: function() {
        // Initialiser renderer og scene
        RendererModule.init();
        
        // Initialiser lyd
        SoundModule.init();
        
        // Last inn første nivå
        this.loadLevel();
        
        // Sett opp kontroller
        PlayerModule.setupControls();
        
        // Start animasjonsløkken
        this.animate();
        
        // Vis introduksjonsskjerm først
        UIModule.showIntroScreen();
    },
    
    // Last inn et nivå
    loadLevel: function() {
        // Opprette labyrint
        MazeModule.createMaze();
        
        // Opprette spiller
        PlayerModule.createPlayer();
        
        // Opprette påskeegg
        EggModule.createEggs();
        
        // Oppdater UI
        UIModule.updateScoreDisplay();
        
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
        
        // Øk nivånummeret
        CONFIG.currentLevel++;
        
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
        
        // Reset variabler
        CONFIG.currentLevel = 1;
        CONFIG.eggsFound = 0;
        CONFIG.totalEggs = 0;
        CONFIG.isGameOver = false;
        CONFIG.isLevelCompleted = false;
        CONFIG.timerActive = false;
        
        // Last inn første nivå
        this.loadLevel();
        
        // Vis introduksjonsskjerm i stedet for velkomstmelding når spillet restartes
        UIModule.showIntroScreen();
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
        
        // Oppdater veggenes synlighet
        MazeModule.updateWallVisibility();
        
        // Renderer scenen
        RendererModule.render();
    }
};