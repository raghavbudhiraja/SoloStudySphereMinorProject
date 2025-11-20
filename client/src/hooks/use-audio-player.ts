import { useRef, useEffect, useState, useCallback } from "react";

interface AudioPlayerOptions {
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export function useAudioPlayer(options: AudioPlayerOptions = {}) {
  const {
    volume = 0.5,
    fadeInDuration = 2000,
    fadeOutDuration = 500
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [desiredUrl, setDesiredUrl] = useState<string>("");
  const [shouldBePlaying, setShouldBePlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeVolume = useCallback((targetVolume: number, duration: number, onComplete?: () => void) => {
    if (!audioRef.current) {
      onComplete?.();
      return;
    }

    clearFadeInterval();

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeDelta = targetVolume - startVolume;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      audio.volume = Math.max(0, Math.min(1, startVolume + volumeDelta * progress));

      if (currentStep >= steps) {
        clearFadeInterval();
        audio.volume = targetVolume;
        onComplete?.();
      }
    }, stepDuration);
  }, []);

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;

    clearFadeInterval();
    fadeVolume(0, fadeOutDuration, () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentUrl("");
    });
  }, [fadeVolume, fadeOutDuration]);

  const playAudio = useCallback((url: string, onError?: (error: Error) => void) => {
    if (!audioRef.current || !url) return;

    setIsLoading(true);
    clearFadeInterval();

    const audio = audioRef.current;
    
    if (currentUrl && isPlaying) {
      fadeVolume(0, fadeOutDuration, () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        startNewAudio();
      });
    } else {
      startNewAudio();
    }

    function startNewAudio() {
      if (!audioRef.current) return;
      
      const audio = audioRef.current;
      audio.src = url;
      audio.volume = 0;

      const handleCanPlay = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);

        audio.play()
          .then(() => {
            setCurrentUrl(url);
            setIsPlaying(true);
            fadeVolume(volume, fadeInDuration, () => {
              setIsLoading(false);
            });
          })
          .catch((error) => {
            setIsLoading(false);
            setIsPlaying(false);
            onError?.(error);
          });
      };

      const handleError = () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        setIsLoading(false);
        setIsPlaying(false);
        onError?.(new Error("Failed to load audio"));
      };

      audio.addEventListener('canplay', handleCanPlay, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      audio.load();
    }
  }, [currentUrl, isPlaying, fadeVolume, volume, fadeInDuration, fadeOutDuration]);

  // Automatically sync playback with desired state
  useEffect(() => {
    if (shouldBePlaying && desiredUrl && desiredUrl !== currentUrl) {
      playAudio(desiredUrl);
    } else if (shouldBePlaying && desiredUrl && !isPlaying && !isLoading) {
      playAudio(desiredUrl);
    } else if (!shouldBePlaying && isPlaying) {
      stopAudio();
    }
  }, [shouldBePlaying, desiredUrl, currentUrl, isPlaying, isLoading]);

  const play = useCallback((url: string, onError?: (error: Error) => void) => {
    setDesiredUrl(url);
    setShouldBePlaying(true);
  }, []);

  const stop = useCallback(() => {
    setShouldBePlaying(false);
    setDesiredUrl("");
  }, []);

  const pause = useCallback(() => {
    setShouldBePlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (desiredUrl) {
      setShouldBePlaying(true);
    }
  }, [desiredUrl]);

  const toggle = useCallback((url?: string, onError?: (error: Error) => void) => {
    if (isPlaying) {
      pause();
    } else if (url) {
      play(url, onError);
    } else {
      resume();
    }
  }, [isPlaying, play, pause, resume]);

  const setSound = useCallback((url: string) => {
    setDesiredUrl(url);
  }, []);

  return {
    play,
    stop,
    pause,
    resume,
    toggle,
    setSound,
    isPlaying,
    isLoading,
    currentUrl: desiredUrl,
    audioElement: audioRef.current,
  };
}
