const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/page-dashboard-Dbqm2OjXbF1.js","assets/supabase-DthfXWp1F1.js"])))=>i.map(i=>d[i]);
import{_ as q}from"./app-CkIaDDomF1.js";import{s,f as I,a as L,u as M,t as p,N as T,b as O,e as N,g as j,h as z}from"./page-dashboard-Dbqm2OjXbF1.js";import{m as b,u as C}from"./page-lancamentos-v290F1.js";import"./modulepreload-polyfill-B5Qt9EMXF1.js";import"./auth-8dcbKywjF1.js";import"./supabase-DthfXWp1F1.js";let l=null,f=new Date().getFullYear(),d=new Date().getMonth()+1,m=null,w=!1,h=!1;function A(){return`${f}-${String(d).padStart(2,"0")}`}function k(){return`${T[d-1]} de ${f}`}function F(){d--,d<1&&(d=12,f--),m=null,y(!0)}function P(){d++,d>12&&(d=1,f++),m=null,y(!0)}async function y(e=!1){if(!h){h=!0;try{const{items:t,hasMore:r,lastId:a}=await L("lancamentos","*",{cursor:e?null:m,limit:200,filtros:{"dados->>mes_ref":A(),"dados->>tipo":"transferencia"}}),n=M("lancamentos",t);e?s.set("transferencias",n):s.set("transferencias",[...s.get("transferencias")??[],...n]),m=a,w=r}catch(t){p.err("Erro ao carregar transferências: "+t.message)}finally{h=!1,v()}}}async function S(){if(s.get("contas"))return;const{fetchAll:e,unpack:t}=await q(async()=>{const{fetchAll:r,unpack:a}=await import("./page-dashboard-Dbqm2OjXbF1.js").then(n=>n.m);return{fetchAll:r,unpack:a}},__vite__mapDeps([0,1]));s.set("contas",t("contas",await e("contas")))}function v(){var o,u,x,c;if(!l)return;const e=s.get("transferencias")??[],t=s.get("contas")??[],r=e.reduce((i,g)=>i+(Number(g.valor)||0),0),a=new Date,n=f===a.getFullYear()&&d===a.getMonth()+1;l.innerHTML=`
    <div style="padding:16px;max-width:680px;">

      <!-- Cabeçalho -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h1 style="font-size:20px;font-weight:700;margin:0;">Transferências</h1>
        <button data-action="nova" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;
        ">⇄ Nova transferência</button>
      </div>

      <!-- Navegador de mês -->
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;">
        <button data-action="prev" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:16px;">◀</button>
        <div style="text-align:center;min-width:160px;">
          <div style="font-size:15px;font-weight:600;">${k()}</div>
          ${n?'<span style="font-size:11px;color:var(--primary,#2563eb);font-weight:500;">mês atual</span>':""}
        </div>
        <button data-action="next" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:16px;">▶</button>
      </div>

      <!-- KPI -->
      ${e.length?`
        <div style="
          background:var(--bg-card,#fff);border-radius:10px;padding:12px 16px;
          margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.06);
          display:flex;justify-content:space-between;align-items:center;
        ">
          <span style="font-size:13px;color:var(--text-muted,#6b7280);">${e.length} transferência(s)</span>
          <span style="font-size:16px;font-weight:700;color:#7c3aed;">${I(r)} movimentados</span>
        </div>
      `:""}

      <!-- Lista -->
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${e.length?e.map(i=>R(i,t)).join(""):`
          <div style="
            background:var(--bg-card,#fff);border-radius:12px;
            padding:48px 24px;text-align:center;
            box-shadow:0 1px 4px rgba(0,0,0,.06);
          ">
            <div style="font-size:32px;margin-bottom:8px;">⇄</div>
            <div style="font-size:14px;font-weight:500;color:var(--text-muted,#9ca3af);">
              Nenhuma transferência em ${k()}.
            </div>
          </div>
        `}
      </div>

      ${w?`
        <div style="text-align:center;margin-top:12px;">
          <button data-action="mais" style="padding:8px 20px;border-radius:8px;border:1px solid var(--border,#e5e7eb);background:none;cursor:pointer;font-size:14px;">Carregar mais</button>
        </div>
      `:""}
    </div>
  `,(o=l.querySelector('[data-action="nova"]'))==null||o.addEventListener("click",()=>_(null)),(u=l.querySelector('[data-action="prev"]'))==null||u.addEventListener("click",F),(x=l.querySelector('[data-action="next"]'))==null||x.addEventListener("click",P),(c=l.querySelector('[data-action="mais"]'))==null||c.addEventListener("click",()=>y(!1)),l.querySelectorAll("[data-trans-id]").forEach(i=>{i.addEventListener("click",()=>{const g=i.dataset.transId,$=(s.get("transferencias")??[]).find(D=>D.id===g);$&&_($)})})}function E(e,t){var r;return((r=t.find(a=>a.id===e))==null?void 0:r.nome)||"—"}function R(e,t){const r=E(e.contaOrigemId,t),a=E(e.contaDestinoId,t);return`
    <div data-trans-id="${e.id}" style="
      background:var(--bg-card,#fff);border-radius:10px;
      padding:12px 14px;display:flex;align-items:center;gap:12px;
      box-shadow:0 1px 3px rgba(0,0,0,.05);cursor:pointer;
    ">
      <div style="
        width:36px;height:36px;border-radius:50%;flex-shrink:0;
        background:#ede9fe;
        display:flex;align-items:center;justify-content:center;font-size:16px;
      ">⇄</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${e.descricao||`${r} → ${a}`}
        </div>
        <div style="font-size:12px;color:var(--text-muted,#9ca3af);">
          ${O(e.data_vencimento||e.data)}
          · ${r} → ${a}
        </div>
      </div>
      <div style="font-size:16px;font-weight:700;color:#7c3aed;white-space:nowrap;">
        ${I(e.valor)}
      </div>
    </div>
  `}function B(e){const t=!e,r=(s.get("contas")??[]).filter(o=>o.ativa!==!1),a=e??{valor:"",data_vencimento:z(),descricao:""},n=r.map(o=>`<option value="${o.id}">${o.parentId?"↳ ":""}${o.nome}</option>`).join("");return`
    <form id="form-trans" style="display:flex;flex-direction:column;gap:14px;">

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        De (conta origem)
        <select name="contaOrigemId" required style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg,#fff);">
          <option value="">Selecionar...</option>
          ${n}
        </select>
      </label>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Para (conta destino)
        <select name="contaDestinoId" required style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg,#fff);">
          <option value="">Selecionar...</option>
          ${n}
        </select>
      </label>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Valor (R$)
          <input name="valor" type="number" min="0.01" step="0.01" value="${a.valor||""}" required
            placeholder="0,00"
            style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Data
          <input name="data_vencimento" type="date" value="${a.data_vencimento||z()}" required
            style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
      </div>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Descrição (opcional)
        <input name="descricao" type="text" value="${a.descricao||""}"
          placeholder="Ex: Repasse para caixa do provedor"
          style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${t?"":`<button type="button" id="btn-excluir-trans" style="
          padding:8px 16px;border-radius:8px;
          border:1px solid #dc2626;color:#dc2626;
          background:transparent;cursor:pointer;font-size:14px;
        ">Excluir</button>`}
        <button type="submit" style="
          padding:8px 20px;border-radius:8px;border:none;
          background:var(--primary,#2563eb);color:#fff;
          font-size:14px;font-weight:600;cursor:pointer;
        ">${t?"Transferir":"Salvar"}</button>
      </div>
    </form>
  `}async function _(e){var r;await S(),b.abrir({titulo:e?"Editar transferência":"Nova transferência",conteudo:B(e)}),await new Promise(a=>setTimeout(a,60));const t=document.getElementById("form-trans");t&&(e&&(t.querySelector("[name=contaOrigemId]").value=e.contaOrigemId||"",t.querySelector("[name=contaDestinoId]").value=e.contaDestinoId||""),t.addEventListener("submit",async a=>{a.preventDefault();const n=new FormData(t),o=n.get("contaOrigemId"),u=n.get("contaDestinoId");if(o===u){p.err("Conta origem e destino não podem ser iguais.");return}const x=n.get("data_vencimento"),c={id:(e==null?void 0:e.id)??C(),tipo:"transferencia",status:"pago",contaOrigemId:o,contaDestinoId:u,valor:parseFloat(n.get("valor"))||0,data_vencimento:x,descricao:n.get("descricao")||null,mes_ref:x.slice(0,7)},i=t.querySelector("[type=submit]");i.disabled=!0,i.textContent="Salvando…";try{await N("lancamentos",c),s.patch("transferencias",c.id,c),b.fechar(),p.ok(e?"Transferência atualizada!":"Transferência registrada!"),v()}catch(g){p.err("Erro: "+g.message),i.disabled=!1,i.textContent=e?"Salvar":"Transferir"}}),(r=document.getElementById("btn-excluir-trans"))==null||r.addEventListener("click",async()=>{if(await b.confirmar("Excluir esta transferência?",{textoBotao:"Excluir",tipo:"danger"}))try{await j("lancamentos",e.id),s.remove("transferencias",e.id),b.fechar(),p.ok("Transferência excluída."),v()}catch(n){p.err("Erro: "+n.message)}}))}async function Q(e){l=e;const t=new Date;f=t.getFullYear(),d=t.getMonth()+1,m=null,w=!1,await S(),v(),await y(!0)}export{Q as initTransferencias};
