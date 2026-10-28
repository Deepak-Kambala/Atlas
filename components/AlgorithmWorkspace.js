'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Viz from './Viz';
import Chart from './Chart';
import Tex, { Rich } from './Tex';
import { A, R } from '../lib/algorithms';

const SECTIONS = [
  { id: 'intuition', num: '01', label: 'Intuition' },
  { id: 'demo', num: '02', label: 'Interactive demo' },
  { id: 'math', num: '03', label: 'Math & loss' },
  { id: 'steps', num: '04', label: 'Step-by-step' },
  { id: 'hyper', num: '05', label: 'Hyperparameters' },
  { id: 'tradeoffs', num: '06', label: 'Strengths & weaknesses' },
  { id: 'use', num: '07', label: 'When to use' },
  { id: 'code', num: '08', label: 'Code' }
];

export default function AlgorithmWorkspace({ meta, ai, prev, next }) {
  const [activeTab, setActiveTab] = useState('demo');
  const [seed, setSeed] = useState(7);
  const [pv, setPv] = useState({});
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(false);
  const [spd, setSpd] = useState(3.5);
  const [copied, setCopied] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const copyTimeoutRef = useRef(null);

  const a = A[ai];
  const pm = a.pm ? (pv[ai] ?? a.pm[3]) : 0;

  // Reset step and playback when switching algorithm route
  useEffect(() => {
    setI(0);
    setPlay(false);
  }, [ai]);

  // Cleanup copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Generate simulation frames
  const S = useMemo(() => a.gen(R(seed * 97 + ai * 13 + 5), pm), [a, ai, seed, pm]);
  const n = S.length;
  const ix = Math.min(Math.max(0, i), Math.max(0, n - 1));
  const f = S[ix] || S[0] || {};

  // Auto-playback timer
  useEffect(() => {
    if (!play) return;
    const t = setTimeout(() => {
      if (ix < n - 1) {
        setI(ix + 1);
      } else {
        setPlay(false);
      }
    }, spd * 1000);
    return () => clearTimeout(t);
  }, [play, ix, spd, n]);

  // Keyboard navigation: Space = Play/Pause, Left/Right = Steps
  useEffect(() => {
    const k = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setI(v => Math.min(v + 1, n - 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setI(v => Math.max(v - 1, 0));
      }
      if (e.key === ' ') {
        e.preventDefault();
        setPlay(p => !p);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [n]);

  const reset = () => {
    setI(0);
    setPlay(false);
  };

  // Sparkline data extraction for the metric card
  const pr = useMemo(() => {
    return S.map((fr, j) => ({ j, x: fr.x ?? j, v: fr.v })).filter(p => p.v !== undefined);
  }, [S]);

  const cur = useMemo(() => {
    return [...pr].reverse().find(p => p.j <= ix);
  }, [pr, ix]);

  const cv = S.curve;

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(meta.code);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate SVG sparkline curve
  const sparklineData = useMemo(() => {
    if (!pr.length || pr.length < 2) return null;
    const W = 280, H = 54;
    const xs = pr.map(p => p.x);
    const ys = pr.map(p => p.v);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (y1 === y0) y1 = y0 + 1;

    const px = x => (x - x0) / ((x1 - x0) || 1) * (W - 20) + 10;
    const py = y => H - 10 - ((y - y0) / (y1 - y0)) * (H - 20);

    const currentPoints = pr.filter(p => p.j <= ix);
    if (!currentPoints.length) return null;

    const pointsStr = currentPoints.map(p => `${px(p.x).toFixed(1)},${py(p.v).toFixed(1)}`).join(' ');
    const activePoint = currentPoints[currentPoints.length - 1];

    return {
      W,
      H,
      pointsStr,
      dotX: px(activePoint.x),
      dotY: py(activePoint.v),
      fullPointsStr: pr.map(p => `${px(p.x).toFixed(1)},${py(p.v).toFixed(1)}`).join(' ')
    };
  }, [pr, ix]);

  // Contextual mathematical formula helper for step
  const contextualFormula = useMemo(() => {
    if (meta.math && meta.math.length > 0) {
      if (ix === 0 && meta.math[0]) return meta.math[0][1];
      if (meta.math[2]) return meta.math[2][1];
      if (meta.math[1]) return meta.math[1][1];
    }
    return null;
  }, [meta.math, ix]);

  return (
    <div className="workspace-shell">
      {/* =========================================================================
          COLUMN 1: Fixed Left Sidebar Navigation (240px)
          ========================================================================= */}
      <aside className="workspace-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-category">MACHINE LEARNING</div>
          <h1 className="sidebar-title">{meta.name}</h1>
          <p className="sidebar-tag">{meta.tag}</p>
          <div className="sidebar-badges">
            <span className="badge">{meta.type}</span>
            <span className="badge">{meta.task}</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Algorithm sections">
          {SECTIONS.map(sec => {
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(sec.id)}
              >
                <span className="nav-num">{sec.num}</span>
                <span className="nav-label">{sec.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="sidebar-footer-hint">Select a section to explore</span>
          <div className="sidebar-pager">
            {prev && (
              <Link href={`/ml/${prev.slug}`} className="pager-arrow" title={`Previous: ${prev.name}`}>
                ←
              </Link>
            )}
            {next && (
              <Link href={`/ml/${next.slug}`} className="pager-arrow" title={`Next: ${next.name}`}>
                →
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          COLUMN 2: Dominant Center Visualization Workspace (65%–72% width)
          ========================================================================= */}
      <section className="workspace-center">
        {/* Workspace Top Header */}
        <header className="workspace-center-header">
          <div className="center-header-copy">
            <h2 className="center-action-title">
              Watch {meta.name.toLowerCase()} learn
            </h2>
            <p className="center-action-sub">
              Follow each update in real time. Scrub or play to inspect the algorithm.
            </p>
          </div>

          <div className="center-header-meta">
            {cv && (
              <button
                className={`diagnostic-pill-btn ${showDiagnostic ? 'active' : ''}`}
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                title="Toggle diagnostic chart"
              >
                {showDiagnostic ? 'Show Plot' : cv.t.split(':')[0]}
              </button>
            )}
            <span className="step-pill-badge">
              Step {ix + 1} of {n}
            </span>
          </div>
        </header>

        {/* Dominant Visualization Canvas Frame (Fills Available Height) */}
        <div className="workspace-canvas-frame">
          {!showDiagnostic ? (
            <div className="canvas-svg-container">
              <Viz f={f} />
            </div>
          ) : (
            <div className="canvas-diagnostic-container">
              <Chart
                t={cv.t}
                xl={cv.xl}
                yl={cv.yl}
                xs={cv.x}
                series={cv.s}
                mark={cv.hi}
                hy={cv.hy}
                bar={cv.bar}
              />
            </div>
          )}

          <div className="canvas-footer-legend">
            {meta.type === 'Supervised'
              ? 'Training data · Current model fit'
              : 'Unlabelled data · Clustering iteration'}
          </div>
        </div>

        {/* Compact Playback Toolbar Directly Below Canvas */}
        <div className="workspace-toolbar">
          <div className="toolbar-playback-btns">
            <button
              className="tb-btn primary-play"
              onClick={() => {
                if (!play && ix >= n - 1) setI(0);
                setPlay(!play);
              }}
              title="Space to play/pause"
            >
              {play ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              className="tb-btn"
              onClick={() => setI(Math.max(0, ix - 1))}
              disabled={ix === 0}
              title="Step backward (←)"
            >
              ← Back
            </button>
            <button
              className="tb-btn"
              onClick={() => setI(Math.min(n - 1, ix + 1))}
              disabled={ix === n - 1}
              title="Step forward (→)"
            >
              Next →
            </button>
            <button className="tb-btn reset-icon-btn" onClick={reset} title="Restart from Step 1">
              ↺
            </button>
          </div>

          {/* Timeline Step Scrubber */}
          <div className="toolbar-scrubber-group">
            <span className="tb-label">Step</span>
            <input
              type="range"
              min={0}
              max={n - 1}
              value={ix}
              onChange={e => {
                setI(+e.target.value);
                setPlay(false);
              }}
              aria-label="Step scrubber"
            />
          </div>

          {/* Parameter Tuning Control (if supported by algorithm) */}
          {a.pm && (
            <div className="toolbar-param-group">
              <span className="tb-label">
                {a.pm[0]}: <b>{pm}</b>
              </span>
              <input
                type="range"
                min={a.pm[1]}
                max={a.pm[2]}
                value={pm}
                onChange={e => {
                  setPv({ ...pv, [ai]: +e.target.value });
                  setI(0);
                  setPlay(false);
                }}
                aria-label={a.pm[0]}
              />
            </div>
          )}

          {/* Speed slider */}
          <div className="toolbar-speed-group">
            <span className="tb-label">{spd}s / step</span>
            <input
              type="range"
              min={1}
              max={7}
              step={0.5}
              value={spd}
              onChange={e => setSpd(+e.target.value)}
              aria-label="Playback speed"
            />
          </div>

          <button
            className="tb-btn new-data-btn"
            onClick={() => {
              setSeed(seed + 1);
              setI(0);
              setPlay(false);
            }}
            title="Generate a randomized dataset"
          >
            New data
          </button>
        </div>
      </section>

      {/* =========================================================================
          COLUMN 3: Contextual Secondary Panel (28%–35% width, Switched by Sidebar)
          ========================================================================= */}
      <aside className="workspace-panel">
        <div className="panel-header-bar">
          <span className="panel-tab-indicator">
            {SECTIONS.find(s => s.id === activeTab)?.num}{' '}
            {SECTIONS.find(s => s.id === activeTab)?.label}
          </span>
          {activeTab !== 'demo' && (
            <button className="panel-back-to-demo" onClick={() => setActiveTab('demo')}>
              View Metrics →
            </button>
          )}
        </div>

        <div className="panel-content-body">
          {/* View 1: Interactive Demo (Loss Telemetry & Current Step Explanation) */}
          {activeTab === 'demo' && (
            <div className="demo-panel-stack">
              {/* Metric Card with Big Readout & Sparkline */}
              <div className="telemetry-card">
                <div className="telemetry-eyebrow">
                  CURRENT LOSS · {meta.chart?.yl || 'OBJECTIVE'}
                </div>
                <div className="telemetry-number">
                  {cur?.v != null
                    ? Math.abs(cur.v) >= 100
                      ? cur.v.toFixed(0)
                      : Math.abs(cur.v) >= 1
                      ? cur.v.toFixed(3)
                      : cur.v.toFixed(4)
                    : '—'}
                </div>
                <div className="telemetry-sub">
                  {meta.chart?.t || 'Training objective at current step'}
                </div>

                {sparklineData && (
                  <div className="sparkline-container">
                    <svg
                      viewBox={`0 0 ${sparklineData.W} ${sparklineData.H}`}
                      className="sparkline-svg"
                      aria-label="Loss curve"
                    >
                      <polyline
                        points={sparklineData.fullPointsStr}
                        fill="none"
                        stroke="var(--bd)"
                        strokeWidth="1.2"
                      />
                      <polyline
                        points={sparklineData.pointsStr}
                        fill="none"
                        stroke="var(--tx)"
                        strokeWidth="2.2"
                      />
                      <circle
                        cx={sparklineData.dotX}
                        cy={sparklineData.dotY}
                        r="4"
                        fill="var(--tx)"
                        stroke="var(--cd)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* What's Happening Card */}
              <div className="happening-card">
                <div className="telemetry-eyebrow">WHAT&apos;S HAPPENING</div>
                <h3 className="happening-step-title">{f.t}</h3>
                <p className="happening-step-text">
                  <Rich t={f.d} />
                </p>

                {contextualFormula && (
                  <div className="happening-step-math">
                    <Tex f={contextualFormula} inline />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View 2: Intuition */}
          {activeTab === 'intuition' && (
            <div className="panel-prose-wrap">
              <h3 className="panel-heading">Intuitive Understanding</h3>
              <p className="panel-text">
                <Rich t={meta.intuition} />
              </p>
              <div className="panel-meta-tags">
                <div className="meta-tag-item">
                  <b>Type:</b> {meta.type}
                </div>
                <div className="meta-tag-item">
                  <b>Task:</b> {meta.task}
                </div>
                <div className="meta-tag-item">
                  <b>Complexity:</b> {meta.cx}
                </div>
              </div>
            </div>
          )}

          {/* View 3: Math & Loss Formulations */}
          {activeTab === 'math' && (
            <div className="panel-math-stack">
              <h3 className="panel-heading">Formulations &amp; Gradients</h3>
              {meta.math.map(([title, latex, note]) => (
                <div className="math-entry-box" key={title}>
                  <div className="math-entry-title">{title}</div>
                  <div className="math-latex-render">
                    <Tex f={latex} />
                  </div>
                  <div className="math-entry-note">
                    <Rich t={note} />
                  </div>
                </div>
              ))}
              <div className="math-entry-box">
                <div className="math-entry-title">Complexity</div>
                <div className="math-entry-note">{meta.cx}</div>
              </div>
            </div>
          )}

          {/* View 4: Step-by-Step Pipeline */}
          {activeTab === 'steps' && (
            <div className="panel-steps-stack">
              <h3 className="panel-heading">Algorithmic Procedure</h3>
              <div className="steps-list-wrap">
                {meta.steps.map((s, stepIdx) => {
                  const isCurrent = stepIdx === ix;
                  return (
                    <div
                      key={stepIdx}
                      className={`step-item-card ${isCurrent ? 'active' : ''}`}
                      onClick={() => {
                        setI(stepIdx);
                        setPlay(false);
                      }}
                      role="button"
                      tabIndex={0}
                      title="Click to jump visualization to this step"
                    >
                      <div className="step-item-num">{stepIdx + 1}</div>
                      <div className="step-item-body">
                        <Rich t={s} />
                      </div>
                      {isCurrent && <span className="step-active-indicator">Current</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View 5: Hyperparameters */}
          {activeTab === 'hyper' && (
            <div className="panel-params-stack">
              <h3 className="panel-heading">Tunable Hyperparameters</h3>
              {meta.hyper.map(([paramName, paramDesc]) => (
                <div className="param-item-box" key={paramName}>
                  <div className="param-item-title">{paramName}</div>
                  <div className="param-item-text">
                    <Rich t={paramDesc} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View 6: Strengths & Weaknesses */}
          {activeTab === 'tradeoffs' && (
            <div className="panel-tradeoffs-stack">
              <h3 className="panel-heading">Trade-offs</h3>
              <div className="tradeoffs-group strengths">
                <h4 className="tradeoffs-group-title">✓ Strengths</h4>
                <ul className="tradeoffs-ul">
                  {meta.pros.map((pro, pIdx) => (
                    <li key={pIdx}>
                      <Rich t={pro} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="tradeoffs-group weaknesses">
                <h4 className="tradeoffs-group-title">✕ Limitations</h4>
                <ul className="tradeoffs-ul">
                  {meta.cons.map((con, cIdx) => (
                    <li key={cIdx}>
                      <Rich t={con} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* View 7: When to Use */}
          {activeTab === 'use' && (
            <div className="panel-use-stack">
              <h3 className="panel-heading">When to Use</h3>
              <ul className="use-guidelines-ul">
                {meta.use.map((u, uIdx) => (
                  <li key={uIdx}>
                    <Rich t={u} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* View 8: Code (scikit-learn) */}
          {activeTab === 'code' && (
            <div className="panel-code-stack">
              <div className="code-header-row">
                <span className="code-lang-tag">Python (scikit-learn)</span>
                <button className="code-copy-action" onClick={handleCopyCode}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="code-display-block">
                <code>{meta.code}</code>
              </pre>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
