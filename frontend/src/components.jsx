import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { Menu, X, ArrowRight, AlertCircle, CheckCircle2, CircleHelp, RefreshCw, Activity } from 'lucide-react';
import { api, money, num, date, label } from './lib';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Structural components use the SAME design vocabulary and visual hierarchy as the
// October 2026 HTML/CSS frontend. The API merely supplies their changing content.
export function Page({title, subtitle, action, children}) {
  return <section className="page"><div className="page-header"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
export function Card({title,subtitle,action,children,className=''}) {
  return <section className={'card '+className}>{(title||subtitle||action)&&<div className="card-header"><div>{title&&<div className="card-title">{title}</div>}{subtitle&&<p className="card-subtitle">{subtitle}</p>}</div>{action}</div>}{children}</section>;
}
export function Button({children,kind='',disabled,type='button',onClick}) {
  const classes=kind.split(' ').filter(Boolean).map(x=>({primary:'btn-primary',outline:'btn-outline',danger:'btn-danger',success:'btn-success',sm:'btn-sm',block:'btn-block',ghost:'btn-outline'}[x]||x)).join(' ');
  return <button type={type} className={'btn '+classes} disabled={disabled} onClick={onClick}>{children}</button>;
}
export function Notice({text,error=false,onDismiss}) {
  return text?<div className={'alert show '+(error?'alert-error':'alert-success')} role="status"><span className="alert-text">{error?<AlertCircle size={16}/>:<CheckCircle2 size={16}/>} {text}</span>{onDismiss&&<button type="button" className="alert-close" onClick={onDismiss} aria-label="Dismiss"><X size={16}/></button>}</div>:null;
}
export function Status({value}) {const s=String(value||'pending').toLowerCase();return <span className={'status-pill status-'+s}>{label(s)}</span>}
export function Empty({text='Nothing to display yet.'}) {return <div className="empty-state"><CircleHelp size={21}/><p>{text}</p></div>}
export function Table({rows=[],columns=[],empty='No records available',actions}) {
  if (!rows.length) return <Empty text={empty}/>;
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map(([key,heading])=><th key={key}>{heading||label(key)}</th>)}{actions&&<th>Actions</th>}</tr></thead><tbody>{rows.map((row,i)=><tr key={row.id||row.user_id||row.order_id||row.sell_id||row.investor_id||row.company_id||row.transaction_id||row.dividend_id||row.payout_id||i}>{columns.map(([key,,format])=><td key={key} className={format==='money'||format==='num'?'mono':''}>{format==='money'?money(row[key]):format==='date'?date(row[key]):format==='num'?num(row[key]):format==='status'?<Status value={row[key]}/>:String(row[key]??'—')}</td>)}{actions&&<td className="table-actions">{actions(row)}</td>}</tr>)}</tbody></table></div>
}
export function Field({label:caption,name,type='text',value,options,required=false,onChange,placeholder,min,step,accept}) {
  const id='field-'+name;
  return <div className="field"><label htmlFor={id}>{caption||label(name)}{required?' *':''}</label>{options?<select id={id} name={name} value={value??''} required={required} onChange={e=>onChange(e.target.value)}><option value="">Select...</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>:type==='textarea'?<textarea id={id} name={name} value={value??''} onChange={e=>onChange(e.target.value)} rows="3"/>:<input id={id} name={name} type={type} min={min} step={step} accept={accept} required={required} placeholder={placeholder||''} value={type==='file'?undefined:(value??'')} onChange={e=>onChange(type==='file'?e.target.files?.[0]||null:e.target.value)}/>}</div>;
}
export function useResource(path,deps=[]) {
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{let live=true;setLoading(true);setError('');api(path).then(x=>live&&setData(x)).catch(e=>live&&setError(e.message)).finally(()=>live&&setLoading(false));return()=>{live=false}},[path,revision,...deps]);
 return {data,loading,error,reload:()=>setRevision(v=>v+1)};
}
export function Remote({state,children}) {return <>{state.error&&<Notice text={state.error} error/>}{state.loading?<div className="loading"><RefreshCw className="spin" size={17}/> Loading...</div>:children(state.data)}</>}
export function Stat({label:title,value,hint}) {return <div className="stat-card"><div className="label">{title}</div><div className="value">{value??'—'}</div>{hint&&<p className="hint">{hint}</p>}</div>}

