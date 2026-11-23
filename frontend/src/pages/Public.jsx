import React,{useEffect,useRef,useState} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import {Building2,ChartNoAxesCombined,ShieldCheck,Headphones,Mail,LockKeyhole,LogIn,ArrowRight,Phone,MapPin,Clock} from 'lucide-react';
import {api,send,money} from '../lib';
import {Card,Field,Notice,useAuth} from '../components';

function Snapshot(){const [companies,setCompanies]=useState([]);useEffect(()=>{let alive=true;api('/companies').then(d=>alive&&setCompanies(Array.isArray(d)?d:[])).catch(()=>{});return()=>{alive=false}},[]);return <div className="market-snapshot"><h3><ChartNoAxesCombined size={19}/> Market Snapshot</h3><div className="snapshot-grid">{companies.length?companies.slice(0,4).map(c=><div className="snapshot-company" key={c.company_id}><span>{c.ticker}</span><strong>{money(c.current_price)}</strong></div>):<p className="snapshot-loading">Share prices will appear when the market records are available.</p>}</div></div>}

function GoogleButton({onSuccess,onError}) {
 const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID;
 const button=useRef(null);
 useEffect(()=>{
   if(!clientId)return;
   let mounted=true;
   const render=()=>{if(!mounted||!button.current||!window.google?.accounts?.id)return;window.google.accounts.id.initialize({client_id:clientId,callback:async response=>{try{const data=await send('/google-login',{credential:response.credential});onSuccess(data)}catch(e){onError(e.message)}}});window.google.accounts.id.renderButton(button.current,{theme:'outline',size:'large',shape:'rectangular',text:'signin_with',width:280});};
   const existing=document.querySelector('script[data-sml-google]');
   if(existing){existing.addEventListener('load',render);render();}else{const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;s.dataset.smlGoogle='true';s.addEventListener('load',render);document.head.appendChild(s)}
   return()=>{mounted=false};
 },[clientId,onSuccess,onError]);
 if(!clientId)return null;
 return <><div className="divider">or</div><div className="gsi-wrapper" ref={button}/></>;
}

