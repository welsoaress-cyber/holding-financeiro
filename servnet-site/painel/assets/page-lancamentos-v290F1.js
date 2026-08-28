import{j as sb,s as store,t as toast,r as router}from"./page-dashboard-Dbqm2OjXb.js";

// ── IDs / Auth ──────────────────────────────────────────────────────────────
const B=()=>crypto.randomUUID();
let _uid=null;
async function uid(){return _uid??(_uid=(await sb.auth.getUser()).data?.user?.id)}

// ── Module state ────────────────────────────────────────────────────────────
let _tab='resumo';
let _mes=new Date().toISOString().slice(0,7);
let _ct=null;
let _contas=[],_cats=[],_subcats=[],_cartoes=[],_loaded=false;

// ── fin_* CRUD ───────────────────────────────────────────────────────────────
async function fGet(t,opts={}){
  const u=await uid();
  let q=sb.from(t).select('*').eq('user_id',u).is('deleted_at',null);
  if(opts.eq)for(const[k,v]of Object.entries(opts.eq))q=q.eq(k,v);
  if(opts.gte)q=q.gte(opts.gte[0],opts.gte[1]);
  if(opts.lte)q=q.lte(opts.lte[0],opts.lte[1]);
  q=q.order(opts.order||'created_at',{ascending:opts.asc??false});
  const{data,error}=await q;if(error)throw error;return data||[];
}
async function fSave(t,item){
  const u=await uid(),now=new Date().toISOString();
  const row={...item,user_id:u,updated_at:now};
  if(!row.id){row.id=B();row.created_at=now;}
  const{error}=await sb.from(t).upsert(row,{onConflict:'id'});
  if(error)throw error;return row;
}
async function fDel(t,id){
  const u=await uid();
  const{error}=await sb.from(t).update({deleted_at:new Date().toISOString()}).eq('id',id).eq('user_id',u);
  if(error)throw error;
}
// fSaveValor: upsert seguro para fin_*_fixas_valor (UNIQUE fixa+mes)
// Se valorId conhecido → atualiza; caso contrário busca o registro existente primeiro
async function fSaveValor(tabela,fixaKey,fixaId,mesRef,valorId,fields){
  const u=await uid();
  let id=valorId&&valorId!=='undefined'?valorId:null;
  if(!id){
    const{data}=await sb.from(tabela).select('id').eq('user_id',u).eq(fixaKey,fixaId).eq('mes_ref',mesRef).is('deleted_at',null).maybeSingle();
    id=data?.id||null;
  }
  return fSave(tabela,{id:id||undefined,[fixaKey]:fixaId,mes_ref:mesRef,...fields});
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const MESES=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_PT=['Janeiro','Fevereiro','ço','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const fmtN=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const fmt=v=>fmtN.format(Number(v)||0);
const fmtDt=d=>{if(!d)return'—';const[y,m,di]=d.slice(0,10).split('-');return`${di}/${m}/${y}`};
function addMes(m,n){const[y,mo]=m.split('-').map(Number);const d=new Date(y,mo-1+n,1);return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function ptMes(m){const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];const[y,mo]=m.split('-').map(Number);return`${meses[mo-1]} ${y}`}
function nomeC(id){return _contas.find(c=>c.id===id)?.nome||'—'}
function nomeCat(id){return _cats.find(c=>c.id===id)?.nome||''}
function escHTML(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

// ── Load lookups ─────────────────────────────────────────────────────────────
async function loadLookups(force=false){
  if(_loaded&&!force)return;
  [_contas,_cats,_subcats,_cartoes]=await Promise.all([
    fGet('fin_contas',{order:'nome',asc:true}),
    fGet('fin_categorias',{order:'nome',asc:true}),
    fGet('fin_subcategorias',{order:'nome',asc:true}),
    fGet('fin_cartoes',{order:'nome',asc:true}),
  ]);
  _loaded=true;
}

// ── Saldo das contas ──────────────────────────────────────────────────────────
async function calcSaldos(){
  const u=await uid();
  const[dp,rr,tr,dfv,rfv,fixasDesp,fixasRec]=await Promise.all([
    sb.from('fin_despesas').select('id_conta,valor').eq('user_id',u).eq('status','pago').is('deleted_at',null),
    sb.from('fin_receitas').select('id_conta,valor').eq('user_id',u).eq('status','recebido').is('deleted_at',null),
    sb.from('fin_transferencias').select('id_conta_origem,id_conta_destino,valor').eq('user_id',u).is('deleted_at',null),
    sb.from('fin_despesas_fixas_valor').select('id_despesa_fixa,valor').eq('user_id',u).eq('status','pago').is('deleted_at',null),
    sb.from('fin_receitas_fixas_valor').select('id_receita_fixa,valor').eq('user_id',u).eq('status','recebido').is('deleted_at',null),
    sb.from('fin_despesas_fixas').select('id,id_conta').eq('user_id',u).is('deleted_at',null),
    sb.from('fin_receitas_fixas').select('id,id_conta').eq('user_id',u).is('deleted_at',null),
  ]);
  const contaDF={};
  for(const f of fixasDesp.data||[])contaDF['d'+f.id]=f.id_conta;
  for(const f of fixasRec.data||[])contaDF['r'+f.id]=f.id_conta;
  const saldos={};
  for(const c of _contas)saldos[c.id]=Number(c.saldo_inicial)||0;
  for(const r of rr.data||[])if(r.id_conta&&saldos[r.id_conta]!==undefined)saldos[r.id_conta]+=Number(r.valor)||0;
  for(const d of dp.data||[])if(d.id_conta&&saldos[d.id_conta]!==undefined)saldos[d.id_conta]-=Number(d.valor)||0;
  for(const t of tr.data||[]){
    if(t.id_conta_origem&&saldos[t.id_conta_origem]!==undefined)saldos[t.id_conta_origem]-=Number(t.valor)||0;
    if(t.id_conta_destino&&saldos[t.id_conta_destino]!==undefined)saldos[t.id_conta_destino]+=Number(t.valor)||0;
  }
  for(const v of dfv.data||[]){const cid=contaDF['d'+v.id_despesa_fixa];if(cid&&saldos[cid]!==undefined)saldos[cid]-=Number(v.valor)||0;}
  for(const v of rfv.data||[]){const cid=contaDF['r'+v.id_receita_fixa];if(cid&&saldos[cid]!==undefined)saldos[cid]+=Number(v.valor)||0;}
  return saldos;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
let _modal=null;
function openModal(html){
  closeModal();
  _modal=document.createElement('div');
  Object.assign(_modal.style,{position:'fixed',inset:'0',background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:'2000',padding:'16px',overflowY:'auto'});
  _modal.innerHTML=`<div id="fin-modal-box" style="background:#ffffff;border-radius:14px;width:100%;max-width:480px;padding:24px;box-shadow:0 8px 32px rgba(0,0,0,.3);position:relative;max-height:90vh;overflow-y:auto;">${html}</div>`;
  let _mdDown=false;
  _modal.addEventListener('mousedown',e=>{_mdDown=e.target===_modal;});
  _modal.addEventListener('click',e=>{if(_mdDown&&e.target===_modal)closeModal();_mdDown=false;});
  document.body.appendChild(_modal);
}
function closeModal(){if(_modal){_modal.remove();_modal=null;}}
function modalHdr(title){return`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="font-size:17px;font-weight:700;margin:0;color:#111">${escHTML(title)}</h2><button onclick="window._finCloseModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666">✕</button></div>`}
window._finCloseModal=closeModal;

// ── Select option helpers ─────────────────────────────────────────────────────
function contaOpts(sel=''){return _contas.map(c=>`<option value="${c.id}"${c.id===sel?' selected':''}>${escHTML(c.nome)}</option>`).join('')}
function catOpts(tipo='',sel=''){return _cats.filter(c=>!tipo||c.tipo===tipo).map(c=>`<option value="${c.id}"${c.id===sel?' selected':''}>${escHTML(c.nome)}</option>`).join('')}

// ── Field style helpers ───────────────────────────────────────────────────────
const fld=`width:100%;padding:9px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;background:#fff;color:#111;margin-top:4px;box-sizing:border-box;`;
const lbl=`display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:2px;margin-top:12px;`;
function row2(a,b){return`<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${a}${b}</div>`}
function actBtn(txt,color){return`style="background:${color};color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:14px;font-weight:700;cursor:pointer;width:100%;margin-top:16px;"`}

// ── KPI card helper ───────────────────────────────────────────────────────────
function kpiCard(label,val,icon,cor,sub=''){return`
<div style="background:var(--bg-card,#fff);border-radius:12px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
  <div style="font-size:20px">${icon}</div>
  <div style="font-size:11px;color:var(--text-2,#888);font-weight:600;margin-top:4px">${label}</div>
  <div style="font-size:17px;font-weight:700;color:${cor};margin-top:2px">${fmt(val)}</div>
  ${sub?`<div style="font-size:10px;color:var(--text-2,#aaa);margin-top:2px">${sub}</div>`:''}
</div>`}

// ── Nav mes bar ───────────────────────────────────────────────────────────────
function navMes(){return`<div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:14px;">
  <button onclick="window._finNav(-1)" style="background:none;border:1px solid var(--border,#ddd);border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;color:var(--text-1,#111)">◄</button>
  <span style="font-size:15px;font-weight:700;color:var(--text-1,#111);min-width:150px;text-align:center">${ptMes(_mes)}</span>
  <button onclick="window._finNav(1)" style="background:none;border:1px solid var(--border,#ddd);border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:14px;color:var(--text-1,#111)">►</button>
</div>`}
window._finNav=function(n){_mes=addMes(_mes,n);renderTab(_ct);}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: RESUMO
// ══════════════════════════════════════════════════════════════════════════════
async function renderResumo(el){
  el.innerHTML=`<div style="padding:16px;text-align:center;color:var(--text-2,#666)">Carregando...</div>`;
  try{
    await loadLookups();
    const m0=_mes+'-01',m1=_mes+'-31',u=await uid();
    const[desp,rec,dFix,dFixV,rFix,rFixV]=await Promise.all([
      fGet('fin_despesas',{gte:['data_vencimento',m0],lte:['data_vencimento',m1]}),
      fGet('fin_receitas',{gte:['data_previsao',m0],lte:['data_previsao',m1]}),
      fGet('fin_despesas_fixas',{eq:{ativo:true}}),
      fGet('fin_despesas_fixas_valor',{eq:{mes_ref:_mes}}),
      fGet('fin_receitas_fixas',{eq:{ativo:true}}),
      fGet('fin_receitas_fixas_valor',{eq:{mes_ref:_mes}}),
    ]);
    const fixaD=dFix.map(f=>{const v=dFixV.find(x=>x.id_despesa_fixa===f.id);if(v?.excluido_mes)return null;return{descricao:f.descricao,valor:v?.valor??f.valor,status:v?.status||'pendente',data_vencimento:`${_mes}-${String(f.dia_vencimento||1).padStart(2,'0')}`,id_categoria:f.id_categoria};}).filter(Boolean);
    const fixaR=rFix.map(f=>{const v=rFixV.find(x=>x.id_receita_fixa===f.id);if(v?.excluido_mes)return null;return{descricao:f.descricao,valor:v?.valor??f.valor,status:v?.status||'pendente',data_previsao:`${_mes}-${String(f.dia_recebimento||1).padStart(2,'0')}`,id_categoria:f.id_categoria};}).filter(Boolean);
    const allD=[...desp,...fixaD],allR=[...rec,...fixaR];
    const totD=allD.reduce((s,d)=>s+(Number(d.valor)||0),0);
    const totR=allR.reduce((s,r)=>s+(Number(r.valor)||0),0);
    const pagD=allD.filter(d=>d.status==='pago').reduce((s,d)=>s+(Number(d.valor)||0),0);
    const recR=allR.filter(r=>r.status==='recebido').reduce((s,r)=>s+(Number(r.valor)||0),0);
    const saldoMes=recR-pagD;
    const saldos=await calcSaldos();
    const saldoTotal=Object.values(saldos).reduce((s,v)=>s+v,0);
    const recent=[...desp.slice(0,5).map(d=>({...d,_tipo:'despesa',_dt:d.data_vencimento})),...rec.slice(0,5).map(r=>({...r,_tipo:'receita',_dt:r.data_previsao}))].sort((a,b)=>(b._dt||'').localeCompare(a._dt||'')).slice(0,10);
    el.innerHTML=`
<div style="padding:12px 16px;">
  <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:16px;">
    <button onclick="window._finNav(-1)" style="background:none;border:1px solid var(--border,#ddd);border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:16px;color:var(--text-1,#111)">◄</button>
    <span style="font-size:16px;font-weight:700;color:var(--text-1,#111);min-width:160px;text-align:center">${ptMes(_mes)}</span>
    <button onclick="window._finNav(1)" style="background:none;border:1px solid var(--border,#ddd);border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:16px;color:var(--text-1,#111)">►</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">
    ${kpiCard('Saldo Total',saldoTotal,'🏦',saldoTotal>=0?'#059669':'#dc2626')}
    ${kpiCard('Receitas do mês',totR,'📈','#059669',`Recebido: ${fmt(recR)}`)}
    ${kpiCard('Despesas do mês',totD,'📉','#dc2626',`Pago: ${fmt(pagD)}`)}
    ${kpiCard('Saldo do mês',saldoMes,'⚖️',saldoMes>=0?'#059669':'#dc2626')}
  </div>
  <div style="background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:14px;">
    <h3 style="font-size:14px;font-weight:700;margin:0 0 10px;color:var(--text-1,#111)">Contas</h3>
    ${_contas.filter(c=>c.ativo!==false).map(c=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border,#f3f4f6)">
        <span style="font-size:14px;color:var(--text-1,#111)">${escHTML(c.nome)} <span style="font-size:11px;color:var(--text-2,#888)">${c.tipo||''}</span></span>
        <span style="font-weight:700;color:${(saldos[c.id]||0)>=0?'#059669':'#dc2626'}">${fmt(saldos[c.id]||0)}</span>
      </div>`).join('')||'<p style="color:var(--text-2,#888);font-size:13px">Nenhuma conta. <a href="#" onclick="window._finTab(\'contas\')" style="color:#2563eb">Cadastrar</a></p>'}
  </div>
  <div style="background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    <h3 style="font-size:14px;font-weight:700;margin:0 0 10px;color:var(--text-1,#111)">Transações do mês</h3>
    ${recent.length?recent.map(t=>`
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border,#f3f4f6)">
        <span style="font-size:18px">${t._tipo==='receita'?'📈':'📉'}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text-1,#111);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(t.descricao||'—')}</div>
          <div style="font-size:11px;color:var(--text-2,#888)">${fmtDt(t._dt)} · ${nomeCat(t.id_categoria)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:${t._tipo==='receita'?'#059669':'#dc2626'}">${t._tipo==='receita'?'+':'-'}${fmt(t.valor)}</div>
          <div style="font-size:11px;color:${t.status==='pago'||t.status==='recebido'?'#059669':'#d97706'}">${t.status==='recebido'?'Recebido':t.status==='pago'?'Pago':'Pendente'}</div>
        </div>
      </div>`).join(''):'<p style="color:var(--text-2,#888);font-size:13px;text-align:center;padding:20px 0">Nenhuma transação este mês.</p>'}
  </div>
</div>`;
  }catch(e){console.error(e);el.innerHTML=`<div style="padding:20px;color:#dc2626">Erro: ${e.message}</div>`;}
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: DESPESAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderDespesas(el){
  el.innerHTML=`<div style="padding:16px;text-align:center;color:var(--text-2,#666)">Carregando...</div>`;
  try{
    await loadLookups();
    const m0=_mes+'-01',m1=_mes+'-31';
    const[desp,dFix,dFixV]=await Promise.all([
      fGet('fin_despesas',{gte:['data_vencimento',m0],lte:['data_vencimento',m1]}),
      fGet('fin_despesas_fixas',{eq:{ativo:true}}),
      fGet('fin_despesas_fixas_valor',{eq:{mes_ref:_mes}}),
    ]);
    const fixaMes=dFix.map(f=>{const v=dFixV.find(x=>x.id_despesa_fixa===f.id);if(v?.excluido_mes)return null;return{id:v?.id||('fix-'+f.id),descricao:f.descricao,valor:v?.valor??f.valor,status:v?.status||'pendente',data_vencimento:`${_mes}-${String(f.dia_vencimento||1).padStart(2,'0')}`,id_categoria:f.id_categoria,id_conta:f.id_conta,_fixa:true,_fixaId:f.id,_valorId:v?.id};}).filter(Boolean);
    const all=[...desp,...fixaMes].sort((a,b)=>(a.data_vencimento||'').localeCompare(b.data_vencimento||''));
    const total=all.reduce((s,d)=>s+(Number(d.valor)||0),0);
    const pago=all.filter(d=>d.status==='pago').reduce((s,d)=>s+(Number(d.valor)||0),0);
    el.innerHTML=`
<div style="padding:12px 16px;">
  ${navMes()}
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
    <div><span style="font-size:14px;color:var(--text-2,#888)">Total: <strong style="color:var(--text-1,#111)">${fmt(total)}</strong></span> <span style="font-size:13px;color:#059669;margin-left:10px">Pago: ${fmt(pago)}</span> <span style="font-size:13px;color:#d97706;margin-left:8px">A pagar: ${fmt(total-pago)}</span></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button onclick="window._finNovaDespFixa()" style="background:#f3f4f6;color:var(--text-1,#111);border:1px solid var(--border,#ddd);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer">+ Fixa</button>
      <button onclick="window._finNovaDesp()" style="background:#dc2626;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer">+ Despesa</button>
    </div>
  </div>
  ${all.length?all.map(d=>`
  <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border,#f3f4f6)">
    <input type="checkbox" ${d.status==='pago'?'checked':''} onchange="window._finToggleDesp('${d.id}',this.checked,${d._fixa?'true':'false'},'${d._fixaId||''}','${d._valorId||''}','${d.data_vencimento||''}')" style="width:18px;height:18px;accent-color:#059669;cursor:pointer">
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600;color:var(--text-1,#111);text-decoration:${d.status==='pago'?'line-through':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(d.descricao||'—')}${d._fixa?' <span style="font-size:10px;background:#e0f2fe;color:#0284c7;border-radius:4px;padding:1px 5px">FIXA</span>':''}</div>
      <div style="font-size:11px;color:var(--text-2,#888)">${fmtDt(d.data_vencimento)} · ${nomeCat(d.id_categoria)} · ${nomeC(d.id_conta)}</div>
    </div>
    <div style="text-align:right"><div style="font-weight:700;color:#dc2626">${fmt(d.valor)}</div><div style="font-size:11px;color:${d.status==='pago'?'#059669':'#d97706'}">${d.status==='pago'?'Pago':'Pendente'}</div></div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <button onclick="window._finEditDesp('${d.id}',${d._fixa?'true':'false'},'${d._fixaId||''}')" style="background:none;border:1px solid var(--border,#ddd);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:var(--text-1,#111)">✎</button>
      <button onclick="window._finDelDesp('${d.id}',${d._fixa?'true':'false'},'${d._fixaId||''}','${d._valorId||''}')" style="background:none;border:1px solid #fca5a5;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
    </div>
  </div>`).join(''):`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma despesa em ${ptMes(_mes)}.</div>`}
</div>`;
  }catch(e){console.error(e);el.innerHTML=`<div style="padding:20px;color:#dc2626">Erro: ${e.message}</div>`;}
}

window._finToggleDesp=async function(id,pago,isFixa,fixaId,valorId,dataVenc){
  try{
    if(isFixa==='true'||isFixa===true){
      const data_pag=pago?new Date().toISOString().slice(0,10):null;
      await fSaveValor('fin_despesas_fixas_valor','id_despesa_fixa',fixaId,_mes,valorId,{status:pago?'pago':'pendente',data_pagamento:data_pag});
    }else{
      await fSave('fin_despesas',{id,status:pago?'pago':'pendente',data_pagamento:pago?new Date().toISOString().slice(0,10):null});
    }
    toast.ok(pago?'Marcado como pago!':'Desmarcado.');renderTab(_ct);
  }catch(e){toast.err('Erro: '+e.message);}
};

window._finNovaDesp=function(){
  openModal(modalHdr('Nova Despesa')+`
<form onsubmit="window._finSaveDesp(event)">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" placeholder="Ex: Aluguel">
  <label style="${lbl}">Valor *</label><input name="valor" type="number" step="0.01" min="0.01" required style="${fld}" placeholder="0,00">
  ${row2(`<div><label style="${lbl}">Vencimento *</label><input name="data_vencimento" type="date" required style="${fld}" value="${_mes}-01"></div>`,
         `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">-- Nenhuma --</option>${contaOpts()}</select></div>`)}
  ${row2(`<div><label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">-- Nenhuma --</option>${catOpts('despesa')}</select></div>`,
         `<div><label style="${lbl}">Status</label><select name="status" style="${fld}"><option value="pendente">Pendente</option><option value="pago">Pago</option></select></div>`)}
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}" placeholder="Opcional">
  <button type="submit" ${actBtn('Salvar Despesa','#dc2626')}>Salvar Despesa</button>
</form>`);
};
window._finSaveDesp=async function(e){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{await fSave('fin_despesas',{...d,data_pagamento:d.status==='pago'?d.data_vencimento:null});toast.ok('Despesa salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finNovaDespFixa=function(){
  openModal(modalHdr('Nova Despesa Fixa')+`
<form onsubmit="window._finSaveDespFixa(event)">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" placeholder="Ex: Internet">
  <label style="${lbl}">Valor padrão *</label><input name="valor" type="number" step="0.01" min="0.01" required style="${fld}" placeholder="0,00">
  ${row2(`<div><label style="${lbl}">Dia do vencimento</label><input name="dia_vencimento" type="number" min="1" max="31" style="${fld}" value="10"></div>`,
         `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">-- --</option>${contaOpts()}</select></div>`)}
  <label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">-- --</option>${catOpts('despesa')}</select>
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}">
  <button type="submit" ${actBtn('Salvar','#dc2626')}>Salvar Despesa Fixa</button>
</form>`);
};
window._finSaveDespFixa=async function(e){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{await fSave('fin_despesas_fixas',{...d,ativo:true});toast.ok('Despesa fixa salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditDesp=async function(id,isFixa,fixaId){
  try{
    let d;
    if(isFixa==='true'||isFixa===true){d=_contas;const{data}=await sb.from('fin_despesas_fixas').select('*').eq('id',fixaId).single();d=data||{};}
    else{const{data}=await sb.from('fin_despesas').select('*').eq('id',id).single();d=data||{};}
    const isF=isFixa==='true'||isFixa===true;
    openModal(modalHdr(isF?'Editar Despesa Fixa':'Editar Despesa')+`
<form onsubmit="window._finSaveEditDesp(event,'${isF?fixaId:id}',${isF})">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" value="${escHTML(d.descricao||'')}">
  <label style="${lbl}">Valor *</label><input name="valor" type="number" step="0.01" required style="${fld}" value="${d.valor||''}">
  ${isF
    ?row2(`<div><label style="${lbl}">Dia vencimento</label><input name="dia_vencimento" type="number" min="1" max="31" style="${fld}" value="${d.dia_vencimento||''}"></div>`,
          `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts(d.id_conta||'')}</select></div>`)
    :row2(`<div><label style="${lbl}">Vencimento</label><input name="data_vencimento" type="date" style="${fld}" value="${d.data_vencimento||''}"></div>`,
          `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts(d.id_conta||'')}</select></div>`)}
  <label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">--</option>${catOpts('despesa',d.id_categoria||'')}</select>
  ${!isF?`<label style="${lbl}">Status</label><select name="status" style="${fld}"><option value="pendente"${d.status==='pendente'?' selected':''}>Pendente</option><option value="pago"${d.status==='pago'?' selected':''}>Pago</option><option value="cancelado"${d.status==='cancelado'?' selected':''}>Cancelado</option></select>`:''}
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}" value="${escHTML(d.obs||'')}">
  <button type="submit" ${actBtn('Salvar','#dc2626')}>Salvar</button>
</form>`);
  }catch(ex){toast.err('Erro: '+ex.message);}
};
window._finSaveEditDesp=async function(e,id,isFixa){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{
    if(isFixa===true||isFixa==='true')await fSave('fin_despesas_fixas',{id,...d});
    else await fSave('fin_despesas',{id,...d});
    toast.ok('Salvo!');closeModal();renderTab(_ct);
  }catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelDesp=async function(id,isFixa,fixaId,valorId){
  if(!confirm('Excluir esta despesa?'))return;
  try{
    if(isFixa==='true'||isFixa===true){
      if(confirm('OK = só este mês\nCancelar = desativar toda a série fixa')){
        await fSaveValor('fin_despesas_fixas_valor','id_despesa_fixa',fixaId,_mes,valorId,{excluido_mes:true,status:'cancelado'});
      }else{await fSave('fin_despesas_fixas',{id:fixaId,ativo:false});}
    }else{await fDel('fin_despesas',id);}
    toast.ok('Exluída!');renderTab(_ct);
  }catch(ex){toast.err('Erro: '+ex.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: RECEITAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderReceitas(el){
  el.innerHTML=`<div style="padding:16px;text-align:center;color:var(--text-2,#666)">Carregando...</div>`;
  try{
    await loadLookups();
    const m0=_mes+'-01',m1=_mes+'-31';
    const[rec,rFix,rFixV]=await Promise.all([
      fGet('fin_receitas',{gte:['data_previsao',m0],lte:['data_previsao',m1]}),
      fGet('fin_receitas_fixas',{eq:{ativo:true}}),
      fGet('fin_receitas_fixas_valor',{eq:{mes_ref:_mes}}),
    ]);
    const fixaMes=rFix.map(f=>{const v=rFixV.find(x=>x.id_receita_fixa===f.id);if(v?.excluido_mes)return null;return{id:v?.id||('fix-'+f.id),descricao:f.descricao,valor:v?.valor??f.valor,status:v?.status||'pendente',data_previsao:`${_mes}-${String(f.dia_recebimento||1).padStart(2,'0')}`,id_categoria:f.id_categoria,id_conta:f.id_conta,_fixa:true,_fixaId:f.id,_valorId:v?.id};}).filter(Boolean);
    const all=[...rec,...fixaMes].sort((a,b)=>(a.data_previsao||'').localeCompare(b.data_previsao||''));
    const total=all.reduce((s,r)=>s+(Number(r.valor)||0),0);
    const receb=all.filter(r=>r.status==='recebido').reduce((s,r)=>s+(Number(r.valor)||0),0);
    el.innerHTML=`
<div style="padding:12px 16px;">
  ${navMes()}
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
    <div><span style="font-size:14px;color:var(--text-2,#888)">Total: <strong style="color:var(--text-1,#111)">${fmt(total)}</strong></span> <span style="font-size:13px;color:#059669;margin-left:10px">Recebido: ${fmt(receb)}</span> <span style="font-size:13px;color:#d97706;margin-left:8px">A receber: ${fmt(total-receb)}</span></div>
    <div style="display:flex;gap:8px;">
      <button onclick="window._finNovaRecFixa()" style="background:#f3f4f6;color:var(--text-1,#111);border:1px solid var(--border,#ddd);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer">+ Fixa</button>
      <button onclick="window._finNovaRec()" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer">+ Receita</button>
    </div>
  </div>
  ${all.length?all.map(r=>`
  <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border,#f3f4f6)">
    <input type="checkbox" ${r.status==='recebido'?'checked':''} onchange="window._finToggleRec('${r.id}',this.checked,${r._fixa?'true':'false'},'${r._fixaId||''}','${r._valorId||''}')" style="width:18px;height:18px;accent-color:#059669;cursor:pointer">
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600;color:var(--text-1,#111);text-decoration:${r.status==='recebido'?'line-through':''};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHTML(r.descricao||'—')}${r._fixa?' <span style="font-size:10px;background:#e0f2fe;color:#0284c7;border-radius:4px;padding:1px 5px">FIXA</span>':''}</div>
      <div style="font-size:11px;color:var(--text-2,#888)">${fmtDt(r.data_previsao)} · ${nomeCat(r.id_categoria)} · ${nomeC(r.id_conta)}</div>
    </div>
    <div style="text-align:right"><div style="font-weight:700;color:#059669">+${fmt(r.valor)}</div><div style="font-size:11px;color:${r.status==='recebido'?'#059669':'#d97706'}">${r.status==='recebido'?'Recebido':'Pendente'}</div></div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <button onclick="window._finEditRec('${r.id}',${r._fixa?'true':'false'},'${r._fixaId||''}')" style="background:none;border:1px solid var(--border,#ddd);border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:var(--text-1,#111)">✎</button>
      <button onclick="window._finDelRec('${r.id}',${r._fixa?'true':'false'},'${r._fixaId||''}','${r._valorId||''}')" style="background:none;border:1px solid #fca5a5;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
    </div>
  </div>`).join(''):`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma receita em ${ptMes(_mes)}.</div>`}
</div>`;
  }catch(e){console.error(e);el.innerHTML=`<div style="padding:20px;color:#dc2626">Erro: ${e.message}</div>`;}
}

window._finToggleRec=async function(id,receb,isFixa,fixaId,valorId){
  try{
    const isF=isFixa==='true'||isFixa===true;
    if(isF){
      const data_r=receb?new Date().toISOString().slice(0,10):null;
      await fSaveValor('fin_receitas_fixas_valor','id_receita_fixa',fixaId,_mes,valorId,{status:receb?'recebido':'pendente',data_recebimento:data_r});
    }else{
      await fSave('fin_receitas',{id,status:receb?'recebido':'pendente',data_recebimento:receb?new Date().toISOString().slice(0,10):null});
    }
    toast.ok(receb?'Recebido!':'Desmarcado.');renderTab(_ct);
  }catch(e){toast.err('Erro: '+e.message);}
};
window._finNovaRec=function(){
  openModal(modalHdr('Nova Receita')+`
<form onsubmit="window._finSaveRec(event)">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" placeholder="Ex: Salário">
  <label style="${lbl}">Valor *</label><input name="valor" type="number" step="0.01" min="0.01" required style="${fld}" placeholder="0,00">
  ${row2(`<div><label style="${lbl}">Previsão *</label><input name="data_previsao" type="date" required style="${fld}" value="${_mes}-01"></div>`,
         `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts()}</select></div>`)}
  <label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">--</option>${catOpts('receita')}</select>
  <label style="${lbl}">Status</label><select name="status" style="${fld}"><option value="pendente">Pendente</option><option value="recebido">Recebido</option></select>
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}" placeholder="Opcional">
  <button type="submit" ${actBtn('Salvar Receita','#059669')}>Salvar Receita</button>
</form>`);
};
window._finSaveRec=async function(e){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{await fSave('fin_receitas',{...d,data_recebimento:d.status==='recebido'?d.data_previsao:null});toast.ok('Receita salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finNovaRecFixa=function(){
  openModal(modalHdr('Nova Receita Fixa')+`
<form onsubmit="window._finSaveRecFixa(event)">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" placeholder="Ex: Salário">
  <label style="${lbl}">Valor padrão *</label><input name="valor" type="number" step="0.01" required style="${fld}" placeholder="0,00">
  ${row2(`<div><label style="${lbl}">Dia do recebimento</label><input name="dia_recebimento" type="number" min="1" max="31" style="${fld}" value="5"></div>`,
         `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts()}</select></div>`)}
  <label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">--</option>${catOpts('receita')}</select>
  <button type="submit" ${actBtn('Salvar','#059669')}>Salvar Receita Fixa</button>
</form>`);
};
window._finSaveRecFixa=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_receitas_fixas',{...d,ativo:true});toast.ok('Receita fixa salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditRec=async function(id,isFixa,fixaId){
  const isF=isFixa==='true'||isFixa===true;
  try{
    let d;
    if(isF){const{data}=await sb.from('fin_receitas_fixas').select('*').eq('id',fixaId).single();d=data||{};}
    else{const{data}=await sb.from('fin_receitas').select('*').eq('id',id).single();d=data||{};}
    openModal(modalHdr(isF?'Editar Receita Fixa':'Editar Receita')+`
<form onsubmit="window._finSaveEditRec(event,'${isF?fixaId:id}',${isF})">
  <label style="${lbl}">Descrição *</label><input name="descricao" required style="${fld}" value="${escHTML(d.descricao||'')}">
  <label style="${lbl}">Valor *</label><input name="valor" type="number" step="0.01" required style="${fld}" value="${d.valor||''}">
  ${isF
    ?row2(`<div><label style="${lbl}">Dia recebimento</label><input name="dia_recebimento" type="number" min="1" max="31" style="${fld}" value="${d.dia_recebimento||''}"></div>`,
          `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts(d.id_conta||'')}</select></div>`)
    :row2(`<div><label style="${lbl}">Previsão</label><input name="data_previsao" type="date" style="${fld}" value="${d.data_previsao||''}"></div>`,
          `<div><label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts(d.id_conta||'')}</select></div>`)}
  <label style="${lbl}">Categoria</label><select name="id_categoria" style="${fld}"><option value="">--</option>${catOpts('receita',d.id_categoria||'')}</select>
  ${!isF?`<label style="${lbl}">Status</label><select name="status" style="${fld}"><option value="pendente"${d.status==='pendente'?' selected':''}>Pendente</option><option value="recebido"${d.status==='recebido'?' selected':''}>Recebido</option></select>`:''}
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}" value="${escHTML(d.obs||'')}">
  <button type="submit" ${actBtn('Salvar','#059669')}>Salvar</button>
