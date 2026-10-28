'use client';
import React, { useState, useEffect } from 'react';

/**
 * Mathematically Rigorous 3D Loss Optimization & Gradient Descent Engine
 *
 * Landscape:
 *   Convex quadratic loss manifold: L(θ₁, θ₂) = ½ (a θ₁² + b θ₂²)
 *   with an anisotropic ill-conditioned valley (a = 1.6, b = 0.55).
 *
 * Geometry & 3D Projection:
 *   - Global minimum θ* at (0, 0) with L(0, 0) = 0.
 *   - Ground axes θ₁ (down-right) and θ₂ (down-left) span the parameter space.
 *   - Vertical axis L(θ) measures loss.
 *   - Surface rings represent true level sets {θ : L(θ) = c}.
 *   - Radial spokes represent parabolic geodesics from origin to rim.
 *   - Ground ellipses show isocontour projections on the floor.
 *
 * Interactive Optimizers:
 *   - Momentum SGD: Accelerates along the shallow axis and dampens valley oscillations.
 *   - Standard GD: Follows the steepest descent -∇L perpendicular to contours.
 *   - Adam: Adaptive learning rates per coordinate for rapid direct convergence.
 */

// Precomputed exact mathematical geometry
const BOWL_RINGS = [
  // Rim: c = 4.5
  { d: "M 343.6,167.8 L 324.2,175.0 L 303.8,181.5 L 282.7,187.2 L 261.1,192.0 L 239.5,195.8 L 218.3,198.6 L 197.8,200.2 L 178.4,200.7 L 160.3,200.1 L 144.0,198.4 L 129.6,195.5 L 117.5,191.6 L 107.8,186.7 L 100.7,180.9 L 96.3,174.3 L 94.8,167.0 L 96.1,159.1 L 100.1,150.8 L 106.9,142.3 L 116.4,133.6 L 128.3,124.8 L 142.4,116.3 L 158.5,108.0 L 176.4,100.2 L 195.8,93.0 L 216.2,86.5 L 237.3,80.8 L 258.9,76.0 L 280.5,72.2 L 301.7,69.4 L 322.2,67.8 L 341.6,67.3 L 359.7,67.9 L 376.0,69.6 L 390.4,72.5 L 402.5,76.4 L 412.2,81.3 L 419.3,87.1 L 423.7,93.7 L 425.2,101.0 L 423.9,108.9 L 419.9,117.2 L 413.1,125.7 L 403.6,134.4 L 391.7,143.2 L 377.6,151.7 L 361.5,160.0 L 343.6,167.8 Z", isRim: true },
  // c = 3.2
  { d: "M 330.5,185.9 L 314.2,192.0 L 297.0,197.5 L 279.1,202.3 L 260.9,206.3 L 242.7,209.5 L 224.8,211.9 L 207.5,213.3 L 191.1,213.7 L 175.9,213.2 L 162.1,211.7 L 150.0,209.3 L 139.8,206.0 L 131.6,201.8 L 125.7,196.9 L 122.0,191.4 L 120.7,185.2 L 121.8,178.6 L 125.2,171.6 L 130.9,164.4 L 138.9,157.0 L 148.9,149.7 L 160.8,142.5 L 174.4,135.5 L 189.5,128.9 L 205.8,122.8 L 223.0,117.3 L 240.9,112.5 L 259.1,108.5 L 277.3,105.3 L 295.2,102.9 L 312.5,101.5 L 328.9,101.1 L 344.1,101.6 L 357.9,103.1 L 370.0,105.5 L 380.2,108.8 L 388.4,113.0 L 394.3,117.9 L 398.0,123.4 L 399.3,129.6 L 398.2,136.2 L 394.8,143.2 L 389.1,150.4 L 381.1,157.8 L 371.1,165.1 L 359.2,172.3 L 345.6,179.3 L 330.5,185.9 Z" },
  // c = 2.0
  { d: "M 315.7,201.5 L 302.8,206.3 L 289.2,210.7 L 275.1,214.5 L 260.7,217.7 L 246.4,220.2 L 232.2,222.1 L 218.5,223.2 L 205.6,223.5 L 193.5,223.1 L 182.6,221.9 L 173.1,220.0 L 165.0,217.4 L 158.5,214.1 L 153.8,210.3 L 150.9,205.9 L 149.9,201.0 L 150.7,195.8 L 153.4,190.2 L 158.0,184.5 L 164.2,178.7 L 172.2,172.9 L 181.6,167.2 L 192.4,161.7 L 204.3,156.5 L 217.2,151.7 L 230.8,147.3 L 244.9,143.5 L 259.3,140.3 L 273.6,137.8 L 287.8,135.9 L 301.5,134.8 L 314.4,134.5 L 326.5,134.9 L 337.4,136.1 L 346.9,138.0 L 355.0,140.6 L 361.5,143.9 L 366.2,147.7 L 369.1,152.1 L 370.1,157.0 L 369.3,162.2 L 366.6,167.8 L 362.0,173.5 L 355.8,179.3 L 347.8,185.1 L 338.4,190.8 L 327.6,196.3 L 315.7,201.5 Z" },
  // c = 1.0
  { d: "M 299.4,212.9 L 290.3,216.3 L 280.7,219.4 L 270.7,222.1 L 260.5,224.4 L 250.4,226.2 L 240.3,227.4 L 230.7,228.2 L 221.5,228.5 L 213.0,228.2 L 205.3,227.3 L 198.5,226.0 L 192.8,224.1 L 188.2,221.8 L 184.9,219.1 L 182.9,216.0 L 182.1,212.6 L 182.7,208.8 L 184.6,204.9 L 187.8,200.9 L 192.3,196.8 L 197.9,192.7 L 204.6,188.7 L 212.2,184.8 L 220.6,181.1 L 229.7,177.7 L 239.3,174.6 L 249.3,171.9 L 259.5,169.6 L 269.6,167.8 L 279.7,166.6 L 289.3,165.8 L 298.5,165.5 L 307.0,165.8 L 314.7,166.7 L 321.5,168.0 L 327.2,169.9 L 331.8,172.2 L 335.1,174.9 L 337.1,178.0 L 337.9,181.4 L 337.3,185.2 L 335.4,189.1 L 332.2,193.1 L 327.7,197.2 L 322.1,201.3 L 315.4,205.3 L 307.8,209.2 L 299.4,212.9 Z" },
  // c = 0.35
  { d: "M 283.3,218.1 L 277.9,220.1 L 272.2,222.0 L 266.3,223.5 L 260.3,224.9 L 254.3,225.9 L 248.4,226.7 L 242.7,227.2 L 237.2,227.3 L 232.2,227.1 L 227.6,226.6 L 223.6,225.9 L 220.3,224.8 L 217.6,223.4 L 215.6,221.8 L 214.4,219.9 L 213.9,217.9 L 214.3,215.7 L 215.4,213.4 L 217.3,211.0 L 219.9,208.6 L 223.3,206.1 L 227.2,203.8 L 231.7,201.5 L 236.7,199.3 L 242.1,197.3 L 247.8,195.4 L 253.7,193.9 L 259.7,192.5 L 265.7,191.5 L 271.6,190.7 L 277.3,190.2 L 282.8,190.1 L 287.8,190.3 L 292.4,190.8 L 296.4,191.5 L 299.7,192.6 L 302.4,194.0 L 304.4,195.6 L 305.6,197.5 L 306.1,199.5 L 305.7,201.7 L 304.6,204.0 L 302.7,206.4 L 300.1,208.8 L 296.7,211.3 L 292.8,213.6 L 288.3,215.9 L 283.3,218.1 Z" }
];

