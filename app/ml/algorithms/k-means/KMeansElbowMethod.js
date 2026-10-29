'use client';

import React from 'react';
import Tex from '../../../../components/Tex';

// Mathematically computed WCSS (Inertia) on the 3-blob dataset
const ELBOW_DATA = [
  { k: 1, inertia: 58003, label: 'K = 1' },
  { k: 2, inertia: 29578, label: 'K = 2' },
  { k: 3, inertia: 8081, label: 'K = 3' },
  { k: 4, inertia: 6730, label: 'K = 4' },
  { k: 5, inertia: 5385, label: 'K = 5' },
  { k: 6, inertia: 4409, label: 'K = 6' }
];

export default function KMeansElbowMethod({ activeK = 3, onSelectK }) {
  // SVG coordinates mapping for 280x130 plot
  const W = 280;
  const H = 130;
  const padLeft = 38;
  const padRight = 24;
  const padTop = 18;
  const padBottom = 26;

  const minK = 1;
  const maxK = 6;
  const maxInertia = 60000;
  const minInertia = 0;

  const getX = k => padLeft + ((k - minK) / (maxK - minK)) * (W - padLeft - padRight);
  const getY = val => H - padBottom - ((val - minInertia) / (maxInertia - minInertia)) * (H - padTop - padBottom);

  const pointsPath = ELBOW_DATA.map(d => `${getX(d.k).toFixed(1)},${getY(d.inertia).toFixed(1)}`).join(' ');

  // Current K details
  const activeItem = ELBOW_DATA.find(d => d.k === activeK) || ELBOW_DATA[2];
  const activeX = getX(activeItem.k);
  const activeY = getY(activeItem.inertia);

  // Position of Elbow (K = 3)
  const elbowX = getX(3);
  const elbowY = getY(8081);

  return (
    <div className="kmeans-elbow-card">
      <div className="telemetry-eyebrow">ELBOW METHOD · MODEL SELECTION</div>
      
      <div className="kmeans-elbow-header">
        <h4 className="kmeans-elbow-title">Inertia (WCSS) vs Number of Clusters (K)</h4>
        <span className="kmeans-elbow-badge">
          Active: <b>K = {activeK}</b>
        </span>
      </div>

      <p className="kmeans-elbow-intro">
        As the <Tex f="K" inline /> value increases, WCSS (inertia) decreases because adding more clusters reduces the within-cluster variance. However, beyond a certain point, the marginal gain diminishes, and the plot exhibits an elbow shape. The optimal <Tex f="K" inline /> is chosen at the elbow, where the reduction in WCSS becomes insignificant.
      </p>

      {/* Elbow Plot SVG */}
      <div className="kmeans-elbow-chart-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} className="kmeans-elbow-svg" aria-label="K-Means Elbow Method Chart">
          {/* Grid lines and Y-axis ticks */}
          {[0, 20000, 40000, 60000].map(val => (
            <g key={val}>
              <line
                x1={padLeft}
                y1={getY(val)}
                x2={W - padRight}
                y2={getY(val)}
                stroke="var(--bd)"
                strokeWidth="0.8"
                strokeDasharray="2 3"
              />
              <text
                x={padLeft - 6}
                y={getY(val) + 3}
                textAnchor="end"
                fontSize="8"
                fill="var(--mu)"
                fontFamily="var(--mono)"
              >
                {val === 0 ? '0' : `${val / 1000}k`}
              </text>
            </g>
          ))}

          {/* Coordinate Axes */}
          <line
            x1={padLeft}
            y1={H - padBottom}
            x2={W - padRight + 10}
            y2={H - padBottom}
            stroke="var(--bd)"
            strokeWidth="1.2"
          />
          <line
            x1={padLeft}
            y1={H - padBottom}
            x2={padLeft}
            y2={padTop - 8}
            stroke="var(--bd)"
            strokeWidth="1.2"
          />

          {/* X Axis labels */}
          {ELBOW_DATA.map(d => (
            <text
              key={d.k}
              x={getX(d.k)}
              y={H - padBottom + 14}
              textAnchor="middle"
              fontSize="8.5"
              fill={d.k === activeK ? 'var(--tx)' : 'var(--mu)'}
              fontWeight={d.k === activeK ? '700' : '500'}
              fontFamily="var(--mono)"
            >
              K={d.k}
            </text>
          ))}

          {/* Shaded Underfitting Region (K < 3) */}
          <rect
            x={getX(1) - 10}
            y={padTop}
            width={getX(2.5) - getX(1) + 10}
            height={H - padBottom - padTop}
            fill="rgba(239, 68, 68, 0.05)"
          />

          {/* Shaded Overfitting / Diminishing Returns Region (K > 3) */}
          <rect
            x={getX(3.5)}
            y={padTop}
            width={getX(6) - getX(3.5) + 12}
            height={H - padBottom - padTop}
            fill="rgba(168, 85, 247, 0.04)"
          />

          {/* Elbow Line Curve */}
          <polyline
            points={pointsPath}
            fill="none"
            stroke="var(--tx)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Elbow Callout Arrow & Badge at K=3 */}
          <g transform={`translate(${elbowX}, ${elbowY})`}>
            {/* Guide line pointing to elbow */}
            <line x1="0" y1="-8" x2="18" y2="-22" stroke="#22c55e" strokeWidth="1.2" />
            <rect x="20" y="-30" width="76" height="15" rx="3" fill="#22c55e" />
            <text x="58" y="-20" textAnchor="middle" fontSize="7.5" fill="#000000" fontWeight="700">
              ELBOW (K = 3)
            </text>
          </g>

          {/* Data Points on Curve */}
          {ELBOW_DATA.map(d => {
            const cx = getX(d.k);
            const cy = getY(d.inertia);
            const isSelected = d.k === activeK;
            const isElbow = d.k === 3;

            return (
              <g
                key={d.k}
                className="kmeans-elbow-interactive-pt"
                onClick={() => onSelectK && onSelectK(d.k)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <circle cx={cx} cy={cy} r="8" fill="var(--tx)" opacity="0.18" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? '4.8' : isElbow ? '4' : '3.2'}
                  fill={isElbow ? '#22c55e' : isSelected ? 'var(--tx)' : 'var(--cd)'}
                  stroke={isSelected ? 'var(--bg)' : isElbow ? '#22c55e' : 'var(--tx)'}
                  strokeWidth="1.6"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Quick Select Buttons */}
      <div className="kmeans-elbow-btn-bar">
        <span className="kmeans-elbow-bar-label">Switch K:</span>
        <div className="kmeans-elbow-pills">
          {ELBOW_DATA.map(d => (
            <button
              key={d.k}
              type="button"
              className={`kmeans-elbow-pill-btn ${d.k === activeK ? 'active' : ''} ${d.k === 3 ? 'is-elbow' : ''}`}
              onClick={() => onSelectK && onSelectK(d.k)}
              title={`Switch clustering to K=${d.k}`}
            >
              {d.k === 3 ? 'K=3 (Elbow)' : `K=${d.k}`}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Behavioral Diagnosis based on active K */}
      <div className={`kmeans-elbow-behavior-box ${activeK < 3 ? 'underfit' : activeK === 3 ? 'optimal' : 'overfit'}`}>
        <div className="behavior-title-row">
          <span className="behavior-tag">
            {activeK < 3 ? 'Underfitting (K < 3)' : activeK === 3 ? 'Optimal Balance (Elbow K = 3)' : 'Over-Clustering (K > 3)'}
          </span>
          <span className="behavior-inertia">Inertia: {activeItem.inertia.toLocaleString()}</span>
        </div>
        <p className="behavior-desc">
          {activeK === 1 && (
            <>
              All 60 points are collapsed into 1 giant cluster. Centroid sits in the empty center, yielding maximum loss.
            </>
          )}
          {activeK === 2 && (
            <>
              Two natural blob groups are forced to merge under a single centroid. Loss drops from 58k to 29k, but one cluster remains severely blended.
            </>
          )}
          {activeK === 3 && (
            <>
              <strong>Sweet spot:</strong> Every natural blob gets its own dedicated centroid. Inertia drops precipitously by <strong>~72%</strong> down to 8,081. This is the optimal elbow point!
            </>
          )}
          {activeK === 4 && (
            <>
              One natural blob is artificially bisected into two redundant pieces. Inertia only drops from 8,081 to 6,730 (diminishing returns).
            </>
          )}
          {activeK === 5 && (
            <>
              The natural groups are fragmented into multiple overlapping Voronoi cells without revealing any new structural insight.
            </>
          )}
          {activeK === 6 && (
            <>
              Over-clustering: clusters are sliced into miniature pieces. While inertia mathematically drops to 4,409, the model loses interpretability.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