</form>`);
  }catch(ex){toast.err('Erro: '+ex.message);}
};
window._finSaveEditRec=async function(e,id,isFixa){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{
    if(isFixa===true||isFixa==='true')await fSave('fin_receitas_fixas',{id,...d});
    else await fSave('fin_receitas',{id,...d});
    toast.ok('Salvo!');closeModal();renderTab(_ct);
  }catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelRec=async function(id,isFixa,fixaId,valorId){
  if(!confirm('Excluir esta receita?'))return;
  const isF=isFixa==='true'||isFixa===true;
  try{
    if(isF){
      if(confirm('OK = só este mês\nCancelar = desativar toda a série')){
        await fSaveValor('fin_receitas_fixas_valor','id_receita_fixa',fixaId,_mes,valorId,{excluido_mes:true,status:'cancelado'});
      }else await fSave('fin_receitas_fixas',{id:fixaId,ativo:false});
    }else{await fDel('fin_receitas',id);}
    toast.ok('Exluída!');renderTab(_ct);
  }catch(ex){toast.err('Erro: '+ex.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: TRANSFERENCIAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderTransferencias(el){
  await loadLookups();
  const m0=_mes+'-01',m1=_mes+'-31';
  const tr=await fGet('fin_transferencias',{gte:['data',m0],lte:['data',m1]});
  el.innerHTML=`