const BOWL_SPOKES = [
  "M 260.0,215.0 L 265.2,216.8 L 270.4,218.0 L 275.7,218.5 L 280.9,218.4 L 286.1,217.6 L 291.3,216.3 L 296.6,214.3 L 301.8,211.6 L 307.0,208.4 L 312.2,204.5 L 317.4,199.9 L 322.7,194.8 L 327.9,189.0 L 333.1,182.5 L 338.3,175.5 L 343.6,167.8",
  "M 260.0,215.0 L 257.4,218.7 L 254.8,221.8 L 252.2,224.3 L 249.6,226.1 L 247.0,227.3 L 244.4,227.8 L 241.8,227.8 L 239.2,227.0 L 236.5,225.7 L 233.9,223.7 L 231.3,221.1 L 228.7,217.9 L 226.1,214.0 L 223.5,209.5 L 220.9,204.4 L 218.3,198.6",
  "M 260.0,215.0 L 251.1,218.3 L 242.2,220.9 L 233.3,222.9 L 224.4,224.3 L 215.5,225.1 L 206.6,225.2 L 197.6,224.7 L 188.7,223.5 L 179.8,221.8 L 170.9,219.3 L 162.0,216.3 L 153.1,212.6 L 144.2,208.3 L 135.3,203.4 L 126.4,197.8 L 117.5,191.6",
  "M 260.0,215.0 L 250.0,215.7 L 240.0,215.8 L 230.0,215.3 L 220.0,214.1 L 210.0,212.4 L 200.0,209.9 L 190.1,206.9 L 180.1,203.2 L 170.1,198.8 L 160.1,193.9 L 150.1,188.3 L 140.1,182.1 L 130.1,175.2 L 120.1,167.7 L 110.1,159.6 L 100.1,150.8",
  "M 260.0,215.0 L 254.8,212.6 L 249.6,209.5 L 244.3,205.8 L 239.1,201.5 L 233.9,196.5 L 228.7,190.9 L 223.4,184.7 L 218.2,177.9 L 213.0,170.4 L 207.8,162.3 L 202.6,153.5 L 197.3,144.1 L 192.1,134.1 L 186.9,123.4 L 181.7,112.2 L 176.4,100.2",
  "M 260.0,215.0 L 262.6,210.6 L 265.2,205.7 L 267.8,200.0 L 270.4,193.8 L 273.0,186.9 L 275.6,179.4 L 278.2,171.2 L 280.8,162.5 L 283.5,153.0 L 286.1,143.0 L 288.7,132.3 L 291.3,121.0 L 293.9,109.0 L 296.5,96.5 L 299.1,83.3 L 301.7,69.4",
  "M 260.0,215.0 L 268.9,211.1 L 277.8,206.5 L 286.7,201.4 L 295.6,195.5 L 304.5,189.1 L 313.4,182.0 L 322.4,174.3 L 331.3,166.0 L 340.2,157.0 L 349.1,147.4 L 358.0,137.1 L 366.9,126.2 L 375.8,114.7 L 384.7,102.6 L 393.6,89.8 L 402.5,76.4",
  "M 260.0,215.0 L 270.0,213.6 L 280.0,211.6 L 290.0,209.0 L 300.0,205.7 L 310.0,201.8 L 320.0,197.3 L 329.9,192.1 L 339.9,186.3 L 349.9,179.9 L 359.9,172.8 L 369.9,165.1 L 379.9,156.8 L 389.9,147.8 L 399.9,138.2 L 409.9,128.0 L 419.9,117.2"
];

