// Håndterer spilleren
const PlayerModule = {
    player: null,
    playerPosition: { x: 1, z: 1 },
    playerModel: null,
    glowEffect: null,
    rotationAngle: 0,
    
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
        // Hovedkropp (oval)
        const bodyGeometry = new THREE.SphereGeometry(0.4, 32, 32);
        bodyGeometry.scale(1, 1.2, 0.8);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF, // Hvit
            specular: 0x111111,
            shininess: 70,
            emissive: 0x333333
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        this.player.add(body);
        
        // Hode
        const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0x111111,
            shininess: 70,
            emissive: 0x333333
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.9, 0.15);
        this.player.add(head);
        
        // Ører
        const earGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
        earGeometry.scale(1, 1, 0.5);
        const earMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFDDDD, // Lys rosa inni ørene
            specular: 0x111111,
            shininess: 70
        });
        
        const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
        leftEar.position.set(-0.12, 1.25, 0);
        leftEar.rotation.set(0.1, 0, -0.1);
        this.player.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
        rightEar.position.set(0.12, 1.25, 0);
        rightEar.rotation.set(0.1, 0, 0.1);
        this.player.add(rightEar);
        
        // Øyne
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000, // Røde øyne (albino-kanin)
            specular: 0xFFFFFF,
            shininess: 100,
            emissive: 0x660000
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 0.95, 0.32);
        this.player.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 0.95, 0.32);
        this.player.add(rightEye);
        
        // Nese
        const noseGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF9999,
            specular: 0xFFFFFF,
            shininess: 100
        });
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.85, 0.44);
        this.player.add(nose);
        
        // Føtter
        const footGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        footGeometry.scale(1, 0.5, 1.5);
        const footMaterial = new THREE.MeshPhongMaterial({
            color: 0xE0E0E0, // Litt mørkere hvit
            specular: 0x111111,
            shininess: 30
        });
        
        const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
        leftFoot.position.set(-0.2, 0, 0.1);
        leftFoot.rotation.x = -0.2;
        this.player.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
        rightFoot.position.set(0.2, 0, 0.1);
        rightFoot.rotation.x = -0.2;
        this.player.add(rightFoot);
        
        // Hale
        const tailGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const tailMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0x222222,
            shininess: 30
        });
        
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.4, -0.4);
        this.player.add(tail);
        
        this.playerModel = this.player;
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
        if (CONFIG.isGameOver || CONFIG.isLevelCompleted) return;
        
        const moveSpeed = 0.1;
        let newX = this.playerPosition.x;
        let newZ = this.playerPosition.z;
        let moved = false;
        
        // Handle keyboard controls
        if (CONFIG.keyState.ArrowUp) { 
            newZ -= moveSpeed; 
            this.player.rotation.y = Math.PI;
            moved = true;
        }
        if (CONFIG.keyState.ArrowDown) { 
            newZ += moveSpeed; 
            this.player.rotation.y = 0;
            moved = true;
        }
        if (CONFIG.keyState.ArrowLeft) { 
            newX -= moveSpeed; 
            this.player.rotation.y = Math.PI / 2;
            moved = true;
        }
        if (CONFIG.keyState.ArrowRight) { 
            newX += moveSpeed; 
            this.player.rotation.y = -Math.PI / 2;
            moved = true;
        }
        
        // Handle touch/joystick controls
        if (this.joystickActive && (this.joystickVector.x !== 0 || this.joystickVector.y !== 0)) {
            // Joystick input affects movement
            newZ += this.joystickVector.y * moveSpeed;
            newX += this.joystickVector.x * moveSpeed;
            
            // Set rotation based on joystick direction
            this.player.rotation.y = Math.atan2(-this.joystickVector.x, -this.joystickVector.y);
            
            moved = true;
        }
        
        // Animer hopping hvis spilleren beveger seg
        if (moved) {
            this.animateHop();
        }
        
        // Sjekk kollisjoner med veggene
        const currentLevel = LEVELS[CONFIG.currentLevel - 1];
        const mazeDesign = currentLevel.mazeDesign;
        const gridX = Math.round(newX);
        const gridZ = Math.round(newZ);
        
        if (gridX >= 0 && gridX < mazeDesign[0].length && 
            gridZ >= 0 && gridZ < mazeDesign.length && 
            mazeDesign[gridZ][gridX] !== 1) {
            
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
        }
        
        // Animer glødeffekt og hale
        this.animateGlow();
    },
    
    // Animerer kaninens hoppeeffekt
    animateHop: function() {
        // Enkel hoppe-animasjon
        const leftEar = this.player.children.find(c => c.position.y > 1.2 && c.position.x < 0);
        const rightEar = this.player.children.find(c => c.position.y > 1.2 && c.position.x > 0);
        
        if (leftEar && rightEar) {
            leftEar.rotation.z = -0.1 - Math.sin(this.rotationAngle) * 0.05;
            rightEar.rotation.z = 0.1 + Math.sin(this.rotationAngle) * 0.05;
        }
        
        this.rotationAngle += 0.2;
    },
    
    // Animerer glødeffekten rundt spilleren
    animateGlow: function() {
        if (this.glowEffect) {
            this.glowEffect.material.opacity = 0.15 + Math.sin(this.rotationAngle * 0.5) * 0.05;
            this.glowEffect.scale.set(
                1 + Math.sin(this.rotationAngle * 0.3) * 0.05,
                1 + Math.sin(this.rotationAngle * 0.5) * 0.05,
                1 + Math.sin(this.rotationAngle * 0.7) * 0.05
            );
        }
        
        // Animer halen
        const tail = this.player.children.find(c => c.position.z < -0.3);
        if (tail) {
            tail.position.y = 0.4 + Math.sin(this.rotationAngle * 0.5) * 0.02;
            tail.rotation.z = Math.sin(this.rotationAngle * 0.3) * 0.1;
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
    }
};