<div style="padding:12px 16px;">
  ${navMes()}
  <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
    <button onclick="window._finNovaTransf()" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer">+ Transferência</button>
  </div>
  ${tr.length?tr.map(t=>`
  <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border,#f3f4f6)">
    <span style="font-size:20px">🔄</span>
    <div style="flex:1">
      <div style="font-size:13px;font-weight:600;color:var(--text-1,#111)">${escHTML(t.descricao||'Transferência')}</div>
      <div style="font-size:11px;color:var(--text-2,#888)">${fmtDt(t.data)} · ${nomeC(t.id_conta_origem)} → ${nomeC(t.id_conta_destino)}</div>
    </div>
    <div style="font-weight:700;color:#2563eb">${fmt(t.valor)}</div>
    <button onclick="window._finDelTransf('${t.id}')" style="background:none;border:1px solid #fca5a5;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
  </div>`).join(''):`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma transferência em ${ptMes(_mes)}.</div>`}
</div>`;
}
window._finNovaTransf=function(){
  openModal(modalHdr('Nova Transferência')+`
<form onsubmit="window._finSaveTransf(event)">
  ${row2(`<div><label style="${lbl}">Conta origem *</label><select name="id_conta_origem" required style="${fld}"><option value="">--</option>${contaOpts()}</select></div>`,
         `<div><label style="${lbl}">Conta destino *</label><select name="id_conta_destino" required style="${fld}"><option value="">--</option>${contaOpts()}</select></div>`)}
  ${row2(`<div><label style="${lbl}">Valor *</label><input name="valor" type="number" step="0.01" min="0.01" required style="${fld}"></div>`,
         `<div><label style="${lbl}">Data *</label><input name="data" type="date" required style="${fld}" value="${new Date().toISOString().slice(0,10)}"></div>`)}
  <label style="${lbl}">Descrição</label><input name="descricao" style="${fld}" placeholder="Opcional">
  <button type="submit" ${actBtn('Transferir','#2563eb')}>Transferir</button>
