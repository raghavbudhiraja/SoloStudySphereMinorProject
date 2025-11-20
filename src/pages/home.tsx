import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  ChevronDown, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Plus, 
  Check,
  Image as ImageIcon,
  Music,
  Clock,
  Loader2,
  CloudRain,
  Waves,
  Flame,
  Coffee,
  Trees,
  Music2,
  X
} from "lucide-react";
import type { Goal, InsertGoal, InsertStudySession } from "@shared/schema";
import libraryBg from "@assets/generated_images/warm_cozy_library_study_space.png";
import forestBg from "@assets/generated_images/peaceful_forest_clearing_scene.png";
import spaceBg from "@assets/generated_images/calming_cosmic_space_vista.png";
import coffeeBg from "@assets/generated_images/inviting_coffee_shop_interior.png";
import heroBg from "@assets/generated_images/dreamy_study_desk_hero.png";

const backgrounds = [
  { id: "library", name: "Library", image: libraryBg },
  { id: "forest", name: "Forest", image: forestBg },
  { id: "space", name: "Space", image: spaceBg },
  { id: "coffee", name: "Coffee Shop", image: coffeeBg },
];

const soundscapes = [
  { 
    id: "rain", 
    name: "Rain", 
    icon: CloudRain,
    url: "https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112ce8f.mp3"
  },
  { 
    id: "waves", 
    name: "Ocean Waves", 
    icon: Waves,
    url: "https://cdn.pixabay.com/download/audio/2022/06/07/audio_6b2cfbebf7.mp3"
  },
  { 
    id: "fire", 
    name: "Fireplace", 
    icon: Flame,
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4dedf2f94a.mp3"
  },
  { 
    id: "cafe", 
    name: "Café Ambience", 
    icon: Coffee,
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c9011bc3f0.mp3"
  },
  { 
    id: "forest", 
    name: "Forest", 
    icon: Trees,
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_2dff3e0ca0.mp3"
  },
  { 
    id: "binaural", 
    name: "Binaural Beats", 
    icon: Music2,
    url: "https://cdn.pixabay.com/download/audio/2022/10/06/audio_ce6fe5b45c.mp3"
  },
  { 
    id: "none", 
    name: "Silence", 
    icon: VolumeX,
    url: ""
  },
];

