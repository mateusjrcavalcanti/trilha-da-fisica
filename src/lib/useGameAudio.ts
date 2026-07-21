import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSoundEffect, type EffectName } from "./soundEffects";

export type MusicTrack = "menu" | "game";

type AudioSettings = {
  muted: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
};

const defaultSettings: AudioSettings = {
  muted: false,
  musicEnabled: true,
  musicVolume: 0.1,
  sfxVolume: 1,
};

const musicTracks: Record<MusicTrack, string> = {
  menu: `${import.meta.env.BASE_URL}sounds/menu-loop-tiggo.ogg`,
  game: `${import.meta.env.BASE_URL}sounds/game-loop-tigrun.ogg`,
};

function getStoredSettings() {
  try {
    const stored = window.localStorage.getItem("fisica-quiz-audio");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } as AudioSettings : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function useGameAudio() {
  const [settings, setSettings] = useState<AudioSettings>(() =>
    typeof window === "undefined" ? defaultSettings : getStoredSettings(),
  );
  const [musicBlocked, setMusicBlocked] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const musicRefs = useRef<Partial<Record<MusicTrack, HTMLAudioElement>>>({});
  const activeTrackRef = useRef<MusicTrack | null>(null);

  const ensureContext = useCallback(async () => {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!contextRef.current) {
      const context = new AudioCtor();
      const master = context.createGain();
      const sfxGain = context.createGain();

      sfxGain.gain.value = settings.muted ? 0 : settings.sfxVolume;

      sfxGain.connect(master);
      master.connect(context.destination);

      contextRef.current = context;
      sfxGainRef.current = sfxGain;
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }

    return contextRef.current;
  }, [settings.muted, settings.sfxVolume]);

  const playTone = useCallback(
    async ({
      frequency,
      duration = 0.16,
      delay = 0,
      type = "sine",
      volume = 0.35,
    }: {
      frequency: number;
      duration?: number;
      delay?: number;
      type?: OscillatorType;
      volume?: number;
    }) => {
      if (settings.muted) return;
      const context = await ensureContext();
      const target = sfxGainRef.current;
      if (!target) return;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime + delay;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gain);
      gain.connect(target);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    },
    [ensureContext, settings.muted],
  );

  const applyMusicSettings = useCallback(
    (audio: HTMLAudioElement) => {
      audio.loop = true;
      audio.volume = settings.muted || !settings.musicEnabled ? 0 : settings.musicVolume;
    },
    [settings.musicEnabled, settings.musicVolume, settings.muted],
  );

  const getMusicElement = useCallback(
    (track: MusicTrack) => {
      const current = musicRefs.current[track];
      if (current) {
        applyMusicSettings(current);
        return current;
      }

      const audio = new Audio(musicTracks[track]);
      audio.preload = "auto";
      applyMusicSettings(audio);
      musicRefs.current[track] = audio;
      return audio;
    },
    [applyMusicSettings],
  );

  const startMusic = useCallback(
    async (track: MusicTrack = "game") => {
      const target = getMusicElement(track);
      activeTrackRef.current = track;

      Object.entries(musicRefs.current).forEach(([trackName, audio]) => {
        if (trackName !== track) audio?.pause();
      });

      applyMusicSettings(target);
      if (settings.muted || !settings.musicEnabled) return;

      try {
        await target.play();
        setMusicBlocked(false);
      } catch {
        setMusicBlocked(true);
        // Browsers can block audio before a user gesture; the next explicit action retries playback.
      }
    },
    [applyMusicSettings, getMusicElement, settings.musicEnabled, settings.muted],
  );

  const stopMusic = useCallback(() => {
    Object.values(musicRefs.current).forEach((audio) => audio?.pause());
  }, []);

  const playEffect = useCallback(
    (effect: EffectName, amount = 1) => {
      if (settings.muted) return;
      playSoundEffect(effect, amount, (options) => void playTone(options));
    },
    [playTone, settings.muted],
  );

  useEffect(() => {
    window.localStorage.setItem("fisica-quiz-audio", JSON.stringify(settings));
    if (sfxGainRef.current) {
      sfxGainRef.current.gain.value = settings.muted ? 0 : settings.sfxVolume;
    }
    Object.values(musicRefs.current).forEach((audio) => {
      if (audio) applyMusicSettings(audio);
    });

    if (settings.muted || !settings.musicEnabled) {
      stopMusic();
    } else if (activeTrackRef.current) {
      const activeMusic = musicRefs.current[activeTrackRef.current];
      void activeMusic?.play().catch(() => undefined);
    }
  }, [applyMusicSettings, settings, stopMusic]);

  useEffect(() => () => stopMusic(), [stopMusic]);

  return useMemo(
    () => ({
      settings,
      setSettings,
      startMusic,
      stopMusic,
      musicBlocked,
      playEffect,
    }),
    [musicBlocked, playEffect, settings, startMusic, stopMusic],
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
