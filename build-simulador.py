#!/usr/bin/env python3
"""
Gera simulador-fidelidade.html a partir de servnet-site/portal.html.

O simulador precisa mostrar exatamente o que o cliente vê, então o CSS e as
funções do cartão são COPIADOS do portal em vez de reescritos. Rode este
script sempre que mexer no cartão de fidelidade, para o simulador não
descolar do produto:

    python3 build-simulador.py
"""
import re, pathlib

RAIZ   = pathlib.Path(__file__).parent
PORTAL = RAIZ / 'servnet-site' / 'portal.html'
SAIDA  = RAIZ / 'simulador-fidelidade.html'

src = PORTAL.read_text(encoding='utf-8')
css = re.search(r'<style>(.*?)</style>', src, re.S).group(1)
js  = re.findall(r'<script[^>]*>(.*?)</script>', src, re.S)[1]
linhas = js.split('\n')


def css_entre(a, b):
    return css[css.index(a):css.index(b)]


def funcao(header):
    """Funções de topo do portal fecham numa linha que é exatamente '}'."""
    ini = next(i for i, l in enumerate(linhas) if l.startswith(header))
    fim = next(i for i in range(ini + 1, len(linhas)) if linhas[i] == '}')
    return '\n'.join(linhas[ini:fim + 1])


CSS_CARTAO = '\n'.join([
    css[css.index(':root{'):css.index('body{')],
    css_entre('/* ===== FIDELIDADE — Cartão Físico ===== */', '/* ===== INDICAÇÕES ===== */'),
    css_entre('/* ===== REGRAS (accordion) ===== */', '/* utils */'),
])

FUNCOES = [
    'function esc(s)', 'function ctKey(ct, i)', 'function ctNome(ct, i)',
    'function fmtDate(d)', 'function fmtVal(v)', 'function fmtMesRef(m)',
    'function calcStreak(fat)', 'function premiosGanhos(fat)',
    'function renderHistoricoFidelidade(fatContrato)',
    'function renderFidelidade(', 'function toggleRules(id,btn)',
]
JS_CARTAO = '\n\n'.join(
    [next(l for l in linhas if l.startswith('const MESES_ABREV'))] +
    [funcao(n) for n in FUNCOES]
)

# nada do resto do portal (login, supabase, listeners) pode vir junto
for proibido in ('addEventListener', 'sb.rpc', 'loginScreen', 'dashScreen', 'supabase'):
    assert proibido not in JS_CARTAO, f'vazou código do portal: {proibido}'
for n in FUNCOES:
    assert n in JS_CARTAO, f'não extraiu: {n}'

