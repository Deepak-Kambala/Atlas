import ComingSoon from '../../components/ComingSoon';
export const metadata={title:'Linear Algebra | Atlas'};
export default function Page(){
  return <ComingSoon title="Linear algebra" blurb="Interactive visualisations of the maths that powers machine learning." topics={['Vectors and the dot product','Matrices as transformations','Eigenvalues and eigenvectors','SVD']}/>;
}
