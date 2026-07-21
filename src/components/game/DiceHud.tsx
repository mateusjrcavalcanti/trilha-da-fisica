type DiceHudProps = {
  value: number | null;
  visible: boolean;
};

type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

const pipLayouts: Record<DiceValue, string[]> = {
  1: ["center"],
  2: ["top-left", "bottom-right"],
  3: ["top-left", "center", "bottom-right"],
  4: ["top-left", "top-right", "bottom-left", "bottom-right"],
  5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
  6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"],
};

function isDiceValue(value: number): value is DiceValue {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

export function DiceHud({ value, visible }: DiceHudProps) {
  if (!visible || value === null) return null;
  if (!isDiceValue(value)) return null;

  const pips = pipLayouts[value];

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <div className="game-window flex items-center gap-5 px-6 py-5 text-left">
        <div className="dice-cube" aria-hidden="true">
          {pips.map((pip) => (
            <span key={pip} className={`dice-pip dice-pip-${pip}`} />
          ))}
        </div>
        <div>
          <div className="text-sm font-medium uppercase text-muted-foreground">🎲 Dado rolado</div>
          <div className="mt-1 whitespace-nowrap text-xl font-bold">+{value} {value > 1 ? "casas" : "casa"}</div>
        </div>
      </div>
    </div>
  );
}
