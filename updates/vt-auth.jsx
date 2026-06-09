// Auth pages: Login, Register, Forgot, Reset, CheckEmail, VerifyEmail
// Shared two-column shell: form left, poetic/identity side right.

function AuthShell({title, sub, children, side, footer, step}){
  return (
    <div className="vt" style={{width:1280,height:820,margin:'0 auto',borderRadius:16,border:'1px solid var(--line)',overflow:'hidden',display:'grid',gridTemplateColumns:'1fr 1.1fr'}}>
      {/* Form side */}
      <div style={{padding:'48px 56px',display:'flex',flexDirection:'column',background:'var(--bg)',position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Logo size="lg"/>
          <div style={{fontSize:12,color:'var(--muted)'}}>{step}</div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',maxWidth:420,width:'100%',margin:'0 auto'}}>
          <div style={{marginBottom:36}}>
            <h1 style={{fontSize:34,fontWeight:500,letterSpacing:'-0.025em',lineHeight:1.1,margin:0,color:'var(--fg)'}}>{title}</h1>
            {sub && <p style={{fontSize:14.5,color:'var(--fg-2)',marginTop:12,lineHeight:1.55}}>{sub}</p>}
          </div>
          {children}
        </div>
        {footer}
      </div>
      {/* Side art */}
      <div style={{background:'oklch(0.14 0.012 235)',borderLeft:'1px solid var(--line)',position:'relative',overflow:'hidden'}} className="grid-bg">
        {side}
      </div>
    </div>
  );
}

function Field({label, type='text', value, hint, error, right, autofocus}){
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
        <label style={{fontSize:12,color:'var(--fg-2)',fontWeight:500}}>{label}</label>
        {right}
      </div>
      <div className={`input-wrap ${autofocus?'input-focus':''} ${error?'input-error':''}`}>
        <input type={type} defaultValue={value} className="input"/>
      </div>
      {hint && !error && <div style={{fontSize:11,color:'var(--muted-2)',marginTop:6}}>{hint}</div>}
      {error && <div style={{fontSize:11,color:'var(--red)',marginTop:6,display:'flex',gap:6,alignItems:'center'}}><Icon name="warn" size={11}/> {error}</div>}
    </div>
  );
}

function SideQuote({quote, caption, visual}){
  return (
    <div style={{position:'absolute',inset:0,padding:56,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
      <div>{visual}</div>
      <div>
        <div style={{fontSize:26,lineHeight:1.3,letterSpacing:'-0.02em',color:'var(--fg)',fontWeight:400,maxWidth:460}}>
          <span className="serif" style={{color:'var(--accent)'}}>"</span>{quote}<span className="serif" style={{color:'var(--accent)'}}>"</span>
        </div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:18,letterSpacing:'.02em'}}>{caption}</div>
      </div>
    </div>
  );
}

// --- LOGIN
function VLogin(){
  return (
    <AuthShell
      title={<>Welcome back to <span className="serif" style={{color:'var(--accent)'}}>the mesh.</span></>}
      sub="Sign in to resume your encrypted sessions. No device code is stored server-side — we won't see anything you do next."
      step="Sign in"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Don't have an account? <span style={{color:'var(--accent)'}}>Create one</span></div>}
      side={<LoginArt/>}
    >
      <Field label="Email" value="yusuf@sait.dev" autofocus/>
      <Field label="Password" type="password" value="••••••••••••"
        right={<span style={{fontSize:11,color:'var(--accent)'}}>Forgot?</span>}/>
      <label style={{display:'flex',alignItems:'center',gap:9,fontSize:12.5,color:'var(--fg-2)',marginTop:4,marginBottom:24,cursor:'pointer'}}>
        <span style={{width:15,height:15,borderRadius:4,border:'1px solid var(--line-2)',background:'oklch(0.78 0.15 160 / .12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon name="check" size={10} style={{color:'var(--accent)'}}/>
        </span>
        Remember this device for 30 days
      </label>
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px 16px'}}>Sign in</button>
      <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0',color:'var(--muted-2)'}}>
        <div style={{flex:1,height:1,background:'var(--line)'}}/>
        <span style={{fontSize:11,letterSpacing:'.12em',textTransform:'uppercase'}}>Or</span>
        <div style={{flex:1,height:1,background:'var(--line)'}}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <button className="btn btn-ghost" style={{justifyContent:'center'}}><Icon name="qr" size={14}/> Scan from paired device</button>
        <button className="btn btn-ghost" style={{justifyContent:'center'}}><Icon name="code" size={14}/> Hardware key</button>
      </div>
    </AuthShell>
  );
}

function LoginArt(){
  return (
    <SideQuote
      caption="— Raphaël Zhou, photographer · using Vinctum since 2024"
      quote="I stopped uploading my wedding shoots to anything. My laptop talks to my wife's iPad directly. That's it. That's the whole product, and it's the best thing I've ever paid six dollars for."
      visual={
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card-flat" style={{padding:16,display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:38,height:38,borderRadius:10,background:'oklch(0.78 0.15 160 / .1)',border:'1px solid oklch(0.78 0.15 160 / .25)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)'}}>
              <Icon name="shield" size={16}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>Last sign-in</div>
              <div style={{fontSize:11.5,color:'var(--muted)',marginTop:2}}>2h ago · Istanbul, TR · macOS 15.2</div>
            </div>
            <span className="chip chip-emerald">verified</span>
          </div>
          <div className="card-flat" style={{padding:16}}>
            <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10}}>Paired devices</div>
            <div style={{display:'flex',gap:10}}>
              {['monitor','phone','tablet','server'].map((k,i)=>(
                <div key={i} style={{flex:1,padding:'10px 8px',borderRadius:8,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)',textAlign:'center'}}>
                  <Icon name={k} size={16} style={{color:'var(--fg-2)'}}/>
                  <div style={{fontSize:9,color:'var(--muted-2)',marginTop:4,letterSpacing:'.04em'}}>ONLINE</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mono" style={{fontSize:10,color:'var(--muted-2)',lineHeight:1.7}}>
            <div><span style={{color:'var(--accent)'}}>●</span> relay.eu-west · <span style={{color:'var(--fg-2)'}}>18ms</span></div>
            <div><span style={{color:'var(--accent)'}}>●</span> relay.eu-central · <span style={{color:'var(--fg-2)'}}>24ms</span></div>
            <div><span style={{color:'var(--muted-2)'}}>○</span> relay.us-east · <span style={{color:'var(--muted)'}}>142ms</span></div>
          </div>
        </div>
      }
    />
  );
}

// --- REGISTER
function VRegister(){
  return (
    <AuthShell
      title={<>Create your <span className="serif" style={{color:'var(--accent)'}}>root identity.</span></>}
      sub="This is the one key that binds all your devices together. It's generated on this device and never leaves it."
      step="Register · 1 of 3"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Already have an account? <span style={{color:'var(--accent)'}}>Sign in</span></div>}
      side={<RegisterArt/>}
    >
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:0}}>
        <Field label="Display name" value="Yusuf Sait"/>
        <Field label="Username" value="yusufsait" hint="Used for @mentions"/>
      </div>
      <Field label="Email" value="yusuf@sait.dev" hint="Used for recovery. Never sold, never indexed."/>
      <Field label="Password" type="password" value="••••••••••••••••"/>
      <div style={{display:'flex',gap:4,marginTop:-8,marginBottom:18}}>
        {[1,1,1,1,0].map((v,i)=>(
          <div key={i} style={{flex:1,height:3,borderRadius:99,background:v?(i<3?'var(--amber)':'var(--accent)'):'var(--line-2)'}}/>
        ))}
      </div>
      <label style={{display:'flex',alignItems:'flex-start',gap:9,fontSize:12,color:'var(--fg-2)',marginBottom:20,cursor:'pointer',lineHeight:1.5}}>
        <span style={{width:15,height:15,borderRadius:4,border:'1px solid var(--line-2)',marginTop:2,display:'flex',alignItems:'center',justifyContent:'center',background:'oklch(0.78 0.15 160 / .12)',flexShrink:0}}>
          <Icon name="check" size={10} style={{color:'var(--accent)'}}/>
        </span>
        <span>I agree to the <span style={{color:'var(--accent)'}}>Terms</span> and <span style={{color:'var(--accent)'}}>Privacy</span>, and understand that losing my root key means losing access — Vinctum cannot recover it.</span>
      </label>
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px 16px'}}>Generate identity <Icon name="arrow_right" size={14}/></button>
    </AuthShell>
  );
}

function RegisterArt(){
  return (
    <div style={{position:'absolute',inset:0,padding:48,display:'flex',flexDirection:'column'}}>
      <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:20}}>Generating root identity</div>
      <div className="card" style={{padding:24,marginBottom:22}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:12,color:'var(--fg-2)',fontWeight:500}}>Ed25519 keypair</span>
          <span className="chip chip-emerald">fresh</span>
        </div>
        <pre className="mono" style={{margin:0,fontSize:10.5,lineHeight:1.7,color:'var(--fg-2)',whiteSpace:'pre-wrap',wordBreak:'break-all'}}>
<span style={{color:'var(--muted-2)'}}>// public (shareable)</span>{'\n'}
<span style={{color:'var(--accent)'}}>pk</span> = 8f3a2c9b7d1e4a6f8c2b5d9e1a3c7f2e{'\n'}
     4b8d6a1c3e5f7d9b2a4c6e8f1d3a5c7{'\n\n'}
<span style={{color:'var(--muted-2)'}}>// private (stays on this device)</span>{'\n'}
<span style={{color:'var(--red)'}}>sk</span> = ⋯ stored in Secure Enclave ⋯
        </pre>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
        {[
          {l:'Entropy',v:'256 bits',ok:true},
          {l:'Enclave',v:'Apple T2',ok:true},
          {l:'Curve',v:'Ed25519',ok:true},
          {l:'Recovery',v:'12 words',ok:false},
        ].map((m,i)=>(
          <div key={i} className="card-flat" style={{padding:'12px 14px'}}>
            <div style={{fontSize:10,color:'var(--muted-2)',textTransform:'uppercase',letterSpacing:'.08em'}}>{m.l}</div>
            <div style={{display:'flex',alignItems:'center',gap:7,marginTop:5}}>
              <span className="mono" style={{fontSize:12.5,color:'var(--fg)'}}>{m.v}</span>
              <span className={`pill ${m.ok?'pill-ok':'pill-warn'}`} style={{fontSize:8,padding:'1px 6px'}}>{m.ok?'ok':'pending'}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:'auto'}}>
        <div style={{fontSize:13,color:'var(--fg)',lineHeight:1.5,marginBottom:8}}>Your key is yours.</div>
        <p style={{fontSize:12.5,color:'var(--muted)',lineHeight:1.6,maxWidth:400,margin:0}}>After this page, you'll see 12 recovery words. Write them down. They are the <em style={{fontStyle:'normal',color:'var(--amber)'}}>only</em> way back into your account if every device you own is lost.</p>
      </div>
    </div>
  );
}

