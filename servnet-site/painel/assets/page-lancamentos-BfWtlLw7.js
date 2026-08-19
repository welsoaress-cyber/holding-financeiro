import{s as g,f as M,a as A,u as O,t as E,N as Y,b as H,h as j,c as U,d as V,e as G,g as Q}from"./page-dashboard-Dbqm2OjX.js";let a=null,D=null;function J(){var e;return a||(a=document.createElement("div"),a.id="modal-overlay",a.setAttribute("aria-modal","true"),a.setAttribute("role","dialog"),Object.assign(a.style,{position:"fixed",inset:"0",background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"1000",padding:"16px",overflowY:"auto",opacity:"0",transition:"opacity .18s ease"}),a.innerHTML=`
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
        `,aoFechar:()=>n(!1)}),setTimeout(()=>{var s,i;(s=a==null?void 0:a.querySelector("#modal-cancelar"))==null||s.addEventListener("click",()=>{f.fechar(),n(!1)}),(i=a==null?void 0:a.querySelector("#modal-confirmar"))==null||i.addEventListener("click",()=>{f.fechar(),n(!0)})},50)})}};function B(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{const t=Math.random()*16|0;return(e==="x"?t:t&3|8).toString(16)})}let v=new Date().getFullYear(),c=new Date().getMonth()+1,L=null,q=!1,T=!1,l=null,$="todos",k="todos",z="";function F(){return`${v}-${String(c).padStart(2,"0")}`}function I(){return`${Y[c-1]} de ${v}`}function K(){c--,c<1&&(c=12,v--),L=null,q=!1,_(!0)}function W(){c++,c>12&&(c=1,v++),L=null,q=!1,_(!0)}function X(){const e=new Date;v=e.getFullYear(),c=e.getMonth()+1,L=null,q=!1,_(!0)}function Z(){let e=g.get("lancamentos")??[];if($!=="todos"&&(e=e.filter(t=>t.tipo===$)),k!=="todos"&&(e=e.filter(t=>{const _h=new Date().toISOString().slice(0,10),_pg=t.status==="pago",_cc=t.status==="cancelado",_vc=!_pg&&!_cc&&(t.data_vencimento||t.data||"")<_h;return k==="pendente"?(!_pg&&!_cc&&!_vc):t.status===k})),z.trim()){const t=z.trim().toLowerCase();e=e.filter(o=>(o.descricao||"").toLowerCase().includes(t)||(o.categoria||"").toLowerCase().includes(t))}return e}async function _(e=!1){if(T)return;T=!0;const t=`${v}-${String(c).padStart(2,"0")}-01`,o=new Date(v,c,0).toISOString().slice(0,10),n=[`dados->>mes_ref.eq.${F()}`,`and(dados->>data.gte.${t},dados->>data.lte.${o})`,`and(dados->>data_vencimento.gte.${t},dados->>data_vencimento.lte.${o})`].join(",");try{const{items:d,hasMore:s,lastId:i}=await A("lancamentos","*",{cursor:e?null:L,orFiltro:n}),p=O("lancamentos",d);if(e)g.set("lancamentos",p);else{const m=g.get("lancamentos")??[];g.set("lancamentos",[...m,...p])}L=i,q=s}catch(d){console.error("[lancamentos]",d),E.err("Erro ao carregar lançamentos: "+d.message)}finally{T=!1,h()}}function ee(e,t){const o=e.tipo==="receita",n=e.status==="pago",d=e.status==="cancelado",s=new Date().toISOString().slice(0,10),i=!n&&!d&&(e.data_vencimento||e.data||"")<s,p=n?"Pago":i?"Vencido":d?"Cancelado":"Pendente",m=n?"#166534":i?"#991b1b":d?"#6b7280":"#92400e",w=n?"#dcfce7":i?"#fee2e2":d?"#f3f4f6":"#fef3c7",u=o?"C":"D",y=o?"#166534":"#991b1b",x=d?"#9ca3af":o?"#166534":"#991b1b",C=t%2===0?"var(--bg-card,#fff)":"var(--bg,#f8fafc)";return`
    <tr data-lanc-id="${e.id}" style="
      background:${C};cursor:pointer;
      border-bottom:1px solid var(--border,#e2e8f0);
    ">
      <td style="padding:6px 10px;white-space:nowrap;font-size:12px;color:var(--text-muted,#4b5563);">
        ${H(e.data_vencimento||e.data)}
      </td>
      <td style="padding:6px 10px;font-size:13px;color:var(--text,#111827);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${e.descricao||"—"}
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
      <td style="padding:6px 10px;">
        <span style="
          display:inline-block;padding:2px 7px;border-radius:3px;
          font-size:11px;font-weight:600;
          background:${w};color:${m};
        ">${p}</span>
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
        <span style="flex:1;"></span>
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
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);white-space:nowrap;">Data</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Descrição</th>
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
  `,(m=l.querySelector('[data-action="mes-prev"]'))==null||m.addEventListener("click",K),(w=l.querySelector('[data-action="mes-next"]'))==null||w.addEventListener("click",W),(u=l.querySelector('[data-action="mes-hoje"]'))==null||u.addEventListener("click",X),(y=l.querySelector('[data-action="novo-lanc"]'))==null||y.addEventListener("click",()=>R(null)),(x=l.querySelector('[data-action="carregar-mais"]'))==null||x.addEventListener("click",()=>_(!1));const p=l.querySelector("#busca-lanc");p==null||p.addEventListener("input",r=>{z=r.target.value,h()}),(C=l.querySelector("#btn-limpar-busca"))==null||C.addEventListener("click",()=>{z="",h()}),l.querySelectorAll("[data-filtro-tipo]").forEach(r=>{r.addEventListener("click",()=>{$=r.dataset.filtroTipo,h()})}),l.querySelectorAll("[data-filtro-status]").forEach(r=>{r.addEventListener("click",()=>{k=r.dataset.filtroStatus,h()})}),l.querySelectorAll("[data-lanc-id]").forEach(r=>{r.addEventListener("click",()=>{const b=r.dataset.lancId,N=(g.get("lancamentos")??[]).find(P=>P.id===b);N&&R(N)})})}function te(e){const t=!e,o=e??{tipo:"despesa",status:"pendente",data_vencimento:j(),valor:"",descricao:"",categoria:""};return`
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
            <option value="cancelado" ${o.status==="cancelado"?"selected":""}>❌ Cancelado</option>
          </select>
        </label>
      </div>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Descrição
        <input name="descricao" type="text" value="${o.descricao||""}" required
          placeholder="Ex: Conta de energia"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
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

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Categoria (opcional)
        <input name="categoria" type="text" value="${o.categoria||""}"
          placeholder="Ex: Alimentação, Transporte…"
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
      </label>

      ${t?`
        <!-- Recorrência -->
        <div style="
          background:var(--bg,#f1f5f9);border-radius:10px;padding:12px;
          display:flex;flex-direction:column;gap:10px;
        ">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:500;">
            <input type="checkbox" id="check-recorrente" name="recorrente"
              style="width:16px;height:16px;cursor:pointer;" />
            🔁 Repetir mensalmente
          </label>
          <div id="div-recorrencia" style="display:none;flex-direction:column;gap:6px;">
            <label style="font-size:13px;font-weight:500;">
              Número de meses adicionais
              <select name="qtd_meses" style="
                display:block;width:100%;margin-top:4px;
                padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);
                font-size:14px;background:var(--bg-card);color:var(--text);
              ">
                <option value="1">2 meses (este + 1)</option>
                <option value="2">3 meses (este + 2)</option>
                <option value="3">4 meses (este + 3)</option>
                <option value="5">6 meses (este + 5)</option>
                <option value="11">12 meses (este + 11)</option>
              </select>
            </label>
            <p style="font-size:12px;color:var(--text-muted,#6b7280);margin:0;">
              Gera cópias mensais com datas avançadas automaticamente.
            </p>
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
  `}async function R(e){var d;f.abrir({titulo:e?"Editar lançamento":"Novo lançamento",conteudo:te(e)}),await new Promise(s=>setTimeout(s,60));const t=document.getElementById("form-lanc");if(!t)return;const o=t.querySelector("#check-recorrente"),n=t.querySelector("#div-recorrencia");o==null||o.addEventListener("change",()=>{n&&(n.style.display=o.checked?"flex":"none")}),t.addEventListener("submit",async s=>{s.preventDefault();const i=new FormData(t),p=i.get("data_vencimento")||j(),m=i.get("recorrente")==="on",w=m?parseInt(i.get("qtd_meses")||"1",10):0,u={id:(e==null?void 0:e.id)??B(),tipo:i.get("tipo"),status:i.get("status"),descricao:i.get("descricao"),valor:parseFloat(i.get("valor"))||0,data_vencimento:p,categoria:i.get("categoria")||null,mes_ref:p.slice(0,7)},y=t.querySelector("[type=submit]");y.disabled=!0,y.textContent="Salvando…";try{if(m&&w>0){const x=[u];for(let r=1;r<=w;r++){const b=U(p,r);x.push({...u,id:B(),data_vencimento:b,mes_ref:b.slice(0,7)})}await V("lancamentos",x),x.filter(r=>r.mes_ref===F()).forEach(r=>g.patch("lancamentos",r.id,r)),E.ok(`${x.length} lançamentos criados!`)}else await G("lancamentos",u),(!e||u.mes_ref===F())&&g.patch("lancamentos",u.id,u),E.ok(e?"Lançamento atualizado!":"Lançamento criado!");f.fechar(),h()}catch(x){console.error(x),E.err("Erro ao salvar: "+x.message),y.disabled=!1,y.textContent=e?"Salvar":"Criar"}}),(d=document.getElementById("btn-excluir"))==null||d.addEventListener("click",async()=>{if(await f.confirmar(`Excluir "${e.descricao}"? Esta ação não pode ser desfeita.`,{textoBotao:"Excluir",tipo:"danger"}))try{await Q("lancamentos",e.id),g.remove("lancamentos",e.id),f.fechar(),E.ok("Lançamento excluído."),h()}catch(i){E.err("Erro ao excluir: "+i.message)}})}async function oe(e){l=e;const t=new Date;v=t.getFullYear(),c=t.getMonth()+1,L=null,q=!1,$="todos",k="todos",z="",T=!1,g.set("lancamentos",[]),h(),await _(!0)}const re=Object.freeze(Object.defineProperty({__proto__:null,initLancamentos:oe},Symbol.toStringTag,{value:"Module"}));export{re as i,f as m,B as u};
