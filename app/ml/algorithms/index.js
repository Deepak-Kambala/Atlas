/**
 * ML Algorithms Catalog
 * Re-exports individual algorithm modules and exports the ordered master list A.
 */

export * from './common.js';
export * from './linear-regression.js';
export * from './multiple-linear-regression.js';
export * from './ridge-regression.js';
export * from './bias-variance.js';
export * from './logistic-regression.js';
export * from './svm.js';
export * from './knn.js';
export * from './decision-tree.js';
export * from './naive-bayes.js';
export * from './lda.js';
export * from './mlp.js';
export * from './cross-validation.js';
export * from './k-means.js';
export * from './k-medoids.js';
export * from './hierarchical-clustering.js';
export * from './dbscan.js';
export * from './pca.js';

import { linearRegression } from './linear-regression.js';
import { multipleLinearRegression } from './multiple-linear-regression.js';
import { ridgeRegression } from './ridge-regression.js';
import { biasVarianceTradeoff } from './bias-variance.js';
import { logisticRegression } from './logistic-regression.js';
import { svm } from './svm.js';
import { knn } from './knn.js';
import { decisionTree } from './decision-tree.js';
import { naiveBayes } from './naive-bayes.js';
import { ldaClassifier } from './lda.js';
import { mlp } from './mlp.js';
import { crossValidation } from './cross-validation.js';
import { kmeans } from './k-means.js';
import { kmedoidsCluster } from './k-medoids.js';
import { hierarchicalClustering } from './hierarchical-clustering.js';
import { dbscan } from './dbscan.js';
import { pca } from './pca.js';

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