CHROME = '''
/* ---- chrome do simulador: console monoespaçado, separado do produto ---- */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --mono:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace;
  --sans:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;
  --chrome:#0A1C27;--chrome-2:#0E2531;--hair:rgba(0,196,216,0.16);
}
body{font-family:var(--sans);background:var(--bg);color:var(--text);line-height:1.6;
  padding:clamp(1rem,4vw,2.5rem);min-height:100vh;}
.wrap{max-width:1180px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem;}

.masthead{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;
  flex-wrap:wrap;padding-bottom:1rem;border-bottom:1px solid var(--hair);}
.mast-t{font-size:1.35rem;font-weight:800;letter-spacing:-0.01em;text-wrap:balance;}
.mast-t b{color:var(--pool);font-weight:800;}
.mast-s{font-family:var(--mono);font-size:0.72rem;color:var(--text-2);letter-spacing:0.06em;}

.panel{background:var(--chrome);border:1px solid var(--hair);border-radius:12px;padding:1.25rem 1.35rem;}
.panel-h{font-family:var(--mono);font-size:0.68rem;text-transform:uppercase;
  letter-spacing:0.16em;color:var(--pool);margin-bottom:0.2rem;font-weight:700;}
.panel-sub{font-size:0.82rem;color:var(--text-2);margin-bottom:1rem;max-width:68ch;}

.ledger{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:0.5rem;}
.fx{font-family:var(--mono);background:var(--chrome-2);border:1.5px solid var(--hair);
  border-radius:8px;padding:0.55rem 0.4rem;cursor:pointer;text-align:center;color:inherit;
  display:flex;flex-direction:column;gap:0.22rem;transition:border-color .15s,background .15s,transform .1s;}
.fx:hover{border-color:var(--pool);transform:translateY(-1px);}
.fx:focus-visible{outline:2px solid var(--pool);outline-offset:2px;}
.fx-n{font-size:0.6rem;color:var(--text-2);letter-spacing:0.08em;}
.fx-d{font-size:0.76rem;font-weight:700;font-variant-numeric:tabular-nums;}
.fx-s{font-size:0.58rem;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;}
.fx.emdia{border-color:rgba(52,211,153,0.55);background:rgba(16,185,129,0.10);}
.fx.emdia .fx-s{color:#34D399;}
.fx.atraso{border-color:rgba(248,113,113,0.55);background:rgba(239,68,68,0.10);}
.fx.atraso .fx-s{color:#F87171;}
.fx.aberto .fx-s{color:var(--text-2);}
.fx.futura{opacity:0.5;border-style:dashed;cursor:not-allowed;}
.fx.futura:hover{transform:none;border-color:var(--hair);}

.toolbar{display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;
  margin-top:1rem;padding-top:1rem;border-top:1px solid var(--hair);}
.tb{font-family:var(--mono);font-size:0.72rem;background:transparent;border:1px solid var(--hair);
  color:var(--text-2);border-radius:6px;padding:0.42rem 0.75rem;cursor:pointer;transition:all .15s;}
.tb:hover{color:var(--pool);border-color:var(--pool);}
.tb:focus-visible{outline:2px solid var(--pool);outline-offset:2px;}
.tb.on{background:rgba(0,196,216,0.12);color:var(--pool);border-color:var(--pool);}

.readout{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:1px;
  background:var(--hair);border:1px solid var(--hair);border-radius:12px;overflow:hidden;}
.ro{background:var(--chrome);padding:0.95rem 1.1rem;}
.ro-k{font-family:var(--mono);font-size:0.62rem;text-transform:uppercase;
  letter-spacing:0.14em;color:var(--text-2);margin-bottom:0.3rem;}
.ro-v{font-size:1.4rem;font-weight:800;font-variant-numeric:tabular-nums;line-height:1.15;}
.ro-n{font-size:0.72rem;color:var(--text-2);margin-top:0.15rem;}
.ro-v.teal{color:var(--pool);} .ro-v.gold{color:#FCD34D;} .ro-v.green{color:#34D399;}
.ro-v.dim{color:var(--text-2);font-size:1.05rem;font-weight:700;}

.stage{background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:1.4rem 1.35rem;position:relative;}
.stage::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,transparent 10%,var(--pool) 50%,transparent 90%);opacity:0.3;}
.stage-h{font-family:var(--mono);font-size:0.68rem;text-transform:uppercase;letter-spacing:0.16em;
  color:var(--pool);margin-bottom:1rem;font-weight:700;}
.stage-h em{font-style:normal;color:var(--text-2);letter-spacing:0.04em;text-transform:none;}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;}}
'''

