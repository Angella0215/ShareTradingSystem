import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Wallet, ChartPie, ClipboardList, Landmark, PlusCircle, Download, Send, ArrowRight, BarChart3, Building2, ShieldCheck, ExternalLink } from 'lucide-react';
import { api, send, money, num, date, label, download } from '../lib';
import { Page, Card, Button, Notice, Table, Stat, Status, Field, Empty, useResource, Remote, useAuth } from '../components';

function useOperation() {const [feedback,setFeedback]=useState(''),[failed,setFailed]=useState(false),[working,setWorking]=useState(false);return {feedback,failed,working,async run(task,onSuccess){setFeedback('');setWorking(true);try{const data=await task();setFeedback(data?.message||'Saved successfully.');setFailed(false);onSuccess?.(data)}catch(e){setFeedback(e.message);setFailed(true)}finally{setWorking(false)}},note:<Notice text={feedback} error={failed} onDismiss={()=>setFeedback('')}/>}}
const MSE_URL = 'https://mse.co.mw';
const COL=[['company_name','Company'],['ticker','Ticker'],['current_price','Current price','money'],['sector','Sector'],['available_shares','Available shares','num']];
export function Dashboard(){const {user}=useAuth(),account=useResource('/investors/me'),positions=account.data?.portfolio||[],status=account.data?.account_status||'Not opened';return <Page title={`Welcome back${user?.fullname?' '+user.fullname.split(' ')[0]:''}`} subtitle="Here's an overview of your account." action={<Status value={status}/> }><div className="stat-cards"><Stat label="Portfolio holdings" value={num(positions.reduce((total,p)=>total+Number(p.shares_owned||0),0))}/><Stat label="Companies invested in" value={positions.length}/><Stat label="Account status" value={label(status)}/></div>{account.error?.includes('No account application')&&<div className="banner"><strong>Open your trading account</strong><p>Submit your account-opening details and documents to request broker verification.</p><Link to="/app/account" className="btn btn-primary">Start application <ArrowRight size={16}/></Link></div>}<Card title="Your portfolio" action={<Link to="/app/portfolio" className="btn btn-outline btn-sm">View all</Link>}><Remote state={account}>{data=><Table rows={data?.portfolio||[]} columns={ [['company_name','Company'],['ticker','Ticker'],['shares_owned','Shares','num'],['current_price','Price per share','money']] }/>}</Remote></Card></Page>}

