// Core rendering functionality
import { CONFIG } from '../config.js';
import { GroundSystem } from './ground.js';
import { DecorationSystem } from './decorations.js';
import { ParticleSystem } from './particles.js';
import { TextureUtils } from './texture-utils.js';

export const CoreRenderer = {
    // Initialize Three.js components
    init: function() {
        // Create Three.js scene
        CONFIG.scene = new THREE.Scene();
        
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Set background color based on level theme
        CONFIG.scene.background = new THREE.Color(currentTheme.skyColor || CONFIG.colors.sky);
        
        // Set up Easter-themed fog in enhanced mode
        if (CONFIG.enhancedGraphics) {
            CONFIG.scene.fog = new THREE.FogExp2(currentTheme.fogColor || 0xC2E7FF, currentTheme.fogDensity || 0.03);
        }
        
        // Create camera
        CONFIG.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        CONFIG.camera.position.set(0, 10, 0);
        CONFIG.camera.lookAt(0, 0, 0);
        
        // Create renderer
        CONFIG.renderer = new THREE.WebGLRenderer({ antialias: CONFIG.enhancedGraphics });
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Enable shadows and better rendering in enhanced mode
        if (CONFIG.enhancedGraphics) {
            CONFIG.renderer.shadowMap.enabled = true;
            CONFIG.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            CONFIG.renderer.outputEncoding = THREE.sRGBEncoding;
        }
        
        document.getElementById('game-container').appendChild(CONFIG.renderer.domElement);
        
        // Setup lights
        this.setupLights();
        
        // Initialize subsystems
        GroundSystem.init();
        
        // Add Easter decorations if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            DecorationSystem.init();
            ParticleSystem.init();
        }
        
        // Handle window resizing
        window.addEventListener('resize', this.handleResize);
    },
    
    // Setup lights in the scene
    setupLights: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Base ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, CONFIG.enhancedGraphics ? 0.5 : 0.6);
        CONFIG.scene.add(ambientLight);
        
        if (CONFIG.enhancedGraphics) {
            // Enhanced lighting setup
            const sunLight = new THREE.DirectionalLight(0xFFFFAA, currentTheme.lightIntensity || 0.9);
            sunLight.position.set(10, 20, 10);
            sunLight.castShadow = true;
            
            // Improve shadow quality
            sunLight.shadow.mapSize.width = 1024;
            sunLight.shadow.mapSize.height = 1024;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = 50;
            sunLight.shadow.camera.left = -15;
            sunLight.shadow.camera.right = 15;
            sunLight.shadow.camera.top = 15;
            sunLight.shadow.camera.bottom = -15;
            
            CONFIG.scene.add(sunLight);
            
            // Add a secondary light for better color - use fog color for an atmospheric effect
            const fillLightColor = currentTheme.fogColor || 0xC2E7FF;
            const fillLight = new THREE.DirectionalLight(fillLightColor, 0.4);
            fillLight.position.set(-10, 10, -10);
            CONFIG.scene.add(fillLight);
        } else {
            // Basic lighting for performance mode
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 20, 10);
            CONFIG.scene.add(directionalLight);
        }
    },
    
    // Handle window resize
    handleResize: function() {
        CONFIG.camera.aspect = window.innerWidth / window.innerHeight;
        CONFIG.camera.updateProjectionMatrix();
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    // Main rendering loop
    render: function() {
        // Animate Easter decorations if enhanced graphics are enabled
        if (CONFIG.enhancedGraphics) {
            DecorationSystem.animate();
            ParticleSystem.animate();
        }
        
        CONFIG.renderer.render(CONFIG.scene, CONFIG.camera);
    },
    
    // Clear scene when changing levels
    clearScene: function() {
        // Remove all objects
        while(CONFIG.scene.children.length > 0) { 
            CONFIG.scene.remove(CONFIG.scene.children[0]); 
        }
        
        // Recreate basic elements
        this.setupLights();
        GroundSystem.init();
        
        // Recreate decorations if enhanced graphics is enabled
        if (CONFIG.enhancedGraphics) {
            DecorationSystem.init();
            ParticleSystem.init();
        }
    }
};