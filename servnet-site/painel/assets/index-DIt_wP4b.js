import{r as O,s as f,f as E,a as I,u as P,t as k,N as T,h as q,b as A,i as V,e as Y,g as H}from"./page-dashboard-Dbqm2OjXb.js";import{m as _,u as W}from"./page-lancamentos-v290.js";import"./supabase-DthfXWp1.js";let g=new Date().getFullYear(),s=new Date().getMonth()+1,$=null,w=!1,C=!1,l=null,b=null,m="",y="todos";function G(){return`${g}-${String(s).padStart(2,"0")}`}function N(){return`${T[s-1]} de ${g}`}function J(){s--,s<1&&(s=12,g--),$=null,w=!1,S(!0)}function Q(){s++,s>12&&(s=1,g++),$=null,w=!1,S(!0)}function U(){const e=new Date;g=e.getFullYear(),s=e.getMonth()+1,$=null,w=!1,S(!0)}function K(){let e=(f.get("receitas")??[]).filter(t=>t.tipo==="receita");if(y!=="todos"&&(e=e.filter(t=>t.status===y)),m.trim()){const t=m.trim().toLowerCase();e=e.filter(a=>(a.descricao||"").toLowerCase().includes(t)||(a.categoria||"").toLowerCase().includes(t))}return e}function L(e,t){return`<button style="
    padding:4px 10px;font-size:12px;cursor:pointer;
    border:1px solid ${t?"#2563eb":"var(--border,#d1d5db)"};
    background:${t?"#2563eb":"var(--bg-card,#fff)"};
    color:${t?"#fff":"var(--text-muted,#6b7280)"};
    font-weight:${t?"600":"400"};white-space:nowrap;
  ">${e}</button>`}async function S(e=!1){if(C)return;C=!0;const t=`${g}-${String(s).padStart(2,"0")}-01`,a=new Date(g,s,0).toISOString().slice(0,10),o=[`dados->>mes_ref.eq.${G()}`,`and(dados->>data.gte.${t},dados->>data.lte.${a})`,`and(dados->>data_vencimento.gte.${t},dados->>data_vencimento.lte.${a})`].join(","),c={};b&&(c["dados->>negocio"]=b);try{const{items:d,hasMore:u,lastId:r}=await I("lancamentos","*",{cursor:e?null:$,filtros:c,orFiltro:o}),i=P("lancamentos",d);if(e)f.set("receitas",i);else{const p=f.get("receitas")??[];f.set("receitas",[...p,...i])}$=r,w=u}catch(d){console.error("[receitas]",d),k.err("Erro ao carregar receitas: "+d.message)}finally{C=!1,h()}}function X(e){const t=["Olá! 👋","","Passamos para lembrar do pagamento referente a:",`📋 *${e.descricao||"Cobrança"}*`,`💰 Valor: *${E(e.valor)}*`,`📅 Vencimento: *${A(e.data_vencimento||"")}*`,"","Qualquer dúvida, estamos à disposição. Obrigado! 🙏"].join(`
`);return`https://wa.me/?text=${encodeURIComponent(t)}`}function Z(e,t){const a=e.status==="pago",o=e.status==="cancelado",c=!a&&!o&&e.data_vencimento&&e.data_vencimento<q(),d=a?"Recebido":c?"Vencido":o?"Cancelado":"Pendente",u=a?"#166534":c?"#991b1b":o?"#6b7280":"#92400e",r=a?"#dcfce7":c?"#fee2e2":o?"#f3f4f6":"#fef3c7",i=o?"#9ca3af":"#166534",p=t%2===0?"var(--bg-card,#fff)":"var(--bg,#f8fafc)";return`
    <tr data-action="editar" data-rec-id="${e.id}" style="
      background:${p};cursor:pointer;
      border-bottom:1px solid var(--border,#e2e8f0);
    ">
      <td style="padding:6px 10px;white-space:nowrap;font-size:12px;color:var(--text-muted,#4b5563);">
        ${A(e.data_vencimento||"")}
      </td>
      <td style="padding:6px 10px;font-size:13px;color:var(--text,#111827);max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${e.descricao||"—"}
      </td>
      <td style="padding:6px 10px;font-size:12px;color:var(--text-muted,#6b7280);">
        ${e.categoria||"—"}
      </td>
      ${b?"":`<td style="padding:6px 10px;font-size:12px;color:var(--text-muted,#6b7280);">${e.negocio||"—"}</td>`}
      <td style="padding:6px 10px;text-align:right;font-size:13px;font-weight:600;color:${i};font-variant-numeric:tabular-nums;white-space:nowrap;">
        ${E(e.valor)}
      </td>
      <td style="padding:6px 10px;">
        <span style="
          display:inline-block;padding:2px 7px;border-radius:3px;
          font-size:11px;font-weight:600;
          background:${r};color:${u};
        ">${d}</span>
      </td>
      <td style="padding:6px 10px;text-align:center;">
        ${!a&&!o?`
          <a href="${X(e)}" target="_blank" rel="noopener noreferrer"
            title="Cobrar via WhatsApp" onclick="event.stopPropagation()"
            style="
              font-size:11px;font-weight:600;color:#15803d;
              text-decoration:none;white-space:nowrap;
              padding:2px 6px;border:1px solid #bbf7d0;border-radius:3px;
              background:#f0fdf4;
          ">WA</a>
        `:""}
      </td>
    </tr>
  `}function h(){var i,p,v,z,R,D;if(!l)return;const e=f.get("receitas")??[],t=K(),a=new Date,o=g===a.getFullYear()&&s===a.getMonth()+1,c=e.reduce((n,x)=>n+(Number(x.valor)||0),0),d=e.filter(n=>n.status==="pago").reduce((n,x)=>n+(Number(x.valor)||0),0),u=e.filter(n=>n.status==="pendente").reduce((n,x)=>n+(Number(x.valor)||0),0);l.innerHTML=`
    <div style="padding:16px 20px;max-width:960px;">

      <!-- Barra de título e navegação -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:8px 12px;background:var(--bg-card,#fff);
        border:1px solid var(--border,#d1d5db);border-bottom:none;
      ">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;font-weight:700;color:var(--text,#111);">
            Contas a Receber${b?` / ${b}`:""}
          </span>
          <span style="color:var(--border,#d1d5db);">|</span>
          <button data-action="mes-prev" style="background:none;border:1px solid var(--border,#d1d5db);padding:3px 10px;cursor:pointer;font-size:13px;">&#9664;</button>
          <span style="font-size:13px;font-weight:600;min-width:130px;text-align:center;">${N()}</span>
          <button data-action="mes-next" style="background:none;border:1px solid var(--border,#d1d5db);padding:3px 10px;cursor:pointer;font-size:13px;">&#9654;</button>
          ${o?"":'<button data-action="mes-hoje" style="font-size:11px;color:#2563eb;background:none;border:1px solid #2563eb;padding:2px 8px;cursor:pointer;">Hoje</button>'}
        </div>
        <div style="display:flex;align-items:center;gap:16px;font-size:12px;">
          <span>Total: <strong style="color:#166534;font-variant-numeric:tabular-nums;">${E(c)}</strong></span>
          <span>Recebido: <strong style="color:#1d4ed8;font-variant-numeric:tabular-nums;">${E(d)}</strong></span>
          <span>Pendente: <strong style="color:${u>0?"#92400e":"#6b7280"};font-variant-numeric:tabular-nums;">${E(u)}</strong></span>
        </div>
      </div>

      <!-- Toolbar -->
      <div style="
        display:flex;align-items:center;gap:6px;flex-wrap:wrap;
        padding:6px 8px;background:var(--bg,#f3f4f6);
        border:1px solid var(--border,#d1d5db);border-bottom:none;
      ">
        <span data-filtro-status="todos">   ${L("Todos",y==="todos")}</span>
        <span data-filtro-status="pago">    ${L("Recebidos",y==="pago")}</span>
        <span data-filtro-status="pendente">${L("Pendentes",y==="pendente")}</span>
        <span style="flex:1;"></span>
        <input id="busca-rec" type="text" placeholder="Buscar..." value="${m}"
          style="padding:3px 8px;border:1px solid var(--border,#d1d5db);font-size:12px;background:var(--bg-card,#fff);color:var(--text,#111);width:180px;outline:none;" />
        ${m?'<button id="btn-limpar-busca" style="background:none;border:none;font-size:16px;cursor:pointer;color:#6b7280;padding:0 2px;">×</button>':""}
        <button data-action="nova-receita" style="background:#2563eb;color:#fff;border:none;padding:4px 14px;font-size:12px;font-weight:600;cursor:pointer;">+ Nova</button>
      </div>

      <!-- Tabela -->
      <div style="border:1px solid var(--border,#d1d5db);overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:var(--bg,#f3f4f6);border-bottom:2px solid var(--border,#c8c8c8);">
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Data</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Descrição</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Categoria</th>
              ${b?"":'<th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Negócio</th>'}
              <th style="padding:6px 10px;text-align:right;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Valor</th>
              <th style="padding:6px 10px;text-align:left;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Situação</th>
              <th style="padding:6px 10px;text-align:center;font-size:11px;font-weight:600;color:var(--text-muted,#4b5563);">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${t.length?t.map((n,x)=>Z(n,x)).join(""):`<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted,#9ca3af);font-size:13px;">
                  ${e.length===0?`Nenhuma receita em ${N()}.`:"Nenhum resultado para os filtros."}
                </td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- Rodapé -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:5px 10px;background:var(--bg,#f3f4f6);
        border:1px solid var(--border,#d1d5db);border-top:none;
        font-size:11px;color:var(--text-muted,#6b7280);
      ">
        <span>${t.length} registro${t.length!==1?"s":""}${t.length<e.length?` de ${e.length}`:""}</span>
        ${w?'<button data-action="carregar-mais" style="background:none;border:1px solid var(--border,#d1d5db);padding:2px 10px;cursor:pointer;font-size:11px;">Carregar mais</button>':""}
      </div>
    </div>
  `,(i=l.querySelector('[data-action="mes-prev"]'))==null||i.addEventListener("click",J),(p=l.querySelector('[data-action="mes-next"]'))==null||p.addEventListener("click",Q),(v=l.querySelector('[data-action="mes-hoje"]'))==null||v.addEventListener("click",U),(z=l.querySelector('[data-action="nova-receita"]'))==null||z.addEventListener("click",()=>j(null)),(R=l.querySelector('[data-action="carregar-mais"]'))==null||R.addEventListener("click",()=>S(!1));const r=l.querySelector("#busca-rec");r==null||r.addEventListener("input",n=>{m=n.target.value;const _gid=n.target.id;clearTimeout(window._gtBT);window._gtBT=setTimeout(()=>{h();const _b=_gid&&document.getElementById(_gid);if(_b){_b.focus();_b.setSelectionRange(_b.value.length,_b.value.length)}},350)}),(D=l.querySelector("#btn-limpar-busca"))==null||D.addEventListener("click",()=>{m="",h()}),l.querySelectorAll("[data-filtro-status]").forEach(n=>{n.addEventListener("click",()=>{y=n.dataset.filtroStatus,h()})}),l.querySelectorAll('[data-action="editar"][data-rec-id]').forEach(n=>{n.addEventListener("click",x=>{if(x.target.tagName==="A")return;const F=n.dataset.recId,M=(f.get("receitas")??[]).find(B=>B.id===F);M&&j(M)})})}async function j(e){var u;let t=[];try{const r=await V("negocios");t=P("negocios",r)}catch{}const a=!e,o=e??{status:"pendente",data_vencimento:q(),valor:"",descricao:"",categoria:"",negocio:b??""},c=t.map(r=>`<option value="${r.nome||""}" ${(o.negocio||"")===(r.nome||"")?"selected":""}>${r.nome||r.id}</option>`).join("");_.abrir({titulo:a?"Nova receita":"Editar receita",conteudo:`
      <form id="form-receita" style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:flex;gap:8px;">
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Status
            <select name="status" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="pendente"  ${o.status==="pendente"?"selected":""}>⏰ Pendente</option>
              <option value="recebido"  ${o.status==="recebido"?"selected":""}>✅ Recebido</option>
              <option value="cancelado" ${o.status==="cancelado"?"selected":""}>❌ Cancelado</option>
            </select>
          </label>
          ${t.length?`
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Negócio
            <select name="negocio" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="">— Geral —</option>
              ${c}
            </select>
          </label>`:`<input type="hidden" name="negocio" value="${o.negocio||""}">`}
        </div>

        <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Descrição
          <input name="descricao" type="text" value="${o.descricao||""}" required
            placeholder="Ex: Mensalidade cliente João"
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
            <input name="data_vencimento" type="date" value="${o.data_vencimento||q()}" required
              style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
          </label>
        </div>

        <label style="display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
          Categoria (opcional)
          <input name="categoria" type="text" value="${o.categoria||""}"
            placeholder="Ex: Mensalidade, Serviço..."
            style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
        </label>

        <div style="display:flex;gap:8px;">
          <label style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Periodicidade
            <select name="periodicidade" style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);">
              <option value="" ${!(o.periodicidade)?"selected":""}>Única vez</option>
              <option value="fixa" ${(o.periodicidade||"")==="fixa"?"selected":""}>Fixa (mensal, sem prazo)</option>
              <option value="mensal" ${(o.periodicidade||"")==="mensal"?"selected":""}>Todo mês</option>
              <option value="semanal" ${(o.periodicidade||"")==="semanal"?"selected":""}>Toda semana</option>
              <option value="anual" ${(o.periodicidade||"")==="anual"?"selected":""}>Todo ano</option>
            </select>
          </label>
          <label id="rec-parcelas-wrap" style="flex:1;display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:500;">
            Parcelas
            <input name="parcelas" type="number" min="1" max="120" value="${o.parcelas||1}"
              placeholder="1"
              style="padding:8px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:14px;background:var(--bg-card);color:var(--text);" />
          </label>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
          ${a?"":`<button type="button" id="btn-excluir-rec" style="
            padding:8px 16px;border-radius:8px;border:1px solid #dc2626;
            color:#dc2626;background:transparent;cursor:pointer;font-size:14px;
          ">Excluir</button>`}
          <button type="submit" style="
            padding:8px 20px;border-radius:8px;border:none;
            background:var(--primary,#2563eb);color:#fff;
            font-size:14px;font-weight:600;cursor:pointer;
          ">${a?"Criar":"Salvar"}</button>
        </div>
      </form>
    `}),await new Promise(r=>setTimeout(r,60));const d=document.getElementById("form-receita");{const _sP=d&&d.querySelector('[name=periodicidade]'),_pW=document.getElementById('rec-parcelas-wrap');if(_sP&&_pW){const _t=()=>{_pW.style.display=(_sP.value===''||_sP.value==='fixa')?'none':'';};_sP.addEventListener('change',_t);_t();}}d&&(d.addEventListener("submit",async r=>{r.preventDefault();const i=new FormData(d),per=i.get("periodicidade")||'',p={id:(e==null?void 0:e.id)??W(),tipo:"receita",status:i.get("status"),descricao:i.get("descricao"),valor:parseFloat(i.get("valor"))||0,data_vencimento:i.get("data_vencimento"),categoria:i.get("categoria")||null,negocio:i.get("negocio")||null,periodicidade:per||null,parcelas:per==='fixa'?120:parseInt(i.get("parcelas"))||1,mes_ref:(i.get("data_vencimento")||"").slice(0,7)},v=d.querySelector("[type=submit]");v.disabled=!0,v.textContent="Salvando…";try{if(per==='fixa'&&a){const dv=p.data_vencimento,grp=crypto.randomUUID();for(let n=0;n<120;n++){const dt=new Date(dv+'T12:00:00');dt.setMonth(dt.getMonth()+n);const dvi=dt.toISOString().slice(0,10);await Y("lancamentos",{...p,id:n===0?p.id:crypto.randomUUID(),data_vencimento:dvi,mes_ref:dvi.slice(0,7),parcela:`${n+1}/120`,grupoRecorrencia:grp});}f.patch("receitas",p.id,p);}else{await Y("lancamentos",p);f.patch("receitas",p.id,p);}_.fechar(),k.ok(a?"Receita criada!":"Receita atualizada!"),h()}catch(z){console.error(z),k.err("Erro ao salvar: "+z.message),v.disabled=!1,v.textContent=a?"Criar":"Salvar"}}),(u=document.getElementById("btn-excluir-rec"))==null||u.addEventListener("click",async()=>{if(await _.confirmar(`Excluir "${e.descricao}"? Esta ação não pode ser desfeita.`,{textoBotao:"Excluir",tipo:"danger"}))try{await H("lancamentos",e.id),f.remove("receitas",e.id),_.fechar(),k.ok("Receita excluída."),h()}catch(i){k.err("Erro ao excluir: "+i.message)}}))}async function oe(e){var a;l=e,b=((a=O.params())==null?void 0:a.negocio)??null,m="",y="todos";const t=new Date;g=t.getFullYear(),s=t.getMonth()+1,$=null,w=!1,C=!1,f.set("receitas",[]),h(),await S(!0)}export{oe as initReceitas};
