import{j as g,t as c,f as D,b as z}from"./page-dashboard-Dbqm2OjXbF1.js";import"./supabase-DthfXWp1F1.js";
let _el=null,_tab="extrato",_de="",_ate="",_negocio="",_tipo="Todos",_statuses=new Set(["pago","pendente"]),_data=[],_pg=1;
const PS=50;
const td=()=>new Date().toISOString().slice(0,10);
const ST={pago:{label:"Pago",bg:"#dcfce7",cor:"#166534"},parcial:{label:"Parcial",bg:"#ffedd5",cor:"#c2410c"},agendado:{label:"Agendado",bg:"#dbeafe",cor:"#1d4ed8"},pendente:{label:"Pendente",bg:"#fef3c7",cor:"#92400e"},vencido:{label:"Vencido",bg:"#fee2e2",cor:"#991b1b"},cancelado:{label:"Cancelado",bg:"#f3f4f6",cor:"#6b7280"}};
function stEf(r){const s=(r.status||"pendente").toLowerCase();if(s==="pago"||s==="cancelado"||s==="parcial"||s==="agendado")return s;const v=r.data_vencimento||"";return v&&v<td()?"vencido":"pendente"}
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}
async function loadData(){
  if(!_de||!_ate){render();return}
  try{
    const{data,error}=await g.from("lancamentos").select("id,dados").gte("dados->>data_vencimento",_de).lte("dados->>data_vencimento",_ate).order("dados->>data_vencimento",{ascending:true});
    if(error)throw error;
    _data=(data||[]).map(r=>{const d=r.dados||{};return{id:r.id,tipo:(d.tipo||"receita").toLowerCase(),negocio:d.negocio||"",descricao:d.descricao||"",cliente:d.clienteNome||d.nome||d.cliente||"",clienteId:d.clienteId||"",valor:Number(d.valor||0),status:d.status||"pendente",data_vencimento:d.data_vencimento||d.data||"",data_pagamento:d.data_pagamento||"",forma_pagamento:d.forma_pagamento||"",mes_ref:d.mes_ref||"",dados:d}});
    _pg=1;render();
  }catch(e){c.err("Erro ao carregar: "+e.message)}
}
function filtered(){
  let rows=_data.map(r=>({...r,_stEf:stEf(r)}));
  if(_negocio)rows=rows.filter(r=>r.negocio===_negocio);
  if(_tipo!=="Todos")rows=rows.filter(r=>r.tipo===_tipo.toLowerCase());
  if(_statuses.size)rows=rows.filter(r=>_statuses.has(r._stEf));
  return rows;
}
function kpis(){
  const rows=filtered();
  const rec=rows.filter(r=>r.tipo==="receita").reduce((s,r)=>s+r.valor,0);
  const desp=rows.filter(r=>r.tipo==="despesa").reduce((s,r)=>s+r.valor,0);
  const saldo=rec-desp;
  const margem=rec>0?Math.round(saldo/rec*100):null;
  return{rec,desp,saldo,margem};
}
function tabsHtml(){
  const T=[["extrato","📋 Extrato"],["fluxo","📊 Fluxo Negócio"],["dre","📈 DRE"],["abc","🏅 Curva ABC"]];
  return T.map(([k,l])=>`<button data-tab="${k}" style="padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:${_tab===k?"none":"1px solid var(--border,#e5e7eb)"};background:${_tab===k?"var(--primary,#2563eb)":"transparent"};color:${_tab===k?"#fff":"var(--text,#111)"};">${l}</button>`).join("")
}
function filtersHtml(){
  const negs=[...new Set(_data.map(r=>r.negocio).filter(Boolean))].sort();
  const chips=["pago","pendente","vencido","parcial","agendado","cancelado"];
  return`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">
    <span style="font-size:12px;color:var(--text-2,#6b7280);">De</span>
    <input id="fil-de" type="date" value="${_de}" style="padding:7px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
    <span style="font-size:12px;color:var(--text-2,#6b7280);">Até</span>
    <input id="fil-ate" type="date" value="${_ate}" style="padding:7px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
    <select id="fil-neg" style="padding:7px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
      <option value="">Todos os negócios</option>${negs.map(n=>`<option value="${esc(n)}"${_negocio===n?" selected":""}>${esc(n)}</option>`).join("")}
    </select>
    <select id="fil-tipo" style="padding:7px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
      <option value="Todos"${_tipo==="Todos"?" selected":""}>Receitas + Despesas</option>
      <option value="Receita"${_tipo==="Receita"?" selected":""}>Receitas</option>
      <option value="Despesa"${_tipo==="Despesa"?" selected":""}>Despesas</option>
    </select>
    <button id="btn-export" style="padding:7px 14px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:var(--bg,#fff);color:var(--text-1,#111);font-size:13px;margin-left:auto;">⬇ CSV</button>
  </div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
    <span style="font-size:12px;color:var(--text-2,#6b7280);">Status:</span>
    ${chips.map(s=>{const sc=ST[s],a=_statuses.has(s);return`<button data-stchip="${s}" style="padding:4px 12px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid ${a?sc.cor:"var(--border,#e5e7eb)"};background:${a?sc.bg:"transparent"};color:${a?sc.cor:"var(--text-1,#111)"};font-weight:${a?"700":"400"};">${sc.label}</button>`}).join("")}
  </div>`;
}
function kpiHtml(){
  const k=kpis();
  const card=(l,v,bg,cor)=>`<div style="background:${bg};border-radius:10px;padding:14px 10px;text-align:center;"><div style="font-size:10px;color:${cor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;">${l}</div><div style="font-size:14px;font-weight:700;color:${cor};font-variant-numeric:tabular-nums;">${v}</div></div>`;
  return`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
    ${card("Total Receitas",D(k.rec),"#eff6ff","#1d4ed8")}
    ${card("Total Despesas",D(k.desp),"#fef2f2","#991b1b")}
    ${card("Saldo",D(k.saldo),k.saldo>=0?"#f0fdf4":"#fef2f2",k.saldo>=0?"#166534":"#991b1b")}
    ${card("Margem",k.margem!==null?k.margem+"%":"—","#faf5ff","#7c3aed")}
  </div>`;
}
function extrTab(){
  const rows=filtered().sort((a,b)=>(a.data_vencimento||"").localeCompare(b.data_vencimento||""));
  const tot=rows.length,pages=Math.ceil(tot/PS)||1;
  if(_pg>pages)_pg=pages;
  const hasPago=_statuses.has("pago");
  let sBase=0;
  if(hasPago){for(const r of rows.slice(0,(_pg-1)*PS))if(r._stEf==="pago")sBase+=r.tipo==="receita"?r.valor:-r.valor;}
  let sAcum=sBase;
  const slice=rows.slice((_pg-1)*PS,_pg*PS);
  const rhtml=slice.map(r=>{
    const sc=ST[r._stEf]||ST.pendente;
    let sCell="";
    if(hasPago){if(r._stEf==="pago")sAcum+=r.tipo==="receita"?r.valor:-r.valor;sCell=`<td style="padding:9px 6px;text-align:right;font-size:12px;font-variant-numeric:tabular-nums;color:${r._stEf==="pago"?(sAcum>=0?"#059669":"#dc2626"):"#d1d5db"};">${r._stEf==="pago"?D(sAcum):"—"}</td>`}
    return`<tr style="border-bottom:1px solid var(--border,#f3f4f6);">
      <td style="padding:9px 6px;font-size:12px;color:var(--text-2,#6b7280);white-space:nowrap;">${r.data_vencimento?z(r.data_vencimento):"—"}</td>
      <td style="padding:9px 6px;font-size:12px;color:var(--text-2,#6b7280);white-space:nowrap;">${r.data_pagamento?z(r.data_pagamento):"—"}</td>
      <td style="padding:9px 6px;font-size:13px;color:var(--text-1,#111);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(r.descricao)}">${esc(r.descricao||"—")}</td>
      <td style="padding:9px 6px;font-size:12px;color:var(--text-2,#6b7280);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(r.cliente)}">${esc(r.cliente||"—")}</td>
      <td style="padding:9px 6px;font-size:12px;color:var(--text-2,#6b7280);">${esc(r.negocio||"—")}</td>
      <td style="padding:9px 6px;text-align:right;font-weight:700;color:${r.tipo==="receita"?"#059669":"#dc2626"};font-variant-numeric:tabular-nums;">${r.tipo==="despesa"?"−":""}${D(r.valor)}</td>
      <td style="padding:9px 6px;text-align:center;"><span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${sc.bg};color:${sc.cor};white-space:nowrap;">${sc.label}</span></td>
      <td style="padding:9px 6px;font-size:12px;color:var(--text-2,#6b7280);white-space:nowrap;">${esc(r.forma_pagamento||"—")}</td>
      ${sCell}
    </tr>`;
  }).join("");
  const cols=hasPago?9:8;
  const pag=pages>1?`<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;font-size:13px;padding:0 12px 12px;">
    <button data-pg="prev" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:var(--bg,#fff);color:var(--text-1,#111);"${_pg<=1?" disabled":""}>◀</button>
    <span style="color:var(--text-2,#6b7280);">Página ${_pg} de ${pages} · ${tot} registros</span>
    <button data-pg="next" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:var(--bg,#fff);color:var(--text-1,#111);"${_pg>=pages?" disabled":""}>▶</button>
  </div>`:"";
  return`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;border-bottom:2px solid var(--border,#e5e7eb);background:var(--bg,#f9fafb);">
      <th style="padding:8px 6px;text-align:left;white-space:nowrap;">Vencimento</th>
      <th style="padding:8px 6px;text-align:left;white-space:nowrap;">Pagamento</th>
      <th style="padding:8px 6px;text-align:left;">Descrição</th>
      <th style="padding:8px 6px;text-align:left;">Cliente/Fornecedor</th>
      <th style="padding:8px 6px;text-align:left;">Negócio</th>
      <th style="padding:8px 6px;text-align:right;">Valor (R$)</th>
      <th style="padding:8px 6px;text-align:center;">Status</th>
      <th style="padding:8px 6px;text-align:left;white-space:nowrap;">Forma Pgto</th>
      ${hasPago?'<th style="padding:8px 6px;text-align:right;white-space:nowrap;">Saldo Acum.</th>':""}
    </tr></thead>
    <tbody>${rhtml||`<tr><td colspan="${cols}" style="padding:48px;text-align:center;color:#9ca3af;">Nenhum lançamento encontrado.</td></tr>`}</tbody>
  </table></div>${pag}<div style="padding:8px 12px;font-size:12px;color:var(--text-3,#9ca3af);text-align:center;">${tot} registro(s) no período</div>`;
}
function fluxoTab(){
  const rows=filtered();
  const map={};
  for(const r of rows){const n=r.negocio||"(sem negócio)";if(!map[n])map[n]={neg:n,rec:0,desp:0};if(r.tipo==="receita")map[n].rec+=r.valor;else map[n].desp+=r.valor;}
  const ns=Object.values(map).map(n=>({...n,saldo:n.rec-n.desp})).sort((a,b)=>b.saldo-a.saldo);
  const tR=ns.reduce((s,n)=>s+n.rec,0),tD=ns.reduce((s,n)=>s+n.desp,0),tS=tR-tD;
  const rhtml=ns.map(n=>`<tr style="border-bottom:1px solid var(--border,#f3f4f6);">
    <td style="padding:10px 12px;font-weight:600;font-size:13px;color:var(--text-1,#111);">${esc(n.neg)}</td>
    <td style="padding:10px 12px;text-align:right;color:#059669;font-weight:600;font-variant-numeric:tabular-nums;">${D(n.rec)}</td>
    <td style="padding:10px 12px;text-align:right;color:#dc2626;font-weight:600;font-variant-numeric:tabular-nums;">${D(n.desp)}</td>
    <td style="padding:10px 12px;text-align:right;font-weight:700;color:${n.saldo>=0?"#059669":"#dc2626"};font-variant-numeric:tabular-nums;">${D(n.saldo)}</td>
    <td style="padding:10px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">${n.rec>0?Math.round(n.saldo/n.rec*100)+"%":"—"}</td>
  </tr>`).join("");
  return`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border,#e5e7eb);">
      <th style="padding:10px 12px;text-align:left;font-size:12px;color:var(--text-2,#6b7280);">Negócio</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;color:#059669;">Receitas</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;color:#dc2626;">Despesas</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">Saldo</th>
      <th style="padding:10px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">Margem</th>
    </tr></thead>
    <tbody>${rhtml||'<tr><td colspan="5" style="padding:48px;text-align:center;color:#9ca3af;">Nenhum dado no período.</td></tr>'}</tbody>
    <tfoot><tr style="background:var(--bg,#f9fafb);border-top:2px solid var(--border,#e5e7eb);">
      <td style="padding:10px 12px;font-weight:700;font-size:13px;">Total</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:#059669;font-variant-numeric:tabular-nums;">${D(tR)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:#dc2626;font-variant-numeric:tabular-nums;">${D(tD)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:${tS>=0?"#059669":"#dc2626"};font-variant-numeric:tabular-nums;">${D(tS)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:var(--text-2,#6b7280);">${tR>0?Math.round(tS/tR*100)+"%":"—"}</td>
    </tr></tfoot>
  </table></div>`;
}
function dreTab(){
  const rows=filtered();
  const rec=rows.filter(r=>r.tipo==="receita").reduce((s,r)=>s+r.valor,0);
  const desp=rows.filter(r=>r.tipo==="despesa").reduce((s,r)=>s+r.valor,0);
  const res=rec-desp;
  const mg=rec>0?Math.round(res/rec*100):null;
  const row=(l,v,cor,indent,grande,dest,noBorder)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:${grande?"14px":"11px"} 16px${indent?";padding-left:32px":""};${dest?"background:var(--bg,#f9fafb);":""}${noBorder?"":"border-top:1px solid var(--border,#f3f4f6);"}">
    <div style="font-size:${grande?"14px":"13px"};font-weight:${grande?"700":"500"};color:${cor||"var(--text,#111)"};">${l}</div>
    <div style="font-size:${grande?"16px":"14px"};font-weight:700;color:${cor||"var(--text,#111)"};font-variant-numeric:tabular-nums;">${v}</div>
  </div>`;
  return`${row("Receita Bruta",D(rec),"var(--text,#111)",false,false,false,true)}
    ${row("(−) Total de Despesas",D(desp),"#dc2626",true,false,false,false)}
    ${row("= Resultado do Período",D(res),res>=0?"#059669":"#dc2626",false,true,true,false)}
    ${row("Margem %",mg!==null?mg+"%":"—",mg===null?"#9ca3af":mg>=0?"#059669":"#dc2626",false,false,false,false)}
    <div style="padding:10px 16px;font-size:12px;color:var(--text-muted,#9ca3af);border-top:1px solid var(--border,#f3f4f6);">Versão simplificada — sem separação de custos diretos vs operacionais.</div>`;
}
function abcTab(){
  const rows=filtered().filter(r=>r.tipo==="receita");
  const map={};
  for(const r of rows){const nm=r.cliente||r.descricao||"(sem nome)";if(!map[nm])map[nm]={nome:nm,total:0,qtd:0};map[nm].total+=r.valor;map[nm].qtd++;}
  const cl=Object.values(map).sort((a,b)=>b.total-a.total);
  const tot=cl.reduce((s,cc)=>s+cc.total,0);
  let ac=0;
  for(const cc of cl){ac+=cc.total;cc.pct=tot>0?cc.total/tot*100:0;cc.acum=tot>0?ac/tot*100:0;cc.kl=cc.acum<=80?"A":cc.acum<=95?"B":"C";}
  const corC={A:"#059669",B:"#d97706",C:"#dc2626"};
  const bgC={A:"#d1fae5",B:"#fef3c7",C:"#fee2e2"};
  const rhtml=cl.map((cc,i)=>`<tr style="border-bottom:1px solid var(--border,#f3f4f6);">
    <td style="padding:9px 12px;font-size:12px;color:var(--text-muted,#9ca3af);">${i+1}</td>
    <td style="padding:9px 12px;font-weight:600;font-size:13px;color:var(--text-1,#111);">${esc(cc.nome)}</td>
    <td style="padding:9px 12px;text-align:right;color:#059669;font-weight:600;font-variant-numeric:tabular-nums;">${D(cc.total)}</td>
    <td style="padding:9px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">${cc.pct.toFixed(1)}%</td>
    <td style="padding:9px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">${cc.acum.toFixed(1)}%</td>
    <td style="padding:9px 12px;text-align:center;"><span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700;background:${bgC[cc.kl]};color:${corC[cc.kl]};">${cc.kl}</span></td>
  </tr>`).join("");
  return`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;">
    <thead><tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border,#e5e7eb);">
      <th style="padding:9px 12px;text-align:left;font-size:12px;color:var(--text-2,#6b7280);">#</th>
      <th style="padding:9px 12px;text-align:left;font-size:12px;color:var(--text-2,#6b7280);">Cliente</th>
      <th style="padding:9px 12px;text-align:right;font-size:12px;color:#059669;">Total recebido</th>
      <th style="padding:9px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">% próprio</th>
      <th style="padding:9px 12px;text-align:right;font-size:12px;color:var(--text-2,#6b7280);">% acum.</th>
      <th style="padding:9px 12px;text-align:center;font-size:12px;color:var(--text-2,#6b7280);">Classe</th>
    </tr></thead>
    <tbody>${rhtml||'<tr><td colspan="6" style="padding:48px;text-align:center;color:#9ca3af;">Nenhuma receita no período.</td></tr>'}</tbody>
  </table></div>`;
}
function exportCsv(){
  const rows=filtered();
  let hdr,csvR;
  if(_tab==="extrato"){
    hdr=["Vencimento","Pagamento","Descrição","Cliente/Fornecedor","Negócio","Tipo","Valor","Status","Forma Pgto"];
    csvR=rows.map(r=>[r.data_vencimento,r.data_pagamento,r.descricao,r.cliente,r.negocio,r.tipo,String(r.valor).replace(".",","),ST[r._stEf]?.label||r._stEf,r.forma_pagamento].map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(";"));
  }else if(_tab==="fluxo"){
    hdr=["Negócio","Receitas","Despesas","Saldo","Margem %"];
    const map={};for(const r of rows){const n=r.negocio||"(sem negócio)";if(!map[n])map[n]={neg:n,rec:0,desp:0};if(r.tipo==="receita")map[n].rec+=r.valor;else map[n].desp+=r.valor;}
    csvR=Object.values(map).map(n=>({...n,saldo:n.rec-n.desp})).sort((a,b)=>b.saldo-a.saldo).map(n=>[n.neg,String(n.rec).replace(".",","),String(n.desp).replace(".",","),String(n.saldo).replace(".",","),n.rec>0?Math.round(n.saldo/n.rec*100)+"%":"—"].map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(";"));
  }else if(_tab==="dre"){
    const rec=rows.filter(r=>r.tipo==="receita").reduce((s,r)=>s+r.valor,0);
    const desp=rows.filter(r=>r.tipo==="despesa").reduce((s,r)=>s+r.valor,0);
    const res=rec-desp;
    hdr=["Item","Valor"];
    csvR=[["Receita Bruta",rec],["Total Despesas",desp],["Resultado",res],["Margem %",rec>0?Math.round(res/rec*100)+"%":"—"]].map(([l,v])=>[`"${l}"`,`"${String(v).replace(".",",")}"`].join(";"));
  }else{
    hdr=["#","Cliente","Total","% próprio","% acum.","Classe"];
    const map2={};for(const r of rows.filter(r=>r.tipo==="receita")){const nm=r.cliente||r.descricao||"";if(!map2[nm])map2[nm]={nome:nm,total:0};map2[nm].total+=r.valor;}
    const cl=Object.values(map2).sort((a,b)=>b.total-a.total);const totA=cl.reduce((s,cc)=>s+cc.total,0);let acA=0;
    csvR=cl.map((cc,i)=>{acA+=cc.total;const p=totA>0?cc.total/totA*100:0;const ap=totA>0?acA/totA*100:0;const k=ap<=80?"A":ap<=95?"B":"C";return[i+1,cc.nome,String(cc.total).replace(".",","),p.toFixed(1)+"%",ap.toFixed(1)+"%",k].map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(";")});
  }
  const csv=[hdr.join(";"),...csvR].join("\n");
  const blob=new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=`relatorio-${_tab}-${_de}-${_ate}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url)},100);
}
function render(){
  if(!_el)return;
  let tabContent;
  if(_tab==="extrato")tabContent=extrTab();
  else if(_tab==="fluxo")tabContent=fluxoTab();
  else if(_tab==="dre")tabContent=dreTab();
  else tabContent=abcTab();
  _el.innerHTML=`<div style="padding:16px 20px;max-width:1100px;font-family:Inter,sans-serif;">
  <h1 style="font-size:20px;font-weight:700;margin:0 0 16px;color:var(--text-1,#111);">Relatórios Financeiros</h1>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">${tabsHtml()}</div>
  ${filtersHtml()}
  ${kpiHtml()}
  <div style="background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">${tabContent}</div>
</div>`;
  _el.querySelector("#fil-de")?.addEventListener("change",e=>{_de=e.target.value;_pg=1;loadData()});
  _el.querySelector("#fil-ate")?.addEventListener("change",e=>{_ate=e.target.value;_pg=1;loadData()});
  _el.querySelector("#fil-neg")?.addEventListener("change",e=>{_negocio=e.target.value;_pg=1;render()});
  _el.querySelector("#fil-tipo")?.addEventListener("change",e=>{_tipo=e.target.value;_pg=1;render()});
  _el.querySelectorAll("[data-stchip]").forEach(b=>b.addEventListener("click",()=>{const s=b.dataset.stchip;if(_statuses.has(s))_statuses.delete(s);else _statuses.add(s);_pg=1;render()}));
  _el.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{_tab=b.dataset.tab;render()}));
  _el.querySelector("#btn-export")?.addEventListener("click",exportCsv);
  _el.querySelector("[data-pg='prev']")?.addEventListener("click",()=>{if(_pg>1){_pg--;render()}});
  _el.querySelector("[data-pg='next']")?.addEventListener("click",()=>{const r=filtered();const p=Math.ceil(r.length/PS)||1;if(_pg<p){_pg++;render()}});
}
async function initRelatorios(el){
  _el=el;_tab="extrato";_negocio="";_tipo="Todos";_statuses=new Set(["pago","pendente"]);_pg=1;
  const now=new Date();
  _de=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-01`;
  _ate=now.toISOString().slice(0,10);
  _el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;">Carregando…</div>';
  await loadData();
}
export{initRelatorios};
