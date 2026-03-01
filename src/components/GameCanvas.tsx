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
    LinearGradient,
    Rect,
    RoundedRect,
    Shadow,
    Text as SkiaText,
    rect,
    rrect,
    useFont,
    vec,
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

/** Shimmer sharp highlight width */
const SHIMMER_WIDTH = 80;
/** Soft glow layer width */
const SHIMMER_GLOW_WIDTH = 140;

interface WordBoxProps {
    word: WordEntity;
    font: NonNullable<ReturnType<typeof useFont>>;
}

function WordBox({ word, font }: WordBoxProps) {
    const textMetrics = font.measureText(word.text);
    const boxWidth = textMetrics.width + WORD_BOX.PADDING_X * 2;
    const boxHeight = WORD_BOX.FONT_SIZE + WORD_BOX.PADDING_Y * 2;

    // Exit animation — scale 1→1.2, opacity 1→0 over 300ms
    const ANIM_DURATION = 300;
    let scale = 1;
    let opacity = 1;
    if (word.matched && word.matchedTime > 0) {
        const elapsed = performance.now() - word.matchedTime;
        const t = Math.min(elapsed / ANIM_DURATION, 1); // 0→1
        scale = 1 + 0.2 * t;    // 1 → 1.2
        opacity = 1 - t;         // 1 → 0
    }

    // Shimmer offset — fast sweep across the box
    const shimmerCycle = boxWidth + SHIMMER_GLOW_WIDTH * 2;
    const shimmerX = ((word.y * 2.0) % shimmerCycle) - SHIMMER_GLOW_WIDTH;
    const highlightX = shimmerX + (SHIMMER_GLOW_WIDTH - SHIMMER_WIDTH) / 2;

    // Center point for scale transform
    const cx = word.x + boxWidth / 2;
    const cy = word.y + boxHeight / 2;

    // Clip definition — rounded rect matching the box
    const clipRect = rrect(
        rect(word.x, word.y, boxWidth, boxHeight),
        WORD_BOX.BORDER_RADIUS,
        WORD_BOX.BORDER_RADIUS,
    );

    return (
        <Group
            transform={[{ scale }]}
            origin={vec(cx, cy)}
            opacity={opacity}
        >
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

            {/* Shimmer — two layers clipped, rotated 45° */}
            <Group clip={clipRect}>
                <Group
                    transform={[{ rotate: Math.PI / 4 }]}
                    origin={vec(
                        word.x + shimmerX + SHIMMER_GLOW_WIDTH / 2,
                        word.y + boxHeight / 2,
                    )}
                >
                    {/* Layer 1 — wide diffuse glow */}
                    <Rect
                        x={word.x + shimmerX}
                        y={word.y - boxHeight * 1.5}
                        width={SHIMMER_GLOW_WIDTH}
                        height={boxHeight * 4}
                    >
                        <LinearGradient
                            start={vec(word.x + shimmerX, word.y)}
                            end={vec(word.x + shimmerX + SHIMMER_GLOW_WIDTH, word.y)}
                            colors={[
                                'rgba(255, 255, 255, 0)',
                                'rgba(180, 160, 255, 0.04)',
                                'rgba(200, 180, 255, 0.08)',
                                'rgba(180, 160, 255, 0.04)',
                                'rgba(255, 255, 255, 0)',
                            ]}
                        />
                    </Rect>

                    {/* Layer 2 — sharp specular highlight */}
                    <Rect
                        x={word.x + highlightX}
                        y={word.y - boxHeight * 1.5}
                        width={SHIMMER_WIDTH}
                        height={boxHeight * 4}
                    >
                        <LinearGradient
                            start={vec(word.x + highlightX, word.y)}
                            end={vec(word.x + highlightX + SHIMMER_WIDTH, word.y)}
                            colors={[
                                'rgba(255, 255, 255, 0)',
                                'rgba(255, 255, 255, 0.03)',
                                'rgba(220, 210, 255, 0.10)',
                                'rgba(255, 255, 255, 0.22)',
                                'rgba(255, 255, 255, 0.28)',
                                'rgba(255, 255, 255, 0.22)',
                                'rgba(220, 210, 255, 0.10)',
                                'rgba(255, 255, 255, 0.03)',
                                'rgba(255, 255, 255, 0)',
                            ]}
                        />
                    </Rect>
                </Group>
            </Group>

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

            {/* Partial match highlight */}
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
