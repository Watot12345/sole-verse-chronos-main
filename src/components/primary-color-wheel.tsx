import { useCallback, useEffect, useRef, useState } from "react";

interface PrimaryColorWheelProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
  wheelOnly?: boolean;
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    return { h: 0, s: 0, l: 10 };
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const WHEEL_SIZE = 128;

export function PrimaryColorWheel({
  value,
  onChange,
  label = "Primary Color",
  wheelOnly = false,
}: PrimaryColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [hsl, setHsl] = useState(() => hexToHsl(value));
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const parsed = hexToHsl(value);
    setHsl(parsed);
  }, [value]);

  const pickFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = wheelRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const radius = rect.width / 2;

      const angleRad = Math.atan2(dy, dx);
      let deg = (angleRad * 180) / Math.PI + 90;
      if (deg < 0) deg += 360;

      const dist = Math.min(Math.hypot(dx, dy), radius);
      const sat = Math.round((dist / radius) * 100);
      const nextL = wheelOnly ? 50 : hsl.l < 8 || hsl.l > 92 ? 50 : hsl.l;
      const next = { h: Math.round(deg) % 360, s: sat, l: nextL };
      setHsl(next);
      onChange(hslToHex(next.h, next.s, next.l));
    },
    [hsl.l, onChange, wheelOnly],
  );

  const handleLightnessChange = (nextL: number) => {
    const next = { ...hsl, l: nextL };
    setHsl(next);
    onChange(hslToHex(next.h, next.s, next.l));
  };

  // Marker position on the wheel
  const angleRad = ((hsl.h - 90) * Math.PI) / 180;
  const rPx = (hsl.s / 100) * (WHEEL_SIZE / 2);
  const markerX = WHEEL_SIZE / 2 + Math.cos(angleRad) * rPx;
  const markerY = WHEEL_SIZE / 2 + Math.sin(angleRad) * rPx;

  const wheelElement = (
    <div
      ref={wheelRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        pickFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        pickFromPointer(e.clientX, e.clientY);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className="relative shrink-0 cursor-crosshair rounded-full border border-border/80 shadow-inner touch-none select-none"
      style={{
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        background:
          "radial-gradient(circle, #ffffff 0%, transparent 70%), conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
      }}
      aria-label="Primary color wheel picker"
      role="slider"
      aria-valuetext={value}
    >
      <span
        className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)]"
        style={{
          left: markerX,
          top: markerY,
          backgroundColor: value,
        }}
      />
    </div>
  );

  const primaryListElement = (
    <div className="mt-3 pt-3 border-t border-border/60">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Primary Colors
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[
          { name: "Black", hex: "#0a0a0a" },
          { name: "White", hex: "#ffffff" },
          { name: "Red", hex: "#ef4444" },
          { name: "Blue", hex: "#3b82f6" },
          { name: "Yellow", hex: "#eab308" },
          { name: "Green", hex: "#16a34a" },
          { name: "Orange", hex: "#f97316" },
          { name: "Silver", hex: "#c0c0c0" },
        ].map((c) => {
          const active = value.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => onChange(c.hex)}
              title={c.name}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium transition-colors ${
                active
                  ? "border-electric bg-electric/15 text-electric"
                  : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full border border-white/25 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (wheelOnly) {
    return (
      <div>
        <div className="flex justify-center py-1">{wheelElement}</div>
        {primaryListElement}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-xs font-bold uppercase text-foreground">{value}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Interactive HSL Color Wheel */}
        {wheelElement}

        {/* Lightness & exact hex controls */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Lightness</span>
              <span className="font-mono">{hsl.l}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={hsl.l}
              onChange={(e) => handleLightnessChange(Number(e.target.value))}
              className="w-full accent-electric cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#0a0a0a"}
              onChange={(e) => onChange(e.target.value)}
              title="System color picker"
              className="h-8 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => {
                const v = e.target.value;
                onChange(v);
              }}
              maxLength={7}
              placeholder="#0a0a0a"
              className="w-full rounded-lg border border-border bg-background/60 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-electric"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Single primary colorway saved for this sneaker.
          </p>
        </div>
      </div>

      {primaryListElement}
    </div>
  );
}
