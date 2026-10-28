export default function ComingSoon({title,blurb,topics}){
  return (
    <div className="wrap">
      <h1>{title}</h1>
      <div className="box">
        <span className="badge">Coming soon</span>
        <h3 style={{marginTop:10}}>Visual lessons are on the way</h3>
        <p>{blurb}</p>
        <p style={{marginTop:12}}><b>Planned topics</b></p>
        <ul className="l">{topics.map(t=><li key={t}>{t}</li>)}</ul>
      </div>
    </div>
  );
}
