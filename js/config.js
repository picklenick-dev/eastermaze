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
    crocodilesEnabled: true, // Option to enable or disable crocodiles
    
    // Grafikk-relaterte variabler
    enhancedGraphics: true, // Default is enabled for enhanced Easter graphics
    
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
    
    // Level-spesifikke temaer for vegger og grafikk
    levelThemes: {
        1: {
            name: "Spring Garden",
            wallColor: 0xB19276,
            wallBaseTexture: "#F5E8C0",
            wallPatternColor: "#EFE0B0",
            frameColor: 0x9B7653,
            decorationColors: [0xFFAAAA, 0xAAFFAA, 0xFFFFAA],
            // New distinguishing features
            groundColor: 0x88D169,
            skyColor: 0x87CEEB,
            fogColor: 0xC2E7FF,
            fogDensity: 0.02,
            uniqueDecoration: "flowers", // Special decoration type
            particleEffect: "pollen", // Floating pollen particles
            lightIntensity: 0.9
        },
        2: {
            name: "Forest Meadow",
            wallColor: 0x8D7357,
            wallBaseTexture: "#E8D8B0",
            wallPatternColor: "#D8C8A0",
            frameColor: 0x755C48,
            decorationColors: [0xAAFFAA, 0x99EE99, 0xDDFFBB],
            // New distinguishing features
            groundColor: 0x6DAE56,
            skyColor: 0x8CBED6,
            fogColor: 0xA8C8D8,
            fogDensity: 0.03,
            uniqueDecoration: "mushrooms", // Mushrooms on the ground
            particleEffect: "leafs", // Floating leafs
            lightIntensity: 0.8
        },
        3: {
            name: "Pink Bloom",
            wallColor: 0xAA8866,
            wallBaseTexture: "#FFDCE8",
            wallPatternColor: "#EEBED8",
            frameColor: 0x8B6144,
            decorationColors: [0xFF9999, 0xFFCCDD, 0xFF88BB],
            // New distinguishing features
            groundColor: 0x95D882,
            skyColor: 0xFFDDEE,
            fogColor: 0xFFCCDD,
            fogDensity: 0.025,
            uniqueDecoration: "cherryBlossoms", // Cherry blossom petals
            particleEffect: "petals", // Floating pink petals
            lightIntensity: 1.0
        },
        4: {
            name: "Sky Blue",
            wallColor: 0x7A654D,
            wallBaseTexture: "#D8E8FF",
            wallPatternColor: "#C8D8EE",
            frameColor: 0x8A6D4D,
            decorationColors: [0x99CCFF, 0xAADDFF, 0xBBEEFF],
            // New distinguishing features
            groundColor: 0x7AC95D,
            skyColor: 0x66CCFF,
            fogColor: 0xCCEEFF,
            fogDensity: 0.015,
            uniqueDecoration: "butterflies", // More butterflies
            particleEffect: "bubbles", // Floating bubbles
            lightIntensity: 1.1
        },
        5: {
            name: "Chocolate Rush",
            wallColor: 0x6E4C36,
            wallBaseTexture: "#D2B48C",
            wallPatternColor: "#C19A6B",
            frameColor: 0x5B3A24,
            decorationColors: [0xAA6633, 0xCCBB99, 0xFFCC88],
            // New distinguishing features
            groundColor: 0x73C154,
            skyColor: 0xE8D0AA,
            fogColor: 0xD0B088,
            fogDensity: 0.035,
            uniqueDecoration: "candies", // Candy decorations
            particleEffect: "chocolateSparkles", // Chocolate sparkles
            lightIntensity: 0.85
        },
        6: {
            name: "Lavender Fields",
            wallColor: 0x96836C,
            wallBaseTexture: "#E6E6FA",
            wallPatternColor: "#D6D6EA",
            frameColor: 0x7C6B5A,
            decorationColors: [0xCCAAFF, 0xDDBBFF, 0xBB99EE],
            // New distinguishing features
            groundColor: 0x8ED26A,
            skyColor: 0xBBAADD,
            fogColor: 0xDDCCFF,
            fogDensity: 0.02,
            uniqueDecoration: "lavender", // Lavender plants
            particleEffect: "purpleSparkles", // Purple sparkles
            lightIntensity: 0.95
        },
        7: {
            name: "Mint Fresh",
            wallColor: 0x9B8569,
            wallBaseTexture: "#D5FFEA",
            wallPatternColor: "#C5EEDB",
            frameColor: 0x8B7559,
            decorationColors: [0x88FFCC, 0x99FFDD, 0xAAFFEE],
            // New distinguishing features
            groundColor: 0x67C64F,
            skyColor: 0xAAFFDD,
            fogColor: 0xCCFFEE,
            fogDensity: 0.022,
            uniqueDecoration: "mintLeaves", // Mint leaves
            particleEffect: "greenSparkles", // Green sparkles
            lightIntensity: 1.05
        },
        8: {
            name: "Golden Summer",
            wallColor: 0xA38C6D,
            wallBaseTexture: "#FFFFC0",
            wallPatternColor: "#EEEEB0",
            frameColor: 0x937C5D,
            decorationColors: [0xFFDD88, 0xFFEE99, 0xFFFFAA],
            // New distinguishing features
            groundColor: 0x9ED87A,
            skyColor: 0xFFDD88,
            fogColor: 0xFFEEAA,
            fogDensity: 0.018,
            uniqueDecoration: "sunflowers", // Sunflowers
            particleEffect: "goldDust", // Gold dust particles
            lightIntensity: 1.2
        },
        9: {
            name: "Sunset Glow",
            wallColor: 0x9F876A,
            wallBaseTexture: "#FFEEDD",
            wallPatternColor: "#EEDDCC",
            frameColor: 0x8F775A,
            decorationColors: [0xFFAA88, 0xFFBB99, 0xFFCCAA],
            // New distinguishing features
            groundColor: 0x85CB65,
            skyColor: 0xFF9966,
            fogColor: 0xFFBB99,
            fogDensity: 0.028,
            uniqueDecoration: "lanterns", // Floating lanterns
            particleEffect: "embers", // Floating embers
            lightIntensity: 0.9
        },
        10: {
            name: "Rainbow Celebration",
            wallColor: 0xB19477,
            wallBaseTexture: "#FFFFFF",
            wallPatternColor: "#F0F0F0",
            frameColor: 0xAA8866,
            decorationColors: [0xFF88AA, 0xFFFF88, 0x88FFAA, 0x88CCFF, 0xCC88FF],
            // New distinguishing features
            groundColor: 0xA0DA81,
            skyColor: 0xD8F0FF,
            fogColor: 0xE0F0FF,
            fogDensity: 0.01,
            uniqueDecoration: "rainbowBanners", // Rainbow banners and flags
            particleEffect: "confetti", // Confetti particles
            lightIntensity: 1.3
        }
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