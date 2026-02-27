/**
 * Input field showing currently typed text with a clear button.
 * Sits between the game canvas and the keyboard.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface InputFieldProps {
    value: string;
    onClear: () => void;
}

export function InputField({ value, onClear }: InputFieldProps) {
    return (
        <View style={styles.container}>
            <View style={styles.inputBox}>
                <Text style={[styles.inputText, !value && styles.placeholder]}>
                    {value || 'Type the words...'}
                </Text>
                {value.length > 0 && (
                    <Pressable onPress={onClear} style={styles.clearButton} hitSlop={12}>
                        <Text style={styles.clearText}>✕</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 55, 0.7)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.25)',
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
        letterSpacing: 1,
    },
    placeholder: {
        color: 'rgba(148, 163, 184, 0.4)',
        fontWeight: '400',
    },
    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(100, 100, 140, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '700',
    },
});
