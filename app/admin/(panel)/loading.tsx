export default function AdminLoading() {
  return <div className="admin-loading" role="status" aria-label="Loading admin workspace"><div className="admin-loading-head"><span/><span/></div><div className="admin-loading-grid">{Array.from({length:4},(_,index)=><span key={index}/>)}</div><div className="admin-loading-panel"/></div>;
}
