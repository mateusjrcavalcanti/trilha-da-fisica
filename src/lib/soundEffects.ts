export type EffectName = "start" | "correct" | "wrong" | "dice" | "walk" | "fall" | "punch" | "victory" | "draw";

type ToneOptions = {
  frequency: number;
  duration?: number;
  delay?: number;
  type?: OscillatorType;
  volume?: number;
};

type TonePlayer = (options: ToneOptions) => void;

export function playSoundEffect(effect: EffectName, amount: number, playTone: TonePlayer) {
  if (effect === "start") {
    [261.63, 329.63, 392].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.08, duration: 0.14, type: "triangle", volume: 0.32 }),
    );
  }

  if (effect === "correct") {
    [523.25, 659.25, 783.99].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.055, duration: 0.14, type: "sine", volume: 0.38 }),
    );
  }

  if (effect === "wrong") {
    [220, 174.61].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.09, duration: 0.18, type: "sawtooth", volume: 0.24 }),
    );
  }

  if (effect === "dice") {
    Array.from({ length: 7 }).forEach((_, index) =>
      playTone({ frequency: 360 + index * 42, delay: index * 0.045, duration: 0.045, type: "square", volume: 0.12 }),
    );
  }

  if (effect === "walk") {
    const steps = Math.min(18, Math.max(4, amount * 3));
    Array.from({ length: steps }).forEach((_, index) =>
      playTone({ frequency: index % 2 ? 155 : 130, delay: index * 0.13, duration: 0.045, type: "triangle", volume: 0.16 }),
    );
  }

  if (effect === "fall") {
    [196, 146.83, 98].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.11, duration: 0.22, type: "sawtooth", volume: 0.24 }),
    );
  }

  if (effect === "punch") {
    playTone({ frequency: 88, duration: 0.08, type: "square", volume: 0.45 });
    playTone({ frequency: 176, delay: 0.055, duration: 0.09, type: "sawtooth", volume: 0.26 });
  }

  if (effect === "victory") {
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.09, duration: 0.22, type: "triangle", volume: 0.34 }),
    );
  }

  if (effect === "draw") {
    [329.63, 392, 329.63].forEach((frequency, index) =>
      playTone({ frequency, delay: index * 0.11, duration: 0.2, type: "sine", volume: 0.24 }),
    );
  }
}
