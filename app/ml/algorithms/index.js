/**
 * ML Algorithms Catalog
 * Re-exports individual algorithm modules and exports the ordered master list A.
 */

export * from './common';
export * from './linear-regression';
export * from './logistic-regression';
export * from './svm';
export * from './knn';
export * from './decision-tree';
export * from './naive-bayes';
export * from './k-means';
export * from './hierarchical-clustering';
export * from './dbscan';
export * from './pca';

import { linearRegression } from './linear-regression';
import { logisticRegression } from './logistic-regression';
import { svm } from './svm';
import { knn } from './knn';
import { decisionTree } from './decision-tree';
import { naiveBayes } from './naive-bayes';
import { kmeans } from './k-means';
import { hierarchicalClustering } from './hierarchical-clustering';
import { dbscan } from './dbscan';
import { pca } from './pca';

// Ordered array matching lib/content.js
export const A = [
  linearRegression,
  logisticRegression,
  svm,
  knn,
  decisionTree,
  naiveBayes,
  kmeans,
  hierarchicalClustering,
  dbscan,
  pca
];

// Keyed dictionary by slug for direct lookups
export const algorithmsBySlug = {
  'linear-regression': linearRegression,
  'logistic-regression': logisticRegression,
  svm: svm,
  knn: knn,
  'decision-tree': decisionTree,
  'naive-bayes': naiveBayes,
  'k-means': kmeans,
  'hierarchical-clustering': hierarchicalClustering,
  dbscan: dbscan,
  pca: pca
};

export const getAlgorithmBySlug = slug => algorithmsBySlug[slug];
