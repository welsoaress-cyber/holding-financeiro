import{s as g,f as M,a as A,u as O,t as E,N as Y,b as H,h as j,c as U,d as V,e as G,g as Q}from"./page-dashboard-Dbqm2OjXb.js";let a=null,D=null;function J(){var e;return a||(a=document.createElement("div"),a.id="modal-overlay",a.setAttribute("aria-modal","true"),a.setAttribute("role","dialog"),Object.assign(a.style,{position:"fixed",inset:"0",background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"1000",padding:"16px",overflowY:"auto",opacity:"0",transition:"opacity .18s ease"}),a.innerHTML=`
    <div id="modal-box" style="
      background: var(--bg-card, #fff);
      border-radius: 14px;
      width: 100%;
      max-width: 540px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,.18);
      display: flex;
      flex-direction: column;
      transform: translateY(12px);
      transition: transform .18s ease;
    ">
      <div id="modal-header" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 20px 14px;
        border-bottom: 1px solid var(--border, #e5e7eb);
        position: sticky;
        top: 0;
        background: var(--bg-card, #fff);
        border-radius: 14px 14px 0 0;
      ">
        <h2 id="modal-titulo" style="margin:0;font-size:18px;font-weight:600;"></h2>
        <button id="modal-fechar" aria-label="Fechar" style="
          background: none;
          border: none;
          cursor: pointer;
          font-size: 22px;
          line-height: 1;
          color: var(--text-muted, #9ca3af);
          padding: 4px;
        ">✕</button>
      </div>
      <div id="modal-body" style="padding: 20px;"></div>
    </div>
  `,a.addEventListener("mousedown",t=>{a._df=t.target===a}),a.addEventListener("click",t=>{t.target===a&&a._df&&f.fechar()}),document.addEventListener("keydown",t=>{t.key==="Escape"&&a.parentNode&&f.fechar()}),(e=document.getElementById("modal-fechar",a))==null||e.addEventListener("click",()=>f.fechar()),document.body.appendChild(a),a)}const f={abrir({titulo:e="",conteudo:t="",aoFechar:o=null}={}){const n=J();n.querySelector("#modal-titulo").textContent=e,n.querySelector("#modal-body").innerHTML=t,n.querySelector("#modal-fechar").onclick=()=>f.fechar(),D=o,n.parentNode||document.body.appendChild(n),n.style.display="flex",requestAnimationFrame(()=>{n.style.opacity="1",n.querySelector("#modal-box").style.transform="translateY(0)"}),setTimeout(()=>{const d=n.querySelector("input, select, textarea, button:not(#modal-fechar)");d==null||d.focus()},180)},fechar(){a&&(a.style.opacity="0",a.querySelector("#modal-box").style.transform="translateY(12px)",setTimeout(()=>{a&&(a.style.display="none"),typeof D=="function"&&(D(),D=null)},180))},setConteudo(e){const t=a==null?void 0:a.querySelector("#modal-body");t&&(t.innerHTML=e)},setTitulo(e){const t=a==null?void 0:a.querySelector("#modal-titulo");t&&(t.textContent=e)},confirmar(e,{textoBotao:t="Confirmar",tipo:o="danger"}={}){return new Promise(n=>{const d=o==="danger"?"#dc2626":"#2563eb";f.abrir({titulo:"Confirmar",conteudo:`
          <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">${e}</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button id="modal-cancelar" style="
              padding:8px 18px;border-radius:8px;border:1px solid var(--border,#e5e7eb);
              background:transparent;cursor:pointer;font-size:14px;
            ">Cancelar</button>
            <button id="modal-confirmar" style="
              padding:8px 18px;border-radius:8px;border:none;
              background:${d};color:#fff;cursor:pointer;font-size:14px;font-weight:600;
            ">${t}</button>
          </div>
        `,aoFechar:()=>n(!1)}),setTimeout(()=>{var s,i;(s=a==null?void 0:a.querySelector("#modal-cancelar"))==null||s.addEventListener("click",()=>{f.fechar(),n(!1)}),(i=a==null?void 0:a.querySelector("#modal-confirmar"))==null||i.addEventListener("click",()=>{f.fechar(),n(!0)})},50)})},escopoAcao(_titulo,_lanc,_tipo){const _isDanger=_tipo==="danger";const _desc=(_lanc.descricao||"")+((_lanc.cliente)?" — "+_lanc.cliente:"");return new Promise(_rr=>{f.abrir({titulo:_titulo,conteudo:`<p style="margin:0 0 6px;font-size:13px;color:var(--text-muted,#6b7280);">${_desc}</p>`+`<p style="margin:0 0 14px;font-size:13px;color:var(--text-muted,#6b7280);">Aplicar em:</p>`+`<div style="display:flex;flex-direction:column;gap:8px;">`+`<button id="esc-este" style="padding:10px 14px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:var(--bg-card,#fff);color:var(--text,#111);cursor:pointer;font-size:14px;text-align:left;">📌 Apenas este lançamento</button>`+`<button id="esc-proximos" style="padding:10px 14px;border-radius:8px;border:1px solid #2563eb;background:#eff6ff;color:#1d4ed8;cursor:pointer;font-size:14px;text-align:left;">📅 Este e os próximos (não pagos)</button>`+`<button id="esc-todos" style="padding:10px 14px;border-radius:8px;border:1px solid ${_isDanger?"#dc2626":"#7c3aed"};background:${_isDanger?"#fee2e2":"#f5f3ff"};color:${_isDanger?"#7f1d1d":"#5b21b6"};cursor:pointer;font-size:14px;text-align:left;">${_isDanger?"🗑️":"📋"} Todos (incluindo pagos)</button>`+`<button id="esc-cancelar" style="padding:6px 14px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:transparent;color:var(--text-muted,#6b7280);cursor:pointer;font-size:13px;margin-top:4px;">Cancelar</button>`+`</div>`,aoFechar:()=>_rr(null)});setTimeout(()=>{var _e=a==null?void 0:a.querySelector("#esc-este");var _p=a==null?void 0:a.querySelector("#esc-proximos");var _t=a==null?void 0:a.querySelector("#esc-todos");var _c=a==null?void 0:a.querySelector("#esc-cancelar");_e&&_e.addEventListener("click",()=>{f.fechar();_rr("este")});_p&&_p.addEventListener("click",()=>{f.fechar();_rr("proximos")});_t&&_t.addEventListener("click",()=>{f.fechar();_rr("todos")});_c&&_c.addEventListener("click",()=>{f.fechar();_rr(null)})},50)})}};function B(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}let v=new Date().getFullYear(),c=new Date().getMonth()+1,L=null,q=!1,T=!1,l=null,$="todos",k="todos",z="",nb="todos",sel=new Set();function F(){return`${v}-${String(c).padStart(2,"0")}`}function I(){return`${Y[c-1]} de ${v}`}function K(){c--,c<1&&(c=12,v--),L=null,q=!1,sel=new Set(),_(!0)}function W(){c++,c>12&&(c=1,v++),L=null,q=!1,sel=new Set(),_(!0)}function X(){const e=new Date;v=e.getFullYear(),c=e.getMonth()+1,L=null,q=!1,sel=new Set(),_(!0)}function Z(){let e=g.get("lancamentos")??[];if($!=="todos"&&(e=e.filter(t=>t.tipo===$)),k!=="todos"&&(e=e.filter(t=>{const _h=new Date().toISOString().slice(0,10),_pg=t.status==="pago",_cc=t.status==="cancelado",_vc=!_pg&&!_cc&&(t.data_vencimento||t.data||"")<_h;return k==="pendente"?(!_pg&&!_cc&&!_vc):(k==="vencido"?_vc:t.status===k)})),nb!=="todos"&&(e=e.filter(t=>(t.negocio||"")===nb)),z.trim()){const t=z.trim().toLowerCase();const _cltNomes=(g.get("clientes")||[]).filter(c=>(c.nome||"").toLowerCase().includes(t)).map(c=>(c.nome||"").toLowerCase());e=e.filter(o=>(o.cliente||"").toLowerCase().includes(t)||_cltNomes.some(nm=>nm&&(o.descricao||"").toLowerCase().includes(nm))||_cltNomes.some(nm=>nm&&(o.cliente||"").toLowerCase().includes(nm))||(o.negocio||"").toLowerCase().includes(t)||(o.descricao||"").toLowerCase().includes(t)||(o.categoria||"").toLowerCase().includes(t))}e.sort((_sa,_sb)=>{const _da=(_sa.data_vencimento||_sa.data||"");const _db=(_sb.data_vencimento||_sb.data||"");return _da<_db?-1:_da>_db?1:0});return e}async function _(e=!1){if(T)return;T=!0;const t=`${v}-${String(c).padStart(2,"0")}-01`,o=new Date(v,c,0).toISOString().slice(0,10),n=[`dados->>mes_ref.eq.${F()}`,`and(dados->>data.gte.${t},dados->>data.lte.${o})`,`and(dados->>data_vencimento.gte.${t},dados->>data_vencimento.lte.${o})`].join(",");try{const{items:d,hasMore:s,lastId:i}=await A("lancamentos","*",{cursor:e?null:L,orFiltro:n}),p=O("lancamentos",d);if(e)g.set("lancamentos",p);else{const m=g.get("lancamentos")??[];g.set("lancamentos",[...m,...p])}L=i,q=s}catch(d){console.error("[lancamentos]",d),E.err("Erro ao carregar lançamentos: "+d.message)}finally{T=!1,h()}}function ee(e,t){const o=e.tipo==="receita",n=e.status==="pago",d=e.status==="cancelado",_isParcial=e.status==="parcial",_isAgendado=e.status==="agendado",s=new Date().toISOString().slice(0,10),i=!n&&!d&&!_isParcial&&!_isAgendado&&(e.data_vencimento||e.data||"")<s,p=n?"Pago":_isParcial?"Parcial":_isAgendado?"Agendado":i?"Vencido":d?"Cancelado":"Pendente",m=n?"#166534":_isParcial?"#c2410c":_isAgendado?"#1d4ed8":i?"#991b1b":d?"#6b7280":"#92400e",w=n?"#dcfce7":_isParcial?"#ffedd5":_isAgendado?"#dbeafe":i?"#fee2e2":d?"#f3f4f6":"#fef3c7",u=o?"C":"D",y=o?"#166534":"#991b1b",x=d?"#9ca3af":o?"#166534":"#991b1b",C=sel.has(e.id)?"#dbeafe":t%2===0?"var(--bg-card,#fff)":"var(--bg,#f8fafc)";return`
    <tr data-lanc-id="${e.id}" style="
      background:${C};cursor:pointer;
      border-bottom:1px solid var(--border,#e2e8f0);
    ">
      <td style="padding:6px 10px;width:28px;" onclick="event.stopPropagation()">
        <input type="checkbox" class="sel-item" data-id="${e.id}" ${sel.has(e.id)?"checked":""}
          style="width:15px;height:15px;cursor:pointer;accent-color:#2563eb;" />
      </td>
      <td style="padding:6px 10px;white-space:nowrap;font-size:12px;color:var(--text-muted,#4b5563);">
        ${H(e.data_vencimento||e.data)}
      </td>
      <td style="padding:6px 10px;font-size:13px;color:var(--text,#111827);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${(()=>{if(e.cliente)return e.cliente;const _desc=(e.descricao||"").toLowerCase();return(g.get("clientes")||[]).find(c=>c.nome&&_desc.includes(c.nome.toLowerCase()))?.nome||e.descricao||"—"})()}
      </td>
      <td style="padding:6px 10px;font-size:12px;color:var(--text-muted,#6b7280);">
        ${e.categoria||"—"}
      </td>
      <td style="padding:6px 10px;font-size:12px;color:var(--text-muted,#6b7280);">
        ${e.negocio||"—"}
      </td>
      <td style="padding:6px 10px;text-align:center;font-size:11px;font-weight:700;color:${y};">
        ${u}
      </td>
      <td style="padding:6px 10px;text-align:right;font-size:13px;font-weight:600;color:${x};font-variant-numeric:tabular-nums;white-space:nowrap;">
        ${M(e.valor)}
      </td>
      <td style="padding:6px 10px;white-space:nowrap;">
        <span style="
          display:inline-block;padding:2px 7px;border-radius:3px;
          font-size:11px;font-weight:600;
          background:${w};color:${m};
        ">${p}</span>
        ${!n&&!d?`<button class="btn-pagar" data-id="${e.id}" onclick="event.stopPropagation()"
          title="Marcar como pago"
          style="margin-left:4px;padding:1px 7px;font-size:11px;cursor:pointer;
            border:1px solid #16a34a;border-radius:3px;
            background:transparent;color:#16a34a;font-weight:700;
            vertical-align:middle;">✓</button>`:""}
      </td>
    </tr>
  `}function S(e,t){return`
    <button style="
      padding:4px 10px;font-size:12px;cursor:pointer;
      border:1px solid ${t?"#2563eb":"var(--border,#d1d5db)"};
      background:${t?"#2563eb":"var(--bg-card,#fff)"};
      color:${t?"#fff":"var(--text-muted,#6b7280)"};
      font-weight:${t?"600":"400"};
      white-space:nowrap;
    ">${e}</button>
  `}function h(){var m,w,u,y,x,C;if(!l)return;const e=g.get("lancamentos")??[],t=Z(),o=new Date,n=v===o.getFullYear()&&c===o.getMonth()+1,d=e.filter(r=>r.tipo==="receita").reduce((r,b)=>r+(Number(b.valor)||0),0),s=e.filter(r=>r.tipo==="despesa").reduce((r,b)=>r+(Number(b.valor)||0),0),i=d-s;l.innerHTML=`
    <div style="padding:16px 20px;max-width:960px;">

      <!-- Barra de título e navegação -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:8px 12px;background:var(--bg-card,#fff);
        border:1px solid var(--border,#d1d5db);border-bottom:none;
        margin-bottom:0;
      ">
        <div style="display:flex;align-items:center;gap:6px;">
          <button data-action="mes-prev" style="
            background:none;border:1px solid var(--border,#d1d5db);
            padding:3px 10px;cursor:pointer;font-size:13px;color:var(--text,#111);
          ">&#9664;</button>
          <span style="font-size:13px;font-weight:600;min-width:150px;text-align:center;">
            ${I()}
          </span>
          <button data-action="mes-next" style="
            background:none;border:1px solid var(--border,#d1d5db);
            padding:3px 10px;cursor:pointer;font-size:13px;color:var(--text,#111);
          ">&#9654;</button>
          ${n?"":`<button data-action="mes-hoje" style="
            font-size:11px;color:#2563eb;background:none;
            border:1px solid #2563eb;padding:2px 8px;cursor:pointer;
          ">Hoje</button>`}
        </div>

        <!-- Resumo inline -->
        <div style="display:flex;align-items:center;gap:16px;font-size:12px;">
          <span>Receitas: <strong style="color:#166534;font-variant-numeric:tabular-nums;">${M(d)}</strong></span>
          <span>Despesas: <strong style="color:#991b1b;font-variant-numeric:tabular-nums;">${M(s)}</strong></span>
          <span>Saldo: <strong style="color:${i>=0?"#1d4ed8":"#92400e"};font-variant-numeric:tabular-nums;">${i>=0?"":"-"}${M(Math.abs(i))}</strong></span>
        </div>
      </div>

      <!-- Toolbar: filtros + busca + novo -->
      <div style="
        display:flex;align-items:center;gap:6px;flex-wrap:wrap;
        padding:6px 8px;background:var(--bg,#f3f4f6);
        border:1px solid var(--border,#d1d5db);border-bottom:none;
      ">
        <span data-filtro-tipo="todos">   ${S("Todos",$==="todos")}</span>
        <span data-filtro-tipo="receita"> ${S("Receitas",$==="receita")}</span>
        <span data-filtro-tipo="despesa"> ${S("Despesas",$==="despesa")}</span>
        <span style="width:1px;height:18px;background:var(--border,#d1d5db);margin:0 2px;"></span>
        <span data-filtro-status="todos">   ${S("Qualquer status",k==="todos")}</span>
        <span data-filtro-status="pago">    ${S("Pagos",k==="pago")}</span>
        <span data-filtro-status="pendente">${S("Pendentes",k==="pendente")}</span>
        <span data-filtro-status="vencido">${S("Vencidos",k==="vencido")}</span>
        <span style="width:1px;height:18px;background:var(--border,#d1d5db);margin:0 4px;"></span>
        <select id="filtro-negocio" title="Filtrar por negócio" style="padding:3px 7px;border:1px solid var(--border,#d1d5db);font-size:12px;background:var(--bg-card,#fff);color:var(--text,#111);cursor:pointer;">
          <option value="todos" ${nb==="todos"?"selected":""}>Todos os negócios</option>
          ${[...new Set((g.get("lancamentos")??[]).map(r=>r.negocio||"").filter(Boolean))].sort().map(n=>`<option value="${n}" ${nb===n?"selected":""}>${n}</option>`).join("")}
        </select>
        <span style="flex:1;"></span>
        ${sel.size>0?`<button id="btn-del-sel" style="
          background:#dc2626;color:#fff;border:none;
          padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;
          display:flex;align-items:center;gap:4px;
        ">🗑️ Excluir (${sel.size})</button>`:""}
        <input
          id="busca-lanc"
          type="text"
          placeholder="Buscar..."
          value="${z}"
          style="
            padding:3px 8px;border:1px solid var(--border,#d1d5db);
            font-size:12px;background:var(--bg-card,#fff);color:var(--text,#111);
            width:180px;outline:none;
          "
        />
        ${z?'<button id="btn-limpar-busca" style="background:none;border:none;font-size:16px;cursor:pointer;color:#6b7280;padding:0 2px;">×</button>':""}
        <button data-action="novo-lanc" style="
          background:#2563eb;color:#fff;border:none;
          padding:4px 14px;font-size:12px;font-weight:600;cursor:pointer;
        ">+ Novo</button>
      </div>

      <!-- Tabela de lançamentos -->
      <div style="border:1px solid var(--border,#d1d5db);overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:var(--bg,#f3f4f6);border-bottom:2px solid var(--border,#c8c8c8);">
              <th style="padding:6px 10px;width:28px;">
                <input type="checkbox" id="sel-all" title="Selecionar todos"
                  style="width:15px;height:15px;cursor:pointer;accent-color:#2563eb;" />
              </th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);white-space:nowrap;">Data</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Cliente</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Categoria</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Negócio</th>
              <th style="padding:6px 10px;text-align:center;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">D/C</th>
              <th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Valor</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Situação</th>
            </tr>
          </thead>
          <tbody>
            ${t.length?t.map((r,b)=>ee(r,b)).join(""):`<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted,#9ca3af);font-size:13px;">
                  ${e.length===0?`Nenhum lançamento em ${I()}.`:"Nenhum resultado para os filtros selecionados."}
                </td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- Rodapé: contagem + carregar mais -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:5px 10px;background:var(--bg,#f3f4f6);
        border:1px solid var(--border,#d1d5db);border-top:none;
        font-size:11px;color:var(--text-muted,#6b7280);
      ">
        <span>${t.length} registro${t.length!==1?"s":""}${t.length<e.length?` de ${e.length}`:""}</span>
        ${q?`<button data-action="carregar-mais" style="
          background:none;border:1px solid var(--border,#d1d5db);
          padding:2px 10px;cursor:pointer;font-size:11px;
        ">Carregar mais</button>`:""}
      </div>
    </div>
  `,(m=l.querySelector('[data-action="mes-prev"]'))==null||m.addEventListener("click",K),(w=l.querySelector('[data-action="mes-next"]'))==null||w.addEventListener("click",W),(u=l.querySelector('[data-action="mes-hoje"]'))==null||u.addEventListener("click",X),(y=l.querySelector('[data-action="novo-lanc"]'))==null||y.addEventListener("click",()=>R(null)),(x=l.querySelector('[data-action="carregar-mais"]'))==null||x.addEventListener("click",()=>_(!1));const p=l.querySelector("#busca-lanc");p==null||p.addEventListener("input",r=>{z=r.target.value;const _gid=r.target.id;clearTimeout(window._gtBT);window._gtBT=setTimeout(()=>{h();const _b=_gid&&document.getElementById(_gid);if(_b){_b.focus();_b.setSelectionRange(_b.value.length,_b.value.length)}},350)}),(C=l.querySelector("#btn-limpar-busca"))==null||C.addEventListener("click",()=>{z="",h()}),l.querySelectorAll("[data-filtro-tipo]").forEach(r=>{r.addEventListener("click",()=>{$=r.dataset.filtroTipo,h()})}),l.querySelectorAll("[data-filtro-status]").forEach(r=>{r.addEventListener("click",()=>{k=r.dataset.filtroStatus,h()})});const _fnb=l.querySelector("#filtro-negocio");_fnb&&_fnb.addEventListener("change",()=>{nb=_fnb.value;h()});const _selAll=l.querySelector("#sel-all");if(_selAll){_selAll.indeterminate=sel.size>0&&sel.size<t.length;_selAll.checked=t.length>0&&sel.size===t.length;_selAll.addEventListener("change",()=>{if(_selAll.checked)t.forEach(r=>sel.add(r.id));else sel.clear();h()})}l.querySelectorAll(".sel-item").forEach(cb=>{cb.addEventListener("change",_ev=>{_ev.stopPropagation();if(cb.checked)sel.add(cb.dataset.id);else sel.delete(cb.dataset.id);const _sa=l.querySelector("#sel-all");if(_sa){_sa.indeterminate=sel.size>0&&sel.size<t.length;_sa.checked=t.length>0&&sel.size===t.length}})});const _btnDelSel=l.querySelector("#btn-del-sel");_btnDelSel&&_btnDelSel.addEventListener("click",async()=>{if(!sel.size)return;if(await f.confirmar(`Excluir ${sel.size} lançamento(s) selecionado(s)? Esta ação não pode ser desfeita.`,{textoBotao:"Excluir",tipo:"danger"})){const _ids=[...sel];sel.clear();for(const _id of _ids){try{await Q("lancamentos",_id);g.remove("lancamentos",_id)}catch(_ex){console.error(_ex)}}E.ok(`${_ids.length} lançamento(s) excluído(s).`);h()}});l.querySelectorAll("[data-lanc-id]").forEach(r=>{r.addEventListener("click",()=>{const b=r.dataset.lancId,N=(g.get("lancamentos")??[]).find(P=>P.id===b);N&&R(N)})});l.querySelectorAll(".btn-pagar").forEach(_bp=>{_bp.addEventListener("click",async()=>{const _id=_bp.dataset.id,_lnc=(g.get("lancamentos")??[]).find(_r=>_r.id===_id);if(!_lnc)return;const _today=new Date().toISOString().slice(0,10);const _upd={..._lnc,status:"pago",data_pagamento:_today};try{await G("lancamentos",_upd);g.patch("lancamentos",_id,_upd);E.ok("Marcado como pago! ✓");h()}catch(_ex){E.err("Erro: "+_ex.message)}})})}function te(e){const t=!e,o=e??{tipo:"despesa",status:"pendente",data_vencimento:j(),valor:"",descricao:"",categoria:""};return`
    <form id="form-lanc" style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Tipo
          <select name="tipo" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
            <option value="receita" ${o.tipo==="receita"?"selected":""}>📈 Receita</option>
            <option value="despesa" ${o.tipo==="despesa"?"selected":""}>📉 Despesa</option>
          </select>
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Status
          <select name="status" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
            <option value="pendente"  ${o.status==="pendente"?"selected":""}>⏰ Pendente</option>
            <option value="pago"      ${o.status==="pago"?"selected":""}>✅ Pago</option>
            <option value="parcial"   ${o.status==="parcial"  ?"selected":""}>🔶 Parcial</option>
            <option value="agendado"  ${o.status==="agendado" ?"selected":""}>📅 Agendado</option>
            <option value="cancelado" ${o.status==="cancelado"?"selected":""}>❌ Cancelado</option>
          </select>
        </label>
      </div>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Cliente
        <input name="cliente" type="text" value="${o.cliente||""}" list="lista-clientes-lanc"
          placeholder="Nome do cliente (opcional)"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        <datalist id="lista-clientes-lanc">
          ${(g.get("clientes")||[]).map(c=>`<option value="${c.nome||""}">`).join("")}
        </datalist>
      </label>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Descrição
        <input name="descricao" type="text" value="${o.descricao||""}" required
          list="dl-desc-lanc"
          placeholder="Ex: Conta de energia"
          autocomplete="off"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        <datalist id="dl-desc-lanc">
          ${[...new Set((g.get("lancamentos")||[]).map(l=>l.descricao||""))].filter(Boolean).sort().map(n=>`<option value="${n}">`).join("")}
        </datalist>
      </label>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Valor (R$)
          <input name="valor" type="number" min="0" step="0.01" value="${o.valor||""}" required
            placeholder="0,00"
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Vencimento
          <input name="data_vencimento" type="date" value="${o.data_vencimento||j()}" required
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        </label>
      </div>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Conta
          <select name="conta" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
            <option value="">— Conta —</option>
            ${(g.get("contas")||[{nome:"Mercado Pago"},{nome:"C6 Bank"},{nome:"Nubank"},{nome:"Caixa Econômica"},{nome:"Caixa Física"}]).map(c=>`<option value="${c.nome||""}" ${(o.conta||"")===(c.nome||"")?"selected":""}>${c.nome||""}</option>`).join("")}
          </select>
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Forma de Pagamento
          <select name="forma_pagamento" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
            <option value="">— Forma —</option>
            ${["Pix","Cartão Débito","Cartão Crédito","Boleto","Dinheiro","TED/DOC","Cheque","Automático"].map(fp=>`<option value="${fp}" ${(o.forma_pagamento||"")===fp?"selected":""}>${fp}</option>`).join("")}
          </select>
        </label>
      </div>

      <label id="label-data-pgto" style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Data de Pagamento
        <input name="data_pagamento" type="date" value="${o.data_pagamento||""}"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
      </label>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Categoria (opcional)
        <input name="categoria" type="text" value="${o.categoria||""}"
          list="dl-cat-lanc"
          placeholder="Ex: Alimentação, Transporte…"
          autocomplete="off"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        <datalist id="dl-cat-lanc">
          ${[...new Set((g.get("lancamentos")||[]).map(l=>l.categoria||""))].filter(Boolean).sort().map(n=>`<option value="${n}">`).join("")}
        </datalist>
      </label>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Negócio
        <div style="display:flex;gap:6px;">
          <select name="negocio-sel" id="sel-negocio"
            style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
            <option value="">— Selecionar —</option>
            ${(g.get("negocios")||[]).map(n=>`<option value="${n.nome||""}" ${(o.negocio||"")===(n.nome||"")?"selected":""}>${n.nome||""}</option>`).join("")}
            <option value="__novo__">+ Novo negócio…</option>
          </select>
          <input id="inp-negocio-novo" name="negocio-novo" type="text"
            placeholder="Nome do negócio"
            style="display:none;flex:1;padding:8px;border-radius:8px;border:2px solid #2563eb;font-size:14px;background:var(--bg-card);color:var(--text);" />
        </div>
      </label>

      ${t?`
        <!-- Recorrência -->
        <div style="background:var(--bg,#f1f5f9);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px;">
          <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            🔁 Frequência
            <select name="frequencia" id="sel-frequencia"
              style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="unica"      ${(o.frequencia||"unica")==="unica"     ?"selected":""}>🔂 Única (não repete)</option>
              <option value="diaria"     ${(o.frequencia||"")==="diaria"         ?"selected":""}>📅 Diária</option>
              <option value="semanal"    ${(o.frequencia||"")==="semanal"        ?"selected":""}>📅 Semanal</option>
              <option value="quinzenal"  ${(o.frequencia||"")==="quinzenal"      ?"selected":""}>📅 Quinzenal (15 dias)</option>
              <option value="mensal"     ${(o.frequencia||"")==="mensal"         ?"selected":""}>📅 Mensal</option>
              <option value="bimestral"  ${(o.frequencia||"")==="bimestral"      ?"selected":""}>📅 Bimestral (2 meses)</option>
              <option value="trimestral" ${(o.frequencia||"")==="trimestral"     ?"selected":""}>📅 Trimestral (3 meses)</option>
              <option value="semestral"  ${(o.frequencia||"")==="semestral"      ?"selected":""}>📅 Semestral (6 meses)</option>
              <option value="anual"      ${(o.frequencia||"")==="anual"          ?"selected":""}>📅 Anual</option>
            </select>
          </label>
          <div id="div-recorrencia" style="display:none;flex-direction:column;gap:8px;">
            <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
              Término da recorrência
              <select name="fim_tipo" id="sel-fim-tipo"
                style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
                <option value="vezes" ${(o.fim_tipo||"vezes")==="vezes"?"selected":""}>Por X vezes</option>
                <option value="data"  ${(o.fim_tipo||"")==="data" ?"selected":""}>Até uma data</option>
                <option value="fixa"  ${(o.fim_tipo||"")==="fixa" ?"selected":""}>Sem término — despesa/receita fixa</option>
              </select>
            </label>
            <div id="div-fim-vezes">
              <label style="font-size:13px;font-weight:500;">
                Número de vezes (total, incluindo a 1ª)
                <input type="number" name="fim_vezes" min="2" max="600" value="${o.fim_vezes||12}"
                  style="display:block;width:100%;margin-top:4px;padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
              </label>
            </div>
            <div id="div-fim-data" style="display:none;">
              <label style="font-size:13px;font-weight:500;">
                Repetir até a data
                <input type="date" name="fim_data" value="${o.fim_data||""}"
                  style="display:block;width:100%;margin-top:4px;padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
              </label>
            </div>
            <p style="font-size:12px;color:var(--text-muted,#6b7280);margin:0;">Gera cópias automáticas com datas avançadas.</p>
          </div>
        </div>
      `:""}

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${t?"":`<button type="button" id="btn-excluir" style="
          padding:8px 16px;border-radius:8px;
          border:1px solid #dc2626;color:#dc2626;
          background:transparent;cursor:pointer;font-size:14px;
        ">Excluir</button>`}
        <button type="submit" style="
          padding:8px 20px;border-radius:8px;border:none;
          background:var(--primary,#2563eb);color:#fff;
          font-size:14px;font-weight:600;cursor:pointer;
        ">${t?"Criar":"Salvar"}</button>
      </div>
    </form>
  `}async function R(e){var d;if(!g.get("negocios")?.length){try{const{items:_nb}=await A("negocios","*",{limit:200});if(_nb.length)g.set("negocios",O("negocios",_nb))}catch(_ex){console.error("[negocios]",_ex)}}if(!g.get("clientes")?.length){try{const{items:_cl}=await A("clientes","*",{limit:500});if(_cl.length)g.set("clientes",O("clientes",_cl))}catch(_ex){console.error("[clientes]",_ex)}}if(!g.get("contas")?.length){try{const{items:_ct}=await A("contas","*",{limit:200});if(_ct.length)g.set("contas",_ct)}catch(_ex){console.error("[contas]",_ex)}}f.abrir({titulo:e?"Editar lançamento":"Novo lançamento",conteudo:te(e)}),await new Promise(s=>setTimeout(s,60));const t=document.getElementById("form-lanc");if(!t)return;const o=t.querySelector("#check-recorrente"),n=t.querySelector("#div-recorrencia");o==null||o.addEventListener("change",()=>{n&&(n.style.display=o.checked?"flex":"none")});const _st2=t.querySelector("[name=status]"),_dp2=t.querySelector("[name=data_pagamento]"),_ldp2=t.querySelector("#label-data-pgto");if(_st2&&_dp2){const _upd2=()=>{const _isPagoOuParcial=_st2.value==="pago"||_st2.value==="parcial";if(_ldp2)_ldp2.style.display=_isPagoOuParcial?"flex":"none";if(_isPagoOuParcial&&!_dp2.value)_dp2.value=j()};_st2.addEventListener("change",_upd2);_upd2()}const _selNeg=t.querySelector("#sel-negocio"),_inpNovNeg=t.querySelector("#inp-negocio-novo");if(_selNeg&&_inpNovNeg){_selNeg.addEventListener("change",()=>{const _isNovo=_selNeg.value==="__novo__";_inpNovNeg.style.display=_isNovo?"":"none";if(_isNovo)_inpNovNeg.focus()})}const _selFreq=t.querySelector("#sel-frequencia"),_divRecorr2=t.querySelector("#div-recorrencia");const _selFimTipo=t.querySelector("#sel-fim-tipo"),_divFimVezes=t.querySelector("#div-fim-vezes"),_divFimData=t.querySelector("#div-fim-data");const _updFreq=()=>{const _isR=_selFreq?.value!=="unica";if(_divRecorr2)_divRecorr2.style.display=_isR?"flex":"none"};const _updFim=()=>{const _ft=_selFimTipo?.value;if(_divFimVezes)_divFimVezes.style.display=_ft!=="data"&&_ft!=="fixa"?"":"none";if(_divFimData)_divFimData.style.display=_ft==="data"?"":"none"};if(_selFreq){_selFreq.addEventListener("change",_updFreq);_updFreq()}if(_selFimTipo){_selFimTipo.addEventListener("change",_updFim);_updFim()}t.addEventListener("submit",async s=>{s.preventDefault();const i=new FormData(t),p=i.get("data_vencimento")||j(),_freq=i.get("frequencia")||"unica",_recorre=_freq!=="unica",_fimTipo=i.get("fim_tipo")||"vezes",_fimVezes=parseInt(i.get("fim_vezes")||"12",10),_fimData=i.get("fim_data")||"",m=_recorre,w=0,u={...(e??{}),id:(e==null?void 0:e.id)??B(),negocio:(()=>{const _snv=t.querySelector("#sel-negocio")?.value||"",_inv=t.querySelector("#inp-negocio-novo")?.value||"";return _snv==="__novo__"?(_inv.trim()||null):(_snv||null)})(),tipo:i.get("tipo"),status:i.get("status"),cliente:i.get("cliente")||null,descricao:i.get("descricao"),valor:parseFloat(i.get("valor"))||0,data_vencimento:p,data_pagamento:i.get("data_pagamento")||null,categoria:i.get("categoria")||null,conta:i.get("conta")||null,forma_pagamento:i.get("forma_pagamento")||null,frequencia:_freq,fim_tipo:_fimTipo,fim_vezes:_fimVezes,fim_data:_fimData||null,mes_ref:p.slice(0,7)},y=t.querySelector("[type=submit]");y.disabled=!0,y.textContent="Salvando…";try{const _selN2=t.querySelector("#sel-negocio"),_inpN2=t.querySelector("#inp-negocio-novo");if(_selN2?.value==="__novo__"&&_inpN2?.value?.trim()){const _nNeg={id:B(),nome:_inpN2.value.trim()};try{await G("negocios",_nNeg);g.patch("negocios",_nNeg.id,_nNeg)}catch(_ex){console.error("Erro ao criar negócio:",_ex)}}if((u.status==="pago"||u.status==="parcial")&&!u.data_pagamento)u.data_pagamento=j();if(_recorre){const _apd=(dt,fr,n)=>{const _d=new Date(dt+"T12:00:00");if(fr==="diaria")_d.setDate(_d.getDate()+n);else if(fr==="semanal")_d.setDate(_d.getDate()+7*n);else if(fr==="quinzenal")_d.setDate(_d.getDate()+15*n);else if(fr==="mensal")_d.setMonth(_d.getMonth()+n);else if(fr==="bimestral")_d.setMonth(_d.getMonth()+2*n);else if(fr==="trimestral")_d.setMonth(_d.getMonth()+3*n);else if(fr==="semestral")_d.setMonth(_d.getMonth()+6*n);else if(fr==="anual")_d.setFullYear(_d.getFullYear()+n);return _d.toISOString().slice(0,10)};const x=[u];if(_fimTipo==="vezes"){for(let r=1;r<_fimVezes;r++){const b=_apd(p,_freq,r);x.push({...u,id:B(),data_vencimento:b,data_pagamento:null,status:"pendente",mes_ref:b.slice(0,7)})}}else if(_fimTipo==="data"&&_fimData){let r=1;while(true){const b=_apd(p,_freq,r++);if(b>_fimData||r>600)break;x.push({...u,id:B(),data_vencimento:b,data_pagamento:null,status:"pendente",mes_ref:b.slice(0,7)})}}else{for(let r=1;r<=60;r++){const b=_apd(p,_freq,r);x.push({...u,id:B(),data_vencimento:b,data_pagamento:null,status:"pendente",mes_ref:b.slice(0,7)})}}await V("lancamentos",x),x.filter(r=>r.mes_ref===F()).forEach(r=>g.patch("lancamentos",r.id,r)),E.ok(`${x.length} lançamento(s) criado(s)!`)}else await G("lancamentos",u);(!e||u.mes_ref===F())&&g.patch("lancamentos",u.id,u);if(e){const _esc=await f.escopoAcao("Aplicar alterações",e,"primary");if(_esc==="proximos"||_esc==="todos"){const _alvo=(g.get("lancamentos")??[]).filter(_r=>_r.id!==u.id&&(_r.descricao||"")===(e.descricao||"")&&(_r.cliente||null)===(e.cliente||null)&&(_esc==="todos"||(_r.status!=="pago"&&(_r.data_vencimento||_r.data||"")>=u.data_vencimento)));const _campos={cliente:u.cliente,descricao:u.descricao,categoria:u.categoria,negocio:u.negocio,valor:u.valor,tipo:u.tipo,conta:u.conta,forma_pagamento:u.forma_pagamento};for(const _r of _alvo){try{await G("lancamentos",{..._r,..._campos});g.patch("lancamentos",_r.id,{..._r,..._campos})}catch(_ex){console.error(_ex)}}E.ok(`Alteração aplicada em ${_alvo.length+1} lançamento(s)!`)}else if(_esc==="este"){E.ok("Lançamento atualizado!")}else{E.ok("Lançamento atualizado!")}}else{E.ok("Lançamento criado!")};f.fechar(),h()}catch(x){console.error(x),E.err("Erro ao salvar: "+x.message),y.disabled=!1,y.textContent=e?"Salvar":"Criar"}}),(d=document.getElementById("btn-excluir"))==null||d.addEventListener("click",async()=>{{const _escDel=await f.escopoAcao("Excluir lançamento",e,"danger");if(_escDel!==null){try{const _alvoDel=(g.get("lancamentos")??[]).filter(_rd=>_rd.id!==e.id&&(_rd.descricao||"")===(e.descricao||"")&&(_rd.cliente||null)===(e.cliente||null)&&(_escDel==="todos"||(_rd.status!=="pago"&&(_rd.data_vencimento||_rd.data||"")>=(e.data_vencimento||e.data||""))));await Q("lancamentos",e.id);g.remove("lancamentos",e.id);for(const _rd of _alvoDel){try{await Q("lancamentos",_rd.id);g.remove("lancamentos",_rd.id)}catch(_ex){console.error(_ex)}}f.fechar();E.ok(_alvoDel.length?`${_alvoDel.length+1} lançamentos excluídos.`:"Lançamento excluído.");h()}catch(i){E.err("Erro ao excluir: "+i.message)}}}})}async function oe(e){l=e;const t=new Date;v=t.getFullYear(),c=t.getMonth()+1,L=null,q=!1,$="todos",k="todos",z="",nb="todos",sel=new Set(),T=!1,g.set("lancamentos",[]),h(),await _(!0)}const re=Object.freeze(Object.defineProperty({__proto__:null,initLancamentos:oe},Symbol.toStringTag,{value:"Module"}));export{re as i,f as m,B as u};