const FLOOR_CONTOURS = [
  "M 343.6,248.8 L 324.2,256.0 L 303.8,262.5 L 282.7,268.2 L 261.1,273.0 L 239.5,276.8 L 218.3,279.6 L 197.8,281.2 L 178.4,281.7 L 160.3,281.1 L 144.0,279.4 L 129.6,276.5 L 117.5,272.6 L 107.8,267.7 L 100.7,261.9 L 96.3,255.3 L 94.8,248.0 L 96.1,240.1 L 100.1,231.8 L 106.9,223.3 L 116.4,214.6 L 128.3,205.8 L 142.4,197.3 L 158.5,189.0 L 176.4,181.2 L 195.8,174.0 L 216.2,167.5 L 237.3,161.8 L 258.9,157.0 L 280.5,153.2 L 301.7,150.4 L 322.2,148.8 L 341.6,148.3 L 359.7,148.9 L 376.0,150.6 L 390.4,153.5 L 402.5,157.4 L 412.2,162.3 L 419.3,168.1 L 423.7,174.7 L 425.2,182.0 L 423.9,189.9 L 419.9,198.2 L 413.1,206.7 L 403.6,215.4 L 391.7,224.2 L 377.6,232.7 L 361.5,241.0 L 343.6,248.8 Z",
  "M 322.3,240.2 L 307.9,245.6 L 292.7,250.4 L 276.9,254.7 L 260.8,258.3 L 244.7,261.1 L 228.9,263.1 L 213.6,264.4 L 199.1,264.8 L 185.7,264.3 L 173.5,263.0 L 162.8,260.8 L 153.8,257.9 L 146.5,254.3 L 141.3,249.9 L 138.0,245.0 L 136.9,239.6 L 137.8,233.7 L 140.8,227.6 L 145.9,221.2 L 152.9,214.7 L 161.8,208.2 L 172.3,201.8 L 184.4,195.7 L 197.7,189.8 L 212.1,184.4 L 227.3,179.6 L 243.1,175.3 L 259.2,171.7 L 275.3,168.9 L 291.1,166.9 L 306.4,165.6 L 320.9,165.2 L 334.3,165.7 L 346.5,167.0 L 357.2,169.2 L 366.2,172.1 L 373.5,175.7 L 378.7,180.1 L 382.0,185.0 L 383.1,190.4 L 382.2,196.3 L 379.2,202.4 L 374.1,208.8 L 367.1,215.3 L 358.2,221.8 L 347.7,228.2 L 335.6,234.3 L 322.3,240.2 Z",
  "M 299.4,230.9 L 290.3,234.3 L 280.7,237.4 L 270.7,240.1 L 260.5,242.4 L 250.4,244.2 L 240.3,245.4 L 230.7,246.2 L 221.5,246.5 L 213.0,246.2 L 205.3,245.3 L 198.5,244.0 L 192.8,242.1 L 188.2,239.8 L 184.9,237.1 L 182.9,234.0 L 182.1,230.6 L 182.7,226.8 L 184.6,222.9 L 187.8,218.9 L 192.3,214.8 L 197.9,210.7 L 204.6,206.7 L 212.2,202.8 L 220.6,199.1 L 229.7,195.7 L 239.3,192.6 L 249.3,189.9 L 259.5,187.6 L 269.6,185.8 L 279.7,184.6 L 289.3,183.8 L 298.5,183.5 L 307.0,183.8 L 314.7,184.7 L 321.5,186.0 L 327.2,187.9 L 331.8,190.2 L 335.1,192.9 L 337.1,196.0 L 337.9,199.4 L 337.3,203.2 L 335.4,207.1 L 332.2,211.1 L 327.7,215.2 L 322.1,219.3 L 315.4,223.3 L 307.8,227.2 L 299.4,230.9 Z"
];

