// filepath: c:\Development\easter-labrynth\js\renderer.js
// Renderer-håndtering for spillet
import { CONFIG } from './config.js';

export const RendererModule = {
    // Initalisere Three.js komponenter
    init: function() {
        // Opprette Three.js scene
        CONFIG.scene = new THREE.Scene();
        CONFIG.scene.background = new THREE.Color(CONFIG.colors.sky);
        
        // Opprette kamera
        CONFIG.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        CONFIG.camera.position.set(0, 10, 0);
        CONFIG.camera.lookAt(0, 0, 0);
        
        // Opprette renderer
        CONFIG.renderer = new THREE.WebGLRenderer({ antialias: true });
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-container').appendChild(CONFIG.renderer.domElement);
        
        // Lys
        this.setupLights();
        
        // Lag bakke (grønt gress)
        this.createGround();
        
        // Håndter vindustørrelse
        window.addEventListener('resize', this.handleResize);
    },
    
    // Oppsett av lys i scenen
    setupLights: function() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        CONFIG.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        CONFIG.scene.add(directionalLight);
    },
    
    // Lag bakkenivå
    createGround: function() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: CONFIG.colors.ground });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        CONFIG.scene.add(ground);
    },
    
    // Håndtere endring av vindusstørrelse
    handleResize: function() {
        CONFIG.camera.aspect = window.innerWidth / window.innerHeight;
        CONFIG.camera.updateProjectionMatrix();
        CONFIG.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    
    // Renderingsløkke
    render: function() {
        CONFIG.renderer.render(CONFIG.scene, CONFIG.camera);
    },
    
    // Fjerne alle objekter ved nivåendring
    clearScene: function() {
        // Beholder grunnleggende objekter som lys, men fjerner labyrint, spiller og egg
        while(CONFIG.scene.children.length > 0) { 
            CONFIG.scene.remove(CONFIG.scene.children[0]); 
        }
        
        // Gjenopprett grunnleggende elementer
        this.setupLights();
        this.createGround();
    }
};