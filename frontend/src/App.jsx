import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext, PublicLayout, AppLayout, RequireAuth } from './components';
import { StaticPage, AuthPage } from './pages/Public';
import * as Investor from './pages/Investor';
import * as Broker from './pages/Broker';
import * as Admin from './pages/Admin';
function RolePage({route}) {
  const {user}=React.useContext(AuthContext);
  const views={
    investor:{dashboard:Investor.Dashboard,account:Investor.Account,market:Investor.Market,buy:()=> <Investor.PlaceOrder side="buy"/>,sell:()=> <Investor.PlaceOrder side="sell"/>,portfolio:Investor.Portfolio,orders:Investor.Orders,transactions:Investor.Transactions,statements:Investor.Statements,dividends:Investor.MyDividends,messages:Investor.Messages},
    broker:{dashboard:Broker.BrokerDashboard,accounts:Broker.BrokerAccounts,orders:Broker.BrokerOrders,history:Broker.BrokerHistory,dividends:Broker.BrokerDividends,messages:Broker.Messages},
    admin:{dashboard:Admin.AdminDashboard,users:Admin.AdminUsers,companies:Admin.AdminCompanies,dividends:Admin.AdminDividends,audit:Admin.Audit}
  };
  const View=views[user?.role]?.[route];return View?<View/>:<Navigate to="/app/dashboard" replace/>;
}
function Screen(){const route=useLocation().pathname.split('/')[2]||'dashboard';return <RolePage route={route}/>}
export default function App(){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('sml-user')||'null')}catch{return null}});
 const login=data=>{localStorage.setItem('sml-token',data.token);localStorage.setItem('sml-user',JSON.stringify(data.user));setUser(data.user)};
 const logout=()=>{localStorage.removeItem('sml-token');localStorage.removeItem('sml-user');setUser(null)};
 return <AuthContext.Provider value={{user,login,logout}}><Routes><Route element={<PublicLayout/>}><Route path="/" element={<AuthPage mode="login"/>}/><Route path="/login" element={<AuthPage mode="login"/>}/><Route path="about" element={<StaticPage kind="about"/>}/><Route path="services" element={<StaticPage kind="services"/>}/><Route path="contact" element={<StaticPage kind="contact"/>}/><Route path="register" element={<AuthPage mode="register"/>}/><Route path="forgot-password" element={<AuthPage mode="forgot"/>}/><Route path="reset-password" element={<AuthPage mode="reset"/>}/></Route><Route path="app" element={<RequireAuth><AppLayout/></RequireAuth>}><Route index element={<Navigate to="dashboard" replace/>}/><Route path=":section" element={<Screen/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AuthContext.Provider>
}
