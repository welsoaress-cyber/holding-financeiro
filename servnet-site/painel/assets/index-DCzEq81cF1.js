import{r as A,s as u,h as k,f as C,a as I,u as F,t as z,N as T,b as V,i as O,e as R,g as Y}from"./page-dashboard-Dbqm2OjXbF1.js";import{m as S,u as H}from"./page-lancamentos-BfWtlLw7bF1.js";import"./supabase-DthfXWp1F1.js";let b=new Date().getFullYear(),l=new Date().getMonth()+1,y=null,w=!1,L=!1,c=null,g=null,E="",x="todos";function G(){return`${b}-${String(l).padStart(2,"0")}`}function M(){return`${T[l-1]} de ${b}`}function J(){l--,l<1&&(l=12,b--),y=null,w=!1,_(!0)}function K(){l++,l>12&&(l=1,b++),y=null,w=!1,_(!0)}function Q(){const e=new Date;b=e.getFullYear(),l=e.getMonth()+1,y=null,w=!1,_(!0)}function U(){let e=(u.get("despesas")??[]).filter(t=>t.tipo==="despesa");if(x==="pago"&&(e=e.filter(t=>t.status==="pago")),x==="pendente"&&(e=e.filter(t=>t.status==="pendente")),x==="vencido"&&(e=e.filter(t=>t.status==="pendente"&&t.data_vencimento&&t.data_vencimento<k())),E.trim()){const t=E.trim().toLowerCase();e=e.filter(n=>(n.descricao||"").toLowerCase().includes(t)||(n.categoria||"").toLowerCase().includes(t))}return e}function D(e,t,n){return`<button data-filtro-status="${n}" style="
    padding:4px 10px;font-size:12px;cursor:pointer;
    border:1px solid ${t?"#dc2626":"var(--border,#d1d5db)"};
    background:${t?"#dc2626":"var(--bg-card,#fff)"};
    color:${t?"#fff":"var(--text-muted,#6b7280)"};
    font-weight:${t?"600":"400"};white-space:nowrap;
  ">${e}</button>`}async function _(e=!1){if(L)return;L=!0;const t=`${b}-${String(l).padStart(2,"0")}-01`,n=new Date(b,l,0).toISOString().slice(0,10),s=[`dados->>mes_ref.eq.${G()}`,`and(dados->>data.gte.${t},dados->>data.lte.${n})`,`and(dados->>data_vencimento.gte.${t},dados->>data_vencimento.lte.${n})`].join(","),v={};g&&(v["dados->>negocio"]=g);try{const{items:i,hasMore:d,lastId:o}=await I("lancamentos","*",{cursor:e?null:y,filtros:v,orFiltro:s}),r=F("lancamentos",i);if(e)u.set("despesas",r);else{const p=u.get("despesas")??[];u.set("despesas",[...p,...r])}y=o,w=d}catch(i){console.error("[despesas]",i),z.err("Erro ao carregar despesas: "+i.message)}finally{L=!1,h()}}function W(e,t){const n=e.status==="pago",s=e.status==="cancelado",v=!n&&!s&&e.data_vencimento&&e.data_vencimento<k();let i,d,o;n?(i="#dcfce7",d="#166534",o="Pago"):v?(i="#fee2e2",d="#991b1b",o="Vencido"):s?(i="#f1f5f9",d="#64748b",o="Cancelado"):(i="#fef9c3",d="#92400e",o="Pendente");const r=s?"#94a3b8":"#dc2626",p=t%2===0?"var(--bg-card,#fff)":"var(--bg,#f8fafc)";return`
    <tr data-desp-id="${e.id}" style="
      cursor:pointer;background:${p};
      transition:background .1s;
    " onmouseover="this.style.background='#f0f9ff'"
       onmouseout="this.style.background='${p}'">
      <td style="padding:9px 10px;font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--text-muted,#64748b);white-space:nowrap;">
        ${V(e.data_vencimento||"")}
      </td>
      <td style="padding:9px 10px;font-size:13px;font-weight:500;color:var(--text,#0f172a);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${e.descricao||"—"}
      </td>
      <td style="padding:9px 10px;font-size:12px;color:var(--text-muted,#64748b);">
        ${e.categoria||"—"}
      </td>
      ${g?"":`<td style="padding:9px 10px;font-size:12px;color:var(--text-muted,#64748b);">${e.negocio||"—"}</td>`}
      <td style="padding:9px 10px;font-size:13px;font-weight:600;color:${r};text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">
        −${C(e.valor)}
      </td>
      <td style="padding:9px 10px;text-align:center;">
        <span style="
          display:inline-block;padding:2px 8px;border-radius:4px;
          background:${i};color:${d};
          font-size:11px;font-weight:600;white-space:nowrap;
        ">${o}</span>
      </td>
    </tr>
  `}function h(){var p,m,$,q,P;if(!c)return;const e=u.get("despesas")??[],t=U(),n=new Date,s=b===n.getFullYear()&&l===n.getMonth()+1,v=e.filter(a=>a.tipo==="despesa").reduce((a,f)=>a+(Number(f.valor)||0),0),i=e.filter(a=>a.tipo==="despesa"&&a.status==="pago").reduce((a,f)=>a+(Number(f.valor)||0),0),d=e.filter(a=>a.tipo==="despesa"&&a.status==="pendente").reduce((a,f)=>a+(Number(f.valor)||0),0),o=e.filter(a=>a.tipo==="despesa"&&a.status==="pendente"&&a.data_vencimento&&a.data_vencimento<k()).length;c.innerHTML=`
    <div style="padding:16px 20px;max-width:960px;">

      <!-- Cabeçalho -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:12px;flex-wrap:wrap;">
        <div>
          <h2 style="font-size:17px;font-weight:700;color:var(--text,#0f172a);">
            Contas a Pagar${g?` <span style="font-size:13px;font-weight:400;color:var(--text-muted);">/ ${g}</span>`:""}
          </h2>
          ${o>0?`<p style="font-size:12px;color:#b91c1c;margin-top:3px;">${o} ${o===1?"item vencido":"itens vencidos"} — ação necessária.</p>`:""}
        </div>
        <button data-action="nova-despesa" style="
          background:#dc2626;color:#fff;border:none;
          padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;
          flex-shrink:0;
        ">+ Nova despesa</button>
      </div>

      <!-- Navegador de mês -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <button data-action="mes-prev" style="
          background:none;border:1px solid var(--border,#e5e7eb);
          padding:5px 10px;cursor:pointer;font-size:15px;color:var(--text);
        ">◀</button>
        <div style="text-align:center;min-width:160px;">
          <span style="font-size:14px;font-weight:600;">${M()}</span>
          ${s?' <span style="font-size:11px;color:#2563eb;font-weight:500;">· atual</span>':' <button data-action="mes-hoje" style="font-size:11px;color:#2563eb;background:none;border:none;cursor:pointer;font-weight:500;padding:0 4px;">voltar ao mês atual</button>'}
        </div>
        <button data-action="mes-next" style="
          background:none;border:1px solid var(--border,#e5e7eb);
          padding:5px 10px;cursor:pointer;font-size:15px;color:var(--text);
        ">▶</button>
      </div>

      <!-- Totais inline -->
      <div style="
        display:flex;gap:12px;flex-wrap:wrap;align-items:center;
        margin-bottom:12px;padding:10px 14px;
        background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);
        font-size:13px;
      ">
        <span>
          <strong style="color:var(--text-muted,#64748b);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Total</strong>
          <span style="margin-left:6px;font-weight:700;color:#dc2626;">${C(v)}</span>
        </span>
        <span style="color:var(--border,#e2e8f0);">|</span>
        <span>
          <strong style="color:var(--text-muted,#64748b);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Pago</strong>
          <span style="margin-left:6px;font-weight:700;color:#166534;">${C(i)}</span>
        </span>
        <span style="color:var(--border,#e2e8f0);">|</span>
        <span>
          <strong style="color:var(--text-muted,#64748b);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">A Pagar</strong>
          <span style="margin-left:6px;font-weight:700;color:${d>0?"#b45309":"var(--text-muted,#94a3b8)"};">${C(d)}</span>
        </span>
      </div>

      <!-- Barra de filtros -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
        ${D("Todos",x==="todos","todos")}
        ${D("Pagos",x==="pago","pago")}
        ${D("Pendentes",x==="pendente","pendente")}
        ${D("Vencidos",x==="vencido","vencido")}
        <span style="flex:1;min-width:120px;">
          <input id="busca-desp" type="text" placeholder="Buscar…" value="${E}"
            style="width:100%;border:1px solid var(--border,#e2e8f0);padding:4px 10px;
                   font-size:12.5px;background:var(--bg-card,#fff);color:var(--text,#111);
                   outline:none;" />
        </span>
      </div>

      <!-- Tabela ERP -->
      <div style="overflow-x:auto;">
        <table style="
          width:100%;border-collapse:collapse;font-size:13px;
          border:1px solid var(--border,#e2e8f0);
        ">
          <thead>
            <tr style="background:var(--bg,#f1f5f9);border-bottom:2px solid var(--border,#e2e8f0);">
              <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;white-space:nowrap;">Data</th>
              <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;">Descrição</th>
              <th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;">Categoria</th>
              ${g?"":'<th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;">Negócio</th>'}
              <th style="padding:8px 10px;text-align:right;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;">Valor</th>
              <th style="padding:8px 10px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.6px;">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${t.length?t.map((a,f)=>W(a,f)).join(""):`<tr><td colspan="${g?5:6}" style="padding:32px;text-align:center;color:var(--text-muted,#94a3b8);font-size:13px;">
                  ${e.length===0?`Nenhuma despesa em ${M()}.`:"Nenhum resultado para os filtros."}
                </td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- Rodapé -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:12px;color:var(--text-muted,#9ca3af);">
        <span>${t.length} registro${t.length!==1?"s":""}${t.length<e.filter(a=>a.tipo==="despesa").length?` de ${e.filter(a=>a.tipo==="despesa").length}`:""}</span>
        ${w?`<button data-action="carregar-mais" style="
          background:none;border:1px solid var(--border,#e5e7eb);
          padding:6px 16px;cursor:pointer;font-size:12px;color:var(--text);
        ">Carregar mais</button>`:""}
      </div>

    </div>
  `,(p=c.querySelector('[data-action="mes-prev"]'))==null||p.addEventListener("click",J),(m=c.querySelector('[data-action="mes-next"]'))==null||m.addEventListener("click",K),($=c.querySelector('[data-action="mes-hoje"]'))==null||$.addEventListener("click",Q),(q=c.querySelector('[data-action="nova-despesa"]'))==null||q.addEventListener("click",()=>j(null)),(P=c.querySelector('[data-action="carregar-mais"]'))==null||P.addEventListener("click",()=>_(!1));const r=c.querySelector("#busca-desp");r==null||r.addEventListener("input",a=>{E=a.target.value;const _gid=a.target.id;clearTimeout(window._gtBT);window._gtBT=setTimeout(()=>{h();const _b=_gid&&document.getElementById(_gid);if(_b){_b.focus();_b.setSelectionRange(_b.value.length,_b.value.length)}},350)}),c.querySelectorAll("[data-filtro-status]").forEach(a=>{a.addEventListener("click",()=>{x=a.dataset.filtroStatus,h()})}),c.querySelectorAll("[data-desp-id]").forEach(a=>{a.addEventListener("click",()=>{const f=a.dataset.despId,N=(u.get("despesas")??[]).find(B=>B.id===f);N&&j(N)})})}async function j(e){var d;let t=[];try{const o=await O("negocios");t=F("negocios",o)}catch{}const n=!e,s=e??{status:"pendente",data_vencimento:k(),valor:"",descricao:"",categoria:"",negocio:g??""},v=t.map(o=>`<option value="${o.nome||""}" ${(s.negocio||"")===(o.nome||"")?"selected":""}>${o.nome||o.id}</option>`).join("");S.abrir({titulo:n?"Nova despesa":"Editar despesa",conteudo:`
      <form id="form-despesa" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;gap:8px;">
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Status
            <select name="status" style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="pendente"  ${s.status==="pendente"?"selected":""}>Pendente</option>
              <option value="pago"      ${s.status==="pago"?"selected":""}>Pago</option>
              <option value="cancelado" ${s.status==="cancelado"?"selected":""}>Cancelado</option>
            </select>
          </label>
          ${t.length?`
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Negócio
            <select name="negocio" style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="">— Geral —</option>
              ${v}
            </select>
          </label>`:`<input type="hidden" name="negocio" value="${s.negocio||""}">`}
        </div>

        <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Descrição
          <input name="descricao" type="text" value="${s.descricao||""}" required
            placeholder="Ex: Conta de energia"
            style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        </label>

        <div style="display:flex;gap:8px;">
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Valor (R$)
            <input name="valor" type="number" min="0" step="0.01" value="${s.valor||""}" required
              placeholder="0,00"
              style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
          </label>
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Vencimento
            <input name="data_vencimento" type="date" value="${s.data_vencimento||k()}" required
              style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
          </label>
        </div>

        <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Categoria (opcional)
          <input name="categoria" type="text" value="${s.categoria||""}"
            placeholder="Ex: Energia, Internet, Aluguel…"
            style="padding:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        </label>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
          ${n?"":`<button type="button" id="btn-excluir-desp" style="
            padding:8px 16px;border:1px solid #dc2626;
            color:#dc2626;background:transparent;cursor:pointer;font-size:14px;
          ">Excluir</button>`}
          <button type="submit" style="
            padding:8px 20px;border:none;
            background:#dc2626;color:#fff;
            font-size:14px;font-weight:600;cursor:pointer;
          ">${n?"Criar":"Salvar"}</button>
        </div>
      </form>
    `}),await new Promise(o=>setTimeout(o,60));const i=document.getElementById("form-despesa");i&&(i.addEventListener("submit",async o=>{o.preventDefault();const r=new FormData(i),p={id:(e==null?void 0:e.id)??H(),tipo:"despesa",status:r.get("status"),descricao:r.get("descricao"),valor:parseFloat(r.get("valor"))||0,data_vencimento:r.get("data_vencimento"),categoria:r.get("categoria")||null,negocio:r.get("negocio")||null,mes_ref:(r.get("data_vencimento")||"").slice(0,7)},m=i.querySelector("[type=submit]");m.disabled=!0,m.textContent="Salvando…";try{await R("lancamentos",p),u.patch("despesas",p.id,p),S.fechar(),z.ok(n?"Despesa criada!":"Despesa atualizada!"),h()}catch($){console.error($),z.err("Erro ao salvar: "+$.message),m.disabled=!1,m.textContent=n?"Criar":"Salvar"}}),(d=document.getElementById("btn-excluir-desp"))==null||d.addEventListener("click",async()=>{if(await S.confirmar(`Excluir "${e.descricao}"? Esta ação não pode ser desfeita.`,{textoBotao:"Excluir",tipo:"danger"}))try{await Y("lancamentos",e.id),u.remove("despesas",e.id),S.fechar(),z.ok("Despesa excluída."),h()}catch(r){z.err("Erro ao excluir: "+r.message)}}))}async function te(e){var n;c=e,g=((n=A.params())==null?void 0:n.negocio)??null,E="",x="todos";const t=new Date;b=t.getFullYear(),l=t.getMonth()+1,y=null,w=!1,L=!1,u.set("despesas",[]),h(),await _(!0)}export{te as initDespesas};