</form>`);
};
window._finSaveTransf=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  if(d.id_conta_origem===d.id_conta_destino){toast.err('Contas origem e destino devem ser diferentes.');return;}
  try{await fSave('fin_transferencias',d);toast.ok('Transferência salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelTransf=async function(id){
  if(!confirm('Excluir esta transferência?'))return;
  try{await fDel('fin_transferencias',id);toast.ok('Exluída!');renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderContas(el){
  await loadLookups();
  const saldos=await calcSaldos();
  el.innerHTML=`
<div style="padding:12px 16px;">
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
    <button onclick="window._finNovaConta()" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">+ Conta</button>
  </div>
  ${_contas.map(c=>`
  <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;margin-bottom:8px;background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <div style="flex:1">
      <div style="font-size:15px;font-weight:700;color:var(--text-1,#111)">${escHTML(c.nome)}</div>
      <div style="font-size:12px;color:var(--text-2,#888)">${c.tipo||'corrente'} · ${c.banco||'—'}</div>
      <div style="font-size:11px;color:var(--text-2,#aaa)">Saldo inicial: ${fmt(c.saldo_inicial||0)}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700;color:${(saldos[c.id]||0)>=0?'#059669':'#dc2626'}">${fmt(saldos[c.id]||0)}</div>
      <div style="font-size:11px;color:var(--text-2,#888)">saldo atual</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <button onclick="window._finEditConta('${c.id}')" style="background:none;border:1px solid var(--border,#ddd);border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer;color:var(--text-1,#111)">✎</button>
      <button onclick="window._finDelConta('${c.id}')" style="background:none;border:1px solid #fca5a5;border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer;color:#dc2626">✕</button>
    </div>
  </div>`).join('')||`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma conta cadastrada.</div>`}