// --- FORGOT
function VForgot(){
  return (
    <AuthShell
      title={<>Recover your <span className="serif" style={{color:'var(--accent)'}}>mesh.</span></>}
      sub="Enter your email. If a paired device is online, we'll send a verification prompt to it. Otherwise, you'll need your 12-word recovery phrase."
      step="Recover · 1 of 2"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Remember it now? <span style={{color:'var(--accent)'}}>Back to sign in</span></div>}
      side={<ForgotArt/>}
    >
      <Field label="Email" value="yusuf@sait.dev" autofocus/>
      <div className="card-flat" style={{padding:16,display:'flex',gap:12,marginTop:8,marginBottom:22,background:'oklch(0.84 0.13 85 / .04)',borderColor:'oklch(0.84 0.13 85 / .2)'}}>
        <Icon name="warn" size={16} style={{color:'var(--amber)',marginTop:1,flexShrink:0}}/>
        <div>
          <div style={{fontSize:12.5,color:'var(--fg)',fontWeight:500}}>We can't see your password.</div>
          <div style={{fontSize:12,color:'var(--fg-2)',marginTop:4,lineHeight:1.5}}>Vinctum never has your key material. What we can do is let another of your devices approve this recovery.</div>
        </div>
      </div>
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px 16px'}}>Continue <Icon name="arrow_right" size={14}/></button>
      <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginTop:10}}><Icon name="code" size={14}/> I have my 12-word phrase</button>
    </AuthShell>
  );
}

