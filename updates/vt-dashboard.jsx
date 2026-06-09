// Dashboard — elegant, information-dense monitoring
// Sections: Welcome + health, KPI row, Mesh topology + throughput, Active transfers + devices + anomalies + activity

function Dashboard(){
  return (
    <div className="vt" style={{width:1440,minHeight:1800,margin:'0 auto',borderRadius:16,border:'1px solid var(--line)',overflow:'hidden',display:'grid',gridTemplateColumns:'232px 1fr'}}>
      <AppSidebar current="overview"/>
      <div style={{minWidth:0,background:'var(--bg)'}}>
        <AppTopbar title="Overview" crumb="Home"/>
        <div style={{padding:'28px 36px 48px',display:'flex',flexDirection:'column',gap:24}}>
          <DashWelcome/>
          <DashKpis/>
          <DashMesh/>
          <DashThroughput/>
          <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr',gap:20}}>
            <DashActiveTransfers/>
            <DashAnomalies/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:20}}>
            <DashYourDevices/>
            <DashActivity/>
          </div>
          <DashQuickActions/>
        </div>
      </div>
    </div>
  );
}

function DashWelcome(){
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:24}}>
      <div>
        <div style={{fontSize:12,color:'var(--muted-2)',letterSpacing:'.06em',marginBottom:8}}>Thursday · 24 April 2026 · 14:32 IST</div>
        <h1 style={{fontSize:32,fontWeight:500,letterSpacing:'-0.02em',margin:0,lineHeight:1.1}}>
          Welcome back, <span className="serif" style={{color:'var(--accent)'}}>Yusuf.</span>
        </h1>
        <p style={{fontSize:14,color:'var(--fg-2)',marginTop:8,marginBottom:0,lineHeight:1.5,maxWidth:520}}>
          Your mesh is healthy. 4 devices online, 2 active sessions, and 1 transfer in flight right now.
        </p>
      </div>
      <div className="card-flat" style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <span className="live"/>
          <span style={{fontSize:9,color:'var(--muted-2)',letterSpacing:'.1em'}}>LIVE</span>
        </div>
        <div style={{width:1,height:32,background:'var(--line)'}}/>
        <div>
          <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Mesh health</div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:3}}>
            <span className="mono" style={{fontSize:17,color:'var(--accent)',fontWeight:500}}>98.7</span>
            <span style={{fontSize:11,color:'var(--muted)'}}>/ 100</span>
          </div>
        </div>
        <div style={{width:1,height:32,background:'var(--line)'}}/>
        <div>
          <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Uptime 30d</div>
          <div className="mono" style={{fontSize:15,color:'var(--fg)',marginTop:3,fontWeight:500}}>99.94%</div>
        </div>
      </div>
    </div>
  );
}