</div>`;
}
window._finNovaConta=function(){
  openModal(modalHdr('Nova Conta')+`
<form onsubmit="window._finSaveConta(event)">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" placeholder="Ex: Nubank">
  ${row2(`<div><label style="${lbl}">Tipo</label><select name="tipo" style="${fld}"><option value="corrente">Corrente</option><option value="poupanca">Poupança</option><option value="investimento">Investimento</option><option value="carteira">Carteira</option></select></div>`,
         `<div><label style="${lbl}">Banco</label><input name="banco" style="${fld}" placeholder="Ex: Nubank"></div>`)}
  <label style="${lbl}">Saldo inicial</label><input name="saldo_inicial" type="number" step="0.01" style="${fld}" value="0">
  <button type="submit" ${actBtn('Salvar Conta','#2563eb')}>Salvar Conta</button>
</form>`);
};
window._finSaveConta=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_contas',{...d,ativo:true});toast.ok('Conta salva!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditConta=async function(id){
  const c=_contas.find(x=>x.id===id)||{};
  openModal(modalHdr('Editar Conta')+`
<form onsubmit="window._finSaveEditConta(event,'${id}')">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" value="${escHTML(c.nome||'')}">
  ${row2(`<div><label style="${lbl}">Tipo</label><select name="tipo" style="${fld}"><option value="corrente"${c.tipo==='corrente'?' selected':''}>Corrente</option><option value="poupanca"${c.tipo==='poupanca'?' selected':''}>Poupança</option><option value="investimento"${c.tipo==='investimento'?' selected':''}>Investimento</option><option value="carteira"${c.tipo==='carteira'?' selected':''}>Carteira</option></select></div>`,
         `<div><label style="${lbl}">Banco</label><input name="banco" style="${fld}" value="${escHTML(c.banco||'')}"></div>`)}
  <label style="${lbl}">Saldo inicial</label><input name="saldo_inicial" type="number" step="0.01" style="${fld}" value="${c.saldo_inicial||0}">
  <button type="submit" ${actBtn('Salvar','#2563eb')}>Salvar</button>
</form>`);
};
window._finSaveEditConta=async function(e,id){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_contas',{id,...d});toast.ok('Salvo!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelConta=async function(id){
  if(!confirm('Excluir esta conta?'))return;
  try{await fDel('fin_contas',id);toast.ok('Exluída!');_loaded=false;renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CARTOES
// ══════════════════════════════════════════════════════════════════════════════
async function renderCartoes(el){
  await loadLookups();
  el.innerHTML=`
<div style="padding:12px 16px;">
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
    <button onclick="window._finNovoCartao()" style="background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">+ Cartão</button>
  </div>
  ${_cartoes.map(c=>`
  <div style="display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:8px;background:${c.cor||'#7c3aed'};border-radius:12px;color:#fff">
    <div style="flex:1">
      <div style="font-size:15px;font-weight:700">${escHTML(c.nome)}</div>
      <div style="font-size:12px;opacity:.8">${c.bandeira||'—'} · Fecha dia ${c.dia_fechamento||'?'} · Vence dia ${c.dia_vencimento||'?'}</div>
      <div style="font-size:12px;opacity:.8">Limite: ${fmt(c.limite||0)}</div>
    </div>
    <div style="display:flex;gap:4px">
      <button onclick="window._finEditCartao('${c.id}')" style="background:rgba(255,255,255,.2);border:none;border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer;color:#fff">✎</button>
      <button onclick="window._finDelCartao('${c.id}')" style="background:rgba(220,38,38,.5);border:none;border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer;color:#fff">✕</button>
    </div>
  </div>`).join('')||`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhum cartão cadastrado.</div>`}
</div>`;
}
window._finNovoCartao=function(){
  openModal(modalHdr('Novo Cartão')+`
