import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EndGameCardProps = {
  winnerName: string;
  scores: {
    jogadorUm: number;
    jogadorDois: number;
  };
  onRestart: () => void;
};

export function EndGameCard({ winnerName, scores, onRestart }: EndGameCardProps) {
  return (
    <Card className="game-window fixed left-1/2 top-[58%] z-20 max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),27rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-card/95">
      <CardHeader className="items-center text-center">
        <CardTitle>
          🏆 O <strong>{winnerName}</strong> venceu!
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-teal-200 bg-card/70 p-4 text-center shadow-sm">
            <div className="text-xs font-semibold uppercase text-[#0f766e]">Jogador 01</div>
            <div className="mt-2 text-4xl font-bold text-[#0f766e]">{scores.jogadorUm + 1}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-card/70 p-4 text-center shadow-sm">
            <div className="text-xs font-semibold uppercase text-[#c2413b]">Jogador 02</div>
            <div className="mt-2 text-4xl font-bold text-[#c2413b]">{scores.jogadorDois + 1}</div>
          </div>
        </div>
        <Button className="mx-auto h-12 gap-2 rounded-full px-5" onClick={onRestart}>
          <Play className="h-5 w-5 fill-current" aria-hidden="true" />
          Jogar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