function ForgotArt(){
  return (
    <div style={{position:'absolute',inset:0,padding:48,display:'flex',flexDirection:'column',justifyContent:'center'}}>
      <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:20}}>Recovery paths</div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {[
          {icon:'phone',title:'Paired device approval',desc:'Your iPhone or other paired device shows a prompt. One tap and you\'re in.',rec:'recommended'},
          {icon:'code',title:'Recovery phrase',desc:'12 words you wrote down when you signed up. Works even if every device is lost.'},
          {icon:'users',title:'Social recovery',desc:'3 of 5 trusted contacts attest. Available on Team plans.',tag:'coming'},
        ].map((p,i)=>(
          <div key={i} className="card" style={{padding:18,display:'flex',gap:14,alignItems:'flex-start'}}>
            <div style={{width:36,height:36,borderRadius:9,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)',flexShrink:0}}>
              <Icon name={p.icon} size={15}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13.5,color:'var(--fg)',fontWeight:500}}>{p.title}</span>
                {p.rec && <span className="chip chip-emerald">{p.rec}</span>}
                {p.tag && <span className="pill pill-muted">{p.tag}</span>}
              </div>
              <p style={{fontSize:12,color:'var(--muted)',margin:'4px 0 0',lineHeight:1.5}}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- RESET
function VReset(){
  return (
    <AuthShell
      title={<>Set a new <span className="serif" style={{color:'var(--accent)'}}>password.</span></>}
      sub="Your root key stays the same — we're just re-wrapping it under a new password so this device can unlock it."
      step="Recover · 2 of 2"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Need help? <span style={{color:'var(--accent)'}}>support@vinctum.io</span></div>}
      side={<ResetArt/>}
    >
      <Field label="New password" type="password" value="••••••••••••••••" autofocus/>
      <div style={{display:'flex',gap:4,marginTop:-8,marginBottom:12}}>
        {[1,1,1,1,1].map((v,i)=>(<div key={i} style={{flex:1,height:3,borderRadius:99,background:'var(--accent)'}}/>))}
      </div>
      <div style={{fontSize:11,color:'var(--accent)',marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
        <Icon name="check" size={11}/> Strong password · 100% entropy
      </div>
      <Field label="Confirm new password" type="password" value="••••••••••••••••"/>
      <div style={{marginTop:8,marginBottom:22}}>
        <div style={{fontSize:12,color:'var(--fg-2)',marginBottom:10,fontWeight:500}}>Requirements</div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {[
            ['12+ characters',true],
            ['Mix of upper and lower case',true],
            ['At least one number',true],
            ['At least one symbol',true],
          ].map(([t,ok],i)=>(
            <div key={i} style={{display:'flex',gap:8,alignItems:'center',fontSize:12,color:ok?'var(--fg-2)':'var(--muted-2)'}}>
              <Icon name="check" size={12} style={{color:ok?'var(--accent)':'var(--muted-2)'}}/>
              {t}
            </div>
          ))}
        </div>
      </div>
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px 16px'}}>Save & sign in</button>
    </AuthShell>
  );
}

function ResetArt(){
  return (
    <div style={{position:'absolute',inset:0,padding:48,display:'flex',flexDirection:'column',justifyContent:'center'}}>
      <div className="card" style={{padding:28}}>
        <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:18}}>What happens next</div>
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {[
            {n:'1',t:'Your new password wraps the same root key',s:'We re-encrypt your existing Ed25519 key with the new password — no new identity is created.'},
            {n:'2',t:'Other devices stay signed in',s:'They hold their own copy of the wrap. Nothing changes for them.'},
            {n:'3',t:'Sessions on this device are terminated',s:'Any browser or desktop session using the old password is invalidated immediately.'},
          ].map(s=>(
            <div key={s.n} style={{display:'flex',gap:14}}>
              <div style={{width:26,height:26,borderRadius:99,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .2)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)',fontSize:12,fontFamily:'JetBrains Mono',flexShrink:0}}>{s.n}</div>
              <div>
                <div style={{fontSize:13,color:'var(--fg)',fontWeight:500}}>{s.t}</div>
                <div style={{fontSize:12,color:'var(--muted)',marginTop:4,lineHeight:1.55}}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- CHECK EMAIL
function VCheckEmail(){
  return (
    <AuthShell
      title={<>Check your <span className="serif" style={{color:'var(--accent)'}}>inbox.</span></>}
      sub="We sent a verification link to confirm this email is yours. Click it and you'll be right back here."
      step="Register · 2 of 3"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Wrong email? <span style={{color:'var(--accent)'}}>Start over</span></div>}
      side={<CheckEmailArt/>}
    >
      <div className="card-flat" style={{padding:24,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',marginBottom:20,background:'oklch(0.78 0.15 160 / .04)',borderColor:'oklch(0.78 0.15 160 / .2)'}}>
        <div style={{width:56,height:56,borderRadius:14,background:'oklch(0.78 0.15 160 / .1)',border:'1px solid oklch(0.78 0.15 160 / .3)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)',marginBottom:14}}>
          <Icon name="mail" size={22}/>
        </div>
        <div style={{fontSize:14,color:'var(--fg)',fontWeight:500}}>Email on its way to</div>
        <div className="mono" style={{fontSize:14,color:'var(--accent)',marginTop:4}}>yusuf@sait.dev</div>
        <div style={{fontSize:12,color:'var(--muted)',marginTop:10,lineHeight:1.5}}>Usually arrives within 30 seconds. Check spam if nothing shows up in 2 minutes.</div>
      </div>
      <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',padding:'11px 16px'}}><Icon name="mail" size={13}/> Resend · available in 47s</button>
      <div style={{display:'flex',alignItems:'center',gap:12,margin:'18px 0 16px',color:'var(--muted-2)'}}>
        <div style={{flex:1,height:1,background:'var(--line)'}}/>
        <span style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase'}}>or paste the code</span>
        <div style={{flex:1,height:1,background:'var(--line)'}}/>
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'space-between'}}>
        {['8','3','4','9','2','1'].map((n,i)=>(
          <div key={i} className={`input-wrap ${i<4?'input-focus':''}`} style={{width:52,height:56,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span className="mono" style={{fontSize:22,color:i<4?'var(--fg)':'var(--muted-2)'}}>{i<4?n:'·'}</span>
          </div>
        ))}
      </div>
    </AuthShell>
  );
}

function CheckEmailArt(){
  return (
    <SideQuote
      caption="— Principle 3 of the Vinctum manifesto"
      quote="Email is a terrible medium for trust. We treat it as a temporary side-channel — just enough to prove you can receive mail at that address. Nothing more is delegated to it."
      visual={
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div className="card-flat" style={{padding:18}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.08em',textTransform:'uppercase'}}>Inbox · gmail</div>
              <span className="mono" style={{fontSize:10,color:'var(--muted)'}}>just now</span>
            </div>
            <div style={{display:'flex',gap:12,padding:'12px 0',borderTop:'1px solid var(--line)',borderBottom:'1px solid var(--line)'}}>
              <div style={{width:32,height:32,borderRadius:8,background:'oklch(0.78 0.15 160 / .1)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)',flexShrink:0}}>
                <Icon name="shield" size={14}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:8}}>
                  <div style={{fontSize:12.5,color:'var(--fg)',fontWeight:500}}>Vinctum</div>
                  <span style={{fontSize:10,color:'var(--muted-2)'}}>2s</span>
                </div>
                <div style={{fontSize:12,color:'var(--fg-2)',marginTop:2}}>Confirm your email address</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Welcome! Tap to verify yusuf@sait.dev and finish setting up your mesh…</div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

// --- VERIFY EMAIL (success)
function VVerifyEmail(){
  return (
    <AuthShell
      title={<>You're <span className="serif" style={{color:'var(--accent)'}}>in.</span></>}
      sub="Your email is verified and your root identity is live on the mesh. Let's pair your first device."
      step="Register · 3 of 3"
      footer={<div style={{fontSize:12.5,color:'var(--muted)',textAlign:'center'}}>Need help? <span style={{color:'var(--accent)'}}>Read the getting-started guide</span></div>}
      side={<VerifyEmailArt/>}
    >
      <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',padding:'18px 0 28px'}}>
        <div style={{width:90,height:90,borderRadius:99,background:'oklch(0.78 0.15 160 / .08)',border:'1px solid oklch(0.78 0.15 160 / .25)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent)',position:'relative'}}>
          <Icon name="check" size={36}/>
          <div style={{position:'absolute',inset:-10,borderRadius:99,border:'1px dashed oklch(0.78 0.15 160 / .3)'}}/>
          <div style={{position:'absolute',inset:-22,borderRadius:99,border:'1px dashed oklch(0.78 0.15 160 / .12)'}}/>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:22}}>
        {[
          {l:'Email verified',v:'yusuf@sait.dev'},
          {l:'Root identity',v:'ed25519:8f3a…c4b1'},
          {l:'Plan',v:'Personal (free)'},
        ].map((r,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:9,background:'oklch(1 0 0 / .02)',border:'1px solid var(--line)'}}>
            <span style={{fontSize:12.5,color:'var(--muted)'}}>{r.l}</span>
            <span className="mono" style={{fontSize:12,color:'var(--fg)'}}>{r.v}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px 16px'}}><Icon name="qr" size={14}/> Pair your first device</button>
      <button className="btn btn-ghost" style={{width:'100%',justifyContent:'center',padding:'11px 16px',marginTop:10}}>Skip — go to dashboard</button>
    </AuthShell>
  );
}

function VerifyEmailArt(){
  return (
    <div style={{position:'absolute',inset:0,padding:48,display:'flex',flexDirection:'column',justifyContent:'center'}}>
      <div style={{fontSize:11,color:'var(--muted-2)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:20}}>What unlocks now</div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {[
          {icon:'monitor',t:'Pair up to 5 devices',s:'Phone, laptop, tablet, NAS — any mix',ok:true},
          {icon:'send',t:'Unlimited transfer size',s:'No 2GB cap, no daily cap, ever',ok:true},
          {icon:'users',t:'Invite family / team later',s:'Available any time from Account',ok:true},
          {icon:'cpu',t:'Self-host your relay',s:'Docs at docs.vinctum.io/selfhost',ok:false},
        ].map((f,i,arr)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'18px 22px',borderBottom:i<arr.length-1?'1px solid var(--line)':'none'}}>
            <div style={{width:34,height:34,borderRadius:9,background:f.ok?'oklch(0.78 0.15 160 / .08)':'oklch(1 0 0 / .03)',border:`1px solid ${f.ok?'oklch(0.78 0.15 160 / .2)':'var(--line-2)'}`,display:'flex',alignItems:'center',justifyContent:'center',color:f.ok?'var(--accent)':'var(--muted)'}}>
              <Icon name={f.icon} size={14}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,color:'var(--fg)',fontWeight:500}}>{f.t}</div>
              <div style={{fontSize:11.5,color:'var(--muted)',marginTop:2}}>{f.s}</div>
            </div>
            {f.ok ? <Icon name="check" size={15} style={{color:'var(--accent)'}}/> : <span className="pill pill-muted">later</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {VLogin, VRegister, VForgot, VReset, VCheckEmail, VVerifyEmail});
