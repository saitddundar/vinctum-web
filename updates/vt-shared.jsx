// Shared chrome: logo, header, sidebar, footer, placeholders

function Logo({size='md'}){
  const textSize = size==='lg' ? '18px' : size==='sm' ? '13px' : '15px';
  return (
    <span className="logo" style={{fontSize:textSize}}>
      <span className="logo-mark" />
      <span>vinctum</span>
    </span>
  );
}

function PublicHeader({current='home', signedIn=false}){
  const items = [
    {key:'product', label:'Product'},
    {key:'protocol', label:'Protocol'},
    {key:'security', label:'Security'},
    {key:'pricing', label:'Pricing'},
    {key:'docs', label:'Docs'},
  ];
  return (
    <header style={{borderBottom:'1px solid var(--line)',position:'relative',zIndex:5,background:'oklch(0.155 0.012 235 / .6)',backdropFilter:'blur(12px)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 40px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:36}}>
          <Logo/>
          <nav style={{display:'flex',alignItems:'center',gap:22}}>
            {items.map(it => (
              <span key={it.key} style={{fontSize:13,color:current===it.key?'var(--fg)':'var(--muted)',fontWeight:450,letterSpacing:'-0.005em',cursor:'pointer'}}>{it.label}</span>
            ))}
          </nav>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:12,color:'var(--muted)',marginRight:6}}>
            <Icon name="activity" size={12} style={{display:'inline',verticalAlign:-1,marginRight:5,color:'var(--accent)'}}/> status · operational
          </span>
          {signedIn ? (
            <>
              <button className="btn btn-ghost" style={{padding:'7px 13px'}}>Dashboard</button>
              <div style={{width:28,height:28,borderRadius:99,background:'linear-gradient(135deg,var(--accent),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#06170f'}}>S</div>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" style={{padding:'7px 13px'}}>Sign in</button>
              <button className="btn btn-primary" style={{padding:'7px 13px'}}>Get started</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Sidebar({current='dashboard'}){
  const items = [
    {key:'dashboard', label:'Overview',  icon:'activity'},
    {key:'devices',   label:'Devices',   icon:'monitor'},
    {key:'sessions',  label:'Sessions',  icon:'users'},
    {key:'transfers', label:'Transfers', icon:'send'},
    {key:'nodes',     label:'Nodes',     icon:'network'},
    {key:'anomalies', label:'Anomalies', icon:'zap'},
  ];
  return (
    <aside style={{width:220,borderRight:'1px solid var(--line)',background:'oklch(0.155 0.012 235 / .85)',backdropFilter:'blur(16px)',display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'18px 20px 14px',borderBottom:'1px solid var(--line)'}}>
        <Logo/>
      </div>
      <div style={{padding:'14px 12px 8px'}}>
        <div style={{padding:'0 11px 8px',fontSize:10,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--muted-2)',fontWeight:600}}>Workspace</div>
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          {items.slice(0,4).map(it => (
            <div key={it.key} className={`nav-item ${current===it.key?'active':''}`}>
              <Icon name={it.icon} size={15}/>
              <span style={{flex:1}}>{it.label}</span>
              {it.key==='transfers' && <span className="mono" style={{fontSize:10,color:'var(--muted-2)'}}>12</span>}
              {it.key==='devices' && <span className="pill pill-warn" style={{padding:'1px 6px',fontSize:9}}>2</span>}
            </div>
          ))}
        </div>
        <div style={{padding:'14px 11px 8px',fontSize:10,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--muted-2)',fontWeight:600}}>Intelligence</div>
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          {items.slice(4).map(it => (
            <div key={it.key} className={`nav-item ${current===it.key?'active':''}`}>
              <Icon name={it.icon} size={15}/>
              <span style={{flex:1}}>{it.label}</span>
              {it.key==='anomalies' && <span className="dot" style={{background:'var(--amber)'}}/>}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:'auto',padding:12,borderTop:'1px solid var(--line)'}}>
        <div className="card-flat" style={{padding:'10px 12px',marginBottom:8,background:'oklch(1 0 0 / .02)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted-2)',fontWeight:600}}>Mesh health</span>
            <span className="live"/>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:6}}>
            <span className="tnum" style={{fontSize:22,fontWeight:600,letterSpacing:'-0.02em'}}>98.4</span>
            <span style={{fontSize:11,color:'var(--muted)'}}>score</span>
          </div>
          <svg className="spark" width="100%" height="22" viewBox="0 0 180 22" preserveAspectRatio="none" style={{marginTop:4}}>
            <path d="M0 14 L15 11 L30 13 L45 9 L60 10 L75 6 L90 8 L105 5 L120 7 L135 4 L150 6 L165 3 L180 5" stroke="var(--accent)"/>
          </svg>
        </div>
        <div className="nav-item">
          <div style={{width:26,height:26,borderRadius:99,background:'linear-gradient(135deg,var(--accent),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#06170f'}}>S</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:'var(--fg)',fontWeight:500}}>sait</div>
            <div style={{fontSize:10,color:'var(--muted-2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>sait@vinctum.app</div>
          </div>
          <Icon name="logout" size={14} style={{color:'var(--muted-2)'}}/>
        </div>
      </div>
    </aside>
  );
}

function Placeholder({label, aspect='16/9', subtle=false}){
  return (
    <div style={{aspectRatio:aspect,background:`repeating-linear-gradient(135deg, oklch(1 0 0 / ${subtle?.02:.03}) 0 6px, oklch(1 0 0 / ${subtle?.0:.01}) 6px 12px)`,border:'1px dashed var(--line-2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted-2)',fontFamily:'JetBrains Mono, monospace',fontSize:11,letterSpacing:'0.02em',textTransform:'uppercase'}}>{label}</div>
  );
}

function DeviceIcon({type, size=16}){
  if(type==='phone') return <Icon name="phone" size={size}/>;
  if(type==='tablet') return <Icon name="tablet" size={size}/>;
  return <Icon name="monitor" size={size}/>;
}

// Mini sparkline
function Spark({data=[], color='var(--accent)', w=120, h=32}){
  const max = Math.max(...data, 1);
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h - (v/max)*(h-2) - 1}`).join(' ');
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} stroke={color} fill="none" strokeWidth="1.5"/>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi,'')})`}/>
    </svg>
  );
}

function AppSidebar({current='overview'}){
  const groups = [
    {title:'Workspace', items:[
      {key:'overview',label:'Overview',icon:'activity'},
      {key:'devices',label:'Devices',icon:'monitor',badge:<span className="pill pill-warn" style={{padding:'1px 6px',fontSize:9}}>1</span>},
      {key:'sessions',label:'Sessions',icon:'users',badge:<span className="pill pill-ok" style={{padding:'1px 6px',fontSize:9}}>2</span>},
      {key:'transfers',label:'File sharing',icon:'send'},
    ]},
    {title:'Settings', items:[
      {key:'account',label:'Account',icon:'user'},
      {key:'security',label:'Security',icon:'shield'},
      {key:'billing',label:'Billing',icon:'code'},
    ]},
  ];
  return (
    <aside style={{width:232,borderRight:'1px solid var(--line)',background:'oklch(0.15 0.012 235)',display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'20px 22px 16px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Logo size="md"/>
        <span className="mono" style={{fontSize:9,color:'var(--muted-2)',letterSpacing:'.08em'}}>v2.1</span>
      </div>
      <div style={{padding:'16px 12px',flex:1,display:'flex',flexDirection:'column',gap:18}}>
        {groups.map(g => (
          <div key={g.title}>
            <div style={{padding:'0 12px 8px',fontSize:10,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--muted-2)',fontWeight:600}}>{g.title}</div>
            <div style={{display:'flex',flexDirection:'column',gap:1}}>
              {g.items.map(it => (
                <div key={it.key} className={`nav-item ${current===it.key?'active':''}`} style={{cursor:'pointer'}}>
                  <Icon name={it.icon} size={14}/>
                  <span style={{flex:1}}>{it.label}</span>
                  {it.badge}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{borderTop:'1px solid var(--line)',padding:12}}>
        <div className="card-flat" style={{padding:'10px 12px',marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
            <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.1em',color:'var(--muted-2)',fontWeight:600}}>Mesh</span>
            <span className="live"/>
          </div>
          <div className="mono" style={{fontSize:17,fontWeight:500,color:'var(--accent)',letterSpacing:'-0.02em'}}>98.7<span style={{fontSize:10,color:'var(--muted-2)',marginLeft:4}}>/100</span></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:8,cursor:'pointer'}}>
          <div style={{width:28,height:28,borderRadius:99,background:'linear-gradient(135deg,var(--accent),var(--cyan))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#06170f'}}>YS</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:'var(--fg)',fontWeight:500}}>Yusuf Sait</div>
            <div style={{fontSize:10,color:'var(--muted-2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>yusuf@sait.dev</div>
          </div>
          <Icon name="logout" size={13} style={{color:'var(--muted-2)'}}/>
        </div>
      </div>
    </aside>
  );
}

function AppTopbar({title, crumb}){
  return (
    <div style={{height:60,borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 36px',background:'oklch(0.155 0.012 235 / .6)',backdropFilter:'blur(12px)'}}>
      <div>
        <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.02em'}}>{crumb}</div>
        <div style={{fontSize:14,color:'var(--fg)',fontWeight:500,marginTop:1}}>{title}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div className="input-wrap" style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',width:280,border:'1px solid var(--line)',borderRadius:8,background:'oklch(1 0 0 / .02)'}}>
          <Icon name="send" size={12} style={{color:'var(--muted-2)',transform:'rotate(-45deg)'}}/>
          <span style={{fontSize:12,color:'var(--muted-2)',flex:1}}>Search files, devices, peers…</span>
          <span className="kbd">⌘K</span>
        </div>
        <button className="btn btn-ghost" style={{padding:'7px 10px'}}><Icon name="warn" size={13}/></button>
        <button className="btn btn-primary" style={{padding:'7px 14px'}}><Icon name="send" size={12}/>Send file</button>
      </div>
    </div>
  );
}

// input-wrap base
const _s = document.createElement('style'); _s.textContent = `.vt .input-wrap{background:oklch(1 0 0 / .02);border:1px solid var(--line-2);border-radius:9px;transition:border-color .15s}.vt .input-wrap.input-focus{border-color:oklch(0.78 0.15 160 / .45);background:oklch(1 0 0 / .04);box-shadow:0 0 0 3px oklch(0.78 0.15 160 / .08)}.vt .input-wrap.input-error{border-color:oklch(0.72 0.17 25 / .45)}.vt .input-wrap .input{background:transparent;border:none;outline:none}.vt .pill-muted{background:oklch(1 0 0 / .04);color:var(--muted);border:1px solid var(--line-2)}.vt .chip-muted{background:oklch(1 0 0 / .03);color:var(--muted);border-color:var(--line-2)}`; document.head.appendChild(_s);

Object.assign(window, {Logo, PublicHeader, Sidebar, AppSidebar, AppTopbar, Placeholder, DeviceIcon, Spark});
