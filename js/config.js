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
    
    // Player lives system
    playerLives: 3,
    maxPlayerLives: 3,
    
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
    
    // Poeng og combo-system
    score: 0,
    totalScore: 0,
    levelScore: 0,
    comboCount: 0,
    maxCombo: 0,
    comboMultiplier: 1,
    lastEggTime: 0,
    comboTimeWindow: 8000, // 5 seconds window for combo
    highScores: [],
    playerName: "Anonym kanin",
    
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
            wallColor: 0xD19276,
            wallBaseTexture: "#F5E8C0",
            wallPatternColor: "#EFE0B0",
            frameColor: 0xA17653,
            decorationColors: [0xFF6666, 0x77FF77, 0xFFFF66],
            // New distinguishing features
            groundColor: 0x88D169,
            skyColor: 0x5FBAED,
            fogColor: 0xC2E7FF,
            fogDensity: 0.02,
            uniqueDecoration: "flowers", // Special decoration type
            particleEffect: "pollen", // Floating pollen particles
            lightIntensity: 1.0
        },
        2: {
            name: "Winter Wonderland", // Snow theme for level 2
            wallColor: 0xEEEEFF,
            wallBaseTexture: "#FFFFFF",
            wallPatternColor: "#E0E9FF",
            frameColor: 0x9AABD8,
            decorationColors: [0xBBDDFF, 0xCCEEFF, 0xDDFFFF],
            // Snow theme features
            groundColor: 0xFFFFFF, // Pure white snow
            skyColor: 0xADD8E6,
            fogColor: 0xE6F0FF,
            fogDensity: 0.04, // Thicker fog for snow effect
            uniqueDecoration: "snowflakes", // Snowflake decorations
            particleEffect: "snowfall", // Falling snow particles
            lightIntensity: 1.2, // Brighter to reflect snow
            isSnowTheme: true // Flag for snow theme
        },
        3: {
            name: "Pink Bloom",
            wallColor: 0xD97766, // More saturated
            wallBaseTexture: "#FFDCE8",
            wallPatternColor: "#FF9EC8", // Brighter pink
            frameColor: 0xA93144, // Darker, more contrast
            decorationColors: [0xFF5577, 0xFFAADD, 0xFF4488],
            // New distinguishing features
            groundColor: 0xEEC1DD, // Light pink, cherry blossom-like ground
            skyColor: 0xFFBBDD, // More saturated pink sky
            fogColor: 0xFFAACC,
            fogDensity: 0.025,
            uniqueDecoration: "cherryBlossoms", // Cherry blossom petals
            particleEffect: "petals", // Floating pink petals
            lightIntensity: 1.0
        },
        4: {
            name: "Sky Blue",
            wallColor: 0x594D35, // Darker for contrast
            wallBaseTexture: "#D8E8FF",
            wallPatternColor: "#A8C8FF", // More saturated blue
            frameColor: 0x705736, // Darker brown
            decorationColors: [0x4499FF, 0x66BBFF, 0x88DDFF], // Brighter blues
            // New distinguishing features
            groundColor: 0x7AC95D,
            skyColor: 0x33AAFF, // Deeper blue
            fogColor: 0xBBDDFF,
            fogDensity: 0.015,
            uniqueDecoration: "butterflies", // More butterflies
            particleEffect: "bubbles", // Floating bubbles
            lightIntensity: 1.1
        },
        5: {
            name: "Chocolate Rush",
            wallColor: 0x502D18, // Darker, richer brown
            wallBaseTexture: "#C29875", // More saturated
            wallPatternColor: "#9E6B3C", // Darker chocolate
            frameColor: 0x3A1A05, // Very dark brown for contrast
            decorationColors: [0x882200, 0xAA6633, 0xDD8844], // Richer browns
            // New distinguishing features
            groundColor: 0xE8C88A, // Sandy golden color for the chocolate theme
            skyColor: 0xE8A066, // More orange tint
            fogColor: 0xD0A066,
            fogDensity: 0.035,
            uniqueDecoration: "candies", // Candy decorations
            particleEffect: "chocolateSparkles", // Chocolate sparkles
            lightIntensity: 0.85
        },
        6: {
            name: "Lavender Fields",
            wallColor: 0x645348, // Darker walls
            wallBaseTexture: "#E6E6FA",
            wallPatternColor: "#B6B6EA", // More saturated lavender
            frameColor: 0x4C3B2A, // Darker frame
            decorationColors: [0xAA66FF, 0xBB77FF, 0x9955DD], // Brighter purples
            // New distinguishing features
            groundColor: 0x6BB247, // Deeper green
            skyColor: 0x9988CC, // More saturated purple
            fogColor: 0xCCBBFF,
            fogDensity: 0.02,
            uniqueDecoration: "lavender", // Lavender plants
            particleEffect: "purpleSparkles", // Purple sparkles
            lightIntensity: 0.95
        },
        7: {
            name: "Arctic Frost", // Second snow theme
            wallColor: 0xCCDDFF,
            wallBaseTexture: "#E5F0FF",
            wallPatternColor: "#D5E5FF",
            frameColor: 0x7788AA, // Blue-tinted frame
            decorationColors: [0xAADDFF, 0x99CCFF, 0xBBEEFF],
            // Arctic theme features
            groundColor: 0xEBF5FF, // Ice-blue snow with more blue tint for ice world
            skyColor: 0x7799BB, // Dark blue sky
            fogColor: 0xCCDDFF,
            fogDensity: 0.05, // Heavy fog for blizzard effect
            uniqueDecoration: "icicles", // Icicle decorations
            particleEffect: "blizzard", // Heavy snow particles
            lightIntensity: 0.9, // Dimmer for blizzard effect
            isSnowTheme: true // Flag for snow theme
        },
        8: {
            name: "Golden Summer",
            wallColor: 0x7D683D, // Darker gold
            wallBaseTexture: "#FFF68F", // Brighter yellow
            wallPatternColor: "#FADA5F", // More saturated gold
            frameColor: 0x604C2D, // Darker frame
            decorationColors: [0xFFCC44, 0xFFDD22, 0xFFEE33], // Brighter golds
            // New distinguishing features
            groundColor: 0x7CB85A, // Deeper green
            skyColor: 0xFFBB33, // More golden sky
            fogColor: 0xFFDD88,
            fogDensity: 0.018,
            uniqueDecoration: "sunflowers", // Sunflowers
            particleEffect: "goldDust", // Gold dust particles
            lightIntensity: 1.2
        },
        9: {
            name: "Sunset Glow",
            wallColor: 0x7F674A, // Darker walls
            wallBaseTexture: "#FFCCAA", // More saturated orange
            wallPatternColor: "#FF9966", // Bright orange
            frameColor: 0x6F573A, // Darker frame
            decorationColors: [0xFF6622, 0xFF8844, 0xFFAA66], // Brighter oranges
            // New distinguishing features
            groundColor: 0x55AB35, // Deeper green for contrast
            skyColor: 0xFF5522, // Strong sunset orange
            fogColor: 0xFF8855,
            fogDensity: 0.028,
            uniqueDecoration: "lanterns", // Floating lanterns
            particleEffect: "embers", // Floating embers
            lightIntensity: 0.9
        },
        10: {
            name: "Rainbow Celebration",
            wallColor: 0x916457, // Darker base
            wallBaseTexture: "#FFFFFF",
            wallPatternColor: "#FFFFFF", // Pure white for maximum contrast
            frameColor: 0x774433, // Darker frame
            decorationColors: [0xFF2277, 0xFFDD22, 0x22FF77, 0x2277FF, 0xAA22FF], // Brighter rainbow colors
            // New distinguishing features
            groundColor: 0x80BA61, // Deeper green
            skyColor: 0xB8E0FF, // Brighter blue
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