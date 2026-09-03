"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer, SkipForward, Maximize2, Minimize2, Plus, Minus, X, Settings2 } from "lucide-react";

export function FocusTimerWidget() {
  const [sessionLength, setSessionLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);

  const [totalSeconds, setTotalSeconds] = useState(sessionLength * 60);
  const [maxSeconds, setMaxSeconds] = useState(sessionLength * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (totalSeconds === 0) {
      clearTimer();
      setIsRunning(false);
      if (!isBreak) {
        setSessionsCompleted((s) => s + 1);
        setIsBreak(true);
        setTotalSeconds(breakLength * 60);
        setMaxSeconds(breakLength * 60);
      } else {
        setIsBreak(false);
        setTotalSeconds(sessionLength * 60);
        setMaxSeconds(sessionLength * 60);
      }
    } else {
      clearTimer();
    }
    return () => clearTimer();
  }, [isRunning, totalSeconds, isBreak, breakLength, sessionLength, clearTimer]);

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (totalSeconds > 0) setIsRunning(true);
  };

  const handlePause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsRunning(false);
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsRunning(false);
    setIsBreak(false);
    setTotalSeconds(sessionLength * 60);
    setMaxSeconds(sessionLength * 60);
  };

  const handleSkip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsRunning(false);
    if (!isBreak) {
      setSessionsCompleted((s) => s + 1);
      setIsBreak(true);
      setTotalSeconds(breakLength * 60);
      setMaxSeconds(breakLength * 60);
    } else {
      setIsBreak(false);
      setTotalSeconds(sessionLength * 60);
      setMaxSeconds(sessionLength * 60);
    }
  };

  const adjustTime = (minutes: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTotalSeconds((prev) => {
      const newTotal = Math.max(0, prev + minutes * 60);
      setMaxSeconds((max) => Math.max(max, newTotal));
      return newTotal;
    });
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSessionLength(val);
    if (!isRunning && !isBreak) {
      setTotalSeconds(val * 60);
      setMaxSeconds(val * 60);
    }
  };

  const handleBreakChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBreakLength(val);
    if (!isRunning && isBreak) {
      setTotalSeconds(val * 60);
      setMaxSeconds(val * 60);
    }
  };

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = maxSeconds > 0 ? ((maxSeconds - totalSeconds) / maxSeconds) * 100 : 0;

  // Render Widget
  return (
    <>
      <div 
        className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-[10px] p-5 card-hover h-full text-white cursor-pointer group transition-all"
        onClick={() => setIsExpanded(true)}
      >
        <button 
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[10px] bg-white/15 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm">Focus Timer</h3>
          </div>

          <div className="text-center mb-1">
            <p className="text-5xl font-bold font-mono tracking-wider" style={{ letterSpacing: "-0.02em" }}>{display}</p>
            <p className="text-xs text-white/70 mt-1">
              {isBreak ? "Break Time" : "Focus Session"}
            </p>
          </div>
          
          <div className="flex justify-center gap-2 mb-3">
            <button 
              onClick={(e) => adjustTime(-1, e)} 
              className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/25 rounded-md transition-colors"
            >
              -1 min
            </button>
            <button 
              onClick={(e) => adjustTime(1, e)} 
              className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-white/10 hover:bg-white/25 rounded-md transition-colors"
            >
              +1 min
            </button>
          </div>

          <div className="w-full h-1 bg-white/15 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-[10px] bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={isRunning ? handlePause : handlePlay}
              className="w-14 h-14 rounded-[10px] bg-white flex items-center justify-center text-primary hover:shadow-lg transition-all hover:scale-105"
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            <button
              onClick={handleSkip}
              className="w-10 h-10 rounded-[10px] bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all"
              aria-label="Skip to next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-gradient-to-br from-primary to-primary/90 rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-between shadow-2xl relative text-white animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="absolute top-8 left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <Settings2 className="w-6 h-6" />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              
              {showSettings ? (
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-[24px] max-w-sm w-full space-y-6 animate-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-bold mb-4">Timer Settings</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Focus Duration (minutes)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={120}
                      value={sessionLength}
                      onChange={handleSessionChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-[12px] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 opacity-80">Break Duration (minutes)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={60}
                      value={breakLength}
                      onChange={handleBreakChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-[12px] text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full py-3 bg-white text-primary font-bold rounded-[12px] hover:bg-white/90 transition-colors mt-4"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-xl md:text-3xl font-medium opacity-80 mb-4 tracking-wide uppercase">
                      {isBreak ? "Break Time" : "Deep Focus"}
                    </p>
                    <div className="relative group">
                      <p className="text-[6rem] md:text-[14rem] font-bold font-mono tracking-tighter leading-none select-none">
                        {display}
                      </p>
                      {/* Hover quick actions */}
                      <div className="absolute inset-x-0 bottom-[-3rem] flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => adjustTime(-5, e)} className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full font-bold text-sm backdrop-blur-md">-5m</button>
                        <button onClick={(e) => adjustTime(-1, e)} className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full font-bold text-sm backdrop-blur-md">-1m</button>
                        <button onClick={(e) => adjustTime(1, e)} className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full font-bold text-sm backdrop-blur-md">+1m</button>
                        <button onClick={(e) => adjustTime(5, e)} className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full font-bold text-sm backdrop-blur-md">+5m</button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-2xl mt-16 mb-12">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleReset}
                      className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all hover:scale-105"
                    >
                      <RotateCcw className="w-7 h-7" />
                    </button>
                    <button
                      onClick={isRunning ? handlePause : handlePlay}
                      className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-primary hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                    >
                      {isRunning ? (
                        <Pause className="w-10 h-10" />
                      ) : (
                        <Play className="w-10 h-10 ml-1.5" />
                      )}
                    </button>
                    <button
                      onClick={handleSkip}
                      className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all hover:scale-105"
                    >
                      <SkipForward className="w-7 h-7" />
                    </button>
                  </div>

                  {sessionsCompleted > 0 && (
                    <div className="absolute bottom-0 text-center opacity-70">
                      <p className="text-lg">
                        {sessionsCompleted} focus session{sessionsCompleted > 1 ? "s" : ""} completed today
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
