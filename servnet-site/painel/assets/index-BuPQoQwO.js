const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/page-dashboard-Dbqm2OjXb.js","assets/supabase-DthfXWp1.js"])))=>i.map(i=>d[i]);
import{_ as y}from"./app-CkIaDDom.js";import{s as d,f as u,b as h,i as w,u as $,t as l,e as j,g as z,h as x}from"./page-dashboard-Dbqm2OjXb.js";import{m as c,u as k}from"./page-lancamentos-BfWtlLw7b.js";import"./modulepreload-polyfill-B5Qt9EMX.js";import"./auth-8dcbKywj.js";import"./supabase-DthfXWp1.js";let p=null;async function E(){try{const t=await w("ajustes");d.set("ajustes",$("ajustes",t))}catch(t){l.err("Erro ao carregar ajustes: "+t.message)}f()}async function m(){if(d.get("contas"))return;const{fetchAll:t,unpack:o}=await y(async()=>{const{fetchAll:n,unpack:a}=await import("./page-dashboard-Dbqm2OjXb.js").then(e=>e.m);return{fetchAll:n,unpack:a}},__vite__mapDeps([0,1]));d.set("contas",o("contas",await t("contas")))}function f(){var a;if(!p)return;const t=d.get("contas")??[],o=[...d.get("ajustes")??[]].sort((e,r)=>(r.data||"").localeCompare(e.data||"")),n=o.reduce((e,r)=>e+(Number(r.valor)||0),0);p.innerHTML=`
    <div style="padding:16px;max-width:680px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 2px;">Ajustes de Saldo</h1>
          <p style="font-size:12px;color:var(--text-muted,#9ca3af);margin:0;">
            Use quando o extrato do banco não bater com o controle interno.
          </p>
        </div>
        <button data-action="novo" style="
          background:var(--primary,#2563eb);color:#fff;border:none;
          border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;
        ">+ Novo ajuste</button>
      </div>

      ${o.length?`
        <div style="
          background:var(--bg-card,#fff);border-radius:10px;
          padding:12px 14px;margin-bottom:12px;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
          display:flex;justify-content:space-between;align-items:center;
        ">
          <span style="font-size:13px;color:var(--text-muted,#6b7280);">${o.length} ajuste(s) registrado(s)</span>
          <span style="font-size:15px;font-weight:700;color:${n>=0?"#059669":"#dc2626"};">
            ${n>=0?"+":""}${u(n)}
          </span>
        </div>
      `:""}

      <div style="background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);overflow:hidden;">
        ${o.length?o.map(e=>{const r=t.find(g=>g.id===e.contaId),i=Number(e.valor)||0,s=i>=0?"#059669":"#dc2626",b=i>=0?"+":"";return`
            <div data-ajuste-id="${e.id}" style="
              display:flex;align-items:center;gap:12px;
              padding:12px 14px;border-bottom:1px solid var(--border,#f3f4f6);
              cursor:pointer;transition:background .1s;
            ">
              <div style="
                width:36px;height:36px;border-radius:50%;flex-shrink:0;
                background:${i>=0?"#d1fae5":"#fee2e2"};
                display:flex;align-items:center;justify-content:center;font-size:16px;
              ">${i>=0?"↑":"↓"}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                  ${e.motivo||"—"}
                </div>
                <div style="font-size:12px;color:var(--text-muted,#9ca3af);">
                  ${h(e.data)} · ${(r==null?void 0:r.nome)||"Conta removida"}
                </div>
              </div>
              <div style="font-size:16px;font-weight:700;color:${s};white-space:nowrap;">
                ${b}${u(e.valor)}
              </div>
            </div>
          `}).join(""):`
          <div style="padding:48px 24px;text-align:center;color:var(--text-muted,#9ca3af);">
            <div style="font-size:32px;margin-bottom:8px;">🔧</div>
            <div style="font-size:14px;font-weight:500;margin-bottom:4px;">Nenhum ajuste registrado</div>
            <div style="font-size:12px;">Use quando o extrato do banco não bater com o controle.</div>
          </div>
        `}
      </div>
    </div>
  `,(a=p.querySelector('[data-action="novo"]'))==null||a.addEventListener("click",()=>v(null)),p.querySelectorAll("[data-ajuste-id]").forEach(e=>{e.addEventListener("click",()=>{const r=e.dataset.ajusteId,i=(d.get("ajustes")??[]).find(s=>s.id===r);i&&v(i)})})}function A(t){const o=!t,n=(d.get("contas")??[]).filter(e=>e.ativa!==!1&&!e.parentId),a=t??{contaId:"",data:x(),valor:"",motivo:""};return`
    <form id="form-ajuste" style="display:flex;flex-direction:column;gap:14px;">
      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Conta
        <select name="contaId" required style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg,#fff);">
          <option value="">Selecionar conta…</option>
          ${n.map(e=>`<option value="${e.id}" ${a.contaId===e.id?"selected":""}>${e.nome}</option>`).join("")}
        </select>
      </label>

      <div style="display:flex;gap:8px;">
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Valor (R$)
          <input name="valor" type="number" step="0.01" value="${a.valor||""}" required
            placeholder="Positivo (+) para creditar, negativo (−) para debitar"
            style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
        <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Data
          <input name="data" type="date" value="${a.data||x()}" required
            style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
        </label>
      </div>

      <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
        Motivo
        <input name="motivo" type="text" value="${a.motivo||""}" required
          placeholder="Ex: Correção de saldo, taxa bancária, rendimento..."
          style="padding:9px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;" />
      </label>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        ${o?"":`<button type="button" id="btn-excluir-ajuste" style="
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
  `}async function v(t){var n;await m(),c.abrir({titulo:t?"Editar ajuste":"Novo ajuste de saldo",conteudo:A(t)}),await new Promise(a=>setTimeout(a,60));const o=document.getElementById("form-ajuste");o&&(o.addEventListener("submit",async a=>{a.preventDefault();const e=new FormData(o),r={id:(t==null?void 0:t.id)??k(),contaId:e.get("contaId"),data:e.get("data"),valor:parseFloat(e.get("valor"))||0,motivo:e.get("motivo")},i=o.querySelector("[type=submit]");i.disabled=!0,i.textContent="Salvando…";try{await j("ajustes",r),d.patch("ajustes",r.id,r),c.fechar(),l.ok(t?"Ajuste atualizado!":"Ajuste criado!"),f()}catch(s){l.err("Erro: "+s.message),i.disabled=!1,i.textContent=t?"Salvar":"Criar"}}),(n=document.getElementById("btn-excluir-ajuste"))==null||n.addEventListener("click",async()=>{if(await c.confirmar(`Excluir ajuste "${t.motivo}"?`,{textoBotao:"Excluir",tipo:"danger"}))try{await z("ajustes",t.id),d.remove("ajustes",t.id),c.fechar(),l.ok("Ajuste excluído."),f()}catch(e){l.err("Erro: "+e.message)}}))}async function N(t){p=t,await m(),f(),await E()}export{N as initAjustes};
