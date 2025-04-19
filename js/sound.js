// Håndterer lyd i spillet
import { CONFIG } from './config.js';

export const SoundModule = {
    audioContext: null,
    sounds: {},
    initialized: false,
    
    // Initialiser lyd-systemet
    init: function() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            
            // Last inn alle lydeffekter
            this.loadSounds();
            
            console.log('Sound system initialized');
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
            CONFIG.soundEnabled = false;
        }
    },
    
    // Last inn alle lydeffekter
    loadSounds: function() {
        // Definer alle lydeffekter som skal lastes inn
        const soundsToLoad = {
            'gameStart': 'sounds/game-start.mp3',
            'hop': 'sounds/hop.mp3',
            'collectEgg': 'sounds/collect-egg.mp3',
            'levelComplete': 'sounds/level-complete.mp3',
            'gameComplete': 'sounds/game-complete.mp3',
            'crocodileBite': 'sounds/collect-egg.mp3' // Midlertidig bruk egg-lyd for krokodille
        };
        
        // Last inn hver lydfil
        Object.keys(soundsToLoad).forEach(key => {
            this.loadSound(key, soundsToLoad[key]);
        });
    },
    
    // Last inn en enkelt lydfil
    loadSound: function(name, url) {
        // Sjekk om lyd er aktivert
        if (!CONFIG.soundEnabled || !this.initialized) return;
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.sounds[name] = audioBuffer;
                console.log(`Sound "${name}" loaded successfully`);
            })
            .catch(e => {
                console.warn(`Could not load sound "${name}" from ${url}`, e);
                // Fallback to create a silent buffer
                this.createSilentBuffer(name);
            });
    },
    
    // Opprett en stille buffer som fallback ved lastingsfeil
    createSilentBuffer: function(name) {
        const buffer = this.audioContext.createBuffer(2, 22050, 44100);
        this.sounds[name] = buffer;
    },
    
    // Spill en lydeffekt
    play: function(name, options = {}) {
        // Sjekk om lyd er aktivert
        if (!CONFIG.soundEnabled || !this.initialized) return;
        
        // Sjekk om lyden er lastet inn
        if (!this.sounds[name]) {
            console.warn(`Sound "${name}" not loaded yet`);
            return;
        }
        
        // Resume the audio context if it's suspended (needed for Chrome's autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Opprett en source node
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[name];
        
        // Opprett en gain node for volum
        const gainNode = this.audioContext.createGain();
        
        // Sett volum basert på type (musikk eller lydeffekt)
        const volume = options.isBgm ? CONFIG.musicVolume : CONFIG.sfxVolume;
        gainNode.gain.value = options.volume || volume;
        
        // Koble sammen nodes
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Spill lyden
        source.start(0);
        
        return source; // Returner source i tilfelle vi vil stoppe eller endre lyden senere
    },
    
    // Spill spillstart-lyd
    playGameStart: function() {
        return this.play('gameStart');
    },
    
    // Spill hoppe-lyd
    playHop: function() {
        return this.play('hop');
    },
    
    // Spill egg-samling lyd
    playCollectEgg: function() {
        return this.play('collectEgg');
    },
    
    // Spill nivå-fullført lyd
    playLevelComplete: function() {
        return this.play('levelComplete');
    },
    
    // Spill spill-fullført lyd
    playGameComplete: function() {
        return this.play('gameComplete');
    },
    
    // Spill krokodille-bit lyd
    playCrocodileBite: function() {
        // Spill med lavere pitch og volum for dyp krokodillelyd
        return this.play('crocodileBite', { volume: 1.2 });
    }
};