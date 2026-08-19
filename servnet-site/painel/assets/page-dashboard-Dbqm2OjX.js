import{c as H}from"./supabase-DthfXWp1.js";const G="https://lkymiclirksgqkeiglyw.supabase.co",U="sb_publishable_0peTquB1iqmsYTBMLwH2JA_eOwz2yTM",mt="2.4.9",xt="GrupoTom",O=new Set(["contas","categorias","negocios"]),V=100,W=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],x=H(G,U,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),u={},$={};function L(t){($[t]||new Set).forEach(e=>{try{e(u[t])}catch(o){console.error("[store notify]",t,o)}})}const N={get(t){return u[t]},set(t,e){u[t]=e,L(t)},patch(t,e,o){const a=Array.isArray(u[t])?u[t]:[],n=a.findIndex(r=>r.id===e);n>=0?a[n]={...a[n],...o}:a.push({id:e,...o}),u[t]=a,L(t)},remove(t,e){const o=Array.isArray(u[t])?u[t]:[];u[t]=o.filter(a=>a.id!==e),L(t)},subscribe(t,e){return $[t]||($[t]=new Set),$[t].add(e),u[t]!==void 0&&e(u[t]),()=>this.unsubscribe(t,e)},unsubscribe(t,e){var o;(o=$[t])==null||o.delete(e)}},h={view:"dashboard",user:null,mesNav:{ano:new Date().getFullYear(),mes:new Date().getMonth()}};let y=null;function J(){return y||(y=document.createElement("div"),y.id="toast-container",Object.assign(y.style,{position:"fixed",bottom:"72px",left:"50%",transform:"translateX(-50%)",zIndex:"9999",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",pointerEvents:"none",width:"min(90vw, 420px)"}),document.body.appendChild(y)),y}const K={ok:"✅",err:"❌",info:"ℹ️",warn:"⚠️"},I={ok:{bg:"#d1fae5",border:"#059669",text:"#065f46"},err:{bg:"#fee2e2",border:"#dc2626",text:"#7f1d1d"},info:{bg:"#e0f2fe",border:"#0284c7",text:"#0c4a6e"},warn:{bg:"#fef9c3",border:"#ca8a04",text:"#713f12"}};function _(t,e,o=3500){const a=I[t]||I.info,n=document.createElement("div");Object.assign(n.style,{background:a.bg,border:`1px solid ${a.border}`,color:a.text,padding:"10px 16px",borderRadius:"10px",fontSize:"14px",fontWeight:"500",boxShadow:"0 4px 16px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:"8px",pointerEvents:"auto",cursor:"pointer",maxWidth:"100%",opacity:"0",transition:"opacity .2s ease, transform .2s ease",transform:"translateY(8px)"}),n.innerHTML=`<span>${K[t]}</span><span>${e}</span>`,J().appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"});const r=()=>{n.style.opacity="0",n.style.transform="translateY(8px)",setTimeout(()=>n.remove(),220)},i=setTimeout(r,o);n.addEventListener("click",()=>{clearTimeout(i),r()})}const X={ok:(t,e)=>_("ok",t,e),err:(t,e)=>_("err",t,e??5e3),info:(t,e)=>_("info",t,e),warn:(t,e)=>_("warn",t,e)};async function S(){var e;const{data:t}=await x.auth.getUser();return((e=t.user)==null?void 0:e.id)??null}async function Z(t,e){const o=await S();if(!o)throw new Error("Não autenticado");const{id:a,...n}=e,i=O.has(t)?{id:a,user_id:o,...n,updated_at:new Date().toISOString()}:{id:a,user_id:o,dados:n,updated_at:new Date().toISOString()},{error:d}=await x.from(t).upsert(i,{onConflict:"id"});if(d)throw d}async function Q(t,e){if(!e.length)return;const o=await S();if(!o)throw new Error("Não autenticado");const a=O.has(t),n=e.map(({id:i,...d})=>a?{id:i,user_id:o,...d,updated_at:new Date().toISOString()}:{id:i,user_id:o,dados:d,updated_at:new Date().toISOString()}),{error:r}=await x.from(t).upsert(n,{onConflict:"id"});if(r)throw r}async function tt(t,e){const o=await S();if(!o)throw new Error("Não autenticado");const{error:a}=await x.from(t).delete().eq("id",e).eq("user_id",o);if(a)throw a}async function P(t,e="*",o={}){const a=await S();if(!a)throw new Error("Não autenticado");const n=o.limit??V;let r=x.from(t).select(e).eq("user_id",a).order("id").limit(n+1);if(o.cursor&&(r=r.gt("id",o.cursor)),o.filtros)for(const[b,g]of Object.entries(o.filtros))r=r.eq(b,g);o.orFiltro&&(r=r.or(o.orFiltro));const{data:i,error:d}=await r;if(d)throw d;const s=i.length>n,c=s?i.slice(0,n):i,f=c.length?c[c.length-1].id:null;return{items:c,hasMore:s,lastId:f}}async function j(t,e="*"){const o=await S();if(!o)throw new Error("Não autenticado");const a=5e3,{count:n,error:r}=await x.from(t).select("id",{count:"exact",head:!0}).eq("user_id",o);if(r)throw r;const i=n??0;let d=[],s=0;for(;d.length<i;){const{data:c,error:f}=await x.from(t).select(e).eq("user_id",o).order("id").range(s,s+a-1);if(f)throw f;if(!(c!=null&&c.length))break;d=d.concat(c),s+=c.length}if(d.length<i)throw new Error(`Carga incompleta de ${t}: ${d.length}/${i}`);return d}function T(t,e){return O.has(t)?e.map(({user_id:o,updated_at:a,...n})=>n):e.map(o=>{const a=o.dados??{},n=a.data_vencimento??a.data??null,r=a.mes_ref??(n?n.slice(0,7):null);return{id:o.id,...a,tipo:a.tipo?a.tipo.toLowerCase():a.tipo,status:a.status?a.status.toLowerCase():a.status,data_vencimento:n,mes_ref:r}})}const bt=Object.freeze(Object.defineProperty({__proto__:null,deleteOne:tt,fetchAll:j,fetchPage:P,saveBatch:Q,saveOne:Z,unpack:T},Symbol.toStringTag,{value:"Module"})),et=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});function w(t){return t==null||t===""?"R$ 0,00":et.format(Number(t))}function at(t){if(!t)return"";const e=typeof t=="string"?t.slice(0,10):t.toISOString().slice(0,10),[o,a,n]=e.split("-");return`${n}/${a}/${o}`}function ht(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}function ot(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function yt(t,e){const[o,a,n]=t.slice(0,10).split("-").map(Number),r=new Date(o,a-1+e,1),i=new Date(r.getFullYear(),r.getMonth()+1,0).getDate(),d=Math.min(n,i);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}const z=new Set,nt={ir(t,e={}){h.view=t,h.params=e,N.set("_route",{view:t,params:e}),z.forEach(o=>{try{o(t,e)}catch(a){console.error("[router]",a)}})},atual(){return h.view},params(){return h.params??{}},onMuda(t){z.add(t),t(h.view,h.params??{})},offMuda(t){z.delete(t)}};function rt(t){t.innerHTML=`
    <div style="padding:20px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 20px;">Dashboard</h1>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
        ${Array(4).fill('<div style="height:88px;background:var(--bg-card,#f3f4f6);border-radius:12px;animation:pulse 1.4s infinite;"></div>').join("")}
      </div>
      <div style="height:220px;background:var(--bg-card,#f3f4f6);border-radius:12px;animation:pulse 1.4s infinite;margin-bottom:16px;"></div>
      <div style="height:200px;background:var(--bg-card,#f3f4f6);border-radius:12px;animation:pulse 1.4s infinite;"></div>
    </div>
    <style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}</style>
  `}function st(t,e){const o=ot(),a=t.filter(s=>s.ativa!==!1&&!s.parentId).reduce((s,c)=>s+(Number(c.saldoInicial??c.saldo)||0),0),n=e.filter(s=>(s.data_vencimento||s.data||"").slice(0,7)===o),r=n.filter(s=>s.tipo==="receita"&&s.status==="pago").reduce((s,c)=>s+(Number(c.valor)||0),0),i=n.filter(s=>s.tipo==="despesa"&&s.status==="pago").reduce((s,c)=>s+(Number(c.valor)||0),0),d=n.filter(s=>s.tipo==="despesa"&&s.status!=="pago").reduce((s,c)=>s+(Number(c.valor)||0),0);return{saldoTotal:a,receitas:r,despesas:i,apagar:d}}function v({label:t,valor:e,cor:o="var(--primary,#2563eb)",icone:a="",sub:n=""}){return`
    <div style="
      background: var(--bg-card, #fff);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      display: flex;
      flex-direction: column;
      gap: 6px;
    ">
      <div style="font-size:22px;">${a}</div>
      <div style="font-size:12px;color:var(--text-muted,#6b7280);font-weight:500;">${t}</div>
      <div style="font-size:20px;font-weight:700;color:${o};">${e}</div>
      ${n?`<div style="font-size:11px;color:var(--text-muted,#6b7280);">${n}</div>`:""}
    </div>
  `}function it(t){const e=[],o=new Date;for(let a=t-1;a>=0;a--){const n=new Date(o.getFullYear(),o.getMonth()-a,1),r=n.getFullYear(),i=n.getMonth(),d=`${r}-${String(i+1).padStart(2,"0")}`,s=W[i].slice(0,3);e.push({ano:r,mes:i,key:d,label:s})}return e}function ct(t){const e=t.filter(a=>a.tipo==="receita"&&a.status==="pago").reduce((a,n)=>a+(Number(n.valor)||0),0),o=t.filter(a=>a.tipo==="despesa"&&a.status==="pago").reduce((a,n)=>a+(Number(n.valor)||0),0);return{receitas:e,despesas:o}}function dt(t){const e=Math.max(...t.flatMap(l=>[l.receitas,l.despesas]),1),o=560,a=180,n=54,r=12,i=16,d=36,s=t.length,c=(o-n-r)/s,f=Math.min(c*.35,24),b=c*.04,g=a-i-d;function p(l){return i+g*(1-l/e)}function m(l){return g*(l/e)}const D=[.25,.5,.75,1].map(l=>({y:i+g*(1-l),label:w(e*l).replace("R$ ","").replace(",00","")})).map(({y:l,label:k})=>`
    <line x1="${n}" y1="${l}" x2="${o-r}" y2="${l}"
      stroke="var(--border,#e5e7eb)" stroke-width="1" stroke-dasharray="4 3" />
    <text x="${n-4}" y="${l+4}" text-anchor="end" font-size="9"
      fill="var(--text-muted,#9ca3af)">${k}</text>
  `).join(""),F=t.map((l,k)=>{const M=n+k*c+c/2,q=M-b/2-f,C=M+b/2,A=m(l.receitas),E=m(l.despesas),Y=p(l.receitas),B=p(l.despesas);return`
      <!-- Receita -->
      <rect x="${q}" y="${A>0?Y:i+g}" width="${f}" height="${A>0?A:0}"
        fill="#059669" rx="3" />
      <!-- Despesa -->
      <rect x="${C}" y="${E>0?B:i+g}" width="${f}" height="${E>0?E:0}"
        fill="#dc2626" rx="3" />
      <!-- Label mês -->
      <text x="${M}" y="${a-6}" text-anchor="middle" font-size="10"
        fill="var(--text-muted,#6b7280)">${l.label}</text>
    `}).join("");return`
    <div style="
      background:var(--bg-card,#fff);border-radius:12px;
      padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);
      margin-bottom:16px;
    ">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <h2 style="font-size:15px;font-weight:600;margin:0;">Receitas × Despesas — últimos 6 meses</h2>
        <div style="display:flex;gap:12px;font-size:12px;color:var(--text-muted,#6b7280);">
          <span><span style="display:inline-block;width:10px;height:10px;background:#059669;border-radius:2px;margin-right:4px;"></span>Receitas</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:#dc2626;border-radius:2px;margin-right:4px;"></span>Despesas</span>
        </div>
      </div>
      <svg viewBox="0 0 ${o} ${a}" width="100%" style="overflow:visible;display:block;">
        ${D}
        ${F}
      </svg>
    </div>
  `}function lt(t){const e=t.tipo==="receita"?"#059669":"#dc2626",o=t.tipo==="receita"?"+":"-";return`
    <div style="
      display:flex;align-items:center;gap:12px;
      padding:10px 0;border-bottom:1px solid var(--border,#f3f4f6);
    ">
      <div style="flex:1;min-width:0;">
        <div style="font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${t.descricao||"—"}
        </div>
        <div style="font-size:12px;color:var(--text-muted,#9ca3af);">${at(t.data_vencimento||t.data)}</div>
      </div>
      <div style="font-size:15px;font-weight:600;color:${e};white-space:nowrap;">
        ${o}${w(t.valor)}
      </div>
      <span style="
        font-size:11px;padding:2px 8px;border-radius:20px;
        background:${t.status==="pago"?"#d1fae5":"#fef3c7"};
        color:${t.status==="pago"?"#065f46":"#92400e"};
      ">${t.status==="pago"?"Pago":"Pendente"}</span>
    </div>
  `}function pt(t,{kpis:e,ultimos:o,dadosMeses:a,vencidos:n}){const{saldoTotal:r,receitas:i,despesas:d,apagar:s}=e;t.innerHTML=`
    <div style="padding:20px;max-width:900px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <h1 style="font-size:20px;font-weight:700;margin:0;">Dashboard</h1>
        <button data-action="ir-lancamentos" style="
          background:var(--primary,#2563eb);color:#fff;
          border:none;border-radius:8px;padding:8px 16px;
          font-size:13px;font-weight:600;cursor:pointer;
        ">+ Lançamento</button>
      </div>

      <!-- KPIs -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
        ${v({label:"Saldo Total",valor:w(r),icone:"🏦",cor:r>=0?"#059669":"#dc2626"})}
        ${v({label:"Receitas/mês",valor:w(i),icone:"📈",cor:"#059669"})}
        ${v({label:"Despesas/mês",valor:w(d),icone:"📉",cor:"#dc2626"})}
        ${v({label:"A pagar",valor:w(s),icone:"⏰",cor:s>0?"#d97706":"#059669"})}
        ${n>0?v({label:"Vencidos",valor:String(n)+" item"+(n>1?"s":""),icone:"🔴",cor:"#dc2626",sub:"Clique para ver"}):""}
      </div>

      <!-- Gráfico -->
      ${dt(a)}

      <!-- Últimos lançamentos -->
      <div style="
        background:var(--bg-card,#fff);border-radius:12px;
        padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h2 style="font-size:15px;font-weight:600;margin:0;">Últimos lançamentos</h2>
          <button data-action="ir-lancamentos" style="
            background:none;border:none;color:var(--primary,#2563eb);
            font-size:13px;cursor:pointer;font-weight:500;
          ">Ver todos →</button>
        </div>
        ${o.length?o.map(lt).join(""):'<p style="color:var(--text-muted,#9ca3af);font-size:14px;text-align:center;padding:20px 0;">Nenhum lançamento encontrado.</p>'}
      </div>
    </div>
  `,t.querySelectorAll('[data-action="ir-lancamentos"]').forEach(c=>{c.addEventListener("click",()=>nt.ir("lancamentos"))}),n>0&&(t.querySelectorAll("[data-action]").forEach(()=>{}),t.querySelectorAll('div[style*="border-radius: 12px"]'),t.querySelector('div[style*="#dc2626"]:last-of-type'))}async function ut(t){const{items:e}=await P("lancamentos","*",{limit:500,filtros:{"dados->>mes_ref":t}});return T("lancamentos",e)}async function ft(t){rt(t);try{const e=it(6),o=new Date,a=`${o.getFullYear()}-${String(o.getMonth()+1).padStart(2,"0")}-${String(o.getDate()).padStart(2,"0")}`,[n,...r]=await Promise.all([j("contas"),...e.map(p=>ut(p.key))]),i=T("contas",n),d=e.map((p,m)=>{const{receitas:R,despesas:D}=ct(r[m]);return{label:p.label,receitas:R,despesas:D}}),s=r[r.length-1],c=r.flat(),f=c.filter(p=>p.status==="pendente"&&(p.data_vencimento||"")<a&&(p.data_vencimento||"")!=="").length,b=st(i,s),g=[...c].sort((p,m)=>(m.data_vencimento||m.data||"").localeCompare(p.data_vencimento||p.data||"")).slice(0,10);N.set("contas",i),N.set("lancamentos",s),pt(t,{kpis:b,ultimos:g,dadosMeses:d,vencidos:f})}catch(e){console.error("[dashboard]",e),X.err("Erro ao carregar dashboard: "+e.message),t.innerHTML=`
      <div style="padding:20px;color:var(--text-muted,#6b7280);">
        <p>Erro ao carregar os dados. Tente recarregar a página.</p>
      </div>
    `}}const wt=Object.freeze(Object.defineProperty({__proto__:null,initDashboard:ft},Symbol.toStringTag,{value:"Module"}));export{xt as A,W as N,P as a,at as b,yt as c,Q as d,Z as e,w as f,tt as g,ht as h,j as i,x as j,h as k,mt as l,bt as m,wt as n,nt as r,N as s,X as t,T as u};