const navigation={
 investor:[['dashboard','Dashboard'],['account','My Account'],['market','Companies'],['buy','Buy Shares'],['sell','Sell Shares'],['portfolio','Portfolio'],['dividends','Dividends'],['orders','Order History'],['messages','Messages'],['transactions','Transactions & Notes'],['statements','Statements']],
 broker:[['dashboard','Dashboard'],['accounts','Account Applications'],['orders','Orders'],['dividends','Dividends'],['messages','Messages'],['history','Order History']],
 admin:[['dashboard','Dashboard'],['users','Users'],['companies','Companies & Prices'],['dividends','Dividends'],['audit','Audit Trail']]
};
export function MarketTicker(){const companies=useResource('/companies');const arr=Array.isArray(companies.data)?companies.data:[];return <div className="ticker-wrap"><div className="ticker" aria-label="Recorded share prices">{arr.length?arr.map(c=><span className="ticker-item" key={c.company_id}><span className="name">{c.ticker}</span><span className="price">{money(c.current_price)}</span><span className="change neutral">MSE</span></span>):<span className="ticker-item"><span className="name">Stockbrokers Malawi Limited</span><span className="price">Malawi Stock Exchange</span></span>}</div></div>}
export function PublicHeader(){const location=useLocation(),{user}=useAuth();return <><>{location.pathname==='/'||location.pathname==='/login'?<div className="top-bar"><div className="container"><div className="top-bar-left"><span>☎ +265 1 825 000</span><span>✉ info@stockbrokers.mw</span><span>◷ Market Hours: 9:00 AM - 4:00 PM (Mon-Fri)</span></div></div></div>:null}</><MarketTicker/><nav className="navbar"><div className="container"><Link to="/" className="brand-logo"><span className="mark">SML</span><div className="brand-text"><span className="brand-name">Stockbrokers Malawi</span><span className="brand-sub">Member of the MSE</span></div></Link><div className="nav-links"><NavLink to="/" end className={({isActive})=>isActive?'active':''}>Home</NavLink><NavLink to="/about" className={({isActive})=>isActive?'active':''}>About</NavLink><NavLink to="/services" className={({isActive})=>isActive?'active':''}>Services</NavLink><NavLink to="/contact" className={({isActive})=>isActive?'active':''}>Contact</NavLink>{user?<Link to="/app/dashboard" className="btn btn-outline">Dashboard</Link>:<Link to="/register" className="btn btn-outline">Create Account</Link>}</div></div></nav></>}
export function PublicLayout(){return <div className="public-root"><PublicHeader/><Outlet/><footer className="main-footer"><div className="container"><div className="footer-grid"><div className="footer-col"><h4>Stockbrokers Malawi Limited</h4><p>A leading stock brokerage firm in Malawi, providing comprehensive investment services on the Malawi Stock Exchange.</p></div><div className="footer-col"><h4>Quick Links</h4><ul><li><Link to="/">Home</Link></li><li><Link to="/about">About Us</Link></li><li><Link to="/services">Services</Link></li><li><Link to="/contact">Contact</Link></li><li><Link to="/register">Open Account</Link></li></ul></div><div className="footer-col"><h4>Contact Us</h4><ul className="contact-info"><li>Victoria Avenue, Blantyre, Malawi</li><li>+265 1 825 000</li><li>info@stockbrokers.mw</li><li>Mon-Fri: 8:00 AM - 5:00 PM</li></ul></div></div><div className="footer-bottom"><p>© 2026 Stockbrokers Malawi Limited. All rights reserved.</p><p>Prototype trading environment — not a live securities exchange.</p></div></div></footer></div>}
export function AppLayout(){const {user,logout}=useAuth(),[mobile,setMobile]=useState(false),navigate=useNavigate(),location=useLocation(),items=navigation[user?.role]||[];useEffect(()=>setMobile(false),[location.pathname]);return <div className="app-shell"><button className="mobile-menu" type="button" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu size={23}/></button>{mobile&&<div className="sidebar-overlay" onClick={()=>setMobile(false)}/>}<aside className={'sidebar '+(mobile?'mobile-open':'')}><div className="brand-logo"><span className="mark">SML</span><span>Stockbrokers Malawi</span><button className="mobile-close" onClick={()=>setMobile(false)} aria-label="Close menu"><X size={20}/></button></div><nav className="sidebar-nav">{items.map(([to,text])=><NavLink key={to} to={'/app/'+to} className={({isActive})=>isActive?'active':''}>{text}</NavLink>)}</nav><div className="sidebar-footer"><div className="sidebar-user"><div className="avatar">{user?.fullname?.slice(0,1)?.toUpperCase()||'U'}</div><div><div className="name">{user?.fullname||'User'}</div><div className="role">{user?.role||'Investor'}</div></div></div><button className="logout-btn" onClick={()=>{logout();navigate('/login')}}>Log out</button></div></aside><main className="main-content"><Outlet/></main></div>}
export function RequireAuth({children}) {const {user}=useAuth();return user?children:<Navigate to="/login" replace/>}
