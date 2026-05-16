// Local ambient sound generator using Web Audio API
// No external files needed - generates soothing sounds programmatically

let audioContext: AudioContext | null = null;
let activeNodes: AudioNode[] = [];
let isPlaying = false;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

export interface AmbientSoundConfig {
    frequency?: number;
    type?: OscillatorType;
    volume?: number;
    duration?: number;
}

// Generate different ambient sounds based on track ID
export function playAmbientSound(trackId: string, volume: number = 0.3): void {
    stopAmbientSound();
    
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    isPlaying = true;
    
    // Different sound profiles based on track
    if (trackId.includes('sleep') || trackId.includes('ambient-1')) {
        generateThetaWaves(ctx, volume);
    } else if (trackId.includes('focus') || trackId.includes('ambient-2')) {
        generateAlphaWaves(ctx, volume);
    } else if (trackId.includes('happy') || trackId.includes('ambient-3')) {
        generateBetaWaves(ctx, volume);
    } else if (trackId.includes('anxious')) {
        generateCalmingDrone(ctx, volume);
    } else {
        // Default: gentle ambient
        generateDefaultAmbient(ctx, volume);
    }
}

function generateThetaWaves(ctx: AudioContext, volume: number): void {
    // Theta waves for deep relaxation and sleep (4-8 Hz)
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    // Base drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 100;
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.3;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();
    activeNodes.push(osc1);

    // Theta frequency modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfo.start();
    activeNodes.push(lfo);

    // Filtered noise for atmosphere
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.1;
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start();
    activeNodes.push(noise);
}

function generateAlphaWaves(ctx: AudioContext, volume: number): void {
    // Alpha waves for focus and calm (8-14 Hz)
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    // Harmonic frequencies
    const frequencies = [220, 277.18, 329.63]; // A3, C#4, E4
    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.2 / (i + 1);
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        activeNodes.push(osc);
    });

    // Gentle pulsing
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();
    activeNodes.push(lfo);
}

function generateBetaWaves(ctx: AudioContext, volume: number): void {
    // Beta waves for energy and positivity (14-30 Hz)
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    // More upbeat harmonics
    const frequencies = [261.63, 329.63, 392]; // C4, E4, G4
    frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        activeNodes.push(osc);
    });

    // Slight movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 30;
    lfo.connect(lfoGain);
    lfo.start();
    activeNodes.push(lfo);
}

function generateCalmingDrone(ctx: AudioContext, volume: number): void {
    // Anxiety relief - slow, descending
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 150;
    const gain1 = ctx.createGain();
    gain1.gain.value = 0.25;
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start();
    activeNodes.push(osc1);

    // Slow frequency decrease for release
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 10);

    // Very slow LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfo.start();
    activeNodes.push(lfo);
}

function generateDefaultAmbient(ctx: AudioContext, volume: number): void {
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    activeNodes.push(masterGain);

    // Simple ambient pad
    const frequencies = [196, 246.94, 293.66]; // G3, B3, D4
    frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = ctx.createGain();
        gain.gain.value = 0.2;
        
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        activeNodes.push(osc);
    });
}

export function stopAmbientSound(): void {
    activeNodes.forEach(node => {
        try {
            if ('stop' in node && typeof node.stop === 'function') {
                (node as OscillatorNode).stop();
            }
            node.disconnect();
        } catch (e) {
            // Node may already be disconnected
        }
    });
    activeNodes = [];
    isPlaying = false;
}

export function setAmbientVolume(volume: number): void {
    if (audioContext && activeNodes.length > 0) {
        // Find the master gain node (first GainNode)
        for (const node of activeNodes) {
            if (node instanceof GainNode) {
                node.gain.setValueAtTime(volume, audioContext.currentTime);
                break;
            }
        }
    }
}

export function getIsPlaying(): boolean {
    return isPlaying;
}

export function resumeAudioContext(): void {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}