// Exact step trajectories simulated on L(θ) = ½ (1.6 θ₁² + 0.55 θ₂²)
const TRAJECTORIES = {
  momentum: [
    { t1: 1.8, t2: -2.5, loss: 4.3108, sx: 411.5, sy: 127.4, fx: 411.5, fy: 205.0, gnorm: 3.191, step: 0 },
    { t1: 1.166, t2: -2.197, loss: 2.4164, sx: 378.5, sy: 156.8, fx: 378.5, fy: 200.3, gnorm: 2.223, step: 1 },
    { t1: 0.344, t2: -1.735, loss: 0.9225, sx: 333.2, sy: 178.6, fx: 333.2, fy: 195.2, gnorm: 1.102, step: 2 },
    { t1: -0.312, t2: -1.224, loss: 0.4900, sx: 292.2, sy: 184.3, fx: 292.2, fy: 193.1, gnorm: 0.838, step: 3 },
    { t1: -0.628, t2: -0.744, loss: 0.4680, sx: 264.1, sy: 187.0, fx: 264.1, fy: 195.5, gnorm: 1.085, step: 4 },
    { t1: -0.613, t2: -0.342, loss: 0.3326, sx: 250.5, sy: 195.4, fx: 250.5, fy: 201.4, gnorm: 0.998, step: 5 },
    { t1: -0.387, t2: -0.040, loss: 0.1203, sx: 247.8, sy: 206.8, fx: 247.8, fy: 208.9, gnorm: 0.620, step: 6 },
    { t1: -0.104, t2: 0.162, loss: 0.0159, sx: 250.6, sy: 215.5, fx: 250.6, fy: 215.8, gnorm: 0.189, step: 7 },
    { t1: 0.116, t2: 0.273, loss: 0.0314, sx: 254.5, sy: 220.0, fx: 254.5, fy: 220.6, gnorm: 0.239, step: 8 },
    { t1: 0.219, t2: 0.313, loss: 0.0652, sx: 256.7, sy: 221.4, fx: 256.7, fy: 222.6, gnorm: 0.390, step: 9 },
    { t1: 0.208, t2: 0.301, loss: 0.0596, sx: 256.8, sy: 221.2, fx: 256.8, fy: 222.2, gnorm: 0.372, step: 10 },
    { t1: 0.128, t2: 0.256, loss: 0.0312, sx: 255.5, sy: 219.9, fx: 255.5, fy: 220.5, gnorm: 0.249, step: 11 },
    { t1: 0.031, t2: 0.196, loss: 0.0114, sx: 254.2, sy: 218.0, fx: 254.2, fy: 218.2, gnorm: 0.119, step: 12 },
    { t1: -0.043, t2: 0.134, loss: 0.0064, sx: 253.8, sy: 216.2, fx: 253.8, fy: 216.3, gnorm: 0.101, step: 13 },
    { t1: -0.076, t2: 0.077, loss: 0.0063, sx: 254.6, sy: 214.9, fx: 254.6, fy: 215.0, gnorm: 0.129, step: 14 },
    { t1: -0.071, t2: 0.031, loss: 0.0043, sx: 256.4, sy: 214.4, fx: 256.4, fy: 214.4, gnorm: 0.114, step: 15 }
  ],
  gd: [
    { t1: 1.8, t2: -2.5, loss: 4.3108, sx: 411.5, sy: 127.4, fx: 411.5, fy: 205.0, gnorm: 3.191, step: 0 },
    { t1: 0.994, t2: -2.115, loss: 2.0199, sx: 369.5, sy: 162.7, fx: 369.5, fy: 199.0, gnorm: 1.970, step: 1 },
    { t1: 0.548, t2: -1.789, loss: 1.1211, sx: 342.4, sy: 177.2, fx: 342.4, fy: 197.3, gnorm: 1.319, step: 2 },
    { t1: 0.303, t2: -1.514, loss: 0.7035, sx: 324.0, sy: 185.1, fx: 324.0, fy: 197.8, gnorm: 0.963, step: 3 },
    { t1: 0.167, t2: -1.281, loss: 0.4733, sx: 311.0, sy: 190.6, fx: 311.0, fy: 199.1, gnorm: 0.753, step: 4 },
    { t1: 0.092, t2: -1.083, loss: 0.3296, sx: 301.4, sy: 195.0, fx: 301.4, fy: 200.9, gnorm: 0.614, step: 5 },
    { t1: 0.051, t2: -0.917, loss: 0.2331, sx: 294.1, sy: 198.5, fx: 294.1, fy: 202.7, gnorm: 0.511, step: 6 },
    { t1: 0.028, t2: -0.775, loss: 0.1660, sx: 288.3, sy: 201.4, fx: 288.3, fy: 204.4, gnorm: 0.429, step: 7 },
    { t1: 0.016, t2: -0.656, loss: 0.1185, sx: 283.7, sy: 203.7, fx: 283.7, fy: 205.9, gnorm: 0.362, step: 8 },
    { t1: 0.009, t2: -0.555, loss: 0.0848, sx: 279.9, sy: 205.7, fx: 279.9, fy: 207.2, gnorm: 0.306, step: 9 },
    { t1: 0.005, t2: -0.470, loss: 0.0606, sx: 276.7, sy: 207.3, fx: 276.7, fy: 208.4, gnorm: 0.258, step: 10 },
    { t1: 0.003, t2: -0.397, loss: 0.0434, sx: 274.1, sy: 208.6, fx: 274.1, fy: 209.4, gnorm: 0.219, step: 11 },
    { t1: 0.001, t2: -0.336, loss: 0.0311, sx: 271.9, sy: 209.7, fx: 271.9, fy: 210.2, gnorm: 0.185, step: 12 },
    { t1: 0.001, t2: -0.284, loss: 0.0222, sx: 270.0, sy: 210.6, fx: 270.0, fy: 211.0, gnorm: 0.156, step: 13 },
    { t1: 0.000, t2: -0.241, loss: 0.0159, sx: 268.5, sy: 211.3, fx: 268.5, fy: 211.6, gnorm: 0.132, step: 14 },
    { t1: 0.000, t2: -0.203, loss: 0.0114, sx: 267.2, sy: 211.9, fx: 267.2, fy: 212.1, gnorm: 0.112, step: 15 }
  ],
  adam: [
    { t1: 1.8, t2: -2.5, loss: 4.3108, sx: 411.5, sy: 127.4, fx: 411.5, fy: 205.0, gnorm: 3.191, step: 0 },
    { t1: 1.380, t2: -2.080, loss: 2.7133, sx: 381.9, sy: 156.2, fx: 381.9, fy: 205.0, gnorm: 2.487, step: 1 },
    { t1: 0.972, t2: -1.668, loss: 1.5205, sx: 353.0, sy: 177.7, fx: 353.0, fy: 205.1, gnorm: 1.805, step: 2 },
    { t1: 0.589, t2: -1.270, loss: 0.7205, sx: 325.5, sy: 192.3, fx: 325.5, fy: 205.3, gnorm: 1.172, step: 3 },
    { t1: 0.247, t2: -0.895, loss: 0.2691, sx: 300.2, sy: 200.9, fx: 300.2, fy: 205.8, gnorm: 0.631, step: 4 },
    { t1: -0.033, t2: -0.554, loss: 0.0851, sx: 278.3, sy: 205.1, fx: 278.3, fy: 206.7, gnorm: 0.309, step: 5 },
    { t1: -0.233, t2: -0.256, loss: 0.0616, sx: 260.8, sy: 206.9, fx: 260.8, fy: 208.0, gnorm: 0.399, step: 6 },
    { t1: -0.345, t2: -0.014, loss: 0.0953, sx: 248.3, sy: 208.2, fx: 248.3, fy: 209.9, gnorm: 0.552, step: 7 },
    { t1: -0.373, t2: 0.167, loss: 0.1188, sx: 241.0, sy: 209.9, fx: 241.0, fy: 212.1, gnorm: 0.603, step: 8 },
    { t1: -0.332, t2: 0.283, loss: 0.1101, sx: 238.3, sy: 212.3, fx: 238.3, fy: 214.3, gnorm: 0.553, step: 9 },
    { t1: -0.246, t2: 0.337, loss: 0.0795, sx: 239.5, sy: 214.9, fx: 239.5, fy: 216.3, gnorm: 0.435, step: 10 },
    { t1: -0.139, t2: 0.337, loss: 0.0467, sx: 243.2, sy: 217.0, fx: 243.2, fy: 217.8, gnorm: 0.289, step: 11 },
    { t1: -0.034, t2: 0.296, loss: 0.0251, sx: 248.4, sy: 218.3, fx: 248.4, fy: 218.7, gnorm: 0.172, step: 12 },
    { t1: 0.050, t2: 0.229, loss: 0.0163, sx: 253.7, sy: 218.7, fx: 253.7, fy: 219.0, gnorm: 0.149, step: 13 },
    { t1: 0.101, t2: 0.149, loss: 0.0142, sx: 258.3, sy: 218.3, fx: 258.3, fy: 218.6, gnorm: 0.181, step: 14 },
    { t1: 0.117, t2: 0.069, loss: 0.0122, sx: 261.7, sy: 217.4, fx: 261.7, fy: 217.6, gnorm: 0.190, step: 15 }
  ]
};