export default function Home() {
  const { toast } = useToast();
  const audioPlayer = useAudioPlayer({ volume: 0.5, fadeInDuration: 2000, fadeOutDuration: 500 });
  
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0].id);
  const [selectedSound, setSelectedSound] = useState("none");
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [showGoalsPanel, setShowGoalsPanel] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const studyRoomRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout>();
  const sessionStartTimeRef = useRef<number>(0);
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentBg = backgrounds.find(bg => bg.id === selectedBackground)?.image || backgrounds[0].image;
  const currentSound = soundscapes.find(s => s.id === selectedSound);

  // Fetch goals
  const { data: goals = [], isLoading: goalsLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goal: InsertGoal) => {
      return apiRequest<Goal>("POST", "/api/goals", goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setNewGoalText("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      return apiRequest<Goal>("PATCH", `/api/goals/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (session: InsertStudySession) => {
      return apiRequest("POST", "/api/sessions", session);
    },
    onSuccess: () => {
      toast({
        title: "Session completed!",
        description: "Great work! Your study session has been saved.",
      });
    },
  });

  // Initialize completion audio
  useEffect(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFA==');
    completionAudioRef.current = audio;
    return () => {
      if (completionAudioRef.current) {
        completionAudioRef.current.src = '';
      }
    };
  }, []);

  // Unlock all audio on first user interaction
  const unlockAudio = () => {
    if (!audioUnlocked) {
      setAudioUnlocked(true);
      
      // Unlock ambient audio
      if (audioPlayer.audioElement) {
        audioPlayer.audioElement.play().then(() => {
          audioPlayer.audioElement?.pause();
        }).catch(() => {
          toast({
            title: "Audio Notice",
            description: "Click play to enable audio playback.",
            variant: "default",
          });
        });
      }
      
      // Unlock completion audio
      if (completionAudioRef.current) {
        completionAudioRef.current.play().then(() => {
          if (completionAudioRef.current) {
            completionAudioRef.current.pause();
            completionAudioRef.current.currentTime = 0;
          }
        }).catch(() => {});
      }
    }
  };

  const scrollToStudyRoom = () => {
    unlockAudio();
    studyRoomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startTimer = () => {
    unlockAudio();
    if (timeLeft === 0) {
      setTimeLeft(timerMinutes * 60);
      sessionStartTimeRef.current = Date.now();
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(0);
    sessionStartTimeRef.current = 0;
  };

  const toggleSound = () => {
    unlockAudio();
    audioPlayer.toggle();
  };

  const addGoal = () => {
    const trimmedText = newGoalText.trim();
    if (!trimmedText) {
      return;
    }
    
    const newGoal: InsertGoal = {
      text: trimmedText,
      completed: false,
      order: goals.length,
    };
    createGoalMutation.mutate(newGoal);
  };

  const toggleGoalComplete = (id: string, completed: boolean) => {
    updateGoalMutation.mutate({ id, updates: { completed: !completed } });
  };

  const deleteGoal = (id: string) => {
    deleteGoalMutation.mutate(id);
  };

  // Update audio player when sound selection changes
  useEffect(() => {
    const soundUrl = currentSound?.url || "";
    audioPlayer.setSound(soundUrl);
    
    if (soundUrl && audioPlayer.isPlaying) {
      audioPlayer.play(soundUrl, (error) => {
        toast({
          title: "Audio Error",
          description: "Unable to play audio. Please try again.",
          variant: "destructive",
        });
      });
    } else if (!soundUrl) {
      audioPlayer.stop();
    }
  }, [selectedSound]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Timer completion effect
  useEffect(() => {
    if (timeLeft === 0 && sessionStartTimeRef.current > 0) {
      // Play completion sound
      if (completionAudioRef.current) {
        completionAudioRef.current.currentTime = 0;
        completionAudioRef.current.play().catch((error) => {
          toast({
            title: "Audio Notice",
            description: "Could not play completion sound.",
            variant: "default",
          });
        });
      }

      // Save session
      const session: InsertStudySession = {
        duration: timerMinutes,
        background: selectedBackground,
        soundscape: selectedSound,
      };
      createSessionMutation.mutate(session);
      
      sessionStartTimeRef.current = 0;
    }
  }, [timeLeft, timerMinutes, selectedBackground, selectedSound, createSessionMutation]);

  // Inactivity detection
  const resetInactivityTimer = () => {
    setShowControls(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      if (isTimerRunning) {
        setShowControls(false);
      }
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = timeLeft > 0 ? ((timerMinutes * 60 - timeLeft) / (timerMinutes * 60)) * 100 : 0;

  return (
    <div className="relative">
      {/* Landing Section */}
      <section 
        className="relative h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="font-display text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
            Forget the Outside World
          </h1>
          
          <div className="text-lg lg:text-xl text-white/90 mb-12 space-y-3 max-w-2xl mx-auto">
            <p className="font-light">Leave behind the noise and chaos</p>
            <p className="font-light">Escape the endless notifications</p>
            <p className="font-light">Step away from visual clutter</p>
            <p className="font-light">Release mental distractions</p>
          </div>

          <Button
            size="lg"
            onClick={scrollToStudyRoom}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8 py-6 text-lg font-medium transition-all duration-300"
            data-testid="button-start-study"
          >
            Start Solo Study
            <ChevronDown className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white/60" />
        </div>
      </section>

      {/* Study Room Section */}
      <section 
        ref={studyRoomRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${currentBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.8s ease-in-out',
        }}
        onMouseMove={resetInactivityTimer}
        onClick={resetInactivityTimer}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

        {/* Environment Controls */}
        <div 
          className={`absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 transition-all duration-500 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Background Selector */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-white/80" />
                  <h3 className="text-sm font-medium text-white/90">Environment</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setSelectedBackground(bg.id)}
                      className={`relative aspect-video rounded-md overflow-hidden border-2 transition-all ${
                        selectedBackground === bg.id 
                          ? 'border-white scale-105' 
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      data-testid={`button-background-${bg.id}`}
                    >
                      <img 
                        src={bg.image} 
                        alt={bg.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{bg.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Soundscape Selector */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Music className="h-5 w-5 text-white/80" />
                  <h3 className="text-sm font-medium text-white/90">Soundscape</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {soundscapes.map((sound) => {
                    const IconComponent = sound.icon;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => setSelectedSound(sound.id)}
                        className={`p-3 rounded-md border transition-all text-center ${
                          selectedSound === sound.id 
                            ? 'bg-white/20 border-white' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                        data-testid={`button-sound-${sound.id}`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-1 text-white/90" />
                        <div className="text-xs text-white/90 font-medium">{sound.name}</div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSound}
                    disabled={selectedSound === "none"}
                    className="text-white/90 hover:text-white hover:bg-white/10 disabled:opacity-50"
                    data-testid="button-toggle-sound"
                  >
                    {audioPlayer.isPlaying ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    {audioPlayer.isLoading ? 'Loading...' : audioPlayer.isPlaying ? 'Playing' : 'Paused'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative z-10 text-center">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-12 min-w-[400px]">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-white/80" />
              <h2 className="text-xl font-medium text-white/90">Focus Timer</h2>
            </div>
            
            {timeLeft === 0 && !isTimerRunning ? (
              <div className="mb-8">
                <label className="block text-sm text-white/70 mb-3">Session Length (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 25)}
                  className="bg-white/10 border-white/20 text-white text-center text-lg h-12"
                  data-testid="input-timer-minutes"
                />
              </div>
            ) : (
              <div className="mb-8">
                <div className="text-8xl font-bold text-white tabular-nums mb-4" data-testid="text-timer-display">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={timerProgress} className="h-2 bg-white/20" />
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!isTimerRunning ? (
                <Button
                  size="lg"
                  onClick={startTimer}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8"
                  data-testid="button-start-timer"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={pauseTimer}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8"
                  data-testid="button-pause-timer"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              
              {timeLeft > 0 && (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={resetTimer}
                  className="text-white/90 hover:text-white hover:bg-white/10"
                  data-testid="button-reset-timer"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Goals Panel */}
        <div 
          className={`absolute right-0 top-0 h-full w-96 bg-black/30 backdrop-blur-xl border-l border-white/10 transition-transform duration-300 ${
            showGoalsPanel ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Study Goals</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGoalsPanel(false)}
                className="text-white/90 hover:text-white hover:bg-white/10"
                data-testid="button-close-goals"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-4 flex gap-2">
              <Input
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !createGoalMutation.isPending && addGoal()}
                placeholder="Add a goal..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                disabled={createGoalMutation.isPending}
                data-testid="input-new-goal"
              />
              <Button
                onClick={addGoal}
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                disabled={createGoalMutation.isPending || !newGoalText.trim()}
                data-testid="button-add-goal"
              >
                {createGoalMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {goalsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-white/60 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-start gap-3 p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors group"
                      data-testid={`goal-item-${goal.id}`}
                    >
                      <Checkbox
                        checked={goal.completed}
                        onCheckedChange={() => toggleGoalComplete(goal.id, goal.completed)}
                        className="mt-1 border-white/30 data-[state=checked]:bg-white/20"
                        disabled={updateGoalMutation.isPending}
                        data-testid={`checkbox-goal-${goal.id}`}
                      />
                      <span 
                        className={`flex-1 text-white/90 ${
                          goal.completed ? 'line-through opacity-50' : ''
                        }`}
                        data-testid={`text-goal-${goal.id}`}
                      >
                        {goal.text}
                      </span>
                      {goal.completed && (
                        <Check className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {goals.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-white/70">
                  {goals.filter(g => g.completed).length} of {goals.length} completed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Panel Toggle Button */}
        {!showGoalsPanel && (
          <Button
            onClick={() => setShowGoalsPanel(true)}
            className={`absolute right-6 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-lg border border-white/10 text-white hover:bg-black/30 transition-all duration-500 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            data-testid="button-open-goals"
          >
            Goals ({goals.length})
          </Button>
        )}
      </section>
    </div>
  );
}
