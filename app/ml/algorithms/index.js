/**
 * ML Algorithms Catalog
 * Re-exports individual algorithm modules and exports the ordered master list A.
 */

export * from './common.js';
export * from './linear-regression/index.js';
export * from './multiple-linear-regression/index.js';
export * from './ridge-regression/index.js';
export * from './bias-variance/index.js';
export * from './logistic-regression/index.js';
export * from './svm/index.js';
export * from './knn/index.js';
export * from './decision-tree/index.js';
export * from './naive-bayes/index.js';
export * from './lda/index.js';
export * from './mlp/index.js';
export * from './cross-validation/index.js';
export * from './k-means/index.js';
export * from './k-medoids/index.js';
export * from './hierarchical-clustering/index.js';
export * from './dbscan/index.js';
export * from './pca/index.js';

import { linearRegression } from './linear-regression/index.js';
import { multipleLinearRegression } from './multiple-linear-regression/index.js';
import { ridgeRegression } from './ridge-regression/index.js';
import { biasVarianceTradeoff } from './bias-variance/index.js';
import { logisticRegression } from './logistic-regression/index.js';
import { svm } from './svm/index.js';
import { knn } from './knn/index.js';
import { decisionTree } from './decision-tree/index.js';
import { naiveBayes } from './naive-bayes/index.js';
import { ldaClassifier } from './lda/index.js';
import { mlp } from './mlp/index.js';
import { crossValidation } from './cross-validation/index.js';
import { kmeans, KMeansSeedSensitivity } from './k-means/index.js';
import { kmedoidsCluster } from './k-medoids/index.js';
import { hierarchicalClustering } from './hierarchical-clustering/index.js';
import { dbscan } from './dbscan/index.js';
import { pca } from './pca/index.js';

// Map of algorithm-specific visual components (for limitations, interactive modules, etc.)
export const algorithmVisuals = {
  'k-means': {
    seedSensitivity: KMeansSeedSensitivity
  }
};

// Ordered array matching lib/content.js
export const A = [
  linearRegression,
  multipleLinearRegression,
  ridgeRegression,
  biasVarianceTradeoff,
  logisticRegression,
  svm,
  knn,
  decisionTree,
  naiveBayes,
  ldaClassifier,
  mlp,
  crossValidation,
  kmeans,
  kmedoidsCluster,
  hierarchicalClustering,
  dbscan,
  pca
];

// Keyed dictionary by slug for direct lookups
export const algorithmsBySlug = {
  'linear-regression': linearRegression,
  'multiple-linear-regression': multipleLinearRegression,
  'ridge-regression': ridgeRegression,
  'bias-variance': biasVarianceTradeoff,
  'logistic-regression': logisticRegression,
  svm: svm,
  knn: knn,
  'decision-tree': decisionTree,
  'naive-bayes': naiveBayes,
  lda: ldaClassifier,
  mlp: mlp,
  'cross-validation': crossValidation,
  'k-means': kmeans,
  'k-medoids': kmedoidsCluster,
  'hierarchical-clustering': hierarchicalClustering,
  dbscan: dbscan,
  pca: pca
};

export const getAlgorithmBySlug = slug => algorithmsBySlug[slug];
