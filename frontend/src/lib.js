const BASE = import.meta.env.VITE_API_URL || '/api';
export const api = async (route, opts = {}) => {
  const token = localStorage.getItem('sml-token');
  const headers = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  let response;
  try { response = await fetch(`${BASE}${route}`, { ...opts, headers }); }
  catch { throw new Error('Could not reach the server. Check that the Express backend is running.'); }
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) data = await response.json();
  else data = await response.text();
  if (!response.ok) throw new Error(data?.message || `Request failed (${response.status})`);
  return data;
};
export const send = (path, body, method = 'POST') => api(path, { method, body: body instanceof FormData ? body : JSON.stringify(body) });
export const money = n => 'MWK ' + Number(n || 0).toLocaleString('en-MW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const num = n => Number(n || 0).toLocaleString('en-MW');
export const date = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short',year:'numeric' }) : '—';
export const label = key => String(key || '').replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase());
export const download = async (path, filename) => {
  const token = localStorage.getItem('sml-token');
  const response = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) {let m; try {m=(await response.json()).message}catch{} throw new Error(m || 'Could not open file');}
  const url = URL.createObjectURL(await response.blob());
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
};