BODY = '''
<div class="wrap">

  <header class="masthead">
    <div>
      <div class="mast-t">Simulador do <b>Cartão Fidelidade</b></div>
      <div class="mast-s">servnet · portal v2.7 · regra 7ª / 13ª fatura</div>
    </div>
    <div class="mast-s">clique numa fatura para trocar o estado</div>
  </header>

  <section class="panel">
    <div class="panel-h">Histórico de faturas</div>
    <p class="panel-sub">Cada clique alterna entre <strong>pago em dia</strong> → <strong>pago com atraso</strong> → <strong>em aberto</strong>. O cartão abaixo recalcula na hora, com o mesmo código que roda no portal.</p>
    <div class="ledger" id="ledger"></div>
    <div class="toolbar">
      <button class="tb" onclick="preset('novo')">Cliente novo</button>
      <button class="tb" onclick="preset('seis')">6 em dia</button>
      <button class="tb" onclick="preset('doze')">12 em dia</button>
      <button class="tb" onclick="preset('atraso')">Atraso no 4º mês</button>
      <button class="tb" onclick="preset('recaida')">Atraso no mês passado</button>
      <span style="flex:1"></span>
      <button class="tb" id="btnPrata" onclick="setPlano('prata')">Prata · R$ 80</button>
      <button class="tb" id="btnBronze" onclick="setPlano('bronze')">Bronze · R$ 60</button>
    </div>
  </section>

  <section class="readout" id="readout"></section>

  <section class="stage">
    <div class="stage-h">O que o cliente vê <em>— renderizado pelo código real do portal</em></div>
    <div id="fidel-sim"></div>
  </section>

</div>
'''