function DashKpis(){
  const kpis = [
    {label:'Devices', value:'4', sub:'all approved', delta:'+1 this month', dir:'up', icon:'monitor', tone:'emerald', spark:[3,3,3,3,3,4,4,4,4,4]},
    {label:'Active sessions', value:'2', sub:'7 peers connected', delta:'avg 24m dur', dir:'flat', icon:'users', tone:'cyan', spark:[1,2,1,2,2,1,2,3,2,2]},
    {label:'Transfers (7d)', value:'127', sub:'116 completed', delta:'+18%', dir:'up', icon:'send', tone:'violet', spark:[8,12,10,16,14,18,22,19,24,21]},
    {label:'Moved (7d)', value:'46.8', unit:'GB', sub:'87% direct path', delta:'+4.2 GB vs last wk', dir:'up', icon:'activity', tone:'amber', spark:[4,6,3,8,7,6,9,8,10,12]},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:16}}>
      {kpis.map(k => {
        const c = k.tone==='emerald'?'var(--accent)':k.tone==='cyan'?'var(--cyan)':k.tone==='violet'?'var(--violet)':'var(--amber)';
        return (
          <div key={k.label} className="card" style={{padding:18,display:'flex',flexDirection:'column',gap:14,position:'relative',overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
              <div>
                <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:500}}>{k.label}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:10}}>
                  <span className="mono" style={{fontSize:30,fontWeight:500,letterSpacing:'-0.03em',color:'var(--fg)'}}>{k.value}</span>
                  {k.unit && <span style={{fontSize:12,color:'var(--muted)'}}>{k.unit}</span>}
                </div>
                <div style={{fontSize:11.5,color:'var(--muted)',marginTop:4}}>{k.sub}</div>
              </div>
              <div style={{width:30,height:30,borderRadius:8,background:`color-mix(in oklch, ${c} 10%, transparent)`,border:`1px solid color-mix(in oklch, ${c} 22%, transparent)`,display:'flex',alignItems:'center',justifyContent:'center',color:c}}>
                <Icon name={k.icon} size={14}/>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <Spark data={k.spark} color={c}/>
              <span style={{fontSize:11,color:k.dir==='up'?'var(--accent)':'var(--muted)',display:'flex',alignItems:'center',gap:3}}>
                {k.dir==='up' && '↗'}{k.dir==='flat' && '→'} {k.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Spark({data, color}){
  const max = Math.max(...data), min = Math.min(...data);
  const w=84, h=26;
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*w;
    const y = h - ((v-min)/(max-min||1))*h;
    return [x,y];
  });
  const path = pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`g-${color.replace(/[^a-z]/g,'')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace(/[^a-z]/g,'')})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2" fill={color}/>
    </svg>
  );
}

function DashMesh(){
  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:14,color:'var(--fg)',fontWeight:500,letterSpacing:'-0.005em'}}>Network mesh</span>
          <span className="chip chip-emerald">4 of 4 online</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',gap:4,padding:3,background:'oklch(1 0 0 / .02)',borderRadius:8,border:'1px solid var(--line)'}}>
            {['Mesh','Topology','Latency'].map((t,i)=>(
              <button key={t} className="btn btn-ghost" style={{padding:'5px 11px',fontSize:11.5,background:i===0?'oklch(0.78 0.15 160 / .08)':'transparent',border:i===0?'1px solid oklch(0.78 0.15 160 / .2)':'1px solid transparent',color:i===0?'var(--accent)':'var(--fg-2)'}}>{t}</button>
            ))}
          </div>
          <button className="btn btn-ghost" style={{padding:'6px 10px'}}><Icon name="sliders" size={13}/></button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.8fr 1fr',minHeight:360}}>
        <div style={{position:'relative',background:'radial-gradient(ellipse at 50% 50%, oklch(0.16 0.014 235), oklch(0.13 0.012 235))',borderRight:'1px solid var(--line)'}}>
          <MeshVisualization/>
        </div>
        <div style={{padding:'18px 22px'}}>
          <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:500,marginBottom:14}}>Connected peers</div>
          <div style={{display:'flex',flexDirection:'column',gap:11}}>
            {[
              {n:'MacBook Pro 16"',loc:'Istanbul · TR',lat:'this',role:'me',icon:'monitor',tone:'emerald'},
              {n:'iPhone 15 Pro',loc:'Istanbul · TR',lat:'14ms',role:'direct',icon:'phone',tone:'emerald'},
              {n:'Linux Workstation',loc:'Istanbul · office',lat:'22ms',role:'direct',icon:'monitor',tone:'emerald'},
              {n:'Synology NAS',loc:'Istanbul · home',lat:'18ms',role:'direct',icon:'server',tone:'emerald'},
              {n:'iPad Air',loc:'last seen 3h',lat:'—',role:'offline',icon:'tablet',tone:'muted'},
            ].map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:11,padding:'10px 12px',borderRadius:9,background:p.role==='me'?'oklch(0.78 0.15 160 / .04)':'transparent',border:`1px solid ${p.role==='me'?'oklch(0.78 0.15 160 / .2)':'var(--line)'}`}}>
                <div style={{width:30,height:30,borderRadius:8,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',color:p.tone==='muted'?'var(--muted-2)':'var(--fg-2)'}}>
                  <Icon name={p.icon} size={13}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:12.5,color:p.tone==='muted'?'var(--muted)':'var(--fg)',fontWeight:500}}>{p.n}</span>
                    {p.role==='me' && <span className="pill pill-ok" style={{fontSize:8,padding:'1px 5px'}}>you</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--muted-2)',marginTop:1}}>{p.loc}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="mono" style={{fontSize:11,color:p.role==='offline'?'var(--muted-2)':p.role==='me'?'var(--muted)':'var(--accent)'}}>{p.lat}</div>
                  <div style={{fontSize:9,color:'var(--muted-2)',letterSpacing:'.08em',textTransform:'uppercase'}}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MeshVisualization(){
  const nodes = [
    {id:'me',x:340,y:200,r:38,label:'MacBook Pro',icon:'monitor',me:true},
    {id:'phone',x:170,y:100,r:28,label:'iPhone 15',icon:'phone'},
    {id:'linux',x:540,y:120,r:30,label:'Linux WS',icon:'monitor'},
    {id:'nas',x:540,y:310,r:30,label:'NAS',icon:'server'},
    {id:'ipad',x:160,y:300,r:26,label:'iPad',icon:'tablet',offline:true},
  ];
  const links = [
    ['me','phone','active'],
    ['me','linux','active'],
    ['me','nas','transfer'],
    ['phone','linux','active'],
    ['phone','nas','active'],
    ['linux','nas','active'],
    ['me','ipad','offline'],
  ];
  const nodeById = Object.fromEntries(nodes.map(n=>[n.id,n]));
  return (
    <svg viewBox="0 0 680 400" width="100%" height="100%" style={{display:'block'}}>
      <defs>
        <radialGradient id="nGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="nGlowT" cx="50%" cy="50%">
          <stop offset="0%" stopColor="oklch(0.84 0.13 85)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="oklch(0.84 0.13 85)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* radial rings */}
      {[60,140,220].map(r => (
        <circle key={r} cx="340" cy="200" r={r} fill="none" stroke="oklch(1 0 0 / .04)" strokeDasharray="2 4"/>
      ))}
      {/* links */}
      {links.map(([a,b,k],i) => {
        const A = nodeById[a], B = nodeById[b];
        const color = k==='transfer' ? 'var(--amber)' : k==='offline' ? 'var(--muted-2)' : 'var(--accent)';
        const op = k==='offline' ? 0.15 : k==='transfer' ? 0.5 : 0.25;
        return (
          <g key={i}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={color} strokeOpacity={op} strokeWidth={k==='transfer'?1.8:1} strokeDasharray={k==='offline'?'3 4':undefined}/>
            {k==='transfer' && (
              <>
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--amber)" strokeOpacity="0.8" strokeWidth="1.4" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" from="8" to="0" dur="0.8s" repeatCount="indefinite"/>
                </line>
                <circle r="3" fill="var(--amber)">
                  <animateMotion dur="2s" repeatCount="indefinite" path={`M${A.x},${A.y} L${B.x},${B.y}`}/>
                </circle>
              </>
            )}
          </g>
        );
      })}
      {/* nodes */}
      {nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.r+14} fill={n.me?'url(#nGlow)':n.offline?'none':'url(#nGlow)'}/>
          <circle cx={n.x} cy={n.y} r={n.r} fill="oklch(0.22 0.014 235)" stroke={n.me?'var(--accent)':n.offline?'var(--line-2)':'var(--line-2)'} strokeWidth={n.me?1.5:1} opacity={n.offline?0.5:1}/>
          {n.me && <circle cx={n.x} cy={n.y} r={n.r+4} fill="none" stroke="var(--accent)" strokeOpacity="0.35" strokeDasharray="3 4"><animateTransform attributeName="transform" type="rotate" from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`} dur="18s" repeatCount="indefinite"/></circle>}
          <foreignObject x={n.x-12} y={n.y-12} width="24" height="24">
            <div style={{width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',color:n.me?'var(--accent)':n.offline?'var(--muted-2)':'var(--fg-2)'}}>
              <Icon name={n.icon} size={16}/>
            </div>
          </foreignObject>
          <text x={n.x} y={n.y+n.r+16} textAnchor="middle" fill={n.offline?'var(--muted-2)':'var(--fg-2)'} fontSize="11" fontFamily="Inter" fontWeight="500">{n.label}</text>
        </g>
      ))}
      {/* legend */}
      <g transform="translate(22, 360)" fontFamily="Inter" fontSize="10">
        <g>
          <line x1="0" y1="0" x2="18" y2="0" stroke="var(--accent)" strokeOpacity="0.5"/>
          <text x="24" y="3" fill="var(--muted)">direct</text>
        </g>
        <g transform="translate(82,0)">
          <line x1="0" y1="0" x2="18" y2="0" stroke="var(--amber)" strokeDasharray="3 3"/>
          <text x="24" y="3" fill="var(--muted)">transfer</text>
        </g>
        <g transform="translate(175,0)">
          <line x1="0" y1="0" x2="18" y2="0" stroke="var(--muted-2)" strokeDasharray="3 3"/>
          <text x="24" y="3" fill="var(--muted)">offline</text>
        </g>
      </g>
      <g transform="translate(540, 360)" fontFamily="JetBrains Mono" fontSize="10" fill="var(--muted-2)">
        <text textAnchor="end" x="120">6 edges · 4 live</text>
      </g>
    </svg>
  );
}

