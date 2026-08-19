import{s as a,i as m,u,t as s,f as g,e as v,g as b}from"./page-dashboard-Dbqm2OjX.js";import{m as c,u as y}from"./page-lancamentos-BfWtlLw7.js";import"./supabase-DthfXWp1.js";let d=null;const h=["Visa","Mastercard","Amex","Elo","Hipercard","Outro"],$={Visa:"💳",Mastercard:"💳",Amex:"💳",Elo:"💳",Hipercard:"💳",Outro:"💳"};async function w(){try{const e=await m("cartoes"),o=u("cartoes",e);a.set("cartoes",o)}catch(e){s.err("Erro ao carregar cartões: "+e.message)}p()}function p(){var i;if(!d)return;const e=a.get("cartoes")??[],o=e.filter(t=>t.ativo!==!1),n=e.filter(t=>t.ativo===!1);d.innerHTML=`
    <div style="padding:16px;max-width:680px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 2px;">Cartões</h1>
          <div style="font-size:13px;color:var(--text-muted,#9ca3af);">${o.length} ativo(s)</div>
        </div>
        <button data-action="novo-cartao" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;
        ">+ Novo cartão</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        ${o.length||n.length?[...o,...n].map(t=>z(t)).join(""):`<p style="text-align:center;color:var(--text-muted,#9ca3af);padding:40px 0;font-size:14px;">
              Nenhum cartão cadastrado.
            </p>`}
      </div>
    </div>
  `,(i=d.querySelector('[data-action="novo-cartao"]'))==null||i.addEventListener("click",()=>f(null)),d.querySelectorAll("[data-cartao-id]").forEach(t=>{t.addEventListener("click",()=>{const l=t.dataset.cartaoId,r=(a.get("cartoes")??[]).find(x=>x.id===l);r&&f(r)})})}function z(e){const o=e.ativo===!1;return`
    <div data-cartao-id="${e.id}" style="
      background:${o?"var(--bg,#f8fafc)":"var(--bg-card,#fff)"};
      border-radius:12px;padding:16px;
      box-shadow:0 1px 4px rgba(0,0,0,.06);cursor:pointer;
      display:flex;align-items:center;gap:14px;
      ${o?"opacity:.6;":""}
    ">
      <div style="font-size:32px;">${$[e.bandeira]??"💳"}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:15px;font-weight:600;">${e.nome||"Cartão sem nome"}</div>
        <div style="font-size:12px;color:var(--text-muted,#9ca3af);margin-top:2px;">
          ${e.bandeira||""}
          ${e.vencimento?` · Vence dia ${e.vencimento}`:""}
          ${e.negocio?` · ${e.negocio}`:""}
          ${o?' · <span style="color:#9ca3af;">Inativo</span>':""}
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:13px;font-weight:600;color:var(--text,#111);">${g(e.limite||0)}</div>
        <div style="font-size:11px;color:var(--text-muted,#9ca3af);">limite</div>
      </div>
    </div>
  `}function E(e){const o=!e,n=a.get("negocios")??[],i=e??{nome:"",bandeira:"Visa",limite:0,vencimento:"",fechamento:"",negocio:"",ativo:!0};return`
    <form id="form-cartao" style="display:flex;flex-direction:column;gap:14px;">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Nome do cartão
        <input name="nome" type="text" value="${i.nome||""}" required
          placeholder="Ex: Nubank Gold, Bradesco Visa..."
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Bandeira
          <select name="bandeira" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;">
            ${h.map(t=>`<option value="${t}" ${i.bandeira===t?"selected":""}>${t}</option>`).join("")}
          </select>
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Limite (R$)
          <input name="limite" type="number" min="0" step="0.01" value="${i.limite||0}"
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
      </div>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Fechamento (dia)
          <input name="fechamento" type="number" min="1" max="31" value="${i.fechamento||""}"
            placeholder="Ex: 20"
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Vencimento (dia)
          <input name="vencimento" type="number" min="1" max="31" value="${i.vencimento||""}"
            placeholder="Ex: 10"
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
      </div>

      ${n.length?`
        <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Negócio vinculado (opcional)
          <select name="negocio" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;">
            <option value="">— Nenhum —</option>
            ${n.map(t=>`<option value="${t.nome}" ${i.negocio===t.nome?"selected":""}>${t.nome}</option>`).join("")}
          </select>
        </label>
      `:""}

      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;cursor:pointer;">
        <input name="ativo" type="checkbox" ${i.ativo!==!1?"checked":""} style="width:16px;height:16px;" />
        Cartão ativo
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${o?"":`<button type="button" id="btn-excluir-cartao" style="
          padding:8px 16px;border-radius:8px;
          border:1px solid #dc2626;color:#dc2626;
          background:transparent;cursor:pointer;font-size:14px;
        ">Excluir</button>`}
        <button type="submit" style="
          padding:8px 20px;border-radius:8px;border:none;
          background:var(--primary,#2563eb);color:#fff;
          font-size:14px;font-weight:600;cursor:pointer;
        ">${o?"Criar":"Salvar"}</button>
      </div>
    </form>
  `}async function f(e){var n;if(!a.get("negocios"))try{const i=await m("negocios");a.set("negocios",u("negocios",i))}catch{}c.abrir({titulo:e?"Editar cartão":"Novo cartão",conteudo:E(e)}),await new Promise(i=>setTimeout(i,60));const o=document.getElementById("form-cartao");o&&(o.addEventListener("submit",async i=>{i.preventDefault();const t=new FormData(o),l={id:(e==null?void 0:e.id)??y(),nome:t.get("nome"),bandeira:t.get("bandeira"),limite:parseFloat(t.get("limite"))||0,fechamento:parseInt(t.get("fechamento"))||null,vencimento:parseInt(t.get("vencimento"))||null,negocio:t.get("negocio")||"",ativo:t.get("ativo")==="on"},r=o.querySelector("[type=submit]");r.disabled=!0,r.textContent="Salvando…";try{await v("cartoes",l),a.patch("cartoes",l.id,l),c.fechar(),s.ok(e?"Cartão atualizado!":"Cartão criado!"),p()}catch(x){s.err("Erro ao salvar: "+x.message),r.disabled=!1,r.textContent=e?"Salvar":"Criar"}}),(n=document.getElementById("btn-excluir-cartao"))==null||n.addEventListener("click",async()=>{if(await c.confirmar(`Excluir cartão "${e.nome}"?`,{textoBotao:"Excluir",tipo:"danger"}))try{await b("cartoes",e.id),a.remove("cartoes",e.id),c.fechar(),s.ok("Cartão excluído."),p()}catch(t){s.err("Erro ao excluir: "+t.message)}}))}async function I(e){d=e,a.get("cartoes")&&p(),await w()}export{I as initCartoes};
