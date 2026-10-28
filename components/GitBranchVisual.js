'use client';
import React from 'react';

/**
 * GitBranchVisual
 * A minimal, animated SVG visualization of Git branching and merging.
 * Displays a main branch, a feature branch splitting off with commits,
 * and cleanly merging back into main.
 */
export default function GitBranchVisual() {
  return (
    <div className="git-visual-container" aria-label="Interactive Git branching and merging visualization">
      <svg
        className="git-branch-svg"
        viewBox="0 0 380 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Git Branching and Merging</title>

        {/* Subtle background track guides */}
        <g className="git-guide-tracks" aria-hidden="true">
          <line x1="24" y1="95" x2="356" y2="95" className="git-track-line" />
          <line x1="125" y1="45" x2="260" y2="45" className="git-track-line git-track-feat" />
        </g>

        {/* Main branch permanent connection line */}
        <path
          d="M 24 95 L 356 95"
          className="git-path-main"
        />

        {/* Feature branch animated curve: split -> commits -> merge */}
        <path
          d="M 125 95 C 160 95, 160 45, 195 45 L 260 45 C 290 45, 290 95, 320 95"
          className="git-path-feat"
        />

        {/* Main Commits */}
        {/* M1: Initial commit */}
        <g className="git-node node-m1">
          <circle cx="60" cy="95" r="5" className="git-circle-main" />
        </g>

        {/* M2: Branch origin commit */}
        <g className="git-node node-m2">
          <circle cx="125" cy="95" r="5" className="git-circle-main" />
        </g>

        {/* M3: Concurrent commit on main */}
        <g className="git-node node-m3">
          <circle cx="200" cy="95" r="5" className="git-circle-main" />
        </g>

        {/* Merge Commit on Main */}
        <g className="git-node node-merge">
          <circle cx="320" cy="95" r="6.5" className="git-circle-merge-outer" />
          <circle cx="320" cy="95" r="3.5" className="git-circle-merge-inner" />
        </g>

        {/* Feature Branch Commits */}
        {/* F1: First feature commit */}
        <g className="git-node node-f1">
          <circle cx="195" cy="45" r="5" className="git-circle-feat" />
        </g>

        {/* F2: Second feature commit */}
        <g className="git-node node-f2">
          <circle cx="260" cy="45" r="5" className="git-circle-feat" />
        </g>

        {/* Animated Tracer Dot moving along the feature branch */}
        <circle
          cx="0"
          cy="0"
          r="3.5"
          className="git-tracer-dot"
        >
          <animateMotion
            path="M 125 95 C 160 95, 160 45, 195 45 L 260 45 C 290 45, 290 95, 320 95"
            dur="8s"
            repeatCount="indefinite"
            keyTimes="0; 0.14; 0.16; 0.32; 0.38; 0.50; 0.56; 0.68; 0.74; 1"
            keyPoints="0; 0; 0; 0.38; 0.38; 0.654; 0.654; 1; 1; 1"
            calcMode="linear"
          />
          <animate
            attributeName="opacity"
            values="0; 0; 1; 1; 1; 1; 1; 1; 0; 0"
            keyTimes="0; 0.14; 0.16; 0.32; 0.38; 0.50; 0.56; 0.68; 0.74; 1"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Branch & Merge Labels */}
        <text x="24" y="118" className="git-label git-label-main">
          main
        </text>

        <text x="135" y="30" className="git-label git-label-feat">
          feature
        </text>

        <text x="320" y="118" textAnchor="middle" className="git-label git-label-merge">
          merge
        </text>
      </svg>
    </div>
  );
}
