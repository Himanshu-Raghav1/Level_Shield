"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function BehaviorTracker() {
  const pathname = usePathname();

  // Telemetry buffers (useRef so we don't trigger re-renders)
  const mouseMoves = useRef(0);
  const mouseRandomness = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const clicks = useRef(0);
  const scrollDepth = useRef(0);
  const focusBlurs = useRef(0);
  const pastes = useRef(0);
  const chartHovers = useRef(0);
  
  const keyTimes = useRef<number[]>([]);
  const dwellStart = useRef(Date.now());

  // Helper to read level_shield_session cookie
  const getSessionId = (): string => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp('(^| )level_shield_session=([^;]+)'));
    if (match) return match[2];
    
    // Generate/Reuse an in-memory session identifier if cookie is not set
    let localSess = sessionStorage.getItem("level_shield_temp_session");
    if (!localSess) {
      localSess = `sess_local_${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem("level_shield_temp_session", localSess);
    }
    return localSess;
  };

  // Calculate typing cadence (average interval between keys in ms)
  const getTypingCadence = (): number => {
    if (keyTimes.current.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < keyTimes.current.length; i++) {
      sum += keyTimes.current[i] - keyTimes.current[i - 1];
    }
    return Math.floor(sum / (keyTimes.current.length - 1));
  };

  // Helper to flush current metrics to the backend
  const flushBehavior = async () => {
    const dwellTime = Math.floor((Date.now() - dwellStart.current) / 1000);
    const sessionId = getSessionId();

    const payload = {
      sessionId,
      pathname,
      mouseMoves: mouseMoves.current,
      mouseRandomness: mouseRandomness.current,
      clicks: clicks.current,
      scrollDepth: scrollDepth.current,
      focusBlurs: focusBlurs.current,
      pastes: pastes.current,
      chartHovers: chartHovers.current,
      typingCadence: getTypingCadence(),
      dwellTime,
    };

    // Only send if there's actual activity or dwell time is positive
    if (mouseMoves.current === 0 && clicks.current === 0 && scrollDepth.current === 0 && dwellTime < 2) {
      return;
    }

    try {
      const res = await fetch("/api/events/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Reset telemetry buffers after successful flush
        mouseMoves.current = 0;
        mouseRandomness.current = 0;
        clicks.current = 0;
        focusBlurs.current = 0;
        pastes.current = 0;
        chartHovers.current = 0;
        keyTimes.current = [];
        dwellStart.current = Date.now();
      }
    } catch (err) {
      // Catch silently to support local frontend testing mode
      console.debug("Behavior flush caught (expected when server offline):", err);
    }
  };

  useEffect(() => {
    // 1. Mouse movement tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseMoves.current++;

      const x = e.clientX;
      const y = e.clientY;
      const dx = x - lastMousePos.current.x;
      const dy = y - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 2) {
        const vx = dx / dist;
        const vy = dy / dist;

        if (lastMousePos.current.vx !== 0 || lastMousePos.current.vy !== 0) {
          // Sharp direction changes increase the randomness score
          const dot = vx * lastMousePos.current.vx + vy * lastMousePos.current.vy;
          if (dot < 0.4) {
            mouseRandomness.current++;
          }
        }
        lastMousePos.current = { x, y, vx, vy };
      } else {
        lastMousePos.current.x = x;
        lastMousePos.current.y = y;
      }
    };

    // 2. Scroll tracking
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const currentPct = Math.round((window.scrollY / docHeight) * 100);
      if (currentPct > scrollDepth.current) {
        scrollDepth.current = currentPct;
      }
    };

    // 3. Click tracking
    const handleClick = () => {
      clicks.current++;
    };

    // 4. Keyboard / Cadence tracking
    const handleKeyDown = () => {
      const times = keyTimes.current;
      times.push(Date.now());
      if (times.length > 10) {
        times.shift();
      }
    };

    // 5. Paste detection
    const handlePaste = () => {
      pastes.current++;
    };

    // 6. Focus / Blur tracking
    const handleFocusBlur = () => {
      focusBlurs.current++;
    };

    // 7. Chart Hover detection (using event delegation for efficiency)
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.(".recharts-responsive-container") || target?.closest?.(".recharts-wrapper")) {
        chartHovers.current++;
      }
    };

    // Attach all event listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    window.addEventListener("paste", handlePaste, { passive: true });
    window.addEventListener("focus", handleFocusBlur, { passive: true });
    window.addEventListener("blur", handleFocusBlur, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Periodic flush interval every 4 seconds
    const interval = setInterval(flushBehavior, 4000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("focus", handleFocusBlur);
      window.removeEventListener("blur", handleFocusBlur);
      window.removeEventListener("mouseover", handleMouseOver);
      clearInterval(interval);
    };
  }, [pathname]);

  // Force a flush when navigating between pages
  useEffect(() => {
    flushBehavior();
  }, [pathname]);

  return null; // Invisible component
}