export function AuthPage({mode}) {
 const navigate=useNavigate(),{login}=useAuth(),[params]=useSearchParams(),[fields,setFields]=useState({fullname:'',email:localStorage.getItem('sml-remember-email')||'',phone:'',password:'',confirm_password:'',new_password:'',token:params.get('token')||''}),[remember,setRemember]=useState(localStorage.getItem('sml-remember-email')!==null),[message,setMessage]=useState(''),[bad,setBad]=useState(false),[loading,setLoading]=useState(false);
 const isLogin=mode==='login',isRegister=mode==='register',isForgot=mode==='forgot',isReset=mode==='reset';
 const change=(n,v)=>setFields(f=>({...f,[n]:v}));
 const succeed=data=>{login(data);navigate('/app/dashboard')};
 const error=m=>{setMessage(m);setBad(true)};
 async function submit(e){e.preventDefault();setLoading(true);setMessage('');try{
 if((isRegister||isReset)&&fields.password&&fields.confirm_password&&fields.password!==fields.confirm_password&&isRegister)throw Error('Passwords do not match.');
 if(isRegister&&fields.password.length<8)throw Error('Password must be at least 8 characters.');
 if(isLogin){if(remember)localStorage.setItem('sml-remember-email',fields.email);else localStorage.removeItem('sml-remember-email');succeed(await send('/login',{email:fields.email,password:fields.password}));}
 else if(isRegister){const r=await send('/register',{fullname:fields.fullname,email:fields.email,phone:fields.phone,password:fields.password});setMessage(r.message+' You can now log in.');setBad(false)}
 else if(isForgot){const r=await send('/request-password-reset',{email:fields.email});setMessage(r.message);setBad(false)}
 else{if(fields.new_password!==fields.confirm_password)throw Error('Passwords do not match.');const r=await send('/confirm-password-reset',{token:fields.token,new_password:fields.new_password});setMessage(r.message);setBad(false)}
 }catch(e){error(e.message)}finally{setLoading(false)}}
 const resetMode=isForgot||isReset;
 return <main className="auth-shell" style={resetMode?{gridTemplateColumns:'1fr'}:{}}>
 {!resetMode&&<section className="auth-visual"><div className="eyebrow"><Building2 size={16} style={{verticalAlign:'middle',marginRight:5}}/> A subsidiary of National Bank of Malawi</div><h1>{isLogin?'Your Trusted Broker for the Malawi Stock Exchange':'Open your investor account in minutes.'}</h1><p>{isLogin?'Stockbrokers Malawi Limited executes your trades on the MSE - buy and sell shares in Airtel Malawi, NBM, TNM, MPICO and other listed companies, with portfolio tracking and direct support from your broker.':"Create your login first. Once verified, you’ll complete a short account-opening form to start trading on the Malawi Stock Exchange through Stockbrokers Malawi Limited."}</p><div className="stat-row"><div><div className="stat-label">{isRegister?'MSE companies':'Listed Companies'}</div><div className="stat-value">16</div></div><div><div className="stat-label">Settlement</div><div className="stat-value">T+3</div></div><div><div className="stat-label">CSD Held At</div><div className="stat-value" style={{fontSize:15}}>Reserve Bank of Malawi</div></div>{isLogin&&<div><div className="stat-label">Market Cap</div><div className="stat-value">MK 18.5T</div></div>}</div>{isLogin&&<Snapshot/>}</section>}
 <section className="auth-form-side" style={resetMode?{maxWidth:440,width:'100%',margin:'0 auto'}:{}}>
 <div className="form-header"><h2>{isLogin?'Welcome Back':isRegister?'Create your account':isForgot?'Reset your password':'Set a new password'}</h2><p>{isLogin?'Log in to manage your portfolio and place orders.':isRegister?'Step 1 of 2 - your login details. Investor account setup comes next.':isForgot?"Enter the email address on your account. We'll send you a link to reset your password.":'Enter a new password for your account.'}</p></div>
 <Notice text={message} error={bad}/>
 <form onSubmit={submit}>
 {isRegister&&<Field label="Full name" name="fullname" value={fields.fullname} required onChange={v=>change('fullname',v)} placeholder="Your full name"/>}
 {(isLogin||isRegister||isForgot)&&<Field label="Email Address" type="email" name="email" value={fields.email} required onChange={v=>change('email',v)} placeholder="you@example.com"/>}
 {isRegister&&<Field label="Phone number" name="phone" type="tel" value={fields.phone} onChange={v=>change('phone',v)} placeholder="09XXXXXXXX"/>}
 {(isLogin||isRegister)&&<div className={isRegister?'field-row':''}><Field label="Password" name="password" type="password" required value={fields.password} onChange={v=>change('password',v)} placeholder={isRegister?'At least 8 characters':'Enter your password'}/>{isRegister&&<Field label="Confirm password" name="confirm_password" type="password" required value={fields.confirm_password} onChange={v=>change('confirm_password',v)} placeholder="Repeat password"/>}</div>}
 {isReset&&<><Field label="Reset token" name="token" value={fields.token} required onChange={v=>change('token',v)}/><Field label="New password" name="new_password" type="password" required value={fields.new_password} onChange={v=>change('new_password',v)} placeholder="At least 8 characters"/><Field label="Confirm new password" name="confirm_password" type="password" required value={fields.confirm_password} onChange={v=>change('confirm_password',v)} placeholder="Repeat new password"/></>}
 {isLogin&&<div className="form-options"><label className="remember-me"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Remember me</label><Link className="forgot-password" to="/forgot-password">Forgot password?</Link></div>}
 <button type="submit" disabled={loading} className="btn btn-primary btn-block">{loading?'Please wait...':isLogin?<><LogIn size={16}/> Log in</>:isRegister?'Create account':isForgot?'Send reset link':'Reset password'}</button>
 </form>
 {isLogin&&<GoogleButton onSuccess={succeed} onError={error}/>}
 <p className="auth-switch">{isLogin?<>Don't have an account? <Link to="/register">Create one</Link></>:isRegister?<>Already have an account? <Link to="/login">Log in</Link></>:<Link to="/login">Back to log in</Link>}</p>
 {isLogin&&<div className="auth-footer"><p><ShieldCheck size={15} style={{verticalAlign:'middle'}}/> Protected account access</p><p><Headphones size={15} style={{verticalAlign:'middle'}}/> Contact your broker for account support</p></div>}
 </section></main>;
}

const serviceCards=[
 ['Equity Trading Accounts','We open and manage Equity Trading and Money Market accounts, linked to a Central Securities Depository (CSD) account at the Reserve Bank of Malawi, so you can hold shares securely in your own name.'],
 ['Buy & Sell Orders','Submit buy and sell requests for broker review on the MSE; requests are subject to SML trading rules and applicable settlement procedures.'],
 ['Portfolio Management','Track your recorded holdings across MSE-listed companies in one place, with valuations based on the latest prices saved in the system.'],
 ['Broker Support','Message your broker directly through the platform with questions about your orders, account, or the market.']
];
export function StaticPage({kind}) {
 if(kind==='about')return <main className="static-content"><div className="eyebrow">A subsidiary of National Bank of Malawi</div><h1>About Stockbrokers Malawi Limited</h1><p className="lead">Stockbrokers Malawi Limited (SML) is a stock brokerage firm in Malawi and a subsidiary of the National Bank of Malawi. We facilitate the buying and selling of shares on the Malawi Stock Exchange (MSE) on behalf of our clients, executing trade orders and managing cash and scrip settlements through the Central Securities Depository (CSD) at the Reserve Bank of Malawi.</p><Card title="What we do"><p>As a stockbroker, SML acts as the intermediary between individual and institutional investors and the Malawi Stock Exchange. The portal supports account opening, buy and sell order requests, client portfolios, and brokerage review.</p></Card><Card title="Our commitment"><p>We are committed to transparent, compliant, and client-focused service. The platform models published commission rates, broker approvals and recorded transactions. It is a university demonstration; no live order execution takes place.</p></Card><div className="static-facts"><div><strong>16</strong><small>MSE-listed companies (original reference)</small></div><div><strong>T+3</strong><small>Standard settlement period (original reference)</small></div><div><strong>RBM</strong><small>CSD held with Reserve Bank</small></div></div></main>;
 if(kind==='services')return <main className="static-content"><h1>Our Services</h1><p className="lead">Everything you need to trade on the Malawi Stock Exchange, from account opening to portfolio management.</p><div className="static-services">{serviceCards.map(([title,description])=><Card title={title} key={title}><p>{description}</p></Card>)}</div><div style={{marginTop:24}}><Card title="Commission Structure"><div className="table-scroll"><table className="data-table"><thead><tr><th>Proceeds</th><th>Commission</th></tr></thead><tbody><tr><td>K50,000 and below</td><td className="mono">2%</td></tr><tr><td>Above K50,000, up to K100,000</td><td className="mono">1.5%</td></tr><tr><td>Above K100,000</td><td className="mono">1%</td></tr></tbody></table></div><p style={{marginTop:12}}>The legacy interface presents a K50 flat charge and VAT in addition to commission. Confirm current rates with SML before real financial use.</p></Card></div></main>;
 return <main className="static-content"><h1>Contact Us</h1><p className="lead">Have a question about your account or an order? Reach out to us directly, or message your broker once you're logged in.</p><div className="static-services"><Card title="Get in touch"><ul className="contact-list"><li><MapPin size={16}/> Victoria Avenue, Blantyre, Malawi</li><li><Phone size={16}/> +265 1 825 000</li><li><Mail size={16}/> info@stockbrokers.mw</li><li><Clock size={16}/> Mon-Fri: 8:00 AM - 5:00 PM</li></ul></Card><Card title="Already have an account?"><p>For questions about a specific order or your account, log in and message your broker directly.</p><p style={{marginTop:20}}><Link className="btn btn-primary" to="/login">Log in to message your broker</Link></p></Card></div></main>;
}
