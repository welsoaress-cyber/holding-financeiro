import{c as H}from"./supabase-DthfXWp1.js";
const G="https://lkymiclirksgqkeiglyw.supabase.co",U="sb_publishable_0peTquB1iqmsYTBMLwH2JA_eOwz2yTM",mt="2.9.64",xt="GrupoTom",O=new Set(["contas","categorias","negocios"]),V=100,W=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],x=H(G,U,{auth:{persistSession:!0,autoRefreshToken:!0,detectSessionInUrl:!0}}),u={},$={};window.GT_VERSION=mt;
function L(t){($[t]||new Set).forEach(e=>{try{e(u[t])}catch(o){console.error("[store notify]",t,o)}})}
const N={get(t){return u[t]},set(t,e){u[t]=e,L(t)},patch(t,e,o){const a=Array.isArray(u[t])?u[t]:[],n=a.findIndex(r=>r.id===e);n>=0?a[n]={...a[n],...o}:a.push({id:e,...o}),u[t]=a,L(t)},remove(t,e){const o=Array.isArray(u[t])?u[t]:[];u[t]=o.filter(a=>a.id!==e),L(t)},subscribe(t,e){return $[t]||($[t]=new Set),$[t].add(e),u[t]!==void 0&&e(u[t]),()=>this.unsubscribe(t,e)},unsubscribe(t,e){var o;(o=$[t])==null||o.delete(e)}};
const h={view:"dashboard",user:null,mesNav:{ano:new Date().getFullYear(),mes:new Date().getMonth()}};
let y=null;
function J(){return y||(y=document.createElement("div"),y.id="toast-container",Object.assign(y.style,{position:"fixed",bottom:"72px",left:"50%",transform:"translateX(-50%)",zIndex:"9999",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",pointerEvents:"none",width:"min(90vw, 420px)"}),document.body.appendChild(y)),y}
const K={ok:"✓",err:"✕",info:"i",warn:"!"},I={ok:{bg:"#d1fae5",border:"#059669",text:"#065f46"},err:{bg:"#fee2e2",border:"#dc2626",text:"#7f1d1d"},info:{bg:"#e0f2fe",border:"#0284c7",text:"#0c4a6e"},warn:{bg:"#fef9c3",border:"#ca8a04",text:"#713f12"}};
function _(t,e,o=3500){const a=I[t]||I.info,n=document.createElement("div");Object.assign(n.style,{background:a.bg,border:`1px solid ${a.border}`,color:a.text,padding:"10px 16px",borderRadius:"10px",fontSize:"14px",fontWeight:"500",boxShadow:"0 4px 16px rgba(0,0,0,.12)",display:"flex",alignItems:"center",gap:"8px",pointerEvents:"auto",cursor:"pointer",maxWidth:"100%",opacity:"0",transition:"opacity .2s ease, transform .2s ease",transform:"translateY(8px)"}),n.innerHTML=`<span>${K[t]}</span><span>${e}</span>`,J().appendChild(n),requestAnimationFrame(()=>{n.style.opacity="1",n.style.transform="translateY(0)"});const r=()=>{n.style.opacity="0",n.style.transform="translateY(8px)",setTimeout(()=>n.remove(),220)},i=setTimeout(r,o);n.addEventListener("click",()=>{clearTimeout(i),r()})}
const X={ok:(t,e)=>_("ok",t,e),err:(t,e)=>_("err",t,e??5e3),info:(t,e)=>_("info",t,e),warn:(t,e)=>_("warn",t,e)};
async function S(){var e;const{data:t}=await x.auth.getUser();return((e=t.user)==null?void 0:e.id)??null}
async function Z(t,e){const o=await S();if(!o)throw new Error("Não autenticado");const{id:a,...n}=e,i=O.has(t)?{id:a,user_id:o,...n,updated_at:new Date().toISOString()}:{id:a,user_id:o,dados:n,updated_at:new Date().toISOString()},{error:d}=await x.from(t).upsert(i,{onConflict:"id"});if(d)throw d}
async function Q(t,e){if(!e.length)return;const o=await S();if(!o)throw new Error("Não autenticado");const a=O.has(t),n=e.map(({id:i,...d})=>a?{id:i,user_id:o,...d,updated_at:new Date().toISOString()}:{id:i,user_id:o,dados:d,updated_at:new Date().toISOString()}),{error:r}=await x.from(t).upsert(n,{onConflict:"id"});if(r)throw r}
async function tt(t,e){const o=await S();if(!o)throw new Error("Não autenticado");const{error:a}=await x.from(t).delete().eq("id",e).eq("user_id",o);if(a)throw a}
async function P(t,e="*",o={}){const a=await S();if(!a)throw new Error("Não autenticado");const n=o.limit??V;let r=x.from(t).select(e).eq("user_id",a).order("id").limit(n+1);if(o.cursor&&(r=r.gt("id",o.cursor)),o.filtros)for(const[b,g]of Object.entries(o.filtros))r=r.eq(b,g);o.orFiltro&&(r=r.or(o.orFiltro));const{data:i,error:d}=await r;if(d)throw d;const s=i.length>n,c=s?i.slice(0,n):i,f=c.length?c[c.length-1].id:null;return{items:c,hasMore:s,lastId:f}}
async function j(t,e="*"){const o=await S();if(!o)throw new Error("Não autenticado");const a=5e3;let d=[],s=0;for(;;){const{data:c,error:f}=await x.from(t).select(e).eq("user_id",o).order("id").range(s,s+a-1);if(f)throw f;if(!(c!=null&&c.length))break;d=d.concat(c),s+=c.length;if(c.length<a)break}return d}
function T(t,e){return O.has(t)?e.map(({user_id:o,updated_at:a,...n})=>n):e.map(o=>{const a=o.dados??{},n=a.data_vencimento??a.data??null,r=a.mes_ref??(n?n.slice(0,7):null);return{id:o.id,...a,tipo:a.tipo?a.tipo.toLowerCase():a.tipo,status:a.status?a.status.toLowerCase():a.status,data_vencimento:n,mes_ref:r}})}
const bt=Object.freeze(Object.defineProperty({__proto__:null,deleteOne:tt,fetchAll:j,fetchPage:P,saveBatch:Q,saveOne:Z,unpack:T},Symbol.toStringTag,{value:"Module"}));
const et=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
function w(t){return t==null||t===""?"R$ 0,00":et.format(Number(t))}
function at(t){if(!t)return"";const e=typeof t=="string"?t.slice(0,10):t.toISOString().slice(0,10),[o,a,n]=e.split("-");return`${n}/${a}/${o}`}
function ht(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`}
function ot(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}
function yt(t,e){const[o,a,n]=t.slice(0,10).split("-").map(Number),r=new Date(o,a-1+e,1),i=new Date(r.getFullYear(),r.getMonth()+1,0).getDate(),d=Math.min(n,i);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}
const z=new Set,nt={ir(t,e={}){h.view=t,h.params=e,N.set("_route",{view:t,params:e}),z.forEach(o=>{try{o(t,e)}catch(a){console.error("[router]",a)}})},atual(){return h.view},params(){return h.params??{}},onMuda(t){z.add(t),t(h.view,h.params??{})},offMuda(t){z.delete(t)}};

/* ─── RESUMO DASHBOARD ─────────────────────────────────────────────── */

const RSM_STYLE = `
<style id="rsm-style">
:root{--rsm-rec:#059669;--rsm-desp:#dc2626;--rsm-pend:#d97706;--rsm-pri:#6366f1;--rsm-bg:var(--bg,#f4f5f7);--rsm-card:var(--bg-card,#fff);--rsm-txt:var(--text,#111827);--rsm-mut:var(--text-muted,#6b7280);--rsm-brd:var(--border,#e5e7eb)}
.rsm-wrap{padding:0 0 80px;background:var(--rsm-bg);min-height:100%}
.rsm-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 0;background:var(--rsm-card);box-shadow:0 1px 0 var(--rsm-brd)}
.rsm-nav-btn{background:none;border:none;cursor:pointer;font-size:22px;color:var(--rsm-mut);padding:4px 10px;border-radius:8px;line-height:1;transition:background .15s}
.rsm-nav-btn:hover{background:var(--rsm-bg)}
.rsm-month-title{font-size:17px;font-weight:700;color:var(--rsm-txt);text-transform:capitalize}
.rsm-metrics{display:grid;grid-template-columns:1fr 1fr 1fr;background:var(--rsm-card);padding:12px 8px 16px;gap:0;border-bottom:1px solid var(--rsm-brd)}
.rsm-metric{text-align:center;padding:0 4px}
.rsm-metric-lbl{font-size:10px;color:var(--rsm-mut);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
.rsm-metric-val{font-size:14px;font-weight:700;color:var(--rsm-txt);word-break:break-all}
.rsm-metric-val.pos{color:var(--rsm-rec)}
.rsm-metric-val.neg{color:var(--rsm-desp)}
.rsm-sec{margin:12px 12px 0;background:var(--rsm-card);border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.rsm-sec-hd{display:flex;align-items:center;justify-content:space-between;padding:13px 14px 0}
.rsm-sec-title{font-size:14px;font-weight:700;color:var(--rsm-txt)}
.rsm-sec-link{font-size:12px;color:var(--rsm-pri);cursor:pointer;text-decoration:none}
/* contas */
.rsm-conta-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--rsm-brd)}
.rsm-conta-row:last-child{border-bottom:none}
.rsm-conta-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.rsm-conta-name{flex:1;font-size:13px;font-weight:500;color:var(--rsm-txt)}
.rsm-conta-tipo{font-size:11px;color:var(--rsm-mut)}
.rsm-conta-val{font-size:14px;font-weight:700;color:var(--rsm-txt)}
.rsm-conta-val.neg{color:var(--rsm-desp)}
.rsm-conta-total{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--rsm-bg);font-weight:700;font-size:13px;color:var(--rsm-txt)}
/* discriminação */
.rsm-disc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;padding:10px 0 4px}
.rsm-disc-col{text-align:center;padding:6px 4px}
.rsm-disc-col-lbl{font-size:10px;color:var(--rsm-mut);text-transform:uppercase;letter-spacing:.03em;margin-bottom:5px}
.rsm-disc-val{font-size:15px;font-weight:700}
.rsm-disc-val.rec{color:var(--rsm-rec)}
.rsm-disc-val.desp{color:var(--rsm-desp)}
.rsm-disc-val.pend{color:var(--rsm-pend)}
.rsm-disc-divider{width:1px;background:var(--rsm-brd);margin:6px 0}
/* fluxo */
.rsm-fluxo-body{padding:12px 14px 14px}
.rsm-fluxo-bars{display:flex;gap:12px;align-items:flex-end;height:90px;padding:0 0 8px}
.rsm-fluxo-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.rsm-fluxo-bar-outer{width:100%;background:var(--rsm-bg);border-radius:6px 6px 0 0;display:flex;align-items:flex-end;height:70px}
.rsm-fluxo-bar-inner{width:100%;border-radius:6px 6px 0 0;transition:height .4s}
.rsm-fluxo-lbl{font-size:10px;color:var(--rsm-mut);text-align:center}
.rsm-fluxo-vals{display:flex;gap:0}
.rsm-fluxo-val-col{flex:1;text-align:center;padding:4px 2px 8px}
.rsm-fluxo-val-num{font-size:12px;font-weight:700}
.rsm-fluxo-val-lbl{font-size:10px;color:var(--rsm-mut);margin-top:2px}
/* economia */
.rsm-eco-body{display:flex;align-items:center;gap:16px;padding:14px}
.rsm-eco-gauge{flex-shrink:0}
.rsm-eco-info{flex:1}
.rsm-eco-pct{font-size:28px;font-weight:800;color:var(--rsm-rec);line-height:1}
.rsm-eco-sub{font-size:12px;color:var(--rsm-mut);margin-top:2px}
.rsm-eco-val{font-size:18px;font-weight:700;color:var(--rsm-txt);margin-top:8px}
.rsm-eco-detail{font-size:11px;color:var(--rsm-mut);margin-top:6px;display:flex;flex-direction:column;gap:2px}
/* carousel */
.rsm-car-wrap{overflow:hidden;position:relative}
.rsm-car-track{display:flex;transition:transform .3s ease;will-change:transform}
.rsm-car-slide{min-width:100%;padding:10px 14px 14px}
.rsm-car-dots{display:flex;justify-content:center;gap:6px;padding:8px 0 12px}
.rsm-car-dot{width:7px;height:7px;border-radius:50%;background:var(--rsm-brd);cursor:pointer;transition:background .2s}
.rsm-car-dot.active{background:var(--rsm-pri)}
.rsm-car-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.rsm-car-title{font-size:13px;font-weight:600;color:var(--rsm-txt)}
.rsm-car-badge{font-size:11px;padding:2px 8px;border-radius:20px;background:var(--rsm-pend);color:#fff;font-weight:600}
.rsm-car-empty{font-size:13px;color:var(--rsm-mut);text-align:center;padding:12px 0}
.rsm-pend-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--rsm-brd)}
.rsm-pend-row:last-child{border-bottom:none}
.rsm-pend-ico{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
.rsm-pend-info{flex:1;min-width:0}
.rsm-pend-name{font-size:13px;font-weight:500;color:var(--rsm-txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rsm-pend-date{font-size:11px;color:var(--rsm-mut)}
.rsm-pend-date.venc{color:var(--rsm-desp)}
.rsm-pend-val{font-size:13px;font-weight:700;white-space:nowrap}
/* saldo */
.rsm-saldo-body{display:flex;align-items:center;gap:14px;padding:14px}
.rsm-saldo-legend{display:flex;flex-direction:column;gap:8px;flex:1}
.rsm-saldo-leg-row{display:flex;align-items:center;gap:8px}
.rsm-saldo-dot{width:12px;height:12px;border-radius:3px;flex-shrink:0}
.rsm-saldo-leg-lbl{font-size:12px;color:var(--rsm-mut)}
.rsm-saldo-leg-val{font-size:13px;font-weight:700;color:var(--rsm-txt);margin-top:1px}
/* listas de lançamentos */
.rsm-lanc-row{display:flex;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--rsm-brd)}
.rsm-lanc-row:last-child{border-bottom:none}
.rsm-lanc-ico{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
.rsm-lanc-mid{flex:1;min-width:0}
.rsm-lanc-nome{font-size:13px;font-weight:500;color:var(--rsm-txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rsm-lanc-sub{font-size:11px;color:var(--rsm-mut)}
.rsm-lanc-sub.venc{color:var(--rsm-desp)}
.rsm-lanc-right{text-align:right;flex-shrink:0}
.rsm-lanc-val{font-size:14px;font-weight:700}
.rsm-lanc-val.rec{color:var(--rsm-rec)}
.rsm-lanc-val.desp{color:var(--rsm-desp)}
.rsm-lanc-date{font-size:11px;color:var(--rsm-mut)}
.rsm-lanc-date.venc{color:var(--rsm-desp)}
/* categoria donut */
.rsm-cat-body{display:flex;gap:12px;padding:12px 14px;align-items:center}
.rsm-cat-list{flex:1;display:flex;flex-direction:column;gap:5px}
.rsm-cat-row{display:flex;align-items:center;gap:8px}
.rsm-cat-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.rsm-cat-name{font-size:12px;color:var(--rsm-txt);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rsm-cat-pct{font-size:11px;color:var(--rsm-mut);width:28px;text-align:right}
.rsm-cat-val{font-size:12px;font-weight:600;color:var(--rsm-txt);text-align:right;min-width:64px}
/* ver mais */
.rsm-ver-mais{text-align:center;padding:10px;font-size:12px;color:var(--rsm-pri);cursor:pointer;border-top:1px solid var(--rsm-brd)}
/* configurar */
.rsm-config{text-align:center;padding:14px;font-size:13px;color:var(--rsm-mut);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
/* FAB lançamento rápido */
.rsm-fab-wrap{position:sticky;bottom:20px;display:flex;flex-direction:column;align-items:flex-end;padding:0 16px 8px;pointer-events:none;z-index:100;margin-top:8px}
.rsm-fab-main{width:52px;height:52px;border-radius:50%;background:var(--rsm-pri);color:#fff;border:none;cursor:pointer;font-size:26px;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s,background .2s;pointer-events:all;line-height:1}
.rsm-fab-main:hover{transform:scale(1.07)}
.rsm-fab-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:10px;align-items:flex-end;pointer-events:none}
.rsm-fab-opt{display:flex;align-items:center;gap:8px;cursor:pointer;pointer-events:all;opacity:0;transform:translateY(12px);transition:opacity .18s,transform .18s;background:var(--rsm-card);border-radius:30px;padding:8px 14px 8px 8px;box-shadow:0 2px 10px rgba(0,0,0,.15);border:none;font-size:13px;font-weight:600;color:var(--rsm-txt);white-space:nowrap}
.rsm-fab-opts.open .rsm-fab-opt:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.04s}
.rsm-fab-opts.open .rsm-fab-opt:nth-child(2){opacity:1;transform:translateY(0);transition-delay:0s}
.rsm-fab-dot2{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;flex-shrink:0}
/* modal quick-launch */
.rsm-ql-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;display:flex;align-items:flex-end;justify-content:center}
.rsm-ql-box{background:var(--rsm-card);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 32px;box-shadow:0 -4px 24px rgba(0,0,0,.15)}
.rsm-ql-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.rsm-ql-title{font-size:17px;font-weight:700}
.rsm-ql-close{background:none;border:none;font-size:22px;cursor:pointer;color:var(--rsm-mut);line-height:1;padding:4px}
.rsm-ql-form{display:flex;flex-direction:column;gap:12px}
.rsm-ql-lbl{font-size:11px;font-weight:700;color:var(--rsm-mut);margin-bottom:4px;display:block;text-transform:uppercase;letter-spacing:.04em}
.rsm-ql-inp{width:100%;border:1.5px solid var(--rsm-brd);border-radius:10px;padding:10px 12px;font-size:15px;color:var(--rsm-txt);background:rgba(128,128,128,.1);box-sizing:border-box;transition:border-color .15s}
.rsm-ql-inp:focus{outline:none;border-color:var(--focus-color,#6366f1)}
.rsm-ql-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rsm-ql-st-grp{display:flex;gap:8px}
.rsm-ql-st-btn{flex:1;padding:9px 4px;border-radius:10px;border:1.5px solid var(--rsm-brd);background:var(--rsm-bg);cursor:pointer;font-size:13px;font-weight:600;color:var(--rsm-mut);transition:all .15s;text-align:center}
.rsm-ql-st-btn.sel{background:var(--sel-c,#6366f1);border-color:var(--sel-c,#6366f1);color:#fff}
.rsm-ql-submit{width:100%;padding:13px;border-radius:12px;border:none;background:var(--btn-c,#6366f1);color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-top:4px;transition:filter .15s}
.rsm-ql-submit:hover{filter:brightness(1.08)}
.rsm-ql-submit:disabled{opacity:.6;cursor:not-allowed}
</style>`;

const CAT_COLORS = ["#6366f1","#059669","#dc2626","#d97706","#0284c7","#7c3aed","#db2777","#0891b2","#65a30d","#ea580c","#8b5cf6","#14b8a6"];
const CAT_ICONES = {receita:"💰",despesa:"💸",transferencia:"🔄",padrão:"📦"};

function rSum(arr, fn){ return arr.reduce((a,b)=>a+(fn?Number(fn(b)||0):Number(b||0)),0); }
function pct(v,t){ return t===0?0:Math.round(v/t*100); }

function donutSVG(segs, size=96, centerLabel=""){
  const total = segs.reduce((a,s)=>a+(s.val||0),0)||1;
  const r=size*0.34, circ=2*Math.PI*r, cx=size/2, cy=size/2, sw=size*0.18;
  const valid=segs.filter(s=>s.val>0);
  let cum=0;
  const arcs = valid.length ? valid.map(seg=>{
    const dl=seg.val/total*circ, off=circ*0.25-cum;
    cum+=dl;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.cor}" stroke-width="${sw}" stroke-dasharray="${dl.toFixed(2)} ${(circ-dl).toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/>`;
  }).join('') : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--rsm-brd)" stroke-width="${sw}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="overflow:visible;flex-shrink:0">
    ${arcs}
    ${centerLabel?`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${size*0.15}" font-weight="700" fill="var(--rsm-txt)">${centerLabel}</text>`:""}
  </svg>`;
}

function gaugeSVG(pctVal, size=90){
  const r=size*0.36, circ=2*Math.PI*r, cx=size/2, cy=size/2, sw=size*0.14;
  const p=Math.max(0,Math.min(pctVal/100,1));
  const dl=p*circ;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--rsm-brd)" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--rsm-rec)" stroke-width="${sw}"
      stroke-dasharray="${dl.toFixed(2)} ${(circ-dl).toFixed(2)}" stroke-dashoffset="${(circ*0.25).toFixed(2)}" stroke-linecap="round"/>
  </svg>`;
}

function renderContasSection(contas){
  const ativas = contas.filter(c=>c.ativa!==false && !c.parentId);
  if(!ativas.length) return `<div class="rsm-sec"><div class="rsm-sec-hd"><span class="rsm-sec-title">Contas</span></div><p style="padding:14px;font-size:13px;color:var(--rsm-mut)">Nenhuma conta cadastrada.</p></div>`;
  const total = rSum(ativas, c=>c.saldo??c.saldoInicial??0);
  const paleta = ["#6366f1","#059669","#0284c7","#d97706","#dc2626","#7c3aed","#0891b2","#65a30d"];
  const rows = ativas.map((c,i)=>{
    const saldo=Number(c.saldo??c.saldoInicial??0);
    const cor = c.cor||paleta[i%paleta.length];
    const tipo = c.tipo||"conta";
    return `<div class="rsm-conta-row">
      <div class="rsm-conta-dot" style="background:${cor}"></div>
      <div style="flex:1;min-width:0"><div class="rsm-conta-name">${c.nome||"Conta"}</div><div class="rsm-conta-tipo">${tipo}</div></div>
      <div class="rsm-conta-val${saldo<0?" neg":""}">${w(saldo)}</div>
    </div>`;
  }).join('');
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd"><span class="rsm-sec-title">Contas</span><span class="rsm-sec-link">Ver todas →</span></div>
    ${rows}
    <div class="rsm-conta-total"><span>Total em contas</span><span>${w(total)}</span></div>
  </div>`;
}

function renderDiscriminacaoSection(title, lancs, hoje){
  const efetivadas = lancs.filter(l=>l.status==="pago"||l.status==="recebido");
  const vencidas   = lancs.filter(l=>l.status!=="pago"&&l.status!=="recebido"&&(l.data_vencimento||"")&&(l.data_vencimento||"")<=hoje);
  const proximas   = lancs.filter(l=>l.status!=="pago"&&l.status!=="recebido"&&(l.data_vencimento||"")&&(l.data_vencimento||"")>hoje);
  const ef = rSum(efetivadas, l=>l.valor), ve = rSum(vencidas, l=>l.valor), pr = rSum(proximas, l=>l.valor);
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd" style="padding-bottom:2px"><span class="rsm-sec-title">${title}</span></div>
    <div class="rsm-disc-grid">
      <div class="rsm-disc-col">
        <div class="rsm-disc-col-lbl">Efetivadas</div>
        <div class="rsm-disc-val rec">${w(ef)}</div>
      </div>
      <div style="display:flex;align-items:stretch"><div class="rsm-disc-divider"></div></div>
      <div class="rsm-disc-col">
        <div class="rsm-disc-col-lbl">Vencidas</div>
        <div class="rsm-disc-val${ve>0?" pend":""}">${w(ve)}</div>
      </div>
      <div style="display:none"></div>
      <div class="rsm-disc-col" style="grid-column:3">
        <div class="rsm-disc-col-lbl">Próx. venc.</div>
        <div class="rsm-disc-val desp" style="color:var(--rsm-mut)">${w(pr)}</div>
      </div>
    </div>
  </div>`;
}

function renderFluxoCaixa(receitas, despesas){
  const maxV = Math.max(receitas, despesas, 1);
  const saldo = receitas - despesas;
  const phR = Math.round(receitas/maxV*70), phD = Math.round(despesas/maxV*70);
  const phS = saldo>=0 ? Math.round(Math.min(saldo,maxV)/maxV*70) : Math.round(Math.min(Math.abs(saldo),maxV)/maxV*70);
  const saldoCor = saldo>=0?"var(--rsm-rec)":"var(--rsm-desp)";
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd" style="padding-bottom:8px"><span class="rsm-sec-title">Fluxo de caixa</span></div>
    <div class="rsm-fluxo-body">
      <div class="rsm-fluxo-bars">
        <div class="rsm-fluxo-bar-wrap">
          <div class="rsm-fluxo-bar-outer"><div class="rsm-fluxo-bar-inner" style="height:${phR}px;background:var(--rsm-rec);"></div></div>
          <span class="rsm-fluxo-lbl">Entrada</span>
        </div>
        <div class="rsm-fluxo-bar-wrap">
          <div class="rsm-fluxo-bar-outer"><div class="rsm-fluxo-bar-inner" style="height:${phD}px;background:var(--rsm-desp);"></div></div>
          <span class="rsm-fluxo-lbl">Saída</span>
        </div>
        <div class="rsm-fluxo-bar-wrap">
          <div class="rsm-fluxo-bar-outer"><div class="rsm-fluxo-bar-inner" style="height:${phS}px;background:${saldoCor};"></div></div>
          <span class="rsm-fluxo-lbl">Saldo</span>
        </div>
      </div>
      <div class="rsm-fluxo-vals">
        <div class="rsm-fluxo-val-col"><div class="rsm-fluxo-val-num" style="color:var(--rsm-rec)">${w(receitas)}</div><div class="rsm-fluxo-val-lbl">Entrada</div></div>
        <div class="rsm-fluxo-val-col"><div class="rsm-fluxo-val-num" style="color:var(--rsm-desp)">${w(despesas)}</div><div class="rsm-fluxo-val-lbl">Saída</div></div>
        <div class="rsm-fluxo-val-col"><div class="rsm-fluxo-val-num" style="color:${saldoCor}">${w(saldo)}</div><div class="rsm-fluxo-val-lbl">Saldo atual</div></div>
      </div>
    </div>
  </div>`;
}

function renderEconomiaMensal(receitas, despesas){
  const eco = receitas - despesas;
  const p = receitas>0 ? Math.round(eco/receitas*100) : 0;
  const clamp = Math.max(0, Math.min(p,100));
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd" style="padding-bottom:0"><span class="rsm-sec-title">Economia mensal</span></div>
    <div class="rsm-eco-body">
      <div class="rsm-eco-gauge">${gaugeSVG(clamp,90)}</div>
      <div class="rsm-eco-info">
        <div class="rsm-eco-pct">${clamp}%</div>
        <div class="rsm-eco-sub">Valor economizado</div>
        <div class="rsm-eco-val" style="color:${eco>=0?"var(--rsm-rec)":"var(--rsm-desp)"}">${w(eco)}</div>
        <div class="rsm-eco-detail">
          <span>Receitas consideradas: ${w(receitas)}</span>
          <span>Despesas consideradas: ${w(despesas)}</span>
        </div>
      </div>
    </div>
  </div>`;
}

function renderCarouselSlide(title, items, hoje, tipo){
  const cor = tipo==="receita"?"var(--rsm-rec)":tipo==="despesa"?"var(--rsm-desp)":"var(--rsm-pri)";
  const ico = tipo==="receita"?"📈":tipo==="despesa"?"📉":"🔄";
  const limited = items.slice(0,5);
  const rows = limited.length ? limited.map(l=>{
    const vencida = l.data_vencimento && l.data_vencimento < hoje;
    return `<div class="rsm-pend-row">
      <div class="rsm-pend-ico" style="background:${cor}22">${l.icone||ico}</div>
      <div class="rsm-pend-info">
        <div class="rsm-pend-name">${l.descricao||"—"}</div>
        <div class="rsm-pend-date${vencida?" venc":""}">${vencida?"Vencida ":"Vence "}${at(l.data_vencimento)}</div>
      </div>
      <div class="rsm-pend-val" style="color:${cor}">${w(l.valor)}</div>
    </div>`;
  }).join('') : `<div class="rsm-car-empty">Nenhum${tipo==="receita"?"a":""} ${tipo} pendente ✓</div>`;
  return `<div class="rsm-car-slide">
    <div class="rsm-car-hd">
      <span class="rsm-car-title">${title}</span>
      ${items.length?`<span class="rsm-car-badge">${items.length}</span>`:""}
    </div>
    ${rows}
    ${items.length>5?`<div class="rsm-ver-mais">Ver todos (${items.length})</div>`:""}
  </div>`;
}

function renderPendentes(lancamentos, hoje){
  const desp = lancamentos.filter(l=>l.tipo==="despesa"&&l.status!=="pago"&&l.status!=="recebido");
  const rec  = lancamentos.filter(l=>l.tipo==="receita"&&l.status!=="pago"&&l.status!=="recebido");
  const trf  = lancamentos.filter(l=>l.tipo==="transferencia"&&l.status!=="pago"&&l.status!=="recebido");
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd" style="padding-bottom:0"><span class="rsm-sec-title">Transações pendentes</span></div>
    <div class="rsm-car-wrap">
      <div class="rsm-car-track" id="rsm-car-track">
        ${renderCarouselSlide("Despesas pendentes", desp, hoje, "despesa")}
        ${renderCarouselSlide("Receitas pendentes", rec, hoje, "receita")}
        ${renderCarouselSlide("Transferências pendentes", trf, hoje, "transferencia")}
      </div>
    </div>
    <div class="rsm-car-dots">
      <div class="rsm-car-dot active" data-slide="0"></div>
      <div class="rsm-car-dot" data-slide="1"></div>
      <div class="rsm-car-dot" data-slide="2"></div>
    </div>
  </div>`;
}

function renderSaldoConsolidado(contas){
  const ativas = contas.filter(c=>c.ativa!==false&&!c.parentId);
  const patrim = rSum(ativas.filter(c=>(c.saldo??c.saldoInicial??0)>=0), c=>c.saldo??c.saldoInicial??0);
  const divida = rSum(ativas.filter(c=>(c.saldo??c.saldoInicial??0)<0), c=>Math.abs(c.saldo??c.saldoInicial??0));
  const total  = patrim + divida || 1;
  const pctP   = pct(patrim, total), pctD = pct(divida, total);
  const segs=[{val:patrim,cor:"var(--rsm-rec)"},{val:divida,cor:"var(--rsm-desp)"}];
  const lbl = `${pctP}%`;
  return `<div class="rsm-sec">
    <div class="rsm-sec-hd" style="padding-bottom:0"><span class="rsm-sec-title">Saldo consolidado</span></div>
    <div class="rsm-saldo-body">
      ${donutSVG(segs,96,lbl)}
      <div class="rsm-saldo-legend">
        <div class="rsm-saldo-leg-row">
          <div class="rsm-saldo-dot" style="background:var(--rsm-rec)"></div>
          <div><div class="rsm-saldo-leg-lbl">${pctP}% Patrimônio</div><div class="rsm-saldo-leg-val">${w(patrim)}</div></div>
        </div>
        <div class="rsm-saldo-leg-row">
          <div class="rsm-saldo-dot" style="background:var(--rsm-desp)"></div>
          <div><div class="rsm-saldo-leg-lbl">${pctD}% Dívidas</div><div class="rsm-saldo-leg-val" style="color:var(--rsm-desp)">${w(divida)}</div></div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderLancList(items, tipo, hoje, showAll=false){
  const cor = tipo==="receita"?"var(--rsm-rec)":"var(--rsm-desp)";
  const limited = showAll ? items : items.slice(0,5);
  if(!limited.length) return `<p style="padding:14px;font-size:13px;color:var(--rsm-mut);text-align:center">Nenhum${tipo==="receita"?"a":""} ${tipo} no período.</p>`;
  return limited.map(l=>{
    const vencida = l.status!=="pago"&&l.status!=="recebido"&&l.data_vencimento&&l.data_vencimento<hoje;
    const ico = l.icone||(tipo==="receita"?"💰":"💸");
    const bg  = tipo==="receita"?"#d1fae522":"#fee2e222";
    return `<div class="rsm-lanc-row">
      <div class="rsm-lanc-ico" style="background:${bg}">${ico}</div>
      <div class="rsm-lanc-mid">
        <div class="rsm-lanc-nome">${l.descricao||"—"}</div>
        <div class="rsm-lanc-sub${vencida?" venc":""}">${l.categoria||""}</div>
      </div>
      <div class="rsm-lanc-right">
        <div class="rsm-lanc-val ${tipo==="receita"?"rec":"desp"}">${w(l.valor)}</div>
        <div class="rsm-lanc-date${vencida?" venc":""}">${at(l.data_vencimento)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderCatDonut(items, tipo){
  if(!items.length) return `<p style="padding:14px;font-size:13px;color:var(--rsm-mut)">Sem dados.</p>`;
  const total = rSum(items, l=>l.valor)||1;
  // Agrupar por categoria
  const mapa={};
  items.forEach(l=>{const k=l.categoria||"Outros";mapa[k]=(mapa[k]||0)+Number(l.valor||0)});
  const entries = Object.entries(mapa).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const segs = entries.map(([nome,val],i)=>({nome,val,cor:CAT_COLORS[i%CAT_COLORS.length]}));
  const pctLbl = `${pct(entries[0][1],total)}%`;
  const listRows = segs.map(s=>`<div class="rsm-cat-row">
    <div class="rsm-cat-dot" style="background:${s.cor}"></div>
    <div class="rsm-cat-name" title="${s.nome}">${s.nome}</div>
    <div class="rsm-cat-pct">${pct(s.val,total)}%</div>
    <div class="rsm-cat-val">${w(s.val)}</div>
  </div>`).join('');
  return `<div class="rsm-cat-body">
    ${donutSVG(segs,96,pctLbl)}
    <div class="rsm-cat-list">${listRows}</div>
  </div>`;
}

async function openQuickLanc(tipo,container){
  const isRec=tipo==="receita";
  const cor=isRec?"#059669":"#dc2626";
  const hoje=ht();
  // ── Carrega clientes e categorias do banco (em paralelo) ──
  let clientes=[],cats=[];
  try{
    const uid=await S();
    const [cliRes,catRaw]=await Promise.all([
      x.from("cli_clientes").select("id,dados").eq("user_id",uid),
      j("categorias").catch(()=>[])
    ]);
    clientes=((cliRes&&cliRes.data)||[]).map(r=>({id:r.id,nome:((r.dados||{}).nome)||"—",valor:(r.dados||{}).valorMensal||"",dia:(r.dados||{}).diaVencimento||""})).sort((a,b)=>a.nome.localeCompare(b.nome));
    cats=T("categorias",catRaw).filter(c=>c.nome).sort((a,b)=>String(a.nome).localeCompare(String(b.nome)));
  }catch(e){console.warn("[quicklanc] carga aux:",e)}
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const optCli=clientes.map(c=>`<option value="${c.id}" data-valor="${esc(c.valor)}" data-dia="${esc(c.dia)}">${esc(c.nome)}</option>`).join("");
  const optCat=cats.map(c=>`<option value="${esc(c.nome)}">${esc(c.nome)}</option>`).join("");
  const overlay=document.createElement("div");
  overlay.className="rsm-ql-overlay";
  overlay.innerHTML=`<div class="rsm-ql-box" style="max-height:90vh;overflow-y:auto">
<div class="rsm-ql-hd">
  <span class="rsm-ql-title" style="color:${cor}">${isRec?"💰 Nova Receita":"💸 Nova Despesa"}</span>
  <button class="rsm-ql-close" id="rsm-ql-x">✕</button>
</div>
<form class="rsm-ql-form" id="rsm-ql-form">
  <div><label class="rsm-ql-lbl">Descrição *</label><input class="rsm-ql-inp" name="descricao" type="text" placeholder="${isRec?"Ex: Mensalidade internet":"Ex: Conta de luz"}" required autocomplete="off" style="--focus-color:${cor}"></div>
  ${isRec?`<div><label class="rsm-ql-lbl">Cliente</label>
    <select class="rsm-ql-inp" name="cliente" id="rsm-ql-cli" style="--focus-color:${cor}">
      <option value="">— sem cliente —</option>${optCli}
    </select>
    ${clientes.length?"":'<div style="font-size:11px;color:var(--rsm-mut);margin-top:3px">Nenhum cliente cadastrado. Cadastre em ☰ → Clientes ServNet.</div>'}
  </div>`:""}
  <div><label class="rsm-ql-lbl">Categoria</label>
    ${cats.length?`<select class="rsm-ql-inp" name="categoria" style="--focus-color:${cor}"><option value="">— sem categoria —</option>${optCat}</select>`
      :`<input class="rsm-ql-inp" name="categoria" type="text" placeholder="${isRec?"Ex: Provedor":"Ex: Conta fixa"}" style="--focus-color:${cor}">`}
  </div>
  <div class="rsm-ql-row2">
    <div><label class="rsm-ql-lbl">Valor (R$) *</label><input class="rsm-ql-inp" name="valor" id="rsm-ql-val" type="number" step="0.01" min="0.01" placeholder="0,00" required style="--focus-color:${cor}"></div>
    <div><label class="rsm-ql-lbl">Dt. vencimento *</label><input class="rsm-ql-inp" name="data_v" id="rsm-ql-dv" type="date" value="${hoje}" required style="--focus-color:${cor}"></div>
  </div>
  <div class="rsm-ql-row2">
    <div><label class="rsm-ql-lbl">Recorrência</label>
      <select class="rsm-ql-inp" name="recorrencia" id="rsm-ql-rec" style="--focus-color:${cor}">
        <option value="unica">Única</option>
        <option value="mensal"${isRec&&clientes.length?" ":""}>Mensal</option>
        <option value="trimestral">Trimestral</option>
        <option value="semestral">Semestral</option>
        <option value="anual">Anual</option>
      </select>
    </div>
    <div id="rsm-ql-repwrap" style="display:none"><label class="rsm-ql-lbl">Repetições</label>
      <input class="rsm-ql-inp" name="repeticoes" type="number" min="2" max="60" value="12" style="--focus-color:${cor}">
    </div>
  </div>
  <div>
    <label class="rsm-ql-lbl">Status</label>
    <div class="rsm-ql-st-grp">
      <button type="button" class="rsm-ql-st-btn sel" data-s="pendente" style="--sel-c:#d97706">Pendente</button>
      <button type="button" class="rsm-ql-st-btn" data-s="${isRec?"recebido":"pago"}" style="--sel-c:${cor}">${isRec?"Recebido":"Pago"}</button>
    </div>
  </div>
  <button type="submit" class="rsm-ql-submit" style="--btn-c:${cor}">Salvar ${isRec?"Receita":"Despesa"}</button>
</form>
</div>`;
  document.body.appendChild(overlay);
  let stSel="pendente";
  overlay.querySelectorAll(".rsm-ql-st-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      stSel=btn.dataset.s;
      overlay.querySelectorAll(".rsm-ql-st-btn").forEach(b=>b.classList.toggle("sel",b.dataset.s===stSel));
    });
  });
  // Recorrência: mostra campo repetições quando não é única
  const selRec=overlay.querySelector("#rsm-ql-rec");
  const repWrap=overlay.querySelector("#rsm-ql-repwrap");
  selRec?.addEventListener("change",()=>{repWrap.style.display=selRec.value==="unica"?"none":"block";});
  // Cliente selecionado: preenche valor e dia de vencimento do cadastro
  const selCli=overlay.querySelector("#rsm-ql-cli");
  selCli?.addEventListener("change",()=>{
    const opt=selCli.selectedOptions[0];if(!opt||!opt.value)return;
    const v=opt.dataset.valor,d=opt.dataset.dia;
    const inpV=overlay.querySelector("#rsm-ql-val"),inpD=overlay.querySelector("#rsm-ql-dv");
    if(v&&inpV&&!inpV.value)inpV.value=v;
    if(d&&inpD){const m=inpD.value?inpD.value.slice(0,7):hoje.slice(0,7);inpD.value=m+"-"+String(d).padStart(2,"0");}
  });
  overlay.querySelector("#rsm-ql-x")?.addEventListener("click",()=>overlay.remove());
  overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.remove();});
  overlay.querySelector("#rsm-ql-form")?.addEventListener("submit",async e=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const dv=fd.get("data_v")||hoje;
    const rec=fd.get("recorrencia")||"unica";
    const nrep=rec==="unica"?1:Math.min(Math.max(parseInt(fd.get("repeticoes"))||12,2),60);
    const step=rec==="anual"?12:rec==="semestral"?6:rec==="trimestral"?3:1;
    const cliId=fd.get("cliente")||null;
    const cli=cliId?clientes.find(c=>c.id===cliId):null;
    const grupo=nrep>1?crypto.randomUUID():null;
    const entries=[];
    for(let i=0;i<nrep;i++){
      const dvi=i===0?dv:yt(dv,i*step);
      entries.push({id:crypto.randomUUID(),tipo,status:i===0?stSel:"pendente",
        descricao:fd.get("descricao"),valor:parseFloat(fd.get("valor"))||0,
        data_vencimento:dvi,mes_ref:dvi.slice(0,7),categoria:fd.get("categoria")||null,
        ...(cli?{clienteId:cli.id,cliente:cli.nome,clienteNome:cli.nome,negocio:"Provedor/Servnet"}:{}),
        ...(grupo?{recorrencia:rec,grupoRecorrencia:grupo,parcela:(i+1)+"/"+nrep}:{})});
    }
    const sbtn=e.target.querySelector("[type=submit]");
    sbtn.disabled=true;sbtn.textContent="Salvando…";
    try{
      await Q("lancamentos",entries);
      X.ok(nrep>1?nrep+" lançamentos gerados! ✅":(isRec?"Receita salva! ✅":"Despesa salva! ✅"));
      overlay.remove();
      initDashboard(container);
    }catch(err){
      X.err("Erro: "+err.message);
      sbtn.disabled=false;sbtn.textContent=`Salvar ${isRec?"Receita":"Despesa"}`;
    }
  });
}

function renderResumoDashboard(container, {contas, lancRec, lancDesp, lancAll, mesNav}){
  const hoje = ht();
  const mesKey = `${mesNav.ano}-${String(mesNav.mes+1).padStart(2,"0")}`;
  const mesLabel = `${W[mesNav.mes]} ${mesNav.ano}`;
  const ehFuturo = false; // navegação livre para provisão futura
  const noMesAtual = mesKey === ot();

  const recEf = rSum(lancRec.filter(l=>l.status==="pago"||l.status==="recebido"), l=>l.valor);
  const despEf = rSum(lancDesp.filter(l=>l.status==="pago"||l.status==="recebido"), l=>l.valor);
  const recPend = rSum(lancRec.filter(l=>l.status!=="pago"&&l.status!=="recebido"), l=>l.valor);
  const despPend = rSum(lancDesp.filter(l=>l.status!=="pago"&&l.status!=="recebido"), l=>l.valor);

  const saldoContas = rSum(contas.filter(c=>c.ativa!==false&&!c.parentId), c=>c.saldo??c.saldoInicial??0);
  const saldoInicial = saldoContas - recEf + despEf;
  const saldoAtual = saldoContas;
  const saldoPrevisto = saldoContas + recPend - despPend;

  const ultiRec  = [...lancRec].sort((a,b)=>(b.data_vencimento||"").localeCompare(a.data_vencimento||"")).slice(0,5);
  const ultiDesp = [...lancDesp].sort((a,b)=>(b.data_vencimento||"").localeCompare(a.data_vencimento||"")).slice(0,5);

  container.innerHTML = RSM_STYLE + `
  <div class="rsm-wrap">
    <!-- Header / Month Nav -->
    <div class="rsm-hd">
      <button class="rsm-nav-btn" id="rsm-prev" title="Mês anterior">‹</button>
      <span class="rsm-month-title">${mesLabel} ${noMesAtual?"":`<button id="rsm-hoje" style="margin-left:8px;background:var(--rsm-pri)18;border:1px solid var(--rsm-pri);color:var(--rsm-pri);border-radius:999px;font-size:11px;font-weight:700;padding:3px 12px;cursor:pointer;vertical-align:middle">Hoje</button>`}</span>
      <button class="rsm-nav-btn" id="rsm-next" title="Próximo mês">›</button>
    </div>

    <!-- Dash único -->
    <div class="rsm-metrics" style="grid-template-columns:1fr 1fr">
      <div class="rsm-metric">
        <div class="rsm-metric-lbl">Saldo início do mês</div>
        <div class="rsm-metric-val ${saldoInicial>=0?"pos":"neg"}">${w(saldoInicial)}</div>
      </div>
      <div class="rsm-metric" style="border-left:1px solid var(--rsm-brd)">
        <div class="rsm-metric-lbl">Saldo final previsto</div>
        <div class="rsm-metric-val ${saldoPrevisto>=0?"pos":"neg"}">${w(saldoPrevisto)}</div>
      </div>
    </div>

    ${(()=>{
      const prevRec=recEf+recPend, prevPag=despEf+despPend;
      const pctRec=prevRec>0?Math.min(100,Math.round(recEf/prevRec*100)):0;
      const pctPag=prevPag>0?Math.min(100,Math.round(despEf/prevPag*100)):0;
      const cardFin=(id,icone,titulo,prev,real,pct,corReal)=>`
      <div class="rsm-sec" id="${id}" style="cursor:pointer">
        <div class="rsm-sec-hd">
          <span class="rsm-sec-title">${icone} ${titulo}</span>
          <span class="rsm-sec-link">Abrir →</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;padding:10px 14px 4px;gap:8px">
          <div><div class="rsm-metric-lbl">Previsto</div><div style="font-size:19px;font-weight:800;color:var(--rsm-txt)">${w(prev)}</div></div>
          <div style="text-align:right"><div class="rsm-metric-lbl">Realizado</div><div style="font-size:19px;font-weight:800;color:${corReal}">${w(real)}</div></div>
        </div>
        <div style="padding:2px 14px 13px">
          <div style="height:7px;background:rgba(128,128,128,.15);border-radius:4px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${corReal};border-radius:4px;transition:width .5s"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--rsm-mut);margin-top:4px">
            <span>${pct}% realizado</span><span>falta ${w(Math.max(0,prev-real))}</span>
          </div>
        </div>
      </div>`;
      return cardFin("rsm-card-rec","📥","Contas a Receber",prevRec,recEf,pctRec,"#059669")
           + cardFin("rsm-card-pag","📤","Contas a Pagar",prevPag,despEf,pctPag,"#dc2626");
    })()}

    <!-- FAB lançamento rápido -->
    <div class="rsm-fab-wrap">
      <div class="rsm-fab-opts" id="rsm-fab-opts">
        <button class="rsm-fab-opt" id="rsm-fab-rec"><span class="rsm-fab-dot2" style="background:#059669">💰</span>Receita</button>
        <button class="rsm-fab-opt" id="rsm-fab-desp"><span class="rsm-fab-dot2" style="background:#dc2626">💸</span>Despesa</button>
      </div>
      <button class="rsm-fab-main" id="rsm-fab-btn" title="Novo lançamento">+</button>
    </div>
  </div>`;

  // Month navigation
  container.querySelector("#rsm-prev")?.addEventListener("click",()=>{
    h.mesNav.mes--; if(h.mesNav.mes<0){h.mesNav.mes=11;h.mesNav.ano--;}
    initDashboard(container);
  });
  container.querySelector("#rsm-next")?.addEventListener("click",()=>{
    h.mesNav.mes++; if(h.mesNav.mes>11){h.mesNav.mes=0;h.mesNav.ano++;}
    initDashboard(container);
  });
  container.querySelector("#rsm-hoje")?.addEventListener("click",e=>{
    e.stopPropagation();
    const t=new Date();
    h.mesNav={ano:t.getFullYear(),mes:t.getMonth()};
    initDashboard(container);
  });
  container.querySelector("#rsm-card-rec")?.addEventListener("click",()=>{typeof window.openModule=="function"&&window.openModule("receber","Contas a Receber","📥","#059669")});
  container.querySelector("#rsm-card-pag")?.addEventListener("click",()=>{typeof window.openModule=="function"&&window.openModule("pagar","Contas a Pagar","📤","#dc2626")});

  // Carousel
  let slide=0;
  const track=container.querySelector("#rsm-car-track");
  const dots=container.querySelectorAll(".rsm-car-dot");
  function goSlide(n){
    slide=Math.max(0,Math.min(n,2));
    if(track) track.style.transform=`translateX(-${slide*100}%)`;
    dots.forEach((d,i)=>d.classList.toggle("active",i===slide));
  }
  dots.forEach(d=>d.addEventListener("click",()=>goSlide(+d.dataset.slide)));
  // Swipe carousel
  let tsX=0;
  if(track){
    track.addEventListener("touchstart",e=>{tsX=e.touches[0].clientX},{passive:true});
    track.addEventListener("touchend",e=>{const dx=tsX-e.changedTouches[0].clientX;if(dx>30)goSlide(slide+1);else if(dx<-30)goSlide(slide-1)},{passive:true});
  }

  // Ver mais - receitas
  container.querySelector("#rsm-more-rec")?.addEventListener("click",function(){
    const sec=this.closest(".rsm-sec");
    const inner=sec.querySelector(".rsm-lanc-row")?.parentElement||sec;
    this.remove();
    inner.insertAdjacentHTML("beforeend",renderLancList(lancRec,"receita",hoje,true).replace(ultiRec.map(l=>`<div class="rsm-lanc-row"`).join(''),''));
    // Re-render full list
    const hd=sec.querySelector(".rsm-sec-hd");
    const newList=document.createElement("div");
    newList.innerHTML=renderLancList(lancRec,"receita",hoje,true);
    while(sec.querySelector(".rsm-lanc-row"))sec.querySelector(".rsm-lanc-row").remove();
    Array.from(newList.children).forEach(el=>sec.appendChild(el));
  });

  // Ver mais - despesas
  container.querySelector("#rsm-more-desp")?.addEventListener("click",function(){
    const sec=this.closest(".rsm-sec");
    const hd=sec.querySelector(".rsm-sec-hd");
    const newList=document.createElement("div");
    newList.innerHTML=renderLancList(lancDesp,"despesa",hoje,true);
    while(sec.querySelector(".rsm-lanc-row"))sec.querySelector(".rsm-lanc-row").remove();
    const vm=sec.querySelector("#rsm-more-desp"); if(vm)vm.remove();
    Array.from(newList.children).forEach(el=>sec.appendChild(el));
  });

  // Nav links
  container.querySelectorAll("[data-nav]").forEach(el=>el.addEventListener("click",()=>nt.ir(el.dataset.nav)));

  // FAB lançamento rápido
  let fabOpen=false;
  const fabBtn=container.querySelector("#rsm-fab-btn");
  const fabOpts=container.querySelector("#rsm-fab-opts");
  fabBtn?.addEventListener("click",()=>{
    fabOpen=!fabOpen;
    fabOpts?.classList.toggle("open",fabOpen);
    if(fabBtn)fabBtn.textContent=fabOpen?"✕":"+";
  });
  container.querySelector("#rsm-fab-rec")?.addEventListener("click",()=>{
    fabOpts?.classList.remove("open");fabOpen=false;if(fabBtn)fabBtn.textContent="+";
    openQuickLanc("receita",container);
  });
  container.querySelector("#rsm-fab-desp")?.addEventListener("click",()=>{
    fabOpts?.classList.remove("open");fabOpen=false;if(fabBtn)fabBtn.textContent="+";
    openQuickLanc("despesa",container);
  });
}

function renderSkeleton(t){
  t.innerHTML=`
    <style>@keyframes rsm-pulse{0%,100%{opacity:1}50%{opacity:.45}}</style>
    <div style="padding:0;background:var(--rsm-bg,#f4f5f7);min-height:100%">
      <div style="height:50px;background:var(--bg-card,#fff);margin-bottom:1px;animation:rsm-pulse 1.4s infinite"></div>
      <div style="height:62px;background:var(--bg-card,#fff);margin-bottom:12px;animation:rsm-pulse 1.4s infinite"></div>
      ${Array(4).fill('<div style="height:80px;background:var(--bg-card,#fff);border-radius:14px;margin:0 12px 12px;animation:rsm-pulse 1.4s infinite"></div>').join('')}
    </div>`;
}

async function fetchLancMes(mesKey){
  const uid=await S(); if(!uid)return[];
  const{data,error}=await x.from("lancamentos").select("*").eq("user_id",uid).eq("dados->>mes_ref",mesKey).limit(500);
  if(error)return[];
  return T("lancamentos",data);
}

async function initDashboard(container){
  renderSkeleton(container);
  try{
    const mesNav={...h.mesNav};
    const mesKey=`${mesNav.ano}-${String(mesNav.mes+1).padStart(2,"0")}`;
    const[contasRaw,lancs]=await Promise.all([j("contas"),fetchLancMes(mesKey)]);
    const contas=T("contas",contasRaw);
    const lancRec =lancs.filter(l=>l.tipo==="receita");
    const lancDesp=lancs.filter(l=>l.tipo==="despesa");
    N.set("contas",contas);
    N.set("lancamentos",lancs);
    renderResumoDashboard(container,{contas,lancRec,lancDesp,lancAll:lancs,mesNav});
  }catch(e){
    console.error("[dashboard]",e);
    X.err("Erro ao carregar resumo: "+e.message);
    container.innerHTML=`<div style="padding:20px;color:var(--text-muted,#6b7280)"><p>Erro ao carregar os dados. Tente recarregar.</p><button onclick="location.reload()" style="margin-top:12px;padding:8px 16px;border-radius:8px;background:var(--primary,#6366f1);color:#fff;border:none;cursor:pointer">Recarregar</button></div>`;
  }
}

const wt=Object.freeze(Object.defineProperty({__proto__:null,initDashboard},Symbol.toStringTag,{value:"Module"}));
export{xt as A,W as N,P as a,at as b,yt as c,Q as d,Z as e,w as f,tt as g,ht as h,j as i,x as j,h as k,mt as l,bt as m,wt as n,nt as r,N as s,X as t,T as u};
