import{s as a,i as m,u as y,t as d,e as b,g as v}from"./page-dashboard-Dbqm2OjXbF1.js";import{m as l,u as h}from"./page-lancamentos-BfWtlLw7bF1.js";import"./supabase-DthfXWp1F1.js";let s=null;const p=["#2563eb","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#be185d","#92400e","#065f46","#1e40af"];function w(e){return p[e.length%p.length]}async function E(){try{const e=await m("negocios"),i=y("negocios",e);a.set("negocios",i)}catch(e){d.err("Erro ao carregar negócios: "+e.message)}u()}function u(){var i;if(!s)return;const e=(a.get("negocios")??[]).sort((o,r)=>(o.nome||"").localeCompare(r.nome||"","pt-BR"));s.innerHTML=`
    <div style="padding:16px;max-width:680px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 2px;">Negócios</h1>
          <div style="font-size:13px;color:var(--text-muted,#9ca3af);">${e.length} unidade(s) da holding</div>
        </div>
        <button data-action="novo-neg" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;
        ">+ Novo negócio</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${e.length?e.map(o=>`
            <div data-neg-id="${o.id}" style="
              background:var(--bg-card,#fff);border-radius:12px;
              padding:14px 16px;display:flex;align-items:center;gap:14px;
              box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer;
            ">
              <div style="width:12px;height:12px;border-radius:50%;background:${o.cor||"#2563eb"};flex-shrink:0;"></div>
              <div style="flex:1;font-size:15px;font-weight:500;">${o.nome||"(sem nome)"}</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted,#9ca3af);">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          `).join(""):`<p style="text-align:center;color:var(--text-muted,#9ca3af);padding:40px 0;font-size:14px;">
              Nenhum negócio cadastrado.
            </p>`}
      </div>
    </div>
  `,(i=s.querySelector('[data-action="novo-neg"]'))==null||i.addEventListener("click",()=>f(null)),s.querySelectorAll("[data-neg-id]").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.negId,t=(a.get("negocios")??[]).find(n=>n.id===r);t&&f(t)})})}function k(e){const i=!e,o=(e==null?void 0:e.cor)??p[0];return`
    <form id="form-neg" style="display:flex;flex-direction:column;gap:14px;">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Nome do negócio
        <input name="nome" type="text" value="${(e==null?void 0:e.nome)||""}" required
          placeholder="Ex: Servnet Internet, GrupoTom..."
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <label style="display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;">
        Cor de identificação
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${p.map(r=>`
            <button type="button" data-cor="${r}" style="
              width:28px;height:28px;border-radius:50%;background:${r};border:none;cursor:pointer;
              outline:${r===o?"3px solid #111":"none"};outline-offset:2px;
            "></button>
          `).join("")}
        </div>
        <input type="hidden" name="cor" value="${o}" />
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${i?"":`<button type="button" id="btn-excluir-neg" style="
          padding:8px 16px;border-radius:8px;
          border:1px solid #dc2626;color:#dc2626;
          background:transparent;cursor:pointer;font-size:14px;
        ">Excluir</button>`}
        <button type="submit" style="
          padding:8px 20px;border-radius:8px;border:none;
          background:var(--primary,#2563eb);color:#fff;
          font-size:14px;font-weight:600;cursor:pointer;
        ">${i?"Criar":"Salvar"}</button>
      </div>
    </form>
  `}async function f(e){var r;const i=a.get("negocios")??[];l.abrir({titulo:e?"Editar negócio":"Novo negócio",conteudo:k(e)}),await new Promise(t=>setTimeout(t,60));const o=document.getElementById("form-neg");o&&(o.querySelectorAll("[data-cor]").forEach(t=>{t.addEventListener("click",()=>{o.querySelector("[name=cor]").value=t.dataset.cor,o.querySelectorAll("[data-cor]").forEach(n=>n.style.outline="none"),t.style.outline="3px solid #111",t.style.outlineOffset="2px"})}),o.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(o),x={id:(e==null?void 0:e.id)??h(),nome:n.get("nome"),cor:n.get("cor")||w(i)},c=o.querySelector("[type=submit]");c.disabled=!0,c.textContent="Salvando…";try{await b("negocios",x),a.patch("negocios",x.id,x),l.fechar(),d.ok(e?"Negócio atualizado!":"Negócio criado!"),u()}catch(g){d.err("Erro ao salvar: "+g.message),c.disabled=!1,c.textContent=e?"Salvar":"Criar"}}),(r=document.getElementById("btn-excluir-neg"))==null||r.addEventListener("click",async()=>{if(await l.confirmar(`Excluir negócio "${e.nome}"?`,{textoBotao:"Excluir",tipo:"danger"}))try{await v("negocios",e.id),a.remove("negocios",e.id),l.fechar(),d.ok("Negócio excluído."),u()}catch(n){d.err("Erro ao excluir: "+n.message)}}))}async function S(e){s=e,a.get("negocios")&&u(),await E()}export{S as initNegocios};
