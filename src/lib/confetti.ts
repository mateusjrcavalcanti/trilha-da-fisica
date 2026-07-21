import confetti from "canvas-confetti";

export function launchVictoryConfetti() {
  const endTime = Date.now() + 3200;
  const colors = ["#0f9f95", "#e4564f", "#f59e0b", "#14b8a6", "#ffffff"];

  const fire = (particleRatio: number, options: confetti.Options) => {
    void confetti({
      colors,
      disableForReducedMotion: true,
      origin: { y: 0.64 },
      spread: 90,
      ticks: 260,
      scalar: 1.05,
      ...options,
      particleCount: Math.floor(220 * particleRatio),
    });
  };

  fire(0.28, { origin: { x: 0.5, y: 0.58 }, spread: 120, startVelocity: 52 });
  fire(0.2, { origin: { x: 0.18, y: 0.78 }, angle: 60, spread: 70, startVelocity: 48 });
  fire(0.2, { origin: { x: 0.82, y: 0.78 }, angle: 120, spread: 70, startVelocity: 48 });

  const interval = window.setInterval(() => {
    if (Date.now() > endTime) {
      window.clearInterval(interval);
      return;
    }

    void confetti({
      colors,
      disableForReducedMotion: true,
      particleCount: 18,
      spread: 80,
      startVelocity: 34,
      ticks: 210,
      scalar: 0.92,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.35,
      },
    });
  }, 180);
}
