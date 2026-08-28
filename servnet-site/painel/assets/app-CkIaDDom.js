const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/page-dashboard-Dbqm2OjXb.js","assets/supabase-DthfXWp1.js","assets/page-lancamentos-v290.js","assets/index-DIt_wP4b.js","assets/index-DCzEq81c.js","assets/index-DkL-DLyr.js","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/auth-8dcbKywj.js","assets/page-contas-ChlK-aHV.js","assets/index-BuPQoQwO.js","assets/index-UWbb780S.js","assets/page-cartoes-DpTQTZlc.js","assets/index-B4kTMWCq.js","assets/index-Bl4esJceb.js","assets/index-zwhqrKRdb.js","assets/index-vE4zJAUl.js","assets/index-efD4zShm.js","assets/index-atYHllxsb.js","assets/page-contratos-DsRvToNz.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{initAuth as h}from"./auth-8dcbKywj.js";import{j as f}from"./page-dashboard-Dbqm2OjXb.js";import"./supabase-DthfXWp1.js";const w="modulepreload",x=function(e){return"/painel/"+e},m={},a=function(r,t,o){let c=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),n=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));c=Promise.allSettled(t.map(s=>{if(s=x(s),s in m)return;m[s]=!0;const d=s.endsWith(".css"),p=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${p}`))return;const u=document.createElement("link");if(u.rel=d?"stylesheet":w,d||(u.as="script"),u.crossOrigin="",u.href=s,n&&u.setAttribute("nonce",n),document.head.appendChild(u),d)return new Promise((g,E)=>{u.addEventListener("load",g),u.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${s}`)))})}))}function l(i){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=i,window.dispatchEvent(n),!n.defaultPrevented)throw i}return c.then(i=>{for(const n of i||[])n.status==="rejected"&&l(n.reason);return r().catch(l)})},y="welsoaress@gmail.com",I={master:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!0},config:{ver:!0},usuarios:{ver:!0,criar:!0,editar:!0,excluir:!0}},admin:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!0},config:{ver:!0},usuarios:{ver:!1}},gerente:{lancamentos:{ver:!0,criar:!0,editar:!0,excluir:!1},config:{ver:!1},usuarios:{ver:!1}},operador:{lancamentos:{ver:!0,criar:!0,editar:!1,excluir:!1},config:{ver:!1},usuarios:{ver:!1}},visualizador:{lancamentos:{ver:!0,criar:!1,editar:!1,excluir:!1},config:{ver:!1},usuarios:{ver:!1}}};async function L(e){const r=e.email===y;let{data:t}=await f.from("user_profiles").select("*").eq("id",e.id).single();if(r&&!t){const{data:c}=await f.from("user_profiles").insert({id:e.id,nome:"Administrador",perfil:"master",permissoes:I.master,status:!0}).select().single();t=c}if(!t)return console.warn("[rbac] Perfil não encontrado para",e.email),null;if(!r&&!t.status)return await f.auth.signOut(),window.location.href="/painel/?erro=conta-inativa",null;f.from("user_profiles").update({ultimo_acesso:new Date().toISOString()}).eq("id",e.id).then(()=>{});const o={...t,email:e.email,isMaster:r||t.perfil==="master"};return window.GT_PERFIL=o,o}function P(e){const r=window.GT_PERFIL;return r?r.isMaster?e:e.filter(t=>{var o,c,l,i;return t.view==="config"?!!((c=(o=r.permissoes)==null?void 0:o.config)!=null&&c.ver):!!((i=(l=r.permissoes)==null?void 0:l[t.view])!=null&&i.ver)}):e.filter(t=>t.view!=="usuarios")}"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(e=>{console.warn("[SW] Falha no registro:",e)})});const _={dashboard:e=>a(()=>import("./page-dashboard-Dbqm2OjXb.js").then(r=>r.n),__vite__mapDeps([0,1])).then(r=>r.initDashboard(e)),lancamentos:e=>a(()=>import("./page-lancamentos-v290.js"),__vite__mapDeps([2,0,1])).then(r=>r.initLancamentos(e)),receitas:e=>a(()=>import("./index-DIt_wP4b.js"),__vite__mapDeps([3,0,1,2])).then(r=>r.initReceitas(e)),despesas:e=>a(()=>import("./index-DCzEq81c.js"),__vite__mapDeps([4,0,1,2])).then(r=>r.initDespesas(e)),transferencias:e=>a(()=>import("./index-DkL-DLyr.js"),__vite__mapDeps([5,0,1,2,6,7])).then(r=>r.initTransferencias(e)),ajustes:e=>a(()=>import("./index-BuPQoQwO.js"),__vite__mapDeps([9,0,1,2,6,7])).then(r=>r.initAjustes(e)),categorias:e=>a(()=>import("./index-UWbb780S.js"),__vite__mapDeps([10,0,1,2])).then(r=>r.initCategorias(e)),planos:e=>a(()=>import("./index-zwhqrKRdb.js"),__vite__mapDeps([15,0,1,2])).then(r=>r.initPlanos(e)),config:e=>a(()=>import("./index-efD4zShm.js"),__vite__mapDeps([17,0,1])).then(r=>r.initConfig(e)),usuarios:e=>a(()=>import("./index-atYHllxsb.js"),__vite__mapDeps([18,0,1,6,7])).then(r=>r.initUsuarios(e))}
/* ── Contas module inline ── */
_['contas']=async function(el){
  const mod=await import('./page-dashboard-Dbqm2OjXb.js');
  const {j,T,w,ht,h,X}=mod;
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
};;window.getVisibleModules=P;const b=`
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
    `})});var v;(v=document.getElementById("btn-logout"))==null||v.addEventListener("click",async()=>{const{logout:e}=await a(async()=>{const{logout:r}=await import("./auth-8dcbKywj.js");return{logout:r}},__vite__mapDeps([7,0,1]));await e(),window.location.href="/painel/"});h(async e=>{var s,d;if(!e){window.location.href="/painel/";return}const r=await L(e);if(!r)return;const t=r.nome||((s=e.email)==null?void 0:s.split("@")[0])||"Gestor",o=document.getElementById("tb-avatar"),c=document.getElementById("tb-username"),l=document.getElementById("greeting-name");o&&(o.textContent=(t[0]??"U").toUpperCase()),c&&(c.textContent=t),l&&(l.textContent=t),(d=document.getElementById("auth-screen"))==null||d.remove();const i=document.getElementById("topbar"),n=document.getElementById("main-screen");i&&(i.style.display="flex"),n&&(n.style.display="flex"),typeof window.renderGrid=="function"&&window.renderGrid()});export{I as P,a as _};
