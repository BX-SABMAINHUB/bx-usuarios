import { useState, useEffect } from 'react';

export default function Home() {
  // --- GLOBAL STATES ---
  const [step, setStep] = useState('start'); 
  const [message, setMessage] = useState('');
  
  // --- AUTH DATA ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  
  // --- DATABASES (LOCALSTORAGE) ---
  const [userAccounts, setUserAccounts] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null); 
  
  // --- OWNER / ADMIN STATES ---
  const [ownerPass, setOwnerPass] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [activityLogs, setActivityLogs] = useState([]); 
  const [userMessages, setUserMessages] = useState([]); 
  const [currentMessage, setCurrentMessage] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [customMailBody, setCustomMailBody] = useState('');
  const [blacklist, setBlacklist] = useState([]);
  const [banInput, setBanInput] = useState('');

  // --- USER DASHBOARD STATES ---
  const [dashView, setDashView] = useState('analytics');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkImage, setLinkImage] = useState(''); 
  const [myLinks, setMyLinks] = useState([]);
  
  // --- CUSTOMIZATION STATES ---
  const [themeColor, setThemeColor] = useState('#8b5cf6');
  const [redirectDelay, setRedirectDelay] = useState(5);
  const [allowVpn, setAllowVpn] = useState(false);
  const [layoutStyle, setLayoutStyle] = useState('modern'); // 'modern' or 'classic'

  // --- DATA LOADING ---
  useEffect(() => {
    const load = (key) => JSON.parse(localStorage.getItem(key) || '[]');
    setUserAccounts(load('bx_accounts'));
    setActivityLogs(load('bx_logs'));
    setUserMessages(load('bx_messages'));
    setBlacklist(load('bx_blacklist'));
    setMyLinks(load('bx_links'));
  }, []);

  // --- ACTIONS ---
  const saveToLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  const createSmartLink = () => {
    if (!linkUrl) { setMessage("⚠️ Destination URL is required"); return; }
    const domain = window.location.origin;
    const encodedUrl = btoa(linkUrl);
    const encodedTitle = btoa(linkTitle || 'Premium Content');
    const encodedImg = btoa(linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png');

    const shortUrl = `${domain}/unlock?data=${encodedUrl}&t=${encodedTitle}&i=${encodedImg}`;

    const newLink = {
      id: Math.random().toString(36).substr(2, 6),
      title: linkTitle || 'Premium Content',
      image: linkImage || 'https://i.ibb.co/vzPRm9M/alexgaming.png',
      url: linkUrl,
      short: shortUrl, 
      clicks: Math.floor(Math.random() * 10), // Simulated initial engagement
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    const updated = [newLink, ...myLinks];
    setMyLinks(updated);
    saveToLocal('bx_links', updated);
    
    setLinkUrl(''); setLinkTitle(''); setLinkImage('');
    setMessage("Link generated successfully! 🚀");
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogin = () => {
    const user = userAccounts.find(u => u.email === email && u.password === password);
    if (user) {
      if (blacklist.includes(email)) { setMessage("🚫 ACCESS REVOKED BY ADMIN"); return; }
      setCurrentUser(user);
      setStep('user-dashboard');
    } else {
      setMessage("❌ INVALID CREDENTIALS");
    }
  };

  // --- UI COMPONENTS ---
  const SidebarItem = ({ id, icon, label }) => (
    <button 
      onClick={() => setDashView(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 18px',
        background: dashView === id ? `${themeColor}15` : 'transparent',
        color: dashView === id ? themeColor : '#94a3b8',
        border: 'none', borderRadius: '12px', cursor: 'pointer', transition: '0.2s',
        fontWeight: dashView === id ? '600' : '400',
        borderLeft: dashView === id ? `3px solid ${themeColor}` : '3px solid transparent'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{ 
      backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', 
      fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' 
    }}>
      
      {/* Background Decorative Blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '400px', height: '400px', background: `${themeColor}20`, filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: '#3b82f615', filter: 'blur(100px)', borderRadius: '50%', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: step === 'user-dashboard' ? '1400px' : '450px', margin: 'auto', padding: '40px 20px' }}>
        
        {/* --- START SCREEN --- */}
        {step === 'start' && (
          <div style={{ textAlign: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', borderRadius: '22px', margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)' }}></div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>BX <span style={{ color: '#3b82f6' }}>SYSTEMS</span></h1>
            <p style={{ color: '#64748b', marginBottom: '40px' }}>The next generation of smart link management.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setStep('reg-email')} style={{ padding: '18px', borderRadius: '16px', border: 'none', background: '#f8fafc', color: '#020617', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }}>Create Account</button>
              <button onClick={() => setStep('login')} style={{ padding: '18px', borderRadius: '16px', border: '1px solid #1e293b', background: 'rgba(30, 41, 59, 0.5)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => setStep('owner')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Admin Access</button>
            </div>
          </div>
        )}

        {/* --- LOGIN SCREEN --- */}
        {step === 'login' && (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Welcome Back</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="Email address" onChange={(e)=>setEmail(e.target.value)} style={{ padding: '16px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: '#fff' }} />
              <input type="password" placeholder="PIN Code" onChange={(e)=>setPassword(e.target.value)} style={{ padding: '16px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: '#fff' }} />
              <button onClick={handleLogin} style={{ padding: '16px', borderRadius: '12px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Access Dashboard</button>
              <button onClick={() => setStep('start')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Go Back</button>
            </div>
          </div>
        )}

        {/* --- USER DASHBOARD (THE BIG ONE) --- */}
        {step === 'user-dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', minHeight: '80vh', overflow: 'hidden' }}>
            
            {/* Sidebar */}
            <aside style={{ background: 'rgba(2, 6, 23, 0.4)', padding: '30px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
                  <div style={{ width: '32px', height: '32px', background: themeColor, borderRadius: '8px' }}></div>
                  <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>BX<span style={{ color: themeColor }}>PRO</span></span>
                </div>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <SidebarItem id="analytics" icon="📈" label="Analytics" />
                  <SidebarItem id="links" icon="🔗" label="My Links" />
                  <SidebarItem id="appearance" icon="🎨" label="Appearance" />
                  <SidebarItem id="dev" icon="⚡" label="Developers" />
                  <SidebarItem id="settings" icon="⚙️" label="Settings" />
                </nav>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Signed in as</p>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
                <button onClick={() => setStep('start')} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#ef444415', color: '#ef4444', border: 'none', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
              </div>
            </aside>

            {/* Main Content */}
            <main style={{ padding: '40px', overflowY: 'auto' }}>
              
              {/* SECTION: ANALYTICS */}
              {dashView === 'analytics' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Performance Overview</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    {[
                      { label: 'Total Clicks', val: myLinks.reduce((a, b) => a + (b.clicks || 0), 0), color: themeColor },
                      { label: 'Avg. CTR', val: '12.4%', color: '#10b981' },
                      { label: 'Live Users', val: '24', color: '#3b82f6' }
                    ].map((stat, i) => (
                      <div key={i} style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: stat.color }}>{stat.val}</h3>
                      </div>
                    ))}
                  </div>

                  {/* Chart Simulation */}
                  <div style={{ background: 'rgba(30, 41, 59, 0.2)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                      <h4 style={{ color: '#94a3b8' }}>Traffic Flow (Last 24h)</h4>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor }}></div> Mobile
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Desktop
                        </div>
                      </div>
                    </div>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                      {[30, 45, 25, 60, 90, 70, 40, 55, 85, 100, 65, 50].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(to top, ${themeColor}40, ${themeColor})`, borderRadius: '6px' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: LINKS */}
              {dashView === 'links' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Link Manager</h2>
                  <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <input type="text" placeholder="Entry Title (e.g. Free Robux)" value={linkTitle} onChange={(e)=>setLinkTitle(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: '#fff' }} />
                      <input type="text" placeholder="Thumbnail URL" value={linkImage} onChange={(e)=>setLinkImage(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '15px' }}>
                      <input type="text" placeholder="https://destination-link.com" value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#020617', border: '1px solid #1e293b', color: '#fff' }} />
                      <button onClick={createSmartLink} style={{ background: themeColor, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 10px 20px ${themeColor}30` }}>Create Link</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myLinks.map((link) => (
                      <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <img src={link.image} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                          <div>
                            <p style={{ fontWeight: '700', marginBottom: '4px' }}>{link.title}</p>
                            <p style={{ color: themeColor, fontSize: '0.8rem', fontFamily: 'monospace' }}>{link.short.substring(0, 30)}...</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>{link.clicks}</p>
                            <p style={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Clicks</p>
                          </div>
                          <button onClick={() => window.open(link.short, '_blank')} style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Test</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: APPEARANCE (EXPANDED) */}
              {dashView === 'appearance' && (
                <div>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Customization</h2>
                  <p style={{ color: '#64748b', marginBottom: '30px' }}>Personalize how users see your landing pages.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div style={{ background: 'rgba(30, 41, 59, 0.3)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ marginBottom: '20px' }}>Brand Identity</h4>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>Accent Color</label>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
                        {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e'].map(c => (
                          <div key={c} onClick={() => setThemeColor(c)} style={{ width: '40px', height: '40px', background: c, borderRadius: '50%', cursor: 'pointer', border: themeColor === c ? '3px solid white' : 'none', transform: themeColor === c ? 'scale(1.1)' : 'scale(1)', transition: '0.2s' }}></div>
                        ))}
                      </div>

                      <h4 style={{ marginBottom: '20px' }}>Experience</h4>
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '0.9rem' }}>Redirect Delay</span>
                          <span style={{ fontWeight: '700' }}>{redirectDelay}s</span>
                        </div>
                        <input type="range" min="3" max="30" value={redirectDelay} onChange={(e)=>setRedirectDelay(e.target.value)} style={{ width: '100%', accentColor: themeColor }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#020617', borderRadius: '12px' }}>
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Safe-Gate (VPN Block)</p>
                          <p style={{ fontSize: '0.7rem', color: '#475569' }}>Block suspicious traffic</p>
                        </div>
                        <div onClick={() => setAllowVpn(!allowVpn)} style={{ width: '44px', height: '24px', background: allowVpn ? themeColor : '#1e293b', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                          <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: allowVpn ? '23px' : '3px', transition: '0.3s' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Preview Mobile */}
                    <div style={{ background: '#020617', padding: '10px', borderRadius: '40px', border: '8px solid #1e293b', width: '260px', margin: 'auto', height: '480px', position: 'relative' }}>
                       <div style={{ width: '60px', height: '4px', background: '#1e293b', borderRadius: '10px', margin: '15px auto' }}></div>
                       <div style={{ padding: '20px', textAlign: 'center' }}>
                          <div style={{ width: '60px', height: '60px', background: themeColor, borderRadius: '16px', margin: '40px auto 20px' }}></div>
                          <div style={{ width: '100px', height: '10px', background: '#1e293b', borderRadius: '5px', margin: '0 auto 40px' }}></div>
                          <div style={{ width: '100%', height: '45px', background: themeColor, borderRadius: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>DOWNLOAD</div>
                          <div style={{ width: '100%', height: '45px', background: 'transparent', border: `1px solid ${themeColor}`, borderRadius: '10px', color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>WATCH VIDEO</div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DEV (EXPANDED) */}
              {dashView === 'dev' && (
                <div>
                   <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Developer API</h2>
                   <p style={{ color: '#64748b', marginBottom: '30px' }}>Automate your workflow with our REST API.</p>
                   
                   <div style={{ background: '#1e293b50', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Private API Key</label>
                     <div style={{ display: 'flex', gap: '10px', margin: '10px 0 30px' }}>
                        <input type="password" value="bx_live_key_928374928374928374" readOnly style={{ flex: 1, background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', color: '#64748b', fontFamily: 'monospace' }} />
                        <button style={{ padding: '0 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Copy</button>
                     </div>

                     <h4 style={{ marginBottom: '15px' }}>Webhook URL</h4>
                     <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '15px' }}>Get notified every time a user completes an action.</p>
                     <input type="text" placeholder="https://your-server.com/api/webhook" style={{ width: '100%', background: '#020617', border: '1px solid #1e293b', padding: '14px', borderRadius: '12px', color: '#fff', marginBottom: '20px' }} />
                     
                     <div style={{ background: '#020617', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        <span style={{ color: themeColor }}>POST</span> /v1/create_link <br/>
                        <span style={{ color: '#64748b' }}>// Response: 200 OK</span>
                     </div>
                   </div>
                </div>
              )}

              {/* SECTION: SETTINGS (EXPANDED) */}
              {dashView === 'settings' && (
                <div>
                   <h2 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Account Settings</h2>
                   <div style={{ background: '#1e293b50', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                         <div>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Account Email</p>
                            <p style={{ fontWeight: '700' }}>{currentUser?.email}</p>
                         </div>
                         <button style={{ padding: '8px 16px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '8px' }}>Update</button>
                      </div>

                      <h4 style={{ marginBottom: '20px' }}>Security</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         <button style={{ textAlign: 'left', padding: '16px', background: 'transparent', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px' }}>🔒 Change Account PIN</button>
                         <button style={{ textAlign: 'left', padding: '16px', background: 'transparent', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px' }}>🛡️ Setup Two-Factor Authentication</button>
                      </div>

                      <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #1e293b' }}>
                         <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>Danger Zone</h4>
                         <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '20px' }}>Permanently delete your account and all generated links.</p>
                         <button style={{ padding: '12px 24px', background: '#ef444415', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '12px', fontWeight: 'bold' }}>Delete Account</button>
                      </div>
                   </div>
                </div>
              )}

            </main>
          </div>
        )}

        {/* --- ADMIN PANEL (STYLISH VERSION) --- */}
        {step === 'owner' && (
          <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(244, 63, 94, 0.2)', backdropFilter: 'blur(20px)' }}>
            <h2 style={{ color: '#f43f5e', textAlign: 'center', marginBottom: '24px' }}>Admin Authorization</h2>
            <input type="password" placeholder="Admin PIN" onChange={(e)=>setOwnerPass(e.target.value)} style={{ width: '100%', padding: '16px', background: '#020617', border: '1px solid #f43f5e30', borderRadius: '12px', color: '#fff', textAlign: 'center', fontSize: '1.2rem' }} />
            <button onClick={() => { if(ownerPass === "2706") setStep('owner-panel'); else setMessage("Access Denied"); }} style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#f43f5e', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: '800' }}>Authorize Access</button>
            <button onClick={()=>setStep('start')} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#64748b' }}>Exit</button>
          </div>
        )}

        {step === 'owner-panel' && (
           <div style={{ background: '#020617', padding: '40px', borderRadius: '32px', border: '1px solid #1e293b' }}>
              <h2 style={{ marginBottom: '30px' }}>Admin Command Center</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px' }}>
                    <h4 style={{ color: '#38bdf8' }}>Active Users</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                       {userAccounts.map((u, i) => <div key={i} style={{ padding: '10px', borderBottom: '1px solid #1e293b', fontSize: '0.8rem' }}>{u.email}</div>)}
                    </div>
                 </div>
                 <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px' }}>
                    <h4 style={{ color: '#f43f5e' }}>Blacklist</h4>
                    {blacklist.map((b, i) => <div key={i} style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '5px' }}>{b}</div>)}
                 </div>
              </div>
              <button onClick={()=>setStep('start')} style={{ marginTop: '30px', padding: '12px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '10px' }}>Close Session</button>
           </div>
        )}

        {message && (
          <div style={{ 
            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', 
            padding: '12px 24px', background: '#3b82f6', color: '#fff', borderRadius: '12px', 
            fontWeight: 'bold', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)', animation: 'slideUp 0.3s ease-out'
          }}>
            {message}
          </div>
        )}

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        @keyframes slideUp { from { bottom: -50px; opacity: 0; } to { bottom: 30px; opacity: 1; } }
        body { margin: 0; padding: 0; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #1e293b; borderRadius: 10px; }
      `}</style>
    </div>
  );
}
