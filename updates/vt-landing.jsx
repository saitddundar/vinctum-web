// Landing page: narrative hero → live mesh viz → problem/solution → protocol → threat model → pricing → CTA → footer
const C = React;

function Landing(){
  return (
    <div className="vt" style={{width:1280,minHeight:4800,margin:'0 auto',position:'relative',overflow:'hidden',borderRadius:16,border:'1px solid var(--line)'}}>
      <PublicHeader current="home"/>
      <Hero/>
      <Narrative/>
      <LiveMeshSection/>
      <ProtocolDeepDive/>
      <ThreatModel/>
      <FeatureMatrix/>
      <UseCases/>
      <ByTheNumbers/>
      <Pricing/>
      <ClosingCTA/>
      <Footer/>
    </div>
  );
}

function Hero(){
  return (
    <section className="mesh-bg grid-bg" style={{position:'relative',padding:'120px 40px 100px',overflow:'hidden'}}>
      <div style={{maxWidth:1120,margin:'0 auto',position:'relative',zIndex:2}}>
        <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,padding:'5px 12px 5px 6px',borderRadius:99,background:'oklch(1 0 0 / .03)',border:'1px solid var(--line-2)',fontSize:11.5,color:'var(--fg-2)',marginBottom:32}}>
              <span className="pill pill-ok" style={{padding:'1px 7px',fontSize:9}}>NEW</span>
              <span>v2.1 · Post-quantum key exchange (Kyber-768) in beta</span>
              <Icon name="arrow_right" size={12} style={{color:'var(--muted)'}}/>
            </div>
            <h1 style={{fontSize:72,fontWeight:600,letterSpacing:'-0.04em',lineHeight:0.98,margin:0,color:'var(--fg)'}}>
              Your files<br/>move <span className="serif" style={{color:'var(--accent)',fontWeight:400,fontSize:76}}>between you</span>.<br/>
              <span style={{color:'var(--muted-2)'}}>Nothing else.</span>
            </h1>
            <p style={{fontSize:17,lineHeight:1.55,color:'var(--fg-2)',maxWidth:500,marginTop:28,fontWeight:400}}>
              Vinctum is a zero-knowledge mesh for your devices. Files travel directly, end-to-end encrypted, with no cloud intermediary ever touching plaintext. Built on WireGuard, libp2p, and X25519.
            </p>
            <div style={{display:'flex',gap:10,marginTop:36}}>
              <button className="btn btn-primary" style={{padding:'12px 20px',fontSize:14}}>
                Start free — no card
                <Icon name="arrow_right" size={14}/>
              </button>
              <button className="btn btn-ghost" style={{padding:'12px 20px',fontSize:14}}>
                <Icon name="code" size={14}/>
                Self-host
              </button>
            </div>
            <div style={{display:'flex',gap:32,marginTop:40,paddingTop:28,borderTop:'1px solid var(--line)'}}>
              <TrustMini label="Source auditable" value="MIT"/>
              <TrustMini label="Stored on our servers" value="0 B"/>
              <TrustMini label="Key exchange" value="X25519"/>
              <TrustMini label="Cipher" value="AES-256-GCM"/>
            </div>
          </div>
          <HeroVisual/>
        </div>
      </div>
    </section>
  );
}

function TrustMini({label, value}){
  return (
    <div>
      <div className="mono" style={{fontSize:18,fontWeight:500,letterSpacing:'-0.02em',color:'var(--fg)'}}>{value}</div>
      <div style={{fontSize:11,color:'var(--muted-2)',marginTop:3,letterSpacing:'.01em'}}>{label}</div>
    </div>
  );
}

