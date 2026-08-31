const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/page-dashboard-Dbqm2OjXb.js","assets/supabase-DthfXWp1.js","assets/page-lancamentos-v290.js","assets/index-DIt_wP4b.js","assets/index-DCzEq81c.js","assets/index-DkL-DLyr.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/auth-8dcbKywj.js","assets/page-contas-ChlK-aHV.js","assets/index-BuPQoQwO.js","assets/index-UWbb780S.js","assets/page-cartoes-DpTQTZlc.js","assets/index-B4kTMWCq.js","assets/index-Bl4esJceb.js","assets/index-zwhqrKRdb.js","assets/index-vE4zJAUl.js","assets/index-efD4zShm.js","assets/index-atYHllxsb.js","assets/page-contratos-DsRvToNz.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{initAuth as h}from"./auth-8dcbKywj.js";import{j as f}from"./page-dashboard-Dbqm2OjXb.js";import"./supabase-DthfXWp1.js";const w="modulepreload",x=function(e){return"/painel/"+e},m={},a=function(r,t,o){let c=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),n=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));c=Promise.allSettled(t.map(s=>{if(s=x(s),s in m)return;m[s]=!0;const d=s.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${p}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":w,d||(u.as="script"),u.crossOrigin="",u.href=s,n&&u.setAttribute("nonce",n),document.head.appendChild(u),d)return new Promise((g,E)=>{u.addEventListener("load",g),u.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${s}`)))})}))}function l(i){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=i,window.dispatchEvent(n),!n.defaultPrevented)throw i}return c.then(i=>{for(const n of i||[])n.status==="rejected"&&l(n.reason);return r().catch(l)})},y="welsoaress@gmail.com",I={master:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!0},config:{ver:!0},usuarios:{ver:!0,criar:!0,editar:!0,excluir:!0}},admin:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!0},config:{ver:!0},usuarios:{ver:!1}},gerente:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!1},config:{ver:!1},usuarios:{ver:!1}},operador:{lancamentos:{ver:!0,criar:!0,editar:!1,excluir:!1},config:{ver:!1},usuarios:{ver:!1}},visualizador:{lancamentos:{ver:!0,criar:!1,editar:!1,excluir:!1},config:{ver:!1},usuarios:{ver:!1}}};async function L(e){const r=e.email===y;let{data:t}=await f.from("user_profiles").select("*").eq("id",e.id).single();if(r&&!t){const{data:c}=await f.from("user_profiles").insert({id:e.id,nome:"Administrador",perfil:"master",permissoes:I.master,status:!0}).select().single();t=c}if(!t){if(r){t={id:e.id,nome:"Administrador",perfil:"master",permissoes:I.master,status:!0}}else return console.warn("[rbac] Perfil não encontrado para",e.email),null}if(!r&&!t.status)return await f.auth.signOut(),window.location.href="/painel/?erro=conta-inativa",null;f.from("user_profiles").update({ultimo_acesso:new Date().toISOString()}).eq("id",e.id).then(()=>{});const o={...t,email:e.email,isMaster:r||t.perfil==="master"};return window.GT_PERFIL=o,o}function P(e){const r=window.GT_PERFIL;return r?r.isMaster?e:e.filter(t=>{var o,c,l,i;return t.view==="config"?!!((c=(o=r.permissoes)==null?void 0:o.config)!=null&&c.ver):!!((i=(l=r.permissoes)==null?void 0:l[t.view])!=null&&i.ver)}):e.filter(t=>t.view!=="usuarios")}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(e=>{console.warn("[SW] Falha no registro:",e)})});const _={dashboard:e=>a(()=>import("./page-dashboard-Dbqm2OjXb.js").then(r=>r.n),__vite__mapDeps([0,1])).then(r=>r.initDashboard(e)),lancamentos:e=>a(()=>import("./page-lancamentos-v290.js"),__vite__mapDeps([2,0,1])).then(r=>r.initLancamentos(e)),receitas:e=>a(()=>import("./index-DIt_wP4b.js"),__vite__mapDeps([3,0,1,2])).then(r=>r.initReceitas(e)),despesas:e=>a(()=>import("./index-DCzEq81c.js"),__vite__mapDeps([4,0,1,2])).then(r=>r.initDespesas(e)),transferencias:e=>a(()=>import("./index-DkL-DLyr.js"),__vite__mapDeps([5,0,1,2,6,7])).then(r=>r.initTransferencias(e)),ajustes:e=>a(()=>import("./index-BuPQoQwO.js"),__vite__mapDeps([9,0,1,2,6,7])).then(r=>r.initAjustes(e)),categorias:e=>a(()=>import("./index-UWbb780S.js"),__vite__mapDeps([10,0,1,2])).then(r=>r.initCategorias(e)),planos:e=>a(()=>import("./index-zwhqrKRdb.js"),__vite__mapDeps([15,0,1,2])).then(r=>r.initPlanos(e)),config:e=>a(()=>import("./index-efD4zShm.js"),__vite__mapDeps([17,0,1])).then(r=>r.initConfig(e)),usuarios:e=>a(()=>import("./index-atYHllxsb.js"),__vite__mapDeps([18,0,1,6,7])).then(r=>r.initUsuarios(e))}
/* ── Contas module inline ── */
_['contas']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const {i:j,u:T,f:w,h:ht,k:h,t:X}=mod;
  const hoje=ht();
  let mesNav={...h.mesNav};
  let _contaFoco=null;
  const W2=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  function mesLabel(){return W2[mesNav.mes]+' '+mesNav.ano;}
  function mesKey(){return mesNav.ano+'-'+String(mesNav.mes+1).padStart(2,'0');}

  // Fecha qualquer popup aberto
  function closePopups(){el.querySelectorAll('.ct-popup').forEach(p=>p.remove());}

  // ── Renderiza lista de contas ──
  async function showList(){
    closePopups();
    el.innerHTML='<div style="padding:20px;text-align:center;color:var(--text-muted,#6b7280);font-size:13px">Carregando...</div>';
    let raw=[];
    try{raw=await j('contas');}catch(e){}
    const contas=T('contas',raw).filter(c=>c.ativa!==false&&!c.parentId);
    const totalSaldo=contas.reduce((a,c)=>a+(Number(c.saldo??c.saldoInicial??0)),0);

    const TIPO_ICO={corrente:'🏦','conta corrente':'🏦',poupanca:'🏦',poupança:'🏦',carteira:'👛',cartao:'🪪',cartão:'🪪',investimento:'📈',outros:'📦'};
    const TIPO_COR={corrente:'#3b82f6','conta corrente':'#3b82f6',poupanca:'#059669',poupança:'#059669',carteira:'#8b5cf6',cartao:'#6366f1',cartão:'#6366f1',investimento:'#0284c7',outros:'#6b7280'};
    const tipoIco=(c)=>TIPO_ICO[(c.tipo||'').toLowerCase()]||'🏦';
    const tipoCor=(c)=>c.cor||TIPO_COR[(c.tipo||'').toLowerCase()]||'#6b7280';
    const tipoLabel=(c)=>{const t=c.tipo||'outros';return t.charAt(0).toUpperCase()+t.slice(1);};

    const rows=contas.map(c=>{
      const saldo=Number(c.saldo??c.saldoInicial??0);
      const previsto=Number(c.saldoPrevisto??saldo??0);
      const cor=tipoCor(c);
      const statusDot=saldo<0?'#ef4444':saldo===0?'#6b7280':null;
      return `<div class="ct-row" data-id="${c.id}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border,#e5e7eb);cursor:pointer">
        <div style="width:40px;height:40px;border-radius:50%;background:${cor}22;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:2px solid ${cor}44">${tipoIco(c)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:1px">${tipoLabel(c)}</div>
          <div style="font-size:14px;font-weight:600;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.nome||'Conta'}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:1px">Saldo previsto</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          ${statusDot?`<div style="width:10px;height:10px;border-radius:50%;background:${statusDot};margin-left:auto;margin-bottom:4px"></div>`:'<div style="height:14px"></div>'}
          <div style="font-size:15px;font-weight:700;color:${saldo<0?'#ef4444':'var(--text,#111)'};">${w(saldo)}</div>
          <div style="font-size:12px;color:${previsto<0?'#ef4444':'var(--text-muted,#9ca3af)'};">${previsto<0?'-':'+'}${w(Math.abs(previsto))}</div>
        </div>
        <button class="ct-more" data-id="${c.id}" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted,#9ca3af);padding:4px 2px;flex-shrink:0;line-height:1">⋮</button>
      </div>`;
    }).join('');

    el.innerHTML=`
      <style>
        .ct-row:hover{background:var(--surface,#f9fafb)}
        .ct-popup{position:absolute;right:12px;background:var(--bg-card,#fff);border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,.18);z-index:999;overflow:hidden;min-width:220px;border:1px solid var(--border,#e5e7eb)}
        .ct-popup-item{display:flex;align-items:center;gap:10px;padding:13px 18px;font-size:14px;color:var(--text,#111);cursor:pointer;border-bottom:1px solid var(--border,#f3f4f6)}
        .ct-popup-item:last-child{border-bottom:none}
        .ct-popup-item:hover{background:var(--surface,#f9fafb)}
        .ct-popup-item.danger{color:#ef4444}
        .ct-fab{position:sticky;bottom:16px;right:16px;float:right;width:52px;height:52px;border-radius:50%;background:var(--accent,#6366f1);color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;margin-right:16px}
        .ct-fab:hover{transform:scale(1.06)}
      </style>
      <div style="position:relative">
        <!-- Topbar -->
        <div style="display:flex;align-items:center;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb);gap:8px">
          <div style="flex:1">
            <div style="font-size:18px;font-weight:700;color:var(--text,#111)">Contas</div>
            <div style="font-size:13px;color:var(--text-muted,#6b7280)">Total: ${w(totalSaldo)}</div>
          </div>
          <button title="Buscar" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px">🔍</button>
          <button title="Extrato geral" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px">📋</button>
          <button id="ct-menu-geral" title="Menu" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px">⋮</button>
        </div>
        <!-- Popup menu geral -->
        <div id="ct-popup-geral" class="ct-popup" style="display:none;top:54px">
          <div class="ct-popup-item">🏦 Nova conta</div>
          <div class="ct-popup-item">🔀 Ordenar contas</div>
          <div class="ct-popup-item">👁️ Exibir contas arquivadas</div>
        </div>
        <!-- Nav mês -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <button id="ct-prev" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">‹</button>
          <span style="font-size:16px;font-weight:600;color:var(--text,#111)">${mesLabel()}</span>
          <button id="ct-next" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">›</button>
        </div>
        <!-- Lista -->
        <div style="background:var(--bg,#f4f5f7)">
          ${rows.length?rows:'<div style="padding:40px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px">Nenhuma conta cadastrada.<br><br>Toque em + para adicionar.</div>'}
        </div>
        <!-- FAB -->
        <button class="ct-fab" id="ct-fab">+</button>
      </div>`;

    // Nav mês
    el.querySelector('#ct-prev')?.addEventListener('click',()=>{mesNav.mes--;if(mesNav.mes<0){mesNav.mes=11;mesNav.ano--;}showList();});
    el.querySelector('#ct-next')?.addEventListener('click',()=>{mesNav.mes++;if(mesNav.mes>11){mesNav.mes=0;mesNav.ano++;}showList();});

    // Menu geral (⋮ topo)
    const popupGeral=el.querySelector('#ct-popup-geral');
    el.querySelector('#ct-menu-geral')?.addEventListener('click',e=>{e.stopPropagation();closePopups();const vis=popupGeral.style.display==='none';popupGeral.style.display=vis?'block':'none';});
    popupGeral?.querySelector('.ct-popup-item:first-child')?.addEventListener('click',()=>showForm(null));

    // FAB → nova conta
    el.querySelector('#ct-fab')?.addEventListener('click',()=>showForm(null));

    // Context menu por conta (⋮)
    el.querySelectorAll('.ct-more').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        closePopups();
        const id=btn.dataset.id;
        const conta=contas.find(c=>c.id===id);
        if(!conta)return;
        const row=btn.closest('.ct-row');
        const rowRect=row.getBoundingClientRect();
        const elRect=el.getBoundingClientRect();
        const top=(rowRect.bottom-elRect.top)+'px';
        const popup=document.createElement('div');
        popup.className='ct-popup';
        popup.style.top=top;
        popup.style.right='8px';
        popup.style.position='absolute';
        popup.innerHTML=`
          <div class="ct-popup-item" data-action="editar">✏️ Editar</div>
          <div class="ct-popup-item" data-action="extrato">📋 Extrato</div>
          <div class="ct-popup-item" data-action="abrir-banco">📱 Abrir app do banco</div>
          <div class="ct-popup-item" data-action="reajustar">🔄 Reajustar saldo</div>
          <div class="ct-popup-item" data-action="adicionar">➕ Adicionar</div>
          <div class="ct-popup-item" data-action="transacoes">💳 Transações</div>
          <div class="ct-popup-item danger" data-action="excluir">🗑️ Excluir/Arquivar</div>
          <div class="ct-popup-item" data-action="calculadora">🧮 Calculadora</div>
          <div class="ct-popup-item" data-action="resumo" style="display:flex;justify-content:space-between">
            <span>📊 Exibir na tela de Resumo</span>
            <input type="checkbox" ${conta.exibirResumo?'checked':''} style="width:16px;height:16px">
          </div>`;
        el.querySelector('[style*="position:relative"]').appendChild(popup);

        popup.querySelectorAll('[data-action]').forEach(item=>{
          item.addEventListener('click',ev=>{
            ev.stopPropagation();
            const action=item.dataset.action;
            closePopups();
            if(action==='editar')showForm(conta);
            else if(action==='extrato')showDetalhe(conta);
            else if(action==='transacoes')showDetalhe(conta);
            else if(action==='adicionar'){if(typeof window.openModule==='function')window.openModule('lancamentos','Transações','💳','#3FD68E');}
            else if(action==='calculadora')showCalculadora();
            else if(action==='abrir-banco')X.info('Abrir app do banco: funcionalidade em breve');
            else if(action==='reajustar')showReajuste(conta);
            else if(action==='excluir')showExcluir(conta);
          });
        });
      });
    });

    // Click na linha → detalhe
    el.querySelectorAll('.ct-row').forEach(row=>{
      row.addEventListener('click',e=>{
        if(e.target.closest('.ct-more'))return;
        const id=row.dataset.id;
        const conta=contas.find(c=>c.id===id);
        if(conta)showDetalhe(conta);
      });
    });

    // Fechar popups clicando fora
    el.addEventListener('click',e=>{if(!e.target.closest('.ct-popup')&&!e.target.closest('.ct-more')&&!e.target.closest('#ct-menu-geral'))closePopups();},{capture:true});
  }

  // ── Detalhe / Extrato de uma conta ──
  async function showDetalhe(conta){
    closePopups();
    el.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text-muted,#6b7280);font-size:13px">Carregando...</div>`;
    const cor=conta.cor||'#6b7280';
    const saldoAtual=Number(conta.saldo??conta.saldoInicial??0);
    el.innerHTML=`
      <div style="position:relative">
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <button id="ct-back" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px 8px">←</button>
          <div style="flex:1;font-size:16px;font-weight:700;color:var(--text,#111)">${conta.tipo||'Conta'}</div>
          <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px">🔍</button>
          <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px">⋮</button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <button id="ct-d-prev" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">‹</button>
          <span style="font-size:16px;font-weight:600;color:var(--text,#111)">${mesLabel()}</span>
          <button id="ct-d-next" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">›</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <div style="width:36px;height:36px;border-radius:50%;background:${cor}22;border:2px solid ${cor}55;display:flex;align-items:center;justify-content:center;font-size:18px">🏦</div>
          <div style="font-size:15px;font-weight:600;color:var(--text,#111);flex:1">${conta.nome}</div>
          <div style="text-align:center;min-width:80px">
            <div style="font-size:10px;color:var(--text-muted,#9ca3af)">Saldo Inicial</div>
            <div style="font-size:14px;font-weight:600;color:var(--text,#111)">${Number(conta.saldoInicial||0).toFixed(2).replace('.',',')}</div>
          </div>
          <div style="text-align:center;min-width:80px">
            <div style="font-size:10px;color:var(--text-muted,#9ca3af)">Saldo atual</div>
            <div style="font-size:14px;font-weight:600;color:${saldoAtual<0?'#ef4444':'var(--text,#111)'}">${saldoAtual.toFixed(2).replace('.',',')}</div>
          </div>
        </div>
        <div style="padding:60px 20px;text-align:center;background:var(--bg,#f4f5f7);min-height:300px">
          <div style="color:var(--text-muted,#9ca3af);margin-bottom:12px">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style="opacity:.3">
              <circle cx="15" cy="30" r="12" fill="currentColor"/>
              <circle cx="45" cy="30" r="12" fill="currentColor"/>
              <rect x="28" y="18" width="24" height="5" rx="2" fill="currentColor"/>
              <rect x="28" y="25" width="20" height="4" rx="2" fill="currentColor"/>
              <rect x="28" y="31" width="16" height="4" rx="2" fill="currentColor"/>
              <rect x="28" y="48" width="24" height="5" rx="2" fill="currentColor"/>
              <rect x="28" y="55" width="20" height="4" rx="2" fill="currentColor"/>
            </svg>
          </div>
          <div style="font-size:14px;color:var(--text-muted,#9ca3af)">Nenhuma transação</div>
        </div>
        <button class="ct-fab" id="ct-d-fab" style="position:sticky;bottom:16px;right:16px;float:right;width:52px;height:52px;border-radius:50%;background:var(--accent,#6366f1);color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,.4);display:flex;align-items:center;justify-content:center;margin-right:16px">+</button>
      </div>`;

    el.querySelector('#ct-back')?.addEventListener('click',()=>showList());
    el.querySelector('#ct-d-prev')?.addEventListener('click',()=>{mesNav.mes--;if(mesNav.mes<0){mesNav.mes=11;mesNav.ano--;}showDetalhe(conta);});
    el.querySelector('#ct-d-next')?.addEventListener('click',()=>{mesNav.mes++;if(mesNav.mes>11){mesNav.mes=0;mesNav.ano++;}showDetalhe(conta);});
    el.querySelector('#ct-d-fab')?.addEventListener('click',()=>{if(typeof window.openModule==='function')window.openModule('lancamentos','Transações','💳','#3FD68E');});
  }

  // ── Formulário Nova/Editar Conta ──
  function showForm(conta){
    closePopups();
    const isEdit=!!conta;
    const CATEGORIAS=['Conta Corrente','Poupança','Carteira','Investimento','Cartão','Outros'];
    el.innerHTML=`
      <div>
        <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <button id="ct-f-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280);padding:4px 8px">✕</button>
          <div style="flex:1;font-size:16px;font-weight:700;color:var(--text,#111)">${isEdit?'Editando Conta':'Nova Conta'}</div>
          <button id="ct-f-save" style="background:var(--accent,#6366f1);color:#fff;border:none;border-radius:20px;padding:8px 20px;font-size:14px;font-weight:600;cursor:pointer">Salvar</button>
          <button style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted,#6b7280)">⋮</button>
        </div>
        <div style="background:var(--bg,#f4f5f7);min-height:100%">
          <!-- Nome e ícone -->
          <div style="background:var(--bg-card,#fff);display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb)">
            <span style="color:var(--text-muted,#9ca3af);font-size:18px">☰</span>
            <input id="ct-f-nome" value="${conta?.nome||''}" placeholder="Nome da conta" style="flex:1;border:none;background:none;font-size:15px;color:var(--text,#111);outline:none">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--accent,#6366f1)22;border:2px solid var(--accent,#6366f1)44;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer" title="Escolher ícone">🏦</div>
            <span style="color:var(--text-muted,#9ca3af);font-size:16px;cursor:pointer">▾</span>
          </div>
          <!-- Saldo Inicial -->
          <div style="background:var(--bg-card,#fff);display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb)">
            <span style="color:var(--text-muted,#9ca3af);font-size:18px">💲</span>
            <span style="flex:1;font-size:15px;color:var(--text,#111)">Saldo Inicial</span>
            <input id="ct-f-saldo" type="number" step="0.01" value="${conta?.saldoInicial??0}" style="border:none;background:none;font-size:15px;color:var(--text-muted,#9ca3af);outline:none;text-align:right;width:100px">
          </div>
          <!-- Cheque especial -->
          <div style="background:var(--bg-card,#fff);display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb)">
            <span style="color:var(--text-muted,#9ca3af);font-size:18px">💵</span>
            <span style="flex:1;font-size:15px;color:var(--text,#111)">Cheque especial</span>
            <input id="ct-f-cheque" type="number" step="0.01" value="${conta?.chequeEspecial??0}" style="border:none;background:none;font-size:15px;color:var(--text-muted,#9ca3af);outline:none;text-align:right;width:100px">
          </div>
          <!-- Categoria (tipo) -->
          <div style="background:var(--bg-card,#fff);padding:8px 16px 4px;border-bottom:1px solid var(--border,#e5e7eb)">
            <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:6px">Categoria</div>
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">🏦</span>
              <select id="ct-f-tipo" style="flex:1;border:none;background:none;font-size:15px;color:var(--text,#111);outline:none;cursor:pointer">
                ${CATEGORIAS.map(c=>`<option value="${c}" ${(conta?.tipo||'Outros')===c?'selected':''}>${c}</option>`).join('')}
              </select>
              <button style="background:var(--accent,#6366f1);color:#fff;border:none;border-radius:50%;width:26px;height:26px;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
            </div>
          </div>
          <!-- Dados adicionais -->
          <div style="background:var(--bg-card,#fff);display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb)">
            <span style="color:var(--text-muted,#9ca3af);font-size:18px">📝</span>
            <input id="ct-f-dados" value="${conta?.dadosAdicionais||''}" placeholder="Dados adicionais" style="flex:1;border:none;background:none;font-size:15px;color:var(--text-muted,#9ca3af);outline:none">
          </div>
          <!-- Toggles -->
          ${[
            ['ct-f-padrao','⭐','Conta padrão',conta?.contaPadrao],
            ['ct-f-notif','🔔','Padrão para importação de notificações deste banco',conta?.notifPadrao],
            ['ct-f-resumo','⊞','Exibir na tela de Resumo',conta?.exibirResumo],
            ['ct-f-ignorar','💸','Ignorar nos totais',conta?.ignorarTotais]
          ].map(([id,ico,lbl,val])=>`
            <div style="background:var(--bg-card,#fff);display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border,#e5e7eb)">
              <span style="color:var(--text-muted,#9ca3af);font-size:18px">${ico}</span>
              <span style="flex:1;font-size:14px;color:var(--text,#111)">${lbl}</span>
              <label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0">
                <input id="${id}" type="checkbox" ${val?'checked':''} style="opacity:0;width:0;height:0">
                <span onclick="this.previousElementSibling.click()" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:${val?'var(--accent,#6366f1)':'var(--border,#ccc)'};border-radius:24px;transition:.3s">
                  <span style="position:absolute;content:'';height:18px;width:18px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.3s;transform:${val?'translateX(20px)':'none'}"></span>
                </span>
              </label>
            </div>`).join('')}
          <!-- Info banner -->
          ${isEdit?`<div style="margin:12px 16px;background:var(--surface,#f3f4f6);border-radius:10px;padding:12px 14px;display:flex;gap:8px;font-size:12px;color:var(--text-muted,#6b7280)">
            <span>⭐</span>
            <span>Alteração do saldo inicial e do cheque especial será considerada a partir de ${W2[mesNav.mes]} ${mesNav.ano}</span>
          </div>`:''}
        </div>
      </div>`;

    el.querySelector('#ct-f-close')?.addEventListener('click',()=>showList());
    el.querySelector('#ct-f-save')?.addEventListener('click',async()=>{
      const nome=el.querySelector('#ct-f-nome')?.value?.trim();
      if(!nome){X.warn('Informe o nome da conta');return;}
      const dados={
        id:conta?.id,
        nome,
        tipo:el.querySelector('#ct-f-tipo')?.value||'Outros',
        saldoInicial:parseFloat(el.querySelector('#ct-f-saldo')?.value||0),
        saldo:parseFloat(el.querySelector('#ct-f-saldo')?.value||0),
        chequeEspecial:parseFloat(el.querySelector('#ct-f-cheque')?.value||0),
        dadosAdicionais:el.querySelector('#ct-f-dados')?.value||'',
        contaPadrao:el.querySelector('#ct-f-padrao')?.checked||false,
        notifPadrao:el.querySelector('#ct-f-notif')?.checked||false,
        exibirResumo:el.querySelector('#ct-f-resumo')?.checked||false,
        ignorarTotais:el.querySelector('#ct-f-ignorar')?.checked||false,
        ativa:true,
      };
      try{
        await mod.e('contas',dados);
        X.ok(isEdit?'Conta atualizada!':'Conta criada!');
        showList();
      }catch(err){X.err('Erro ao salvar: '+err.message);}
    });
  }

  // ── Calculadora simples ──
  function showCalculadora(){
    const popup=document.createElement('div');
    popup.className='ct-popup';
    popup.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:260px;z-index:9999;padding:16px;';
    popup.innerHTML=`<div style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text,#111)">🧮 Calculadora</div>
      <input id="calc-expr" style="width:100%;border:1px solid var(--border,#e5e7eb);border-radius:8px;padding:8px 12px;font-size:16px;text-align:right;box-sizing:border-box;background:var(--bg,#f4f5f7);color:var(--text,#111)" placeholder="0">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px">
        ${['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+','C','','',''].map(k=>k?`<button onclick="calcBtn('${k}')" style="padding:10px;border:1px solid var(--border,#e5e7eb);border-radius:8px;cursor:pointer;font-size:15px;background:var(--bg-card,#fff);color:var(--text,#111)">${k}</button>`:'<span></span>').join('')}
      </div>
      <button onclick="this.closest('.ct-popup').remove()" style="width:100%;margin-top:10px;padding:8px;border:none;border-radius:8px;background:var(--accent,#6366f1);color:#fff;cursor:pointer;font-size:14px">Fechar</button>`;
    document.body.appendChild(popup);
    window.calcBtn=function(k){
      const inp=document.getElementById('calc-expr');if(!inp)return;
      if(k==='C'){inp.value='';return;}
      if(k==='='){try{inp.value=Function('"use strict";return ('+inp.value.replace('÷','/').replace('×','*')+')')();}catch(e){inp.value='Erro';}return;}
      inp.value+=k;
    };
  }

  // ── Reajuste de saldo ──
  function showReajuste(conta){
    closePopups();
    el.innerHTML=`
      <div>
        <div style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
          <button id="ct-rj-back" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">←</button>
          <div style="flex:1;font-size:16px;font-weight:700;color:var(--text,#111)">Reajustar saldo</div>
        </div>
        <div style="padding:24px 16px">
          <div style="font-size:14px;color:var(--text-muted,#6b7280);margin-bottom:8px">Conta: <strong style="color:var(--text,#111)">${conta.nome}</strong></div>
          <div style="font-size:14px;color:var(--text-muted,#6b7280);margin-bottom:16px">Saldo atual: <strong style="color:var(--text,#111)">${w(conta.saldo??0)}</strong></div>
          <label style="display:block;font-size:13px;color:var(--text-muted,#6b7280);margin-bottom:6px">Novo saldo</label>
          <input id="ct-rj-val" type="number" step="0.01" value="${conta.saldo??0}" style="width:100%;border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:12px;font-size:16px;box-sizing:border-box;background:var(--bg-card,#fff);color:var(--text,#111)">
          <button id="ct-rj-save" style="margin-top:16px;width:100%;padding:12px;background:var(--accent,#6366f1);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer">Reajustar</button>
        </div>
      </div>`;
    el.querySelector('#ct-rj-back')?.addEventListener('click',()=>showList());
    el.querySelector('#ct-rj-save')?.addEventListener('click',async()=>{
      const novoSaldo=parseFloat(el.querySelector('#ct-rj-val')?.value||0);
      try{await mod.e('contas',{...conta,saldo:novoSaldo});X.ok('Saldo reajustado!');showList();}
      catch(err){X.err('Erro: '+err.message);}
    });
  }

  // ── Excluir/Arquivar ──
  function showExcluir(conta){
    closePopups();
    const popup=document.createElement('div');
    popup.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    popup.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:16px;padding:24px;max-width:300px;margin:20px;text-align:center">
      <div style="font-size:32px;margin-bottom:12px">🗑️</div>
      <div style="font-size:16px;font-weight:700;color:var(--text,#111);margin-bottom:8px">Excluir ou Arquivar?</div>
      <div style="font-size:13px;color:var(--text-muted,#6b7280);margin-bottom:20px">"${conta.nome}"</div>
      <button id="ct-ex-arq" style="width:100%;padding:11px;background:var(--surface,#f3f4f6);border:none;border-radius:10px;font-size:14px;cursor:pointer;margin-bottom:8px;color:var(--text,#111)">📦 Arquivar</button>
      <button id="ct-ex-del" style="width:100%;padding:11px;background:#fee2e2;border:none;border-radius:10px;font-size:14px;cursor:pointer;color:#dc2626;margin-bottom:8px">🗑️ Excluir definitivamente</button>
      <button id="ct-ex-cancel" style="width:100%;padding:11px;background:none;border:none;border-radius:10px;font-size:14px;cursor:pointer;color:var(--text-muted,#6b7280)">Cancelar</button>
    </div>`;
    document.body.appendChild(popup);
    popup.querySelector('#ct-ex-cancel')?.addEventListener('click',()=>popup.remove());
    popup.querySelector('#ct-ex-arq')?.addEventListener('click',async()=>{
      try{await mod.e('contas',{...conta,ativa:false});X.ok('Conta arquivada');popup.remove();showList();}
      catch(err){X.err('Erro: '+err.message);}
    });
    popup.querySelector('#ct-ex-del')?.addEventListener('click',async()=>{
      try{await mod.g('contas',conta.id);X.ok('Conta excluída');popup.remove();showList();}
      catch(err){X.err('Erro: '+err.message);}
    });
  }

  // Inicia
  await showList();
};;
/* ── Clientes ServNet module inline ── */
_['clientes']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const sb=mod.j, toast=mod.t, fmt=mod.f;
  const {data:{user}}=await sb.auth.getUser();
  const uid=user&&user.id;
  if(!uid){el.innerHTML='<div style="padding:24px;color:#f87171">Não autenticado.</div>';return;}
  const unpack=r=>({id:r.id,...(r.dados||{})});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cpfFmt=v=>{v=String(v||'').replace(/\D/g,'');return v.length===11?v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9):v;};
  const mesAtual=()=>{const t=new Date;return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0');};

  async function listar(){
    const {data,error}=await sb.from('cli_clientes').select('*').eq('user_id',uid);
    if(error)throw error;
    return (data||[]).map(unpack).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||'')));
  }
  async function salvar(cli){
    const {id,...dados}=cli;
    const {error}=await sb.from('cli_clientes').upsert({id,user_id:uid,dados,updated_at:new Date().toISOString()},{onConflict:'id'});
    if(error)throw error;
  }
  async function showForm(cli){
    const c=cli||{};
    let negs=[],planosAll=[];
    try{
      const [ng,pl]=await Promise.all([
        sb.from('negocios').select('id,nome').eq('user_id',uid),
        sb.from('cli_planos').select('id,dados').eq('user_id',uid)
      ]);
      negs=((ng&&ng.data)||[]).sort((a,b)=>String(a.nome).localeCompare(String(b.nome)));
      planosAll=((pl&&pl.data)||[]).map(r=>({id:r.id,...(r.dados||{})})).filter(p=>p.ativo!==false);
    }catch(e){}
    const optNeg=negs.map(n=>`<option value="${n.id}"${c.negocioId===n.id?' selected':''}>${esc(n.nome)}</option>`).join('');
    const optPlano=negId=>planosAll.filter(p=>!negId||p.negocioId===negId).map(p=>`<option value="${p.id}"${c.planoId===p.id?' selected':''}>${esc(p.nome)} — R$ ${p.valor}</option>`).join('');
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;display:flex;align-items:flex-end;justify-content:center';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:22px 20px 30px;max-height:88vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:#0ea5e9">${cli?'✏️ Editar cliente':'👥 Novo cliente'}</span>
        <button id="cl-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="cl-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Nome completo</label><input class="cl-inp" name="nome" required value="${esc(c.nome||'')}" placeholder="Ex: João da Silva"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">CPF</label><input class="cl-inp" name="cpfCnpj" required value="${esc(c.cpfCnpj||'')}" placeholder="000.000.000-00" inputmode="numeric"></div>
          <div><label class="cl-lbl">Nascimento</label><input class="cl-inp" name="dataNascimento" type="date" required value="${esc(c.dataNascimento||'')}"></div>
        </div>
        <div><label class="cl-lbl">Telefone / WhatsApp</label><input class="cl-inp" name="telefone" value="${esc(c.telefone||'')}" placeholder="(11) 90000-0000" inputmode="tel"></div>
        <div><label class="cl-lbl">E-mail (opcional)</label><input class="cl-inp" name="email" type="email" value="${esc(c.email||'')}" placeholder="cliente@email.com"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">CEP</label><input class="cl-inp" name="cep" id="cl-cep" value="${esc(c.cep||'')}" placeholder="00000-000" inputmode="numeric" maxlength="9"></div>
          <div><label class="cl-lbl">Número</label><input class="cl-inp" name="numero" value="${esc(c.numero||'')}" placeholder="123"></div>
        </div>
        <div><label class="cl-lbl">Endereço</label><input class="cl-inp" name="logradouro" id="cl-logr" value="${esc(c.logradouro||c.endereco||'')}" placeholder="Preenchido automaticamente pelo CEP"><div id="cl-cep-st" style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:3px"></div></div>
        <div><label class="cl-lbl">Ponto de referência (opcional)</label><input class="cl-inp" name="referencia" value="${esc(c.referencia||'')}" placeholder="Ex: próximo ao mercado"></div>
        <div><label class="cl-lbl">Serviços contratados</label>
          <div id="cl-servs" style="display:flex;flex-direction:column;gap:6px"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
            <select id="cl-sv-neg" class="cl-inp"><option value="">Negócio…</option>${negs.map(n=>`<option value="${n.id}">${esc(n.nome)}</option>`).join('')}</select>
            <select id="cl-sv-pl" class="cl-inp"><option value="">Plano…</option></select>
          </div>
          <div style="display:grid;grid-template-columns:1.4fr 1fr auto;gap:8px;margin-top:6px">
            <select id="cl-sv-per" class="cl-inp">
              <option value="fixa">Fixa (mensal)</option><option value="mensal">Mensal</option>
              <option value="bimestral">Bimestral</option><option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option><option value="anual">Anual</option>
            </select>
            <input id="cl-sv-dia" class="cl-inp" type="number" min="1" max="28" value="10" title="Dia de vencimento">
            <button type="button" id="cl-sv-add" style="background:#0ea5e9;color:#fff;border:none;border-radius:10px;padding:0 14px;font-weight:700;cursor:pointer">+</button>
          </div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-top:4px">Escolha negócio → plano → periodicidade → dia de vencimento e toque em +. As cobranças usam esses serviços.</div>
        </div>
        <div><label class="cl-lbl">Status</label>
          <select class="cl-inp" name="status">
            <option${(c.status||'Ativo')==='Ativo'?' selected':''}>Ativo</option>
            <option${c.status==='Suspenso'?' selected':''}>Suspenso</option>
            <option${c.status==='Cancelado'?' selected':''}>Cancelado</option>
          </select>
        </div>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#0ea5e9;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Salvar cliente</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
    ov.querySelector('#cl-x').addEventListener('click',()=>ov.remove());
    // ── Serviços contratados (multi negócio/plano/periodicidade) ──
    const servs=Array.isArray(c.servicos)?[...c.servicos]:(c.planoId?[{id:crypto.randomUUID(),negocioId:c.negocioId||null,negocio:c.negocio||null,planoId:c.planoId,plano:c.plano||null,valor:c.valorMensal||null,periodicidade:'fixa',diaVencimento:c.diaVencimento||10}]:[]);
    const svNeg=ov.querySelector('#cl-sv-neg'),svPl=ov.querySelector('#cl-sv-pl'),svPer=ov.querySelector('#cl-sv-per'),svDia=ov.querySelector('#cl-sv-dia'),svList=ov.querySelector('#cl-servs');
    const PERLBL={fixa:'Fixa',mensal:'Mensal',bimestral:'Bimestral',trimestral:'Trimestral',semestral:'Semestral',anual:'Anual'};
    function renderServs(){
      svList.innerHTML=servs.length?servs.map(s=>`<div style="display:flex;align-items:center;gap:8px;background:rgba(14,165,233,.08);border:1px solid rgba(14,165,233,.3);border-radius:10px;padding:8px 10px">
        <div style="flex:1;min-width:0;font-size:12px;color:var(--text,#111)"><b>${esc(s.plano||'—')}</b> (${esc(s.negocio||'—')}) · R$ ${s.valor??'—'} · ${PERLBL[s.periodicidade]||s.periodicidade} · venc. dia ${s.diaVencimento}</div>
        <button type="button" class="cl-sv-del" data-id="${s.id}" style="background:none;border:none;color:#dc2626;font-size:15px;cursor:pointer">✕</button>
      </div>`).join(''):'<div style="font-size:12px;color:var(--text-muted,#9ca3af)">Nenhum serviço vinculado.</div>';
      svList.querySelectorAll('.cl-sv-del').forEach(b=>b.addEventListener('click',()=>{
        const i=servs.findIndex(s=>s.id===b.dataset.id);if(i>=0){servs.splice(i,1);renderServs();}
      }));
    }
    renderServs();
    svNeg?.addEventListener('change',()=>{
      svPl.innerHTML='<option value="">Plano…</option>'+planosAll.filter(p=>p.negocioId===svNeg.value).map(p=>`<option value="${p.id}">${esc(p.nome)} — R$ ${p.valor}</option>`).join('');
    });
    ov.querySelector('#cl-sv-add')?.addEventListener('click',()=>{
      const pl=planosAll.find(p=>p.id===svPl.value);
      if(!pl){toast.err('Escolha o negócio e o plano.');return;}
      servs.push({id:crypto.randomUUID(),negocioId:pl.negocioId,negocio:pl.negocio,planoId:pl.id,plano:pl.nome,valor:pl.valor,periodicidade:svPer.value,diaVencimento:parseInt(svDia.value)||10});
      svPl.value='';renderServs();
    });
    // ── CEP → ViaCEP: preenche endereço automaticamente ──
    const cepInp=ov.querySelector('#cl-cep'),logrInp=ov.querySelector('#cl-logr'),cepSt=ov.querySelector('#cl-cep-st');
    cepInp?.addEventListener('input',async()=>{
      const v=cepInp.value.replace(/\D/g,'').slice(0,8);
      cepInp.value=v.length>5?v.slice(0,5)+'-'+v.slice(5):v;
      if(v.length!==8){cepSt.textContent='';return;}
      cepSt.textContent='Buscando endereço…';
      try{
        const r=await fetch('https://viacep.com.br/ws/'+v+'/json/');
        const d=await r.json();
        if(d.erro){cepSt.textContent='⚠️ CEP não encontrado — preencha manualmente.';return;}
        logrInp.value=[d.logradouro,d.bairro,(d.localidade&&d.uf)?d.localidade+' - '+d.uf:''].filter(Boolean).join(', ');
        cepSt.textContent='✓ Endereço encontrado — confira o número';
      }catch(err){cepSt.textContent='⚠️ Falha ao buscar CEP — preencha manualmente.';}
    });
    ov.querySelector('#cl-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const novo={id:c.id||crypto.randomUUID(),nome:fd.get('nome').trim(),cpfCnpj:fd.get('cpfCnpj').trim(),
        dataNascimento:fd.get('dataNascimento'),telefone:fd.get('telefone').trim(),
        email:(fd.get('email')||'').trim(),
        cep:(fd.get('cep')||'').trim(),logradouro:(fd.get('logradouro')||'').trim(),
        numero:(fd.get('numero')||'').trim(),referencia:(fd.get('referencia')||'').trim(),
        endereco:[(fd.get('logradouro')||'').trim(),(fd.get('numero')||'').trim()].filter(Boolean).join(', '),
        status:fd.get('status'),
        servicos:servs,
        negocioId:(servs[0]||{}).negocioId||null,
        negocio:(servs[0]||{}).negocio||null,
        planoId:(servs[0]||{}).planoId||null,
        plano:(servs[0]||{}).plano||null,
        valorMensal:(servs[0]||{}).valor??null,
        diaVencimento:(servs[0]||{}).diaVencimento??null,
        dataCadastro:c.dataCadastro||new Date().toISOString().slice(0,10)};
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Verificando…';
      const dig=s=>String(s||'').replace(/\D/g,'');
      try{
        // ── Anti-duplicidade: CPF ou telefone já cadastrado em outro cliente ──
        const todos=await listar();
        const cpfN=dig(novo.cpfCnpj),telN=dig(novo.telefone);
        const dupCpf=cpfN&&todos.find(t=>t.id!==novo.id&&dig(t.cpfCnpj)===cpfN);
        const dupTel=telN&&todos.find(t=>t.id!==novo.id&&dig(t.telefone)===telN);
        if(dupCpf||dupTel){
          const d=dupCpf||dupTel;
          toast.err('⚠️ Duplicado: o cliente "'+d.nome+'" já usa este '+(dupCpf?'CPF':'telefone')+'. Cadastro não salvo.',7000);
          btn.disabled=false;btn.textContent='Salvar cliente';return;
        }
        btn.textContent='Salvando…';
        await salvar(novo);toast.ok('Cliente salvo! ✅');ov.remove();render();}
      catch(err){toast.err('Erro: '+err.message);btn.disabled=false;btn.textContent='Salvar cliente';}
    });
  }

  async function render(){
    el.innerHTML='<div style="padding:24px;text-align:center;color:var(--text-muted,#6b7280)">Carregando clientes…</div>';
    let clientes=[];
    try{clientes=await listar();}
    catch(e){el.innerHTML='<div style="padding:24px;color:#f87171;font-size:14px">Erro ao carregar clientes: '+esc(e.message)+'<br><br>Se aparecer "permission denied", rode o SQL de políticas que o Claude te passou.</div>';return;}
    const ativos=clientes.filter(c=>c.status!=='Cancelado');
    const rows=clientes.map(c=>{
      const cor=c.status==='Ativo'?'#059669':c.status==='Suspenso'?'#d97706':'#6b7280';
      return `<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid var(--border,#e5e7eb)">
        <div style="width:38px;height:38px;border-radius:50%;background:${cor}22;border:2px solid ${cor}55;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${cor};flex-shrink:0">${esc((c.nome||'?')[0].toUpperCase())}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.nome||'—')}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af)">${esc(cpfFmt(c.cpfCnpj))}${c.telefone?' · '+esc(c.telefone):''}${Array.isArray(c.servicos)&&c.servicos.length?' · 📦 '+c.servicos.length+' serviço'+(c.servicos.length>1?'s':''):(c.plano?' · 📦 '+esc(c.plano):'')} · <span style="color:${cor};font-weight:600">${esc(c.status||'Ativo')}</span></div>
        </div>
        <button class="cl-edit" data-id="${c.id}" title="Editar" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:15px;cursor:pointer;padding:6px 9px;color:var(--text-muted,#6b7280)">✏️</button>
      </div>`;
    }).join('');
    el.innerHTML=`
      <style>
        .cl-lbl{font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.04em}
        .cl-inp{width:100%;border:1.5px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;font-size:15px;color:var(--text,#111);background:rgba(128,128,128,.1);box-sizing:border-box}
        .cl-inp:focus{outline:none;border-color:#0ea5e9}
      </style>
      <div style="display:flex;align-items:center;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb);gap:8px">
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:var(--text,#111)">Clientes</div>
          <div style="font-size:13px;color:var(--text-muted,#6b7280)">${ativos.length} ativo${ativos.length===1?'':'s'} · ${clientes.length} total</div>
        </div>
        <button id="cl-novo" style="background:#0ea5e9;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer">+ Novo</button>
      </div>
      <div style="background:var(--bg,#f4f5f7);padding-bottom:80px">
        ${rows||'<div style="padding:40px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px">Nenhum cliente cadastrado.<br><br>Toque em <b>+ Novo</b> para começar.</div>'}
      </div>`;
    el.querySelector('#cl-novo').addEventListener('click',()=>showForm(null));
    el.querySelectorAll('.cl-edit').forEach(b=>b.addEventListener('click',()=>{
      const c=clientes.find(x=>x.id===b.dataset.id);if(c)showForm(c);
    }));
  }
  await render();
};
;
/* ── Tipos de Negócio + Planos module inline ── */
_['negocios']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const sb=mod.j, toast=mod.t, fmt=mod.f;
  const {data:{user}}=await sb.auth.getUser();
  const uid=user&&user.id;
  if(!uid){el.innerHTML='<div style="padding:24px;color:#f87171">Não autenticado.</div>';return;}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  async function listNeg(){
    const {data,error}=await sb.from('negocios').select('*').eq('user_id',uid);
    if(error)throw error;
    return (data||[]).sort((a,b)=>String(a.nome||'').localeCompare(String(b.nome||'')));
  }
  async function listPlanos(){
    const {data,error}=await sb.from('cli_planos').select('*').eq('user_id',uid);
    if(error)throw error;
    return (data||[]).map(r=>({id:r.id,...(r.dados||{})}));
  }

  function formNeg(neg){
    const nome=prompt(neg?'Editar tipo de negócio:':'Nome do tipo de negócio (ex: ServNet, Holding, Aluguéis):',neg?neg.nome:'');
    if(!nome||!nome.trim())return;
    sb.from('negocios').upsert({id:neg?neg.id:crypto.randomUUID(),user_id:uid,nome:nome.trim(),updated_at:new Date().toISOString()},{onConflict:'id'})
      .then(({error})=>{if(error){toast.err('Erro: '+error.message+(error.message.includes('does not exist')?' — rode o SQL de estrutura que o Claude passou.':''));}else{toast.ok('Negócio salvo! ✅');render();}});
  }

  function formPlano(negocio,plano){
    const p=plano||{};
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;display:flex;align-items:flex-end;justify-content:center';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:22px 20px 30px;max-height:88vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:#8b5cf6">${plano?'✏️ Editar plano':'📦 Novo plano'} — ${esc(negocio.nome)}</span>
        <button id="pl-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="pl-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Nome do plano *</label><input class="cl-inp" name="nome" required value="${esc(p.nome||'')}" placeholder="Ex: Fibra 300MB"></div>
        <div><label class="cl-lbl">Valor mensal (R$) *</label><input class="cl-inp" name="valor" type="number" step="0.01" min="0.01" required value="${p.valor??''}" placeholder="79.90"></div>
        <div><label class="cl-lbl">Detalhes (opcional)</label><input class="cl-inp" name="velocidade" value="${esc(p.velocidade||'')}" placeholder="Ex: 300MB fibra / casa 2 quartos"></div>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#8b5cf6;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Salvar plano</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
    ov.querySelector('#pl-x').addEventListener('click',()=>ov.remove());
    ov.querySelector('#pl-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const dados={nome:fd.get('nome').trim(),valor:parseFloat(fd.get('valor'))||0,
        velocidade:(fd.get('velocidade')||'').trim(),
        negocioId:negocio.id,negocio:negocio.nome,ativo:p.ativo!==false};
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Salvando…';
      const {error}=await sb.from('cli_planos').upsert({id:p.id||crypto.randomUUID(),user_id:uid,dados,updated_at:new Date().toISOString()},{onConflict:'id'});
      if(error){toast.err('Erro: '+error.message);btn.disabled=false;btn.textContent='Salvar plano';}
      else{toast.ok('Plano salvo! ✅');ov.remove();render();}
    });
  }

  async function render(){
    el.innerHTML='<div style="padding:24px;text-align:center;color:var(--text-muted,#6b7280)">Carregando…</div>';
    let negs=[],planos=[];
    try{[negs,planos]=await Promise.all([listNeg(),listPlanos()]);}
    catch(e){el.innerHTML='<div style="padding:24px;color:#f87171;font-size:14px">Erro: '+esc(e.message)+'<br><br>Se a tabela não existir ou der "permission denied", rode o SQL de estrutura que o Claude te passou.</div>';return;}
    const secs=negs.map(n=>{
      const pls=planos.filter(p=>p.negocioId===n.id);
      const plRows=pls.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 14px 9px 24px;border-top:1px solid var(--border,#e5e7eb)">
          <span style="font-size:15px">📦</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text,#111)">${esc(p.nome)}</div>
            <div style="font-size:11px;color:var(--text-muted,#9ca3af)">${fmt(p.valor)}/mês${p.velocidade?' · '+esc(p.velocidade):''}</div>
          </div>
          <button class="ng-pl-edit" data-id="${p.id}" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:13px;cursor:pointer;padding:5px 8px;color:var(--text-muted,#6b7280)">✏️</button>
          <button class="ng-pl-del" data-id="${p.id}" style="background:none;border:1px solid #fca5a5;border-radius:8px;font-size:13px;cursor:pointer;padding:5px 8px;color:#dc2626">🗑️</button>
        </div>`).join('');
      return `<div style="background:var(--bg-card,#fff);border-radius:14px;margin:10px 12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">
        <div style="display:flex;align-items:center;gap:10px;padding:13px 14px">
          <span style="font-size:20px">🏢</span>
          <div style="flex:1;font-size:15px;font-weight:700;color:var(--text,#111)">${esc(n.nome)} <span style="font-size:11px;font-weight:500;color:var(--text-muted,#9ca3af)">· ${pls.length} plano${pls.length===1?'':'s'}</span></div>
          <button class="ng-pl-add" data-id="${n.id}" style="background:#8b5cf615;border:1px solid #8b5cf644;border-radius:8px;font-size:12px;cursor:pointer;padding:6px 10px;color:#8b5cf6;font-weight:700">+ Plano</button>
          <button class="ng-edit" data-id="${n.id}" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:13px;cursor:pointer;padding:5px 8px;color:var(--text-muted,#6b7280)">✏️</button>
        </div>
        ${plRows||'<div style="padding:8px 24px 12px;font-size:12px;color:var(--text-muted,#9ca3af)">Nenhum plano. Toque em + Plano.</div>'}
      </div>`;
    }).join('');
    const orfaos=planos.filter(p=>!negs.find(n=>n.id===p.negocioId));
    const orfSec=orfaos.length?`<div style="background:var(--bg-card,#fff);border-radius:14px;margin:10px 12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);border:1px dashed #d97706">
        <div style="padding:12px 14px 4px;font-size:13px;font-weight:700;color:#d97706">📦 Planos antigos (sem tipo de negócio vinculado)</div>
        <div style="padding:0 14px 6px;font-size:11px;color:var(--text-muted,#9ca3af)">Vieram do cadastro anterior do portal. Exclua os que não usa ou edite para revincular.</div>
        ${orfaos.map(p=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 14px 9px 24px;border-top:1px solid var(--border,#e5e7eb)">
          <span style="font-size:15px">📦</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text,#111)">${esc(p.nome)}</div>
            <div style="font-size:11px;color:var(--text-muted,#9ca3af)">${fmt(p.valor)}/mês${p.negocio?' · era: '+esc(p.negocio):''}</div>
          </div>
          <button class="ng-pl-del" data-id="${p.id}" style="background:none;border:1px solid #fca5a5;border-radius:8px;font-size:13px;cursor:pointer;padding:5px 8px;color:#dc2626">🗑️</button>
        </div>`).join('')}
      </div>`:'';
    el.innerHTML=`
      <style>
        .cl-lbl{font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.04em}
        .cl-inp{width:100%;border:1.5px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;font-size:15px;color:var(--text,#111);background:rgba(128,128,128,.1);box-sizing:border-box}
        .cl-inp:focus{outline:none;border-color:#8b5cf6}
      </style>
      <div style="display:flex;align-items:center;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb);gap:8px">
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:var(--text,#111)">Tipos de Negócio</div>
          <div style="font-size:13px;color:var(--text-muted,#6b7280)">${negs.length} negócio${negs.length===1?'':'s'} · ${planos.length} plano${planos.length===1?'':'s'}</div>
        </div>
        <button id="ng-novo" style="background:#8b5cf6;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer">+ Negócio</button>
      </div>
      <div style="background:var(--bg,#f4f5f7);padding:2px 0 80px">
        ${secs||'<div style="padding:40px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px">Nenhum tipo de negócio.<br><br>Toque em <b>+ Negócio</b> para criar (ex: ServNet).</div>'}
        ${orfSec}
      </div>`;
    el.querySelector('#ng-novo').addEventListener('click',()=>formNeg(null));
    el.querySelectorAll('.ng-edit').forEach(b=>b.addEventListener('click',()=>{const n=negs.find(x=>x.id===b.dataset.id);if(n)formNeg(n);}));
    el.querySelectorAll('.ng-pl-add').forEach(b=>b.addEventListener('click',()=>{const n=negs.find(x=>x.id===b.dataset.id);if(n)formPlano(n,null);}));
    el.querySelectorAll('.ng-pl-edit').forEach(b=>b.addEventListener('click',()=>{
      const p=planos.find(x=>x.id===b.dataset.id);if(!p)return;
      const n=negs.find(x=>x.id===p.negocioId)||{id:p.negocioId,nome:p.negocio||'—'};
      formPlano(n,p);
    }));
    el.querySelectorAll('.ng-pl-del').forEach(b=>b.addEventListener('click',async()=>{
      const p=planos.find(x=>x.id===b.dataset.id);if(!p)return;
      if(!confirm('Excluir o plano "'+p.nome+'"?'))return;
      const {error}=await sb.from('cli_planos').delete().eq('id',p.id).eq('user_id',uid);
      if(error)toast.err('Erro: '+error.message);else{toast.ok('Plano excluído');render();}
    }));
  }
  await render();
};

/* ── Contas a Receber module inline ── */
_['receber']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const sb=mod.j, toast=mod.t, fmt=mod.f, addM=mod.c, unpack=mod.u, fetchAll=mod.i, saveBatch=mod.d;
  const {data:{user}}=await sb.auth.getUser();
  const uid=user&&user.id;
  if(!uid){el.innerHTML='<div style="padding:24px;color:#f87171">Não autenticado.</div>';return;}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const W2=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const now=new Date();let nav={ano:now.getFullYear(),mes:now.getMonth()};
  const mesKey=()=>nav.ano+'-'+String(nav.mes+1).padStart(2,'0');
  let todosCache=[];
  const dtBr=s=>{if(!s)return'—';const[a,m,d]=String(s).slice(0,10).split('-');return d+'/'+m;};

  async function marcar(id,dados,novoStatus){
    const d={...dados,status:novoStatus};
    if(novoStatus==='pago')d.dataPagamento=new Date().toISOString().slice(0,10);else delete d.dataPagamento;
    const {error}=await sb.from('lancamentos').update({dados:d,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',uid);
    if(error)throw error;
  }

  async function formCobranca(){
    let clientes=[],planos=[],negocios=[];
    try{
      const [cr,pr,ng]=await Promise.all([
        sb.from('cli_clientes').select('id,dados').eq('user_id',uid),
        sb.from('cli_planos').select('id,dados').eq('user_id',uid),
        sb.from('negocios').select('id,nome').eq('user_id',uid)
      ]);
      negocios=((ng&&ng.data)||[]).sort((a,b)=>String(a.nome).localeCompare(String(b.nome)));
      clientes=((cr&&cr.data)||[]).map(r=>({id:r.id,nome:(r.dados||{}).nome||'—',planoId:(r.dados||{}).planoId||null,servicos:Array.isArray((r.dados||{}).servicos)?(r.dados||{}).servicos:[]})).sort((a,b)=>a.nome.localeCompare(b.nome));
      planos=((pr&&pr.data)||[]).map(r=>({id:r.id,...(r.dados||{})})).filter(p=>p.ativo!==false);
    }catch(e){}
    const hoje=new Date().toISOString().slice(0,10);
    const optPl=planos.map(p=>`<option value="${p.id}" data-valor="${p.valor||''}" data-negocio="${esc(p.negocio||'')}" data-nome="${esc(p.nome||'')}">${esc(p.nome)} — ${fmt(p.valor)} (${esc(p.negocio||'')})</option>`).join('');
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px;width:100%;max-width:480px;padding:22px 20px 30px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:#059669">📥 Nova cobrança</span>
        <button id="cr-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="cr-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Cliente *</label>
          <input class="cl-inp" name="clienteNome" list="cr-cli-list" required placeholder="Digite o nome do cliente…" autocomplete="off">
          <datalist id="cr-cli-list">${clientes.map(c=>`<option value="${esc(c.nome)}">`).join('')}</datalist>
          ${clientes.length?'':'<div style="font-size:11px;color:#d97706;margin-top:3px">Nenhum cliente. Cadastre em Clientes.</div>'}
        </div>
        <div><label class="cl-lbl">Tipo de negócio *</label>
          <select class="cl-inp" name="negocio" id="cr-neg" required><option value="">— selecione —</option>${negocios.map(n=>`<option value="${n.id}">${esc(n.nome)}</option>`).join('')}</select>
          ${negocios.length?'':'<div style="font-size:11px;color:#d97706;margin-top:3px">Nenhum negócio. Cadastre em Tipos de Negócio.</div>'}
        </div>
        <div><label class="cl-lbl">Plano / serviço *</label>
          <select class="cl-inp" name="plano" id="cr-plano" required><option value="">— escolha o negócio primeiro —</option></select>
          ${planos.length?'':'<div style="font-size:11px;color:#d97706;margin-top:3px">Nenhum plano. Cadastre em Tipos de Negócio → + Plano.</div>'}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Valor (R$) *</label><input class="cl-inp" name="valor" id="cr-valor" type="number" step="0.01" min="0.01" required placeholder="0,00"></div>
          <div><label class="cl-lbl">1º vencimento *</label><input class="cl-inp" name="data_v" id="cr-dv" type="date" value="${hoje}" required></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Recorrência</label>
            <select class="cl-inp" name="recorrencia" id="cr-rec">
              <option value="unica">Única</option>
              <option value="fixa">Fixa (mensal, sem prazo)</option>
              <option value="mensal" selected>Mensal</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div id="cr-repwrap"><label class="cl-lbl">Repetições</label>
            <input class="cl-inp" name="repeticoes" type="number" min="2" max="60" value="12">
          </div>
        </div>
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text,#111);cursor:pointer;margin-top:2px">
          <input type="checkbox" name="mostrarPortal" checked style="width:16px;height:16px;accent-color:#059669">
          Mostrar no portal do cliente
        </label>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#059669;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Gerar cobrança</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#cr-x').addEventListener('click',()=>ov.remove());
    const selPl=ov.querySelector('#cr-plano'),inpV=ov.querySelector('#cr-valor'),inpD=ov.querySelector('#cr-dv');
    const selNeg=ov.querySelector('#cr-neg');
    const optPlFor=negId=>planos.filter(p=>!negId||p.negocioId===negId).map(p=>`<option value="${p.id}" data-valor="${p.valor||''}" data-negocio="${esc(p.negocio||'')}">${esc(p.nome)} — ${fmt(p.valor)}</option>`).join('');
    selNeg?.addEventListener('change',()=>{
      selPl.innerHTML='<option value="">— selecione —</option>'+optPlFor(selNeg.value);
    });
    // cliente digitado → pré-seleciona o plano vinculado e o valor
    const inpCli=ov.querySelector('input[name=clienteNome]');
    inpCli?.addEventListener('change',()=>{
      const c=clientes.find(x=>String(x.nome).toLowerCase()===inpCli.value.trim().toLowerCase());
      if(!c)return;
      const sv=(c.servicos&&c.servicos[0])||null;
      const planoAlvo=sv?sv.planoId:c.planoId;
      if(planoAlvo){
        const pl=planos.find(p=>p.id===planoAlvo);
        if(pl&&selNeg){selNeg.value=pl.negocioId||'';selNeg.dispatchEvent(new Event('change'));}
        selPl.value=planoAlvo;
        const o=selPl.selectedOptions[0];
        if(o&&o.dataset.valor)inpV.value=o.dataset.valor;
      }
      if(sv){
        const selR=ov.querySelector('#cr-rec');
        if(selR){selR.value=sv.periodicidade||'mensal';selR.dispatchEvent(new Event('change'));}
        if(sv.diaVencimento){
          const inpDv=ov.querySelector('#cr-dv');
          if(inpDv){const m=inpDv.value?inpDv.value.slice(0,7):new Date().toISOString().slice(0,7);inpDv.value=m+'-'+String(sv.diaVencimento).padStart(2,'0');}
        }
      }
    });
    selPl.addEventListener('change',()=>{
      const o=selPl.selectedOptions[0];if(!o||!o.value)return;
      if(o.dataset.valor)inpV.value=o.dataset.valor;
    });
    const selRec=ov.querySelector('#cr-rec'),repW=ov.querySelector('#cr-repwrap');
    selRec.addEventListener('change',()=>{repW.style.display=(selRec.value==='unica'||selRec.value==='fixa')?'none':'block';});
    ov.querySelector('#cr-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const nomeDig=String(fd.get('clienteNome')||'').trim().toLowerCase();
      const cli=clientes.find(c=>String(c.nome).toLowerCase()===nomeDig);
      const pl=planos.find(p=>p.id===fd.get('plano'));
      if(!cli){toast.err('Cliente não encontrado — digite e escolha um nome da lista.');return;}
      if(!pl){toast.err('Selecione o plano.');return;}
      const dv=fd.get('data_v'),rec=fd.get('recorrencia');
      const nrep=rec==='unica'?1:rec==='fixa'?24:Math.min(Math.max(parseInt(fd.get('repeticoes'))||12,2),60);
      const step=rec==='anual'?12:rec==='semestral'?6:rec==='trimestral'?3:rec==='bimestral'?2:1;
      const grupo=nrep>1?crypto.randomUUID():null;
      const entries=[];
      for(let i=0;i<nrep;i++){
        const dvi=i===0?dv:addM(dv,i*step);
        entries.push({id:crypto.randomUUID(),tipo:'receita',status:'pendente',
          descricao:pl.nome+' — '+cli.nome,valor:parseFloat(fd.get('valor'))||0,
          data_vencimento:dvi,mes_ref:dvi.slice(0,7),categoria:'Mensalidade',
          clienteId:cli.id,cliente:cli.nome,clienteNome:cli.nome,
          planoId:pl.id,plano:pl.nome,negocio:pl.negocio||'Provedor/Servnet',
          ...(fd.get('mostrarPortal')?{}:{ocultarPortal:true}),
          ...(grupo?{recorrencia:rec,grupoRecorrencia:grupo,parcela:(i+1)+'/'+nrep}:{})});
      }
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Gerando…';
      try{await saveBatch('lancamentos',entries);toast.ok(nrep+' cobrança'+(nrep>1?'s geradas':' gerada')+'! ✅');ov.remove();render();}
      catch(err){toast.err('Erro: '+err.message);btn.disabled=false;btn.textContent='Gerar cobrança';}
    });
  }

  async function render(){
    el.innerHTML='<div style="padding:24px;text-align:center;color:var(--text-muted,#6b7280)">Carregando…</div>';
    let raw=[];
    try{raw=await fetchAll('lancamentos');}
    catch(e){el.innerHTML='<div style="padding:24px;color:#f87171">Erro: '+esc(e.message)+'</div>';return;}
    const todos=unpack('lancamentos',raw);todosCache=todos;
    const doMes=todos.filter(l=>l.tipo==='receita'&&l.mes_ref===mesKey()&&!l.inativo).sort((a,b)=>String(a.data_vencimento).localeCompare(String(b.data_vencimento)));
    const hoje=new Date().toISOString().slice(0,10);
    const pend=doMes.filter(l=>l.status!=='pago'&&l.status!=='recebido');
    const receb=doMes.filter(l=>l.status==='pago'||l.status==='recebido');
    const soma=a=>a.reduce((s,l)=>s+(Number(l.valor)||0),0);
    // ── Agrupa por cliente: nome como cabeçalho, serviços embaixo ──
    const grupos=new Map();
    for(const l of doMes){
      const key=l.clienteId||l.cliente||l.clienteNome||('sem-'+(l.descricao||l.id));
      if(!grupos.has(key))grupos.set(key,{nome:l.cliente||l.clienteNome||l.descricao||'—',itens:[]});
      grupos.get(key).itens.push(l);
    }
    const itemRow=l=>{
      const ok=l.status==='pago'||l.status==='recebido';
      const atrasado=!ok&&l.data_vencimento&&l.data_vencimento<hoje;
      const cor=ok?'#059669':atrasado?'#dc2626':'#d97706';
      const lbl=ok?'Recebido':atrasado?'Atrasado':'Pendente';
      const rotulo=l.plano||String(l.descricao||'').split(' — ')[0]||'—';
      return `<div style="display:flex;align-items:center;gap:10px;padding:9px 14px 9px 22px;border-top:1px solid var(--border,#e5e7eb)">
        <div style="width:6px;height:30px;border-radius:3px;background:${cor};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(rotulo)}${l.negocio?` <span style=\"font-weight:500;color:var(--text-muted,#9ca3af)\">(${esc(l.negocio)})</span>`:''}${l.ocultarPortal?' <span title=\"Oculta no portal\">🙈</span>':''}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af)">venc. ${dtBr(l.data_vencimento)}${l.parcela?' · '+esc(l.parcela):''} · <span style="color:${cor};font-weight:600">${lbl}</span></div>
        </div>
        <div style="font-size:13px;font-weight:700;color:${cor}">${fmt(l.valor)}</div>
        ${ok?`<button class="cr-undo" data-id="${l.id}" title="Desfazer" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:13px;cursor:pointer;padding:6px 8px;color:var(--text-muted,#6b7280)">↩</button>`
            :`<button class="cr-ok" data-id="${l.id}" title="Marcar recebido" style="background:#05966915;border:1px solid #05966944;border-radius:8px;font-size:14px;cursor:pointer;padding:6px 10px;color:#059669;font-weight:700">✓</button>`}
        <button class="cr-menu" data-id="${l.id}" title="Mais opções" style="background:none;border:none;font-size:19px;cursor:pointer;color:var(--text-muted,#9ca3af);padding:4px 2px;line-height:1">⋮</button>
      </div>`;
    };
    const rows=[...grupos.values()].map(g=>{
      const totPend=g.itens.filter(l=>l.status!=='pago'&&l.status!=='recebido').reduce((s,l)=>s+(Number(l.valor)||0),0);
      const temAglut=g.itens.some(l=>l.aglutinado&&l.status!=='pago'&&l.status!=='recebido');
      const podeAglut=g.itens.filter(l=>l.status!=='pago'&&l.status!=='recebido').length>1;
      return `<div style="background:var(--bg-card,#fff);border-radius:14px;margin:10px 12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <div class="cr-toggle" data-key="${esc(g.itens[0].clienteId||g.nome)}" title="${temAglut?'Clique para expandir as cobranças':'Clique para aglutinar em uma fatura única'}" style="display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer">
          <span style="font-size:16px">👤</span>
          <div style="flex:1;font-size:14px;font-weight:700;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.nome)} <span style="font-size:11px;font-weight:500;color:#6366f1">${temAglut?'▸ expandir':podeAglut?'▾ aglutinar':''}</span></div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af)">${g.itens.length} cobrança${g.itens.length>1?'s':''}${totPend>0?` · <b style=\"color:#d97706\">${fmt(totPend)} em aberto</b>`:''}</div>
        </div>
        ${g.itens.map(itemRow).join('')}
      </div>`;
    }).join('');
    el.innerHTML=`
      <style>
        .cl-lbl{font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.04em}
        .cl-inp{width:100%;border:1.5px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;font-size:15px;color:var(--text,#111);background:rgba(128,128,128,.1);box-sizing:border-box}
        .cl-inp:focus{outline:none;border-color:#059669}
      </style>
      <div style="display:flex;align-items:center;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb);gap:8px">
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:var(--text,#111)">Contas a Receber</div>
          <div style="font-size:12px;color:var(--text-muted,#6b7280)">A receber: <b style="color:#d97706">${fmt(soma(pend))}</b> · Recebido: <b style="color:#059669">${fmt(soma(receb))}</b></div>
        </div>
        <button id="cr-novo" style="background:#059669;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer">+ Cobrança</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
        <button id="cr-prev" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">‹</button>
        <span style="font-size:15px;font-weight:600;color:var(--text,#111)">${W2[nav.mes]} ${nav.ano}</span>
        <button id="cr-next" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">›</button>
      </div>
      <div style="background:var(--bg,#f4f5f7);padding-bottom:80px">
        ${rows||'<div style="padding:40px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px">Nenhuma cobrança neste mês.<br><br>Toque em <b>+ Cobrança</b>.</div>'}
      </div>`;
    el.querySelector('#cr-prev').addEventListener('click',()=>{nav.mes--;if(nav.mes<0){nav.mes=11;nav.ano--;}render();});
    el.querySelector('#cr-next').addEventListener('click',()=>{nav.mes++;if(nav.mes>11){nav.mes=0;nav.ano++;}render();});
    el.querySelector('#cr-novo').addEventListener('click',()=>formCobranca());
    el.querySelectorAll('.cr-toggle').forEach(b=>b.addEventListener('click',async()=>{
      const key=b.dataset.key;
      const grupo=[...grupos.values()].find(g=>String(g.itens[0].clienteId||g.nome)===key);
      if(!grupo)return;
      const merged=grupo.itens.find(l=>l.aglutinado&&l.status!=='pago'&&l.status!=='recebido');
      try{
        if(merged){
          // ── Expandir: restaura as originais e remove a fatura única ──
          const orig=todosCache.filter(x=>x.aglutinadoEm===merged.id);
          for(const x of orig){
            const {id,...d}=x;
            delete d.inativo;delete d.aglutinadoEm;
            const {error}=await sb.from('lancamentos').update({dados:d,updated_at:new Date().toISOString()}).eq('id',x.id).eq('user_id',uid);
            if(error)throw error;
          }
          const {error:eDel}=await sb.from('lancamentos').delete().eq('id',merged.id).eq('user_id',uid);
          if(eDel)throw eDel;
          toast.ok('Expandido: '+orig.length+' cobranças separadas de volta');render();
          return;
        }
        const pend=grupo.itens.filter(l=>l.status!=='pago'&&l.status!=='recebido');
        if(pend.length<2)return;
        // ── Aglutinar ──
        const total=pend.reduce((s,l)=>s+(Number(l.valor)||0),0);
        const rotulos=pend.map(l=>l.plano||String(l.descricao||'').split(' — ')[0]);
        const base=pend[0];
        const venc=pend.map(l=>l.data_vencimento).sort()[0];
        const novoId=crypto.randomUUID();
        const dados={tipo:'receita',status:'pendente',
          clienteId:base.clienteId||null,cliente:base.cliente||grupo.nome,clienteNome:base.clienteNome||grupo.nome,
          descricao:rotulos.join(' + ')+' — '+grupo.nome,valor:total,
          data_vencimento:venc,mes_ref:venc.slice(0,7),categoria:'Mensalidade',
          negocio:base.negocio||null,aglutinado:true,
          itens:pend.map(l=>({plano:l.plano||l.descricao,valor:l.valor,negocio:l.negocio||null}))};
        const {error:e1}=await sb.from('lancamentos').insert({id:novoId,user_id:uid,dados,updated_at:new Date().toISOString()});
        if(e1)throw e1;
        for(const l of pend){
          const {id,...d}=l;
          const {error:e2}=await sb.from('lancamentos').update({dados:{...d,inativo:true,aglutinadoEm:novoId},updated_at:new Date().toISOString()}).eq('id',l.id).eq('user_id',uid);
          if(e2)throw e2;
        }
        toast.ok('Aglutinado em uma fatura de '+fmt(total)+' ✅');render();
      }catch(err){toast.err('Erro: '+err.message);}
    }));
    el.querySelectorAll('.cr-ok').forEach(b=>b.addEventListener('click',async()=>{
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;b.disabled=true;
      const {id,...dados}=l;
      try{await marcar(l.id,dados,'pago');toast.ok('Recebido! ✅');render();}catch(err){toast.err('Erro: '+err.message);b.disabled=false;}
    }));
    el.querySelectorAll('.cr-undo').forEach(b=>b.addEventListener('click',async()=>{
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;b.disabled=true;
      const {id,...dados}=l;
      try{await marcar(l.id,dados,'pendente');toast.ok('Voltou para pendente');render();}catch(err){toast.err('Erro: '+err.message);b.disabled=false;}
    }));
    el.querySelectorAll('.cr-menu').forEach(b=>b.addEventListener('click',e=>{
      e.stopPropagation();
      document.querySelectorAll('.cr-pop').forEach(p=>p.remove());
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;
      const r=b.getBoundingClientRect();
      const pop=document.createElement('div');
      pop.className='cr-pop';
      pop.style.cssText='position:fixed;z-index:3500;top:'+Math.min(r.bottom+4,window.innerHeight-160)+'px;right:14px;background:var(--bg-card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.3);overflow:hidden;min-width:220px';
      pop.innerHTML='<div class="cr-pop-i" data-a="editar" style="padding:12px 16px;font-size:14px;cursor:pointer;color:var(--text,#111)">✏️ Editar</div>'
        +'<div class="cr-pop-i" data-a="portal" style="padding:12px 16px;font-size:14px;cursor:pointer;color:var(--text,#111);border-top:1px solid var(--border,#e5e7eb)">'+(l.ocultarPortal?'👁 Mostrar no portal':'🙈 Ocultar do portal')+'</div>'
        +'<div class="cr-pop-i" data-a="del" style="padding:12px 16px;font-size:14px;cursor:pointer;color:#dc2626;border-top:1px solid var(--border,#e5e7eb)">🗑️ Excluir</div>'
        +(l.grupoRecorrencia?'<div class="cr-pop-i" data-a="delfut" style="padding:12px 16px;font-size:14px;cursor:pointer;color:#dc2626;border-top:1px solid var(--border,#e5e7eb)">🗑️ Excluir esta e futuras</div>':'');
      document.body.appendChild(pop);
      setTimeout(()=>document.addEventListener('click',()=>pop.remove(),{once:true}),0);
      pop.querySelectorAll('.cr-pop-i').forEach(it=>it.addEventListener('click',async()=>{
        pop.remove();
        const a=it.dataset.a;
        if(a==='editar')return editLanc(l);
        if(a==='portal'){
          // Vale para a série inteira: todos os lançamentos do mesmo grupo de
          // recorrência (ou só este, se for avulso)
          const alvos=l.grupoRecorrencia
            ? todosCache.filter(x=>x.grupoRecorrencia===l.grupoRecorrencia)
            : [l];
          const ocultar=!l.ocultarPortal;
          let errs=0;
          for(const x of alvos){
            const {id,...d}=x;
            const novo={...d};
            if(ocultar)novo.ocultarPortal=true;else delete novo.ocultarPortal;
            const {error}=await sb.from('lancamentos').update({dados:novo,updated_at:new Date().toISOString()}).eq('id',x.id).eq('user_id',uid);
            if(error)errs++;
          }
          if(errs)toast.err(errs+' fatura(s) falharam ao atualizar');
          else toast.ok(ocultar?alvos.length+' fatura(s) da série ocultas do portal 🙈':alvos.length+' fatura(s) da série visíveis no portal 👁');
          render();
        }
        if(a==='del'){
          if(!confirm('Excluir "'+(l.descricao||'')+'" de '+fmt(l.valor)+'?'))return;
          const {error}=await sb.from('lancamentos').delete().eq('id',l.id).eq('user_id',uid);
          if(error)toast.err('Erro: '+error.message);else{toast.ok('Excluído');render();}
        }
        if(a==='delfut'){
          const futuras=todosCache.filter(x=>x.grupoRecorrencia===l.grupoRecorrencia&&String(x.mes_ref)>=String(l.mes_ref));
          if(!confirm('Excluir '+futuras.length+' lançamento(s) — este e os futuros do mesmo grupo?'))return;
          const {error}=await sb.from('lancamentos').delete().in('id',futuras.map(x=>x.id)).eq('user_id',uid);
          if(error)toast.err('Erro: '+error.message);else{toast.ok(futuras.length+' excluídos');render();}
        }
      }));
    }));
  }

  function editLanc(l){
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px;width:100%;max-width:480px;padding:22px 20px 30px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:var(--text,#111)">✏️ Editar cobrança</span>
        <button id="cre-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="cre-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Descrição *</label><input class="cl-inp" name="descricao" required value="${String(l.descricao||'').replace(/"/g,'&quot;')}"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Valor (R$) *</label><input class="cl-inp" name="valor" type="number" step="0.01" min="0.01" required value="${l.valor??''}"></div>
          <div><label class="cl-lbl">Vencimento *</label><input class="cl-inp" name="data_v" type="date" required value="${String(l.data_vencimento||'').slice(0,10)}"></div>
        </div>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#2563eb;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Salvar alterações</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#cre-x').addEventListener('click',()=>ov.remove());
    ov.querySelector('#cre-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const dv=fd.get('data_v');
      const {id,...dados}=l;
      const novo={...dados,descricao:fd.get('descricao'),valor:parseFloat(fd.get('valor'))||0,data_vencimento:dv,mes_ref:dv.slice(0,7)};
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Salvando…';
      const {error}=await sb.from('lancamentos').update({dados:novo,updated_at:new Date().toISOString()}).eq('id',l.id).eq('user_id',uid);
      if(error){toast.err('Erro: '+error.message);btn.disabled=false;btn.textContent='Salvar alterações';}
      else{toast.ok('Alterado! ✅');ov.remove();render();}
    });
  }
  await render();
};

/* ── Contas a Pagar module inline ── */
_['pagar']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const sb=mod.j, toast=mod.t, fmt=mod.f, addM=mod.c, unpack=mod.u, fetchAll=mod.i, saveBatch=mod.d;
  const {data:{user}}=await sb.auth.getUser();
  const uid=user&&user.id;
  if(!uid){el.innerHTML='<div style="padding:24px;color:#f87171">Não autenticado.</div>';return;}
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const W2=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const now=new Date();let nav={ano:now.getFullYear(),mes:now.getMonth()};
  const mesKey=()=>nav.ano+'-'+String(nav.mes+1).padStart(2,'0');
  let todosCache=[];
  const dtBr=s=>{if(!s)return'—';const[a,m,d]=String(s).slice(0,10).split('-');return d+'/'+m;};

  async function marcar(id,dados,novoStatus){
    const d={...dados,status:novoStatus};
    if(novoStatus==='pago')d.dataPagamento=new Date().toISOString().slice(0,10);else delete d.dataPagamento;
    const {error}=await sb.from('lancamentos').update({dados:d,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',uid);
    if(error)throw error;
  }

  function formDespesa(){
    const hoje=new Date().toISOString().slice(0,10);
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px;width:100%;max-width:480px;padding:22px 20px 30px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:#dc2626">📤 Nova conta a pagar</span>
        <button id="cp-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="cp-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Descrição *</label><input class="cl-inp" name="descricao" required placeholder="Ex: Energia elétrica"></div>
        <div><label class="cl-lbl">Categoria (opcional)</label><input class="cl-inp" name="categoria" placeholder="Ex: Infraestrutura"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Valor (R$) *</label><input class="cl-inp" name="valor" type="number" step="0.01" min="0.01" required placeholder="0,00"></div>
          <div><label class="cl-lbl">Vencimento *</label><input class="cl-inp" name="data_v" type="date" value="${hoje}" required></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Recorrência</label>
            <select class="cl-inp" name="recorrencia" id="cp-rec">
              <option value="unica">Única</option>
              <option value="fixa">Fixa (mensal, sem prazo)</option>
              <option value="mensal">Mensal</option>
              <option value="bimestral">Bimestral</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>
          <div id="cp-repwrap" style="display:none"><label class="cl-lbl">Repetições</label>
            <input class="cl-inp" name="repeticoes" type="number" min="2" max="60" value="12">
          </div>
        </div>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#dc2626;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Salvar conta</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#cp-x').addEventListener('click',()=>ov.remove());
    const selRec=ov.querySelector('#cp-rec'),repW=ov.querySelector('#cp-repwrap');
    selRec.addEventListener('change',()=>{repW.style.display=(selRec.value==='unica'||selRec.value==='fixa')?'none':'block';});
    ov.querySelector('#cp-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const dv=fd.get('data_v'),rec=fd.get('recorrencia');
      const nrep=rec==='unica'?1:rec==='fixa'?24:Math.min(Math.max(parseInt(fd.get('repeticoes'))||12,2),60);
      const step=rec==='anual'?12:rec==='semestral'?6:rec==='trimestral'?3:rec==='bimestral'?2:1;
      const grupo=nrep>1?crypto.randomUUID():null;
      const entries=[];
      for(let i=0;i<nrep;i++){
        const dvi=i===0?dv:addM(dv,i*step);
        entries.push({id:crypto.randomUUID(),tipo:'despesa',status:'pendente',
          descricao:fd.get('descricao'),valor:parseFloat(fd.get('valor'))||0,
          data_vencimento:dvi,mes_ref:dvi.slice(0,7),categoria:fd.get('categoria')||null,
          ...(grupo?{recorrencia:rec,grupoRecorrencia:grupo,parcela:(i+1)+'/'+nrep}:{})});
      }
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Salvando…';
      try{await saveBatch('lancamentos',entries);toast.ok(nrep>1?nrep+' contas geradas! ✅':'Conta salva! ✅');ov.remove();render();}
      catch(err){toast.err('Erro: '+err.message);btn.disabled=false;btn.textContent='Salvar conta';}
    });
  }

  async function render(){
    el.innerHTML='<div style="padding:24px;text-align:center;color:var(--text-muted,#6b7280)">Carregando…</div>';
    let raw=[];
    try{raw=await fetchAll('lancamentos');}
    catch(e){el.innerHTML='<div style="padding:24px;color:#f87171">Erro: '+esc(e.message)+'</div>';return;}
    const todos=unpack('lancamentos',raw);todosCache=todos;
    const doMes=todos.filter(l=>l.tipo==='despesa'&&l.mes_ref===mesKey()).sort((a,b)=>String(a.data_vencimento).localeCompare(String(b.data_vencimento)));
    const hoje=new Date().toISOString().slice(0,10);
    const pend=doMes.filter(l=>l.status!=='pago');
    const pagas=doMes.filter(l=>l.status==='pago');
    const soma=a=>a.reduce((s,l)=>s+(Number(l.valor)||0),0);
    const rows=doMes.map(l=>{
      const ok=l.status==='pago';
      const atrasado=!ok&&l.data_vencimento&&l.data_vencimento<hoje;
      const cor=ok?'#059669':atrasado?'#dc2626':'#d97706';
      const lbl=ok?'Pago':atrasado?'Atrasado':'Pendente';
      return `<div style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--border,#e5e7eb)">
        <div style="width:8px;height:36px;border-radius:4px;background:${cor};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l.descricao||'—')}</div>
          <div style="font-size:11px;color:var(--text-muted,#9ca3af)">venc. ${dtBr(l.data_vencimento)}${l.parcela?' · '+esc(l.parcela):''}${l.categoria?' · '+esc(l.categoria):''} · <span style="color:${cor};font-weight:600">${lbl}</span></div>
        </div>
        <div style="font-size:14px;font-weight:700;color:${cor}">${fmt(l.valor)}</div>
        ${ok?`<button class="cp-undo" data-id="${l.id}" title="Desfazer" style="background:none;border:1px solid var(--border,#e5e7eb);border-radius:8px;font-size:13px;cursor:pointer;padding:6px 8px;color:var(--text-muted,#6b7280)">↩</button>`
            :`<button class="cp-ok" data-id="${l.id}" title="Marcar pago" style="background:#05966915;border:1px solid #05966944;border-radius:8px;font-size:14px;cursor:pointer;padding:6px 10px;color:#059669;font-weight:700">✓</button>`}
        <button class="cp-menu" data-id="${l.id}" title="Mais opções" style="background:none;border:none;font-size:19px;cursor:pointer;color:var(--text-muted,#9ca3af);padding:4px 2px;line-height:1">⋮</button>
      </div>`;
    }).join('');
    el.innerHTML=`
      <style>
        .cl-lbl{font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.04em}
        .cl-inp{width:100%;border:1.5px solid var(--border,#e5e7eb);border-radius:10px;padding:10px 12px;font-size:15px;color:var(--text,#111);background:rgba(128,128,128,.1);box-sizing:border-box}
        .cl-inp:focus{outline:none;border-color:#dc2626}
      </style>
      <div style="display:flex;align-items:center;padding:12px 16px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb);gap:8px">
        <div style="flex:1">
          <div style="font-size:18px;font-weight:700;color:var(--text,#111)">Contas a Pagar</div>
          <div style="font-size:12px;color:var(--text-muted,#6b7280)">A pagar: <b style="color:#d97706">${fmt(soma(pend))}</b> · Pago: <b style="color:#059669">${fmt(soma(pagas))}</b></div>
        </div>
        <button id="cp-novo" style="background:#dc2626;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:14px;font-weight:700;cursor:pointer">+ Conta</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 20px;background:var(--bg-card,#fff);border-bottom:1px solid var(--border,#e5e7eb)">
        <button id="cp-prev" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">‹</button>
        <span style="font-size:15px;font-weight:600;color:var(--text,#111)">${W2[nav.mes]} ${nav.ano}</span>
        <button id="cp-next" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">›</button>
      </div>
      <div style="background:var(--bg,#f4f5f7);padding-bottom:80px">
        ${rows||'<div style="padding:40px;text-align:center;color:var(--text-muted,#9ca3af);font-size:14px">Nenhuma conta neste mês.<br><br>Toque em <b>+ Conta</b>.</div>'}
      </div>`;
    el.querySelector('#cp-prev').addEventListener('click',()=>{nav.mes--;if(nav.mes<0){nav.mes=11;nav.ano--;}render();});
    el.querySelector('#cp-next').addEventListener('click',()=>{nav.mes++;if(nav.mes>11){nav.mes=0;nav.ano++;}render();});
    el.querySelector('#cp-novo').addEventListener('click',()=>formDespesa());
    el.querySelectorAll('.cp-ok').forEach(b=>b.addEventListener('click',async()=>{
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;b.disabled=true;
      const {id,...dados}=l;
      try{await marcar(l.id,dados,'pago');toast.ok('Pago! ✅');render();}catch(err){toast.err('Erro: '+err.message);b.disabled=false;}
    }));
    el.querySelectorAll('.cp-undo').forEach(b=>b.addEventListener('click',async()=>{
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;b.disabled=true;
      const {id,...dados}=l;
      try{await marcar(l.id,dados,'pendente');toast.ok('Voltou para pendente');render();}catch(err){toast.err('Erro: '+err.message);b.disabled=false;}
    }));
    el.querySelectorAll('.cp-menu').forEach(b=>b.addEventListener('click',e=>{
      e.stopPropagation();
      document.querySelectorAll('.cp-pop').forEach(p=>p.remove());
      const l=doMes.find(x=>x.id===b.dataset.id);if(!l)return;
      const r=b.getBoundingClientRect();
      const pop=document.createElement('div');
      pop.className='cp-pop';
      pop.style.cssText='position:fixed;z-index:3500;top:'+Math.min(r.bottom+4,window.innerHeight-160)+'px;right:14px;background:var(--bg-card,#fff);border:1px solid var(--border,#e5e7eb);border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.3);overflow:hidden;min-width:220px';
      pop.innerHTML='<div class="cp-pop-i" data-a="editar" style="padding:12px 16px;font-size:14px;cursor:pointer;color:var(--text,#111)">✏️ Editar</div>'
        +'<div class="cp-pop-i" data-a="del" style="padding:12px 16px;font-size:14px;cursor:pointer;color:#dc2626;border-top:1px solid var(--border,#e5e7eb)">🗑️ Excluir</div>'
        +(l.grupoRecorrencia?'<div class="cp-pop-i" data-a="delfut" style="padding:12px 16px;font-size:14px;cursor:pointer;color:#dc2626;border-top:1px solid var(--border,#e5e7eb)">🗑️ Excluir esta e futuras</div>':'');
      document.body.appendChild(pop);
      setTimeout(()=>document.addEventListener('click',()=>pop.remove(),{once:true}),0);
      pop.querySelectorAll('.cp-pop-i').forEach(it=>it.addEventListener('click',async()=>{
        pop.remove();
        const a=it.dataset.a;
        if(a==='editar')return editLanc(l);
        if(a==='del'){
          if(!confirm('Excluir "'+(l.descricao||'')+'" de '+fmt(l.valor)+'?'))return;
          const {error}=await sb.from('lancamentos').delete().eq('id',l.id).eq('user_id',uid);
          if(error)toast.err('Erro: '+error.message);else{toast.ok('Excluído');render();}
        }
        if(a==='delfut'){
          const futuras=todosCache.filter(x=>x.grupoRecorrencia===l.grupoRecorrencia&&String(x.mes_ref)>=String(l.mes_ref));
          if(!confirm('Excluir '+futuras.length+' lançamento(s) — este e os futuros do mesmo grupo?'))return;
          const {error}=await sb.from('lancamentos').delete().in('id',futuras.map(x=>x.id)).eq('user_id',uid);
          if(error)toast.err('Erro: '+error.message);else{toast.ok(futuras.length+' excluídos');render();}
        }
      }));
    }));
  }

  function editLanc(l){
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:3000;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML=`<div style="background:var(--bg-card,#fff);border-radius:20px;width:100%;max-width:480px;padding:22px 20px 30px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="font-size:17px;font-weight:700;color:var(--text,#111)">✏️ Editar conta</span>
        <button id="cpe-x" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-muted,#6b7280)">✕</button>
      </div>
      <form id="cpe-form" style="display:flex;flex-direction:column;gap:11px">
        <div><label class="cl-lbl">Descrição *</label><input class="cl-inp" name="descricao" required value="${String(l.descricao||'').replace(/"/g,'&quot;')}"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="cl-lbl">Valor (R$) *</label><input class="cl-inp" name="valor" type="number" step="0.01" min="0.01" required value="${l.valor??''}"></div>
          <div><label class="cl-lbl">Vencimento *</label><input class="cl-inp" name="data_v" type="date" required value="${String(l.data_vencimento||'').slice(0,10)}"></div>
        </div>
        <button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;background:#2563eb;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px">Salvar alterações</button>
      </form>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelector('#cpe-x').addEventListener('click',()=>ov.remove());
    ov.querySelector('#cpe-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const fd=new FormData(e.target);
      const dv=fd.get('data_v');
      const {id,...dados}=l;
      const novo={...dados,descricao:fd.get('descricao'),valor:parseFloat(fd.get('valor'))||0,data_vencimento:dv,mes_ref:dv.slice(0,7)};
      const btn=e.target.querySelector('[type=submit]');btn.disabled=true;btn.textContent='Salvando…';
      const {error}=await sb.from('lancamentos').update({dados:novo,updated_at:new Date().toISOString()}).eq('id',l.id).eq('user_id',uid);
      if(error){toast.err('Erro: '+error.message);btn.disabled=false;btn.textContent='Salvar alterações';}
      else{toast.ok('Alterado! ✅');ov.remove();render();}
    });
  }
  await render();
};
;window.getVisibleModules=P;const b=`
  <div style="
    display:flex;align-items:center;justify-content:center;
    height:100%;min-height:200px;gap:14px;flex-direction:column;
    color:#64748b;font-size:13px;font-family:Inter,sans-serif;
    background:#f0f4f8;
  ">
    <div style="
      width:36px;height:36px;border-radius:50%;
      border:2px solid rgba(37,99,235,.15);border-top-color:#2563eb;
      animation:spin .75s linear infinite;
    "></div>
    Carregando…
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  </div>
`;window.addEventListener("gt:loadModule",({detail:{view:e,contentEl:r}})=>{r.innerHTML=b,(_[e]??_.dashboard)(r).catch(o=>{console.error("[gt:loadModule]",e,o),r.innerHTML=`
      <div style="padding:24px;color:#f87171;font-size:14px;font-family:Inter,sans-serif;">
        Erro ao carregar ${e}: ${o.message}
      </div>
    `})});var v;(v=document.getElementById("btn-logout"))==null||v.addEventListener("click",async()=>{const{logout:e}=await a(async()=>{const{logout:r}=await import("./auth-8dcbKywj.js");return{logout:r}},__vite__mapDeps([7,0,1]));await e(),window.location.href="/painel/"});h(async e=>{var s,d;if(!e){window.location.href="/painel/";return}const r=await L(e);if(!r)return;const t=r.nome||((s=e.email)==null?void 0:s.split("@")[0])||"Gestor",o=document.getElementById("tb-avatar"),c=document.getElementById("tb-username"),l=document.getElementById("greeting-name");o&&(o.textContent=(t[0]??"U").toUpperCase()),c&&(c.textContent=t),l&&(l.textContent=t),(d=document.getElementById("auth-screen"))==null||d.remove();const i=document.getElementById("topbar"),n=document.getElementById("main-screen");i&&(i.style.display="flex"),typeof window.openModule=="function"&&window.openModule("dashboard","Resumo","⊞","#3FD68E")});export{I as P,a as _};
