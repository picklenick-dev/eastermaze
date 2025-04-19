// filepath: c:\Development\easter-labrynth\js\config.js
// Globale spillvariabler og konfigurasjoner
export const CONFIG = {
    // Felles variabler
    scene: null,
    camera: null,
    renderer: null,
    
    // Spilltilstand
    currentLevel: 1,
    totalLevels: 10,
    eggsFound: 0,
    totalEggs: 0,
    isGameOver: false,
    isLevelCompleted: false,
    
    // Krokodille-relaterte variabler
    retryAvailable: true,
    currentLevelRetried: false,
    
    // Timer-relaterte variabler
    timerActive: false,
    startTime: null,
    remainingTime: 0,
    levelTimeLimits: {
        1: 60,  // 60 sekunder for nivå 1
        2: 90,  // 90 sekunder for nivå 2
        3: 120, // 120 sekunder for nivå 3
        4: 150, // 150 sekunder for nivå 4
        5: 180, // 180 sekunder for nivå 5
        6: 210, // 210 sekunder for nivå 6
        7: 240, // 240 sekunder for nivå 7
        8: 270, // 270 sekunder for nivå 8
        9: 300, // 300 sekunder for nivå 9
        10: 360 // 360 sekunder for nivå 10
    },
    
    // Lyd-relaterte innstillinger
    soundEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    
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