function DashThroughput(){
  // Generate 2 series
  const points = 60;
  const up = Array.from({length:points},(_,i)=>{
    const base = 12 + Math.sin(i*0.3)*4 + Math.sin(i*0.11)*8;
    return Math.max(2, base + (i>40 && i<50 ? 18 : 0) + (i>28 && i<33 ? 8 : 0));
  });
  const dn = Array.from({length:points},(_,i)=>{
    const base = 6 + Math.sin(i*0.21+1)*3 + Math.sin(i*0.09)*5;
    return Math.max(1, base + (i>20 && i<27 ? 6 : 0));
  });
  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Throughput</span>
          <div style={{display:'flex',gap:14,alignItems:'center'}}>
            <span style={{fontSize:11.5,color:'var(--muted)',display:'flex',alignItems:'center',gap:6}}><span style={{width:8,height:8,borderRadius:2,background:'var(--accent)'}}/>Upload</span>
            <span style={{fontSize:11.5,color:'var(--muted)',display:'flex',alignItems:'center',gap:6}}><span style={{width:8,height:8,borderRadius:2,background:'var(--cyan)'}}/>Download</span>
          </div>
        </div>
        <div style={{display:'flex',gap:4,padding:3,background:'oklch(1 0 0 / .02)',borderRadius:8,border:'1px solid var(--line)'}}>
          {['1h','24h','7d','30d'].map((t,i)=>(
            <button key={t} className="btn btn-ghost" style={{padding:'4px 10px',fontSize:11,background:i===1?'oklch(0.78 0.15 160 / .08)':'transparent',border:i===1?'1px solid oklch(0.78 0.15 160 / .2)':'1px solid transparent',color:i===1?'var(--accent)':'var(--fg-2)'}}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 260px'}}>
        <div style={{padding:'18px 22px 10px',height:220}}>
          <ThroughputChart up={up} dn={dn}/>
        </div>
        <div style={{borderLeft:'1px solid var(--line)',padding:'18px 22px',display:'flex',flexDirection:'column',justifyContent:'center',gap:14}}>
          {[
            {l:'Peak upload',v:'48.2',u:'MB/s',c:'var(--accent)',t:'13:41'},
            {l:'Peak download',v:'12.8',u:'MB/s',c:'var(--cyan)',t:'09:22'},
            {l:'Sustained avg',v:'8.4',u:'MB/s',c:'var(--fg)'},
            {l:'p95 latency',v:'247',u:'ms',c:'var(--fg)'},
          ].map((m,i)=>(
            <div key={i}>
              <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>{m.l}</div>
              <div style={{display:'flex',alignItems:'baseline',gap:5,marginTop:3}}>
                <span className="mono" style={{fontSize:19,color:m.c,fontWeight:500,letterSpacing:'-0.02em'}}>{m.v}</span>
                <span style={{fontSize:11,color:'var(--muted)'}}>{m.u}</span>
                {m.t && <span style={{fontSize:10,color:'var(--muted-2)',marginLeft:'auto'}}>{m.t}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThroughputChart({up, dn}){
  const W=900, H=180, padL=28, padR=6, padT=10, padB=24;
  const iw = W-padL-padR, ih = H-padT-padB;
  const max = Math.max(...up,...dn,30);
  const scale = (v) => padT + ih - (v/max)*ih;
  const xAt = (i) => padL + (i/(up.length-1))*iw;
  const line = (arr) => arr.map((v,i)=>`${i===0?'M':'L'}${xAt(i).toFixed(1)},${scale(v).toFixed(1)}`).join(' ');
  const area = (arr) => `${line(arr)} L${xAt(arr.length-1)},${padT+ih} L${xAt(0)},${padT+ih} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{display:'block'}}>
      <defs>
        <linearGradient id="upG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="dnG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.14 215)" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="oklch(0.78 0.14 215)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* grid */}
      {[0,0.25,0.5,0.75,1].map((f,i)=>(
        <g key={i}>
          <line x1={padL} x2={W-padR} y1={padT+ih*f} y2={padT+ih*f} stroke="oklch(1 0 0 / .04)" strokeWidth="1"/>
          <text x={padL-6} y={padT+ih*f+3} fontSize="9" fontFamily="JetBrains Mono" textAnchor="end" fill="var(--muted-2)">{Math.round(max*(1-f))}</text>
        </g>
      ))}
      {/* x labels */}
      {['00','04','08','12','16','20','24'].map((t,i)=>(
        <text key={t} x={padL+(i/6)*iw} y={H-8} fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle" fill="var(--muted-2)">{t}:00</text>
      ))}
      {/* areas + lines */}
      <path d={area(dn)} fill="url(#dnG)"/>
      <path d={line(dn)} fill="none" stroke="var(--cyan)" strokeWidth="1.4"/>
      <path d={area(up)} fill="url(#upG)"/>
      <path d={line(up)} fill="none" stroke="var(--accent)" strokeWidth="1.6"/>
      {/* cursor */}
      <line x1={xAt(46)} x2={xAt(46)} y1={padT} y2={padT+ih} stroke="var(--fg)" strokeOpacity="0.3" strokeDasharray="2 3"/>
      <circle cx={xAt(46)} cy={scale(up[46])} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5"/>
      <circle cx={xAt(46)} cy={scale(dn[46])} r="3.5" fill="var(--cyan)" stroke="var(--bg)" strokeWidth="1.5"/>
      <g transform={`translate(${xAt(46)+10}, ${scale(up[46])-28})`}>
        <rect x="0" y="0" width="118" height="54" rx="6" fill="oklch(0.14 0.012 235)" stroke="var(--line-2)"/>
        <text x="10" y="15" fontSize="9" fontFamily="JetBrains Mono" fill="var(--muted-2)">13:41 · now</text>
        <text x="10" y="31" fontSize="10" fontFamily="JetBrains Mono" fill="var(--accent)">↑ 48.2 MB/s</text>
        <text x="10" y="45" fontSize="10" fontFamily="JetBrains Mono" fill="var(--cyan)">↓ 12.8 MB/s</text>
      </g>
    </svg>
  );
}

function DashActiveTransfers(){
  const items = [
    {name:'wedding-raw-batch-04.zip',from:'MacBook Pro',to:'Synology NAS',size:'2.4 GB',pct:68,rate:'48.2 MB/s',eta:'14s',chunks:'261 / 384'},
    {name:'project-vinctum-core.tar.gz',from:'Linux WS',to:'MacBook Pro',size:'186 MB',pct:100,rate:'—',eta:'done',chunks:'done',status:'verified'},
    {name:'IMG_4821.HEIC',from:'iPhone 15',to:'MacBook Pro',size:'3.8 MB',pct:100,rate:'—',eta:'done',chunks:'done',status:'verified'},
  ];
  return (
    <div className="card" style={{padding:0,overflow:'hidden',height:'fit-content'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Active & recent transfers</span>
          <span className="chip chip-emerald">1 live</span>
        </div>
        <span style={{fontSize:12,color:'var(--accent)'}}>View all →</span>
      </div>
      <div>
        {items.map((t,i,arr) => (
          <div key={i} style={{padding:'16px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,gap:10}}>
              <div style={{display:'flex',gap:11,alignItems:'center',minWidth:0,flex:1}}>
                <div style={{width:32,height:32,borderRadius:8,background:t.status==='verified'?'oklch(0.78 0.15 160 / .08)':'oklch(0.84 0.13 85 / .08)',border:`1px solid ${t.status==='verified'?'oklch(0.78 0.15 160 / .2)':'oklch(0.84 0.13 85 / .2)'}`,display:'flex',alignItems:'center',justifyContent:'center',color:t.status==='verified'?'var(--accent)':'var(--amber)',flexShrink:0}}>
                  <Icon name={t.status==='verified'?'check':'send'} size={13}/>
                </div>
                <div style={{minWidth:0,flex:1}}>
                  <div className="mono" style={{fontSize:12.5,color:'var(--fg)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
                  <div style={{fontSize:11,color:'var(--muted-2)',marginTop:2,display:'flex',alignItems:'center',gap:5}}>
                    <span>{t.from}</span>
                    <Icon name="arrow_right" size={9}/>
                    <span>{t.to}</span>
                    <span style={{color:'var(--muted-2)'}}>· {t.size}</span>
                  </div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="mono" style={{fontSize:12,color:t.status==='verified'?'var(--accent)':'var(--fg)'}}>{t.rate}</div>
                <div style={{fontSize:10,color:'var(--muted-2)',marginTop:2}}>{t.eta}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,height:4,borderRadius:99,background:'var(--line)',overflow:'hidden'}}>
                <div style={{width:`${t.pct}%`,height:'100%',background:t.status==='verified'?'var(--accent)':'linear-gradient(90deg, var(--accent), oklch(0.84 0.13 85))',borderRadius:99,position:'relative'}}/>
              </div>
              <span className="mono" style={{fontSize:10.5,color:'var(--muted)',minWidth:68,textAlign:'right'}}>{t.chunks}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashAnomalies(){
  const items = [
    {sev:'info',title:'New device pairing requested',sub:'"Office Windows" from 10.3.4.12',time:'2m',actions:['Review','Dismiss']},
    {sev:'warn',title:'Relay fallback engaged once',sub:'iPad ↔ NAS · direct path failed 1/6 transfers',time:'47m'},
    {sev:'ok',title:'Post-quantum handshake succeeded',sub:'First successful Kyber-768 key exchange',time:'3h'},
    {sev:'info',title:'Key rotation scheduled',sub:'MacBook Pro keys auto-rotate in 4 days',time:'yesterday'},
  ];
  return (
    <div className="card" style={{padding:0,overflow:'hidden',height:'fit-content'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Events & anomalies</span>
          <span className="pill pill-muted">4 new</span>
        </div>
        <span style={{fontSize:12,color:'var(--accent)'}}>Security log →</span>
      </div>
      <div>
        {items.map((it,i,arr)=>{
          const tones = {info:'var(--cyan)',warn:'var(--amber)',ok:'var(--accent)',bad:'var(--red)'};
          return (
            <div key={i} style={{padding:'14px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none',display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:7,height:7,borderRadius:99,background:tones[it.sev],marginTop:6,boxShadow:`0 0 8px ${tones[it.sev]}`,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                  <span style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{it.title}</span>
                  <span style={{fontSize:10.5,color:'var(--muted-2)'}}>{it.time}</span>
                </div>
                <div style={{fontSize:11.5,color:'var(--muted)',marginTop:3}}>{it.sub}</div>
                {it.actions && <div style={{display:'flex',gap:6,marginTop:10}}>{it.actions.map(a => <button key={a} className="btn btn-ghost" style={{padding:'4px 10px',fontSize:11}}>{a}</button>)}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashYourDevices(){
  const devices = [
    {n:'MacBook Pro 16"',type:'monitor',os:'macOS 15.2',lastSeen:'now',health:99,sent:'12.4 GB',recv:'3.1 GB',me:true},
    {n:'iPhone 15 Pro',type:'phone',os:'iOS 18.3',lastSeen:'now',health:98,sent:'1.2 GB',recv:'840 MB'},
    {n:'Linux Workstation',type:'monitor',os:'Ubuntu 24.04',lastSeen:'now',health:97,sent:'8.9 GB',recv:'4.2 GB'},
    {n:'Synology NAS',type:'server',os:'DSM 7.3',lastSeen:'now',health:100,sent:'24.0 GB',recv:'18.4 GB'},
    {n:'iPad Air',type:'tablet',os:'iPadOS 18.2',lastSeen:'3h',health:0,sent:'—',recv:'—',offline:true},
  ];
  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <span style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Your devices</span>
        <button className="btn btn-ghost" style={{padding:'5px 10px',fontSize:11.5}}><Icon name="qr" size={12}/> Pair new</button>
      </div>
      <div>
        {devices.map((d,i,arr)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'28px 1fr auto',gap:14,padding:'14px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none',alignItems:'center',opacity:d.offline?0.6:1}}>
            <div style={{width:28,height:28,borderRadius:7,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-2)'}}>
              <Icon name={d.type} size={13}/>
            </div>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{d.n}</span>
                {d.me && <span className="pill pill-ok" style={{fontSize:8}}>this device</span>}
                {d.offline && <span className="pill pill-muted">offline</span>}
              </div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{d.os} · ↑ {d.sent} · ↓ {d.recv}</div>
            </div>
            <div style={{textAlign:'right'}}>
              {!d.offline ? (
                <>
                  <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-end'}}>
                    <div style={{width:48,height:4,borderRadius:99,background:'var(--line)',overflow:'hidden'}}>
                      <div style={{width:`${d.health}%`,height:'100%',background:d.health>95?'var(--accent)':'var(--amber)'}}/>
                    </div>
                    <span className="mono" style={{fontSize:10.5,color:'var(--muted)'}}>{d.health}</span>
                  </div>
                  <div style={{fontSize:10,color:'var(--muted-2)',marginTop:3}}>online</div>
                </>
              ) : (
                <div style={{fontSize:10.5,color:'var(--muted-2)'}}>last: 3h</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashActivity(){
  const acts = [
    {t:'14:32',icon:'send',tone:'var(--amber)',who:'You',what:'started transfer',obj:'wedding-raw-batch-04.zip',det:'MacBook Pro → Synology NAS · 2.4 GB'},
    {t:'14:18',icon:'check',tone:'var(--accent)',who:'Linux WS',what:'completed transfer',obj:'project-vinctum-core.tar.gz',det:'186 MB · verified'},
    {t:'13:55',icon:'phone',tone:'var(--cyan)',who:'iPhone 15',what:'joined session',obj:'"evening-offload"',det:'shared with 2 devices'},
    {t:'13:41',icon:'qr',tone:'var(--violet)',who:'You',what:'approved pairing',obj:'Synology NAS',det:'Ed25519 fingerprint · f4a1c27'},
    {t:'12:10',icon:'shield',tone:'var(--accent)',who:'System',what:'rotated keys for',obj:'Linux Workstation',det:'scheduled · no user action needed'},
    {t:'09:22',icon:'send',tone:'var(--accent)',who:'iPhone 15',what:'sent',obj:'IMG_4821.HEIC',det:'3.8 MB · direct path'},
    {t:'07:48',icon:'warn',tone:'var(--amber)',who:'System',what:'detected stale session',obj:'old-browser-tab',det:'terminated automatically'},
  ];
  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 22px',borderBottom:'1px solid var(--line)'}}>
        <span style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Activity timeline</span>
        <div style={{display:'flex',gap:6}}>
          {['All','Transfers','Security','System'].map((t,i) => (
            <span key={t} style={{fontSize:11,padding:'3px 9px',borderRadius:99,color:i===0?'var(--accent)':'var(--muted)',background:i===0?'oklch(0.78 0.15 160 / .08)':'transparent',border:i===0?'1px solid oklch(0.78 0.15 160 / .2)':'1px solid transparent'}}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{padding:'10px 22px 16px'}}>
        {acts.map((a,i)=>(
          <div key={i} style={{display:'flex',gap:14,padding:'10px 0',position:'relative'}}>
            <div style={{position:'relative',flexShrink:0}}>
              {i<acts.length-1 && <div style={{position:'absolute',top:28,left:13,bottom:-10,width:1,background:'var(--line)'}}/>}
              <div style={{width:28,height:28,borderRadius:99,background:'oklch(0.14 0.012 235)',border:`1px solid ${a.tone}`,display:'flex',alignItems:'center',justifyContent:'center',color:a.tone,boxShadow:`0 0 0 3px oklch(0.14 0.012 235)`}}>
                <Icon name={a.icon} size={12}/>
              </div>
            </div>
            <div style={{flex:1,paddingTop:4}}>
              <div style={{fontSize:12.5,color:'var(--fg-2)'}}>
                <span style={{color:'var(--fg)',fontWeight:500}}>{a.who}</span> {a.what} <span className="mono" style={{color:'var(--fg)'}}>{a.obj}</span>
              </div>
              <div style={{fontSize:11,color:'var(--muted-2)',marginTop:2}}>{a.det}</div>
            </div>
            <div className="mono" style={{fontSize:10.5,color:'var(--muted-2)',paddingTop:8}}>{a.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashQuickActions(){
  const qa = [
    {icon:'send',t:'Send a file',s:'Choose a file and a destination device',primary:true},
    {icon:'qr',t:'Pair a device',s:'Add phone, laptop, or NAS to your mesh'},
    {icon:'users',t:'Start a session',s:'Open a transfer window with multiple peers'},
    {icon:'shield',t:'Security check',s:'Run an integrity audit over your keys'},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:14}}>
      {qa.map((a,i)=>(
        <div key={i} className={a.primary?'card':'card-flat'} style={{padding:18,display:'flex',alignItems:'center',gap:14,cursor:'pointer',position:'relative',...(a.primary?{boxShadow:'0 0 0 1px oklch(0.78 0.15 160 / .2), 0 20px 40px rgba(0,0,0,.2)',border:'1px solid oklch(0.78 0.15 160 / .25)'}:{})}}>
          <div style={{width:42,height:42,borderRadius:11,background:a.primary?'oklch(0.78 0.15 160 / .1)':'oklch(1 0 0 / .02)',border:`1px solid ${a.primary?'oklch(0.78 0.15 160 / .25)':'var(--line-2)'}`,display:'flex',alignItems:'center',justifyContent:'center',color:a.primary?'var(--accent)':'var(--fg-2)'}}>
            <Icon name={a.icon} size={17}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,color:'var(--fg)',fontWeight:500}}>{a.t}</div>
            <div style={{fontSize:11.5,color:'var(--muted)',marginTop:2,lineHeight:1.4}}>{a.s}</div>
          </div>
          <Icon name="arrow_right" size={13} style={{color:a.primary?'var(--accent)':'var(--muted-2)'}}/>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {Dashboard});