SIM = '''
let session = {nome:'Wellington Soares de Souza'};
let contratos = [];
let faturasList = [];

const PLANOS = {
  prata:  {nome:'Plano Prata',  valor:80, dia:20, velocidade:'200 Mbps'},
  bronze: {nome:'Plano Bronze', valor:60, dia:30, velocidade:'100 Mbps'}
};
let planoAtual = 'prata';

const N = 14;                       // 12 selos do cartão + as duas faturas premiadas
const CICLO = ['emdia','atraso','aberto'];
let estados = [];

const hojeISO = () => new Date().toISOString().slice(0,10);

// Fatura i (0 = mais antiga) vence no dia do plano; a última cai no mês que vem.
function vencimentoDe(i){
  const p = PLANOS[planoAtual];
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() - (N - 2 - i), 1);
  const ultimoDia = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), Math.min(p.dia, ultimoDia)))
           .toISOString().slice(0,10);
}
const ehFutura = i => vencimentoDe(i) > hojeISO();

function montarFaturas(){
  const p = PLANOS[planoAtual];
  return estados.map((st,i)=>{
    const venc = vencimentoDe(i);
    const comum = {id:'f'+i, contrato_id:'sim', valor:p.valor,
                   vencimento:venc, mes_referencia:venc.slice(0,7)};
    if(venc > hojeISO() || st === 'aberto'){
      return {...comum, status:'Pendente', data_pagamento:null};
    }
    const dv = new Date(venc+'T12:00:00Z');
    dv.setUTCDate(dv.getUTCDate() + (st === 'atraso' ? 6 : -2));
    return {...comum, status:'Pago', data_pagamento:dv.toISOString().slice(0,10)};
  });
}

function renderLedger(){
  document.getElementById('ledger').innerHTML = estados.map((st,i)=>{
    const venc = vencimentoDe(i);
    const futura = venc > hojeISO();
    const rotulo = futura ? 'a vencer'
                 : st === 'emdia'  ? 'em dia'
                 : st === 'atraso' ? 'atraso' : 'em aberto';
    return `<button class="fx ${futura?'futura aberto':st}" ${futura?'disabled':''}
              onclick="ciclar(${i})" title="Fatura ${i+1} — vence ${fmtDate(venc)}">
      <span class="fx-n">FATURA ${i+1}</span>
      <span class="fx-d">${fmtMesRef(venc.slice(0,7))}</span>
      <span class="fx-s">${rotulo}</span>
    </button>`;
  }).join('');
}

function renderReadout(streak, ganhos){
  const p = PLANOS[planoAtual];
  const desconto = p.valor / 2;
  // Prêmio conquistado é evento: conta mesmo que um atraso posterior tenha
  // zerado os selos. O painel tem que dizer o mesmo que o cartão.
  const meia   = ganhos.some(g => g.tipo === 'meia');
  const gratis = ganhos.some(g => g.tipo === 'gratis');
  const economia = (meia ? desconto : 0) + (gratis ? p.valor : 0);

  let premio, nota, cls;
  if(gratis){
    premio = fmtVal(p.valor); cls = 'green'; nota = '13ª fatura zerada';
  } else if(meia){
    premio = fmtVal(desconto); cls = 'gold';
    nota = streak >= 6 ? '50% OFF liberado na 7ª fatura' : '50% OFF já aplicado antes do atraso';
  } else {
    premio = '—'; cls = 'dim';
    nota = `faltam ${6-streak} ${6-streak===1?'fatura':'faturas'} em dia`;
  }

  document.getElementById('readout').innerHTML = `
    <div class="ro">
      <div class="ro-k">Selos</div>
      <div class="ro-v teal">${Math.min(streak,12)}<span style="font-size:0.9rem;opacity:.6">/12</span></div>
      <div class="ro-n">faturas seguidas em dia</div>
    </div>
    <div class="ro">
      <div class="ro-k">Prêmio liberado</div>
      <div class="ro-v ${cls}">${premio}</div>
      <div class="ro-n">${nota}</div>
    </div>
    <div class="ro">
      <div class="ro-k">Economia no ciclo</div>
      <div class="ro-v ${economia?'green':'dim'}">${economia?fmtVal(economia):'—'}</div>
      <div class="ro-n">${economia?'já conquistado':'nada conquistado ainda'}</div>
    </div>
    <div class="ro">
      <div class="ro-k">Ciclo completo vale</div>
      <div class="ro-v dim">${fmtVal(desconto + p.valor)}</div>
      <div class="ro-n">${fmtVal(desconto)} na 7ª + ${fmtVal(p.valor)} na 13ª</div>
    </div>`;
}

function atualizar(){
  const p = PLANOS[planoAtual];
  contratos = [{
    contrato_id:'sim', status:'Ativo', diaVencimento:String(p.dia), dataContrato:null,
    plano:{nome:p.nome, valor:String(p.valor), velocidade:p.velocidade, tecnologia:'Fibra Óptica'}
  }];
  faturasList = montarFaturas();
  const streak = calcStreak(faturasList);
  renderLedger();
  renderReadout(streak, premiosGanhos(faturasList));
  renderFidelidade(streak, session.nome, contratos[0], 0, faturasList);
}

function ciclar(i){
  if(ehFutura(i)) return;
  estados[i] = CICLO[(CICLO.indexOf(estados[i]) + 1) % CICLO.length];
  atualizar();
}

function preset(qual){
  const ultimaPassada = estados.reduce((acc,_,i)=> ehFutura(i) ? acc : i, 0);
  estados = estados.map((_,i)=>{
    if(ehFutura(i))        return 'aberto';
    if(qual === 'novo')    return 'aberto';
    if(qual === 'seis')    return i > ultimaPassada - 6 ? 'emdia' : 'aberto';
    if(qual === 'atraso')  return i === 3 ? 'atraso' : 'emdia';
    if(qual === 'recaida') return i === ultimaPassada ? 'atraso' : 'emdia';
    return 'emdia';
  });
  atualizar();
}

function setPlano(q){
  planoAtual = q;
  document.getElementById('btnPrata').classList.toggle('on', q === 'prata');
  document.getElementById('btnBronze').classList.toggle('on', q === 'bronze');
  atualizar();
}

estados = Array.from({length:N}, () => 'emdia');
setPlano('prata');
preset('doze');
'''

SAIDA.write_text(
    '<title>Simulador do Cartão Fidelidade</title>\n'
    '<style>\n/* ---- tokens e componentes copiados de servnet-site/portal.html ---- */\n'
    + CSS_CARTAO + CHROME + '</style>\n'
    + BODY
    + '<script>\n/* ===== copiado sem alteração do portal ===== */\n'
    + JS_CARTAO
    + '\n\n/* ===== simulador ===== */\n'
    + SIM + '</script>\n',
    encoding='utf-8'
)
print(f'gerado {SAIDA.name} — {SAIDA.stat().st_size} bytes')
