// filepath: c:\Development\easter-labrynth\js\config.js
// Globale spillvariabler og konfigurasjoner
export const CONFIG = {
    // Felles variabler
    scene: null,
    camera: null,
    renderer: null,
    
    // Spilltilstand
    currentLevel: 1,
    totalLevels: 3,
    eggsFound: 0,
    totalEggs: 0,
    isGameOver: false,
    isLevelCompleted: false,
    
    // Bevegelse
    keyState: {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    },
    
    // Fargepalett for påske
    colors: {
        walls: 0x8B4513,      // Brun
        ground: 0x7CFC00,     // Lysegrønn
        player: 0xFFD700,     // Gull
        eggColors: [0xFF69B4, 0x00FFFF, 0xFFFF00, 0x32CD32, 0xFF4500, 0x9370DB], // Forskjellige farger
        sky: 0x87CEEB         // Himmelblå
    }
};