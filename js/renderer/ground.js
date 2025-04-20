// Ground system for rendering the ground plane
import { CONFIG } from '../config.js';

export const GroundSystem = {
    // Initialize the ground
    init: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        if (CONFIG.enhancedGraphics) {
            // Enhanced ground with texture for Easter theme
            const groundSize = 100;
            const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 32, 32);
            
            // Create a canvas for the ground texture
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Use theme-specific ground color
            const groundColorHex = currentTheme.groundColor.toString(16).padStart(6, '0');
            ctx.fillStyle = `#${groundColorHex}`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add some texture variation - darker shade of the ground color
            const darkerShade = new THREE.Color(currentTheme.groundColor).multiplyScalar(0.9);
            const darkerHex = Math.floor(darkerShade.r * 255).toString(16).padStart(2, '0') + 
                             Math.floor(darkerShade.g * 255).toString(16).padStart(2, '0') + 
                             Math.floor(darkerShade.b * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = `#${darkerHex}`;
            
            for (let i = 0; i < 100; i++) {
                const size = 5 + Math.random() * 15;
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.beginPath();
                ctx.ellipse(x, y, size, size/2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const groundTexture = new THREE.CanvasTexture(canvas);
            groundTexture.wrapS = THREE.RepeatWrapping;
            groundTexture.wrapT = THREE.RepeatWrapping;
            groundTexture.repeat.set(10, 10);
            
            const groundMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xFFFFFF,
                map: groundTexture,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.5;
            ground.receiveShadow = true;
            CONFIG.scene.add(ground);
        } else {
            // Simple ground for performance mode
            const groundGeometry = new THREE.PlaneGeometry(100, 100);
            const groundMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.colors.ground });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -0.5;
            CONFIG.scene.add(ground);
        }
    }
};