<form onsubmit="window._finSaveCartao(event)">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" placeholder="Ex: Nubank Gold">
  ${row2(`<div><label style="${lbl}">Bandeira</label><select name="bandeira" style="${fld}"><option>Mastercard</option><option>Visa</option><option>Elo</option><option>Amex</option><option>Hipercard</option></select></div>`,
         `<div><label style="${lbl}">Limite</label><input name="limite" type="number" step="0.01" style="${fld}" value="0"></div>`)}
  ${row2(`<div><label style="${lbl}">Dia fechamento</label><input name="dia_fechamento" type="number" min="1" max="31" style="${fld}" value="20"></div>`,
         `<div><label style="${lbl}">Dia vencimento</label><input name="dia_vencimento" type="number" min="1" max="31" style="${fld}" value="27"></div>`)}
  <label style="${lbl}">Conta para pagamento</label><select name="id_conta_pagamento" style="${fld}"><option value="">--</option>${contaOpts()}</select>
  <label style="${lbl}">Cor do cartão</label><input name="cor" type="color" style="${fld};height:40px;padding:4px;" value="#7c3aed">
  <button type="submit" ${actBtn('Salvar Cartão','#7c3aed')}>Salvar Cartão</button>
</form>`);
};
window._finSaveCartao=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_cartoes',d);toast.ok('Cartão salvo!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditCartao=async function(id){
  const c=_cartoes.find(x=>x.id===id)||{};
  openModal(modalHdr('Editar Cartão')+`
<form onsubmit="window._finSaveEditCartao(event,'${id}')">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" value="${escHTML(c.nome||'')}">
  ${row2(`<div><label style="${lbl}">Bandeira</label><input name="bandeira" style="${fld}" value="${escHTML(c.bandeira||'')}"></div>`,
         `<div><label style="${lbl}">Limite</label><input name="limite" type="number" step="0.01" style="${fld}" value="${c.limite||0}"></div>`)}
  ${row2(`<div><label style="${lbl}">Dia fechamento</label><input name="dia_fechamento" type="number" min="1" max="31" style="${fld}" value="${c.dia_fechamento||''}"></div>`,
         `<div><label style="${lbl}">Dia vencimento</label><input name="dia_vencimento" type="number" min="1" max="31" style="${fld}" value="${c.dia_vencimento||''}"></div>`)}
  <label style="${lbl}">Conta pagamento</label><select name="id_conta_pagamento" style="${fld}"><option value="">--</option>${contaOpts(c.id_conta_pagamento||'')}</select>
  <label style="${lbl}">Cor</label><input name="cor" type="color" style="${fld};height:40px;padding:4px;" value="${c.cor||'#7c3aed'}">
  <button type="submit" ${actBtn('Salvar','#7c3aed')}>Salvar</button>
</form>`);
};
window._finSaveEditCartao=async function(e,id){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_cartoes',{id,...d});toast.ok('Salvo!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelCartao=async function(id){
  if(!confirm('Excluir este cartão?'))return;
  try{await fDel('fin_cartoes',id);toast.ok('Exluído!');_loaded=false;renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CATEGORIAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderCategorias(el){
  await loadLookups();
  el.innerHTML=`
<div style="padding:12px 16px;">
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;gap:8px;">
    <button onclick="window._finNovaSubcat()" style="background:#f3f4f6;color:var(--text-1,#111);border:1px solid var(--border,#ddd);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer">+ Subcategoria</button>
    <button onclick="window._finNovaCat()" style="background:#f59e0b;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">+ Categoria</button>
  </div>
  ${_cats.map(c=>{const subs=_subcats.filter(s=>s.id_categoria===c.id);return`
  <div style="margin-bottom:10px;background:var(--bg-card,#fff);border-radius:12px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.cor||'#6b7280'}"></span>
        <span style="font-size:14px;font-weight:700;color:var(--text-1,#111)">${escHTML(c.nome)}</span>
        <span style="font-size:11px;padding:1px 7px;border-radius:10px;background:${c.tipo==='receita'?'#d1fae5':'#fee2e2'};color:${c.tipo==='receita'?'#065f46':'#7f1d1d'}">${c.tipo}</span>
      </div>
      <div style="display:flex;gap:4px">
        <button onclick="window._finEditCat('${c.id}')" style="background:none;border:1px solid var(--border,#ddd);border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;color:var(--text-1,#111)">✎</button>
        <button onclick="window._finDelCat('${c.id}')" style="background:none;border:1px solid #fca5a5;border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
      </div>
    </div>
    ${subs.length?`<div style="margin-top:8px;padding-left:20px;display:flex;flex-wrap:wrap;gap:6px;">${subs.map(s=>`<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 10px;border-radius:20px;background:var(--bg,#f3f4f6);font-size:12px;color:var(--text-2,#666)">${escHTML(s.nome)} <button onclick="window._finDelSubcat('${s.id}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0">✕</button></span>`).join('')}</div>`:''}
  </div>`;}).join('')||`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma categoria.</div>`}
</div>`;
}
window._finNovaCat=function(){
  openModal(modalHdr('Nova Categoria')+`
<form onsubmit="window._finSaveCat(event)">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" placeholder="Ex: Alimentação">
  ${row2(`<div><label style="${lbl}">Tipo</label><select name="tipo" style="${fld}"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></div>`,
         `<div><label style="${lbl}">Cor</label><input name="cor" type="color" style="${fld};height:40px;padding:4px;" value="#6b7280"></div>`)}
  <button type="submit" ${actBtn('Salvar','#f59e0b')}>Salvar Categoria</button>
</form>`);
};
window._finSaveCat=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_categorias',d);toast.ok('Categoria salva!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditCat=async function(id){
  const c=_cats.find(x=>x.id===id)||{};
  openModal(modalHdr('Editar Categoria')+`
<form onsubmit="window._finSaveEditCat(event,'${id}')">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" value="${escHTML(c.nome||'')}">
  ${row2(`<div><label style="${lbl}">Tipo</label><select name="tipo" style="${fld}"><option value="despesa"${c.tipo==='despesa'?' selected':''}>Despesa</option><option value="receita"${c.tipo==='receita'?' selected':''}>Receita</option></select></div>`,
         `<div><label style="${lbl}">Cor</label><input name="cor" type="color" style="${fld};height:40px;padding:4px;" value="${c.cor||'#6b7280'}"></div>`)}
  <button type="submit" ${actBtn('Salvar','#f59e0b')}>Salvar</button>
</form>`);
};
window._finSaveEditCat=async function(e,id){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_categorias',{id,...d});toast.ok('Salvo!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelCat=async function(id){
  if(!confirm('Excluir categoria?'))return;
  try{await fDel('fin_categorias',id);toast.ok('Exluída!');_loaded=false;renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};
window._finNovaSubcat=function(){
  openModal(modalHdr('Nova Subcategoria')+`
<form onsubmit="window._finSaveSubcat(event)">
  <label style="${lbl}">Categoria *</label><select name="id_categoria" required style="${fld}"><option value="">--</option>${_cats.map(c=>`<option value="${c.id}">${escHTML(c.nome)}</option>`).join('')}</select>
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" placeholder="Ex: Restaurante">
  <button type="submit" ${actBtn('Salvar','#f59e0b')}>Salvar</button>
</form>`);
};
window._finSaveSubcat=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_subcategorias',d);toast.ok('Salvo!');_loaded=false;closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelSubcat=async function(id){
  if(!confirm('Excluir subcategoria?'))return;
  try{await fDel('fin_subcategorias',id);toast.ok('Exluída!');_loaded=false;renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: ORCAMENTOS
// ══════════════════════════════════════════════════════════════════════════════
async function renderOrcamentos(el){
  await loadLookups();
  const[orcs,desp,dFix,dFixV]=await Promise.all([
    fGet('fin_orcamentos',{eq:{mes_ref:_mes}}),
    fGet('fin_despesas',{gte:['data_vencimento',_mes+'-01'],lte:['data_vencimento',_mes+'-31']}),
    fGet('fin_despesas_fixas',{eq:{ativo:true}}),
    fGet('fin_despesas_fixas_valor',{eq:{mes_ref:_mes}}),
  ]);
  const spent={};
  for(const d of desp)if(d.id_categoria)spent[d.id_categoria]=(spent[d.id_categoria]||0)+(Number(d.valor)||0);
  for(const f of dFix){const v=dFixV.find(x=>x.id_despesa_fixa===f.id);if(!v?.excluido_mes&&f.id_categoria)spent[f.id_categoria]=(spent[f.id_categoria]||0)+(Number(v?.valor??f.valor)||0);}
  el.innerHTML=`
