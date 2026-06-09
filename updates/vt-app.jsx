// Devices, Sessions, Transfers, Account, NotFound

function AppShell({current,title,crumb,children,noPadding}){
  return (
    <div className="vt" style={{width:1440,minHeight:1400,margin:'0 auto',borderRadius:16,border:'1px solid var(--line)',overflow:'hidden',display:'grid',gridTemplateColumns:'232px 1fr'}}>
      <AppSidebar current={current}/>
      <div style={{minWidth:0,background:'var(--bg)'}}>
        <AppTopbar title={title} crumb={crumb}/>
        <div style={{padding:noPadding?0:'28px 36px 48px'}}>{children}</div>
      </div>
    </div>
  );
}

// ---- DEVICES
function Devices(){
  const list = [
    {n:'MacBook Pro 16"',t:'monitor',os:'macOS 15.2 · Apple M3 Max',fp:'ed25519:8f3a…c4b1',loc:'Istanbul',lastActive:'now',sent:12.4,recv:3.1,status:'online',me:true,paired:'2024-03-12',transfers:342},
    {n:'iPhone 15 Pro',t:'phone',os:'iOS 18.3',fp:'ed25519:a12e…9f34',loc:'Istanbul',lastActive:'now',sent:1.2,recv:0.84,status:'online',paired:'2024-03-14',transfers:156},
    {n:'Linux Workstation',t:'monitor',os:'Ubuntu 24.04 · Ryzen 7950X',fp:'ed25519:2d7f…b1e8',loc:'Istanbul · office',lastActive:'now',sent:8.9,recv:4.2,status:'online',paired:'2024-05-02',transfers:89},
    {n:'Synology NAS',t:'server',os:'DSM 7.3 · RS1221+',fp:'ed25519:6b4a…f091',loc:'Istanbul · home',lastActive:'now',sent:24.0,recv:18.4,status:'online',paired:'2024-06-18',transfers:217},
    {n:'iPad Air',t:'tablet',os:'iPadOS 18.2',fp:'ed25519:9c1d…e4f2',loc:'—',lastActive:'3h ago',sent:0.3,recv:0.1,status:'offline',paired:'2024-08-01',transfers:47},
    {n:'Office Windows',t:'monitor',os:'Windows 11 · Dell XPS',fp:'ed25519:4f8e…a2c9',loc:'Istanbul · office',lastActive:'—',sent:0,recv:0,status:'pending',paired:'—',transfers:0},
  ];
  const online = list.filter(d=>d.status==='online').length;
  const pending = list.filter(d=>d.status==='pending').length;

  return (
    <AppShell current="devices" title="Devices" crumb="Home · Devices">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,gap:24}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:500,letterSpacing:'-0.02em',margin:0}}>
            Devices in your <span className="serif" style={{color:'var(--accent)'}}>mesh</span>
          </h1>
          <p style={{fontSize:13.5,color:'var(--fg-2)',marginTop:8,marginBottom:0}}>{online} online · {pending} pending approval · {list.length-online-pending} offline. All devices share the same root identity.</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost"><Icon name="shield" size={14}/>Audit keys</button>
          <button className="btn btn-primary"><Icon name="qr" size={14}/>Pair new device</button>
        </div>
      </div>

      {/* Pairing card */}
      {pending>0 && (
        <div className="card" style={{marginBottom:20,padding:20,display:'flex',gap:24,alignItems:'center',borderColor:'oklch(0.84 0.13 85 / .25)',background:'oklch(0.84 0.13 85 / .03)'}}>
          <div style={{width:44,height:44,borderRadius:11,background:'oklch(0.84 0.13 85 / .1)',border:'1px solid oklch(0.84 0.13 85 / .25)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--amber)'}}>
            <Icon name="warn" size={18}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Pairing request pending</div>
            <div style={{fontSize:12.5,color:'var(--fg-2)',marginTop:4}}>"Office Windows" wants to join your mesh. Verify the 6-digit code on its screen matches the one below before approving.</div>
          </div>
          <div className="mono" style={{fontSize:22,letterSpacing:'.18em',padding:'10px 16px',border:'1px dashed var(--line-2)',borderRadius:10,color:'var(--fg)',background:'oklch(0.14 0.012 235)'}}>8 3 4 9 2 1</div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost">Reject</button>
            <button className="btn btn-primary">Approve</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center'}}>
        <div className="input-wrap" style={{flex:1,maxWidth:320,display:'flex',alignItems:'center',gap:8,padding:'8px 12px'}}>
          <Icon name="send" size={13} style={{color:'var(--muted-2)',transform:'rotate(-45deg)'}}/>
          <span style={{fontSize:12.5,color:'var(--muted)'}}>Search by name, OS, fingerprint…</span>
        </div>
        <div style={{display:'flex',gap:4,padding:3,background:'oklch(1 0 0 / .02)',borderRadius:8,border:'1px solid var(--line)'}}>
          {['All','Online','Offline','Pending'].map((t,i)=>(
            <button key={t} className="btn btn-ghost" style={{padding:'5px 11px',fontSize:11.5,background:i===0?'oklch(0.78 0.15 160 / .08)':'transparent',border:i===0?'1px solid oklch(0.78 0.15 160 / .2)':'1px solid transparent',color:i===0?'var(--accent)':'var(--fg-2)'}}>{t}</button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:4,padding:3,background:'oklch(1 0 0 / .02)',borderRadius:8,border:'1px solid var(--line)'}}>
          <button className="btn btn-ghost" style={{padding:'6px 8px',background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',color:'var(--accent)'}}><Icon name="activity" size={12}/></button>
          <button className="btn btn-ghost" style={{padding:'6px 8px'}}><Icon name="users" size={12}/></button>
        </div>
      </div>

      {/* Device grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {list.map((d,i)=>(
          <DeviceCard key={i} d={d}/>
        ))}
      </div>
    </AppShell>
  );
}

function DeviceCard({d}){
  const statusC = d.status==='online'?'var(--accent)':d.status==='pending'?'var(--amber)':'var(--muted-2)';
  return (
    <div className={`card ${d.me?'':''}`} style={{padding:20,position:'relative',...(d.me?{borderColor:'oklch(0.78 0.15 160 / .25)',boxShadow:'0 0 0 1px oklch(0.78 0.15 160 / .15)'}:{})}}>
      <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
        <div style={{width:44,height:44,borderRadius:11,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-2)',flexShrink:0,position:'relative'}}>
          <Icon name={d.t} size={18}/>
          <div style={{position:'absolute',bottom:-3,right:-3,width:11,height:11,borderRadius:99,background:statusC,border:'2px solid var(--panel)'}}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
            <span style={{fontSize:15,color:'var(--fg)',fontWeight:500,letterSpacing:'-0.01em'}}>{d.n}</span>
            {d.me && <span className="pill pill-ok" style={{fontSize:8}}>this device</span>}
            {d.status==='pending' && <span className="pill pill-warn">pending</span>}
            {d.status==='offline' && <span className="pill pill-muted">offline</span>}
          </div>
          <div style={{fontSize:12,color:'var(--muted)',marginTop:3}}>{d.os}</div>
        </div>
        <button className="btn btn-ghost" style={{padding:'4px 8px'}}>⋯</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <div style={{padding:'10px 12px',borderRadius:8,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)'}}>
          <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Location</div>
          <div style={{fontSize:12,color:'var(--fg)',marginTop:3}}>{d.loc}</div>
        </div>
        <div style={{padding:'10px 12px',borderRadius:8,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)'}}>
          <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Last active</div>
          <div style={{fontSize:12,color:'var(--fg)',marginTop:3,display:'flex',alignItems:'center',gap:5}}>
            {d.status==='online' && <span className="live"/>}
            {d.lastActive}
          </div>
        </div>
      </div>

      <div style={{padding:'10px 12px',borderRadius:8,background:'oklch(0.13 0.012 235)',border:'1px solid var(--line)',marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
        <Icon name="shield" size={12} style={{color:'var(--accent)'}}/>
        <span className="mono" style={{fontSize:11,color:'var(--fg-2)',flex:1}}>{d.fp}</span>
        <span style={{fontSize:10,color:'var(--muted-2)'}}>verified</span>
      </div>

      <div style={{display:'flex',gap:20}}>
        <div>
          <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Sent</div>
          <div className="mono" style={{fontSize:13,color:'var(--fg)',marginTop:3}}>{d.sent} GB</div>
        </div>
        <div>
          <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Received</div>
          <div className="mono" style={{fontSize:13,color:'var(--fg)',marginTop:3}}>{d.recv} GB</div>
        </div>
        <div>
          <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Transfers</div>
          <div className="mono" style={{fontSize:13,color:'var(--fg)',marginTop:3}}>{d.transfers}</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
          {!d.me && d.status!=='pending' && <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:11.5}}>Revoke</button>}
          <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:11.5}}>Details</button>
        </div>
      </div>
    </div>
  );
}

// ---- SESSIONS
function Sessions(){
  const sessions = [
    {n:'evening-offload',created:'13:55',duration:'37m',devices:['MacBook Pro','iPhone 15','Synology NAS'],transfers:12,throughput:'14.2 MB/s',status:'active'},
    {n:'wedding-raw-sync',created:'12:40',duration:'2h 14m',devices:['MacBook Pro','Synology NAS'],transfers:48,throughput:'22.8 MB/s',status:'active'},
    {n:'office-sync',created:'Yesterday 18:22',duration:'4h 02m',devices:['Linux WS','MacBook Pro','iPhone 15'],transfers:17,throughput:'8.4 MB/s',status:'closed'},
    {n:'trip-photos',created:'23 Apr',duration:'45m',devices:['iPhone 15','MacBook Pro'],transfers:89,throughput:'4.1 MB/s',status:'closed'},
  ];
  return (
    <AppShell current="sessions" title="Sessions" crumb="Home · Sessions">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,gap:24}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:500,letterSpacing:'-0.02em',margin:0}}>
            Active & past <span className="serif" style={{color:'var(--accent)'}}>sessions</span>
          </h1>
          <p style={{fontSize:13.5,color:'var(--fg-2)',marginTop:8,marginBottom:0}}>A session is a time-bounded transfer window between two or more of your devices. Each one has its own ephemeral session key.</p>
        </div>
        <button className="btn btn-primary"><Icon name="users" size={14}/>New session</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:14,marginBottom:24}}>
        {[['Active','2','var(--accent)'],['Devices connected','7','var(--cyan)'],['Transfers in session','60','var(--violet)'],['Avg duration','1h 24m','var(--fg)']].map(([l,v,c],i)=>(
          <div key={i} className="card-flat" style={{padding:16}}>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>{l}</div>
            <div className="mono" style={{fontSize:24,color:c,marginTop:8,letterSpacing:'-0.02em',fontWeight:500}}>{v}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr 1fr 100px',padding:'12px 22px',borderBottom:'1px solid var(--line)',background:'oklch(1 0 0 / .02)'}}>
          {['Session','Devices','Transfers','Throughput','Status'].map(h => (
            <div key={h} style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>{h}</div>
          ))}
        </div>
        {sessions.map((s,i,arr)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1.5fr 1fr 1fr 100px',padding:'18px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none',alignItems:'center',gap:16}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {s.status==='active' ? <span className="live"/> : <span style={{width:8,height:8,borderRadius:99,background:'var(--muted-2)'}}/>}
                <span className="mono" style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{s.n}</span>
              </div>
              <div style={{fontSize:11,color:'var(--muted)',marginTop:3,paddingLeft:16}}>started {s.created} · {s.duration}</div>
            </div>
            <div style={{display:'flex',gap:-6}}>
              {s.devices.map((dn,j)=>(
                <div key={j} style={{width:26,height:26,borderRadius:99,background:'oklch(0.18 0.014 235)',border:'2px solid var(--panel)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-2)',marginLeft:j>0?-8:0,zIndex:s.devices.length-j}}>
                  <Icon name={dn.includes('iPhone')?'phone':dn.includes('NAS')?'server':'monitor'} size={11}/>
                </div>
              ))}
              <span style={{fontSize:11.5,color:'var(--muted)',marginLeft:10,alignSelf:'center'}}>{s.devices.length} devices</span>
            </div>
            <div className="mono" style={{fontSize:13,color:'var(--fg)'}}>{s.transfers}</div>
            <div className="mono" style={{fontSize:13,color:s.status==='active'?'var(--accent)':'var(--muted)'}}>{s.throughput}</div>
            <div>
              <span className={`chip ${s.status==='active'?'chip-emerald':'chip-muted'}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

// ---- TRANSFERS
function Transfers(){
  const items = [
    {name:'wedding-raw-batch-04.zip',from:'MacBook Pro',to:'Synology NAS',size:'2.4 GB',pct:68,rate:'48.2 MB/s',eta:'14s',status:'in_progress',when:'now'},
    {name:'project-vinctum-core.tar.gz',from:'Linux WS',to:'MacBook Pro',size:'186 MB',pct:100,rate:'32.4 MB/s',eta:'done',status:'completed',when:'14:18'},
    {name:'IMG_4821.HEIC',from:'iPhone 15',to:'MacBook Pro',size:'3.8 MB',pct:100,rate:'6.1 MB/s',eta:'done',status:'completed',when:'09:22'},
    {name:'quarterly-review.pdf',from:'MacBook Pro',to:'iPad Air',size:'24 MB',pct:0,rate:'—',eta:'queued',status:'pending',when:'14:31'},
    {name:'source-interview-raw.wav',from:'iPhone 15',to:'Linux WS',size:'412 MB',pct:42,rate:'—',eta:'failed',status:'failed',when:'13:02'},
    {name:'backup-photos-2025-12.tar',from:'MacBook Pro',to:'Synology NAS',size:'18.2 GB',pct:100,rate:'44.8 MB/s',eta:'done',status:'completed',when:'Yesterday'},
    {name:'client-deliverable-final.zip',from:'MacBook Pro',to:'iPhone 15',size:'84 MB',pct:100,rate:'12.1 MB/s',eta:'done',status:'completed',when:'Yesterday'},
  ];

  const statusChip = (s) => {
    if(s==='in_progress') return <span className="chip" style={{background:'oklch(0.84 0.13 85 / .1)',color:'var(--amber)',borderColor:'oklch(0.84 0.13 85 / .25)'}}>transferring</span>;
    if(s==='completed') return <span className="chip chip-emerald">completed</span>;
    if(s==='pending') return <span className="chip chip-muted">queued</span>;
    if(s==='failed') return <span className="chip" style={{background:'oklch(0.72 0.17 25 / .1)',color:'var(--red)',borderColor:'oklch(0.72 0.17 25 / .25)'}}>failed</span>;
  };

  return (
    <AppShell current="transfers" title="File sharing" crumb="Home · File sharing">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,gap:24}}>
        <div>
          <h1 style={{fontSize:28,fontWeight:500,letterSpacing:'-0.02em',margin:0}}>
            File <span className="serif" style={{color:'var(--accent)'}}>transfers</span>
          </h1>
          <p style={{fontSize:13.5,color:'var(--fg-2)',marginTop:8,marginBottom:0}}>Every transfer is end-to-end encrypted. We never see filenames, contents, or metadata — only chunk counts and destinations.</p>
        </div>
        <button className="btn btn-primary" style={{padding:'12px 18px',fontSize:14}}><Icon name="send" size={15}/>Send a file</button>
      </div>

      {/* Drop zone */}
      <div className="card" style={{padding:0,marginBottom:20,overflow:'hidden'}}>
        <div style={{padding:'32px 32px',border:'1.5px dashed var(--line-2)',margin:12,borderRadius:14,background:'radial-gradient(ellipse at 50% 50%, oklch(0.78 0.15 160 / .03), transparent 70%)',display:'flex',alignItems:'center',gap:24,justifyContent:'center',flexWrap:'wrap'}}>
          <div style={{width:56,height:56,borderRadius:14,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)'}}>
            <Icon name="send" size={22}/>
          </div>
          <div>
            <div style={{fontSize:16,color:'var(--fg)',fontWeight:500,letterSpacing:'-0.01em'}}>Drop files here</div>
            <div style={{fontSize:12.5,color:'var(--muted)',marginTop:3}}>or click to browse. Max chunk 256 KB · AES-256-GCM · direct path preferred.</div>
          </div>
          <div style={{width:1,height:40,background:'var(--line)'}}/>
          <div>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>Send to</div>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              {[
                {n:'iPhone 15',i:'phone',on:true},
                {n:'Linux WS',i:'monitor'},
                {n:'NAS',i:'server'},
                {n:'iPad Air',i:'tablet',off:true},
              ].map((p,i)=>(
                <div key={i} style={{padding:'6px 10px',borderRadius:8,border:`1px solid ${p.on?'oklch(0.78 0.15 160 / .25)':'var(--line)'}`,background:p.on?'oklch(0.78 0.15 160 / .06)':'transparent',display:'flex',alignItems:'center',gap:6,opacity:p.off?0.5:1}}>
                  <Icon name={p.i} size={11} style={{color:p.on?'var(--accent)':'var(--fg-2)'}}/>
                  <span style={{fontSize:11.5,color:p.on?'var(--accent)':'var(--fg-2)'}}>{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{display:'flex',gap:10,marginBottom:12,alignItems:'center'}}>
        <div style={{display:'flex',gap:4,padding:3,background:'oklch(1 0 0 / .02)',borderRadius:8,border:'1px solid var(--line)'}}>
          {['All','Active','Completed','Failed'].map((t,i)=>(
            <button key={t} className="btn btn-ghost" style={{padding:'5px 11px',fontSize:11.5,background:i===0?'oklch(0.78 0.15 160 / .08)':'transparent',border:i===0?'1px solid oklch(0.78 0.15 160 / .2)':'1px solid transparent',color:i===0?'var(--accent)':'var(--fg-2)'}}>{t}</button>
          ))}
        </div>
        <span style={{fontSize:12,color:'var(--muted)',marginLeft:10}}>{items.length} transfers · {items.filter(x=>x.status==='completed').length} completed · {items.filter(x=>x.status==='failed').length} failed</span>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:11.5}}>Export CSV</button>
        </div>
      </div>

      {/* Transfer list */}
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'40px 1.8fr 1.4fr 110px 120px 110px 100px',padding:'12px 22px',borderBottom:'1px solid var(--line)',background:'oklch(1 0 0 / .02)'}}>
          {['','File','Route','Size','Speed','Status','When'].map(h => (
            <div key={h} style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>{h}</div>
          ))}
        </div>
        {items.map((t,i,arr)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'40px 1.8fr 1.4fr 110px 120px 110px 100px',padding:'16px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none',alignItems:'center',gap:12}}>
            <div style={{width:28,height:28,borderRadius:7,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-2)'}}>
              <Icon name={t.status==='completed'?'check':t.status==='failed'?'warn':'send'} size={12} style={{color:t.status==='completed'?'var(--accent)':t.status==='failed'?'var(--red)':'var(--amber)'}}/>
            </div>
            <div style={{minWidth:0}}>
              <div className="mono" style={{fontSize:12.5,color:'var(--fg)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
              {t.status==='in_progress' && (
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                  <div style={{flex:1,height:3,borderRadius:99,background:'var(--line)',overflow:'hidden',maxWidth:180}}>
                    <div style={{width:`${t.pct}%`,height:'100%',background:'linear-gradient(90deg, var(--accent), oklch(0.84 0.13 85))'}}/>
                  </div>
                  <span className="mono" style={{fontSize:10,color:'var(--muted)'}}>{t.pct}%</span>
                </div>
              )}
            </div>
            <div style={{fontSize:12,color:'var(--fg-2)',display:'flex',alignItems:'center',gap:6}}>
              <span>{t.from}</span>
              <Icon name="arrow_right" size={10} style={{color:'var(--muted-2)'}}/>
              <span>{t.to}</span>
            </div>
            <div className="mono" style={{fontSize:12,color:'var(--fg-2)'}}>{t.size}</div>
            <div className="mono" style={{fontSize:12,color:t.status==='in_progress'?'var(--amber)':t.status==='completed'?'var(--accent)':'var(--muted)'}}>{t.rate}</div>
            <div>{statusChip(t.status)}</div>
            <div style={{fontSize:11.5,color:'var(--muted)',display:'flex',alignItems:'center',gap:6}}>
              {t.when}
              {t.status==='in_progress' && <span className="mono" style={{fontSize:10,color:'var(--amber)',marginLeft:'auto'}}>{t.eta}</span>}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

// ---- ACCOUNT
function Account(){
  return (
    <AppShell current="account" title="Account" crumb="Home · Account">
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24}}>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <h1 style={{fontSize:28,fontWeight:500,letterSpacing:'-0.02em',margin:0}}>
              Your <span className="serif" style={{color:'var(--accent)'}}>account</span>
            </h1>
            <p style={{fontSize:13.5,color:'var(--fg-2)',marginTop:8,marginBottom:0}}>Identity, security, and billing. Almost everything below is stored on your devices — we hold only the minimum we need to route.</p>
          </div>

          <AccountSection title="Identity" subtitle="What the mesh knows about you">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <AccountField label="Display name" value="Yusuf Sait"/>
              <AccountField label="Username" value="@yusufsait"/>
              <AccountField label="Email" value="yusuf@sait.dev" badge="verified"/>
              <AccountField label="Joined" value="12 March 2024" readOnly/>
            </div>
          </AccountSection>

          <AccountSection title="Security" subtitle="Keys, sessions, and recovery">
            <div style={{display:'flex',flexDirection:'column',gap:0,borderRadius:10,border:'1px solid var(--line)',overflow:'hidden'}}>
              {[
                {icon:'shield',t:'Root identity key',s:'ed25519:8f3a…c4b1 · generated 12 Mar 2024 · Apple Secure Enclave',btn:'Rotate'},
                {icon:'code',t:'Recovery phrase',s:'12 words · last viewed 8 Nov 2024',btn:'Re-verify'},
                {icon:'users',t:'Trusted contacts (social recovery)',s:'3 of 5 configured',btn:'Manage',tag:'pro'},
                {icon:'activity',t:'Active web sessions',s:'2 devices · Chrome (Istanbul), Safari (Istanbul)',btn:'Sign out all'},
                {icon:'cpu',t:'Post-quantum hybrid',s:'Kyber-768 enabled on 3 of 5 devices',btn:'Enable everywhere',tag:'beta'},
              ].map((r,i,arr)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none'}}>
                  <div style={{width:34,height:34,borderRadius:9,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--fg-2)'}}>
                    <Icon name={r.icon} size={14}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:7}}>
                      <span style={{fontSize:13.5,color:'var(--fg)',fontWeight:500}}>{r.t}</span>
                      {r.tag && <span className={`pill ${r.tag==='beta'?'pill-warn':'pill-ok'}`}>{r.tag}</span>}
                    </div>
                    <div style={{fontSize:11.5,color:'var(--muted)',marginTop:2}}>{r.s}</div>
                  </div>
                  <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:11.5}}>{r.btn}</button>
                </div>
              ))}
            </div>
          </AccountSection>

          <AccountSection title="Preferences" subtitle="Behavioural defaults">
            <div style={{display:'flex',flexDirection:'column',gap:0,borderRadius:10,border:'1px solid var(--line)',overflow:'hidden'}}>
              {[
                {t:'Prefer direct paths',s:'Refuse relay fallback — fail the transfer instead',on:false},
                {t:'Verify Merkle root before writing',s:'Wait for full integrity check before exposing the file on disk',on:true},
                {t:'Auto-accept from paired devices',s:'No prompt for transfers initiated from your own devices',on:true},
                {t:'Notify on pairing requests',s:'Email + push when any device attempts to pair',on:true},
              ].map((p,i,arr)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none'}}>
                  <div>
                    <div style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{p.t}</div>
                    <div style={{fontSize:11.5,color:'var(--muted)',marginTop:2}}>{p.s}</div>
                  </div>
                  <div style={{width:34,height:20,borderRadius:99,background:p.on?'oklch(0.78 0.15 160 / .25)':'var(--line)',border:`1px solid ${p.on?'oklch(0.78 0.15 160 / .4)':'var(--line-2)'}`,position:'relative',cursor:'pointer'}}>
                    <div style={{position:'absolute',top:1,left:p.on?15:1,width:16,height:16,borderRadius:99,background:p.on?'var(--accent)':'var(--muted)',transition:'left .2s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </AccountSection>

          <AccountSection title="Danger zone" subtitle="These actions are permanent" danger>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <DangerRow t="Export your data" s="Download every piece of metadata we hold about you. Usually under 10 KB." btn="Export"/>
              <DangerRow t="Delete all sessions" s="Terminates every active session on every device and forces re-auth." btn="Delete sessions"/>
              <DangerRow t="Delete account" s="Removes your root identity record. Your device-local keys keep working but will no longer resolve via the mesh." btn="Delete account" red/>
            </div>
          </AccountSection>
        </div>

        {/* Right rail */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card" style={{padding:24,textAlign:'center'}}>
            <div style={{width:80,height:80,borderRadius:99,background:'linear-gradient(135deg, oklch(0.78 0.15 160 / .2), oklch(0.78 0.14 215 / .2))',border:'1px solid var(--line-2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:28,color:'var(--fg)',fontWeight:500,letterSpacing:'-0.02em'}}>YS</div>
            <div style={{fontSize:15,color:'var(--fg)',fontWeight:500}}>Yusuf Sait</div>
            <div className="mono" style={{fontSize:11,color:'var(--muted)',marginTop:4}}>@yusufsait</div>
            <div style={{marginTop:14,padding:'8px 12px',borderRadius:8,background:'oklch(0.78 0.15 160 / .06)',border:'1px solid oklch(0.78 0.15 160 / .2)',fontSize:11.5,color:'var(--accent)'}}>Personal plan · free</div>
            <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginTop:12,padding:'8px 12px'}}>Upgrade to Pro</button>
          </div>

          <div className="card" style={{padding:18}}>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:500,marginBottom:12}}>Usage this month</div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[
                {l:'Devices',v:4,max:5,unit:''},
                {l:'Transfers',v:127,max:'∞',unit:''},
                {l:'Moved',v:46.8,max:'∞',unit:'GB'},
              ].map((u,i)=>(
                <div key={i}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
                    <span style={{color:'var(--fg-2)'}}>{u.l}</span>
                    <span className="mono" style={{color:'var(--fg)'}}>{u.v}{u.unit} <span style={{color:'var(--muted-2)'}}>/ {u.max}{u.unit}</span></span>
                  </div>
                  <div style={{height:3,borderRadius:99,background:'var(--line)',overflow:'hidden'}}>
                    <div style={{width:typeof u.max==='number'?`${(u.v/u.max)*100}%`:'18%',height:'100%',background:'var(--accent)'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-flat" style={{padding:18}}>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:500,marginBottom:10}}>Quick links</div>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              {['Security audit','Download recovery phrase','API tokens','Webhooks','Support'].map(l=>(
                <div key={l} style={{padding:'8px 10px',borderRadius:7,fontSize:12.5,color:'var(--fg-2)',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                  <span>{l}</span>
                  <Icon name="arrow_right" size={11} style={{color:'var(--muted-2)'}}/>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function AccountSection({title, subtitle, children, danger}){
  return (
    <div className="card" style={{padding:24,...(danger?{borderColor:'oklch(0.72 0.17 25 / .2)'}:{})}}>
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:15,color:danger?'var(--red)':'var(--fg)',fontWeight:500,letterSpacing:'-0.005em'}}>{title}</span>
        </div>
        {subtitle && <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function AccountField({label, value, badge, readOnly}){
  return (
    <div>
      <label style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:500,display:'flex',justifyContent:'space-between',marginBottom:7}}>
        <span>{label}</span>
        {badge && <span className="chip chip-emerald">{badge}</span>}
      </label>
      <div className="input-wrap" style={{padding:'10px 12px',background:readOnly?'oklch(1 0 0 / .01)':undefined,opacity:readOnly?0.75:1}}>
        <span style={{fontSize:13,color:'var(--fg)'}}>{value}</span>
      </div>
    </div>
  );
}

function DangerRow({t,s,btn,red}){
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderRadius:10,border:`1px solid ${red?'oklch(0.72 0.17 25 / .2)':'var(--line)'}`,background:red?'oklch(0.72 0.17 25 / .03)':'oklch(1 0 0 / .01)'}}>
      <div style={{flex:1,marginRight:14}}>
        <div style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{t}</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:3,lineHeight:1.45}}>{s}</div>
      </div>
      <button className="btn btn-ghost" style={{padding:'7px 14px',fontSize:12,color:red?'var(--red)':'var(--fg-2)',borderColor:red?'oklch(0.72 0.17 25 / .25)':'var(--line-2)'}}>{btn}</button>
    </div>
  );
}

// ---- 404
function NotFound(){
  return (
    <div className="vt grid-bg" style={{width:1440,height:780,margin:'0 auto',borderRadius:16,border:'1px solid var(--line)',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
      <div style={{position:'absolute',top:28,left:36}}><Logo size="lg"/></div>
      <div style={{position:'relative',textAlign:'center',maxWidth:520,padding:'0 32px'}}>
        <div style={{position:'relative',display:'inline-block',marginBottom:36}}>
          <div className="mono" style={{fontSize:180,fontWeight:400,letterSpacing:'-0.08em',lineHeight:0.9,color:'var(--fg)',opacity:0.95,background:'linear-gradient(180deg, var(--fg) 0%, var(--muted-2) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>404</div>
          <div style={{position:'absolute',inset:-20,background:'radial-gradient(ellipse at center, oklch(0.78 0.15 160 / .08), transparent 60%)',pointerEvents:'none',zIndex:-1}}/>
        </div>
        <h1 style={{fontSize:32,fontWeight:500,letterSpacing:'-0.02em',margin:0,lineHeight:1.1}}>
          This path doesn't <span className="serif" style={{color:'var(--accent)'}}>route.</span>
        </h1>
        <p style={{fontSize:14,color:'var(--fg-2)',marginTop:14,lineHeight:1.55}}>The page you asked for isn't in the mesh. It may have been moved, or the link was mangled somewhere between you and us.</p>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:28}}>
          <button className="btn btn-primary"><Icon name="arrow_right" size={14} style={{transform:'rotate(180deg)'}}/>Back to dashboard</button>
          <button className="btn btn-ghost">Contact support</button>
        </div>
        <div className="mono" style={{fontSize:11,color:'var(--muted-2)',marginTop:40,letterSpacing:'.05em'}}>
          trace-id: <span style={{color:'var(--fg-2)'}}>req_f4a1c27_9e3d</span>  ·  path: <span style={{color:'var(--fg-2)'}}>/devices/revoked/old-laptop</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {Devices, Sessions, Transfers, Account, NotFound});
