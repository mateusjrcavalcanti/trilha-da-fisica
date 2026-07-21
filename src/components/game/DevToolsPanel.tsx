import { FlaskConical } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type DevToolsPanelProps = {
  open: boolean;
  revealCorrect: boolean;
  useFixedDice: boolean;
  diceValue: number;
  onOpenChange: (open: boolean) => void;
  onRevealCorrectChange: (enabled: boolean) => void;
  onUseFixedDiceChange: (enabled: boolean) => void;
  onDiceValueChange: (value: number) => void;
};

export function DevToolsPanel({
  open,
  revealCorrect,
  useFixedDice,
  diceValue,
  onOpenChange,
  onRevealCorrectChange,
  onUseFixedDiceChange,
  onDiceValueChange,
}: DevToolsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [onOpenChange, open]);

  return (
    <div className="relative" ref={panelRef}>
      {open ? (
        <div className="game-window absolute bottom-[4.5rem] right-0 w-[min(calc(100vw-2rem),19rem)] p-3 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <FlaskConical className="h-4 w-4 text-primary" aria-hidden="true" />
            Desenvolvimento
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs font-medium text-muted-foreground">
            <input
              className="mt-0.5 accent-primary"
              type="checkbox"
              checked={revealCorrect}
              onChange={(event) => onRevealCorrectChange(event.target.checked)}
            />
            <span>Marcar resposta correta</span>
          </label>
          <label className="mt-3 flex items-start gap-2 text-xs font-medium text-muted-foreground">
            <input
              className="mt-0.5 accent-primary"
              type="checkbox"
              checked={useFixedDice}
              onChange={(event) => onUseFixedDiceChange(event.target.checked)}
            />
            <span>Escolher próximo dado</span>
          </label>
          <div className="mt-3 text-xs font-medium text-muted-foreground">Próximo número</div>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <Button
                key={value}
                className="h-8 px-0"
                size="sm"
                variant={useFixedDice && diceValue === value ? "default" : "secondary"}
                onClick={() => {
                  onUseFixedDiceChange(true);
                  onDiceValueChange(value);
                }}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
      <Button
        className="ml-auto flex h-14 w-14 shadow-xl"
        size="icon"
        variant="secondary"
        title="Abrir ferramentas de desenvolvimento"
        onClick={() => onOpenChange(!open)}
      >
        <FlaskConical className="h-7 w-7" aria-hidden="true" />
      </Button>
    </div>
  );
}