<div style="padding:12px 16px;">
  ${navMes()}
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
    <button onclick="window._finNovoOrc()" style="background:#0ea5e9;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">+ Orçamento</button>
  </div>
  ${orcs.length?orcs.map(o=>{const catN=(_cats.find(x=>x.id===o.id_categoria)||{}).nome||'Sem categoria';const gastou=spent[o.id_categoria]||0;const pct=Math.min(100,Math.round((gastou/(o.valor_limite||1))*100));const cor=pct>=100?'#dc2626':pct>=80?'#f59e0b':'#059669';return`
  <div style="margin-bottom:10px;background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-weight:600;color:var(--text-1,#111)">${catN}</span>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:13px;color:var(--text-2,#888)">${fmt(gastou)} / ${fmt(o.valor_limite)}</span>
        <button onclick="window._finDelOrc('${o.id}')" style="background:none;border:1px solid #fca5a5;border-radius:5px;padding:2px 7px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
      </div>
    </div>
    <div style="background:var(--border,#e5e7eb);border-radius:6px;height:8px;overflow:hidden;"><div style="width:${pct}%;background:${cor};height:100%;border-radius:6px;"></div></div>
    <div style="font-size:11px;color:${cor};margin-top:4px;text-align:right">${pct}% utilizado</div>
  </div>`;}).join(''):`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhum orçamento para ${ptMes(_mes)}.</div>`}
</div>`;
}
window._finNovoOrc=function(){
  openModal(modalHdr('Novo Orçamento')+`
<form onsubmit="window._finSaveOrc(event)">
  <label style="${lbl}">Categoria (despesa) *</label><select name="id_categoria" required style="${fld}"><option value="">--</option>${catOpts('despesa')}</select>
  <label style="${lbl}">Limite (${ptMes(_mes)}) *</label><input name="valor_limite" type="number" step="0.01" min="0.01" required style="${fld}">
  <input type="hidden" name="mes_ref" value="${_mes}">
  <button type="submit" ${actBtn('Salvar','#0ea5e9')}>Salvar Orçamento</button>
</form>`);
};
window._finSaveOrc=async function(e){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_orcamentos',d);toast.ok('Orçamento salvo!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelOrc=async function(id){
  if(!confirm('Excluir orçamento?'))return;
  try{await fDel('fin_orcamentos',id);toast.ok('Exluído!');renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: METAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderMetas(el){
  await loadLookups();
  const metas=await fGet('fin_objetivos',{order:'data_alvo',asc:true});
  el.innerHTML=`
<div style="padding:12px 16px;">
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
    <button onclick="window._finNovaMeta()" style="background:#8b5cf6;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">+ Meta</button>
  </div>
  ${metas.map(m=>{const pct=Math.min(100,Math.round(((m.valor_atual||0)/(m.valor_alvo||1))*100));const cor=m.concluido?'#059669':pct>=75?'#0ea5e9':'#8b5cf6';return`
  <div style="margin-bottom:10px;background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--text-1,#111)">${escHTML(m.nome)} ${m.concluido?'✅':''}</div>
        <div style="font-size:12px;color:var(--text-2,#888)">Meta até ${fmtDt(m.data_alvo)} · ${nomeC(m.id_conta)}</div>
        <div style="font-size:13px;margin-top:4px"><strong>${fmt(m.valor_atual||0)}</strong> / ${fmt(m.valor_alvo)}</div>
      </div>
      <div style="display:flex;gap:4px">
        <button onclick="window._finAportarMeta('${m.id}','${m.valor_atual||0}','${m.valor_alvo||0}')" style="background:#059669;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer">+R$</button>
        <button onclick="window._finEditMeta('${m.id}')" style="background:none;border:1px solid var(--border,#ddd);border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;color:var(--text-1,#111)">✎</button>
        <button onclick="window._finDelMeta('${m.id}')" style="background:none;border:1px solid #fca5a5;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;color:#dc2626">✕</button>
      </div>
    </div>
    <div style="margin-top:10px;background:var(--border,#e5e7eb);border-radius:6px;height:10px;overflow:hidden;"><div style="width:${pct}%;background:${cor};height:100%;border-radius:6px;"></div></div>
    <div style="font-size:11px;color:${cor};margin-top:4px;text-align:right">${pct}%</div>
  </div>`;}).join('')||`<div style="padding:32px;text-align:center;color:var(--text-2,#888)">Nenhuma meta cadastrada.</div>`}
</div>`;
}
window._finNovaMeta=function(){
  openModal(modalHdr('Nova Meta')+`
<form onsubmit="window._finSaveMeta(event)">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" placeholder="Ex: Reserva de emergência">
  ${row2(`<div><label style="${lbl}">Valor alvo *</label><input name="valor_alvo" type="number" step="0.01" min="0.01" required style="${fld}"></div>`,
         `<div><label style="${lbl}">Data alvo</label><input name="data_alvo" type="date" style="${fld}"></div>`)}
  <label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts()}</select>
  <label style="${lbl}">Observação</label><input name="obs" style="${fld}">
  <button type="submit" ${actBtn('Salvar Meta','#8b5cf6')}>Salvar Meta</button>
</form>`);
};
window._finSaveMeta=async function(e){
  e.preventDefault();const f=new FormData(e.target);const{obs:_obs,...d}=Object.fromEntries(f);
  try{await fSave('fin_objetivos',{...d,valor_atual:0,concluido:false});toast.ok('Meta salva!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finAportarMeta=function(id,atual,alvo){
  openModal(modalHdr('Aportar na Meta')+`
<form onsubmit="window._finSaveAporte(event,'${id}',${atual},${alvo})">
  <label style="${lbl}">Valor do aporte *</label><input name="aporte" type="number" step="0.01" min="0.01" required style="${fld}">
  <button type="submit" ${actBtn('Confirmar','#059669')}>Confirmar</button>
</form>`);
};
window._finSaveAporte=async function(e,id,atual,alvo){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  const novoVal=parseFloat(atual)+parseFloat(d.aporte);
  try{await fSave('fin_objetivos',{id,valor_atual:novoVal,concluido:novoVal>=parseFloat(alvo)});toast.ok('Aporte registrado!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finEditMeta=async function(id){
  const{data:m}=await sb.from('fin_objetivos').select('*').eq('id',id).single();
  if(!m)return;
  openModal(modalHdr('Editar Meta')+`
<form onsubmit="window._finSaveEditMeta(event,'${id}')">
  <label style="${lbl}">Nome *</label><input name="nome" required style="${fld}" value="${escHTML(m.nome||'')}">
  ${row2(`<div><label style="${lbl}">Valor alvo *</label><input name="valor_alvo" type="number" step="0.01" required style="${fld}" value="${m.valor_alvo||''}"></div>`,
         `<div><label style="${lbl}">Data alvo</label><input name="data_alvo" type="date" style="${fld}" value="${m.data_alvo||''}"></div>`)}
  <label style="${lbl}">Conta</label><select name="id_conta" style="${fld}"><option value="">--</option>${contaOpts(m.id_conta||'')}</select>
  <button type="submit" ${actBtn('Salvar','#8b5cf6')}>Salvar</button>
