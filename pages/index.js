import { useState, useEffect } from 'react';

export default function Home() {
  // --- CORE STATES ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- AUTH DATA ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  
  // --- STORAGE ---
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- ADMIN PANEL ---
  const [ownerPass, setOwnerPass] = useState('');
  const [activityLogs, setActivityLogs] = useState([]); 
  const [userMessages, setUserMessages] = useState([]); 
  const [blacklist, setBlacklist] = useState([]);
  const [banInput, setBanInput] = useState('');

  // --- USER DASHBOARD ---
  const [dashView, setDashView] = useState('analytics');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);
  
  // --- CUSTOMIZATION & APPEARANCE ---
  const [themeColor, setThemeColor] = useState('#8b5cf6');
  const [redirectDelay, setRedirectDelay] = useState(5);
  const [glassIntensity, setGlassIntensity] = useState(10);
  const [cardRadius, setCardRadius] = useState(20);

  // --- PERSISTENCE ---
  useEffect(() => {
    const load = (key, setter) => {
      const data = localStorage.getItem(key);
      if (data) setter(JSON.parse(data));
    };
    load('bx_accounts', setUserAccounts);
    load('bx_logs', setActivityLogs);
    load('bx_messages', setUserMessages);
    load('bx_blacklist', setBlacklist);
    load('bx_links', setMyLinks);
  }, []);

  // --- LOGIC FUNCTIONS ---
  const createSmartLink = () => {
    if (!linkUrl) { setMessage("⚠️ Destination URL is required"); return; }
    setLoading(true);
    
    setTimeout(() => {
      const domain = window.location.origin;
      const encodedUrl = btoa(linkUrl);
      const encodedTitle = btoa(linkTitle || 'Premium Content');
      const encodedImg = btoa(linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png');

      const shortUrl = `${domain}/unlock?data=${encodedUrl}&t=${encodedTitle}&i=${encodedImg}`;

      const newLink = {
        id: Math.random().toString(36).substr(2, 6),
        title: linkTitle || 'Premium Link',
        image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
        url: linkUrl,
        short: shortUrl, 
        clicks: Math.floor(Math.random() * 10), // Simulación inicial
        date: new Date().toLocaleDateString(),
      };

      const updated = [newLink, ...myLinks];
      setMyLinks(updated);
      localStorage.setItem('bx_links', JSON.stringify(updated));
      
      setLinkUrl(''); setLinkTitle(''); setLinkImage('');
      setLoading(false);
      setMessage("🚀 Link Generated Successfully!");
    }, 800);
  };

  const handleLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      if (blacklist.includes(email)) { setMessage("🚫 ACCESS REVOKED BY ADMIN"); return; }
      setCurrentUser(user);
      setStep('user-dashboard');
    } else {
      setMessage("❌ Invalid Credentials");
    }
  };

  const finalizeRegistration = () => {
    if (password.length < 4) { setMessage("PIN too short"); return; }
    const newAccount = { email, password, joined: new Date().toLocaleDateString() };
    const updated = [...userAccounts, newAccount];
    setUserAccounts(updated);
    localStorage.setItem('bx_accounts', JSON.stringify(updated));
    setMessage("✅ ACCOUNT ACTIVE");
    setTimeout(() => setStep('login'), 1500);
  };

  // --- STYLES OBJECT (Premium Design) ---
  const glass = {
    background: `rgba(15, 23, 42, 0.8)`,
    backdropFilter: `blur(${glassIntensity}px)`,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: `${cardRadius}px`,
  };

  return (
    <div style={{ 
      backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', 
      fontFamily: "'Quicksand', sans-serif", padding: '20px',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 100%)'
    }}>
      
      {/* --- START SCREEN --- */}
      {step === 'start' && (
        <div style={{ maxWidth: '450px', margin: '100px auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>💎</div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    BX SYSTEMS
                </h1>
                <p style={{ color: '#64748b' }}>The next generation of Smart Linking</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={() => setStep('reg-email')} style={{ ...glass, padding: '20px', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>GET STARTED — FREE</button>
                <button onClick={() => setStep('login')} style={{ ...glass, padding: '20px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>EXISTING MEMBER LOGIN</button>
                <button onClick={() => setStep('owner')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: '0.8rem' }}>ADMIN ACCESS</button>
            </div>
        </div>
      )}

      {/* --- REGISTRATION / LOGIN BLOCKS --- */}
      {['reg-email', 'login', 'reg-code', 'reg-pass'].includes(step) && (
        <div style={{ ...glass, maxWidth: '400px', margin: '100px auto', padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{step.includes('reg') ? 'Create Account' : 'Welcome Back'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="email" placeholder="Email Address" onChange={(e)=>setEmail(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: 'white' }} />
                
                {step === 'login' && (
                    <input type="password" placeholder="Your PIN" onChange={(e)=>setPassword(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: 'white' }} />
                )}

                {step === 'reg-email' && (
                    <button onClick={() => setStep('reg-code')} style={{ background: '#3b82f6', border: 'none', padding: '15px', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>CONTINUE</button>
                )}

                {step === 'reg-code' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px' }}>Enter the 4-digit code sent to your email</p>
                        <input type="text" maxLength="4" placeholder="0000" style={{ fontSize: '2rem', textAlign: 'center', width: '150px', background: 'none', border: '2px solid #3b82f6', color: 'white', borderRadius: '10px' }} />
                        <button onClick={() => setStep('reg-pass')} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#10b981', border: 'none', borderRadius: '12px', color: 'white' }}>VERIFY</button>
                    </div>
                )}

                {step === 'reg-pass' && (
                    <div>
                        <input type="password" placeholder="Create Security PIN" onChange={(e)=>setPassword(e.target.value)} style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', padding: '15px', borderRadius: '12px', color: 'white' }} />
                        <button onClick={finalizeRegistration} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#8b5cf6', border: 'none', borderRadius: '12px', color: 'white' }}>FINISH & START</button>
                    </div>
                )}

                {step === 'login' && (
                    <button onClick={handleLogin} style={{ background: 'white', color: 'black', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}>ACCESS DASHBOARD</button>
                )}
            </div>
            <p onClick={()=>setStep('start')} style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>Cancel</p>
        </div>
      )}

      {/* --- MAIN USER DASHBOARD --- */}
      {step === 'user-dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', maxWidth: '1400px', margin: 'auto' }}>
            
            {/* Sidebar */}
            <div style={{ ...glass, padding: '30px', height: 'calc(100vh - 40px)', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '35px', height: '35px', borderRadius: '8px', background: themeColor }}></div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>BX DASH</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { id: 'analytics', icon: '📈', label: 'Analytics' },
                        { id: 'links', icon: '🔗', label: 'My Links' },
                        { id: 'appearance', icon: '🎨', label: 'Appearance' },
                        { id: 'dev', icon: '⚡', label: 'Dev Tools' },
                        { id: 'settings', icon: '⚙️', label: 'Settings' }
                    ].map(btn => (
                        <button key={btn.id} onClick={()=>setDashView(btn.id)} style={{
                            textAlign: 'left', padding: '15px', borderRadius: '12px', border: 'none',
                            background: dashView === btn.id ? themeColor : 'transparent',
                            color: dashView === btn.id ? 'white' : '#94a3b8',
                            cursor: 'pointer', transition: '0.3s', fontWeight: 'bold'
                        }}>
                            {btn.icon} &nbsp; {btn.label}
                        </button>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#475569' }}>USER: {currentUser?.email}</p>
                    <button onClick={()=>setStep('start')} style={{ width: '100%', marginTop: '10px', background: '#f43f5e', border: 'none', padding: '10px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>LOGOUT</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ paddingBottom: '50px' }}>
                
                {/* Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem' }}>{dashView.charAt(0).toUpperCase() + dashView.slice(1)}</h2>
                    <div style={{ ...glass, padding: '10px 20px', fontSize: '0.9rem', color: themeColor, fontWeight: 'bold' }}>PREMIUM PLAN ACTIVE</div>
                </div>

                {/* VIEW: ANALYTICS */}
                {dashView === 'analytics' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[
                            { label: 'Total Clicks', val: myLinks.reduce((a,b)=>a+b.clicks, 0), color: themeColor },
                            { label: 'Average CTR', val: '12.4%', color: '#10b981' },
                            { label: 'Live Traffic', val: '活跃', color: '#f59e0b' }
                        ].map((stat, i) => (
                            <div key={i} style={{ ...glass, padding: '30px' }}>
                                <p style={{ color: '#64748b', margin: 0 }}>{stat.label}</p>
                                <h3 style={{ fontSize: '3rem', margin: '10px 0', color: stat.color }}>{stat.val}</h3>
                            </div>
                        ))}
                        <div style={{ ...glass, padding: '30px', gridColumn: 'span 3', height: '300px' }}>
                            <p style={{ color: '#64748b' }}>Hourly Performance Graph</p>
                            <div style={{ display: 'flex', height: '180px', alignItems: 'flex-end', gap: '10px' }}>
                                {[20,40,30,60,80,45,90,10,50,70,30,100].map((h, i) => (
                                    <div key={i} style={{ flex: 1, background: themeColor, height: `${h}%`, borderRadius: '5px', opacity: 0.6 }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: LINKS (CORREGIDO Y CURRADO) */}
                {dashView === 'links' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ ...glass, padding: '30px' }}>
                            <h4 style={{ marginBottom: '20px' }}>Forge New Smart Link</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <input placeholder="Link Title (e.g. Free Gems)" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '15px', background: '#020617', border: '1px solid #1e293b', color: 'white', borderRadius: '10px' }} />
                                <input placeholder="Custom Image URL" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '15px', background: '#020617', border: '1px solid #1e293b', color: 'white', borderRadius: '10px' }} />
                            </div>
                            <input placeholder="Destination URL (https://...)" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ width: '100%', padding: '15px', background: '#020617', border: '1px solid #1e293b', color: 'white', borderRadius: '10px', marginBottom: '20px' }} />
                            <button onClick={createSmartLink} disabled={loading} style={{ width: '100%', padding: '18px', background: themeColor, border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                {loading ? 'Fusing Data...' : 'GENERATE SMART LINK'}
                            </button>
                        </div>

                        <div>
                            <h4 style={{ color: '#64748b', marginBottom: '15px' }}>Active Links</h4>
                            {myLinks.map((l, i) => (
                                <div key={i} style={{ ...glass, padding: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <img src={l.image} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{l.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: themeColor }}>{l.short}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{l.clicks}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569' }}>TOTAL CLICKS</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW: APPEARANCE (MUCHAS MÁS COSAS) */}
                {dashView === 'appearance' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={{ ...glass, padding: '30px' }}>
                            <h4>Visual Engine</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Adjust how your landing pages look globally.</p>
                            
                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>Brand Primary Color</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                                {['#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ec4899'].map(c => (
                                    <div key={c} onClick={()=>setThemeColor(c)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: c, cursor: 'pointer', border: themeColor === c ? '3px solid white' : 'none' }}></div>
                                ))}
                            </div>

                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>Glassmorphism Blur ({glassIntensity}px)</label>
                            <input type="range" min="0" max="30" value={glassIntensity} onChange={(e)=>setGlassIntensity(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />

                            <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>Corner Roundness ({cardRadius}px)</label>
                            <input type="range" min="0" max="40" value={cardRadius} onChange={(e)=>setCardRadius(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />

                            <div style={{ padding: '20px', background: '#020617', borderRadius: '15px', border: '1px dashed #334155' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>🔥 Tip: High blur values work best with dark themes.</p>
                            </div>
                        </div>

                        <div style={{ ...glass, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px solid ${themeColor}` }}>
                             <div style={{ width: '60px', height: '60px', background: themeColor, borderRadius: '15px', marginBottom: '20px', boxShadow: `0 0 20px ${themeColor}` }}></div>
                             <div style={{ width: '140px', height: '10px', background: '#1e293b', borderRadius: '5px', marginBottom: '10px' }}></div>
                             <div style={{ width: '100px', height: '8px', background: '#1e293b', borderRadius: '5px', marginBottom: '40px' }}></div>
                             <button style={{ width: '100%', padding: '15px', background: themeColor, color: 'white', border: 'none', borderRadius: `${cardRadius}px`, fontWeight: 'bold' }}>UNLOCK BUTTON</button>
                             <p style={{ marginTop: '20px', fontSize: '0.7rem', color: '#475569' }}>Live Page Preview</p>
                        </div>
                    </div>
                )}

                {/* VIEW: DEV TOOLS */}
                {dashView === 'dev' && (
                    <div style={{ ...glass, padding: '30px' }}>
                        <h4 style={{ marginBottom: '20px' }}>Developer API</h4>
                        <div style={{ background: '#020617', padding: '20px', borderRadius: '15px', fontFamily: 'monospace', marginBottom: '30px' }}>
                            <p style={{ color: '#10b981', margin: 0 }}>// API Key: bx_live_89234723948sdfs</p>
                            <p style={{ color: '#64748b' }}>// Use this key to authenticate your server requests.</p>
                        </div>
                        <label>Webhook Destination</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <input placeholder="https://your-domain.com/webhook" style={{ flex: 1, padding: '15px', background: '#020617', border: '1px solid #1e293b', color: 'white', borderRadius: '10px' }} />
                            <button style={{ padding: '0 30px', background: themeColor, border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold' }}>SAVE</button>
                        </div>
                    </div>
                )}

                {/* VIEW: SETTINGS */}
                {dashView === 'settings' && (
                    <div style={{ ...glass, padding: '30px' }}>
                         <div style={{ marginBottom: '30px' }}>
                            <h4>Security Settings</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '15px', background: '#020617', borderRadius: '10px' }}>
                                <span>Require Password for Deletion</span>
                                <input type="checkbox" defaultChecked />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', padding: '15px', background: '#020617', borderRadius: '10px' }}>
                                <span>Direct Redirect (Skip Landing)</span>
                                <input type="checkbox" />
                            </div>
                         </div>
                         <button style={{ width: '100%', padding: '15px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid #f43f5e', borderRadius: '10px', fontWeight: 'bold' }}>DELETE ALL ACCOUNT DATA</button>
                    </div>
                )}

            </div>
        </div>
      )}

      {/* --- OWNER PANEL --- */}
      {step === 'owner' && (
        <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '20px' }}>Master Override</h2>
            <input type="password" placeholder="ADMIN PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ width: '100%', padding: '20px', background: '#0f172a', border: '2px solid #f43f5e', color: 'white', borderRadius: '15px', textAlign: 'center', fontSize: '1.2rem' }} />
            <button onClick={() => { if(ownerPass === "2706") setStep('owner-panel'); else setMessage("Access Denied"); }} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#f43f5e', border: 'none', borderRadius: '15px', color: 'white', fontWeight: 'bold' }}>LOGIN TO MASTER PANEL</button>
            <p onClick={()=>setStep('start')} style={{ marginTop: '20px', cursor: 'pointer', color: '#475569' }}>Go Back</p>
        </div>
      )}

      {step === 'owner-panel' && (
        <div style={{ maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h1 style={{ color: '#f43f5e' }}>Admin Console</h1>
                <button onClick={()=>setStep('start')} style={{ ...glass, padding: '10px 20px', color: 'white' }}>EXIT MASTER</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ ...glass, padding: '20px' }}>
                    <h5 style={{ color: '#38bdf8' }}>REGISTRY</h5>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.7rem' }}>
                        {userAccounts.map((u, i) => (
                            <div key={i} style={{ padding: '8px', borderBottom: '1px solid #1e293b' }}>{u.email} <br/><span style={{color: '#475569'}}>{u.joined}</span></div>
                        ))}
                    </div>
                </div>
                <div style={{ ...glass, padding: '20px' }}>
                    <h5 style={{ color: '#f59e0b' }}>MESSAGES</h5>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.7rem' }}>
                        {userMessages.map((m, i) => (
                            <div key={i} style={{ padding: '8px', background: '#020617', marginBottom: '5px' }}><b>{m.user}:</b> {m.text}</div>
                        ))}
                    </div>
                </div>
                <div style={{ ...glass, padding: '20px' }}>
                    <h5 style={{ color: '#f43f5e' }}>BLACKLIST</h5>
                    <input placeholder="Email to ban..." onChange={(e)=>setBanInput(e.target.value)} style={{ width: '100%', padding: '10px', background: '#020617', border: '1px solid #f43f5e', color: 'white', borderRadius: '5px', marginBottom: '10px' }} />
                    <button style={{ width: '100%', background: '#f43f5e', border: 'none', color: 'white', padding: '8px', borderRadius: '5px' }}>BAN USER</button>
                </div>
                <div style={{ ...glass, padding: '20px' }}>
                    <h5 style={{ color: '#10b981' }}>SYSTEM</h5>
                    <p style={{ fontSize: '0.7rem' }}>Database: LOCAL_64_PERSIST</p>
                    <p style={{ fontSize: '0.7rem' }}>Active Sessions: {userAccounts.length}</p>
                    <button style={{ width: '100%', marginTop: '20px', background: '#334155', border: 'none', color: 'white', padding: '10px', borderRadius: '5px' }}>WIPE LOGS</button>
                </div>
            </div>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '10px 25px', background: 'rgba(0,0,0,0.8)', color: themeColor, borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 1000, display: message ? 'block' : 'none' }}>
        {message}
      </div>

    </div>
  );
}
