import{j as g,s as u,t as c,f as D,b as z}from"./page-dashboard-Dbqm2OjXb.js";import"./supabase-DthfXWp1.js";
let _el=null,_busca="",_negocio="",_status="aberto",_de="",_ate="",_sel=new Set,_data=[];
const _td=()=>new Date().toISOString().slice(0,10);
const _in30=()=>{const d=new Date();d.setDate(d.getDate()+30);return d.toISOString().slice(0,10)};
const ST={pago:{label:"Pago",bg:"#dcfce7",cor:"#166534"},parcial:{label:"Parcial",bg:"#ffedd5",cor:"#c2410c"},agendado:{label:"Agendado",bg:"#dbeafe",cor:"#1d4ed8"},pendente:{label:"Pendente",bg:"#fef3c7",cor:"#92400e"},vencido:{label:"Vencido",bg:"#fee2e2",cor:"#991b1b"},cancelado:{label:"Cancelado",bg:"#f3f4f6",cor:"#6b7280"}};
function stEf(r){const s=(r.status||"pendente").toLowerCase();if(s==="pago"||s==="cancelado"||s==="parcial"||s==="agendado")return s;const v=r.data_vencimento||"";return v&&v<_td()?"vencido":"pendente"}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
function btnSt(bg,cor){return`padding:4px 8px;border-radius:6px;border:none;cursor:pointer;font-size:13px;background:${bg};color:${cor};`}
async function loadData(){
  try{
    const{data,error}=await g.from("lancamentos").select("id,dados").eq("dados->>tipo","receita").order("dados->>data_vencimento",{ascending:!0});
    if(error)throw error;
    _data=(data||[]).map(r=>{const d=r.dados||{};return{id:r.id,cliente:d.clienteNome||d.nome||d.cliente||"",clienteId:d.clienteId||"",negocio:d.negocio||"",descricao:d.descricao||"",valor:Number(d.valor||0),status:d.status||"pendente",data_vencimento:d.data_vencimento||d.data||"",data_pagamento:d.data_pagamento||"",forma_pagamento:d.forma_pagamento||"",dados:d};});
    render();
  }catch(e){c.err("Erro ao carregar: "+e.message)}
}
function filtered(){
  let rows=_data.map(r=>({...r,_stEf:stEf(r)}));
  if(_negocio)rows=rows.filter(r=>r.negocio===_negocio);
  if(_de)rows=rows.filter(r=>r.data_vencimento>=_de);
  if(_ate)rows=rows.filter(r=>r.data_vencimento<=_ate);
  if(_busca.trim()){const b=_busca.toLowerCase();rows=rows.filter(r=>(r.cliente||"").toLowerCase().includes(b)||(r.descricao||"").toLowerCase().includes(b)||(r.negocio||"").toLowerCase().includes(b))}
  if(_status==="aberto")rows=rows.filter(r=>["pendente","vencido","parcial","agendado"].includes(r._stEf));
  else if(_status!=="todos")rows=rows.filter(r=>r._stEf===_status);
  rows.sort((a,b)=>{if(a._stEf==="vencido"&&b._stEf!=="vencido")return -1;if(a._stEf!=="vencido"&&b._stEf==="vencido")return 1;return(a.data_vencimento||"").localeCompare(b.data_vencimento||"")});
  return rows;
}
function kpis(){
  const today=_td(),in30=_in30();
  let aberto=0,vencido=0,aVencer=0,vcnt=0,pcnt=0;
  for(const r of _data){const se=stEf(r),v=r.valor;if(["pendente","vencido","parcial","agendado"].includes(se))aberto+=v;if(se==="vencido"){vencido+=v;vcnt++}if(se==="pendente"&&r.data_vencimento>=today&&r.data_vencimento<=in30)aVencer+=v;if(se==="vencido"||se==="pendente")pcnt++;}
  const inadim=vcnt+pcnt>0?Math.round(vcnt/(vcnt+pcnt)*100):0;
  return{aberto,vencido,aVencer,inadim};
}
function kpiCard(label,val,bg,cor,currency,pct){const display=pct?val+"%":currency?D(val):val;return`<div style="background:${bg};border-radius:10px;padding:14px 10px;text-align:center;"><div style="font-size:10px;color:${cor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">${label}</div><div style="font-size:${currency||pct?"15px":"22px"};font-weight:700;color:${cor};">${display}</div></div>`}
function rowHtml(r){const sc=ST[r._stEf]||ST.pendente,sel=_sel.has(r.id);return`<tr style="border-bottom:1px solid var(--border,#f3f4f6);${r._stEf==="vencido"?"background:rgba(254,226,226,.18);":""}"><td style="padding:10px 6px;"><input type="checkbox" data-sel="${r.id}"${sel?" checked":""}></td><td style="padding:10px 6px;font-weight:600;color:var(--text-1,#111);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(r.cliente)}">${esc(r.cliente||"(sem nome)")}</td><td style="padding:10px 6px;font-size:12px;color:var(--text-2,#6b7280);">${esc(r.negocio||"—")}</td><td style="padding:10px 6px;text-align:right;font-weight:700;color:var(--text-1,#111);">${D(r.valor)}</td><td style="padding:10px 6px;text-align:center;color:var(--text-2,#6b7280);">${r.data_vencimento?z(r.data_vencimento):"—"}</td><td style="padding:10px 6px;text-align:center;font-size:12px;color:var(--text-2,#6b7280);">${esc(r.forma_pagamento||"—")}</td><td style="padding:10px 6px;text-align:center;"><span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${sc.bg};color:${sc.cor};white-space:nowrap;">${sc.label}</span></td><td style="padding:10px 6px;text-align:center;"><div style="display:flex;gap:4px;justify-content:center;"><button data-editar="${r.id}" title="Editar" style="${btnSt("#e0f2fe","#0c4a6e")}">✎</button><button data-pagar="${r.id}" title="Marcar pago" style="${btnSt("#d1fae5","#065f46")}">✓</button><button data-wa="${esc(r.clienteId)}" title="WhatsApp" style="${btnSt("#dcfce7","#065f46")}">✆</button></div></td></tr>`}
function render(){
  if(!_el)return;
  const rows=filtered(),k=kpis();
  const negs=[...new Set(_data.map(r=>r.negocio).filter(Boolean))].sort();
  const STATUSES=[{k:"aberto",l:"Em aberto"},{k:"todos",l:"Todos"},{k:"vencido",l:"Vencido"},{k:"pendente",l:"Pendente"},{k:"pago",l:"Pago"},{k:"parcial",l:"Parcial"},{k:"agendado",l:"Agendado"},{k:"cancelado",l:"Cancelado"}];
  _el.innerHTML=`<div style="padding:16px 20px;max-width:1080px;font-family:Inter,sans-serif;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
    <h1 style="font-size:20px;font-weight:700;margin:0;color:var(--text-1,#111);">Cobranças</h1>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button id="btn-pagar-lote" style="padding:8px 14px;border-radius:8px;border:none;cursor:pointer;background:#16a34a;color:#fff;font-weight:600;font-size:13px;">✓ Pagar selecionados (<span id="qtd-sel">${_sel.size}</span>)</button>
      <button id="btn-export" style="padding:8px 14px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:var(--bg,#fff);color:var(--text-1,#111);font-size:13px;">⬇ Exportar CSV</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px;">
    ${kpiCard("Total em aberto",k.aberto,"#eff6ff","#1d4ed8",!0,!1)}
    ${kpiCard("Vencido",k.vencido,"#fee2e2","#991b1b",!0,!1)}
    ${kpiCard("A vencer 30d",k.aVencer,"#fef3c7","#92400e",!0,!1)}
    ${kpiCard("Inadimplência",k.inadim,"#f5f3ff","#7c3aed",!1,!0)}
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">
    <input id="busca" type="search" value="${esc(_busca)}" placeholder="Buscar cliente, descrição…" style="flex:1;min-width:180px;padding:8px 12px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
    <select id="sel-neg" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
      <option value="">Todos os negócios</option>
      ${negs.map(n=>`<option value="${esc(n)}"${_negocio===n?" selected":""}>${esc(n)}</option>`).join("")}
    </select>
    <input id="fil-de" type="date" value="${_de}" title="Vencimento de" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
    <input id="fil-ate" type="date" value="${_ate}" title="Vencimento até" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
    ${STATUSES.map(s=>`<button data-fs="${s.k}" style="padding:5px 12px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid ${_status===s.k?"#2563eb":"var(--border,#e5e7eb)"};background:${_status===s.k?"#2563eb":"transparent"};color:${_status===s.k?"#fff":"var(--text-1,#111)"};font-weight:${_status===s.k?"700":"400"};">${s.l}</button>`).join("")}
  </div>
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:var(--text-2,#6b7280);">
    <input type="checkbox" id="sel-all"${_sel.size===rows.length&&rows.length>0?" checked":""}><label for="sel-all">Selecionar todos (${rows.length})</label>
  </div>
  <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;border-bottom:2px solid var(--border,#e5e7eb);">
        <th style="padding:8px 6px;width:24px;"></th>
        <th style="padding:8px 6px;text-align:left;">Cliente</th>
        <th style="padding:8px 6px;text-align:left;">Negócio</th>
        <th style="padding:8px 6px;text-align:right;">Valor</th>
        <th style="padding:8px 6px;text-align:center;">Vencimento</th>
        <th style="padding:8px 6px;text-align:center;">Forma Pgto</th>
        <th style="padding:8px 6px;text-align:center;">Status</th>
        <th style="padding:8px 6px;text-align:center;">Ações</th>
      </tr></thead>
      <tbody>${rows.length?rows.slice(0,300).map(r=>rowHtml(r)).join("")+(rows.length>300?`<tr><td colspan="8" style="padding:14px;text-align:center;color:#64748b;font-size:12px;">Mostrando 300 de ${rows.length} — use filtros para refinar</td></tr>`:""):`<tr><td colspan="8" style="padding:48px;text-align:center;color:#9ca3af;">Nenhum lançamento encontrado.</td></tr>`}</tbody>
    </table>
  </div>
  <div style="margin-top:10px;font-size:12px;color:var(--text-3,#9ca3af);text-align:center;">${rows.length} lançamento(s) listado(s)</div>
</div>`;
  _el.querySelector("#busca")?.addEventListener("input",e=>{_busca=e.target.value;clearTimeout(window._cobT);window._cobT=setTimeout(()=>{render();const b=_el?.querySelector("#busca");b&&(b.focus(),b.setSelectionRange(b.value.length,b.value.length))},350)});
  _el.querySelector("#sel-neg")?.addEventListener("change",e=>{_negocio=e.target.value;render()});
  _el.querySelector("#fil-de")?.addEventListener("change",e=>{_de=e.target.value;render()});
  _el.querySelector("#fil-ate")?.addEventListener("change",e=>{_ate=e.target.value;render()});
  _el.querySelectorAll("[data-fs]").forEach(b=>b.addEventListener("click",()=>{_status=b.dataset.fs;render()}));
  _el.querySelector("#sel-all")?.addEventListener("change",e=>{e.target.checked?rows.forEach(r=>_sel.add(r.id)):_sel.clear();render()});
  _el.querySelectorAll("[data-sel]").forEach(b=>b.addEventListener("change",()=>{b.checked?_sel.add(b.dataset.sel):_sel.delete(b.dataset.sel);const q=_el?.querySelector("#qtd-sel");if(q)q.textContent=_sel.size}));
  _el.querySelectorAll("[data-editar]").forEach(b=>b.addEventListener("click",()=>editModal(b.dataset.editar)));
  _el.querySelectorAll("[data-pagar]").forEach(b=>b.addEventListener("click",()=>markPago(b.dataset.pagar)));
  _el.querySelectorAll("[data-wa]").forEach(b=>b.addEventListener("click",()=>sendWa(b.dataset.wa)));
  _el.querySelector("#btn-pagar-lote")?.addEventListener("click",pagarLote);
  _el.querySelector("#btn-export")?.addEventListener("click",exportCsv);
}
async function markPago(id){
  if(!confirm("Marcar como pago?"))return;
  const row=_data.find(r=>r.id===id);if(!row)return;
  const nd={...row.dados,status:"pago",data_pagamento:_td()};
  try{const{error}=await g.from("lancamentos").update({dados:nd}).eq("id",id);if(error)throw error;c.ok("Marcado como pago.");_sel.delete(id);await loadData()}catch(e){c.err("Erro: "+e.message)}
}
async function pagarLote(){
  if(!_sel.size){c.err("Selecione ao menos um lançamento.");return}
  if(!confirm(`Marcar ${_sel.size} lançamento(s) como pagos?`))return;
  const today=_td();let ok=0,fail=0;
  for(const id of _sel){const row=_data.find(r=>r.id===id);if(!row)continue;const nd={...row.dados,status:"pago",data_pagamento:today};try{const{error}=await g.from("lancamentos").update({dados:nd}).eq("id",id);if(error)throw error;ok++}catch{fail++}}
  c.ok(`${ok} marcado(s) como pago(s).${fail?" "+fail+" erro(s).":""}`);_sel.clear();await loadData();
}
async function sendWa(clienteId){
  if(!clienteId){c.err("Cliente sem ID.");return}
  c.ok("Enviando cobrança…");
  try{const{data,error}=await g.functions.invoke("whatsapp-lembretes",{body:{clienteId}});if(error||(data&&data.error))throw new Error((error&&error.message)||(data&&data.error));const n=(data&&data.enviados)??0;c.ok(n>0?`✅ ${n} mensagem(ns) enviada(s)!`:"Nenhuma fatura encontrada.")}catch(e){c.err("Erro: "+e.message)}
}
function exportCsv(){
  const rows=filtered();
  const header=["Cliente","Negócio","Descrição","Valor","Vencimento","Data Pagamento","Forma Pgto","Status"];
  const csv=[header.join(";"),...rows.map(r=>[r.cliente,r.negocio,r.descricao,String(r.valor).replace(".",","),r.data_vencimento,r.data_pagamento,r.forma_pagamento,(ST[r._stEf]||{label:r._stEf}).label].map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(";"))].join("\n");
  const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="cobrancas.csv";document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url)},100);
}
async function editModal(id){
  const row=_data.find(r=>r.id===id);if(!row){c.err("Lançamento não encontrado.");return}
  const d=row.dados||{};
  const negs=[...new Set(_data.map(r=>r.negocio).filter(Boolean))].sort();
  const st=(d.status||"pendente").toLowerCase();
  const hasPag=["pago","parcial"].includes(st);
  const negOpts=negs.map(n=>`<option value="${esc(n)}"${n===d.negocio?" selected":""}>${esc(n)}</option>`).join("") + (!negs.includes(d.negocio||"")&&d.negocio?`<option value="${esc(d.negocio)}" selected>${esc(d.negocio)}</option>`:"");
  const ov=document.createElement("div");
  ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:2000;padding:16px;";
  ov.innerHTML=`<div style="background:#fff;color:#0f172a;border-radius:14px;max-width:440px;width:100%;padding:22px;font-family:Inter,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.25);">
  <div style="font-weight:700;font-size:16px;margin-bottom:16px;">Editar lançamento</div>
  <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Descrição</label>
  <input id="ef-desc" value="${esc(d.descricao)}" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">
  <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Valor (R$)</label>
  <input id="ef-valor" type="number" step="0.01" value="${esc(d.valor)}" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">
  <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Vencimento</label>
  <input id="ef-venc" type="date" value="${esc((d.data_vencimento||d.data||"").slice(0,10))}" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">
  <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Negócio</label>
  <select id="ef-neg" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">${negOpts||`<option value="">—</option>`}</select>
  <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Status</label>
  <select id="ef-st" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">
    <option value="pendente"${st==="pendente"?" selected":""}>Pendente</option>
    <option value="pago"${st==="pago"?" selected":""}>Pago</option>
    <option value="parcial"${st==="parcial"?" selected":""}>Parcial</option>
    <option value="agendado"${st==="agendado"?" selected":""}>Agendado</option>
    <option value="cancelado"${st==="cancelado"?" selected":""}>Cancelado</option>
  </select>
  <div id="ef-dpag-wrap" style="display:${hasPag?"block":"none"};">
    <label style="font-size:12px;color:#64748b;display:block;margin-bottom:2px;">Data de pagamento</label>
    <input id="ef-dpag" type="date" value="${esc((d.data_pagamento||"").slice(0,10))}" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:10px;background:#fff;color:#0f172a;">
  </div>
  <div style="display:flex;justify-content:space-between;gap:8px;margin-top:6px;">
    <button id="ef-excluir" style="padding:9px 14px;border:1px solid #fca5a5;color:#b91c1c;background:#fff;border-radius:8px;cursor:pointer;">Excluir</button>
    <div style="display:flex;gap:8px;">
      <button id="ef-cancel" style="padding:9px 14px;border:1px solid #e2e8f0;background:#fff;color:#0f172a;border-radius:8px;cursor:pointer;">Cancelar</button>
      <button id="ef-save" style="padding:9px 16px;border:none;background:#2563eb;color:#fff;border-radius:8px;cursor:pointer;font-weight:600;">Salvar</button>
    </div>
  </div>
  </div>`;
  document.body.appendChild(ov);
  ov.querySelector("#ef-st").addEventListener("change",e=>{const isPag=["pago","parcial"].includes(e.target.value);const wrap=ov.querySelector("#ef-dpag-wrap");if(wrap)wrap.style.display=isPag?"block":"none";if(isPag){const dp=ov.querySelector("#ef-dpag");if(dp&&!dp.value)dp.value=_td()}});
  let df=false;
  ov.addEventListener("mousedown",e=>{df=e.target===ov});
  ov.addEventListener("click",e=>{if(e.target===ov&&df)ov.remove();df=false});
  ov.querySelector("#ef-cancel").addEventListener("click",()=>ov.remove());
  ov.querySelector("#ef-save").addEventListener("click",async()=>{
    const venc=ov.querySelector("#ef-venc").value,newSt=ov.querySelector("#ef-st").value,dpag=ov.querySelector("#ef-dpag").value;
    const nd={...d,descricao:ov.querySelector("#ef-desc").value,valor:Number(ov.querySelector("#ef-valor").value)||0,status:newSt,negocio:ov.querySelector("#ef-neg").value};
    if(venc){nd.data_vencimento=venc;nd.mes_ref=venc.slice(0,7)}
    if(["pago","parcial"].includes(newSt))nd.data_pagamento=dpag||_td();
    try{const{error}=await g.from("lancamentos").update({dados:nd}).eq("id",id);if(error)throw error;c.ok("Salvo com sucesso!");ov.remove();await loadData()}catch(e2){c.err("Erro ao salvar: "+e2.message)}
  });
  ov.querySelector("#ef-excluir").addEventListener("click",async()=>{
    if(!confirm("Excluir este lançamento? Essa ação não tem volta."))return;
    try{const{error}=await g.from("lancamentos").delete().eq("id",id);if(error)throw error;c.ok("Lançamento excluído.");ov.remove();await loadData()}catch(e2){c.err("Erro ao excluir: "+e2.message)}
  });
}
async function initCobrancas(element){
  _el=element;_busca="";_negocio="";_status="aberto";_de="";_ate="";_sel=new Set;
  _el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;">Carregando…</div>';
  await loadData();
}
export{initCobrancas};
