/**
 * Audio manager using expo-audio.
 * Preloads sound effects and provides play functions.
 */


// Note: In expo-audio, we use useAudioPlayer hook inside components.
// For imperative usage outside React, we use a simple manager pattern.

export type SoundName =
    | 'keyTap'
    | 'wordComplete'
    | 'combo'
    | 'miss'
    | 'levelUp'
    | 'gameOver';

/**
 * Sound manager — provides a hook to get sound players.
 * Usage:
 *   const { playSound } = useSoundManager();
 *   playSound('wordComplete');
 */

// We'll generate simple tones programmatically since we don't have audio files yet.
// In production, replace these with actual .wav/.mp3 assets.

// For now, expo-audio requires actual audio files.
// We'll create a lightweight wrapper that can be extended with real assets later.

let audioEnabled = true;

export function setAudioEnabled(enabled: boolean) {
    audioEnabled = enabled;
}

export function isAudioEnabled(): boolean {
    return audioEnabled;
}

// Placeholder: Sound file mapping.
// Replace these paths with actual audio assets when available.
export const SOUND_ASSETS: Record<SoundName, number | null> = {
    keyTap: null,
    wordComplete: null,
    combo: null,
    miss: null,
    levelUp: null,
    gameOver: null,
};

/**
 * Simple feedback via haptics as audio placeholder.
 * When you add real sound files:
 * 1. Put .wav files in assets/sounds/
 * 2. Update SOUND_ASSETS with require('../../assets/sounds/tap.wav')
 * 3. Use useAudioPlayer(source) from expo-audio in a hook
 */
