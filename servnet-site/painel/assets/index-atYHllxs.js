import{j as v,t as b}from"./page-dashboard-Dbqm2OjX.js";import{P as k}from"./app-CkIaDDom.js";import"./supabase-DthfXWp1.js";import"./modulepreload-polyfill-B5Qt9EMX.js";import"./auth-8dcbKywj.js";let x=null;const L=[{key:"lancamentos",label:"Financeiro / Lançamentos",acoes:["ver","criar","editar","excluir"]},{key:"contas",label:"Contas Bancárias",acoes:["ver","criar","editar","excluir"]},{key:"cartoes",label:"Cartões de Crédito",acoes:["ver","criar","editar","excluir"]},{key:"clientes",label:"Clientes",acoes:["ver","criar","editar","excluir"]},{key:"cobrancas",label:"Cobranças",acoes:["ver","criar","editar","excluir"]},{key:"relatorios",label:"Relatórios",acoes:["ver"]},{key:"negocios",label:"Negócios",acoes:["ver","criar","editar","excluir"]},{key:"config",label:"Configurações",acoes:["ver"]}],y={master:{label:"Master",cor:"#6366f1"},admin:{label:"Administrador",cor:"#3b82f6"},gerente:{label:"Gerente",cor:"#10b981"},operador:{label:"Operador",cor:"#f59e0b"},visualizador:{label:"Visualizador",cor:"#94a3b8"}};function q(e){return e?new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}):"—"}function C(e){const t=y[e]??{label:e,cor:"#94a3b8"};return`<span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;
    background:${t.cor}22;color:${t.cor};border:1px solid ${t.cor}44;">${t.label}</span>`}const E=`
  .usr-wrap { padding:20px; font-family:Inter,sans-serif; color:#0f172a; min-height:100%; }
  .usr-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .usr-header h1 { font-size:20px; font-weight:700; margin:0; }
  .usr-btn-new {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; background:#2563eb; color:#fff; border:none;
    border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;
    transition:background .15s;
  }
  .usr-btn-new:hover { background:#1d4ed8; }

  /* Tabela */
  .usr-table-wrap { overflow-x:auto; border-radius:12px; border:1px solid #e2e8f0; }
  .usr-table { width:100%; border-collapse:collapse; font-size:13px; }
  .usr-table th {
    background:#f8fafc; padding:11px 14px; text-align:left;
    font-weight:600; color:#64748b; font-size:11px; text-transform:uppercase;
    letter-spacing:.04em; border-bottom:1px solid #e2e8f0; white-space:nowrap;
  }
  .usr-table td {
    padding:12px 14px; border-bottom:1px solid #f1f5f9;
    color:#1e293b; vertical-align:middle;
  }
  .usr-table tr:last-child td { border-bottom:none; }
  .usr-table tr:hover td { background:#f8fafc; }

  .usr-status-on  { color:#10b981; font-weight:600; font-size:12px; }
  .usr-status-off { color:#ef4444; font-weight:600; font-size:12px; }

  /* Botões de ação na tabela */
  .usr-actions { display:flex; gap:6px; }
  .usr-act-btn {
    padding:5px 10px; border-radius:6px; border:1px solid; font-size:12px;
    font-weight:500; cursor:pointer; transition:all .15s; background:transparent;
  }
  .usr-act-btn.edit   { border-color:#3b82f6; color:#3b82f6; }
  .usr-act-btn.edit:hover  { background:#3b82f6; color:#fff; }
  .usr-act-btn.toggle { border-color:#f59e0b; color:#f59e0b; }
  .usr-act-btn.toggle:hover { background:#f59e0b; color:#fff; }
  .usr-act-btn.del    { border-color:#ef4444; color:#ef4444; }
  .usr-act-btn.del:hover   { background:#ef4444; color:#fff; }

  /* Modal */
  .usr-modal-overlay {
    position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.55); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:20px;
  }
  .usr-modal {
    background:#fff; border-radius:16px;
    width:100%; max-width:600px; max-height:90vh;
    display:flex; flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,0.2);
    overflow:hidden;
  }
  .usr-modal-head {
    padding:20px 24px 16px; border-bottom:1px solid #e2e8f0;
    display:flex; align-items:center; justify-content:space-between;
  }
  .usr-modal-head h2 { font-size:18px; font-weight:700; margin:0; }
  .usr-modal-close {
    background:none; border:none; font-size:20px; cursor:pointer;
    color:#64748b; padding:4px; line-height:1;
  }
  .usr-modal-body { padding:20px 24px; overflow-y:auto; flex:1; }
  .usr-modal-foot { padding:16px 24px; border-top:1px solid #e2e8f0; display:flex; gap:10px; justify-content:flex-end; }

  /* Form */
  .usr-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
  .usr-form-row.full { grid-template-columns:1fr; }
  @media(max-width:500px) { .usr-form-row { grid-template-columns:1fr; } }
  .usr-field label {
    display:block; font-size:12px; font-weight:600; color:#475569;
    margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em;
  }
  .usr-field input, .usr-field select {
    width:100%; padding:9px 12px; border:1px solid #e2e8f0; border-radius:8px;
    font-size:14px; color:#1e293b; background:#f8fafc;
    transition:border-color .15s, box-shadow .15s; outline:none;
  }
  .usr-field input:focus, .usr-field select:focus {
    border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.12);
    background:#fff;
  }

  /* Tabela de permissões */
  .perm-section { margin-top:18px; }
  .perm-section h3 {
    font-size:12px; font-weight:700; color:#64748b;
    text-transform:uppercase; letter-spacing:.06em; margin:0 0 12px;
  }
  .perm-table { width:100%; border-collapse:collapse; font-size:13px; }
  .perm-table th {
    padding:7px 10px; text-align:center; font-weight:600; font-size:11px;
    color:#64748b; background:#f8fafc; border:1px solid #e2e8f0;
  }
  .perm-table th:first-child { text-align:left; }
  .perm-table td {
    padding:7px 10px; border:1px solid #e2e8f0; text-align:center;
    color:#1e293b;
  }
  .perm-table td:first-child { text-align:left; font-weight:500; }
  .perm-table tr:hover td { background:#f8fafc; }
  .perm-check { width:16px; height:16px; cursor:pointer; accent-color:#2563eb; }

  /* Botões do footer do modal */
  .usr-btn-save {
    padding:10px 22px; background:#2563eb; color:#fff; border:none;
    border-radius:8px; font-size:14px; font-weight:600; cursor:pointer;
    transition:background .15s;
  }
  .usr-btn-save:hover { background:#1d4ed8; }
  .usr-btn-save:disabled { opacity:.65; cursor:not-allowed; }
  .usr-btn-cancel {
    padding:10px 18px; background:transparent; color:#64748b;
    border:1px solid #e2e8f0; border-radius:8px; font-size:14px;
    cursor:pointer; transition:background .15s;
  }
  .usr-btn-cancel:hover { background:#f8fafc; }

  /* Empty state */
  .usr-empty { text-align:center; padding:48px 24px; color:#94a3b8; font-size:14px; }
`;async function $(e){const{data:t,error:n}=await v.functions.invoke("admin-usuarios",{body:e});if(n)throw new Error(n.message??"Erro na operação");if(t!=null&&t.error)throw new Error(t.error);return t}async function M(){const{data:e,error:t}=await v.from("user_profiles").select("*").order("criado_em",{ascending:!1});if(t)throw t;return e??[]}async function h(){var t,n;if(!x)return;const e=(t=window.GT_PERFIL)==null?void 0:t.isMaster;x.innerHTML=`<style>${E}</style>
    <div class="usr-wrap">
      <div class="usr-header">
        <h1>👤 Usuários</h1>
        ${e?'<button class="usr-btn-new" id="btn-novo-usr">+ Novo usuário</button>':""}
      </div>
      <div class="usr-table-wrap">
        <div style="padding:32px;text-align:center;color:#94a3b8;">Carregando…</div>
      </div>
    </div>`,(n=x.querySelector("#btn-novo-usr"))==null||n.addEventListener("click",()=>S());try{const l=await M(),r=x.querySelector(".usr-table-wrap");if(!l.length){r.innerHTML='<div class="usr-empty">Nenhum usuário cadastrado ainda.</div>';return}const i=l.map(o=>{var u;const a=y[o.perfil]??{label:o.perfil,cor:"#94a3b8"},c=o.status?'<span class="usr-status-on">● Ativo</span>':'<span class="usr-status-off">● Inativo</span>',s=o.perfil==="master"&&o.id===((u=window.GT_PERFIL)==null?void 0:u.id),m=e&&!s?`
        <div class="usr-actions">
          <button class="usr-act-btn edit"   data-action="edit"   data-id="${o.id}">Editar</button>
          <button class="usr-act-btn toggle" data-action="toggle" data-id="${o.id}" data-status="${o.status}">
            ${o.status?"Inativar":"Ativar"}
          </button>
          <button class="usr-act-btn del"   data-action="del"    data-id="${o.id}">Excluir</button>
        </div>`:'<span style="color:#cbd5e1;font-size:12px;">—</span>';return`
        <tr>
          <td><strong>${o.nome}</strong></td>
          <td style="color:#64748b;">${o.id}</td>
          <td>${C(o.perfil)}</td>
          <td>${c}</td>
          <td style="color:#64748b;font-size:12px;">${q(o.ultimo_acesso)}</td>
          <td>${m}</td>
        </tr>`}).join("");r.innerHTML=`
      <table class="usr-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>ID / E-mail</th>
            <th>Perfil</th>
            <th>Status</th>
            <th>Último acesso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>${i}</tbody>
      </table>`,r.querySelectorAll("[data-action]").forEach(o=>{o.addEventListener("click",()=>P(o.dataset.action,o.dataset.id,o.dataset.status,l))})}catch(l){x.querySelector(".usr-table-wrap").innerHTML=`<div class="usr-empty" style="color:#ef4444;">Erro: ${l.message}</div>`}}async function P(e,t,n,l){if(e==="edit"){const r=l.find(i=>i.id===t);r&&S(r);return}if(e==="toggle"){const r=n!=="true",{error:i}=await v.from("user_profiles").update({status:r}).eq("id",t);if(i){b.err(i.message);return}b.ok(r?"Usuário ativado":"Usuário inativado"),h();return}if(e==="del"){if(!confirm("Confirma a exclusão? Esta ação remove o acesso permanentemente."))return;try{await $({action:"deletar",user_id:t}),b.ok("Usuário removido"),h()}catch(r){b.err(r.message)}}}function S(e=null){var o;const t=!!e,n=(e==null?void 0:e.perfil)??"operador",l=(e==null?void 0:e.permissoes)??k[n]??{},r=document.createElement("div");r.className="usr-modal-overlay",r.innerHTML=`<style>${E}</style>
    <div class="usr-modal">
      <div class="usr-modal-head">
        <h2>${t?"Editar usuário":"Novo usuário"}</h2>
        <button class="usr-modal-close" id="modal-close">×</button>
      </div>
      <div class="usr-modal-body">
        <div class="usr-form-row">
          <div class="usr-field">
            <label>Nome completo *</label>
            <input id="u-nome" type="text" value="${(e==null?void 0:e.nome)??""}" placeholder="João Silva" />
          </div>
          <div class="usr-field">
            <label>Perfil *</label>
            <select id="u-perfil">
              ${["admin","gerente","operador","visualizador"].map(a=>`<option value="${a}" ${a===n?"selected":""}>${y[a].label}</option>`).join("")}
            </select>
          </div>
        </div>

        ${t?"":`
        <div class="usr-form-row">
          <div class="usr-field">
            <label>E-mail *</label>
            <input id="u-email" type="email" placeholder="joao@email.com" />
          </div>
          <div class="usr-field">
            <label>Senha * (mín. 6 caracteres)</label>
            <input id="u-senha" type="password" placeholder="••••••••" />
          </div>
        </div>`}

        <!-- Permissões personalizadas -->
        <div class="perm-section">
          <h3>Permissões por tela</h3>
          <table class="perm-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Ver</th>
                <th>Criar</th>
                <th>Editar</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              ${L.map(a=>{const c=l[a.key]??{};return`<tr data-mod="${a.key}">
                  <td>${a.label}</td>
                  ${["ver","criar","editar","excluir"].map(s=>a.acoes.includes(s)?`<td><input type="checkbox" class="perm-check" data-mod="${a.key}" data-acao="${s}" ${c[s]?"checked":""}></td>`:'<td style="color:#cbd5e1;">—</td>').join("")}
                </tr>`}).join("")}
            </tbody>
          </table>
          <p style="font-size:11px;color:#94a3b8;margin-top:8px;">
            💡 Ao trocar o perfil acima, as permissões são preenchidas automaticamente. Você pode ajustar individualmente depois.
          </p>
        </div>
      </div>
      <div class="usr-modal-foot">
        <button class="usr-btn-cancel" id="modal-cancel">Cancelar</button>
        <button class="usr-btn-save"   id="modal-save">${t?"Salvar alterações":"Criar usuário"}</button>
      </div>
    </div>`,document.body.appendChild(r);const i=()=>r.remove();r.querySelector("#modal-close").addEventListener("click",i),r.querySelector("#modal-cancel").addEventListener("click",i),r.addEventListener("click",a=>{a.target===r&&i()}),(o=r.querySelector("#u-perfil"))==null||o.addEventListener("change",a=>{const c=k[a.target.value]??{};r.querySelectorAll(".perm-check").forEach(s=>{var p;const m=s.dataset.mod,u=s.dataset.acao;s.checked=!!((p=c[m])!=null&&p[u])})}),r.querySelector("#modal-save").addEventListener("click",async()=>{var c,s,m,u;const a=r.querySelector("#modal-save");a.disabled=!0,a.textContent="Salvando…";try{const p=(c=r.querySelector("#u-nome"))==null?void 0:c.value.trim(),w=(s=r.querySelector("#u-perfil"))==null?void 0:s.value;if(!p)throw new Error("Nome é obrigatório");const g={};if(r.querySelectorAll(".perm-check").forEach(d=>{const f=d.dataset.mod,z=d.dataset.acao;g[f]||(g[f]={}),g[f][z]=d.checked}),t){const{error:d}=await v.from("user_profiles").update({nome:p,perfil:w,permissoes:g}).eq("id",e.id);if(d)throw d;b.ok("Usuário atualizado ✓")}else{const d=(m=r.querySelector("#u-email"))==null?void 0:m.value.trim(),f=(u=r.querySelector("#u-senha"))==null?void 0:u.value;if(!d)throw new Error("E-mail é obrigatório");if(!f||f.length<6)throw new Error("Senha deve ter pelo menos 6 caracteres");await $({action:"criar",email:d,senha:f,nome:p,perfil:w,permissoes:g}),b.ok("Usuário criado com sucesso ✓")}i(),h()}catch(p){b.err(p.message),a.disabled=!1,a.textContent=t?"Salvar alterações":"Criar usuário"}})}async function N(e){x=e,await h()}export{N as initUsuarios};
