/**
 * Common mathematical and simulation utilities for ML algorithms.
 */

// Deterministic pseudo-random number generator (Linear Congruential Generator)
export const R = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

// Box-Muller transform for standard normal (Gaussian) distribution
export const G = r => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(6.2832 * r());

// Clamping to visible canvas coordinates (3 to 97 to avoid border clipping)
export const cp = v => Math.max(3, Math.min(97, v));

// Number formatters for step descriptions and metrics
export const f2 = v => (Number.isFinite(+v) ? (+v).toFixed(2) : '0.00');
export const f3 = v => (Number.isFinite(+v) ? (+v).toFixed(3) : '0.000');

// Statistical and geometric helpers
export const mean = a => (a && a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Clustered 2D Gaussian blob generator
export const blobs = (r, cs, n, sd) =>
  cs.flatMap((c, k) =>
    Array.from({ length: n }, () => ({
      x: cp(c[0] + G(r) * sd),
      y: cp(c[1] + G(r) * sd),
      c: k
    }))
  );
