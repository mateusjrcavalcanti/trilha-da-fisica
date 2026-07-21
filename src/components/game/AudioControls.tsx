import { Music, Volume1, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type AudioSettings = {
  muted: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
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
  const [audioActivated, setAudioActivated] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const audioEnabled = !settings.muted && (settings.musicEnabled || settings.sfxEnabled);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || controlsRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  const toggleMusic = () => {
    setSettings((current) => ({ ...current, muted: false, musicEnabled: !current.musicEnabled }));
    onEnableAudio();
  };

  const toggleSfx = () => {
    setSettings((current) => ({ ...current, muted: false, sfxEnabled: !current.sfxEnabled }));
    onEnableAudio();
  };

  return (
    <div className="relative" ref={controlsRef}>
      {open ? (
        <div className="game-window absolute bottom-[4.5rem] right-0 w-[min(calc(100vw-2rem),18rem)] p-3 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Áudio
          </div>

          <div className="mt-3 grid gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <Button size="icon" variant="ghost" className="h-12 w-12 shrink-0" onClick={toggleMusic} title="Ligar/desligar música">
                {settings.musicEnabled && !settings.muted ? (
                  <Music className="h-7 w-7 text-primary" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-7 w-7 text-red-600" aria-hidden="true" />
                )}
              </Button>
              <label className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">
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
                    setSettings((current) => ({ ...current, muted: false, musicVolume: Number(event.target.value), musicEnabled: true }))
                  }
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-12 w-12 shrink-0" onClick={toggleSfx} title="Ligar/desligar efeitos">
                {settings.sfxEnabled && !settings.muted ? (
                  <Volume1 className="h-7 w-7 text-primary" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-7 w-7 text-red-600" aria-hidden="true" />
                )}
              </Button>
              <label className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">
                Efeitos
                <input
                  className="audio-slider mt-1"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.sfxVolume}
                  onPointerDown={onEnableAudio}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, muted: false, sfxEnabled: true, sfxVolume: Number(event.target.value) }))
                  }
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}
      <Button
        className="ml-auto flex h-14 w-14 shadow-xl"
        size="icon"
        variant={audioEnabled ? "secondary" : "destructive"}
        title={audioEnabled ? "Abrir controles de áudio" : "Ativar áudio"}
        onClick={() => {
          const shouldUnlockAudio = !audioActivated;
          setAudioActivated(true);
          setOpen((current) => !current);
          if (shouldUnlockAudio) {
            setSettings((current) => ({
              ...current,
              muted: false,
              musicEnabled: true,
              sfxEnabled: true,
            }));
          }
          onEnableAudio();
        }}
      >
        {audioEnabled ? (
          <Volume2 className="h-7 w-7" aria-hidden="true" />
        ) : (
          <VolumeX className="h-7 w-7" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
