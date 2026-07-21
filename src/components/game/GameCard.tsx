import { Bot, Check, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GameCardAction = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  status?: "correct" | "incorrect" | "neutral";
  prominentIcon?: "play";
  ariaLabel?: string;
};

type GameCardProps = {
  title: string;
  subtitle?: string;
  actions?: GameCardAction[];
  position?: "left" | "center" | "right";
  showRobotIcon?: boolean;
  player?: "jogadorUm" | "jogadorDois";
  playerColor?: string;
};

const positions = {
  left: "left-4 top-4 md:left-8",
  center: "left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2",
  right: "right-4 top-4 md:right-8",
};

const faviconUrl = `${import.meta.env.BASE_URL}favicon.png`;

export function GameCard({
  title,
  subtitle,
  actions = [],
  position = "center",
  showRobotIcon = false,
  player,
  playerColor,
}: GameCardProps) {
  return (
    <Card
      className={cn(
        "game-window fixed z-20 max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),27rem)] overflow-y-auto bg-card/95",
        positions[position],
      )}
    >
      <CardHeader className="items-center text-center">
        {showRobotIcon || !player ? (
          <div
            className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border bg-card/70 shadow-sm"
            style={{ borderColor: playerColor }}
          >
            {showRobotIcon ? (
              <img src={faviconUrl} alt="" className="h-12 w-12 object-contain" />
            ) : (
              <Bot className="h-9 w-9 text-primary" aria-hidden="true" />
            )}
          </div>
        ) : null}
        <CardTitle>{title}</CardTitle>
        {subtitle ? <CardDescription className="text-base text-foreground/78">{subtitle}</CardDescription> : null}
      </CardHeader>
      {actions.length ? (
        <CardContent className="grid gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              className={cn(
                "h-auto min-h-11 justify-between whitespace-normal text-left leading-5",
                action.prominentIcon && "mx-auto h-16 min-h-16 w-16 justify-center rounded-full p-0 text-center",
                action.status === "correct" && "border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-100",
                action.status === "incorrect" && "border-red-500 bg-red-100 text-red-950 hover:bg-red-100",
              )}
              onClick={action.onClick}
              disabled={action.disabled}
              aria-label={action.ariaLabel}
              title={action.ariaLabel}
              variant={action.status && action.status !== "neutral" ? "outline" : "secondary"}
            >
              {action.prominentIcon === "play" ? (
                <Play className="h-8 w-8 fill-current" aria-hidden="true" />
              ) : (
                <span>{action.label}</span>
              )}
              {action.status === "correct" ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              {action.status === "incorrect" ? <X className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            </Button>
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}
