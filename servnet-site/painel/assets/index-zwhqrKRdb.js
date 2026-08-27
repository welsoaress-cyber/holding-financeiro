import{j as m,t as c,f as x}from"./page-dashboard-Dbqm2OjXb.js";import{u as y}from"./page-lancamentos-BfWtlLw7b.js";import"./supabase-DthfXWp1.js";const f=["Provedor","Servidor","Precautec","Outro"],E=["Mensal","Bimestral","Trimestral","Semestral","Anual"],k=["Ativo","Inativo"];let l=null,s=[],u="",v="",b="";async function g(){const{data:t,error:o}=await m.from("cli_planos").select("id, dados, updated_at").order("updated_at",{ascending:!0});return o?(c.err("Erro ao carregar planos: "+o.message),[]):(t||[]).map(a=>({id:a.id,...a.dados}))}async function $(t){const{id:o,...a}=t;if(o&&s.find(r=>r.id===o)){const{error:r}=await m.from("cli_planos").update({dados:a}).eq("id",o);if(r)throw r;return o}else{const r=y(),{error:i}=await m.from("cli_planos").insert({id:r,dados:a});if(i)throw i;return r}}async function S(t){const{data:o}=await m.from("cli_clientes").select("id, dados");if((o||[]).some(i=>{var e;return(((e=i.dados)==null?void 0:e.contratos)||[]).some(n=>n.planoId===t)}))throw new Error("Plano em uso em contratos. Inative-o em vez de excluir.");const{error:r}=await m.from("cli_planos").delete().eq("id",t);if(r)throw r}function z(){return s.filter(t=>{if(u&&t.negocio!==u||v&&t.status!==v)return!1;if(b){const o=b.toLowerCase();if(!(t.nome||"").toLowerCase().includes(o)&&!(t.descricao||"").toLowerCase().includes(o))return!1}return!0})}function d(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function p(){if(!l)return;const t=z(),o=s.filter(e=>e.status==="Ativo").length,a=s.filter(e=>e.status!=="Ativo").length,r=s.filter(e=>e.status==="Ativo").reduce((e,n)=>e+(parseFloat(n.valor)||0),0),i=Object.fromEntries(f.map(e=>[e,s.filter(n=>n.negocio===e&&n.status==="Ativo").length]));l.innerHTML=`
<div class="pln-page">
  <div class="pln-header">
    <div>
      <h2 class="pln-title">📋 Planos</h2>
      <p class="pln-sub">Gerencie os planos de serviço por negócio</p>
    </div>
    <button class="btn-primary" id="btn-novo-plano">+ Novo Plano</button>
  </div>

  <div class="pln-kpis">
    <div class="kpi-card"><span class="kv">${s.length}</span><span class="kl">Total</span></div>
    <div class="kpi-card kpi-green"><span class="kv">${o}</span><span class="kl">Ativos</span></div>
    <div class="kpi-card kpi-gray"><span class="kv">${a}</span><span class="kl">Inativos</span></div>
    <div class="kpi-card kpi-blue"><span class="kv">${x(r)}</span><span class="kl">Receita bruta</span></div>
    ${f.map(e=>`<div class="kpi-card"><span class="kv">${i[e]||0}</span><span class="kl">${e}</span></div>`).join("")}
  </div>

  <div class="pln-filtros">
    <input class="filtro-input" id="pln-busca" type="search" placeholder="🔍 Buscar plano…" value="${d(b)}">
    <select class="filtro-sel" id="pln-neg">
      <option value="">Todos os negócios</option>
      ${f.map(e=>`<option value="${e}"${u===e?" selected":""}>${e}</option>`).join("")}
    </select>
    <select class="filtro-sel" id="pln-status">
      <option value="">Todos os status</option>
      ${k.map(e=>`<option value="${e}"${v===e?" selected":""}>${e}</option>`).join("")}
    </select>
  </div>

  <p class="pln-count">${t.length} plano${t.length!==1?"s":""} encontrado${t.length!==1?"s":""}</p>

  <div class="pln-table-wrap">
    <table class="pln-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Negócio</th>
          <th>Valor</th>
          <th>Periodicidade</th>
          <th>Status</th>
          <th>Descrição</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${t.length===0?'<tr><td colspan="7" class="pln-empty">Nenhum plano encontrado.</td></tr>':t.map(e=>`
        <tr class="pln-row${e.status!=="Ativo"?" row-off":""}">
          <td class="pln-nome">${d(e.nome||"—")}</td>
          <td><span class="badge-neg badge-${(e.negocio||"").toLowerCase()}">${d(e.negocio||"—")}</span></td>
          <td class="pln-val">${x(e.valor)}</td>
          <td>${d(e.periodicidade||"—")}</td>
          <td><span class="badge-st ${e.status==="Ativo"?"st-ativo":"st-inativo"}">${d(e.status||"—")}</span></td>
          <td class="pln-desc" title="${d(e.descricao||"")}">${d(e.descricao||"—")}</td>
          <td class="pln-acoes">
            <button class="btn-ac btn-ed" data-id="${e.id}" title="Editar">✏️</button>
            <button class="btn-ac btn-tg" data-id="${e.id}" data-st="${e.status}" title="${e.status==="Ativo"?"Inativar":"Ativar"}">${e.status==="Ativo"?"🔴":"🟢"}</button>
            <button class="btn-ac btn-ex" data-id="${e.id}" title="Excluir">🗑️</button>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>
</div>
<style>
.pln-page{padding:1.25rem;max-width:1200px;margin:0 auto}
.pln-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.25rem;flex-wrap:wrap}
.pln-title{font-size:1.5rem;font-weight:700;margin:0;color:var(--text)}
.pln-sub{margin:.25rem 0 0;color:var(--text-muted);font-size:.875rem}
.pln-kpis{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:1.25rem}
.kpi-card{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:.75rem 1rem;display:flex;flex-direction:column;align-items:center;min-width:90px}
.kv{font-size:1.35rem;font-weight:700;color:var(--text)}
.kl{font-size:.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-top:.125rem}
.kpi-green{border-color:#22c55e40}.kpi-green .kv{color:#22c55e}
.kpi-gray{border-color:#64748b40}.kpi-gray .kv{color:#94a3b8}
.kpi-blue{border-color:#3b82f640}.kpi-blue .kv{color:#3b82f6}
.pln-filtros{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem}
.filtro-input{flex:1;min-width:200px;padding:.5rem .75rem;border:1px solid var(--border);border-radius:.5rem;background:var(--surface);color:var(--text);font-size:.875rem}
.filtro-sel{padding:.5rem .75rem;border:1px solid var(--border);border-radius:.5rem;background:var(--surface);color:var(--text);font-size:.875rem}
.pln-count{font-size:.8rem;color:var(--text-muted);margin:.25rem 0 .75rem}
.pln-table-wrap{overflow-x:auto;border-radius:.75rem;border:1px solid var(--border)}
.pln-table{width:100%;border-collapse:collapse;font-size:.875rem}
.pln-table th{background:var(--surface);color:var(--text-muted);font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding:.625rem 1rem;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap}
.pln-table td{padding:.625rem 1rem;border-bottom:1px solid var(--border);color:var(--text);vertical-align:middle}
.pln-row:last-child td{border-bottom:none}
.pln-row:hover td{background:var(--surface)}
.row-off td{opacity:.55}
.pln-empty{text-align:center;color:var(--text-muted);padding:2rem}
.pln-nome{font-weight:600}
.pln-val{font-variant-numeric:tabular-nums;white-space:nowrap}
.pln-desc{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:.8rem;color:var(--text-muted)}
.badge-neg{display:inline-block;padding:.2rem .55rem;border-radius:999px;font-size:.7rem;font-weight:600}
.badge-provedor{background:#3b82f620;color:#3b82f6}
.badge-servidor{background:#8b5cf620;color:#8b5cf6}
.badge-precautec{background:#f59e0b20;color:#f59e0b}
.badge-outro{background:#64748b20;color:#64748b}
.badge-st{display:inline-block;padding:.2rem .55rem;border-radius:999px;font-size:.7rem;font-weight:600}
.st-ativo{background:#22c55e20;color:#22c55e}
.st-inativo{background:#64748b20;color:#94a3b8}
.pln-acoes{white-space:nowrap;display:flex;gap:.25rem}
.btn-ac{background:none;border:none;cursor:pointer;font-size:1rem;padding:.25rem;border-radius:.375rem;transition:background .15s}
.btn-ac:hover{background:var(--border)}
.btn-primary{background:var(--accent,#6366f1);color:#fff;border:none;border-radius:.5rem;padding:.5rem 1rem;font-size:.875rem;font-weight:600;cursor:pointer;white-space:nowrap}
.btn-primary:hover{filter:brightness(1.1)}
.btn-sec{background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:.5rem;padding:.5rem 1rem;font-size:.875rem;cursor:pointer}
/* modal */
.modal-bd{position:fixed;inset:0;background:#00000066;z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-bx{background:var(--bg,#fff);border-radius:1rem;padding:1.5rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px #0003}
.modal-t{font-size:1.1rem;font-weight:700;margin:0 0 1.25rem;color:var(--text)}
.fg{margin-bottom:1rem}
.fg label{display:block;font-size:.8rem;font-weight:600;color:var(--text-muted);margin-bottom:.375rem}
.fg input,.fg select,.fg textarea{width:100%;padding:.5rem .75rem;border:1px solid var(--border);border-radius:.5rem;background:var(--surface);color:var(--text);font-size:.875rem;box-sizing:border-box}
.fg textarea{min-height:80px;resize:vertical;font-family:inherit}
.modal-ft{display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.25rem}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
</style>`,l.querySelector("#btn-novo-plano").addEventListener("click",()=>w(null)),l.querySelector("#pln-busca").addEventListener("input",e=>{b=e.target.value;const _gid=e.target.id;clearTimeout(window._gtBT);window._gtBT=setTimeout(()=>{p();const _b=_gid&&document.getElementById(_gid);if(_b){_b.focus();_b.setSelectionRange(_b.value.length,_b.value.length)}},350)}),l.querySelector("#pln-neg").addEventListener("change",e=>{u=e.target.value,p()}),l.querySelector("#pln-status").addEventListener("change",e=>{v=e.target.value,p()}),l.querySelectorAll(".btn-ed").forEach(e=>e.addEventListener("click",()=>{const n=s.find(h=>h.id===e.dataset.id);n&&w(n)})),l.querySelectorAll(".btn-tg").forEach(e=>e.addEventListener("click",()=>A(e.dataset.id,e.dataset.st))),l.querySelectorAll(".btn-ex").forEach(e=>e.addEventListener("click",()=>P(e.dataset.id)))}function w(t){const o=!!t,a=document.createElement("div");a.className="modal-bd",a.innerHTML=`
<div class="modal-bx">
  <h3 class="modal-t">${o?"✏️ Editar Plano":"➕ Novo Plano"}</h3>
  <form id="form-plano">
    <div class="fg"><label>Nome *</label>
      <input name="nome" required maxlength="100" value="${d((t==null?void 0:t.nome)||"")}" placeholder="Ex: Plano Básico 10MB"></div>
    <div class="row2">
      <div class="fg"><label>Negócio *</label>
        <select name="negocio" required>
          <option value="">Selecione…</option>
          ${f.map(r=>`<option value="${r}"${(t==null?void 0:t.negocio)===r?" selected":""}>${r}</option>`).join("")}
        </select></div>
      <div class="fg"><label>Status</label>
        <select name="status">
          ${k.map(r=>`<option value="${r}"${((t==null?void 0:t.status)||"Ativo")===r?" selected":""}>${r}</option>`).join("")}
        </select></div>
    </div>
    <div class="row2">
      <div class="fg"><label>Valor (R$) *</label>
        <input name="valor" type="number" min="0" step="0.01" required value="${(t==null?void 0:t.valor)||""}" placeholder="0,00"></div>
    </div>
    <div class="fg"><label>Descrição</label>
      <textarea name="descricao" placeholder="Detalhes, velocidade, limites…">${d((t==null?void 0:t.descricao)||"")}</textarea></div>
    <div class="modal-ft">
      <button type="button" class="btn-sec" id="btn-cancel">Cancelar</button>
      <button type="submit" class="btn-primary">${o?"Salvar":"Criar plano"}</button>
    </div>
  </form>
</div>`,document.body.appendChild(a),a.querySelector("#btn-cancel").addEventListener("click",()=>a.remove()),a.addEventListener("mousedown",r=>{a._df=r.target===a}),a.addEventListener("click",r=>{r.target===a&&a._df&&a.remove()}),a.querySelector("#form-plano").addEventListener("submit",async r=>{r.preventDefault();const i=new FormData(r.target),e={nome:i.get("nome").trim(),negocio:i.get("negocio"),valor:parseFloat(i.get("valor"))||0,periodicidade:i.get("periodicidade")||"Mensal",status:i.get("status")||"Ativo",descricao:i.get("descricao").trim()};if(!e.negocio){c.warn("Preencha todos os campos obrigatórios.");return}const n=r.target.querySelector("[type=submit]");n.disabled=!0,n.textContent="Salvando…";try{await $({...t||{},...e}),c.ok(o?"Plano atualizado!":"Plano criado!"),a.remove(),s=await g(),p()}catch(h){c.err("Erro: "+h.message),n.disabled=!1,n.textContent=o?"Salvar":"Criar plano"}})}async function A(t,o){const a=s.find(i=>i.id===t);if(!a)return;const r=o==="Ativo"?"Inativo":"Ativo";if(confirm(`Deseja ${r==="Inativo"?"inativar":"ativar"} o plano "${a.nome}"?`))try{await $({...a,status:r}),c.ok(`Plano ${r==="Ativo"?"ativado":"inativado"}!`),s=await g(),p()}catch(i){c.err("Erro: "+i.message)}}async function P(t){const o=s.find(a=>a.id===t);if(o&&confirm(`Excluir permanentemente o plano "${o.nome}"?

Esta ação não pode ser desfeita.`))try{await S(t),c.ok("Plano excluído!"),s=await g(),p()}catch(a){c.err("Erro: "+a.message)}}async function C(t){l=t,b="",u="",v="",t.innerHTML='<div style="padding:2rem;text-align:center;color:var(--text-muted)">Carregando planos…</div>',s=await g(),p()}export{C as initPlanos};
