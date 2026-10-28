import React from 'react';

/**
 * 3D Mathematical Landscape with Live Animated Holographic HUD:
 * - Paraboloid loss surface with animated gradient descent flow
 * - Borderless floating 3D matrix projection with pulsing diagonal
 * - Borderless live loss monitor with animated trajectory & pulse telemetry
 * - Borderless floating gradient vector ∇L(θ)
 */
export default function HeroGraphic() {
  // Contour level sets on the floor plane
  const floorContours = [
    "M 366.0,263.8 L 357.6,257.7 L 345.6,253.0 L 330.8,250.1 L 314.4,249.1 L 297.6,250.1 L 281.9,253.2 L 268.3,257.9 L 257.9,264.0 L 251.6,271.0 L 249.8,278.4 L 252.6,285.5 L 259.9,291.8 L 271.1,296.9 L 285.3,300.3 L 301.4,301.8 L 318.2,301.2 L 334.4,298.7 L 348.6,294.3 L 359.9,288.5 L 367.3,281.7 L 370.2,274.4 L 368.5,267.2 Z",
    "M 413.9,253.7 L 398.4,242.5 L 376.1,233.8 L 348.6,228.3 L 318.1,226.5 L 287.0,228.4 L 257.7,234.1 L 232.5,242.9 L 213.2,254.2 L 201.5,267.2 L 198.1,280.8 L 203.4,294.1 L 217.0,305.8 L 237.8,315.2 L 264.2,321.6 L 294.1,324.3 L 325.3,323.3 L 355.2,318.6 L 381.7,310.5 L 402.6,299.7 L 416.4,287.0 L 421.9,273.5 L 418.7,260.1 Z",
    "M 461.9,243.7 L 439.2,227.2 L 406.5,214.5 L 366.4,206.5 L 321.9,203.9 L 276.4,206.7 L 233.6,214.9 L 196.7,227.8 L 168.5,244.4 L 151.4,263.4 L 146.5,283.3 L 154.2,302.6 L 174.1,319.8 L 204.5,333.6 L 243.0,342.9 L 286.8,346.9 L 332.3,345.4 L 376.1,338.5 L 414.8,326.7 L 445.4,310.9 L 465.5,292.4 L 473.5,272.6 L 468.9,252.9 Z",
    "M 509.8,233.7 L 480.0,212.0 L 437.0,195.3 L 384.2,184.8 L 325.6,181.2 L 265.8,185.0 L 209.5,195.8 L 160.9,212.8 L 123.9,234.6 L 101.3,259.6 L 94.8,285.8 L 105.1,311.2 L 131.2,333.9 L 171.1,352.0 L 221.9,364.2 L 279.4,369.5 L 339.4,367.5 L 397.0,358.4 L 447.9,342.8 L 488.1,322.1 L 514.6,297.7 L 525.1,271.6 L 519.0,245.8 Z",
    "M 557.8,223.7 L 520.8,196.8 L 467.5,176.0 L 402.0,163.0 L 329.4,158.6 L 255.2,163.3 L 185.3,176.7 L 125.1,197.8 L 79.2,224.8 L 51.2,255.8 L 43.2,288.3 L 55.9,319.8 L 88.3,347.9 L 137.8,370.3 L 200.7,385.4 L 272.1,392.0 L 346.4,389.6 L 417.9,378.3 L 481.0,359.0 L 530.9,333.3 L 563.7,303.1 L 576.8,270.7 L 569.2,238.7 Z"
  ];

  // Concentric 3D paraboloid rings
  const bowlRings = [
    "M 345.2,245.8 L 336.3,240.2 L 322.8,236.9 L 307.2,236.4 L 292.0,238.8 L 279.9,243.6 L 273.1,250.1 L 272.0,254.8 L 275.9,261.5 L 285.7,266.7 L 299.7,269.6 L 315.5,269.6 L 330.3,266.8 L 341.6,261.6 L 347.5,254.9 L 346.8,248.0 Z",
    "M 380.3,217.8 L 362.5,206.7 L 335.7,200.1 L 304.3,199.0 L 274.0,203.8 L 249.9,213.5 L 236.2,226.5 L 234.0,235.9 L 241.8,249.3 L 261.4,259.7 L 289.4,265.5 L 320.9,265.5 L 350.6,259.8 L 373.2,249.4 L 384.9,236.1 L 383.7,222.1 Z",
    "M 415.5,176.0 L 388.8,159.4 L 348.5,149.5 L 301.5,147.9 L 256.0,155.1 L 219.8,169.6 L 199.2,189.1 L 196.1,203.2 L 207.8,223.3 L 237.1,238.9 L 279.1,247.6 L 326.4,247.6 L 370.9,239.1 L 404.8,223.5 L 422.4,203.5 L 420.5,182.6 Z",
    "M 450.7,120.5 L 415.1,98.3 L 361.3,85.1 L 298.7,83.0 L 238.0,92.6 L 189.8,112.0 L 162.3,138.0 L 158.1,156.8 L 173.7,183.5 L 212.8,204.4 L 268.8,215.9 L 331.9,216.0 L 391.2,204.7 L 436.4,183.8 L 459.8,157.2 L 457.3,129.3 Z",
    "M 477.9,68.2 L 435.4,41.7 L 371.2,25.9 L 296.5,23.5 L 224.1,34.8 L 166.5,58.0 L 133.8,89.0 L 128.7,111.4 L 147.3,143.3 L 194.1,168.3 L 260.8,182.0 L 336.1,182.1 L 406.9,168.6 L 460.9,143.8 L 488.8,111.9 L 485.8,78.6 Z"
  ];

  // Radial spokes connecting bottom to rim
  const bowlSpokes = [
    "M 310,260 Q 325,252 345,245 Q 365,230 415,176 Q 445,120 478,68",
    "M 310,260 Q 302,246 292,238 Q 272,220 256,155 Q 235,92 224,35",
    "M 310,260 Q 295,255 273,250 Q 240,235 199,189 Q 165,138 134,89",
    "M 310,260 Q 305,266 299,269 Q 275,264 237,238 Q 185,191 147,143",
    "M 310,260 Q 320,266 330,266 Q 355,258 370,239 Q 405,198 460,143",
    "M 310,260 Q 312,248 312,236 Q 312,198 310,147 Q 305,83 296,23"
  ];

  // Gradient descent trajectory steps
  const trajPts = [
    { x: 440, y: 52 },
    { x: 422, y: 112 },
    { x: 402, y: 164 },
    { x: 380, y: 203 },
    { x: 359, y: 230 },
    { x: 337, y: 249 },
    { x: 310, y: 260 }
  ];

  const trajPath = "M " + trajPts.map(p => `${p.x},${p.y}`).join(" L ");

  return (
    <div className="hero-visual-wrap">
      <svg
        viewBox="0 0 620 420"
        className="hero-3d-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="axisGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--tx)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--tx)" stopOpacity="1.0" />
          </linearGradient>
          <radialGradient id="bowlBacklight" cx="50%" cy="55%" r="48%">
            <stop offset="0%" stopColor="var(--tx)" stopOpacity="0.08" />
            <stop offset="65%" stopColor="var(--tx)" stopOpacity="0.03" />
            <stop offset="100%" stopColor="var(--tx)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient glow behind bowl for 3D depth */}
        <circle cx="310" cy="180" r="160" fill="url(#bowlBacklight)" />

        {/* 1. Floor level-set contour ellipses */}
        <g stroke="var(--contour-stroke)" strokeWidth="1.2" strokeDasharray="4 3">
          {floorContours.map((d, i) => (
            <path key={'fc' + i} d={d} />
          ))}
        </g>

        {/* 2. Ground coordinate axes */}
        <g stroke="var(--axis-stroke)" strokeWidth="1.4">
          {/* X axis */}
          <line x1="310" y1="260" x2="560" y2="225" />
          <polyline points="552,221 560,225 553,230" fill="none" strokeWidth="1.6" />
          
          {/* Y axis */}
          <line x1="310" y1="260" x2="195" y2="155" />
          <polyline points="202,154 195,155 198,162" fill="none" strokeWidth="1.6" />

          {/* Negative projection rays */}
          <line x1="310" y1="260" x2="90" y2="325" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="90" cy="325" r="3" fill="var(--axis-stroke)" />
          <circle cx="195" cy="155" r="3" fill="var(--axis-stroke)" />
          <circle cx="560" cy="225" r="3" fill="var(--axis-stroke)" />
        </g>

        {/* 3. 3D Paraboloid Wireframe Bowl */}
        <g>
          {bowlSpokes.map((d, i) => (
            <path key={'sp' + i} d={d} stroke="var(--mesh-spoke)" strokeWidth="1.1" />
          ))}

          {bowlRings.map((d, i) => {
            const isRim = i === bowlRings.length - 1;
            return (
              <path
                key={'br' + i}
                d={d}
                stroke={isRim ? "var(--mesh-rim)" : "var(--mesh-ring)"}
                strokeWidth={isRim ? 2.0 : 1.2}
              />
            );
          })}
        </g>

        {/* 4. Vertical Z Axis */}
        <g>
          <line x1="310" y1="260" x2="310" y2="44" stroke="url(#axisGrad)" strokeWidth="1.8" />
          <polygon points="310,34 305,48 315,48" fill="var(--tx)" />
        </g>

        {/* 5. Animated Gradient Descent Trajectory Flow */}
        <path
          d={trajPath}
          fill="none"
          stroke="var(--tx)"
          strokeWidth="2.5"
          className="anim-traj-path"
        />
        {trajPts.map((p, i) => {
          const isMin = i === trajPts.length - 1;
          return (
            <circle
              key={'tp' + i}
              cx={p.x}
              cy={p.y}
              r={isMin ? 6.5 : 3.8}
              fill="var(--tx)"
              stroke="var(--bg)"
              strokeWidth={isMin ? 3.0 : 1.8}
              className={isMin ? "anim-min-dot" : "anim-step-dot"}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          );
        })}

        {/* Concentric pulsing radar rings at global minimum */}
        <circle cx="310" cy="260" r="10" stroke="var(--tx)" strokeWidth="1.2" className="anim-ripple-ring ring-1" />
        <circle cx="310" cy="260" r="18" stroke="var(--tx)" strokeWidth="0.8" className="anim-ripple-ring ring-2" />
      </svg>

      {/* Holographic Element 1: Seamless Matrix Projection (Top Left, No Box Outline) */}
      <div className="hero-hud-element matrix-hud">
        <div className="hud-label">Matrix Operator</div>
        <div className="bracket-matrix">
          <span className="bracket-left">[</span>
          <div className="matrix-rows">
            <div className="matrix-row">
              <span className="diag-1">1</span><span>0</span><span>0</span>
            </div>
            <div className="matrix-row">
              <span>0</span><span className="diag-1">1</span><span>0</span>
            </div>
            <div className="matrix-row">
              <span>0</span><span>0</span><span className="diag-1">1</span>
            </div>
          </div>
          <span className="bracket-right">]</span>
        </div>
      </div>

      {/* Holographic Element 2: Live Mini Loss Stream (Top Right, No Box Outline) */}
      <div className="hero-hud-element chart-hud">
        <div className="chart-hud-header">
          <span className="live-dot" />
          <span className="hud-metric">L(θ) → 0.002</span>
        </div>
        <svg viewBox="0 0 100 60" className="hud-chart-svg" fill="none">
          <line x1="6" y1="6" x2="6" y2="54" stroke="var(--axis-stroke)" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="6" y1="54" x2="94" y2="54" stroke="var(--axis-stroke)" strokeWidth="1.2" strokeDasharray="2 2" />
          <path d="M 6 12 Q 18 42 46 48 T 88 52" stroke="var(--tx)" strokeWidth="2.2" className="anim-loss-curve" />
          <circle cx="28" cy="38" r="3.2" fill="var(--tx)" />
          <circle cx="68" cy="51" r="3.2" fill="var(--tx)" />
          <circle cx="88" cy="52" r="4.2" fill="var(--p1)" className="chart-pulse-dot" />
        </svg>
      </div>

      {/* Holographic Element 3: Gradient Vector Formula (Right, No Box Outline) */}
      <div className="hero-hud-element grad-hud">
        <span className="grad-symbol">∇<i>L</i>(<i>θ</i>)</span>
        <span className="grad-arrow">↘</span>
      </div>
    </div>
  );
}
