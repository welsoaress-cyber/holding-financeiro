import{i as J,s as v,u as G,j as Q,t as h,f as $,b as _,e as F}from"./page-dashboard-Dbqm2OjXbF1.js";import{u as B}from"./page-lancamentos-BfWtlLw7bF1.js";import"./supabase-DthfXWp1F1.js";let L=null,E="lista",N="",S="todos",P="";const U={provedor:{vencidoDias:1,bloqueadoDias:6,cobrancasInativo:null},servidor:{vencidoDias:1,bloqueadoDias:2,cobrancasInativo:3},default:{vencidoDias:1,bloqueadoDias:6,cobrancasInativo:null}},tt=(t="")=>U[(t||"").toLowerCase()]||U.default,X=["Provedor","Servidor","Precautec","Outro"],et=["Mensal","Bimestral","Trimestral","Semestral","Anual"];function O(t){if(!t)return 0;const d=new Date;return d.setHours(0,0,0,0),Math.floor((d-new Date(t+"T00:00:00"))/864e5)}function k(t,d){const e=(d==null?void 0:d.get(t.id))||[];if(!e.length)return(t.contratos||[]).length?"ativo":"sem-contrato";let a=-1/0,r="";for(const p of e){const f=O(p.data);f>a&&(a=f,r=p.negocio||"")}if(a<=0)return"ativo";const i=tt(r);if(i.cobrancasInativo){const p=(t.contratos||[]).find(f=>{var n;return((n=f.negocio)==null?void 0:n.toLowerCase())===r.toLowerCase()});if(p&&(p.cobrancasEnviadas||0)>=i.cobrancasInativo)return"inativo"}return a>=i.bloqueadoDias?"bloqueado":a>=i.vencidoDias?"vencido":"ativo"}const j={ativo:{label:"Ativo",bg:"#d1fae5",cor:"#065f46"},vencido:{label:"Vencido",bg:"#fef3c7",cor:"#92400e"},bloqueado:{label:"Bloqueado",bg:"#fee2e2",cor:"#991b1b"},inativo:{label:"Inativo",bg:"#f3f4f6",cor:"#6b7280"},"sem-contrato":{label:"Sem contrato",bg:"#eff6ff",cor:"#1d4ed8"},novo:{label:"Novos do mês",bg:"#dbeafe",cor:"#1e40af"}};async function R(){try{const[t,d]=await Promise.all([J("cli_clientes"),J("cli_planos")]);v.set("clientes",G("cli_clientes",t)),v.set("cli_planos",G("cli_planos",d));const{data:e}=await Q.from("lancamentos").select("id, dados").eq("dados->>tipo","receita").neq("dados->>status","pago"),a=new Map;for(const r of e||[]){const i=r.dados||{};if(!i.clienteId)continue;const p=a.get(i.clienteId)||[];p.push({id:r.id,...i}),a.set(i.clienteId,p)}v.set("faturas_abertas_map",a)}catch(t){h.err("Erro ao carregar: "+t.message)}Z()}function Z(){if(!L)return;const d=`
    <div style="display:flex;gap:0;border-bottom:2px solid var(--border,#e5e7eb);margin-bottom:16px;">
      ${[{key:"lista",label:"👥 Clientes"},{key:"dashboard",label:"📊 Dashboard"},{key:"relatorios",label:"📋 Relatórios"}].map(a=>`
        <button data-aba="${a.key}" style="
          padding:10px 18px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:600;
          color:${E===a.key?"var(--accent,#3FD68E)":"var(--text-2,#6b7280)"};
          border-bottom:2px solid ${E===a.key?"var(--accent,#3FD68E)":"transparent"};
          margin-bottom:-2px;font-family:Inter,sans-serif;">
          ${a.label}
        </button>`).join("")}
    </div>`;L.innerHTML=`<div style="padding:16px 20px;max-width:960px;font-family:Inter,sans-serif;">${d}<div id="aba-content"></div></div>`,L.querySelectorAll("[data-aba]").forEach(a=>a.addEventListener("click",()=>{E=a.dataset.aba,Z()}));const e=L.querySelector("#aba-content");E==="lista"?T(e):E==="dashboard"?nt(e):E==="relatorios"&&it(e)}function T(t){var i,p,f;const d=v.get("faturas_abertas_map")||new Map;let e=v.get("clientes")??[];S==="novo"?(e=e.filter(n=>{const _nd=new Date;return(n.dataCadastro||"")>=new Date(_nd.getFullYear(),_nd.getMonth(),1).toISOString().split("T")[0]})):S!=="todos"&&(e=e.filter(n=>k(n,d)===S));if(P&&(e=e.filter(n=>(n.contratos||[]).some(s=>s.negocio===P))),N.trim()){const n=N.toLowerCase();const _nrm=t=>t.normalize("NFD").replace(/[̀-ͯ]/g,"");const _q=_nrm(n);const _qd=n.replace(/\D/g,"");e=e.filter(s=>{const _nm=_nrm((s.nome||"").toLowerCase());if(_nm.includes(_q))return true;if(_qd&&(s.cpfCnpj||s.cpf||"").replace(/\D/g,"").includes(_qd))return true;if(_nrm((s.email||"").toLowerCase()).includes(_q))return true;if(_qd&&(s.whatsapp||s.celular||"").replace(/\D/g,"").includes(_qd))return true;return false})}e.sort((n,s)=>(n.nome||"").localeCompare(s.nome||"","pt-BR"));const a=v.get("clientes")??[],r={ativo:0,vencido:0,bloqueado:0,inativo:0,mrr:0};for(const n of a){const s=k(n,d);r[s]!==void 0&&r[s]++,(s==="ativo"||s==="vencido")&&(r.mrr+=(n.contratos||[]).filter(o=>o.statusContrato==="Ativo").reduce((o,l)=>o+(Number(l.valor)||0),0))}t.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
      <h2 style="font-size:18px;font-weight:700;margin:0;">Clientes</h2>
      <button id="btn-novo-cli" style="padding:8px 18px;border-radius:8px;border:none;cursor:pointer;background:var(--accent,#3FD68E);color:#fff;font-weight:600;font-size:14px;">+ Novo</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px;">
      ${M("Ativos",r.ativo,"#d1fae5","#065f46")}
      ${M("Vencidos",r.vencido,"#fef3c7","#92400e")}
      ${M("Bloqueados",r.bloqueado,"#fee2e2","#991b1b")}
      ${M("Inativos",r.inativo,"#f3f4f6","#6b7280")}
      ${M("MRR",$(r.mrr),"#eff6ff","#1d4ed8",!0)}
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
      <input id="busca-cli" type="search" value="${N}" placeholder="🔍 Nome, CPF, e-mail…"
        style="${C()};flex:1;min-width:200px;" />
      <select id="sel-neg" style="${C()};padding:8px 10px;">
        <option value="">Todos os negócios</option>
        ${X.map(n=>`<option value="${n}"${P===n?" selected":""}>${n}</option>`).join("")}
      </select>
      <div style="display:flex;gap:4px;flex-wrap:wrap;">
        ${["todos","ativo","vencido","bloqueado","inativo","novo"].map(n=>{var s;return`
          <button data-fs="${n}" style="padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;
            border:1px solid ${S===n?"var(--accent,#3FD68E)":"var(--border,#e5e7eb)"};
            background:${S===n?"var(--accent,#3FD68E)":"transparent"};
            color:${S===n?"#fff":"var(--text-1,#111)"};">
            ${((s=j[n])==null?void 0:s.label)||"Todos"}</button>`}).join("")}
      </div>
    </div>

    <div id="lista-cli" style="display:flex;flex-direction:column;gap:6px;">
      ${e.length?e.map(n=>at(n,d)).join(""):ot(N||S!=="todos"||P)}
    </div>
    <div style="margin-top:10px;font-size:12px;color:var(--text-3,#9ca3af);text-align:center;">${e.length} de ${a.length} cliente(s)</div>
  `,(i=t.querySelector("#btn-novo-cli"))==null||i.addEventListener("click",()=>V()),(p=t.querySelector("#busca-cli"))==null||p.addEventListener("input",n=>{N=n.target.value;const _gid=n.target.id;clearTimeout(window._gtBT);window._gtBT=setTimeout(()=>{T(t);const _b=_gid&&document.getElementById(_gid);if(_b){_b.focus();_b.setSelectionRange(_b.value.length,_b.value.length)}},350)}),(f=t.querySelector("#sel-neg"))==null||f.addEventListener("change",n=>{P=n.target.value,T(t)}),t.querySelectorAll("[data-fs]").forEach(n=>n.addEventListener("click",()=>{S=n.dataset.fs,T(t)})),t.querySelectorAll("[data-ver]").forEach(n=>n.addEventListener("click",s=>{s.stopPropagation();const o=(v.get("clientes")??[]).find(l=>l.id===n.dataset.ver);o&&rt(o,d)})),t.querySelectorAll("[data-edit]").forEach(n=>n.addEventListener("click",s=>{s.stopPropagation();const o=(v.get("clientes")??[]).find(l=>l.id===n.dataset.edit);o&&V(o)})),t.querySelectorAll("[data-cobrar]").forEach(n=>n.addEventListener("click",s=>{s.stopPropagation(),H(n.dataset.cobrar)})),t.querySelectorAll("[data-bloquear]").forEach(n=>n.addEventListener("click",s=>{s.stopPropagation(),Y(n.dataset.bloquear,!0)})),t.querySelectorAll("[data-reativar]").forEach(n=>n.addEventListener("click",s=>{s.stopPropagation(),Y(n.dataset.reativar,!1)})),t.querySelectorAll("[data-excluir]").forEach(n=>n.addEventListener("click",async s=>{s.stopPropagation();const o=(v.get("clientes")??[]).find(l=>l.id===n.dataset.excluir);if(!o)return;if(!confirm("Excluir permanentemente \""+(o.nome||o.id)+"\""+"?\n\nEsta ação não pode ser desfeita."))return;try{const{error:_er}=await Q.from("cli_clientes").delete().eq("id",o.id);if(_er)throw _er;h.ok("Cliente excluído.");await R()}catch(_er){h.err("Erro ao excluir: "+_er.message)}}))}function ot(t){return`<p style="text-align:center;padding:48px 0;color:#9ca3af;font-size:14px;">${t?"Nenhum cliente encontrado.":"Nenhum cliente cadastrado ainda."}</p>`}function at(t,d){var o;const e=k(t,d),a=j[e]||j.ativo,r=[...new Set((t.contratos||[]).map(l=>l.negocio).filter(Boolean))],i=(t.contratos||[]).filter(l=>l.statusContrato==="Ativo").reduce((l,x)=>l+(Number(x.valor)||0),0),p=e==="bloqueado"||e==="inativo",n=((d==null?void 0:d.get(t.id))||[]).filter(l=>O(l.data)<0).sort((l,x)=>{var c;return(c=l.data)==null?void 0:c.localeCompare(x.data)}),s=(o=n[0])!=null&&o.data?_(n[0].data):"—";return`
    <div style="background:var(--bg-card,#fff);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);border-left:3px solid ${a.bg};">
      <div style="width:38px;height:38px;border-radius:50%;background:${a.bg};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">👤</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:14px;color:var(--text-1,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${z(t.nome||"—")}</div>
        <div style="font-size:12px;color:var(--text-2,#6b7280);margin-top:1px;">${z(t.cpfCnpj||t.cpf||"—")}${t.whatsapp||t.celular?` · ${t.whatsapp||t.celular}`:""}</div>
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;flex-shrink:0;">${r.map(l=>`<span style="font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;background:var(--bg,#f3f4f6);color:var(--text-2,#374151);">${l}</span>`).join("")}</div>
      <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${a.bg};color:${a.cor};white-space:nowrap;flex-shrink:0;">${a.label}</span>
      <div style="font-size:13px;font-weight:600;color:var(--text-1,#111);min-width:72px;text-align:right;flex-shrink:0;">${$(i)}</div>
      <div style="font-size:12px;color:var(--text-2,#6b7280);min-width:72px;text-align:right;flex-shrink:0;">${s}</div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button data-ver="${t.id}" title="Detalhes" style="${D("#eff6ff","#1d4ed8")}">👁</button>
        <button data-edit="${t.id}" title="Editar" style="${D("#fef9c3","#92400e")}">✏️</button>
        <button data-cobrar="${t.id}" title="Cobrar WhatsApp" style="${D("#dcfce7","#065f46")}">📲</button>
        ${p?`<button data-reativar="${t.id}" title="Reativar" style="${D("#d1fae5","#065f46")}">✅</button>`:`<button data-bloquear="${t.id}" title="Bloquear" style="${D("#fee2e2","#991b1b")}">🔒</button>`}
        <button data-excluir="${t.id}" title="Excluir cliente" style="${D(\"#fee2e2\",\"#991b1b\")}">🗑️</button>
      </div>
    </div>`}function nt(t){const d=v.get("faturas_abertas_map")||new Map,e=v.get("clientes")??[],a=new Date;a.setHours(0,0,0,0);const r=new Date(a.getFullYear(),a.getMonth(),1).toISOString().split("T")[0],i={total:0,ativo:0,vencido:0,bloqueado:0,inativo:0,semContrato:0,novosMes:0,mrr:0},p={},f={};for(const b of e){i.total++;const g=k(b,d);g==="ativo"?i.ativo++:g==="vencido"?i.vencido++:g==="bloqueado"?i.bloqueado++:g==="inativo"?i.inativo++:i.semContrato++,(b.dataCadastro||"")>=r&&i.novosMes++;for(const y of b.contratos||[]){if(y.statusContrato!=="Ativo")continue;const w=y.negocio||"Outro";p[w]=(p[w]||0)+(Number(y.valor)||0),g!=="ativo"&&(f[w]=(f[w]||0)+1)}(g==="ativo"||g==="vencido")&&(i.mrr+=(b.contratos||[]).filter(y=>y.statusContrato==="Ativo").reduce((y,w)=>y+(Number(w.valor)||0),0))}const n=i.vencido+i.bloqueado+i.inativo,s=i.total?Math.round(n/i.total*100):0,o=Object.entries(p).sort((b,g)=>g[1]-b[1]),l=o.reduce((b,[,g])=>Math.max(b,g),1),x=220,c=o.map(([b,g])=>{const y=Math.round(g/l*x);return`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="width:80px;font-size:12px;font-weight:600;color:var(--text-2,#6b7280);text-align:right;">${b}</div>
        <div style="background:#e5e7eb;border-radius:4px;overflow:hidden;height:20px;flex:1;max-width:${x}px;">
          <div style="background:var(--accent,#3FD68E);height:100%;width:${y}px;border-radius:4px;transition:width .4s;"></div>
        </div>
        <div style="font-size:12px;font-weight:700;color:var(--text-1,#111);min-width:80px;">${$(g)}</div>
      </div>`}).join(""),m=Object.entries(f).map(([b,g])=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border,#f3f4f6);">
      <span style="font-size:13px;color:var(--text-1,#111);">${b}</span>
      <span style="font-size:13px;font-weight:700;color:#dc2626;">${g} cliente(s)</span>
    </div>`).join("")||'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:16px 0;">Sem inadimplência! 🎉</p>';t.innerHTML=`
    <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">Dashboard de Clientes</h2>

    <!-- KPIs principais -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;">
      <div data-kpi="todos" style="cursor:pointer;">${A("Total de Clientes",i.total,"👥","var(--bg-card,#fff)","var(--text-1,#111)")}</div>
      <div data-kpi="ativo" style="cursor:pointer;">${A("Clientes Ativos",i.ativo,"✅","#d1fae5","#065f46")}</div>
      <div data-kpi="novo" style="cursor:pointer;">${A("Novos este mês",i.novosMes,"🆕","#eff6ff","#1d4ed8")}</div>
      <div data-kpi="vencido" style="cursor:pointer;">${A("Inadimplentes",n,"⚠️","#fef3c7","#92400e")}</div>
      <div data-kpi="bloqueado" style="cursor:pointer;">${A("Bloqueados",i.bloqueado,"🔒","#fee2e2","#991b1b")}</div>
      ${A("MRR",$(i.mrr),"💰","#f5f3ff","#6d28d9",!0)}
    </div>

    <!-- Taxa de inadimplência -->
    <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:13px;font-weight:600;color:var(--text-2,#6b7280);margin-bottom:8px;">Taxa de Inadimplência</div>
      <div style="background:var(--border,#e5e7eb);border-radius:8px;height:12px;overflow:hidden;margin-bottom:6px;">
        <div style="background:${s>20?"#dc2626":s>10?"#f59e0b":"#10b981"};height:100%;width:${s}%;border-radius:8px;transition:width .4s;"></div>
      </div>
      <div style="font-size:20px;font-weight:700;color:${s>20?"#dc2626":s>10?"#f59e0b":"#10b981"};">${s}%</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <!-- MRR por negócio -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
        <div style="font-size:13px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">MRR por Negócio</div>
        ${c||'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:8px 0;">Sem dados.</p>'}
      </div>

      <!-- Inadimplência por negócio -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
        <div style="font-size:13px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">Inadimplência por Negócio</div>
        ${m}
      </div>
    </div>

    <!-- Status dos clientes -->
    <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:13px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">Distribuição por Status</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${[["Ativos",i.ativo,"#d1fae5","#065f46","ativo"],["Vencidos",i.vencido,"#fef3c7","#92400e","vencido"],["Bloqueados",i.bloqueado,"#fee2e2","#991b1b","bloqueado"],["Inativos",i.inativo,"#f3f4f6","#6b7280","inativo"],["Sem contrato",i.semContrato,"#eff6ff","#1d4ed8","sem-contrato"]].map(([b,g,y,w,fk])=>i.total?`
          <div data-kpi="${fk}" style="cursor:pointer;background:${y};border-radius:8px;padding:10px 14px;flex:1;min-width:80px;text-align:center;">
            <div style="font-size:20px;font-weight:700;color:${w};">${g}</div>
            <div style="font-size:11px;color:${w};opacity:.8;margin-top:2px;">${b}</div>
          </div>`:"").join("")}
      </div>
    </div>
  `;t.querySelectorAll("[data-kpi]").forEach(el=>el.addEventListener("click",()=>{S=el.dataset.kpi;E="lista";Z()}))}function A(t,d,e,a,r,i=!1){return`
    <div style="background:${a};border-radius:10px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:20px;margin-bottom:6px;">${e}</div>
      <div style="font-size:${i?"16px":"26px"};font-weight:700;color:${r};">${d}</div>
      <div style="font-size:11px;color:${r};opacity:.75;margin-top:2px;">${t}</div>
    </div>`}function it(t){var n,s;const d=v.get("faturas_abertas_map")||new Map,e=v.get("clientes")??[],a=e.filter(o=>["vencido","bloqueado","inativo"].includes(k(o,d))).map(o=>{const l=d.get(o.id)||[],x=l.reduce((m,b)=>Math.max(m,O(b.data)),0),c=l.reduce((m,b)=>m+(Number(b.valor)||0),0);return{...o,maxDias:x,totalDevido:c,status:k(o,d)}}).sort((o,l)=>l.maxDias-o.maxDias),r={};let i=0;for(const o of e.filter(l=>["ativo","vencido"].includes(k(l,d))))for(const l of(o.contratos||[]).filter(x=>x.statusContrato==="Ativo")){const x=l.negocio||"Outro";r[x]=(r[x]||0)+(Number(l.valor)||0),i+=Number(l.valor)||0}const p=(new Date().getMonth()+1).toString().padStart(2,"0"),f=e.filter(o=>(o.dataNascimento||"").slice(5,7)===p);t.innerHTML=`
    <h2 style="font-size:18px;font-weight:700;margin:0 0 16px;">Relatórios</h2>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
      <button id="btn-exp-inad" style="padding:8px 16px;border-radius:8px;border:none;cursor:pointer;background:#fee2e2;color:#991b1b;font-weight:600;font-size:13px;">⬇ Inadimplentes CSV</button>
      <button id="btn-exp-cli"  style="padding:8px 16px;border-radius:8px;border:none;cursor:pointer;background:#eff6ff;color:#1d4ed8;font-weight:600;font-size:13px;">⬇ Todos Clientes CSV</button>
    </div>

    <!-- Inadimplentes -->
    <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:14px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">
        Inadimplentes (${a.length})
      </div>
      ${a.length?`
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;border-bottom:2px solid var(--border,#e5e7eb);">
              <th style="padding:6px;text-align:left;">Cliente</th>
              <th style="padding:6px;text-align:left;">Negócio</th>
              <th style="padding:6px;text-align:center;">Atraso</th>
              <th style="padding:6px;text-align:right;">Débito</th>
              <th style="padding:6px;text-align:center;">Status</th>
              <th style="padding:6px;text-align:center;">Ação</th>
            </tr></thead>
            <tbody>
              ${a.map(o=>{const l=j[o.status]||j.vencido,x=[...new Set((o.contratos||[]).map(c=>c.negocio).filter(Boolean))];return`
                  <tr style="border-bottom:1px solid var(--border,#f3f4f6);">
                    <td style="padding:8px 6px;font-weight:600;">${z(o.nome||"—")}</td>
                    <td style="padding:8px 6px;">${x.join(", ")||"—"}</td>
                    <td style="padding:8px 6px;text-align:center;color:#dc2626;font-weight:700;">${o.maxDias}d</td>
                    <td style="padding:8px 6px;text-align:right;font-weight:700;">${$(o.totalDevido)}</td>
                    <td style="padding:8px 6px;text-align:center;">
                      <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:${l.bg};color:${l.cor};">${l.label}</span>
                    </td>
                    <td style="padding:8px 6px;text-align:center;">
                      <button data-cobrar-rel="${o.id}" style="padding:4px 10px;border-radius:6px;border:none;cursor:pointer;background:#dcfce7;color:#065f46;font-size:12px;font-weight:600;">📲 Cobrar</button>
                    </td>
                  </tr>`}).join("")}
            </tbody>
          </table>
        </div>`:'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:16px;">Sem inadimplentes. 🎉</p>'}
    </div>

    <!-- MRR por negócio -->
    <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:14px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">
        MRR por Negócio — Total: ${$(i)}
      </div>
      ${Object.entries(r).sort((o,l)=>l[1]-o[1]).map(([o,l])=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border,#f3f4f6);">
          <span style="font-size:13px;font-weight:600;">${o}</span>
          <span style="font-size:13px;font-weight:700;color:var(--accent,#3FD68E);">${$(l)}</span>
        </div>`).join("")||'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:8px;">Sem contratos ativos.</p>'}
    </div>

    <!-- Aniversariantes do mês -->
    <div style="background:var(--bg-card,#fff);border-radius:12px;padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);">
      <div style="font-size:14px;font-weight:700;color:var(--text-1,#111);margin-bottom:12px;">
        🎂 Aniversariantes do Mês (${f.length})
      </div>
      ${f.length?f.map(o=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border,#f3f4f6);">
              <span style="font-size:13px;font-weight:600;">${z(o.nome||"—")}</span>
              <span style="font-size:13px;color:var(--text-2,#6b7280);">${_(o.dataNascimento)}</span>
            </div>`).join(""):'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:8px;">Nenhum aniversariante este mês.</p>'}
    </div>
  `,(n=t.querySelector("#btn-exp-inad"))==null||n.addEventListener("click",()=>K(a,"inadimplentes")),(s=t.querySelector("#btn-exp-cli"))==null||s.addEventListener("click",()=>K(v.get("clientes")??[],"clientes")),t.querySelectorAll("[data-cobrar-rel]").forEach(o=>o.addEventListener("click",()=>H(o.dataset.cobrarRel)))}function K(t,d){const e="Nome,CPF/CNPJ,WhatsApp,E-mail,Negócios,MRR,Status",a=v.get("faturas_abertas_map")||new Map,r=t.map(f=>{var o;const n=[...new Set((f.contratos||[]).map(l=>l.negocio).filter(Boolean))].join(";"),s=(f.contratos||[]).filter(l=>l.statusContrato==="Ativo").reduce((l,x)=>l+(Number(x.valor)||0),0);return[`"${(f.nome||"").replace(/"/g,"'")}"`,`"${f.cpfCnpj||f.cpf||""}"`,`"${f.whatsapp||f.celular||""}"`,`"${f.email||""}"`,`"${n}"`,s.toFixed(2),((o=j[k(f,a)])==null?void 0:o.label)||""].join(",")}),i=[e,...r].join(`
`),p=document.createElement("a");p.href="data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(i),p.download=`${d}-${new Date().toISOString().slice(0,10)}.csv`,p.click(),h.ok(`CSV exportado: ${t.length} linha(s)`)}function rt(t,d){var o,l,x;const e=k(t,d),a=j[e],r=(d==null?void 0:d.get(t.id))||[],i=(t.historicoCobrancas||[]).slice(-20).reverse(),p=(t.contratos||[]).map(c=>`
    <tr>
      <td style="padding:8px 6px;">${c.negocio||"—"}</td>
      <td style="padding:8px 6px;">${c.planoNome||c.plano||"—"}</td>
      <td style="padding:8px 6px;">${$(c.valor||0)}</td>
      <td style="padding:8px 6px;">${c.diaVencimento?`Dia ${c.diaVencimento}`:"—"}</td>
      <td style="padding:8px 6px;">${c.periodicidade||"Mensal"}</td>
      <td style="padding:8px 6px;">
        <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;
          background:${c.statusContrato==="Ativo"?"#d1fae5":c.statusContrato==="Suspenso"?"#fef3c7":"#f3f4f6"};
          color:${c.statusContrato==="Ativo"?"#065f46":c.statusContrato==="Suspenso"?"#92400e":"#6b7280"};">
          ${c.statusContrato||"Ativo"}
        </span>
      </td>
    </tr>`).join(""),f=i.map(c=>`
    <tr style="border-bottom:1px solid var(--border,#f3f4f6);">
      <td style="padding:7px 6px;font-size:12px;">${_(c.data)}</td>
      <td style="padding:7px 6px;font-size:12px;">${c.tipo||"WhatsApp"}</td>
      <td style="padding:7px 6px;font-size:12px;">${z(c.responsavel||"Sistema")}</td>
      <td style="padding:7px 6px;">
        <span style="font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;
          background:${c.status==="enviada"?"#d1fae5":c.status==="paga"?"#eff6ff":"#fef3c7"};
          color:${c.status==="enviada"?"#065f46":c.status==="paga"?"#1d4ed8":"#92400e"};">
          ${c.status||"enviada"}
        </span>
      </td>
    </tr>`).join(""),n=`
    <div style="font-family:Inter,sans-serif;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="width:52px;height:52px;border-radius:50%;background:${a.bg};display:flex;align-items:center;justify-content:center;font-size:22px;">👤</div>
        <div>
          <div style="font-size:18px;font-weight:700;">${z(t.nome||"—")}</div>
          <div style="font-size:13px;color:var(--text-2,#6b7280);">${t.cpfCnpj||t.cpf||""}${t.email?` · ${t.email}`:""}</div>
        </div>
        <span style="margin-left:auto;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;background:${a.bg};color:${a.cor};">${a.label}</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;">
        ${I("WhatsApp",t.whatsapp||t.celular||"—")}
        ${I("Telefone",t.telefone||"—")}
        ${I("E-mail",t.email||"—")}
        ${I("Tipo",t.tipoPessoa||"PF")}
        ${I("Endereço",[t.logradouro,t.numero,t.bairro,t.cidade,t.estado].filter(Boolean).join(", ")||"—")}
        ${I("Observ.",t.observacoes||"—")}
      </div>

      <!-- Contratos -->
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <h3 style="font-size:14px;font-weight:700;margin:0;">Contratos</h3>
          <button id="btn-add-ct" style="padding:4px 12px;border-radius:7px;border:none;cursor:pointer;background:var(--accent,#3FD68E);color:#fff;font-size:12px;font-weight:600;">+ Contrato</button>
        </div>
        ${(t.contratos||[]).length?`<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;">
                <th style="padding:6px;text-align:left;">Negócio</th><th style="padding:6px;text-align:left;">Plano</th>
                <th style="padding:6px;text-align:left;">Valor</th><th style="padding:6px;text-align:left;">Vencimento</th>
                <th style="padding:6px;text-align:left;">Periodicidade</th><th style="padding:6px;text-align:left;">Status</th>
              </tr></thead>
              <tbody>${p}</tbody></table></div>`:'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:16px 0;">Nenhum contrato.</p>'}
      </div>

      <!-- Faturas em aberto -->
      ${r.length?`
        <div style="margin-bottom:20px;">
          <h3 style="font-size:14px;font-weight:700;margin:0 0 8px;">Faturas em Aberto (${r.length})</h3>
          <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;">
              <th style="padding:6px;text-align:left;">Negócio</th><th style="padding:6px;text-align:left;">Vencimento</th>
              <th style="padding:6px;text-align:right;">Valor</th><th style="padding:6px;text-align:center;">Situação</th>
            </tr></thead>
            <tbody>
              ${r.map(c=>{const m=O(c.data);return`<tr><td style="padding:8px 6px;">${c.negocio||"—"}</td>
                  <td style="padding:8px 6px;">${c.data?_(c.data):"—"}</td>
                  <td style="padding:8px 6px;text-align:right;font-weight:700;">${$(c.valor||0)}</td>
                  <td style="padding:8px 6px;text-align:center;color:${m>0?"#dc2626":"#059669"};font-weight:700;">
                    ${m>0?`${m}d atraso`:m===0?"Hoje":`em ${Math.abs(m)}d`}</td></tr>`}).join("")}
            </tbody>
          </table></div>
        </div>`:""}

      <!-- Histórico de Cobranças -->
      <div style="margin-bottom:20px;">
        <h3 style="font-size:14px;font-weight:700;margin:0 0 8px;">Histórico de Cobranças</h3>
        ${i.length?`
          <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="color:var(--text-2,#6b7280);font-size:11px;text-transform:uppercase;">
              <th style="padding:6px;text-align:left;">Data</th><th style="padding:6px;text-align:left;">Tipo</th>
              <th style="padding:6px;text-align:left;">Responsável</th><th style="padding:6px;text-align:left;">Status</th>
            </tr></thead>
            <tbody>${f}</tbody>
          </table></div>`:'<p style="font-size:13px;color:#9ca3af;text-align:center;padding:12px 0;">Nenhuma cobrança registrada.</p>'}
      </div>

      <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
        <button id="btn-det-edit" style="${D("#fef9c3","#92400e")};flex:1;padding:10px;border-radius:8px;font-size:13px;">✏️ Editar</button>
        <button id="btn-det-cobrar" style="${D("#dcfce7","#065f46")};flex:1;padding:10px;border-radius:8px;font-size:13px;">📲 Cobrar WhatsApp</button>
      </div>
    </div>
  `,s=W(`Cliente — ${z(t.nome||"")}`,n);(o=s.querySelector("#btn-add-ct"))==null||o.addEventListener("click",()=>{s.remove(),st(t,null)}),(l=s.querySelector("#btn-det-edit"))==null||l.addEventListener("click",()=>{s.remove(),V(t)}),(x=s.querySelector("#btn-det-cobrar"))==null||x.addEventListener("click",()=>{s.remove(),H(t.id)})}function V(t=null){var i,p;const d=!t,e=t||{},a=`
    <form id="form-cli" style="display:flex;flex-direction:column;gap:12px;font-family:Inter,sans-serif;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${u("nome","Nome completo","text",e.nome||"")}
        ${u("cpfCnpj","CPF / CNPJ","text",e.cpfCnpj||e.cpf||"")}
        ${u("email","E-mail","email",e.email||"")}
        ${u("whatsapp","WhatsApp / Celular","tel",e.whatsapp||e.celular||"")}
        ${u("telefone","Telefone fixo","tel",e.telefone||"")}
        <div>
          <label style="${q()}">Tipo de Pessoa</label>
          <select name="tipoPessoa" style="${C()}">
            <option value="PF" ${(e.tipoPessoa||"PF")==="PF"?"selected":""}>Pessoa Física (PF)</option>
            <option value="PJ" ${e.tipoPessoa==="PJ"?"selected":""}>Pessoa Jurídica (PJ)</option>
          </select>
        </div>
        ${u("dataNascimento","Data de nascimento","date",e.dataNascimento||"")}
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;">
        ${u("logradouro","Logradouro","text",e.logradouro||"")}
        ${u("numero","Nº","text",e.numero||"")}
        ${u("bairro","Bairro","text",e.bairro||"")}
      </div>
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;">
        ${u("cidade","Cidade","text",e.cidade||"")}
        ${u("estado","UF","text",e.estado||"")}
        ${u("cep","CEP","text",e.cep||"")}
      </div>
      <div>
        <label style="${q()}">Observações</label>
        <textarea name="observacoes" rows="2" style="${C()}">${e.observacoes||""}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        <button type="button" id="btn-cancel-cli" style="padding:9px 20px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:transparent;color:var(--text-1,#111);">Cancelar</button>
        <button type="submit" style="padding:9px 24px;border-radius:8px;border:none;cursor:pointer;background:var(--accent,#3FD68E);color:#fff;font-weight:600;">Salvar</button>
      </div>
    </form>`,r=W(d?"Novo Cliente":"Editar Cliente",a);(i=r.querySelector("#btn-cancel-cli"))==null||i.addEventListener("click",()=>r.remove()),(p=r.querySelector("#form-cli"))==null||p.addEventListener("submit",async f=>{f.preventDefault();const n=new FormData(f.target),s=Object.fromEntries(n.entries()),o={...e||{},nome:e.nome===s.nome?e.nome:s.nome,...s,contratos:e.contratos||[],historicoCobrancas:e.historicoCobrancas||[],dataCadastro:e.dataCadastro||new Date().toISOString().split("T")[0]};try{await F("cli_clientes",{id:e.id||B(),...o}),h.ok(d?"Cliente criado!":"Cliente atualizado!"),r.remove(),await R()}catch(l){h.err("Erro: "+l.message)}})}function st(t,d=null){var f,n,s;const e=!d,a=d||{},r=(v.get("cli_planos")||[]).filter(o=>!o.status||o.status==="Ativo"),i=`
    <form id="form-ct" style="display:flex;flex-direction:column;gap:12px;font-family:Inter,sans-serif;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="${q()}">Negócio</label>
          <select name="negocio" id="sel-neg-ct" style="${C()}">
            ${X.map(o=>`<option value="${o}"${a.negocio===o?" selected":""}>${o}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="${q()}">Plano</label>
          <select name="planoId" id="sel-plano-ct" style="${C()}">
            <option value="">— Valor manual —</option>
            ${r.map(o=>`<option value="${o.id}" data-valor="${o.valor||0}" data-nome="${z(o.nome)}" ${a.planoId===o.id?"selected":""}>[${o.negocio||"?"}] ${o.nome} — ${$(o.valor||0)}</option>`).join("")}
          </select>
        </div>
        ${u("valor","Valor (R$)","number",a.valor||"")}
        ${u("diaVencimento","Dia de vencimento (1–31)","number",a.diaVencimento||"10")}
        <div>
          <label style="${q()}">Periodicidade</label>
          <select name="periodicidade" style="${C()}">
            ${et.map(o=>`<option value="${o}"${(a.periodicidade||"Mensal")===o?" selected":""}>${o}</option>`).join("")}
          </select>
        </div>
        ${u("dataInicio","Data de início","date",a.dataInicio||new Date().toISOString().split("T")[0])}
        <div>
          <label style="${q()}">Status do Contrato</label>
          <select name="statusContrato" style="${C()}">
            ${["Ativo","Suspenso","Cancelado"].map(o=>`<option value="${o}"${(a.statusContrato||"Ativo")===o?" selected":""}>${o}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
        <button type="button" id="btn-cancel-ct" style="padding:9px 20px;border-radius:8px;border:1px solid var(--border,#e5e7eb);cursor:pointer;background:transparent;color:var(--text-1,#111);">Cancelar</button>
        <button type="submit" style="padding:9px 24px;border-radius:8px;border:none;cursor:pointer;background:var(--accent,#3FD68E);color:#fff;font-weight:600;">Salvar</button>
      </div>
    </form>`,p=W(e?"Novo Contrato":"Editar Contrato",i);(f=p.querySelector("#btn-cancel-ct"))==null||f.addEventListener("click",()=>p.remove()),(n=p.querySelector("#sel-plano-ct"))==null||n.addEventListener("change",o=>{var x;const l=(x=o.target.selectedOptions[0])==null?void 0:x.dataset.valor;l&&(p.querySelector("[name=valor]").value=l)}),(s=p.querySelector("#form-ct"))==null||s.addEventListener("submit",async o=>{o.preventDefault();const l=new FormData(o.target),x=Object.fromEntries(l.entries()),c=p.querySelector(`#sel-plano-ct option[value="${x.planoId}"]`),m={id:a.id||B(),negocio:x.negocio,planoId:x.planoId,planoNome:(c==null?void 0:c.dataset.nome)||x.planoId||"",valor:Number(x.valor)||0,diaVencimento:Number(x.diaVencimento)||10,periodicidade:x.periodicidade,dataInicio:x.dataInicio,statusContrato:x.statusContrato,bloqueado:a.bloqueado||!1,cobrancasEnviadas:a.cobrancasEnviadas||0},b=(t.contratos||[]).filter(g=>g.id!==m.id);b.push(m);try{await F("cli_clientes",{id:t.id,...t,contratos:b}),h.ok("Contrato salvo!"),p.remove(),await R()}catch(g){h.err("Erro: "+g.message)}})}async function H(t,d){var a;if(!t)return;const e=(v.get("clientes")??[]).find(r=>r.id===t);h.ok("Enviando cobrança…");try{const{data:r,error:i}=await Q.functions.invoke("whatsapp-lembretes",{body:{clienteId:t}});if(i||r!=null&&r.error)throw new Error((i==null?void 0:i.message)||(r==null?void 0:r.error));const p=(r==null?void 0:r.enviados)??0;if(h.ok(p>0?`✅ ${p} mensagem(ns) enviada(s)!`:"⚠️ Nenhuma fatura pendente."),e&&p>0){const f={id:B(),data:new Date().toISOString().split("T")[0],tipo:"WhatsApp",status:"enviada",responsavel:((a=window.GT_PERFIL)==null?void 0:a.nome)||"Sistema",enviadas:p},n=[...e.historicoCobrancas||[],f],s=(e.contratos||[]).map(o=>({...o,cobrancasEnviadas:(o.cobrancasEnviadas||0)+1}));await F("cli_clientes",{id:e.id,...e,historicoCobrancas:n,contratos:s}),await R()}}catch(r){h.err("Erro ao cobrar: "+r.message)}}async function Y(t,d,e){const a=(v.get("clientes")??[]).find(i=>i.id===t);if(!a)return;const r=(a.contratos||[]).map(i=>({...i,bloqueado:d,cobrancasEnviadas:d?i.cobrancasEnviadas:0}));try{await F("cli_clientes",{id:a.id,...a,contratos:r}),h.ok(d?"🔒 Bloqueado.":"✅ Reativado."),await R()}catch(i){h.err("Erro: "+i.message)}}function M(t,d,e,a,r=!1){return`<div style="background:${e};border-radius:10px;padding:12px 10px;text-align:center;">
    <div style="font-size:10px;color:${a};font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">${t}</div>
    <div style="font-size:${r?"14px":"22px"};font-weight:700;color:${a};">${d}</div>
  </div>`}function u(t,d,e,a){return`<div><label style="${q()}">${d}</label><input name="${t}" type="${e}" value="${z(a)}" style="${C()}" /></div>`}function I(t,d){return`<div style="background:var(--bg,#f9fafb);border-radius:8px;padding:10px 12px;">
    <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-2,#9ca3af);margin-bottom:2px;">${t}</div>
    <div style="font-size:13px;color:var(--text-1,#111);word-break:break-word;">${d}</div>
  </div>`}function C(){return"width:100%;box-sizing:border-box;padding:8px 10px;border-radius:8px;border:1px solid var(--border,#e5e7eb);font-size:13px;background:var(--bg,#fff);color:var(--text-1,#111);font-family:Inter,sans-serif;"}function q(){return"font-size:12px;font-weight:600;color:var(--text-2,#6b7280);display:block;margin-bottom:4px;"}function D(t,d){return`padding:5px 9px;border-radius:7px;border:none;cursor:pointer;font-size:14px;background:${t};color:${d};`}function z(t){return String(t||"").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function W(t,d){var a;const e=document.createElement("div");return e.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;",e.innerHTML=`
    <div style="background:var(--bg,#fff);border-radius:14px;width:100%;max-width:720px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border,#e5e7eb);position:sticky;top:0;background:var(--bg,#fff);z-index:1;">
        <h2 style="margin:0;font-size:16px;font-weight:700;color:var(--text-1,#111);">${t}</h2>
        <button id="modal-x" style="border:none;background:none;cursor:pointer;font-size:20px;color:var(--text-2,#6b7280);">✕</button>
      </div>
      <div style="padding:20px;">${d}</div>
    </div>`,(a=e.querySelector("#modal-x"))==null||a.addEventListener("click",()=>e.remove()),e.addEventListener("mousedown",r=>{e._md=r.target===e}),e.addEventListener("click",r=>{r.target===e&&e._md&&e.remove()}),document.body.appendChild(e),e}async function ct(t){L=t,N="",S="todos",P="",E="lista",L.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;">Carregando…</div>',await R()}export{ct as initClientes};
