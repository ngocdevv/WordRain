/**
 * Main Skia Canvas — renders falling words and particles on the GPU.
 * Uses requestAnimationFrame for the game loop (JS thread safe).
 */

import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import {
    Canvas,
    Circle,
    Fill,
    Group,
    RoundedRect,
    Shadow,
    Text as SkiaText,
    useFont,
} from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { tick } from '../game/engine';
import { WORD_BOX } from '../game/game-config';
import { getActiveParticles } from '../game/particles';
import { getActiveWords, type WordEntity } from '../game/words';
import { useGameStore } from '../stores/game-store';

interface GameCanvasProps {
    height: number;
}

export function GameCanvas({ height }: GameCanvasProps) {
    const { width } = useWindowDimensions();
    const font = useFont(SpaceMono_700Bold, WORD_BOX.FONT_SIZE);
    const gameStatus = useGameStore((s) => s.gameStatus);

    // Force re-render for Skia declarative mode
    const [, setFrame] = useState(0);
    const rafRef = useRef<number | null>(null);

    // Game loop via requestAnimationFrame — stays on JS thread
    const loop = useCallback(() => {
        const now = performance.now();
        tick(now, width, height);
        setFrame((f) => f + 1);
        rafRef.current = requestAnimationFrame(loop);
    }, [width, height]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            rafRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [gameStatus, loop]);

    if (!font) return null;

    const words = getActiveWords();
    const particles = getActiveParticles();

    return (
        <Canvas style={{ width, height }}>
            {/* Background */}
            <Fill color="#0a0a1a" />

            {/* Falling words */}
            {words.map((word) => (
                <WordBox key={word.id} word={word} font={font} />
            ))}

            {/* Particles */}
            {particles.map((p, i) => (
                <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={p.radius}
                    color={`rgba(${p.r}, ${p.g}, ${p.b}, ${p.opacity})`}
                />
            ))}
        </Canvas>
    );
}

// ── Word Box Renderer ──────────────────────────────────────

interface WordBoxProps {
    word: WordEntity;
    font: NonNullable<ReturnType<typeof useFont>>;
}

function WordBox({ word, font }: WordBoxProps) {
    const textMetrics = font.measureText(word.text);
    const boxWidth = textMetrics.width + WORD_BOX.PADDING_X * 2;
    const boxHeight = WORD_BOX.FONT_SIZE + WORD_BOX.PADDING_Y * 2;

    return (
        <Group>
            {/* Glow background */}
            <RoundedRect
                x={word.x}
                y={word.y}
                width={boxWidth}
                height={boxHeight}
                r={WORD_BOX.BORDER_RADIUS}
                color="rgba(139, 92, 246, 0.15)"
            >
                <Shadow dx={0} dy={0} blur={16} color="rgba(139, 92, 246, 0.4)" />
            </RoundedRect>

            {/* Border */}
            <RoundedRect
                x={word.x}
                y={word.y}
                width={boxWidth}
                height={boxHeight}
                r={WORD_BOX.BORDER_RADIUS}
                color="rgba(168, 85, 247, 0.6)"
                style="stroke"
                strokeWidth={1.5}
            />

            {/* Full word text (dim when partially matched) */}
            <SkiaText
                x={word.x + WORD_BOX.PADDING_X}
                y={word.y + WORD_BOX.PADDING_Y + WORD_BOX.FONT_SIZE * 0.85}
                text={word.text}
                font={font}
                color={word.matchedChars > 0 ? 'rgba(226, 232, 240, 0.4)' : '#e2e8f0'}
            />

            {/* Partial match highlight — brighter accent on matched chars */}
            {word.matchedChars > 0 && (
                <SkiaText
                    x={word.x + WORD_BOX.PADDING_X}
                    y={word.y + WORD_BOX.PADDING_Y + WORD_BOX.FONT_SIZE * 0.85}
                    text={word.text.slice(0, word.matchedChars)}
                    font={font}
                    color="#22d3ee"
                />
            )}
        </Group>
    );
}
