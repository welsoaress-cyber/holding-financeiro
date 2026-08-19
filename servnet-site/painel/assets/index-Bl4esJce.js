import{j as g,s as u,t as c,f as D,b as z}from"./page-dashboard-Dbqm2OjX.js";import"./supabase-DthfXWp1.js";let d=null,v="",x="todos",m="",p=new Set;const k={provedor:{vencidoDias:1,bloqueadoDias:6},servidor:{vencidoDias:1,bloqueadoDias:2},default:{vencidoDias:1,bloqueadoDias:6}};function L(e=""){return k[(e||"").toLowerCase()]||k.default}function $(e){if(!e)return 0;const a=new Date;a.setHours(0,0,0,0);const o=new Date(e+"T00:00:00");return Math.floor((a-o)/864e5)}function S(e,a){if(e<=0)return"a-vencer";const o=L(a);return e>=o.bloqueadoDias?"bloqueado":e>=o.vencidoDias?"vencido":"em-dia"}const E={"a-vencer":{label:"A vencer",bg:"#eff6ff",cor:"#1d4ed8"},"em-dia":{label:"Em dia",bg:"#d1fae5",cor:"#065f46"},vencido:{label:"Vencido",bg:"#fef3c7",cor:"#92400e"},bloqueado:{label:"Bloqueado",bg:"#fee2e2",cor:"#991b1b"}},A=["Provedor","Servidor","Precautec","Outro"];async function w(){var e;try{const{data:a,error:o}=await g.from("lancamentos").select("id, dados").eq("dados->>tipo","Receita").neq("dados->>status","Pago").order("dados->>data",{ascending:!0});if(o)throw o;const i=new Map,r=u.get("clientes")||[];for(const l of r)i.set(l.id,l);const b=(a||[]).map(l=>{const s=l.dados||{},t=i.get(s.clienteId)||{};return{id:l.id,clienteId:s.clienteId||"",clienteNome:s.clienteNome||t.nome||s.nome||"(sem nome)",negocio:s.negocio||"",valor:Number(s.valor||s.valorTotal||0),data:s.data||"",status:s.status||"Pendente",whatsapp:t.whatsapp||t.celular||s.telefone||"",inativo:s.inativo==="true"}}).filter(l=>!l.inativo);if(u.set("faturas_cobr",b),!((e=u.get("clientes"))!=null&&e.length)){const{data:l}=await g.from("cli_clientes").select("id, dados"),s=new Map;for(const n of l||[]){const f=n.dados||{};s.set(n.id,{id:n.id,nome:f.nome,whatsapp:f.whatsapp||f.celular})}const t=b.map(n=>{const f=s.get(n.clienteId);return f?{...n,whatsapp:f.whatsapp||n.whatsapp,clienteNome:f.nome||n.clienteNome}:n});u.set("faturas_cobr",t)}}catch(a){c.err("Erro ao carregar cobranças: "+a.message)}h()}function h(){var i,r,b,l,s;if(!d)return;let e=u.get("faturas_cobr")||[];if(e=e.map(t=>({...t,dias:$(t.data),statusCalc:S($(t.data),t.negocio)})),v&&(e=e.filter(t=>t.negocio===v)),x!=="todos"&&(e=e.filter(t=>t.statusCalc===x)),m.trim()){const t=m.toLowerCase();e=e.filter(n=>(n.clienteNome||"").toLowerCase().includes(t)||(n.negocio||"").toLowerCase().includes(t))}e.sort((t,n)=>n.dias-t.dias);const a=u.get("faturas_cobr")||[],o={vencido:0,bloqueado:0,aVencer:0,totalDevido:0};for(const t of a){const n=$(t.data),f=S(n,t.negocio);f==="vencido"&&(o.vencido++,o.totalDevido+=t.valor),f==="bloqueado"&&(o.bloqueado++,o.totalDevido+=t.valor),f==="a-vencer"&&o.aVencer++}d.innerHTML=`
    <div style="padding:16px 20px;max-width:960px;font-family:Inter,sans-serif;">

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h1 style="font-size:20px;font-weight:700;margin:0;">Cobranças</h1>
        <div style="display:flex;gap:8px;">
          <button id="btn-cobrar-lote" style="padding:8px 16px;border-radius:8px;border:none;cursor:pointer;
            background:var(--accent,#3FD68E);color:#fff;font-weight:600;font-size:13px;">
            📲 Cobrar Selecionados (<span id="qtd-sel">${p.size}</span>)
          </button>
          <button id="btn-cobrar-todos" style="padding:8px 16px;border-radius:8px;border:none;cursor:pointer;
            background:#1d4ed8;color:#fff;font-weight:600;font-size:13px;">
            📣 Disparar automático
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
        ${y("Vencidos",o.vencido,"#fef3c7","#92400e")}
        ${y("Bloqueados",o.bloqueado,"#fee2e2","#991b1b")}
        ${y("A vencer",o.aVencer,"#eff6ff","#1d4ed8")}
        ${y("Total devido",D(o.totalDevido),"#f5f3ff","#6d28d9",!0)}
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
        <input id="busca-cobr" type="search" value="${m}"
          placeholder="🔍 Buscar cliente ou negócio…"
          style="flex:1;min-width:180px;padding:8px 12px;border-radius:8px;
            border:1px solid var(--border,#e5e7eb);font-size:13px;
            background:var(--bg,#fff);color:var(--text-1,#111);" />

        <select id="sel-neg-cobr" style="padding:8px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);">
          <option value="">Todos os negócios</option>
          ${A.map(t=>`<option value="${t}"${v===t?" selected":""}>${t}</option>`).join("")}
        </select>

        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          ${["todos","vencido","bloqueado","a-vencer"].map(t=>{var n;return`
            <button data-fs="${t}" style="
              padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;
              border:1px solid ${x===t?"var(--accent,#3FD68E)":"var(--border,#e5e7eb)"};
              background:${x===t?"var(--accent,#3FD68E)":"transparent"};
              color:${x===t?"#fff":"var(--text-1,#111)"};">
              ${((n=E[t])==null?void 0:n.label)||"Todos"}
            </button>`}).join("")}
        </div>
      </div>

      <!-- Selecionar todos -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;color:var(--text-2,#6b7280);">
        <input type="checkbox" id="sel-all" ${p.size===e.length&&e.length>0?"checked":""} />
        <label for="sel-all">Selecionar todos (${e.length})</label>
      </div>

      <!-- Tabela -->
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;
              border-bottom:2px solid var(--border,#e5e7eb);">
              <th style="padding:8px 6px;text-align:left;width:24px;"></th>
              <th style="padding:8px 6px;text-align:left;">Cliente</th>
              <th style="padding:8px 6px;text-align:left;">Negócio</th>
              <th style="padding:8px 6px;text-align:right;">Valor</th>
              <th style="padding:8px 6px;text-align:center;">Vencimento</th>
              <th style="padding:8px 6px;text-align:center;">Atraso</th>
              <th style="padding:8px 6px;text-align:center;">Status</th>
              <th style="padding:8px 6px;text-align:center;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${e.length?e.map(t=>_(t)).join(""):`<tr><td colspan="8" style="padding:48px;text-align:center;color:#9ca3af;">
                  Nenhuma fatura pendente encontrada.
                </td></tr>`}
          </tbody>
        </table>
      </div>

      <div style="margin-top:10px;font-size:12px;color:var(--text-3,#9ca3af);text-align:center;">
        ${e.length} fatura(s) listada(s)
      </div>
    </div>
  `,(i=d.querySelector("#busca-cobr"))==null||i.addEventListener("input",t=>{m=t.target.value,h()}),(r=d.querySelector("#sel-neg-cobr"))==null||r.addEventListener("change",t=>{v=t.target.value,h()}),d.querySelectorAll("[data-fs]").forEach(t=>t.addEventListener("click",()=>{x=t.dataset.fs,h()})),(b=d.querySelector("#sel-all"))==null||b.addEventListener("change",t=>{t.target.checked?e.forEach(n=>p.add(n.id)):p.clear(),h()}),d.querySelectorAll("[data-sel]").forEach(t=>t.addEventListener("change",()=>{t.checked?p.add(t.dataset.sel):p.delete(t.dataset.sel);const n=d.querySelector("#qtd-sel");n&&(n.textContent=p.size)})),d.querySelectorAll("[data-cobrar-cli]").forEach(t=>t.addEventListener("click",()=>N(t.dataset.cobrarCli))),d.querySelectorAll("[data-pago]").forEach(t=>t.addEventListener("click",()=>j(t.dataset.pago))),d.querySelectorAll("[data-bloquear-cli]").forEach(t=>t.addEventListener("click",()=>I(t.dataset.bloquearCli))),(l=d.querySelector("#btn-cobrar-lote"))==null||l.addEventListener("click",T),(s=d.querySelector("#btn-cobrar-todos"))==null||s.addEventListener("click",M)}function y(e,a,o,i,r=!1){return`
    <div style="background:${o};border-radius:10px;padding:12px 10px;text-align:center;">
      <div style="font-size:10px;color:${i};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">${e}</div>
      <div style="font-size:${r?"14px":"22px"};font-weight:700;color:${i};">${a}</div>
    </div>`}function _(e){const a=E[e.statusCalc]||E.vencido,o=p.has(e.id),i=e.dias>0?`${e.dias}d`:e.dias===0?"Hoje":`em ${Math.abs(e.dias)}d`,r=e.dias>0?"#dc2626":"#059669";return`
    <tr style="border-bottom:1px solid var(--border,#f3f4f6);${e.dias>5?"background:rgba(254,226,226,.25);":""}">
      <td style="padding:10px 6px;">
        <input type="checkbox" data-sel="${e.id}" ${o?"checked":""} />
      </td>
      <td style="padding:10px 6px;font-weight:600;color:var(--text-1,#111);">${C(e.clienteNome)}</td>
      <td style="padding:10px 6px;">
        <span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--bg,#f3f4f6);color:var(--text-2,#374151);font-weight:600;">
          ${C(e.negocio||"—")}
        </span>
      </td>
      <td style="padding:10px 6px;text-align:right;font-weight:700;color:var(--text-1,#111);">${D(e.valor)}</td>
      <td style="padding:10px 6px;text-align:center;color:var(--text-2,#6b7280);">${e.data?z(e.data):"—"}</td>
      <td style="padding:10px 6px;text-align:center;font-weight:700;color:${r};">${i}</td>
      <td style="padding:10px 6px;text-align:center;">
        <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;
          background:${a.bg};color:${a.cor};white-space:nowrap;">
          ${a.label}
        </span>
      </td>
      <td style="padding:10px 6px;text-align:center;">
        <div style="display:flex;gap:4px;justify-content:center;">
          <button data-cobrar-cli="${e.clienteId}" title="Cobrar WhatsApp" style="${q("#dcfce7","#065f46")}">📲</button>
          <button data-pago="${e.id}"              title="Marcar como pago" style="${q("#d1fae5","#065f46")}">✅</button>
          <button data-bloquear-cli="${e.clienteId}" title="Bloquear" style="${q("#fee2e2","#991b1b")}">🔒</button>
        </div>
      </td>
    </tr>`}function q(e,a){return`padding:4px 8px;border-radius:6px;border:none;cursor:pointer;font-size:13px;background:${e};color:${a};`}async function N(e){if(e){c.ok("Enviando cobrança…");try{const{data:a,error:o}=await g.functions.invoke("whatsapp-lembretes",{body:{clienteId:e}});if(o||a!=null&&a.error)throw new Error((o==null?void 0:o.message)||(a==null?void 0:a.error));const i=(a==null?void 0:a.enviados)??0;c.ok(i>0?`✅ ${i} mensagem(ns) enviada(s)!`:"⚠️ Nenhuma fatura encontrada para este cliente.")}catch(a){c.err("Erro: "+a.message)}}}async function T(){if(!p.size){c.err("Selecione ao menos uma fatura.");return}const e=u.get("faturas_cobr")||[],a=[...new Set([...p].map(i=>{var r;return(r=e.find(b=>b.id===i))==null?void 0:r.clienteId}).filter(Boolean))];c.ok(`Enviando cobrança para ${a.length} cliente(s)…`);let o=0;for(const i of a)try{const{data:r}=await g.functions.invoke("whatsapp-lembretes",{body:{clienteId:i}});o+=(r==null?void 0:r.enviados)||0}catch{}c.ok(`✅ ${o} mensagem(ns) enviada(s)!`),p.clear(),await w()}async function M(){if(confirm("Disparar lembretes automáticos para todos os clientes com faturas em atraso?")){c.ok("Disparando…");try{const{data:e,error:a}=await g.functions.invoke("whatsapp-lembretes");if(a||e!=null&&e.error)throw new Error((a==null?void 0:a.message)||(e==null?void 0:e.error));c.ok(`✅ Enviados: ${(e==null?void 0:e.enviados)||0} | Erros: ${(e==null?void 0:e.erros)||0}`)}catch(e){c.err("Erro: "+e.message)}}}async function j(e){if(!confirm("Marcar esta fatura como paga?"))return;const a=new Date().toISOString().split("T")[0];try{const{data:o}=await g.from("lancamentos").select("dados").eq("id",e).single(),i={...(o==null?void 0:o.dados)||{},status:"Pago",dataPagamento:a},{error:r}=await g.from("lancamentos").update({dados:i}).eq("id",e);if(r)throw r;c.ok("✅ Marcado como pago!"),await w()}catch(o){c.err("Erro: "+o.message)}}async function I(e){if(!e)return;const o=(u.get("clientes")||[]).find(r=>r.id===e);if(!o){c.err("Cliente não encontrado.");return}const i=(o.contratos||[]).map(r=>({...r,bloqueado:!0}));try{const{error:r}=await g.from("cli_clientes").update({dados:{...o,contratos:i}}).eq("id",e);if(r)throw r;c.ok("🔒 Cliente bloqueado."),await w()}catch(r){c.err("Erro: "+r.message)}}function C(e){return String(e||"").replace(/</g,"&lt;")}async function B(e){d=e,m="",v="",x="todos",p=new Set,d.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;">Carregando…</div>',await w()}export{B as initCobrancas};
