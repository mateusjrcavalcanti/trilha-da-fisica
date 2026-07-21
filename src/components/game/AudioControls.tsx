import { Music, SlidersHorizontal, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type AudioSettings = {
  muted: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
};

type AudioControlsProps = {
  settings: AudioSettings;
  setSettings: Dispatch<SetStateAction<AudioSettings>>;
  onEnableAudio: () => void;
};

export function AudioControls({ settings, setSettings, onEnableAudio }: AudioControlsProps) {
  const [open, setOpen] = useState(false);

  const toggleMute = () => {
    setSettings((current) => ({ ...current, muted: !current.muted }));
    onEnableAudio();
  };

  const toggleMusic = () => {
    setSettings((current) => ({ ...current, musicEnabled: !current.musicEnabled }));
    onEnableAudio();
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      {open ? (
        <div className="game-window mb-2 w-[min(calc(100vw-2rem),18rem)] p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Music className="h-4 w-4 text-primary" aria-hidden="true" />
              Áudio
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMusic} title="Ligar/desligar música">
                <Music className={settings.musicEnabled ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute} title="Silenciar áudio">
                {settings.muted ? <VolumeX className="h-4 w-4 text-red-600" /> : <Volume2 className="h-4 w-4 text-primary" />}
              </Button>
            </div>
          </div>

          <label className="mt-3 block text-xs font-medium text-muted-foreground">
            Música
            <input
              className="audio-slider mt-1"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.musicVolume}
              onPointerDown={onEnableAudio}
              onChange={(event) =>
                setSettings((current) => ({ ...current, musicVolume: Number(event.target.value), musicEnabled: true }))
              }
            />
          </label>

          <label className="mt-2 block text-xs font-medium text-muted-foreground">
            Efeitos
            <input
              className="audio-slider mt-1"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.sfxVolume}
              onPointerDown={onEnableAudio}
              onChange={(event) => setSettings((current) => ({ ...current, sfxVolume: Number(event.target.value) }))}
            />
          </label>
        </div>
      ) : null}
      <Button
        className="ml-auto flex h-14 w-14 shadow-xl"
        size="icon"
        variant="secondary"
        title="Abrir controles de áudio"
        onClick={() => {
          setOpen((current) => !current);
          onEnableAudio();
        }}
      >
        <SlidersHorizontal className="h-7 w-7" aria-hidden="true" />
      </Button>
    </div>
  );
}