export default function SimpleHeroVisual() {
  const [algo, setAlgo] = useState('momentum');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const traj = TRAJECTORIES[algo] || TRAJECTORIES.momentum;
  const maxStep = traj.length - 1;
  const currentPt = traj[currentStep] || traj[0];
  const isConverged = currentStep >= maxStep;

  // Real-time Optimization Step Engine
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = isConverged ? 2400 : 380;
    const timer = setTimeout(() => {
      if (isConverged) {
        // Reset to initial parameter position θ₀
        setCurrentStep(0);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, isConverged]);

  // Handle optimizer switch
  const handleSelectAlgo = (newAlgo) => {
    setAlgo(newAlgo);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  // Trajectory paths up to current step
  const visiblePoints = traj.slice(0, currentStep + 1);
  const surfacePath = visiblePoints.length > 1
    ? "M " + visiblePoints.map(p => `${p.sx},${p.sy}`).join(" L ")
    : "";
  const floorPath = visiblePoints.length > 1
    ? "M " + visiblePoints.map(p => `${p.fx},${p.fy}`).join(" L ")
    : "";

  return (
    <div className="hero-visual-frame" aria-label="3D Loss Surface and Gradient Descent Optimization">
      {/* Sleek Minimal Toolbar */}
      <div className="visual-top-toolbar">
        {/* Optimizer Algorithm Tabs */}
        <div className="console-algo-tabs">
          <button
            type="button"
            className={`algo-tab-btn ${algo === 'momentum' ? 'active' : ''}`}
            onClick={() => handleSelectAlgo('momentum')}
            title="Polyak Momentum Gradient Descent"
          >
            Momentum
          </button>
          <button
            type="button"
            className={`algo-tab-btn ${algo === 'gd' ? 'active' : ''}`}
            onClick={() => handleSelectAlgo('gd')}
            title="Vanilla Steepest Gradient Descent"
          >
            GD
          </button>
          <button
            type="button"
            className={`algo-tab-btn ${algo === 'adam' ? 'active' : ''}`}
            onClick={() => handleSelectAlgo('adam')}
            title="Adaptive Moment Estimation (Adam)"
          >
            Adam
          </button>
        </div>

        {/* Play/Pause & Iteration Meta */}
        <div className="console-meta-stats">
          <button
            type="button"
            className="console-play-btn"
            onClick={() => setIsPlaying(p => !p)}
            title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="console-play-btn"
            onClick={handleReplay}
            title="Restart Trajectory"
            aria-label="Restart"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <span className={`meta-stat-chip ${isConverged ? 'highlight' : ''}`}>
            iter {currentStep}
          </span>
        </div>
      </div>

      {/* Main 3D Surface Display */}
      <div className="simple-visual-container">
        <div className="visual-ambient-glow" />

        <svg
          viewBox="45 5 440 310"
          className="simple-loss-svg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <defs>
            {/* Ambient Minimum Glow */}
            <radialGradient id="minGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--p1, #38bdf8)" stopOpacity="0.3" />
              <stop offset="60%" stopColor="var(--p1, #38bdf8)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--p1, #38bdf8)" stopOpacity="0" />
            </radialGradient>

            <filter id="tracerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Depth Halo centered at Global Minimum (260, 215) */}
          <circle cx="260" cy="215" r="110" fill="url(#minGlow)" />

          {/* 1. Floor Level-Set Isocontour Projections */}
          <g className="svg-floor-contours" strokeDasharray="3 3">
            {FLOOR_CONTOURS.map((d, i) => (
              <path key={`fc-${i}`} d={d} />
            ))}
          </g>

          {/* 2. Ground Axes: θ₁ and θ₂ */}
          <g className="svg-ground-axes">
            {/* Parameter Axis θ₁ */}
            <line x1="260" y1="215" x2="436" y2="286" />
            <polyline points="428,281 436,286 428,291" />
            <text x="446" y="291" className="svg-axis-label">θ₁</text>

            {/* Parameter Axis θ₂ */}
            <line x1="260" y1="215" x2="84" y2="286" />
            <polyline points="92,281 84,286 92,291" />
            <text x="68" y="291" className="svg-axis-label">θ₂</text>
          </g>

          {/* 3. 3D Paraboloid Wireframe Manifold */}
          <g className="svg-bowl-mesh">
            {/* Radial Geodesic Spokes */}
            {BOWL_SPOKES.map((d, i) => (
              <path key={`sp-${i}`} d={d} className="svg-spoke" />
            ))}

            {/* Level-Set Concentric Rings */}
            {BOWL_RINGS.map((ring, i) => (
              <path
                key={`ring-${i}`}
                d={ring.d}
                className={ring.isRim ? "svg-ring-rim" : "svg-ring"}
              />
            ))}
          </g>

          {/* 4. Vertical Z Axis: L(θ) Loss */}
          <g className="svg-loss-axis">
            <line x1="260" y1="215" x2="260" y2="30" />
            <polyline points="256,38 260,30 264,38" />
            <text x="260" y="20" textAnchor="middle" className="svg-loss-label">L(θ)</text>
          </g>

          {/* 5. Parameter Floor Shadow Trajectory */}
          {floorPath && (
            <path d={floorPath} className="svg-traj-floor" />
          )}

          {/* 6. Current 3D Vertical Drop Line (surface to floor parameter projection) */}
          <line
            x1={currentPt.sx}
            y1={currentPt.sy}
            x2={currentPt.fx}
            y2={currentPt.fy}
            className="svg-drop-line"
          />

          {/* 7. Surface Trajectory Flow */}
          {surfacePath && (
            <path d={surfacePath} className="svg-traj-trail" />
          )}

          {/* 8. Step History Points */}
          {visiblePoints.map((pt, i) => {
            const isInitial = i === 0;
            const isLatest = i === currentStep;
            if (isLatest) return null; // Tracer renders over this
            return (
              <circle
                key={`step-${i}`}
                cx={pt.sx}
                cy={pt.sy}
                r={isInitial ? 3.5 : 2.5}
                className="svg-step-point"
              />
            );
          })}

          {/* 9. Active Optimization Tracer Particle */}
          <g filter="url(#tracerGlow)">
            <circle
              cx={currentPt.sx}
              cy={currentPt.sy}
              r="5"
              className="svg-descent-tracer"
            />
          </g>

          {/* 10. Global Optimum Marker θ* at (260, 215) */}
          <circle cx="260" cy="215" r="4.5" className="svg-min-point" />

          {/* Smooth Native SVG Convergence Ripples at Minimum */}
          {isConverged && (
            <g>
              <circle cx="260" cy="215" r="8" className="svg-ripple-ring" opacity="0.8">
                <animate attributeName="r" values="6;26" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="260" cy="215" r="16" className="svg-ripple-ring" opacity="0.6">
                <animate attributeName="r" values="10;34" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Optimum Tag */}
          <g className="svg-optima-tag" transform="translate(260, 240)">
            <text x="0" y="0" textAnchor="middle" className="svg-min-label">
              {isConverged ? "θ* (Converged: L ≈ 0)" : "θ* (Global Min)"}
            </text>
          </g>

          {/* Dynamic Gradient Magnitude Indicator */}
          <g className="svg-grad-indicator" transform="translate(390, 48)">
            <rect x="-8" y="-12" width="102" height="22" rx="4" className="svg-grad-box" />
            <text x="43" y="2" textAnchor="middle" className="svg-grad-math">
              ||∇L|| = {currentPt.gnorm.toFixed(2)}
            </text>
          </g>
        </svg>

        {/* Real-Time Telemetry HUD Chips */}
        <div className="console-hud-footer">
          <div className="hud-pill">
            <span className="hud-dot" />
            <span className="hud-text">L(θ) = {currentPt.loss.toFixed(4)}</span>
          </div>
          <div className="hud-pill">
            <span className="hud-text">
              {algo === 'momentum' ? 'Momentum SGD (β=0.65)' : algo === 'adam' ? 'Adam Optimizer' : 'Vanilla GD (η=0.28)'}
            </span>
          </div>
          <div className={`hud-pill ${isConverged ? 'converged' : 'highlight'}`}>
            <span className="hud-text">
              {isConverged ? '✓ Converged (∇L ≈ 0)' : `Step ${currentStep}/${maxStep}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
