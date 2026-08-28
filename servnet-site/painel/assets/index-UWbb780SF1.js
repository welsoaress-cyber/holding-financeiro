import{s as n,i as f,u as x,t as s,e as m,g as v}from"./page-dashboard-Dbqm2OjXbF1.js";import{m as l,u as b}from"./page-lancamentos-v290F1.js";import"./supabase-DthfXWp1F1.js";let d=null;async function y(){try{const e=await f("categorias"),t=x("categorias",e);n.set("categorias",t)}catch(e){s.err("Erro ao carregar categorias: "+e.message)}p()}function p(){var t;if(!d)return;const e=(n.get("categorias")??[]).sort((a,r)=>(a.nome||"").localeCompare(r.nome||"","pt-BR"));d.innerHTML=`
    <div style="padding:16px;max-width:680px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 2px;">Categorias</h1>
          <div style="font-size:13px;color:var(--text-muted,#9ca3af);">${e.length} categoria(s)</div>
        </div>
        <button data-action="nova-cat" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;
        ">+ Nova categoria</button>
      </div>

      <div style="background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">
        ${e.length?e.map((a,r)=>{var o;return`
            <div data-cat-id="${a.id}" style="
              display:flex;align-items:center;gap:12px;padding:13px 16px;cursor:pointer;
              ${r<e.length-1?"border-bottom:1px solid var(--border,#f3f4f6);":""}
              transition:background .12s;
            ">
              <span style="font-size:18px;">🏷️</span>
              <div style="flex:1;">
                <div style="font-size:14px;font-weight:500;">${a.nome||"(sem nome)"}</div>
                ${(o=a.subcategorias)!=null&&o.length?`
                  <div style="font-size:12px;color:var(--text-muted,#9ca3af);margin-top:2px;">
                    ${a.subcategorias.map(i=>i.nome||i).join(", ")}
                  </div>
                `:""}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted,#9ca3af);flex-shrink:0;">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          `}).join(""):`<p style="text-align:center;color:var(--text-muted,#9ca3af);padding:40px 0;font-size:14px;">
              Nenhuma categoria cadastrada.
            </p>`}
      </div>
    </div>
  `,(t=d.querySelector('[data-action="nova-cat"]'))==null||t.addEventListener("click",()=>g(null)),d.querySelectorAll("[data-cat-id]").forEach(a=>{a.addEventListener("click",()=>{const r=a.dataset.catId,o=(n.get("categorias")??[]).find(i=>i.id===r);o&&g(o)})})}function h(e){const t=!e;return`
    <form id="form-cat" style="display:flex;flex-direction:column;gap:14px;">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Nome da categoria
        <input name="nome" type="text" value="${(e==null?void 0:e.nome)||""}" required
          placeholder="Ex: Alimentação, Internet, Salários..."
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${t?"":`<button type="button" id="btn-excluir-cat" style="
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
  `}async function g(e){var a;l.abrir({titulo:e?"Editar categoria":"Nova categoria",conteudo:h(e)}),await new Promise(r=>setTimeout(r,60));const t=document.getElementById("form-cat");t&&(t.addEventListener("submit",async r=>{r.preventDefault();const o=new FormData(t),i={id:(e==null?void 0:e.id)??b(),nome:o.get("nome"),subcategorias:(e==null?void 0:e.subcategorias)??[]},c=t.querySelector("[type=submit]");c.disabled=!0,c.textContent="Salvando…";try{await m("categorias",i),n.patch("categorias",i.id,i),l.fechar(),s.ok(e?"Categoria atualizada!":"Categoria criada!"),p()}catch(u){s.err("Erro ao salvar: "+u.message),c.disabled=!1,c.textContent=e?"Salvar":"Criar"}}),(a=document.getElementById("btn-excluir-cat"))==null||a.addEventListener("click",async()=>{if(await l.confirmar(`Excluir categoria "${e.nome}"?`,{textoBotao:"Excluir",tipo:"danger"}))try{await v("categorias",e.id),n.remove("categorias",e.id),l.fechar(),s.ok("Categoria excluída."),p()}catch(o){s.err("Erro ao excluir: "+o.message)}}))}async function z(e){d=e,n.get("categorias")&&p(),await y()}export{z as initCategorias};
