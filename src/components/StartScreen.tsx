/**
 * Start screen with title and play button.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface StartScreenProps {
    onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
    return (
        <View style={styles.container}>
            <View style={styles.titleBlock}>
                <Text style={styles.title}>WORD</Text>
                <Text style={styles.titleAccent}>RAIN</Text>
            </View>

            <Text style={styles.subtitle}>Type the falling words before they disappear</Text>

            <Pressable
                onPress={onStart}
                style={({ pressed }) => [
                    styles.playButton,
                    pressed && styles.playPressed,
                ]}
            >
                <Text style={styles.playText}>START GAME</Text>
            </Pressable>

            <Text style={styles.hint}>Tap letters on the keyboard to type words</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a1a',
        paddingHorizontal: 32,
    },
    titleBlock: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 52,
        fontWeight: '900',
        color: '#f1f5f9',
        letterSpacing: 12,
    },
    titleAccent: {
        fontSize: 52,
        fontWeight: '900',
        color: '#a855f7',
        letterSpacing: 12,
        marginTop: -8,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(148, 163, 184, 0.5)',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 20,
    },
    playButton: {
        paddingVertical: 18,
        paddingHorizontal: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(139, 92, 246, 0.5)',
        marginBottom: 24,
    },
    playPressed: {
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        transform: [{ scale: 0.97 }],
    },
    playText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#a855f7',
        letterSpacing: 3,
    },
    hint: {
        fontSize: 12,
        color: 'rgba(148, 163, 184, 0.3)',
    },
});
