'use client';
import React from 'react';

/**
 * Minimalist, High-Aesthetic 3D Loss Optimization Visual
 * - Clean wireframe loss manifold (paraboloid) with concentric level sets
 * - Animated gradient descent flow with traveling particle to global minimum θ*
 * - Crisp, high-contrast coordinate axes (L(θ), θ₁, θ₂)
 * - High legibility and contrast in both Light Mode (#fff) and Dark Mode (#000)
 */
export default function SimpleHeroVisual() {
  // Concentric 3D paraboloid rings (from rim to base)
  const bowlRings = [
    { d: "M 150,80 Q 260,35 370,80 Q 400,105 370,130 Q 260,175 150,130 Q 120,105 150,80 Z", isRim: true },
    { d: "M 172,112 Q 260,78 348,112 Q 372,130 348,148 Q 260,182 172,148 Q 148,130 172,112 Z" },
    { d: "M 198,144 Q 260,118 322,144 Q 340,158 322,170 Q 260,196 198,170 Q 180,158 198,144 Z" },
    { d: "M 226,176 Q 260,158 294,176 Q 306,186 294,194 Q 260,210 226,194 Q 214,186 226,176 Z" },
    { d: "M 248,206 Q 260,198 272,206 Q 278,212 272,216 Q 260,224 248,216 Q 242,212 248,206 Z" }
  ];

  // Radial wireframe spokes
  const bowlSpokes = [
    "M 260,215 Q 260,150 260,45",
    "M 260,215 Q 295,190 370,80",
    "M 260,215 Q 225,190 150,80",
    "M 260,215 Q 315,200 370,130",
    "M 260,215 Q 205,200 150,130",
    "M 260,215 Q 260,218 260,175"
  ];

  // Floor contour lines (expanding level-sets on the ground)
  const floorContours = [
    "M 210,230 Q 260,205 310,230 Q 330,245 310,260 Q 260,285 210,260 Q 190,245 210,230 Z",
    "M 175,238 Q 260,195 345,238 Q 375,258 345,278 Q 260,320 175,278 Q 145,258 175,238 Z",
    "M 135,248 Q 260,182 385,248 Q 425,272 385,298 Q 260,358 135,298 Q 95,272 135,248 Z"
  ];

  // Gradient descent steps trajectory
  const trajPoints = [
    { x: 355, y: 88 },
    { x: 338, y: 122 },
    { x: 312, y: 154 },
    { x: 288, y: 182 },
    { x: 272, y: 202 },
    { x: 260, y: 215 }
  ];

  const trajPath = "M " + trajPoints.map(p => `${p.x},${p.y}`).join(" L ");

  return (
    <div className="simple-visual-container">
      <svg
        viewBox="50 5 430 305"
        className="simple-loss-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="3D Loss Surface and Gradient Descent Optimization"
      >
        <defs>
          {/* Subtle glow at global minimum */}
          <radialGradient id="minGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--tx)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--tx)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient depth halo */}
        <circle cx="260" cy="215" r="90" fill="url(#minGlow)" />

        {/* 1. Floor Level-Set Contours */}
        <g className="svg-floor-contours" strokeDasharray="3 3">
          {floorContours.map((d, i) => (
            <path key={`fc-${i}`} d={d} />
          ))}
        </g>

        {/* 2. Ground Axes: θ₁ and θ₂ */}
        <g className="svg-ground-axes">
          {/* Axis θ₁ */}
          <line x1="260" y1="215" x2="440" y2="280" />
          <polyline points="433,275 440,280 433,284" />
          <text x="448" y="284" className="svg-axis-label">θ₁</text>

          {/* Axis θ₂ */}
          <line x1="260" y1="215" x2="80" y2="280" />
          <polyline points="87,275 80,280 87,284" />
          <text x="66" y="284" className="svg-axis-label">θ₂</text>
        </g>

        {/* 3. 3D Paraboloid Wireframe Mesh */}
        <g className="svg-bowl-mesh">
          {/* Radial Spokes */}
          {bowlSpokes.map((d, i) => (
            <path key={`sp-${i}`} d={d} className="svg-spoke" />
          ))}

          {/* Concentric Rings */}
          {bowlRings.map((ring, i) => (
            <path
              key={`ring-${i}`}
              d={ring.d}
              className={ring.isRim ? "svg-ring-rim" : "svg-ring"}
            />
          ))}
        </g>

        {/* 4. Vertical Z Axis: L(θ) (Loss) */}
        <g className="svg-loss-axis">
          <line x1="260" y1="215" x2="260" y2="28" />
          <polyline points="256,36 260,28 264,36" />
          <text x="260" y="18" textAnchor="middle" className="svg-loss-label">L(θ)</text>
        </g>

        {/* 5. Animated Gradient Descent Flow */}
        <g className="svg-trajectory-group">
          {/* Dashed descent trail */}
          <path d={trajPath} className="svg-traj-trail" />

          {/* Descent Step Dots */}
          {trajPoints.map((pt, i) => {
            const isMin = i === trajPoints.length - 1;
            return (
              <circle
                key={`tp-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isMin ? 5.5 : 3}
                className={isMin ? "svg-min-point" : "svg-step-point"}
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            );
          })}

          {/* Concentric ripple pulses at minimum θ* */}
          <circle cx="260" cy="215" r="10" className="svg-ripple-ring ring-1" />
          <circle cx="260" cy="215" r="18" className="svg-ripple-ring ring-2" />
        </g>

        {/* 6. Minimum Point Tag: θ* (Optimal Solution) */}
        <g className="svg-optima-tag" transform="translate(260, 245)">
          <text x="0" y="0" textAnchor="middle" className="svg-min-label">θ* (min L)</text>
        </g>

        {/* 7. Subtle Mathematical Gradient Indicator */}
        <g className="svg-grad-indicator" transform="translate(420, 60)">
          <text x="0" y="0" className="svg-grad-math">∇L(θ) → 0</text>
        </g>
      </svg>
    </div>
  );
}
