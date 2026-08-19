import{s,f as u,i as m,u as g,t as d,e as y,g as b}from"./page-dashboard-Dbqm2OjX.js";import{m as p,u as h}from"./page-lancamentos-BfWtlLw7.js";import"./supabase-DthfXWp1.js";let l=null;const $=["Conta Corrente","Conta Poupança","Conta Pagamento","Carteira","Investimento","Outro"];async function w(){try{const e=await m("contas"),n=g("contas",e);s.set("contas",n)}catch(e){d.err("Erro ao carregar contas: "+e.message)}f()}function c(e){return Number(e.saldoInicial??e.saldo)||0}function z(e){if(e.parentId)return"";const n=c(e),a=n>=0?"#059669":"#dc2626",i=e.instituicao??e.banco??"",t=e.ativa===!1,r=(s.get("contas")??[]).filter(o=>o.parentId===e.id);return`
    <div style="background:var(--bg-card,#fff);border-radius:12px;
      box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;
      ${t?"opacity:.6;":""}">
      <div data-conta-id="${e.id}" style="
        padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;
      ">
        <div style="width:44px;height:44px;border-radius:50%;background:#eff6ff;
          display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🏦</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:600;margin-bottom:2px;">
            ${e.nome||"Conta sem nome"} ${t?'<span style="font-size:11px;color:#9ca3af;">(inativa)</span>':""}
          </div>
          <div style="font-size:12px;color:var(--text-muted,#9ca3af);">
            ${e.tipo||"Conta Corrente"}${i?` · ${i}`:""}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-size:18px;font-weight:700;color:${a};">${u(n)}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af);">saldo atual</div>
        </div>
      </div>

      ${r.length?`
        <div style="border-top:1px solid var(--border,#f3f4f6);">
          ${r.map(o=>`
            <div data-conta-id="${o.id}" style="
              padding:10px 16px 10px 32px;display:flex;align-items:center;gap:12px;
              cursor:pointer;background:var(--bg,#f8fafc);
            ">
              <span style="font-size:14px;">📦</span>
              <div style="flex:1;font-size:13px;">${o.nome||"Caixinha"}</div>
              <div style="font-size:13px;font-weight:600;color:${c(o)>=0?"#059669":"#dc2626"};">
                ${u(c(o))}
              </div>
            </div>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function f(){var i;if(!l)return;const e=s.get("contas")??[],a=e.filter(t=>!t.parentId&&t.ativa!==!1).reduce((t,r)=>t+c(r),0);l.innerHTML=`
    <div style="padding:16px;max-width:680px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 4px;">Contas</h1>
          <div style="font-size:13px;color:var(--text-muted,#9ca3af);">
            Total: <strong style="color:${a>=0?"#059669":"#dc2626"};">${u(a)}</strong>
          </div>
        </div>
        <button data-action="nova-conta" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;
        ">+ Nova conta</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        ${e.length?e.map(z).join(""):`<p style="text-align:center;color:var(--text-muted,#9ca3af);padding:40px 0;font-size:14px;">
              Nenhuma conta cadastrada.
            </p>`}
      </div>
    </div>
  `,(i=l.querySelector('[data-action="nova-conta"]'))==null||i.addEventListener("click",()=>v(null)),l.querySelectorAll("[data-conta-id]").forEach(t=>{t.addEventListener("click",()=>{const r=t.dataset.contaId,o=(s.get("contas")??[]).find(x=>x.id===r);o&&v(o)})})}function C(e){const n=!e,a=e??{nome:"",tipo:"Conta Corrente",instituicao:"",saldoInicial:0,ativa:!0};return`
    <form id="form-conta" style="display:flex;flex-direction:column;gap:14px;">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Nome da conta
        <input name="nome" type="text" value="${a.nome||""}" required
          placeholder="Ex: Nubank, Bradesco..."
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Tipo
          <select name="tipo" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;">
            ${$.map(i=>`<option value="${i}" ${(a.tipo||"Conta Corrente")===i?"selected":""}>${i}</option>`).join("")}
          </select>
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Banco / Instituição
          <input name="instituicao" type="text" value="${a.instituicao??a.banco??""}"
            placeholder="Ex: Itaú, Nubank..."
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
      </div>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Saldo atual (R$)
        <input name="saldoInicial" type="number" step="0.01" value="${a.saldoInicial??a.saldo??0}" required
          style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <label style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;cursor:pointer;">
        <input name="ativa" type="checkbox" ${a.ativa!==!1?"checked":""} style="width:16px;height:16px;" />
        Conta ativa
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${n?"":`<button type="button" id="btn-excluir-conta" style="
          padding:8px 16px;border-radius:8px;
          border:1px solid #dc2626;color:#dc2626;
          background:transparent;cursor:pointer;font-size:14px;
        ">Excluir</button>`}
        <button type="submit" style="
          padding:8px 20px;border-radius:8px;border:none;
          background:var(--primary,#2563eb);color:#fff;
          font-size:14px;font-weight:600;cursor:pointer;
        ">${n?"Criar":"Salvar"}</button>
      </div>
    </form>
  `}async function v(e){var a;p.abrir({titulo:e?"Editar conta":"Nova conta",conteudo:C(e)}),await new Promise(i=>setTimeout(i,60));const n=document.getElementById("form-conta");n&&(n.addEventListener("submit",async i=>{i.preventDefault();const t=new FormData(n),r={id:(e==null?void 0:e.id)??h(),nome:t.get("nome"),tipo:t.get("tipo"),instituicao:t.get("instituicao")||"",saldoInicial:parseFloat(t.get("saldoInicial"))||0,limite:(e==null?void 0:e.limite)??0,ativa:t.get("ativa")==="on",negocio:(e==null?void 0:e.negocio)??"",parentId:(e==null?void 0:e.parentId)??null},o=n.querySelector("[type=submit]");o.disabled=!0,o.textContent="Salvando…";try{await y("contas",r),s.patch("contas",r.id,r),p.fechar(),d.ok(e?"Conta atualizada!":"Conta criada!"),f()}catch(x){d.err("Erro ao salvar: "+x.message),o.disabled=!1,o.textContent=e?"Salvar":"Criar"}}),(a=document.getElementById("btn-excluir-conta"))==null||a.addEventListener("click",async()=>{if(await p.confirmar(`Excluir a conta "${e.nome}"?`,{textoBotao:"Excluir",tipo:"danger"}))try{await b("contas",e.id),s.remove("contas",e.id),p.fechar(),d.ok("Conta excluída."),f()}catch(t){d.err("Erro ao excluir: "+t.message)}}))}async function N(e){l=e,s.get("contas")&&f(),await w()}export{N as initContas};
