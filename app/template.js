// A template re-mounts on every navigation, giving each page a smooth entrance.
export default function Template({children}){
  return <div className="page">{children}</div>;
}