function HeroVisual(){
  // Stylized live mesh card
  return (
    <div className="card" style={{padding:20,position:'relative',boxShadow:'0 40px 80px rgba(0,0,0,.4), 0 0 0 1px oklch(1 0 0 / .04) inset'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="live"/>
          <span style={{fontSize:11,color:'var(--fg-2)',letterSpacing:'.01em'}}>mesh.sait.vinctum</span>
        </div>
        <span className="mono" style={{fontSize:10,color:'var(--muted-2)'}}>247ms · p95</span>
      </div>
      <div style={{position:'relative',height:320,background:'oklch(0.18 0.014 235 / .5)',borderRadius:10,border:'1px solid var(--line)',overflow:'hidden'}}>
        <svg width="100%" height="100%" viewBox="0 0 480 320" style={{position:'absolute',inset:0}}>
          <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="oklch(0.78 0.15 160)" stopOpacity="0"/>
            </radialGradient>
            <filter id="softGlow"><feGaussianBlur stdDeviation="3"/></filter>
          </defs>
          {/* connection lines */}
          {[
            ['M240,160 L120,80', 'a'],
            ['M240,160 L380,90', 'b'],
            ['M240,160 L100,230', 'c'],
            ['M240,160 L360,240', 'd'],
            ['M120,80 L380,90', 'e'],
            ['M100,230 L360,240', 'f'],
          ].map(([d, id], i) => (
            <g key={id}>
              <path id={`hp-${id}`} d={d} className="flow-line"/>
              <circle r="2" fill="var(--accent)" opacity="0.9">
                <animateMotion dur={`${2.5 + i*0.3}s`} repeatCount="indefinite" begin={`${i*0.4}s`}><mpath href={`#hp-${id}`}/></animateMotion>
              </circle>
            </g>
          ))}
          {/* nodes */}
          {[
            {x:240,y:160,r:32,label:'MacBook Pro',sub:'sender',me:true},
            {x:120,y:80,r:24,label:'iPhone 15',sub:'online'},
            {x:380,y:90,r:24,label:'Linux Desktop',sub:'online'},
            {x:100,y:230,r:22,label:'iPad',sub:'online'},
            {x:360,y:240,r:22,label:'Synology NAS',sub:'relaying'},
          ].map((n,i) => (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={n.r+12} fill="url(#nodeGlow)"/>
              <circle cx={n.x} cy={n.y} r={n.r} className={`node-ring ${n.me?'active':''}`} fill={n.me?'oklch(0.22 0.014 235)':'oklch(0.2 0.014 235)'}/>
              {n.me && <circle cx={n.x} cy={n.y} r={n.r+2} fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeDasharray="3 4"><animateTransform attributeName="transform" type="rotate" from={`0 ${n.x} ${n.y}`} to={`360 ${n.x} ${n.y}`} dur="12s" repeatCount="indefinite"/></circle>}
              <text x={n.x} y={n.y+4} textAnchor="middle" fill="var(--fg)" fontSize="10" fontFamily="JetBrains Mono">{n.label.split(' ')[0].slice(0,3).toLowerCase()}</text>
              <text x={n.x} y={n.y+n.r+16} textAnchor="middle" fill="var(--fg-2)" fontSize="10" fontFamily="Inter">{n.label}</text>
              <text x={n.x} y={n.y+n.r+28} textAnchor="middle" fill="var(--muted-2)" fontSize="9" fontFamily="JetBrains Mono">{n.sub}</text>
            </g>
          ))}
        </svg>
        <div style={{position:'absolute',top:12,right:12,padding:'5px 9px',background:'oklch(0.15 0.012 235 / .85)',borderRadius:6,border:'1px solid var(--line)',fontSize:10,color:'var(--fg-2)',fontFamily:'JetBrains Mono'}}>
          <span style={{color:'var(--accent)'}}>●</span> 5 peers · 3 sessions
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:1,marginTop:12,background:'var(--line)',borderRadius:8,overflow:'hidden'}}>
        {[['UP','48.2 MB/s','var(--accent)'],['DOWN','12.8 MB/s','var(--cyan)'],['ENCRYPT','AES-GCM','var(--violet)']].map(([k,v,c],i)=>(
          <div key={i} style={{padding:'10px 12px',background:'var(--panel)'}}>
            <div style={{fontSize:9,color:'var(--muted-2)',letterSpacing:'.08em',textTransform:'uppercase'}}>{k}</div>
            <div className="mono" style={{fontSize:13,color:c,marginTop:2,fontWeight:500}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Narrative(){
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:80}}>
          <div>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--accent)',marginBottom:14}}>The problem</div>
            <h2 style={{fontSize:36,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.1,margin:0}}>
              Every file<br/>you sent today<br/><span className="serif" style={{color:'var(--fg-2)'}}>left a copy</span><br/>somewhere else.
            </h2>
          </div>
          <div style={{paddingTop:8}}>
            <p style={{fontSize:18,lineHeight:1.6,color:'var(--fg-2)',margin:0,fontWeight:400,maxWidth:640}}>
              Dropbox, iCloud, WeTransfer — they all work the same way. Your file gets uploaded to a machine you don't own, sits there in plaintext or with a key the provider holds, then gets downloaded again on the other side. Your devices are <em style={{color:'var(--fg)',fontStyle:'normal',borderBottom:'1px dashed var(--accent)'}}>one meter apart</em>, and the bytes still travel thousands of kilometers.
            </p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:48}}>
              <StatTile n="4.2B" label="files uploaded daily to consumer cloud" tone="amber"/>
              <StatTile n="82%" label="of those could be direct transfers" tone="cyan"/>
              <StatTile n="$0.023" label="average cost per GB, to you" tone="violet"/>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatTile({n, label, tone}){
  const c = tone==='amber'?'var(--amber)':tone==='cyan'?'var(--cyan)':'var(--violet)';
  return (
    <div className="card-flat" style={{padding:'22px 20px',borderRadius:12}}>
      <div className="mono" style={{fontSize:30,fontWeight:500,letterSpacing:'-0.02em',color:c}}>{n}</div>
      <div style={{fontSize:12.5,color:'var(--fg-2)',marginTop:8,lineHeight:1.45}}>{label}</div>
    </div>
  );
}

function LiveMeshSection(){
  return (
    <section style={{padding:'100px 40px',borderTop:'1px solid var(--line)',background:'oklch(0.14 0.012 235)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--accent)',marginBottom:14}}>How it works</div>
          <h2 style={{fontSize:44,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.05,margin:0,maxWidth:720,marginInline:'auto'}}>
            Three devices. One mesh. <span className="serif" style={{color:'var(--fg-2)'}}>Zero intermediaries.</span>
          </h2>
          <p style={{fontSize:15,color:'var(--muted)',marginTop:16,maxWidth:580,marginInline:'auto',lineHeight:1.55}}>
            When you pair a device, it joins a private libp2p overlay only you control. Transfers use NAT hole-punching to establish a direct path. If that fails, another one of your own devices relays — never ours.
          </p>
        </div>

        <div className="card" style={{padding:32,position:'relative',overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:0,alignItems:'stretch'}}>
            {[
              {n:'01', title:'Authenticate', desc:'Ed25519 identity, stored in Secure Enclave / TPM. No password reaches disk.', icon:'user'},
              {n:'02', title:'Pair', desc:'6-digit ephemeral code binds public keys. Exchange is QR or out-of-band.', icon:'qr'},
              {n:'03', title:'Transfer', desc:'X25519 ECDH session key per file. AES-256-GCM, 256KB chunks, SHA-256 tree.', icon:'send'},
              {n:'04', title:'Verify', desc:'Merkle root signed by sender. Receiver validates before decrypting.', icon:'check'},
            ].map((s,i) => (
              <div key={s.n} style={{padding:'0 24px',borderLeft:i>0?'1px solid var(--line)':'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name={s.icon} size={17}/>
                  </div>
                  <span className="mono" style={{fontSize:11,color:'var(--muted-2)'}}>{s.n}</span>
                </div>
                <div style={{fontSize:17,fontWeight:500,letterSpacing:'-0.01em',color:'var(--fg)'}}>{s.title}</div>
                <p style={{fontSize:13,color:'var(--fg-2)',marginTop:8,lineHeight:1.55}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProtocolDeepDive(){
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:80,alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--cyan)',marginBottom:14}}>Protocol</div>
            <h2 style={{fontSize:40,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.08,margin:0}}>
              The cryptography<br/>is boring. <span className="serif" style={{color:'var(--fg-2)'}}>That's the point.</span>
            </h2>
            <p style={{fontSize:15,color:'var(--fg-2)',marginTop:22,lineHeight:1.6,maxWidth:460}}>
              We don't roll our own crypto. The Vinctum protocol is a thin integration of battle-tested primitives — the same ones your bank, your messenger, and WireGuard use every day.
            </p>
            <div style={{marginTop:32,display:'flex',flexDirection:'column',gap:14}}>
              {[
                ['Identity', 'Ed25519 keypair per device, bound to a user Ed25519 root'],
                ['Session', 'X25519 ECDH with ephemeral sender keys (forward secrecy)'],
                ['Cipher', 'AES-256-GCM with per-chunk nonces, 256 KB chunk size'],
                ['Integrity', 'Merkle tree over ciphertext chunks, signed root'],
                ['Transport', 'QUIC over UDP, libp2p hole-punch, fallback via your own relay'],
              ].map(([k,v], i) => (
                <div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:16,paddingBottom:12,borderBottom:i<4?'1px solid var(--line)':'none'}}>
                  <div className="mono" style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>{k}</div>
                  <div style={{fontSize:13.5,color:'var(--fg-2)',lineHeight:1.5}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <ProtocolDiagram/>
        </div>
      </div>
    </section>
  );
}

function ProtocolDiagram(){
  return (
    <div className="card" style={{padding:4,overflow:'hidden'}}>
      <div style={{background:'oklch(0.12 0.012 235)',borderRadius:10,padding:'14px 18px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',gap:6}}>
          <span style={{width:10,height:10,borderRadius:99,background:'oklch(0.72 0.17 25 / .4)'}}/>
          <span style={{width:10,height:10,borderRadius:99,background:'oklch(0.84 0.13 85 / .4)'}}/>
          <span style={{width:10,height:10,borderRadius:99,background:'oklch(0.78 0.15 160 / .5)'}}/>
        </div>
        <span className="mono" style={{fontSize:11,color:'var(--muted)'}}>vinctum.protocol.handshake.log</span>
        <span className="chip chip-emerald" style={{marginLeft:'auto'}}>verified</span>
      </div>
      <pre className="mono" style={{margin:0,padding:'20px 22px',fontSize:12,lineHeight:1.65,color:'var(--fg-2)',background:'oklch(0.13 0.012 235)',overflow:'auto'}}>
<span style={{color:'var(--muted-2)'}}>{'// device A → device B'}</span>{'\n'}
<span style={{color:'var(--cyan)'}}>→ HELLO</span>  {"{"} node_id: <span style={{color:'var(--accent)'}}>"8f3a…c4b1"</span>, vsn: <span style={{color:'var(--amber)'}}>2.1</span> {"}"}{'\n'}
<span style={{color:'var(--cyan)'}}>← HELLO</span>  {"{"} node_id: <span style={{color:'var(--accent)'}}>"a12e…9f34"</span>, vsn: <span style={{color:'var(--amber)'}}>2.1</span> {"}"}{'\n\n'}
<span style={{color:'var(--muted-2)'}}>{'// ephemeral X25519'}</span>{'\n'}
<span style={{color:'var(--cyan)'}}>→ EPUB</span>   <span style={{color:'var(--fg)'}}>0x{'a7f2e1b9c4d8…0f3e'}</span>{'\n'}
<span style={{color:'var(--cyan)'}}>← EPUB</span>   <span style={{color:'var(--fg)'}}>0x{'3c4b8f91a2d5…7e1c'}</span>{'\n\n'}
<span style={{color:'var(--muted-2)'}}>{'// HKDF(SHA-256, shared, "vt:xfer:<tid>")'}</span>{'\n'}
<span style={{color:'var(--accent)'}}>SESSION</span> key derived · <span style={{color:'var(--muted)'}}>forward-secret</span>{'\n\n'}
<span style={{color:'var(--muted-2)'}}>{'// chunk transfer'}</span>{'\n'}
<span style={{color:'var(--cyan)'}}>→ CHUNK</span>  <span style={{color:'var(--fg)'}}>#0001</span>/<span style={{color:'var(--fg)'}}>0384</span>  <span style={{color:'var(--muted)'}}>256 KB</span>  <span style={{color:'var(--accent)'}}>AES-GCM</span>{'\n'}
<span style={{color:'var(--cyan)'}}>→ CHUNK</span>  <span style={{color:'var(--fg)'}}>#0002</span>/<span style={{color:'var(--fg)'}}>0384</span>  <span style={{color:'var(--muted)'}}>256 KB</span>  <span style={{color:'var(--accent)'}}>AES-GCM</span>{'\n'}
  <span style={{color:'var(--muted-2)'}}>…</span>{'\n'}
<span style={{color:'var(--cyan)'}}>← MROOT</span>  <span style={{color:'var(--fg)'}}>0xf4a1…9c27</span> <span style={{color:'var(--accent)'}}>✓ Ed25519</span>{'\n'}
<span style={{color:'var(--accent)'}}>COMPLETE</span> · 98.0 MB in 2.1s · <span style={{color:'var(--muted)'}}>direct path</span>
      </pre>
    </div>
  );
}

function ThreatModel(){
  const rows = [
    {k:'Network observer (ISP, café wifi)', v1:'Sees ciphertext only', v2:'Full plaintext on backbone', t1:'ok', t2:'bad'},
    {k:'Vinctum servers', v1:'Cannot decrypt — no keys', v2:'Have all keys', t1:'ok', t2:'bad'},
    {k:'Compromised relay node', v1:'Sees encrypted chunks', v2:'Is the provider', t1:'ok', t2:'bad'},
    {k:'Lost device', v1:'Revoke on dashboard, keys rotate', v2:'Session cookie valid for weeks', t1:'ok', t2:'warn'},
    {k:'Post-quantum adversary', v1:'Kyber-768 hybrid (beta)', v2:'Classical RSA/ECDH only', t1:'warn', t2:'bad'},
    {k:'Legal subpoena', v1:'Nothing to hand over', v2:'Full historical files', t1:'ok', t2:'bad'},
  ];
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)',background:'oklch(0.14 0.012 235)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--violet)',marginBottom:14}}>Threat model</div>
        <h2 style={{fontSize:40,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.08,margin:0,maxWidth:720}}>
          What an attacker<br/>can and can't <span className="serif" style={{color:'var(--fg-2)'}}>see.</span>
        </h2>
        <div className="card" style={{marginTop:48,padding:0,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',padding:'14px 24px',borderBottom:'1px solid var(--line)',background:'oklch(1 0 0 / .02)'}}>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>Scenario</div>
            <div style={{fontSize:11,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>Vinctum</div>
            <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:600}}>Typical cloud</div>
          </div>
          {rows.map((r,i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',padding:'18px 24px',borderBottom:i<rows.length-1?'1px solid var(--line)':'none',alignItems:'center',gap:16}}>
              <div style={{fontSize:14,color:'var(--fg)',letterSpacing:'-0.005em'}}>{r.k}</div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className={`pill pill-${r.t1==='ok'?'ok':r.t1==='warn'?'warn':'bad'}`}>{r.t1==='ok'?'safe':r.t1==='warn'?'mitigated':'exposed'}</span>
                <span style={{fontSize:13,color:'var(--fg-2)'}}>{r.v1}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className={`pill pill-${r.t2==='ok'?'ok':r.t2==='warn'?'warn':'bad'}`}>{r.t2==='ok'?'safe':r.t2==='warn'?'mitigated':'exposed'}</span>
                <span style={{fontSize:13,color:'var(--muted)'}}>{r.v2}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureMatrix(){
  const items = [
    {icon:'shield', title:'End-to-end encrypted', desc:'Keys never leave your devices. Not even temporarily, not even for indexing. We built the backend to refuse plaintext.'},
    {icon:'network', title:'Multi-device mesh', desc:'Pair phone + laptop + NAS + desktop. Files route through the shortest path your hardware can reach.'},
    {icon:'server', title:'Self-host ready', desc:'Run vinctum-core on your own box. Same binary, same protocol, full control. Go 1.22, single binary.'},
    {icon:'bolt', title:'Direct paths', desc:'libp2p NAT hole-punch succeeds in 87% of homes we tested. When it doesn\'t, one of your devices relays.'},
    {icon:'cpu', title:'Ed25519 hardware keys', desc:'Keys are generated in Secure Enclave on Apple Silicon, StrongBox on Android, TPM on Windows/Linux.'},
    {icon:'sliders', title:'ML-tuned routing', desc:'Nodes score each other on latency, reliability, and uptime. Bad routes get pruned automatically.'},
  ];
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:48,gap:40}}>
          <div>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--accent)',marginBottom:14}}>Capabilities</div>
            <h2 style={{fontSize:40,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.08,margin:0,maxWidth:640}}>
              Built like infrastructure.<br/><span className="serif" style={{color:'var(--fg-2)'}}>Used like a drop-box.</span>
            </h2>
          </div>
          <button className="btn btn-ghost">View full spec <Icon name="arrow_right" size={13}/></button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:1,background:'var(--line)',borderRadius:14,overflow:'hidden',border:'1px solid var(--line)'}}>
          {items.map((it,i) => (
            <div key={i} style={{background:'var(--bg)',padding:'32px 28px'}}>
              <div style={{width:40,height:40,borderRadius:10,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}}>
                <Icon name={it.icon} size={18}/>
              </div>
              <div style={{fontSize:16,fontWeight:500,letterSpacing:'-0.01em'}}>{it.title}</div>
              <p style={{fontSize:13.5,color:'var(--fg-2)',marginTop:10,lineHeight:1.6}}>{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCases(){
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--cyan)',marginBottom:14}}>Who uses it</div>
        <h2 style={{fontSize:40,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.08,margin:0,marginBottom:48,maxWidth:720}}>
          Four people, four setups, <span className="serif" style={{color:'var(--fg-2)'}}>same mesh.</span>
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {[
            {name:'Photographers', sub:'60–120 GB RAW drops', desc:'Export from Lightroom on desktop → land on iPad for client review. No upload queue, no "sharing link expired".', tone:'amber', size:'116 GB', devices:4},
            {name:'Developers', sub:'CI artifacts & builds', desc:'Pull last night\'s build from the office Linux box to your laptop on the train. 1.8 GB in 24s over LTE.', tone:'cyan', size:'1.8 GB', devices:3},
            {name:'Journalists', sub:'Sensitive source material', desc:'Receive files from sources on a locked-down phone. Root key never touches the laptop you travel with.', tone:'violet', size:'—', devices:2},
            {name:'Families', sub:'Video, photos, memories', desc:'Grandma\'s iPad, dad\'s phone, the shared Mac mini. Everyone\'s devices, one private ring.', tone:'emerald', size:'83 GB', devices:6},
          ].map((u,i) => (
            <div key={i} className="card" style={{padding:28,display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                <div>
                  <div style={{fontSize:19,fontWeight:500,letterSpacing:'-0.015em'}}>{u.name}</div>
                  <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{u.sub}</div>
                </div>
                <div style={{display:'flex',gap:14}}>
                  <div style={{textAlign:'right'}}>
                    <div className="mono" style={{fontSize:13,color:'var(--fg)'}}>{u.size}</div>
                    <div style={{fontSize:9,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.06em'}}>moved/mo</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="mono" style={{fontSize:13,color:'var(--fg)'}}>{u.devices}</div>
                    <div style={{fontSize:9,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.06em'}}>devices</div>
                  </div>
                </div>
              </div>
              <p style={{fontSize:13.5,color:'var(--fg-2)',lineHeight:1.55,margin:0}}>{u.desc}</p>
              <div style={{height:1,background:'var(--line)'}}/>
              <Placeholder label={`photo — ${u.name.toLowerCase()} setup`} aspect="5/2" subtle/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ByTheNumbers(){
  return (
    <section style={{padding:'100px 40px',borderTop:'1px solid var(--line)',background:'oklch(0.14 0.012 235)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:0,borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}}>
          {[
            ['47 TB', 'moved through the mesh this week'],
            ['12.4k', 'active devices paired'],
            ['87%', 'connections that succeed direct'],
            ['0', 'bytes of user data on our servers'],
          ].map(([n,l],i) => (
            <div key={i} style={{padding:'40px 28px',borderRight:i<3?'1px solid var(--line)':'none'}}>
              <div className="mono" style={{fontSize:40,fontWeight:500,letterSpacing:'-0.03em',color:'var(--fg)'}}>{n}</div>
              <div style={{fontSize:12.5,color:'var(--muted)',marginTop:8,lineHeight:1.45}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing(){
  const tiers = [
    {name:'Personal', price:'Free', sub:'forever', features:['Up to 5 devices','Unlimited transfer size','Community support','Self-host optional'], cta:'Start free'},
    {name:'Pro', price:'$6', sub:'per month', features:['Unlimited devices','Priority relay pool','Multi-user family sharing','Mobile backup','Email support'], cta:'Try Pro', highlight:true},
    {name:'Team', price:'$12', sub:'per user / mo', features:['SSO / SCIM','Audit logs','Policy controls','SLA & security review','Dedicated relay region'], cta:'Contact sales'},
  ];
  return (
    <section style={{padding:'120px 40px',borderTop:'1px solid var(--line)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.12em',color:'var(--accent)',marginBottom:14}}>Pricing</div>
          <h2 style={{fontSize:40,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.05,margin:0}}>
            Simple. <span className="serif" style={{color:'var(--fg-2)'}}>Honest.</span>
          </h2>
          <p style={{fontSize:14,color:'var(--muted)',marginTop:14}}>We don't meter bandwidth — you're not using ours.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20}}>
          {tiers.map(t => (
            <div key={t.name} className={t.highlight?'card':'card-flat'} style={{padding:32,display:'flex',flexDirection:'column',gap:18,position:'relative',...(t.highlight?{boxShadow:'0 0 0 1px oklch(0.78 0.15 160 / .3), 0 20px 60px rgba(0,0,0,.3)',border:'1px solid oklch(0.78 0.15 160 / .3)'}:{})}}>
              {t.highlight && <span className="chip chip-emerald" style={{position:'absolute',top:-10,left:24}}>most popular</span>}
              <div>
                <div style={{fontSize:14,color:'var(--fg-2)',fontWeight:500}}>{t.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:10}}>
                  <span style={{fontSize:36,fontWeight:500,letterSpacing:'-0.02em'}}>{t.price}</span>
                  <span style={{fontSize:12,color:'var(--muted)'}}>{t.sub}</span>
                </div>
              </div>
              <div style={{height:1,background:'var(--line)'}}/>
              <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:10}}>
                {t.features.map(f => (
                  <li key={f} style={{display:'flex',alignItems:'center',gap:9,fontSize:13,color:'var(--fg-2)'}}>
                    <Icon name="check" size={13} style={{color:'var(--accent)'}}/>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={t.highlight?'btn btn-primary':'btn btn-ghost'} style={{justifyContent:'center',marginTop:'auto'}}>{t.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA(){
  return (
    <section className="grid-bg" style={{padding:'120px 40px',borderTop:'1px solid var(--line)',textAlign:'center',position:'relative'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 50% 60% at 50% 40%, oklch(0.78 0.15 160 / .08), transparent 70%)',pointerEvents:'none'}}/>
      <div style={{maxWidth:720,margin:'0 auto',position:'relative'}}>
        <h2 style={{fontSize:60,fontWeight:500,letterSpacing:'-0.04em',lineHeight:0.98,margin:0}}>
          Your devices<br/><span className="serif" style={{color:'var(--accent)',fontSize:64,fontWeight:400}}>deserve</span> to talk<br/>to each other.
        </h2>
        <p style={{fontSize:16,color:'var(--fg-2)',marginTop:28,lineHeight:1.55}}>No cloud. No middleman. No subscription for the bytes you already own.</p>
        <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:36}}>
          <button className="btn btn-primary" style={{padding:'14px 24px',fontSize:14}}>Create free account <Icon name="arrow_right" size={14}/></button>
          <button className="btn btn-ghost" style={{padding:'14px 24px',fontSize:14}}>Read the whitepaper</button>
        </div>
      </div>
    </section>
  );
}

function Footer(){
  const cols = [
    {title:'Product', links:['Features','Protocol','Security','Changelog','Roadmap']},
    {title:'Developers', links:['Docs','API','CLI','Self-host','GitHub']},
    {title:'Company', links:['About','Blog','Careers','Press kit','Contact']},
    {title:'Legal', links:['Privacy','Terms','DPA','Security.txt']},
  ];
  return (
    <footer style={{borderTop:'1px solid var(--line)',padding:'60px 40px 32px',background:'oklch(0.13 0.012 235)'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.4fr repeat(4, 1fr)',gap:40,paddingBottom:40,borderBottom:'1px solid var(--line)'}}>
          <div>
            <Logo size="lg"/>
            <p style={{fontSize:13,color:'var(--muted)',marginTop:14,lineHeight:1.6,maxWidth:260}}>Zero-knowledge file transfer between your own devices. Built in Istanbul.</p>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              {['github','x','mail'].map(k => <div key={k} style={{width:32,height:32,borderRadius:8,border:'1px solid var(--line-2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}><Icon name={k==='mail'?'mail':'code'} size={13}/></div>)}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <div style={{fontSize:11,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.12em',fontWeight:600,marginBottom:14}}>{c.title}</div>
              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                {c.links.map(l => <span key={l} style={{fontSize:13,color:'var(--fg-2)',cursor:'pointer'}}>{l}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:24,fontSize:12,color:'var(--muted-2)'}}>
          <span>© 2026 Vinctum Labs · <span style={{color:'var(--accent)'}}>●</span> All systems operational</span>
          <span className="mono">build 2.1.3 · f4a1c27</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, {Landing});
