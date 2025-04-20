// filepath: c:\Development\easter-labrynth\js\player.js
// Håndterer spilleren
import { CONFIG } from './config.js';
import { LEVELS } from './levels.js';
import { EggModule } from './eggs.js';
import { SoundModule } from './sound.js';

const PlayerModule = {
    player: null,
    playerPosition: { x: 1, z: 1 },
    playerModel: null,
    glowEffect: null,
    rotationAngle: 0,
    
    // Animation variables for realistic hopping
    hopHeight: 0,
    hopState: 'idle', // 'idle', 'rising', 'falling'
    hopProgress: 0,
    lastHopTime: 0,
    hopCooldown: 150, // Reduced from 200ms to 150ms for faster hopping
    
    // Mouth animation
    mouthState: 'normal', // 'normal', 'happy'
    mouthObject: null,
    happyMouthTimer: 0,
    
    // Mobile touch controls variables
    isMobile: false,
    joystickActive: false,
    joystickElement: null,
    joystickKnob: null,
    joystickCenter: { x: 0, y: 0 },
    joystickPosition: { x: 0, y: 0 },
    joystickVector: { x: 0, y: 0 },
    joystickSize: 60, // Radius in pixels for maximum movement
    
    // Oppretter spiller
    createPlayer: function() {
        // Opprett en gruppe for spillermodellen
        this.player = new THREE.Group();
        
        // Oppretter en mer detaljert karakter - en kanin (passende for påske)
        this.createBunnyModel();
        
        // Finn startposisjonen basert på kartet (hvor 2 er startpunkt)
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        for (let i = 0; i < currentLevel.mazeDesign.length; i++) {
            for (let j = 0; j < currentLevel.mazeDesign[i].length; j++) {
                if (currentLevel.mazeDesign[i][j] === 2) {
                    this.playerPosition = { x: j, z: i };
                    break;
                }
            }
        }
        
        const mazeSize = currentLevel.mazeDesign.length;
        this.player.position.set(
            this.playerPosition.x * 2 - mazeSize, 
            0, 
            this.playerPosition.z * 2 - mazeSize
        );
        
        CONFIG.scene.add(this.player);
        
        // Plasser kamera bak spilleren
        this.updateCameraPosition();
        
        // Legg til lys-effekt rundt spilleren
        this.addPlayerGlow();
    },
    
    // Oppretter en detaljert kaninmodell
    createBunnyModel: function() {
        // Hovedkropp (oval) - make more natural rabbit shape
        const bodyGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        bodyGeometry.scale(1, 0.9, 1.3); // More elongated for realistic rabbit shape
        const furTexture = {
            color: 0xF5F5F5, // Slightly off-white for more natural look
            specular: 0x222222,
            shininess: 15, // Less shiny for a furry appearance
            emissive: 0x111111
        };
        
        const bodyMaterial = new THREE.MeshPhongMaterial(furTexture);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        this.player.add(body);
        
        // Add fur texture effect to body
        const bodyFurGeometry = new THREE.SphereGeometry(0.42, 32, 32);
        bodyFurGeometry.scale(1, 0.9, 1.3);
        const bodyFurMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.4,
            wireframe: true
        });
        const bodyFur = new THREE.Mesh(bodyFurGeometry, bodyFurMaterial);
        bodyFur.position.y = 0.4;
        this.player.add(bodyFur);
        
        // Hode - slightly smaller and more natural shape
        const headGeometry = new THREE.SphereGeometry(0.26, 32, 32);
        headGeometry.scale(1.1, 0.9, 1.1);
        const headMaterial = new THREE.MeshPhongMaterial(furTexture);
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.85, 0.25); // Positioned slightly forward
        this.player.add(head);
        
        // Ører - longer, more natural rabbit ears
        const earGeometry = new THREE.CylinderGeometry(0.04, 0.03, 0.6, 16);
        earGeometry.scale(1, 1, 0.5);
        // Outside ear color
        const earOuterMaterial = new THREE.MeshPhongMaterial({
            color: 0xEEEEEE,
            specular: 0x111111,
            shininess: 10
        });
        // Inside ear color - pink
        const earInnerMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFCCCC,
            specular: 0x111111,
            shininess: 10
        });
        
        // Create composite ear with inner and outer materials
        const createEar = (x, angle) => {
            const earGroup = new THREE.Group();
            
            // Outer ear part
            const outerEar = new THREE.Mesh(earGeometry, earOuterMaterial);
            earGroup.add(outerEar);
            
            // Inner ear part (slightly smaller and positioned in front)
            const innerEarGeometry = new THREE.CylinderGeometry(0.035, 0.025, 0.55, 16);
            innerEarGeometry.scale(1, 1, 0.5);
            const innerEar = new THREE.Mesh(innerEarGeometry, earInnerMaterial);
            innerEar.position.z = 0.01; // Slightly in front
            earGroup.add(innerEar);
            
            earGroup.position.set(x, 1.3, 0.1);
            earGroup.rotation.set(0.1, 0, angle);
            
            return earGroup;
        };
        
        const leftEar = createEar(-0.12, -0.1);
        this.player.add(leftEar);
        
        const rightEar = createEar(0.12, 0.1);
        this.player.add(rightEar);
        
        // Øyne - more natural eyes
        const eyeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222, // Dark eyes instead of red
            specular: 0xFFFFFF,
            shininess: 100
        });
        
        // Add white part of eyes
        const eyeWhiteGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0xFFFFFF,
            shininess: 80
        });
        
        // Left eye
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        leftEyeWhite.position.set(-0.12, 0.95, 0.4);
        this.player.add(leftEyeWhite);
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 0.95, 0.46);
        this.player.add(leftEye);
        
        // Right eye
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        rightEyeWhite.position.set(0.12, 0.95, 0.4);
        this.player.add(rightEyeWhite);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 0.95, 0.46);
        this.player.add(rightEye);
        
        // Nese - smaller, more realistic nose
        const noseGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF9999,
            specular: 0xFFFFFF,
            shininess: 80
        });
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.88, 0.5);
        this.player.add(nose);
        
        // Add mouth - new addition
        this.addMouth();
        
        // Add whiskers
        const whiskerMaterial = new THREE.LineBasicMaterial({ 
            color: 0xFFFFFF,
            linewidth: 1
        });
        
        const createWhisker = (x, y, z, length, angle) => {
            const whiskerGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(length * Math.cos(angle), 0, length * Math.sin(angle))
            ]);
            const whisker = new THREE.Line(whiskerGeometry, whiskerMaterial);
            whisker.position.set(x, y, z);
            return whisker;
        };
        
        // Add 6 whiskers, 3 on each side
        const whiskerLength = 0.25;
        this.player.add(createWhisker(-0.06, 0.88, 0.48, whiskerLength, -Math.PI/6));
        this.player.add(createWhisker(-0.06, 0.85, 0.48, whiskerLength, -Math.PI/12));
        this.player.add(createWhisker(-0.06, 0.82, 0.48, whiskerLength, -Math.PI/24));
        
        this.player.add(createWhisker(0.06, 0.88, 0.48, whiskerLength, Math.PI/6));
        this.player.add(createWhisker(0.06, 0.85, 0.48, whiskerLength, Math.PI/12));
        this.player.add(createWhisker(0.06, 0.82, 0.48, whiskerLength, Math.PI/24));
        
        // Føtter - more realistic feet positioning for jumping
        // Back feet (larger for propulsion)
        const backFootGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        backFootGeometry.scale(1, 0.6, 1.8);
        const footMaterial = new THREE.MeshPhongMaterial({
            color: 0xEEEEEE,
            specular: 0x111111,
            shininess: 10
        });
        
        // Back feet positioned behind for jumping
        const leftBackFoot = new THREE.Mesh(backFootGeometry, footMaterial);
        leftBackFoot.position.set(-0.15, 0.1, -0.2);
        leftBackFoot.rotation.x = 0.3;
        this.player.add(leftBackFoot);
        
        const rightBackFoot = new THREE.Mesh(backFootGeometry, footMaterial);
        rightBackFoot.position.set(0.15, 0.1, -0.2);
        rightBackFoot.rotation.x = 0.3;
        this.player.add(rightBackFoot);
        
        // Front feet (smaller)
        const frontFootGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        frontFootGeometry.scale(1, 0.6, 1.5);
        
        const leftFrontFoot = new THREE.Mesh(frontFootGeometry, footMaterial);
        leftFrontFoot.position.set(-0.15, 0.15, 0.25);
        leftFrontFoot.rotation.x = -0.2;
        this.player.add(leftFrontFoot);
        
        const rightFrontFoot = new THREE.Mesh(frontFootGeometry, footMaterial);
        rightFrontFoot.position.set(0.15, 0.15, 0.25);
        rightFrontFoot.rotation.x = -0.2;
        this.player.add(rightFrontFoot);
        
        // Hale - fluffier tail
        const tailGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0x222222,
            shininess: 5
        });
        
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.5, -0.5);
        this.player.add(tail);
        
        // Add fluff to tail
        const tailFluffGeometry = new THREE.SphereGeometry(0.14, 8, 8);
        const tailFluffMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        const tailFluff = new THREE.Mesh(tailFluffGeometry, tailFluffMaterial);
        tailFluff.position.set(0, 0.5, -0.5);
        this.player.add(tailFluff);
        
        this.playerModel = this.player;
    },
    
    // Add a mouth to the rabbit - new function
    addMouth: function() {
        // Create a group to hold the mouth
        const mouthGroup = new THREE.Group();
        // Position the mouth below the eyes and nose (y=0.82 instead of y=0.81)
        // and more forward on the face (z=0.52)
        mouthGroup.position.set(0, 0.82, 0.52); 
        
        // Normal mouth - slight smile
        const normalMouthGeometry = new THREE.BufferGeometry();
        const normalMouthCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.06, 0, 0),   // Start point
            new THREE.Vector3(0, -0.03, 0),   // Control point
            new THREE.Vector3(0.06, 0, 0)     // End point
        );
        
        // Create the points along the curve - use more points for smoother curve
        const normalMouthPoints = normalMouthCurve.getPoints(20);
        normalMouthGeometry.setFromPoints(normalMouthPoints);
        
        // Create the mouth line with thicker, more visible material
        const mouthMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, // Use black for better visibility
            linewidth: 3 // Note: linewidth only works in some browsers/GPUs
        });
        const normalMouth = new THREE.Line(normalMouthGeometry, mouthMaterial);
        
        // Store reference to the normal mouth
        normalMouth.visible = true;
        mouthGroup.add(normalMouth);
        
        // Add a tube geometry version of the mouth for better visibility
        const normalMouthTubeGeometry = new THREE.TubeGeometry(
            normalMouthCurve,
            20,  // tubularSegments
            0.01, // radius - small but visible
            8,   // radiusSegments
            false // closed
        );
        const tubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const normalMouthTube = new THREE.Mesh(normalMouthTubeGeometry, tubeMaterial);
        normalMouthTube.visible = true;
        mouthGroup.add(normalMouthTube);
        
        // Happy mouth - big smile shape
        const happyMouthGeometry = new THREE.BufferGeometry();
        const happyMouthCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.08, 0, 0),   // Start point
            new THREE.Vector3(0, -0.06, 0),   // Control point for deeper smile
            new THREE.Vector3(0.08, 0, 0)     // End point
        );
        
        // Create the points along the curve - use more points for smoother curve
        const happyMouthPoints = happyMouthCurve.getPoints(20);
        happyMouthGeometry.setFromPoints(happyMouthPoints);
        
        // Create the happy mouth line with thicker material
        const happyMouthMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000, // Use black for better visibility
            linewidth: 3
        });
        const happyMouth = new THREE.Line(happyMouthGeometry, happyMouthMaterial);
        
        // Add a tube geometry version of the happy mouth
        const happyMouthTubeGeometry = new THREE.TubeGeometry(
            happyMouthCurve,
            20,  // tubularSegments
            0.01, // radius - small but visible
            8,   // radiusSegments
            false // closed
        );
        const happyTubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const happyMouthTube = new THREE.Mesh(happyMouthTubeGeometry, happyTubeMaterial);
        happyMouthTube.visible = false;
        mouthGroup.add(happyMouthTube);
        
        // Initially hide happy mouth
        happyMouth.visible = false;
        mouthGroup.add(happyMouth);
        
        // Store reference to the mouth for animation
        this.mouthGroup = mouthGroup;
        this.normalMouth = normalMouth;
        this.happyMouth = happyMouth;
        this.normalMouthTube = normalMouthTube;
        this.happyMouthTube = happyMouthTube;
        
        // Add mouth directly to the player instead of trying to attach to the head
        // This gives more direct control over the precise position
        this.player.add(mouthGroup);
        console.log("Mouth added to rabbit");
    },
    
    // Make the rabbit happy - new function
    showHappyMouth: function() {
        if (this.mouthGroup) {
            console.log("Showing happy mouth");
            this.mouthState = 'happy';
            this.normalMouth.visible = false;
            this.normalMouthTube.visible = false;
            this.happyMouth.visible = true;
            this.happyMouthTube.visible = true;
            this.happyMouthTimer = 60; // Show happy mouth for about 2 seconds (assuming 30fps)
        } else {
            console.warn("Cannot show happy mouth - mouthGroup is missing");
        }
    },
    
    // Return to normal mouth - new function
    resetMouth: function() {
        if (this.mouthGroup) {
            this.mouthState = 'normal';
            this.normalMouth.visible = true;
            this.normalMouthTube.visible = true;
            this.happyMouth.visible = false;
            this.happyMouthTube.visible = false;
        }
    },
    
    // Update mouth animation - new function
    updateMouth: function() {
        if (this.mouthState === 'happy') {
            // Count down happy mouth timer
            this.happyMouthTimer--;
            
            if (this.happyMouthTimer <= 0) {
                this.resetMouth();
            } else if (this.happyMouthTimer < 15) {
                // Fade between happy and normal in the last 0.5 seconds
                if (this.happyMouthTimer % 3 === 0) {
                    this.normalMouth.visible = !this.normalMouth.visible;
                    this.happyMouth.visible = !this.happyMouth.visible;
                }
            }
        }
    },
    
    // Legger til en lyseffekt rundt spilleren
    addPlayerGlow: function() {
        // Glød-effekt
        const glowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        this.glowEffect = new THREE.Mesh(glowGeometry, glowMaterial);
        this.glowEffect.position.y = 0.5;
        this.player.add(this.glowEffect);
    },
    
    // Konfigurer hendelser for å bevege spilleren
    setupControls: function() {
        window.addEventListener('keydown', (e) => {
            if (CONFIG.isGameOver || CONFIG.isLevelCompleted) return;
            
            if (e.key in CONFIG.keyState) {
                CONFIG.keyState[e.key] = true;
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key in CONFIG.keyState) {
                CONFIG.keyState[e.key] = false;
                e.preventDefault();
            }
        });

        // Detect mobile devices and set up controls
        this.detectMobile();
    },
    
    // Detekterer om enheten er mobil
    detectMobile: function() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Set up mobile controls if needed
        if (this.isMobile) {
            this.setupMobileControls();
        }
    },

    // Setter opp mobile kontroller (joystick)
    setupMobileControls: function() {
        // Get reference to joystick elements
        this.joystickElement = document.getElementById('mobile-controls');
        this.joystickKnob = document.getElementById('joystick');
        
        // Update joystick center
        const joystickRect = this.joystickElement.getBoundingClientRect();
        this.joystickCenter = {
            x: joystickRect.left + joystickRect.width / 2,
            y: joystickRect.top + joystickRect.height / 2
        };
        
        // Add touch event listeners
        this.joystickElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.joystickElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.joystickElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
    },

    // Håndterer start av touch
    handleTouchStart: function(event) {
        event.preventDefault();
        
        this.joystickActive = true;
        
        // Update joystick center position
        const joystickRect = this.joystickElement.getBoundingClientRect();
        this.joystickCenter = {
            x: joystickRect.left + joystickRect.width / 2,
            y: joystickRect.top + joystickRect.height / 2
        };
        
        // Update joystick position
        const touch = event.touches[0];
        this.updateJoystickPosition(touch);
    },

    // Håndterer bevegelse av touch
    handleTouchMove: function(event) {
        if (!this.joystickActive) return;
        
        event.preventDefault();
        const touch = event.touches[0];
        this.updateJoystickPosition(touch);
    },

    // Håndterer slutt på touch
    handleTouchEnd: function(event) {
        event.preventDefault();
        
        // Reset joystick position and vector
        this.joystickActive = false;
        this.joystickVector = { x: 0, y: 0 };
        
        // Reset joystick knob position to center
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = 'translate(-50%, -50%)';
        }
    },

    // Oppdaterer joystick-posisjonen og beregner vektor
    updateJoystickPosition: function(touch) {
        // Calculate the touch position relative to joystick center
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // Calculate vector from center to touch position
        let deltaX = touchX - this.joystickCenter.x;
        let deltaY = touchY - this.joystickCenter.y;
        
        // Calculate the distance from center
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Normalize and limit the vector length to joystick size
        if (distance > this.joystickSize) {
            const ratio = this.joystickSize / distance;
            deltaX *= ratio;
            deltaY *= ratio;
        }
        
        // Update joystick position
        this.joystickPosition = {
            x: this.joystickCenter.x + deltaX,
            y: this.joystickCenter.y + deltaY
        };
        
        // Update joystick vector (normalized direction)
        const normalizedX = deltaX / this.joystickSize;
        const normalizedY = deltaY / this.joystickSize;
        
        this.joystickVector = {
            x: normalizedX,
            y: normalizedY
        };
        
        // Move the joystick knob visually
        if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
        }
    },
    
    // Oppdaterer spillerens posisjon basert på kontrollene
    updatePosition: function() {
        // Don't move if game is over, level is completed, or timer isn't active
        if (CONFIG.isGameOver || CONFIG.isLevelCompleted || !CONFIG.timerActive) return;
        
        const baseKeyboardMoveSpeed = 0.10; // Base movement speed for keyboard
        const baseJoystickMoveSpeed = 0.08; // Reduced speed for joystick controls
        
        // Apply speed multiplier from config
        const keyboardMoveSpeed = baseKeyboardMoveSpeed * CONFIG.speedMultiplier;
        const joystickMoveSpeed = baseJoystickMoveSpeed * CONFIG.speedMultiplier;
        
        let newX = this.playerPosition.x;
        let newZ = this.playerPosition.z;
        let moved = false;
        let direction = new THREE.Vector3(0, 0, 0);
        
        // Handle keyboard controls
        if (CONFIG.keyState.ArrowUp) { 
            newZ -= keyboardMoveSpeed; 
            direction.z = -1;
            moved = true;
        }
        if (CONFIG.keyState.ArrowDown) { 
            newZ += keyboardMoveSpeed; 
            direction.z = 1;
            moved = true;
        }
        if (CONFIG.keyState.ArrowLeft) { 
            newX -= keyboardMoveSpeed; 
            direction.x = -1;
            moved = true;
        }
        if (CONFIG.keyState.ArrowRight) { 
            newX += keyboardMoveSpeed; 
            direction.x = 1;
            moved = true;
        }
        
        // Handle touch/joystick controls
        if (this.joystickActive && (this.joystickVector.x !== 0 || this.joystickVector.y !== 0)) {
            // Joystick input affects movement - using slower speed
            newZ += this.joystickVector.y * joystickMoveSpeed;
            newX += this.joystickVector.x * joystickMoveSpeed;
            
            // Include joystick input in direction vector
            direction.x = this.joystickVector.x;
            direction.z = this.joystickVector.y;
            
            moved = true;
        }
        
        // If we have movement, update player rotation to face the right direction
        if (moved && (direction.x !== 0 || direction.z !== 0)) {
            // Calculate the angle to rotate the player
            const angle = Math.atan2(direction.x, direction.z);
            this.player.rotation.y = angle;
        }
        
        // Animer hopping hvis spilleren beveger seg
        if (moved) {
            this.animateHop();
        }
        
        // Update mouth animation
        this.updateMouth();
        
        // Sjekk kollisjoner med veggene
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        
        // Store original position for bounce-back effect
        const originalX = this.playerPosition.x;
        const originalZ = this.playerPosition.z;
        
        // Try moving in both X and Z directions
        let canMoveX = true;
        let canMoveZ = true;
        
        // Check X movement
        const newGridX = Math.round(newX);
        const currentGridZ = Math.round(this.playerPosition.z);
        
        // Safe bounds checking for X movement
        const isXWithinBounds = newGridX >= 0 && newGridX < mazeDesign[0].length && 
                               currentGridZ >= 0 && currentGridZ < mazeDesign.length;
        
        // If X movement would hit a wall
        if (!isXWithinBounds || mazeDesign[currentGridZ][newGridX] === 1) {
            canMoveX = false;
            
            // Apply a small bounce-back in X direction
            if (direction.x !== 0) {
                // Bounce back in opposite direction (20% of the attempted movement)
                const bounceDistance = (newX - originalX) * -0.2;
                newX = originalX + bounceDistance;
                
                // Create subtle visual feedback for collision
                if (this.glowEffect) {
                    // Briefly change glow color to indicate wall collision
                    const originalColor = this.glowEffect.material.color.clone();
                    this.glowEffect.material.color.setRGB(1.0, 0.8, 0.8); // Slight red tint
                    
                    // Restore original color after a short delay
                    setTimeout(() => {
                        if (this.glowEffect) {
                            this.glowEffect.material.color.copy(originalColor);
                        }
                    }, 100);
                }
            }
        }
        
        // Check Z movement
        const newGridZ = Math.round(newZ);
        const currentGridX = Math.round(this.playerPosition.x);
        
        // Safe bounds checking for Z movement
        const isZWithinBounds = currentGridX >= 0 && currentGridX < mazeDesign[0].length && 
                               newGridZ >= 0 && newGridZ < mazeDesign.length;
        
        // If Z movement would hit a wall
        if (!isZWithinBounds || mazeDesign[newGridZ][currentGridX] === 1) {
            canMoveZ = false;
            
            // Apply a small bounce-back in Z direction
            if (direction.z !== 0) {
                // Bounce back in opposite direction (20% of the attempted movement)
                const bounceDistance = (newZ - originalZ) * -0.2;
                newZ = originalZ + bounceDistance;
            }
        }
        
        // Final position check - diagonal movement into corners
        const finalGridX = Math.round(newX);
        const finalGridZ = Math.round(newZ);
        
        const isFinalPosWithinBounds = finalGridX >= 0 && finalGridX < mazeDesign[0].length && 
                                      finalGridZ >= 0 && finalGridZ < mazeDesign.length;
        
        // If we're trying to move diagonally into a corner with walls
        if (isFinalPosWithinBounds && mazeDesign[finalGridZ][finalGridX] === 1) {
            // When both directions have walls meeting at a corner, 
            // prevent diagonal cutting but still allow sliding along walls
            if (canMoveX) {
                newZ = originalZ; // Only move in X direction
            } else if (canMoveZ) {
                newX = originalX; // Only move in Z direction
            } else {
                // If both directions are blocked, apply bounce-back for both
                newX = originalX + (newX - originalX) * -0.2;
                newZ = originalZ + (newZ - originalZ) * -0.2;
            }
        }
        
        // Apply the calculated movements
        this.playerPosition.x = newX;
        this.playerPosition.z = newZ;
        
        const mazeSize = mazeDesign.length;
        this.player.position.set(
            this.playerPosition.x * 2 - mazeSize, 
            0, 
            this.playerPosition.z * 2 - mazeSize
        );
        
        this.updateCameraPosition();
        EggModule.checkCollection(this.playerPosition);
        
        // Animer glødeffekt og hale
        this.animateGlow();
    },
    
    // Animerer kaninens hoppeeffekt
    animateHop: function() {
        const now = Date.now();
        
        // Check if we need to start a new hop
        if (this.hopState === 'idle' && now - this.lastHopTime > this.hopCooldown) {
            this.hopState = 'rising';
            this.hopProgress = 0;
            this.lastHopTime = now;
            
            // Play hop sound when starting a new hop
            SoundModule.playHop();
        }
        
        // Handle the hopping animation states
        if (this.hopState === 'rising') {
            // Rising phase of the hop
            this.hopProgress += 0.15;
            
            // Calculate height using a parabolic function for natural movement
            this.hopHeight = 0.4 * Math.sin(this.hopProgress);
            
            // Apply height to the entire rabbit model
            this.player.position.y = this.hopHeight;
            
            // During rising, tilt the rabbit slightly forward and move ears back
            this.player.rotation.x = -0.1 - (this.hopHeight * 0.2);
            
            // Animate back feet (tucking them in during the jump)
            const leftBackFoot = this.player.children.find(c => c.position.z < -0.1 && c.position.x < 0);
            const rightBackFoot = this.player.children.find(c => c.position.z < -0.1 && c.position.x > 0);
            
            if (leftBackFoot && rightBackFoot) {
                leftBackFoot.rotation.x = 0.8 + this.hopHeight * 0.5;
                rightBackFoot.rotation.x = 0.8 + this.hopHeight * 0.5;
            }
            
            // If reached peak of jump
            if (this.hopProgress >= Math.PI/2) {
                this.hopState = 'falling';
            }
        } else if (this.hopState === 'falling') {
            // Falling phase of the hop
            this.hopProgress += 0.15;
            
            // Continue the parabolic arc for the descent
            this.hopHeight = 0.4 * Math.sin(this.hopProgress);
            
            // Apply height to the entire rabbit model
            this.player.position.y = this.hopHeight;
            
            // During falling, tilt the rabbit back to neutral and prepare for landing
            this.player.rotation.x = -0.1 * (1 - (this.hopProgress - Math.PI/2) / (Math.PI/2));
            
            // Animate front feet (extending for landing)
            const leftFrontFoot = this.player.children.find(c => c.position.z > 0.1 && c.position.x < 0);
            const rightFrontFoot = this.player.children.find(c => c.position.z > 0.1 && c.position.x > 0);
            
            if (leftFrontFoot && rightFrontFoot) {
                // Extend front feet as the rabbit is about to land
                leftFrontFoot.rotation.x = -0.2 - (1 - this.hopHeight) * 0.3;
                rightFrontFoot.rotation.x = -0.2 - (1 - this.hopHeight) * 0.3;
            }
            
            // If completed the hop
            if (this.hopProgress >= Math.PI) {
                this.hopState = 'idle';
                this.hopHeight = 0;
                this.player.position.y = 0;
                this.player.rotation.x = 0;
                
                // Reset foot positions
                if (leftFrontFoot && rightFrontFoot) {
                    leftFrontFoot.rotation.x = -0.2;
                    rightFrontFoot.rotation.x = -0.2;
                }
                
                const leftBackFoot = this.player.children.find(c => c.position.z < -0.1 && c.position.x < 0);
                const rightBackFoot = this.player.children.find(c => c.position.z < -0.1 && c.position.x > 0);
                
                if (leftBackFoot && rightBackFoot) {
                    leftBackFoot.rotation.x = 0.3;
                    rightBackFoot.rotation.x = 0.3;
                }
            }
        }
        
        // Ear animation during hopping - more natural ear movement
        const leftEar = this.player.children.find(c => c.position.y > 1.2 && c.position.x < 0);
        const rightEar = this.player.children.find(c => c.position.y > 1.2 && c.position.x > 0);
        
        if (leftEar && rightEar) {
            // Ears flop back during jump and return during landing
            if (this.hopState === 'rising') {
                // Ears gradually move back during upward movement
                leftEar.rotation.x = 0.1 + this.hopHeight * 0.3;
                rightEar.rotation.x = 0.1 + this.hopHeight * 0.3;
                leftEar.rotation.z = -0.1 - this.hopHeight * 0.1;
                rightEar.rotation.z = 0.1 + this.hopHeight * 0.1;
            } else if (this.hopState === 'falling') {
                // Ears gradually return during fall
                leftEar.rotation.x = 0.1 + this.hopHeight * 0.3;
                rightEar.rotation.x = 0.1 + this.hopHeight * 0.3;
                leftEar.rotation.z = -0.1 - this.hopHeight * 0.1;
                rightEar.rotation.z = 0.1 + this.hopHeight * 0.1;
            } else {
                // Subtle ear movement while idle
                leftEar.rotation.x = 0.1;
                rightEar.rotation.x = 0.1;
                leftEar.rotation.z = -0.1 - Math.sin(this.rotationAngle * 0.5) * 0.05;
                rightEar.rotation.z = 0.1 + Math.sin(this.rotationAngle * 0.5) * 0.05;
            }
        }
        
        // Animate body squash and stretch
        const body = this.player.children.find(c => c.position.y === 0.4 && !c.material.wireframe);
        const bodyFur = this.player.children.find(c => c.position.y === 0.4 && c.material.wireframe);
        
        if (body && bodyFur) {
            if (this.hopState === 'rising') {
                // Stretch during rising
                body.scale.set(1, 1 + this.hopHeight * 0.2, 1);
                bodyFur.scale.set(1, 1 + this.hopHeight * 0.2, 1);
            } else if (this.hopState === 'falling' && this.hopHeight < 0.1) {
                // Squash slightly on landing
                body.scale.set(1 + (0.1 - this.hopHeight), 1 - (0.1 - this.hopHeight) * 0.3, 1 + (0.1 - this.hopHeight));
                bodyFur.scale.set(1 + (0.1 - this.hopHeight), 1 - (0.1 - this.hopHeight) * 0.3, 1 + (0.1 - this.hopHeight));
            } else if (this.hopState === 'idle') {
                // Return to normal shape
                body.scale.set(1, 1, 1);
                bodyFur.scale.set(1, 1, 1);
            }
        }
        
        this.rotationAngle += 0.2;
    },
    
    // Animerer glødeffekten rundt spilleren
    animateGlow: function() {
        if (this.glowEffect) {
            // Sync glow effect with hopping motion
            if (this.hopState !== 'idle') {
                // Make glow more intense during jumps
                this.glowEffect.material.opacity = 0.25 + this.hopHeight * 0.3;
                // Adjust glow color based on movement (more blue during higher jumps)
                this.glowEffect.material.color.setRGB(
                    0.53,
                    0.8 + this.hopHeight * 0.15,
                    1.0
                );
                
                // Scale glow with jump height
                const pulseScale = 1 + this.hopHeight * 0.2;
                this.glowEffect.scale.set(pulseScale, pulseScale, pulseScale);
            } else {
                // Subtle ambient glowing when idle
                this.glowEffect.material.opacity = 0.15 + Math.sin(this.rotationAngle * 0.5) * 0.05;
                // Return to standard blue color when idle
                this.glowEffect.material.color.setHex(0x88CCFF);
                this.glowEffect.scale.set(
                    1 + Math.sin(this.rotationAngle * 0.3) * 0.05,
                    1 + Math.sin(this.rotationAngle * 0.5) * 0.05,
                    1 + Math.sin(this.rotationAngle * 0.7) * 0.05
                );
            }
        }
        
        // Animer halen - more natural tail movement
        const tail = this.player.children.find(c => c.position.z < -0.3 && !c.material.wireframe);
        const tailFluff = this.player.children.find(c => c.position.z < -0.3 && c.material.wireframe);
        
        if (tail && tailFluff) {
            if (this.hopState === 'rising') {
                // Tail tilts upward during jump start - real rabbits do this for balance
                tail.rotation.x = -0.3 - this.hopHeight * 0.5;
                tailFluff.rotation.x = -0.3 - this.hopHeight * 0.5;
                
                // Tail flattens a bit during jump
                tail.scale.set(1, 0.9 - this.hopHeight * 0.2, 1);
                tailFluff.scale.set(1, 0.9 - this.hopHeight * 0.2, 1);
            } else if (this.hopState === 'falling') {
                // Tail returns to normal as rabbit prepares to land
                tail.rotation.x = -0.3 - this.hopHeight * 0.3;
                tailFluff.rotation.x = -0.3 - this.hopHeight * 0.3;
                
                // Tail returns to normal shape
                tail.scale.set(1, 0.9 + (0.1 - this.hopHeight) * 0.2, 1);
                tailFluff.scale.set(1, 0.9 + (0.1 - this.hopHeight) * 0.2, 1);
            } else {
                // Subtle tail movement when idle - rabbits twitch their tails
                tail.position.y = 0.5 + Math.sin(this.rotationAngle * 0.5) * 0.02;
                tail.rotation.x = Math.sin(this.rotationAngle * 0.2) * 0.05;
                tail.rotation.z = Math.sin(this.rotationAngle * 0.3) * 0.08;
                
                tailFluff.position.y = 0.5 + Math.sin(this.rotationAngle * 0.5) * 0.02;
                tailFluff.rotation.x = Math.sin(this.rotationAngle * 0.2) * 0.05;
                tailFluff.rotation.z = Math.sin(this.rotationAngle * 0.3) * 0.08;
                
                // Occasional tail "twitches" like real rabbits
                if (Math.random() < 0.01) {
                    tail.rotation.y = (Math.random() - 0.5) * 0.2;
                    tailFluff.rotation.y = tail.rotation.y;
                }
            }
        }
    },
    
    // Oppdaterer kameraets posisjon relativt til spilleren
    updateCameraPosition: function() {
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const cameraHeight = currentLevel.cameraHeight || 5;
        const cameraDistance = currentLevel.cameraDistance || 5;
        
        // Sett kameraet bak og over spilleren
        CONFIG.camera.position.set(
            this.player.position.x, 
            cameraHeight, 
            this.player.position.z + cameraDistance
        );
        
        CONFIG.camera.lookAt(this.player.position);
    },
    
    // Flytt spilleren til startposisjon for nytt nivå
    resetPosition: function() {
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        
        // Finn startposisjon for det nye nivået
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                if (mazeDesign[i][j] === 2) {
                    this.playerPosition = { x: j, z: i };
                    break;
                }
            }
        }
        
        const mazeSize = mazeDesign.length;
        this.player.position.set(
            this.playerPosition.x * 2 - mazeSize, 
            0, 
            this.playerPosition.z * 2 - mazeSize
        );
        
        this.updateCameraPosition();
    },

    // Makes the rabbit hold an egg over its head
    holdEggAnimation: function(egg) {
        // Create a copy of the egg for the rabbit to hold
        const eggCopy = egg.clone();
        
        // Reset position and scale
        eggCopy.position.set(0, 1.2, 0); // Position above the rabbit's head
        eggCopy.scale.set(0.6, 0.6, 0.6); // Make it slightly smaller
        
        // Add the egg to the rabbit
        this.player.add(eggCopy);
        
        // Fix to ensure mouth is visible - make sure we're handling the mouth correctly
        if (this.mouthGroup && this.normalMouth && this.happyMouth) {
            // Show happy mouth (line and tube versions)
            this.normalMouth.visible = false;
            this.normalMouthTube.visible = false;
            this.happyMouth.visible = true;
            this.happyMouthTube.visible = true;
            this.mouthState = 'happy';
            this.happyMouthTimer = 60; // Show happy mouth for about 2 seconds
            
            console.log("Happy mouth displayed when collecting egg");
        } else {
            console.warn("Mouth references missing:", {
                mouthGroup: !!this.mouthGroup,
                normalMouth: !!this.normalMouth,
                happyMouth: !!this.happyMouth,
                normalMouthTube: !!this.normalMouthTube,
                happyMouthTube: !!this.happyMouthTube
            });
        }
        
        // Animate the egg floating up and disappearing
        let animationFrame = 0;
        const animateEgg = () => {
            animationFrame++;
            
            if (animationFrame <= 30) { // 30 frames = ~1 second at 30fps
                // Float up slightly
                eggCopy.position.y += 0.01;
                // Spin
                eggCopy.rotation.y += 0.1;
                
                requestAnimationFrame(animateEgg);
            } else {
                // Start disappearing animation
                let fadeFrame = 0;
                const fadeEgg = () => {
                    fadeFrame++;
                    
                    if (fadeFrame <= 20) {
                        // Scale down and fade out
                        eggCopy.scale.multiplyScalar(0.9);
                        
                        // Create sparkle particles
                        if (fadeFrame % 3 === 0) {
                            this.createSparkleParticle(eggCopy.position);
                        }
                        
                        requestAnimationFrame(fadeEgg);
                    } else {
                        // Remove the egg from the rabbit
                        this.player.remove(eggCopy);
                    }
                };
                
                fadeEgg();
            }
        };
        
        animateEgg();
    },
    
    // Creates a sparkle particle effect
    createSparkleParticle: function(position) {
        // Create a sparkle particle
        const sparkleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xFFFFFF : 0xFFD700, // White or gold
            transparent: true,
            opacity: 1
        });
        
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        
        // Check if position is valid to prevent errors
        if (!position) {
            // Use player position as fallback if no specific position provided
            sparkle.position.set(
                this.player.position.x + (Math.random() * 0.4 - 0.2),
                this.player.position.y + 1.2 + (Math.random() * 0.4 - 0.2),
                this.player.position.z + (Math.random() * 0.4 - 0.2)
            );
        } else {
            // Position is a Vector3 - use directly
            if (position.isVector3) {
                sparkle.position.set(
                    this.player.position.x + position.x + (Math.random() * 0.4 - 0.2),
                    this.player.position.y + position.y + (Math.random() * 0.4 - 0.2),
                    this.player.position.z + position.z + (Math.random() * 0.4 - 0.2)
                );
            } else {
                // Position is an object with x, y, z properties - use them
                try {
                    sparkle.position.set(
                        this.player.position.x + (position.x || 0) + (Math.random() * 0.4 - 0.2),
                        this.player.position.y + (position.y || 1.2) + (Math.random() * 0.4 - 0.2),
                        this.player.position.z + (position.z || 0) + (Math.random() * 0.4 - 0.2)
                    );
                } catch (e) {
                    // If any error occurs, use player position as fallback
                    console.warn("Error positioning sparkle particle, using default position", e);
                    sparkle.position.set(
                        this.player.position.x + (Math.random() * 0.4 - 0.2),
                        this.player.position.y + 1.2 + (Math.random() * 0.4 - 0.2),
                        this.player.position.z + (Math.random() * 0.4 - 0.2)
                    );
                }
            }
        }
        
        // Add to scene
        CONFIG.scene.add(sparkle);
        
        // Store all sparkles to ensure cleanup
        if (!this.sparkleParticles) {
            this.sparkleParticles = [];
        }
        this.sparkleParticles.push(sparkle);
        
        // Animate the sparkle
        let frame = 0;
        const animateSparkle = () => {
            frame++;
            
            if (frame <= 15) {
                // Move upward and outward
                sparkle.position.y += 0.03;
                sparkle.scale.multiplyScalar(0.9);
                sparkleMaterial.opacity -= 0.06;
                
                requestAnimationFrame(animateSparkle);
            } else {
                // Remove when animation is complete
                CONFIG.scene.remove(sparkle);
                
                // Remove from our tracking array
                const index = this.sparkleParticles.indexOf(sparkle);
                if (index > -1) {
                    this.sparkleParticles.splice(index, 1);
                }
            }
        };
        
        animateSparkle();
    },
    
    // Cleanup all sparkle particles
    cleanupSparkles: function() {
        if (this.sparkleParticles && this.sparkleParticles.length > 0) {
            this.sparkleParticles.forEach(sparkle => {
                CONFIG.scene.remove(sparkle);
            });
            this.sparkleParticles = [];
        }
    },

    // Remove player from scene
    removePlayer: function() {
        if (this.player) {
            CONFIG.scene.remove(this.player);
            this.player = null;
        }
        
        // Also clean up any sparkle particles
        this.cleanupSparkles();
    },

    // Resets player to the starting position of the current level
    resetToStartPosition: function() {
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        
        // Find the starting position (marked as 2 in the maze design)
        for (let i = 0; i < mazeDesign.length; i++) {
            for (let j = 0; j < mazeDesign[i].length; j++) {
                if (mazeDesign[i][j] === 2) {
                    this.playerPosition = { x: j, z: i };
                    break;
                }
            }
        }
        
        // Update player's position
        const mazeSize = mazeDesign.length;
        this.player.position.set(
            this.playerPosition.x * 2 - mazeSize, 
            0, 
            this.playerPosition.z * 2 - mazeSize
        );
        
        // Make the player briefly flash to indicate damage
        this.flashPlayer();
        
        // Update camera position
        this.updateCameraPosition();
    },
    
    // Gives the player temporary immunity after being hit by a crocodile
    giveTemporaryImmunity: function() {
        // Flag to track immunity
        this.isImmune = true;
        
        // Start of immunity time
        this.immunityStartTime = Date.now();
        this.immunityDuration = 3000; // 3 seconds of immunity
        
        // Set up continuous blinking during immunity
        this.startImmunityBlink();
        
        // Remove immunity after the duration
        setTimeout(() => {
            this.isImmune = false;
            
            // Stop the blinking animation
            if (this.immunityBlinkInterval) {
                clearInterval(this.immunityBlinkInterval);
                this.immunityBlinkInterval = null;
            }
            
            // Ensure player is fully visible when immunity ends
            if (this.player) {
                this.player.visible = true;
                
                // Reset any material changes
                this.player.children.forEach(child => {
                    if (child.material && child.material.transparent) {
                        child.material.transparent = false;
                        child.material.opacity = 1.0;
                    }
                });
            }
        }, this.immunityDuration);
    },
    
    // Creates a continuous blinking effect during immunity period
    startImmunityBlink: function() {
        // Clear any existing interval
        if (this.immunityBlinkInterval) {
            clearInterval(this.immunityBlinkInterval);
        }
        
        // How often to toggle visibility (milliseconds)
        const blinkSpeed = 100;
        
        // Start the blinking effect
        this.immunityBlinkInterval = setInterval(() => {
            if (this.player) {
                // Toggle visibility for blinking effect
                this.player.visible = !this.player.visible;
                
                // Add a subtle glow effect when visible
                if (this.player.visible && this.glowEffect) {
                    // Make glow more intense and change color during immunity
                    this.glowEffect.material.color.setHex(0xFFD700); // Gold color
                    this.glowEffect.material.opacity = 0.6;
                    this.glowEffect.scale.set(1.5, 1.5, 1.5);
                }
            }
        }, blinkSpeed);
    },

    // Makes the player flash briefly when damaged
    flashPlayer: function() {
        if (!this.player) return;
        
        // Number of flashes
        const flashCount = 4;
        let flashesRemaining = flashCount;
        
        // Flash interval (milliseconds)
        const flashInterval = 150;
        
        // Function to toggle visibility
        const toggleVisibility = () => {
            // Toggle visibility
            this.player.visible = !this.player.visible;
            flashesRemaining--;
            
            // Continue flashing if there are flashes remaining
            if (flashesRemaining > 0) {
                setTimeout(toggleVisibility, flashInterval);
            } else {
                // Ensure player is visible when done
                this.player.visible = true;
            }
        };
        
        // Start flashing
        toggleVisibility();
    },
};

export { PlayerModule };