</form>`);
};
window._finSaveEditMeta=async function(e,id){
  e.preventDefault();const f=new FormData(e.target),d=Object.fromEntries(f);
  try{await fSave('fin_objetivos',{id,...d});toast.ok('Salvo!');closeModal();renderTab(_ct);}
  catch(ex){toast.err('Erro: '+ex.message);}
};
window._finDelMeta=async function(id){
  if(!confirm('Excluir esta meta?'))return;
  try{await fDel('fin_objetivos',id);toast.ok('Exluída!');renderTab(_ct);}
  catch(e){toast.err('Erro: '+e.message);}
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB: RELATORIOS
// ══════════════════════════════════════════════════════════════════════════════
async function renderRelatorios(el){
  el.innerHTML=`<div style="padding:16px;text-align:center;color:var(--text-2,#666)">Carregando relatório...</div>`;
  await loadLookups();
  try{
    const months=[];for(let i=5;i>=0;i--)months.push(addMes(_mes,-i));
    const u=await uid();
    const mData=await Promise.all(months.map(async m=>{
      const m0=m+'-01',m1=m+'-31';
      const[d,r,df,dfv,rf,rfv]=await Promise.all([
        sb.from('fin_despesas').select('valor').eq('user_id',u).gte('data_vencimento',m0).lte('data_vencimento',m1).is('deleted_at',null),
        sb.from('fin_receitas').select('valor').eq('user_id',u).gte('data_previsao',m0).lte('data_previsao',m1).is('deleted_at',null),
        sb.from('fin_despesas_fixas').select('id,valor').eq('user_id',u).eq('ativo',true).is('deleted_at',null),
        sb.from('fin_despesas_fixas_valor').select('id_despesa_fixa,valor,excluido_mes').eq('user_id',u).eq('mes_ref',m).is('deleted_at',null),
        sb.from('fin_receitas_fixas').select('id,valor').eq('user_id',u).eq('ativo',true).is('deleted_at',null),
        sb.from('fin_receitas_fixas_valor').select('id_receita_fixa,valor,excluido_mes').eq('user_id',u).eq('mes_ref',m).is('deleted_at',null),
      ]);
      let desp=(d.data||[]).reduce((s,x)=>s+(Number(x.valor)||0),0);
      let rec=(r.data||[]).reduce((s,x)=>s+(Number(x.valor)||0),0);
      for(const f of df.data||[]){const v=(dfv.data||[]).find(x=>x.id_despesa_fixa===f.id);if(!v?.excluido_mes)desp+=(Number(v?.valor??f.valor)||0);}
      for(const f of rf.data||[]){const v=(rfv.data||[]).find(x=>x.id_receita_fixa===f.id);if(!v?.excluido_mes)rec+=(Number(v?.valor??f.valor)||0);}
      const mo=parseInt(m.split('-')[1])-1;
      const mNames=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      return{label:mNames[mo]+'/'+m.slice(2,4),desp,rec,saldo:rec-desp};
    }));
    // Cat breakdown
    const m0=_mes+'-01',m1=_mes+'-31';
    const[dc,df2,dfv2]=await Promise.all([
      sb.from('fin_despesas').select('id_categoria,valor').eq('user_id',u).gte('data_vencimento',m0).lte('data_vencimento',m1).is('deleted_at',null),
      sb.from('fin_despesas_fixas').select('id,id_categoria,valor').eq('user_id',u).eq('ativo',true).is('deleted_at',null),
      sb.from('fin_despesas_fixas_valor').select('id_despesa_fixa,valor,excluido_mes').eq('user_id',u).eq('mes_ref',_mes).is('deleted_at',null),
    ]);
    const catS={};
    for(const d of dc.data||[])if(d.id_categoria)catS[d.id_categoria]=(catS[d.id_categoria]||0)+(Number(d.valor)||0);
    for(const f of df2.data||[]){const v=(dfv2.data||[]).find(x=>x.id_despesa_fixa===f.id);if(!v?.excluido_mes&&f.id_categoria)catS[f.id_categoria]=(catS[f.id_categoria]||0)+(Number(v?.valor??f.valor)||0);}
    const catE=Object.entries(catS).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const totC=catE.reduce((s,[,v])=>s+v,0)||1;
    const maxV=Math.max(...mData.flatMap(x=>[x.rec,x.desp]),1);
    const BH=120,BW=40;
    el.innerHTML=`
<div style="padding:12px 16px;">
  <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;color:var(--text-1,#111)">Últimos 6 meses</h3>
  <div style="background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:14px;overflow-x:auto;">
    <div style="display:flex;justify-content:flex-end;gap:12px;font-size:12px;color:var(--text-2,#888);margin-bottom:8px;"><span style="color:#059669">■ Receitas</span><span style="color:#dc2626">■ Despesas</span></div>
    <div style="display:flex;align-items:flex-end;gap:8px;height:${BH+30}px;padding:0 4px;min-width:320px;">
      ${mData.map(d=>`
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="display:flex;align-items:flex-end;gap:2px;height:${BH}px;">
          <div style="width:${BW/2}px;background:#059669;border-radius:3px 3px 0 0;height:${Math.round((d.rec/maxV)*BH)}px;min-height:${d.rec>0?2:0}px"></div>
          <div style="width:${BW/2}px;background:#dc2626;border-radius:3px 3px 0 0;height:${Math.round((d.desp/maxV)*BH)}px;min-height:${d.desp>0?2:0}px"></div>
        </div>
        <div style="font-size:9px;color:var(--text-2,#9ca3af);text-align:center">${d.label}</div>
        <div style="font-size:9px;color:${d.saldo>=0?'#059669':'#dc2626'};text-align:center">${d.saldo>=0?'+':''}${fmt(d.saldo).replace('R$ ','').replace(',00','')}</div>
      </div>`).join('')}
    </div>
  </div>
  <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;color:var(--text-1,#111)">Despesas por categoria — ${ptMes(_mes)}</h3>
  <div style="background:var(--bg-card,#fff);border-radius:12px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
    ${catE.length?catE.map(([catId,val])=>{const c=_cats.find(x=>x.id===catId);const pct=Math.round((val/totC)*100);return`
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;"><span style="color:var(--text-1,#111);font-weight:500">${c?.nome||'Sem categoria'}</span><span style="color:var(--text-2,#888)">${fmt(val)} (${pct}%)</span></div>
      <div style="background:var(--border,#e5e7eb);border-radius:4px;height:6px;"><div style="width:${pct}%;background:${c?.cor||'#6b7280'};height:100%;border-radius:4px;"></div></div>
    </div>`;}).join(''):'<p style="color:var(--text-2,#888);font-size:13px;text-align:center;">Sem despesas com categoria este mês.</p>'}
  </div>
</div>`;
  }catch(e){console.error(e);el.innerHTML=`<div style="padding:20px;color:#dc2626">Erro: ${e.message}</div>`;}
}

// ══════════════════════════════════════════════════════════════════════════════
// SHELL + RENDER TAB
// ══════════════════════════════════════════════════════════════════════════════
const TABS_DEF=[
  {id:'resumo',icon:'🏠',label:'Resumo'},
  {id:'despesas',icon:'📉',label:'Despesas'},
  {id:'receitas',icon:'📈',label:'Receitas'},
  {id:'transferencias',icon:'🔄',label:'Transf.'},
  {id:'contas',icon:'🏦',label:'Contas'},
  {id:'cartoes',icon:'💳',label:'Cartões'},
  {id:'categorias',icon:'🏷️',label:'Categorias'},
  {id:'orcamentos',icon:'📊',label:'Orçamentos'},
  {id:'metas',icon:'🎯',label:'Metas'},
  {id:'relatorios',icon:'📋',label:'Relatórios'},
];

function buildShell(){return`
<style>
.fin-wrap{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--bg,#f8fafc);}
.fin-tabs{display:flex;flex-wrap:wrap;border-bottom:1px solid var(--border,#e5e7eb);background:var(--bg-card,#fff);padding:0;flex-shrink:0;}
.fin-tabs::-webkit-scrollbar{display:none;}
.fin-tab{flex:1 1 33%;min-width:0;padding:8px 4px;font-size:10.5px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--text-2,#6b7280);border-bottom:2px solid transparent;display:flex;align-items:center;justify-content:center;gap:3px;text-align:center;}
.fin-tab.active{color:var(--accent,#2563eb);border-bottom-color:var(--accent,#2563eb);}
.fin-body{flex:1;overflow-y:auto;min-height:0;}
</style>
<div class="fin-wrap">
  <div class="fin-tabs">
    ${TABS_DEF.map(t=>`<button class="fin-tab${_tab===t.id?' active':''}" data-finid="${t.id}" onclick="window._finTab('${t.id}')">${t.icon} ${t.label}</button>`).join('')}
  </div>
  <div class="fin-body" id="fin-body"></div>
</div>`;}

window._finTab=function(t){_tab=t;if(_ct){_ct.querySelectorAll('.fin-tab').forEach(x=>x.classList.toggle('active',x.dataset.finid===t));const b=_ct.querySelector('#fin-body');if(b)renderTab(_ct);}};

async function renderTab(ct){
  if(!ct)return;
  const body=ct.querySelector('#fin-body');if(!body)return;
  body.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text-2,#666)">Carregando...</div>`;
  try{
    switch(_tab){
      case'resumo':await renderResumo(body);break;
      case'despesas':await renderDespesas(body);break;
      case'receitas':await renderReceitas(body);break;
      case'transferencias':await renderTransferencias(body);break;
      case'contas':await renderContas(body);break;
      case'cartoes':await renderCartoes(body);break;
      case'categorias':await renderCategorias(body);break;
      case'orcamentos':await renderOrcamentos(body);break;
      case'metas':await renderMetas(body);break;
      case'relatorios':await renderRelatorios(body);break;
      default:await renderResumo(body);
    }
  }catch(e){console.error('[fin]',e);body.innerHTML=`<div style="padding:20px;color:#dc2626">Erro: ${e.message}</div>`;}
}

export async function initLancamentos(el){
  _ct=el;_tab='resumo';_loaded=false;
  el.innerHTML=buildShell();
  await renderTab(el);
}

export function u(){return crypto.randomUUID();}
