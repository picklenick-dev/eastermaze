// Particle system for handling various particle effects
import { CONFIG } from '../config.js';
import { TextureUtils } from './texture-utils.js';

export const ParticleSystem = {
    // Initialize particle effects based on the current level theme
    init: function() {
        // Get current level theme
        const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
        
        // Add theme-specific particle effects
        if (currentTheme.particleEffect) {
            this.addParticleEffects(currentTheme);
        }
    },
    
    // Animate particle effects
    animate: function() {
        if (this.particles) {
            // Get the particles that match the current level's particle effect
            const currentTheme = CONFIG.levelThemes[CONFIG.currentLevel] || CONFIG.levelThemes[1];
            const particleEffect = currentTheme.particleEffect;
            
            this.particles.children.forEach(particle => {
                switch(particleEffect) {
                    case "pollen":
                        this.animatePollenParticle(particle);
                        break;
                    case "leafs":
                        this.animateLeafParticle(particle);
                        break;
                    case "petals":
                        this.animatePetalParticle(particle);
                        break;
                    case "bubbles":
                        this.animateBubbleParticle(particle);
                        break;
                    case "chocolateSparkles":
                    case "purpleSparkles":
                    case "greenSparkles":
                        this.animateSparkleParticle(particle);
                        break;
                    case "goldDust":
                        this.animateGoldDustParticle(particle);
                        break;
                    case "embers":
                        this.animateEmberParticle(particle);
                        break;
                    case "confetti":
                        this.animateConfettiParticle(particle);
                        break;
                    case "snowflakes":
                        this.animateSnowflakeParticle(particle);
                        break;
                    case "iceSparkles":
                        this.animateIceSparkleParticle(particle);
                        break;
                }
            });
        }
    },
    
    // Add theme-specific particle effects
    addParticleEffects: function(theme) {
        const particleGroup = new THREE.Group();
        
        // Handle different particle effect types
        switch(theme.particleEffect) {
            case "pollen":
                this.addPollenParticles(particleGroup, theme);
                break;
            case "leafs":
                this.addFloatingLeafs(particleGroup, theme);
                break;
            case "petals":
                this.addCherryBlossomPetals(particleGroup, theme);
                break;
            case "bubbles":
                this.addFloatingBubbles(particleGroup, theme);
                break;
            case "chocolateSparkles":
                this.addChocolateSparkles(particleGroup, theme);
                break;
            case "purpleSparkles":
                this.addColoredSparkles(particleGroup, theme, theme.decorationColors[0]);
                break;
            case "greenSparkles":
                this.addColoredSparkles(particleGroup, theme, theme.decorationColors[0]);
                break;
            case "goldDust":
                this.addGoldDust(particleGroup, theme);
                break;
            case "embers":
                this.addFloatingEmbers(particleGroup, theme);
                break;
            case "confetti":
                this.addConfetti(particleGroup, theme);
                break;
            case "snowflakes":
                this.addSnowflakes(particleGroup, theme);
                break;
            case "iceSparkles":
                this.addIceSparkles(particleGroup, theme);
                break;
        }
        
        CONFIG.scene.add(particleGroup);
        this.particles = particleGroup;
    },
    
    // Pollen particles animation
    animatePollenParticle: function(particle) {
        // Gentle floating upward and drifting
        particle.position.y += particle.userData.floatSpeed;
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Reset position if too high
        if (particle.position.y > 6) {
            particle.position.y = 0;
            // New random position
            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Leaf particles animation
    animateLeafParticle: function(particle) {
        // Falling leaves with spinning
        particle.position.y -= particle.userData.fallSpeed;
        
        // Apply drift
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Simplified rotation instead of using rotateOnAxis which can cause errors
        if (particle.userData.spinAxis) {
            // Use simple rotation instead of rotateOnAxis
            particle.rotation.x += particle.userData.spinSpeed * 0.5;
            particle.rotation.y += particle.userData.spinSpeed;
            particle.rotation.z += particle.userData.spinSpeed * 0.7;
        }
        
        // Reset if too low
        if (particle.position.y < -0.5) {
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Petal particles animation
    animatePetalParticle: function(particle) {
        // Gently falling cherry blossom petals
        particle.position.y -= particle.userData.fallSpeed;
        
        // Apply drift in breeze
        particle.userData.bobPhase += 0.02;
        const driftFactor = Math.sin(particle.userData.bobPhase) * 0.5 + 0.5;
        
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed * driftFactor;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed * driftFactor;
        
        // Gentle spinning
        particle.rotation.z += particle.userData.spinSpeed * 0.5;
        
        // Reset if too low
        if (particle.position.y < -0.5) {
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
            // New random rotation
            particle.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
            particle.rotation.z = Math.random() * Math.PI * 2;
        }
    },
    
    // Bubble particles animation
    animateBubbleParticle: function(particle) {
        // Floating bubbles
        particle.position.y += particle.userData.floatSpeed;
        
        // Apply drift
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Reset if too high or pop bubbles
        if (particle.position.y > particle.userData.maxHeight || Math.random() < 0.001) {
            // Either reset or "pop" (disappear and reappear somewhere else)
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Sparkle particles animation
    animateSparkleParticle: function(particle) {
        // Pulsing sparkle effect
        particle.userData.pulsePhase += particle.userData.pulseSpeed;
        const pulseFactor = 0.7 + Math.sin(particle.userData.pulsePhase) * 0.3;
        
        const size = particle.scale.x; // Original scale
        particle.scale.set(size * pulseFactor, size * pulseFactor, size * pulseFactor);
        
        // Drift slowly
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Slow rising for some sparkles
        if (Math.random() < 0.01) {
            particle.position.y += particle.userData.floatSpeed || 0.01;
            
            // Reset if too high
            if (particle.position.y > 5) {
                particle.position.y = particle.userData.originalY;
                // New random position
                const radius = Math.random() * 45;
                const angle = Math.random() * Math.PI * 2;
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
            }
        }
    },
    
    // Gold dust particles animation
    animateGoldDustParticle: function(particle) {
        // Gold dust particles - gentle floating and twinkling
        particle.userData.pulsePhase += particle.userData.pulseSpeed;
        const twinkleFactor = 0.6 + Math.sin(particle.userData.pulsePhase) * 0.4;
        
        // Scale pulsing for twinkling effect
        const goldSize = particle.scale.x; // Current scale
        particle.scale.set(goldSize * twinkleFactor, goldSize * twinkleFactor, goldSize * twinkleFactor);
        
        // Very slow rising
        particle.position.y += particle.userData.floatSpeed;
        
        // Gentle drift
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Reset if too high
        if (particle.position.y > 8) {
            particle.position.y = 0;
            // New random position
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Ember particles animation
    animateEmberParticle: function(particle) {
        // Floating embers with flickering
        particle.userData.pulsePhase += particle.userData.pulseSpeed;
        const flickerFactor = 0.7 + Math.sin(particle.userData.pulsePhase) * 0.3;
        
        // Scale and opacity for flickering effect
        const emberSize = particle.userData.originalSize * flickerFactor;
        particle.scale.set(emberSize, emberSize, emberSize);
        particle.material.opacity = 0.4 + Math.sin(particle.userData.pulsePhase * 1.5) * 0.3;
        
        // Rising
        particle.position.y += particle.userData.floatSpeed;
        
        // Drift in air currents
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Fade and reset if too high
        if (particle.position.y > 10) {
            particle.material.opacity -= particle.userData.fadeSpeed;
            
            if (particle.material.opacity <= 0.1) {
                particle.position.y = 0.5 + Math.random() * 2;
                particle.material.opacity = 0.7;
                // New random position
                const radius = Math.random() * 40;
                const angle = Math.random() * Math.PI * 2;
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
            }
        }
    },
    
    // Confetti particles animation
    animateConfettiParticle: function(particle) {
        // Falling confetti with spinning
        particle.position.y -= particle.userData.fallSpeed;
        
        // Apply drift
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Complex spinning on all axes
        const confettiAxis = particle.userData.spinAxis;
        particle.rotateOnAxis(confettiAxis, particle.userData.spinSpeed);
        
        // Reset if too low
        if (particle.position.y < -0.5) {
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
            // New random rotation
            particle.rotation.x = Math.random() * Math.PI * 2;
            particle.rotation.y = Math.random() * Math.PI * 2;
            particle.rotation.z = Math.random() * Math.PI * 2;
        }
    },
    
    // Snowflakes particles animation
    animateSnowflakeParticle: function(particle) {
        // Gently falling snowflakes with slight drift
        particle.position.y -= particle.userData.fallSpeed;
        
        // Oscillating drift to simulate wind
        particle.userData.driftPhase += particle.userData.driftSpeed;
        const windFactor = Math.sin(particle.userData.driftPhase) * 0.01;
        
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed + windFactor;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Gentle rotation for snowflake spinning
        particle.rotation.z += particle.userData.spinSpeed;
        
        // Reset if too low
        if (particle.position.y < -0.5) {
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Ice sparkles particles animation
    animateIceSparkleParticle: function(particle) {
        // Ice sparkles with twinkling and subtle movement
        particle.userData.pulsePhase += particle.userData.pulseSpeed;
        const twinkleFactor = 0.5 + Math.abs(Math.sin(particle.userData.pulsePhase)) * 0.5;
        
        // Scale pulsing for twinkling effect
        const originalSize = particle.userData.originalSize;
        particle.scale.set(originalSize * twinkleFactor, originalSize * twinkleFactor, originalSize * twinkleFactor);
        
        // Adjust opacity for extra sparkle
        particle.material.opacity = 0.5 + Math.sin(particle.userData.pulsePhase * 1.2) * 0.5;
        
        // Very subtle rising
        particle.position.y += particle.userData.floatSpeed;
        
        // Gentle drift
        particle.position.x += Math.cos(particle.userData.driftDirection) * particle.userData.driftSpeed;
        particle.position.z += Math.sin(particle.userData.driftDirection) * particle.userData.driftSpeed;
        
        // Reset if too high
        if (particle.position.y > particle.userData.maxHeight) {
            particle.position.y = particle.userData.originalY;
            // New random position
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
        }
    },
    
    // Pollen particles floating in the air (for Spring Garden - level 1)
    addPollenParticles: function(group, theme) {
        const particleCount = 200;
        
        // Create a small sprite material for the pollen
        const pollenTexture = TextureUtils.createCircleTexture(0xFFFFAA, 32);
        const pollenMaterial = new THREE.SpriteMaterial({
            map: pollenTexture,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < particleCount; i++) {
            const pollen = new THREE.Sprite(pollenMaterial);
            
            // Small random size
            const size = 0.05 + Math.random() * 0.1;
            pollen.scale.set(size, size, size);
            
            // Position randomly in the scene
            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 5;
            
            pollen.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation data
            pollen.userData = {
                floatSpeed: 0.002 + Math.random() * 0.004,
                driftSpeed: 0.005 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            group.add(pollen);
        }
    },
    
    // Floating leaf particles (for Forest Meadow - level 2)
    addFloatingLeafs: function(group, theme) {
        const leafCount = 50;
        
        // Create simple leaf shape
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.bezierCurveTo(0.5, 0.5, 1, -0.5, 1.5, 0);
        leafShape.bezierCurveTo(1, 0.5, 0.5, -0.5, 0, 0);
        
        const leafGeometry = new THREE.ShapeGeometry(leafShape);
        
        // Create leaves with varying shades of green
        for (let i = 0; i < leafCount; i++) {
            // Choose from theme colors or default to green shades
            const leafColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const leafMaterial = new THREE.MeshLambertMaterial({
                color: leafColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 5;
            
            leaf.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation for natural look
            leaf.rotation.x = Math.random() * Math.PI * 2;
            leaf.rotation.y = Math.random() * Math.PI * 2;
            leaf.rotation.z = Math.random() * Math.PI * 2;
            
            // Scale to appropriate size
            const scale = 0.2 + Math.random() * 0.2;
            leaf.scale.set(scale, scale, scale);
            
            // Add animation data for floating movement
            leaf.userData = {
                fallSpeed: 0.005 + Math.random() * 0.01,
                spinSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.01 + Math.random() * 0.02,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                spinAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            
            group.add(leaf);
        }
    },
    
    // Cherry blossom petals falling (for Pink Bloom - level 3)
    addCherryBlossomPetals: function(group, theme) {
        const petalCount = 150;
        
        // Create a simple petal shape
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.bezierCurveTo(0.5, 0.5, 1, 0.5, 1, 0);
        petalShape.bezierCurveTo(1, -0.5, 0.5, -0.5, 0, 0);
        
        const petalGeometry = new THREE.ShapeGeometry(petalShape);
        
        for (let i = 0; i < petalCount; i++) {
            // Use theme colors (pinks)
            const petalColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const petalMaterial = new THREE.MeshLambertMaterial({
                color: petalColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 6;
            
            petal.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            petal.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5; // Mostly horizontal
            petal.rotation.y = Math.random() * Math.PI * 2;
            petal.rotation.z = Math.random() * Math.PI * 2;
            
            // Small scale
            const scale = 0.1 + Math.random() * 0.1;
            petal.scale.set(scale, scale, scale);
            
            // Add animation data
            petal.userData = {
                fallSpeed: 0.003 + Math.random() * 0.007,
                spinSpeed: 0.01 + Math.random() * 0.03,
                driftSpeed: 0.007 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                bobPhase: Math.random() * Math.PI * 2
            };
            
            group.add(petal);
        }
    },
    
    // Floating bubbles (for Sky Blue - level 4)
    addFloatingBubbles: function(group, theme) {
        const bubbleCount = 80;
        
        for (let i = 0; i < bubbleCount; i++) {
            const bubbleGeometry = new THREE.SphereGeometry(1, 16, 16);
            
            // Create a semi-transparent bubble material
            const bubbleMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.2,
                shininess: 100,
                specular: 0xFFFFFF,
                side: THREE.DoubleSide
            });
            
            const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 5;
            
            bubble.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small random size
            const size = 0.1 + Math.random() * 0.3;
            bubble.scale.set(size, size, size);
            
            // Add animation data
            bubble.userData = {
                floatSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.004 + Math.random() * 0.008,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                maxHeight: 6 + Math.random() * 4
            };
            
            group.add(bubble);
        }
    },
    
    // Chocolate sparkles (for Chocolate Rush - level 5)
    addChocolateSparkles: function(group, theme) {
        const sparkleCount = 100;
        
        // Create sparkle texture
        const sparkleTexture = TextureUtils.createStarTexture(0xAA6633);
        
        for (let i = 0; i < sparkleCount; i++) {
            // Use theme colors (chocolatey browns)
            const sparkleColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const sparkleMaterial = new THREE.SpriteMaterial({
                map: sparkleTexture,
                color: sparkleColor,
                transparent: true,
                opacity: 0.7
            });
            
            const sparkle = new THREE.Sprite(sparkleMaterial);
            
            // Position randomly closer to the ground
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = 0.1 + Math.random() * 2; // Lower to the ground
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size
            const size = 0.1 + Math.random() * 0.2;
            sparkle.scale.set(size, size, size);
            
            // Add animation data
            sparkle.userData = {
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.05 + Math.random() * 0.1,
                driftSpeed: 0.003 + Math.random() * 0.006,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height
            };
            
            group.add(sparkle);
        }
    },
    
    // Colored sparkles for various levels (purple, green, etc.)
    addColoredSparkles: function(group, theme, baseColor) {
        const sparkleCount = 120;
        
        // Create sparkle texture using the color
        const sparkleTexture = TextureUtils.createStarTexture(baseColor);
        
        for (let i = 0; i < sparkleCount; i++) {
            // Use theme colors but focus on the base color
            const useBaseColor = Math.random() < 0.7; // 70% chance to use base color
            const sparkleColor = useBaseColor ? baseColor : theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const sparkleMaterial = new THREE.SpriteMaterial({
                map: sparkleTexture,
                color: sparkleColor,
                transparent: true,
                opacity: 0.8
            });
            
            const sparkle = new THREE.Sprite(sparkleMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 4;
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size with variation
            const size = 0.08 + Math.random() * 0.15;
            sparkle.scale.set(size, size, size);
            
            // Add animation data
            sparkle.userData = {
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.07 + Math.random() * 0.1,
                driftSpeed: 0.002 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                floatSpeed: 0.005 + Math.random() * 0.01
            };
            
            group.add(sparkle);
        }
    },
    
    // Gold dust particles (for Golden Summer - level 8)
    addGoldDust: function(group, theme) {
        const particleCount = 200;
        
        // Create a small sprite material for gold dust
        const dustTexture = TextureUtils.createCircleTexture(0xFFDD55, 16);
        
        for (let i = 0; i < particleCount; i++) {
            // Alternate between gold shades from theme
            const dustColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const dustMaterial = new THREE.SpriteMaterial({
                map: dustTexture,
                color: dustColor,
                transparent: true,
                opacity: 0.6 + Math.random() * 0.4
            });
            
            const dust = new THREE.Sprite(dustMaterial);
            
            // Very small random size
            const size = 0.03 + Math.random() * 0.08;
            dust.scale.set(size, size, size);
            
            // Position randomly in the scene, more concentrated in sunlit areas
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 6;
            
            dust.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Add animation data
            dust.userData = {
                floatSpeed: 0.001 + Math.random() * 0.003,
                driftSpeed: 0.002 + Math.random() * 0.008,
                driftDirection: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.1 + Math.random() * 0.2
            };
            
            group.add(dust);
        }
    },
    
    // Floating embers (for Sunset Glow - level 9)
    addFloatingEmbers: function(group, theme) {
        const emberCount = 80;
        
        // Create ember texture
        const emberTexture = TextureUtils.createCircleTexture(0xFF5500, 32);
        
        for (let i = 0; i < emberCount; i++) {
            // Use theme colors (oranges and reds)
            const emberColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const emberMaterial = new THREE.SpriteMaterial({
                map: emberTexture,
                color: emberColor,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const ember = new THREE.Sprite(emberMaterial);
            
            // Position randomly in the air
            const radius = Math.random() * 40;
            const angle = Math.random() * Math.PI * 2;
            const height = 0.5 + Math.random() * 6;
            
            ember.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size
            const size = 0.05 + Math.random() * 0.1;
            ember.scale.set(size, size, size);
            
            // Add animation data
            ember.userData = {
                floatSpeed: 0.01 + Math.random() * 0.02,
                driftSpeed: 0.005 + Math.random() * 0.01,
                driftDirection: Math.random() * Math.PI * 2,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.1 + Math.random() * 0.2,
                originalSize: size,
                fadeSpeed: 0.002 + Math.random() * 0.004
            };
            
            group.add(ember);
        }
    },
    
    // Confetti particles (for Rainbow Celebration - level 10)
    addConfetti: function(group, theme) {
        const confettiCount = 200;
        
        // Create small rectangular pieces
        const confettiGeometry = new THREE.PlaneGeometry(0.1, 0.1);
        
        for (let i = 0; i < confettiCount; i++) {
            // Use all rainbow colors from theme
            const confettiColor = theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)];
            
            const confettiMaterial = new THREE.MeshLambertMaterial({
                color: confettiColor,
                side: THREE.DoubleSide
            });
            
            const confetti = new THREE.Mesh(confettiGeometry, confettiMaterial);
            
            // Position randomly in the air
            const radius = Math.random() * 45;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 8;
            
            confetti.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Random rotation
            confetti.rotation.x = Math.random() * Math.PI * 2;
            confetti.rotation.y = Math.random() * Math.PI * 2;
            confetti.rotation.z = Math.random() * Math.PI * 2;
            
            // Add animation data
            confetti.userData = {
                fallSpeed: 0.004 + Math.random() * 0.008,
                spinSpeed: 0.05 + Math.random() * 0.1,
                driftSpeed: 0.01 + Math.random() * 0.02,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                spinAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };
            
            group.add(confetti);
        }
    },
    
    // Snowflakes falling (for Winter Wonderland - level 2)
    addSnowflakes: function(group, theme) {
        const snowflakeCount = 300;
        
        // Create different snowflake shapes for variety
        const createSnowflakeTexture = (size) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // Clear background
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, size, size);
            
            // Draw snowflake
            ctx.fillStyle = '#FFFFFF';
            const centerX = size / 2;
            const centerY = size / 2;
            
            // Determine which type of snowflake to draw
            const flakeType = Math.floor(Math.random() * 3);
            
            if (flakeType === 0) {
                // Simple star-like snowflake
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);
                    
                    // Main spoke
                    ctx.fillRect(-1, 0, 2, size * 0.4);
                    
                    // Small branches
                    ctx.fillRect(-size * 0.15, size * 0.1, size * 0.3, 1);
                    ctx.fillRect(-size * 0.1, size * 0.2, size * 0.2, 1);
                    
                    ctx.restore();
                }
            } else if (flakeType === 1) {
                // Circular snowflake
                ctx.beginPath();
                ctx.arc(centerX, centerY, size * 0.1, 0, Math.PI * 2);
                ctx.fill();
                
                // Spokes
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(angle);
                    ctx.fillRect(-1, 0, 2, size * 0.35);
                    ctx.restore();
                }
            } else {
                // Simple dot snowflake
                ctx.beginPath();
                ctx.arc(centerX, centerY, size * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        };
        
        for (let i = 0; i < snowflakeCount; i++) {
            const snowflakeSize = Math.floor(16 + Math.random() * 48); // Size between 16 and 64
            const snowflakeTexture = createSnowflakeTexture(snowflakeSize);
            
            const snowflakeMaterial = new THREE.SpriteMaterial({
                map: snowflakeTexture,
                transparent: true,
                opacity: 0.8
            });
            
            const snowflake = new THREE.Sprite(snowflakeMaterial);
            
            // Position randomly in the scene
            const radius = Math.random() * 50;
            const angle = Math.random() * Math.PI * 2;
            const height = 1 + Math.random() * 10;
            
            snowflake.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small random size - smaller flakes fall slower
            const size = 0.05 + Math.random() * 0.2;
            snowflake.scale.set(size, size, size);
            
            // Add animation data
            snowflake.userData = {
                fallSpeed: 0.005 + size * 0.05, // Larger flakes fall faster
                spinSpeed: 0.005 + Math.random() * 0.01,
                driftSpeed: 0.003 + Math.random() * 0.007,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                driftPhase: Math.random() * Math.PI * 2
            };
            
            group.add(snowflake);
        }
    },
    
    // Ice sparkles (for Frosty Easter - level 5)
    addIceSparkles: function(group, theme) {
        const sparkleCount = 180;
        
        // Create ice sparkle texture
        const iceSparkleTexture = TextureUtils.createStarTexture(0xA0DFFF);
        
        for (let i = 0; i < sparkleCount; i++) {
            // Use theme colors with blue tints
            const useThemeColor = Math.random() < 0.3; // 30% chance to use theme color
            const sparkleColor = useThemeColor ? 
                theme.decorationColors[Math.floor(Math.random() * theme.decorationColors.length)] : 
                new THREE.Color(0xAADDFF).multiplyScalar(0.8 + Math.random() * 0.4).getHex();
            
            const sparkleMaterial = new THREE.SpriteMaterial({
                map: iceSparkleTexture,
                color: sparkleColor,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });
            
            const sparkle = new THREE.Sprite(sparkleMaterial);
            
            // Position randomly in the scene, concentrated around ice sculptures and ground
            let radius, angle, height;
            
            // 70% near ground, 30% higher up
            if (Math.random() < 0.7) {
                radius = Math.random() * 40;
                angle = Math.random() * Math.PI * 2;
                height = 0.1 + Math.random() * 1.5; // Close to ground
            } else {
                radius = Math.random() * 30;
                angle = Math.random() * Math.PI * 2;
                height = 1.5 + Math.random() * 4; // Higher up
            }
            
            sparkle.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Small size with variation
            const size = 0.05 + Math.random() * 0.15;
            sparkle.scale.set(size, size, size);
            
            // Add animation data
            sparkle.userData = {
                originalSize: size,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.08 + Math.random() * 0.15,
                driftSpeed: 0.001 + Math.random() * 0.005,
                driftDirection: Math.random() * Math.PI * 2,
                originalY: height,
                floatSpeed: 0.001 + Math.random() * 0.005,
                maxHeight: height + 1 + Math.random() * 3
            };
            
            group.add(sparkle);
        }
    },
};