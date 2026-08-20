import{t as _,a as B,u as C,N as H,f as l}from"./page-dashboard-Dbqm2OjXbF1.js";import"./supabase-DthfXWp1F1.js";let n=null,$="fluxo",E=6;const R=new Date;let f=R.getFullYear(),b=R.getMonth(),x=R.getFullYear(),g=R.getMonth();const z=new Map;function D(r,a){return`${r}-${String(a+1).padStart(2,"0")}`}function S(r,a,o){let s=a+o,d=r;for(;s<0;)s+=12,d-=1;for(;s>11;)s-=12,d+=1;return{ano:d,mes:s}}function Y(){const r=[];for(let a=E-1;a>=0;a--)r.push(S(f,b,-a));return r}async function P(r,a){const o=D(r,a);if(z.has(o))return z.get(o);const{items:s}=await B("lancamentos","*",{limit:500,filtros:{"dados->>mes_ref":o}}),d=C("lancamentos",s);return z.set(o,d),d}async function h(){A();try{const r=Y();await Promise.all(r.map(({ano:a,mes:o})=>P(a,o)))}catch(r){_.err("Erro ao carregar relatório: "+r.message)}finally{I()}}async function L(){A();try{await P(x,g)}catch(r){_.err("Erro ao carregar DRE: "+r.message)}finally{K()}}function A(){n&&(n.innerHTML=`
    <div style="padding:16px;max-width:800px;">
      ${F()}
      <div style="padding:32px;text-align:center;color:var(--text-muted,#9ca3af);">
        <div style="font-size:24px;margin-bottom:8px;">⏳</div>
        <div>Carregando dados…</div>
      </div>
    </div>
  `,j())}function F(){const r=(a,o)=>`
    <button data-tab="${a}" style="
      padding:8px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;
      border:${$===a?"none":"1px solid var(--border,#e5e7eb)"};
      background:${$===a?"var(--primary,#2563eb)":"transparent"};
      color:${$===a?"#fff":"var(--text,#111)"};
    ">${o}</button>
  `;return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h1 style="font-size:20px;font-weight:700;margin:0;">Relatórios</h1>
      <div style="display:flex;gap:8px;">
        ${r("fluxo","📊 Fluxo de Caixa")}
        ${r("dre","📋 DRE")}
      </div>
    </div>
  `}function j(){n==null||n.querySelectorAll("[data-tab]").forEach(r=>{r.addEventListener("click",()=>{$=r.dataset.tab,$==="fluxo"?h():L()})})}function gt_modal(titulo,lancs){const ov=document.createElement("div");ov.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";const grp={};for(const c of lancs){const cat=c.categoria||"Sem categoria";if(!grp[cat])grp[cat]={total:0,items:[]};grp[cat].total+=Number(c.valor)||0;grp[cat].items.push(c);}const gs=Object.entries(grp).sort((a,b)=>b[1].total-a[1].total);const totalGeral=lancs.reduce((s,c)=>s+(Number(c.valor)||0),0);const rows=gs.map(([cat,{total,items}],idx)=>{const cor=items.every(c=>c.tipo==="receita")?"#059669":items.every(c=>c.tipo==="despesa")?"#dc2626":"#6b7280";return`<div style="border-bottom:1px solid var(--border,#f3f4f6);"><div data-tgl="${idx}" style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;cursor:pointer;user-select:none;"><div style="display:flex;align-items:center;gap:10px;"><span data-arr="${idx}" style="font-size:10px;color:#9ca3af;display:inline-block;transition:transform .2s;">▶</span><div><div style="font-size:13px;font-weight:600;color:var(--text,#111);">${cat}</div><div style="font-size:11px;color:#9ca3af;">${items.length} lançamento${items.length>1?"s":""}</div></div></div><div style="font-weight:700;color:${cor};">${l(total)}</div></div><div data-det="${idx}" style="display:none;padding-bottom:8px;">${items.sort((a,b)=>(b.data||"").localeCompare(a.data||"")).map(c=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0 7px 24px;border-top:1px solid var(--border,#f9fafb);"><div style="font-size:12px;color:var(--text-2,#374151);min-width:0;flex:1;margin-right:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.data||c.mes_ref||"—"} · ${c.descricao||"—"}</div><div style="font-size:12px;font-weight:600;white-space:nowrap;color:${c.tipo==="receita"?"#059669":"#dc2626"};">${l(Number(c.valor)||0)}</div></div>`).join("")}</div></div>`}).join("");const body=lancs.length===0?'<p style="color:#9ca3af;text-align:center;padding:24px;">Nenhum lançamento.</p>':rows;ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:16px;padding:20px;width:100%;max-width:560px;max-height:80vh;overflow-y:auto;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h3 style="margin:0;font-size:15px;font-weight:700;">${titulo}</h3><button id="_gtmc" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text,#111);line-height:1;">✕</button></div><div style="font-size:12px;color:#9ca3af;margin-bottom:14px;padding-bottom:12px;border-bottom:2px solid var(--border,#e5e7eb);">${lancs.length} lançamento${lancs.length>1?"s":""} · Total: <strong style="color:var(--text,#111);">${l(totalGeral)}</strong></div>${body}</div>`;document.body.appendChild(ov);ov.querySelectorAll("[data-tgl]").forEach(el=>{el.addEventListener("click",()=>{const i=el.dataset.tgl;const det=ov.querySelector(`[data-det="${i}"]`);const arr=ov.querySelector(`[data-arr="${i}"]`);const open=det.style.display!=="none";det.style.display=open?"none":"block";arr.style.transform=open?"":"rotate(90deg)";});});ov.querySelector("#_gtmc").addEventListener("click",()=>ov.remove());ov.addEventListener("click",e=>{if(e.target===ov)ov.remove();});}function I(){var y,M,k;if(!n)return;const r=Y(),a=new Date,o=f===a.getFullYear()&&b===a.getMonth(),s=r.map(({ano:t,mes:e})=>{const i=(z.get(D(t,e))??[]).filter(c=>c.status==="pago"&&c.tipo!=="transferencia"),q=i.filter(c=>c.tipo==="receita").reduce((c,T)=>c+(Number(T.valor)||0),0),N=i.filter(c=>c.tipo==="despesa").reduce((c,T)=>c+(Number(T.valor)||0),0);return{ano:t,mes:e,entradas:q,saidas:N,resultado:q-N}}),d=s.reduce((t,e)=>t+e.entradas,0),v=s.reduce((t,e)=>t+e.saidas,0),u=d-v,m=s.map(t=>`
    <tr data-mes-click="${t.ano}-${t.mes}" style="border-bottom:1px solid var(--border,#f3f4f6);cursor:pointer;" title="Ver lançamentos de ${H[t.mes]}/${t.ano}">
      <td style="padding:10px 12px;font-weight:600;white-space:nowrap;">${H[t.mes]}/${t.ano}</td>
      <td style="padding:10px 12px;text-align:right;color:#059669;font-weight:500;">${l(t.entradas)}</td>
      <td style="padding:10px 12px;text-align:right;color:#dc2626;font-weight:500;">${l(t.saidas)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:${t.resultado>=0?"#059669":"#dc2626"};">${l(t.resultado)}</td>
    </tr>
  `).join("");n.innerHTML=`
    <div style="padding:16px;max-width:800px;">
      ${F()}

      <!-- Controles -->
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${[3,6,12].map(t=>`
          <button data-periodo="${t}" style="
            padding:6px 14px;border-radius:8px;font-size:13px;cursor:pointer;
            border:1px solid ${E===t?"var(--primary,#2563eb)":"var(--border,#e5e7eb)"};
            background:${E===t?"var(--primary,#2563eb)":"transparent"};
            color:${E===t?"#fff":"var(--text,#111)"};
          ">Últimos ${t} meses</button>
        `).join("")}
        <div style="margin-left:auto;display:flex;gap:4px;">
          <button data-action="prev" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;">◀</button>
          ${o?"":'<button data-action="hoje" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;">Hoje</button>'}
          <button data-action="next" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;">▶</button>
        </div>
      </div>

      <!-- KPIs clicáveis -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
        ${w("📈 Total entradas",l(d),"#059669","receita")}
        ${w("📉 Total saídas",l(v),"#dc2626","despesa")}
        ${w("💰 Resultado",l(u),u>=0?"#059669":"#dc2626","todos")}
      </div>

      <!-- Tabela -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg,#f9fafb);border-bottom:2px solid var(--border,#e5e7eb);">
                <th style="padding:10px 12px;text-align:left;font-size:13px;color:var(--text-muted,#6b7280);">Mês</th>
                <th style="padding:10px 12px;text-align:right;font-size:13px;color:var(--text-muted,#6b7280);">Entradas</th>
                <th style="padding:10px 12px;text-align:right;font-size:13px;color:var(--text-muted,#6b7280);">Saídas</th>
                <th style="padding:10px 12px;text-align:right;font-size:13px;color:var(--text-muted,#6b7280);">Resultado</th>
              </tr>
            </thead>
            <tbody>${m||'<tr><td colspan="4" style="padding:32px;text-align:center;color:var(--text-muted,#9ca3af);">Nenhum dado no período.</td></tr>'}</tbody>
            <tfoot>
              <tr style="background:var(--bg,#f9fafb);border-top:2px solid var(--border,#e5e7eb);">
                <td style="padding:10px 12px;font-weight:700;">Total</td>
                <td style="padding:10px 12px;text-align:right;font-weight:700;color:#059669;">${l(d)}</td>
                <td style="padding:10px 12px;text-align:right;font-weight:700;color:#dc2626;">${l(v)}</td>
                <td style="padding:10px 12px;text-align:right;font-weight:700;color:${u>=0?"#059669":"#dc2626"};">${l(u)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <p style="font-size:12px;color:var(--text-muted,#9ca3af);margin-top:10px;">
        Mostra somente lançamentos com status "Pago" — receitas e despesas realizadas. Transferências são excluídas.
      </p>
    </div>
  `,j(),n.querySelectorAll("[data-periodo]").forEach(t=>{t.addEventListener("click",()=>{E=Number(t.dataset.periodo),h()})}),(y=n.querySelector('[data-action="prev"]'))==null||y.addEventListener("click",()=>{const{ano:t,mes:e}=S(f,b,-1);f=t,b=e,h()}),(M=n.querySelector('[data-action="next"]'))==null||M.addEventListener("click",()=>{const{ano:t,mes:e}=S(f,b,1);f=t,b=e,h()}),(k=n.querySelector('[data-action="hoje"]'))==null||k.addEventListener("click",()=>{const t=new Date;f=t.getFullYear(),b=t.getMonth(),h()});n.querySelectorAll("[data-detalhe]").forEach(el=>{el.addEventListener("click",()=>{const tipo=el.dataset.detalhe,lancs=r.flatMap(({ano,mes})=>(z.get(D(ano,mes))??[]).filter(c=>c.status==="pago"&&c.tipo!=="transferencia")).filter(c=>tipo==="todos"||c.tipo===tipo),titulo=tipo==="receita"?"📈 Entradas do período":tipo==="despesa"?"📉 Saídas do período":"💰 Todas as transações";gt_modal(titulo,lancs)})});n.querySelectorAll("[data-mes-click]").forEach(el=>{el.addEventListener("click",()=>{const[ano,mes]=el.dataset.mesClick.split("-").map(Number),lancs=(z.get(D(ano,mes))??[]).filter(c=>c.status==="pago"&&c.tipo!=="transferencia");gt_modal(H[mes]+" / "+ano,lancs)})});}function K(){var M,k,t;if(!n)return;const a=(z.get(D(x,g))??[]).filter(e=>e.status==="pago"&&e.tipo!=="transferencia"),o=new Date,s=x===o.getFullYear()&&g===o.getMonth(),d=a.filter(e=>e.tipo==="receita").reduce((e,p)=>e+(Number(p.valor)||0),0),v=a.filter(e=>e.tipo==="despesa").reduce((e,p)=>e+(Number(p.valor)||0),0),u=d-v,m=d>0?Math.round(u/d*100):null,y=(e,p,i={})=>`
    <div style="
      display:flex;justify-content:space-between;align-items:center;
      padding:${i.grande?"14px":"10px"} 16px;
      border-top:${i.semBorda?"none":"1px solid var(--border,#f3f4f6)"};
      ${i.indent?"padding-left:32px;":""}
      ${i.destaque?"background:var(--bg,#f9fafb);":""}
    ">
      <div style="
        font-size:${i.grande?"14px":"13px"};
        font-weight:${i.grande?"700":i.negrito?"600":"400"};
        color:${i.cor||"var(--text,#111)"};
      ">${e}</div>
      <div style="
        font-size:${i.grande?"16px":"14px"};
        font-weight:${i.grande||i.negrito?"700":"500"};
        color:${i.cor||"var(--text,#111)"};
      ">${p}</div>
    </div>
  `;n.innerHTML=`
    <div style="padding:16px;max-width:800px;">
      ${F()}

      <!-- Navegador de mês -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <div style="font-size:16px;font-weight:600;flex:1;">
          ${H[g]} de ${x}
          ${s?'<span style="font-size:12px;color:var(--primary,#2563eb);font-weight:500;margin-left:8px;">mês atual</span>':""}
        </div>
        <div style="display:flex;gap:4px;">
          <button data-action="prev" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;">◀</button>
          ${s?"":'<button data-action="hoje" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;">Mês atual</button>'}
          <button data-action="next" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;">▶</button>
        </div>
      </div>

      <!-- DRE -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;margin-bottom:16px;">
        ${y("Receita Bruta",l(d),{negrito:!0,semBorda:!0})}
        ${y("(−) Total de despesas",l(-v),{indent:!0,cor:"#dc2626"})}
        ${y("= Resultado do período",l(u),{grande:!0,cor:u>=0?"#059669":"#dc2626",destaque:!0})}
      </div>

      <!-- KPIs clicáveis -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${w("📈 Receita bruta",l(d),"#059669","receita_dre")}
        ${w("📉 Total despesas",l(v),"#dc2626","despesa_dre")}
        ${w("📊 Margem",m!==null?m+"%":"—",m===null?"#9ca3af":m>=0?"#059669":"#dc2626")}
      </div>

      <p style="font-size:12px;color:var(--text-muted,#9ca3af);margin-top:12px;">
        Versão simplificada — sem separação de custos diretos vs operacionais. Mostra somente lançamentos pagos.
      </p>
    </div>
  `,j(),(M=n.querySelector('[data-action="prev"]'))==null||M.addEventListener("click",()=>{const{ano:e,mes:p}=S(x,g,-1);x=e,g=p,L()}),(k=n.querySelector('[data-action="next"]'))==null||k.addEventListener("click",()=>{const{ano:e,mes:p}=S(x,g,1);x=e,g=p,L()}),(t=n.querySelector('[data-action="hoje"]'))==null||t.addEventListener("click",()=>{const e=new Date;x=e.getFullYear(),g=e.getMonth(),L()});n.querySelectorAll("[data-detalhe]").forEach(el=>{el.addEventListener("click",()=>{const tipo=el.dataset.detalhe,allLanc=(z.get(D(x,g))??[]).filter(e=>e.status==="pago"&&e.tipo!=="transferencia"),lancs=tipo==="receita_dre"?allLanc.filter(e=>e.tipo==="receita"):tipo==="despesa_dre"?allLanc.filter(e=>e.tipo==="despesa"):allLanc,titulo=tipo==="receita_dre"?"📈 Receitas de "+H[g]+" / "+x:"📉 Despesas de "+H[g]+" / "+x;gt_modal(titulo,lancs)})});}function w(r,a,o,tipo){return`
    <div ${tipo?`data-detalhe="${tipo}"`:""}  style="background:var(--bg-card,#fff);border-radius:10px;padding:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);${tipo?"cursor:pointer;transition:opacity .15s;":""}">
      <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:6px;">${r}</div>
      <div style="font-size:18px;font-weight:700;color:${o};">${a}</div>
      ${tipo?'<div style="font-size:10px;color:var(--text-muted,#9ca3af);margin-top:4px;">clique para ver detalhes</div>':""}
    </div>
  `}async function G(r){n=r,$="fluxo";const a=new Date;f=a.getFullYear(),b=a.getMonth(),x=a.getFullYear(),g=a.getMonth(),await h()}export{G as initRelatorios};