export function Market(){const state=useResource('/companies'),[selected,setSelected]=useState(null);const history=useResource(selected?`/companies/${selected.company_id}/history`:'/companies');const navigate=useNavigate();const prices=selected&&(history.data||[]),n=prices?.length||0;const max=prices?Math.max(1,...prices.map(v=>Number(v.price))):1;const min=prices?Math.min(...prices.map(v=>Number(v.price))):0;const coords=prices?.map((p,i)=>`${(i/(n-1||1))*650},${180-((Number(p.price)-min)/(max-min||1))*160}`).join(' ');return <Page title="MSE Companies" subtitle="Browse the latest recorded company prices. Data is historical/demo information, not a live exchange feed." action={<a className="btn btn-outline" href={MSE_URL} target="_blank" rel="noopener noreferrer">View live prices on the MSE <ExternalLink size={16}/></a>}><Card title="Listed securities"><Remote state={state}>{data=><Table rows={data||[]} columns={COL} actions={row=><div className="button-group"><Button kind="outline sm" onClick={()=>setSelected(row)}>History</Button><Button kind="ghost sm" onClick={()=>navigate('/app/buy?company='+row.company_id)}>Buy</Button></div>}/>}</Remote></Card>{selected&&<Card title={`${selected.ticker} — historical prices`} action={<Button kind="outline sm" onClick={()=>setSelected(null)}>Close</Button>}><Remote state={history}>{data=><>{data?.length?<><div className="line-chart"><svg viewBox="0 0 660 200" preserveAspectRatio="none" role="img" aria-label="Historical price trend"><line x1="0" y1="180" x2="660" y2="180" stroke="#dce4ec"/><polyline points={coords} stroke="#b88c42" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round"/></svg></div><p className="hint">{n} price records • Low {money(min)} • High {money(max)}</p></>:<Empty text="No historical price records."/>}</>}</Remote></Card>}</Page>}

const core = [
 ['firstname',true],['surname',true],['other_names'],['date_of_birth',false,'date'],['gender',true,'select',[['male','Male'],['female','Female'],['other','Other']]],['marital_status'],['spouse_full_name'],
 ['phone_number',true,'tel'],['national_id_number',true],['id_expiry_date',false,'date'],['nationality'],['foreign_local',false,'select',[['local','Local'],['foreign','Foreign']]],['residential_permit_type'],
 ['physical_address',true],['postal_address'],['house_number'],['home_village'],['ta'],['district'],['directions',false,'textarea'],['meter_number',true],
 ['next_of_kin_name',true],['next_of_kin_phone',true,'tel'],['next_of_kin_email',false,'email'],['next_of_kin_relationship'],
 ['employment_status',true,'select',[['employed','Employed'],['self_employed','Self-employed'],['not_employed','Not employed']]],['employer_name'],['designation'],['employer_address'],['years_self_employed',false,'number'],['business_type'],['source_of_income'],
 ['expected_monthly_income',false,'select',[['below_300k','Below MWK 300,000'],['300k_to_5m','MWK 300,000 – 5 million'],['above_5m','Over MWK 5 million']]],
 ['bank_name',true],['bank_branch'],['bank_account_type'],['bank_account_number',true],['proof_of_residence_type',false,'select',[['escom','ESCOM'],['water_board','Water Board'],['mtl','MTL'],['city_ground_rates','City ground rates'],['mhc_invoice','MHC invoice'],['other','Other']]],['account_type',false,'select',[['equity_trading','Equity trading'],['money_market','Money market']]]
];
const groups=[
 ['A. Nature of account',[38]],
 ['B. Personal details',[0,1,2,3,4,5,6,10,11,12]],
 ['C. Contact details',[7,13,14,15,16,17,18,19,20]],
 ['D. Next of kin',[21,22,23,24]],
 ['E. Occupation',[25,26,27,28,29,30,31]],
 ['F. Identification',[8,9]],
 ['G. Expected income & banking details',[32,33,34,35,36]],
 ['H. Proof of residence',[37]]
];
export function Account(){const {user}=useAuth(),account=useResource('/investors/me'),ops=useOperation(),[values,setValues]=useState({nationality:'Malawian',foreign_local:'local',account_type:'equity_trading'}),[files,setFiles]=useState({});const active=account.data;const change=(name,val)=>setValues(s=>({...s,[name]:val}));return <Page title="My Account" subtitle="Know-your-customer (KYC) registration and application status.">{active?<><div className="stats-grid"><Stat label="Application ID" value={'#'+active.investor_id}/><Stat label="Application status" value={label(active.account_status)}/><Stat label="Account holder" value={active.firstname+' '+active.surname}/></div><Card title="Account review"><p>Your account application is <Status value={active.account_status}/>. Only verified investors can submit share orders.</p></Card></>:<><div className="banner"><strong>Account opening application</strong><p>Every field marked * is required. Attach three PDF documents, each 5 MB or smaller. Investor access must be approved before trading.</p></div><form onSubmit={e=>{e.preventDefault();const fd=new FormData();fd.append('user_id',user.user_id);Object.entries(values).forEach(([k,v])=>v!==''&&v!=null&&fd.append(k,v));Object.entries(files).forEach(([k,v])=>v&&fd.append(k,v));ops.run(()=>send('/investors/open-account',fd),()=>account.reload())}}>{groups.map(([title,indices])=><Card title={title} key={title}><div className="form-grid">{indices.map(index=>core[index]).filter(([name])=>name!=='residential_permit_type'||values.foreign_local==='foreign').filter(([name])=>!['employer_name','designation','employer_address'].includes(name)||values.employment_status==='employed').filter(([name])=>!['business_type','years_self_employed'].includes(name)||values.employment_status==='self_employed').filter(([name])=>name!=='source_of_income'||values.employment_status==='not_employed').map(([name,required,type,options])=><Field key={name} name={name} type={type||'text'} options={options} required={!!required} value={values[name]||''} onChange={v=>change(name,v)}/>)}</div></Card>)}<Card title="Supporting documents" subtitle="The document files are stored on the private server and can be opened by authorized staff."><div className="form-grid">{[['utility_receipt','Utility receipt / proof of address'],['bank_statement','Recent bank statement'],['id_document','National ID / passport']].map(([name,caption])=><Field key={name} label={caption} name={name} type="file" accept="application/pdf,.pdf" required onChange={f=>setFiles(s=>({...s,[name]:f}))}/>)}</div>{ops.note}<div className="form-actions"><Button type="submit" kind="primary" disabled={ops.working}>{ops.working?'Submitting…':'Submit application'}</Button></div></Card></form></>}</Page>}

export function PlaceOrder({ side }) {
  const { user } = useAuth();
  const companies = useResource('/companies');
  const account = useResource('/investors/me');
  const ops = useOperation();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    company_id: new URLSearchParams(window.location.search).get('company') || '',
    amount: '',
    quantity: ''
  });
  const [proof, setProof] = useState(null);

  // Shares the investor owns, keyed by ticker
  const owned = {};
  (account.data?.portfolio || []).forEach(p => {
    owned[p.ticker] = (owned[p.ticker] || 0) + Number(p.shares_owned || 0);
  });

  const allCompanies = companies.data || [];
  // Selling: only companies the investor holds. Buying: all companies.
  const choices = side === 'sell' ? allCompanies.filter(c => (owned[c.ticker] || 0) > 0) : allCompanies;
  const selected = choices.find(c => String(c.company_id) === String(values.company_id));
  const available = Number(selected?.available_shares || 0);
  const held = selected ? (owned[selected.ticker] || 0) : 0;
  const soldOut = side === 'buy' && !!selected && available <= 0;
  const tooMany = side === 'sell' && !!selected && Number(values.quantity || 0) > held;

  const options = choices.map(c => [
    c.company_id,
    side === 'buy'
      ? `${c.ticker} — ${c.company_name} (${Number(c.available_shares) > 0 ? num(c.available_shares) + ' available' : 'Sold out'})`
      : `${c.ticker} — ${c.company_name} (you own ${num(owned[c.ticker])})`
  ]);

  const row = (k, v) => (
    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid #e5ebf2' }}>
      <span style={{ color: '#5b6b7c' }}>{k}</span>
      <strong style={{ textAlign: 'right' }}>{v}</strong>
    </div>
  );

  const submit = e => {
    e.preventDefault();
    const payload = { investor_id: account.data?.investor_id, company_id: Number(values.company_id) };
    if (side === 'buy') {
      const form = new FormData();
      form.append('investor_id', payload.investor_id);
      form.append('company_id', payload.company_id);
      form.append('amount', values.amount);
      if (proof) form.append('proof_of_payment', proof);
      ops.run(() => send('/orders/buy', form), () => navigate('/app/orders'));
    } else {
      ops.run(() => send('/orders/sell', { ...payload, quantity: Number(values.quantity) }), () => navigate('/app/orders'));
    }
  };

  return (
    <Page title={side === 'buy' ? 'Buy Shares' : 'Sell Shares'} subtitle="Submit an order for broker review. The price and final settlement amounts are determined when the order is approved.">
      <div className="two-cols">
        <Card title={side === 'buy' ? 'New buy order' : 'New sell order'} subtitle="Approval requires two separate brokers.">
          <form onSubmit={submit}>
            <Field name="company_id" label="Company" required options={options} value={values.company_id}
              onChange={v => setValues(s => ({ ...s, company_id: v }))} />
            {side === 'sell' && !companies.loading && !account.loading && choices.length === 0 &&
              <p className="hint">You don't hold any shares yet, so there is nothing to sell.</p>}
            {soldOut && <p className="hint" style={{ color: '#b42318' }}>This company is sold out. No shares are available to buy right now.</p>}
            {side === 'buy' ? (
              <>
                <Field name="amount" label="Amount deposited (MWK)" type="number" min="1" step="0.01" required value={values.amount}
                  onChange={v => setValues(s => ({ ...s, amount: v }))} />
                <Field name="proof" label="Proof of payment" type="file" accept="application/pdf,image/jpeg,image/png" required onChange={setProof} />
              </>
            ) : (
              <>
                <Field name="quantity" label="Number of shares" type="number" min="1" max={held || undefined} step="1" required value={values.quantity}
                  onChange={v => setValues(s => ({ ...s, quantity: v }))} />
                {tooMany && <p className="hint" style={{ color: '#b42318' }}>You only own {num(held)} shares of this company.</p>}
              </>
            )}
            <div className="form-actions">
              {ops.note}
              <Button kind="primary" type="submit"
                disabled={ops.working || account.data?.account_status !== 'verified' || soldOut || tooMany || (side === 'sell' && !selected)}>
                {ops.working ? 'Submitting…' : `Submit ${side} order`}
              </Button>
              {account.data?.account_status !== 'verified' &&
                <p className="hint">A verified trading account is required. <Link to="/app/account">Review account</Link></p>}
            </div>
          </form>
        </Card>

        <Card title="Order summary" subtitle="An estimate only — final execution is determined by a broker.">
          <div>
            {row('Company', selected?.company_name || 'Choose a company')}
            {row('Last recorded price', money(selected?.current_price))}
            {side === 'buy'
              ? row('Shares available', selected ? (available > 0 ? num(available) : 'Sold out') : '—')
              : row('Shares you own', selected ? num(held) : '—')}
            {side === 'sell' && row('Estimated share value', money(Number(values.quantity || 0) * Number(selected?.current_price || 0)))}
          </div>
          <p className="hint">This prototype does not connect to the Malawi Stock Exchange trading engine or payment gateways. Do not submit real funds.</p>
        </Card>
      </div>
    </Page>
  );
}
export function Portfolio(){const account=useResource('/investors/me'),positions=account.data?.portfolio||[];return <Page title="My Portfolio" subtitle="Holdings calculated from approved transactions."><div className="stats-grid"><Stat label="Companies held" value={positions.length} icon={Building2}/><Stat label="Shares held" value={num(positions.reduce((n,r)=>n+Number(r.shares_owned),0))} icon={ChartPie}/><Stat label="Indicative value" value={money(positions.reduce((n,r)=>n+Number(r.current_price)*Number(r.shares_owned),0))} icon={Wallet}/></div><Card title="Shareholding positions"><Remote state={account}>{data=><Table rows={data?.portfolio||[]} columns={ [['company_name','Company'],['ticker','Ticker'],['shares_owned','Shares','num'],['current_price','Recorded price','money'],['first_bought','First buy','date'],['last_bought','Last buy','date']] }/>}</Remote></Card></Page>}
export function Orders(){const state=useResource('/orders/my-orders'),ops=useOperation();return <Page title="Order History" subtitle="Track broker approvals and cancel orders before first approval." action={<Link className="btn primary" to="/app/buy"><PlusCircle size={17}/> New buy order</Link>}>{ops.note}<Card title="Buy and sell requests"><Remote state={state}>{data=><Table rows={data||[]} columns={ [['created_at','Placed','date'],['company_name','Company'],['type','Side'],['amount_deposited','Deposit','money'],['quantity','Quantity','num'],['status','Status','status'],['expiry_date','Expires','date']] } actions={r=>r.status==='pending'?<Button kind="danger sm" disabled={ops.working} onClick={()=>{if(window.confirm('Cancel this order?'))ops.run(()=>send(`/orders/${r.type}/${r.id}/cancel`,{},'PUT'),state.reload)}}>Cancel</Button>:'—'}/>}</Remote></Card></Page>}
function dealNoteHtml(v) {
  const sell = v.type === 'sell';
  const title = sell ? 'Sale Note' : 'Deal Note';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const lines = [
    ['Company', `${v.company_name || ''}${v.ticker ? ' (' + v.ticker + ')' : ''}`],
    ['Transaction', sell ? 'Sale of shares' : 'Purchase of shares'],
    ['Number of shares', num(v.quantity)],
    ['Price per share', money(v.price)],
    ['Gross value', money(v.gross_value)],
    ...(v.commission != null ? [['Commission', money(v.commission)]] : []),
    ...(v.vat != null ? [['VAT on commission', money(v.vat)]] : []),
    ...(v.total_amount != null ? [[sell ? 'Net proceeds' : 'Total amount', money(v.total_amount)]] : []),
    ['Trade date', date(v.transaction_date)],
    ['Settlement date', date(v.settlement_date)]
  ];
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title} ${esc(v.deal_note_number)}</title>
<style>
  body{margin:0;background:#eaf0f7;font-family:system-ui,Segoe UI,Arial,sans-serif;color:#0b2540}
  .sheet{max-width:720px;margin:32px auto;background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(11,37,64,.12);overflow:hidden}
  .head{background:#0b2540;color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;gap:16px}
  .head h1{margin:0;font-size:22px}.head small{color:#b9c7d8}
  .badge{background:#b88c42;color:#fff;padding:6px 14px;border-radius:999px;font-weight:700;font-size:13px;letter-spacing:.5px;text-transform:uppercase}
  .body{padding:28px 32px}
  .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:22px}
  .meta div{font-size:13px;color:#5b6b7c}.meta strong{display:block;font-size:16px;color:#0b2540;margin-top:2px}
  table{width:100%;border-collapse:collapse}
  td{padding:12px 4px;border-bottom:1px solid #e5ebf2;font-size:15px}
  td:first-child{color:#5b6b7c}td:last-child{text-align:right;font-weight:600}
  .foot{padding:18px 32px;background:#f5f8fb;font-size:12px;color:#5b6b7c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  button{background:#1d4f91;color:#fff;border:0;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer}
  @media print{body{background:#fff}.sheet{box-shadow:none;margin:0}button{display:none}}
</style></head><body><div class="sheet">
  <div class="head"><div><h1>Stockbrokers Malawi Limited</h1><small>${title}</small></div><span class="badge">${title}</span></div>
  <div class="body">
    <div class="meta">
      <div>${title} number<strong>${esc(v.deal_note_number)}</strong></div>
      <div>Client<strong>${esc(v.investor_name)}</strong></div>
      <div>Broker<strong>${esc(v.broker || 'Stockbrokers Malawi Limited')}</strong></div>
    </div>
    <table>${lines.map(([k, val]) => `<tr><td>${esc(k)}</td><td>${esc(val)}</td></tr>`).join('')}</table>
  </div>
  <div class="foot"><span>This document is generated from the SML share trading system.</span><button onclick="window.print()">Print / Save as PDF</button></div>
</div></body></html>`;
}

export function Transactions(){const state=useResource('/orders/my-transactions'),ops=useOperation();return <Page title="Transactions & deal notes" subtitle="Deal notes and transactions that reached final broker approval.">{ops.note}<Card title="Completed transactions"><Remote state={state}>{data=><Table rows={data||[]} columns={ [['transaction_date','Date','date'],['company_name','Company'],['ticker','Ticker'],['type','Side'],['quantity','Shares','num'],['price','Price per share','money'],['settlement_date','Settlement','date']] } actions={r=><Button kind="outline sm" onClick={()=>{const win=window.open('','_blank');ops.run(async()=>{try{const v=await api(`/orders/deal-note/${r.transaction_id}`);if(win){win.document.write(dealNoteHtml(v));win.document.close()}return {message:(v.type==='sell'?'Sale note':'Deal note')+' opened'}}catch(e){if(win)win.close();throw e}})}}>{r.type==='sell'?'Sale note':'Deal note'}</Button>}/>}</Remote></Card></Page>}
export function Statements(){const ops=useOperation();const handle=(route,name)=>ops.run(()=>download('/statements/'+route,name).then(()=>({message:'Download started.'})));return <Page title="PDF statements" subtitle="Generate shareholding, transaction and sale-note reports."><div className="card-grid"><Card title="Shareholding statement" subtitle="Current company holdings and their recorded valuations."><Button kind="primary" onClick={()=>handle('shareholding','SML-Shareholding.pdf')}><Download size={17}/> Download PDF</Button></Card><Card title="Transaction statement" subtitle="Your completed share transaction history."><Button kind="primary" onClick={()=>handle('transactions','SML-Transactions.pdf')}><Download size={17}/> Download PDF</Button></Card></div><SaleNoteDownload run={handle}/>{ops.note}</Page>}
function SaleNoteDownload({run}){const orders=useResource('/orders/my-orders');const [id,setId]=useState('');return <Card title="Share sale note" subtitle="Select a completed sell order to download its sale note."><div className="inline-form"><Field name="order" label="Approved sell order" value={id} options={(orders.data||[]).filter(o=>o.type==='sell'&&o.status==='approved').map(o=>[o.id,`#${o.id} ${o.company_name}`])} onChange={setId}/><Button kind="outline" disabled={!id} onClick={()=>run('sale-note/'+id,`SML-Sale-${id}.pdf`)}><Download size={17}/> Download</Button></div></Card>}
export function MyDividends(){const state=useResource('/dividends/my');return <Page title="Dividends" subtitle="View dividends declared and approved for shares held on their record dates."><Card title="Dividend entitlements"><Remote state={state}>{data=><Table rows={data||[]} columns={ [['company_name','Company'],['ticker','Ticker'],['record_date','Record date','date'],['payment_date','Payment date','date'],['shares_held','Eligible shares','num'],['gross_amount','Gross','money'],['tax_amount','Withholding tax','money'],['net_amount','Net payable','money'],['dividend_status','Status','status']] }/>}</Remote></Card></Page>}
export function Messages(){const {user}=useAuth(),isInvestor=user.role==='investor';const others=useResource(isInvestor?'/brokers':'/investors-list'),[partner,setPartner]=useState(''),[text,setText]=useState(''),conversation=useResource(partner?`/messages/${partner}`:'/messages/unread-count'),ops=useOperation();const options=(others.data||[]).map(o=>[o.user_id,o.fullname]);return <Page title="Messages" subtitle={isInvestor?'Communicate with an SML broker.':'Communicate with investors.'}><div className="two-cols messages-layout"><Card title="Contacts"><Field name="partner" label="Select contact" options={options} value={partner} onChange={setPartner}/><p className="hint">All messages are retained in the application database.</p></Card><Card title="Conversation"><div className="chat-history">{partner?<Remote state={conversation}>{data=>data?.length?data.map(m=><div className={'chat-bubble '+(Number(m.sender)===Number(user.user_id)?'mine':'')} key={m.message_id}><strong>{m.sender_name}</strong><p>{m.message}</p><small>{date(m.date)}</small></div>):<Empty text="No messages yet. Start the conversation below."/>}</Remote>:<Empty text="Choose a contact to view messages."/>}</div><form onSubmit={e=>{e.preventDefault();ops.run(()=>send('/messages',{receiver:Number(partner),message:text}),()=>{setText('');conversation.reload()})}}><Field type="textarea" name="message" label="Your message" value={text} onChange={setText}/>{ops.note}<Button kind="primary" type="submit" disabled={!partner||!text.trim()||ops.working}><Send size={17}/> Send message</Button></form></Card></div></Page>}
