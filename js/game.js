// Hovedspillmodul som koordinerer spillet
const GameModule = {
    // Initalisering av spillet
    init: function() {
        // Initialiser renderer og scene
        RendererModule.init();
        
        // Last inn første nivå
        this.loadLevel();
        
        // Sett opp kontroller
        PlayerModule.setupControls();
        
        // Start animasjonsløkken
        this.animate();
        
        // Vis velkomstmelding for første nivå
        UIModule.showWelcomeMessage();
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
        
        // Last inn første nivå
        this.loadLevel();
        
        // Vis velkomstmelding
        UIModule.showWelcomeMessage();
    },
    
    // Animasjonsløkke
    animate: function() {
        requestAnimationFrame(() => this.animate());
        
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

// Start spillet når siden er lastet
window.onload = function() {
    GameModule.init();
};