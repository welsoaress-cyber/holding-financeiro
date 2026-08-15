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
    'function periodoCartao(ct)',
    'function slotsDoCartao(periodo, fat)', 'function premiosGanhos(fat)',
    'function renderHistoricoFidelidade(fatContrato)',
    'function renderFidelidade(', 'function toggleRules(id,btn)',
]
JS_CARTAO = '\n\n'.join(
    [next(l for l in linhas if l.startswith(n)) for n in
     ('const MESES_ABREV','const mesEmIndice','const indiceEmMes','const somaMeses')] +
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

.janela{display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap;margin-bottom:1rem;
  padding-bottom:0.9rem;border-bottom:1px dashed var(--hair);}
.janela label{font-family:var(--mono);font-size:0.62rem;text-transform:uppercase;
  letter-spacing:0.1em;color:var(--text-2);display:flex;align-items:center;gap:0.45rem;}
.janela input{font-family:var(--mono);font-size:0.76rem;background:var(--chrome-2);
  border:1px solid var(--hair);border-radius:6px;color:var(--text);padding:0.32rem 0.5rem;
  color-scheme:dark;}
.janela input:focus-visible{outline:2px solid var(--pool);outline-offset:1px;}
.janela-sep{color:var(--text-2);}
.janela-out{font-family:var(--mono);font-size:0.76rem;color:var(--pool);
  background:rgba(0,196,216,0.08);border:1px solid var(--hair);border-radius:6px;
  padding:0.32rem 0.6rem;white-space:nowrap;}
.janela-nota{font-size:0.72rem;color:var(--text-2);flex:1;min-width:14ch;}
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
.fx.fora{opacity:0.34;}
.fx.fora::after{content:'fora do cartão';position:absolute;inset:auto 0 -0.1rem 0;
  font-size:0.5rem;letter-spacing:0.04em;color:var(--text-2);}
.fx{position:relative;}
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
      <div class="mast-s">servnet · portal v2.7 · 6 meses em dia → 50% · 12 meses → 100%</div>
    </div>
    <div class="mast-s">clique numa fatura para trocar o estado</div>
  </header>

  <section class="panel">
    <div class="panel-h">Histórico de faturas</div>
    <p class="panel-sub">Cada clique alterna entre <strong>pago em dia</strong> → <strong>pago com atraso</strong> → <strong>em aberto</strong>. O cartão abaixo recalcula na hora, com o mesmo código que roda no portal.</p>
    <div class="janela">
      <label>Cliente desde <input type="date" id="dtInicio" onchange="setCadastro(this.value)"></label>
      <span class="janela-sep">→</span>
      <span class="janela-out" id="periodoOut">—</span>
      <span class="janela-nota">O cliente só paga a partir do mês seguinte ao cadastro. O cartão cobre as 12 faturas contadas daí.</span>
    </div>
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

const N = 12;                       // o razão é exatamente o cartão vigente
const CICLO = ['emdia','atraso','aberto'];
let estados = [];
let dtCadastro = null;              // 'AAAA-MM-DD' — data de início do cliente
let mesInicio = null;               // 'AAAA-MM' da 1ª fatura do cartão vigente

const hojeISO = () => new Date().toISOString().slice(0,10);
const mesAtual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};
function addMeses(ym, n){
  const [y,m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

// Fatura i (0 = mais antiga) vence no dia do plano, no mês correspondente
// da janela. Meses curtos caem no último dia (dia 30 em fevereiro → 28).
function vencimentoDe(i){
  const p = PLANOS[planoAtual];
  const ym = addMeses(mesInicio, i);
  const [y,m] = ym.split('-').map(Number);
  const ultimoDia = new Date(y, m, 0).getDate();
  return `${ym}-${String(Math.min(p.dia, ultimoDia)).padStart(2,'0')}`;
}
const ehFutura = i => vencimentoDe(i) > hojeISO();

// A data de início manda em tudo: periodoCartao() diz qual cartão está
// vigente hoje, e o razão passa a ser exatamente as 12 faturas dele.
function setCadastro(dt){
  if(!dt) return;
  dtCadastro = dt;
  document.getElementById('dtInicio').value = dt;
  const per = periodoCartao({dataContrato: dt});
  mesInicio = per ? per.ini : addMeses(dt.slice(0,7), 1);
  document.getElementById('periodoOut').textContent =
    per ? `cartão ${per.ciclo}: ${fmtMesRef(per.ini)} → ${fmtMesRef(per.fim)}` : '—';
  atualizar();
}

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

function renderLedger(periodo){
  document.getElementById('ledger').innerHTML = estados.map((st,i)=>{
    const venc = vencimentoDe(i);
    const futura = venc > hojeISO();
    const mes = venc.slice(0,7);
    const fora = periodo && (mes < periodo.ini || mes > periodo.fim);
    const rotulo = futura ? 'a vencer'
                 : st === 'emdia'  ? 'em dia'
                 : st === 'atraso' ? 'atraso' : 'em aberto';
    return `<button class="fx ${futura?'futura aberto':st}${fora?' fora':''}" ${futura?'disabled':''}
              onclick="ciclar(${i})"
              title="Fatura ${i+1} — vence ${fmtDate(venc)}${fora?' · fora do cartão vigente':''}">
      <span class="fx-n">FATURA ${i+1}</span>
      <span class="fx-d">${fmtMesRef(mes)}</span>
      <span class="fx-s">${rotulo}</span>
    </button>`;
  }).join('');
}

function renderReadout(streak, ganhos, periodo){
  const p = PLANOS[planoAtual];
  const desconto = p.valor / 2;
  // Prêmio conquistado é evento: conta mesmo que um atraso posterior tenha
  // zerado os selos. O painel tem que dizer o mesmo que o cartão.
  // Ciclo atual: um atraso reinicia o cartão, então o prêmio "liberado"
  // olha só o streak. O que já foi recebido antes vai no tile ao lado.
  let premio, nota, cls;
  if(streak >= 12){
    premio = fmtVal(p.valor); cls = 'green'; nota = 'a próxima fatura sai zerada';
  } else if(streak >= 6){
    premio = fmtVal(desconto); cls = 'gold'; nota = '50% OFF na próxima fatura';
  } else {
    premio = '—'; cls = 'dim';
    nota = `faltam ${6-streak} ${6-streak===1?'fatura':'faturas'} em dia`;
  }

  // Histórico: tudo que o cliente já recebeu, em todos os cartões.
  const recebido = ganhos.reduce((t,g)=> t + (g.tipo==='meia' ? desconto : p.valor), 0);
  const qtdMeia   = ganhos.filter(g=>g.tipo==='meia').length;
  const qtdGratis = ganhos.filter(g=>g.tipo==='gratis').length;
  const detalhe = ganhos.length
    ? [qtdMeia?`${qtdMeia}× 50% OFF`:null, qtdGratis?`${qtdGratis}× grátis`:null].filter(Boolean).join(' + ')
    : 'nenhum prêmio ainda';

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
      <div class="ro-k">Já recebido no total</div>
      <div class="ro-v ${recebido?'green':'dim'}">${recebido?fmtVal(recebido):'—'}</div>
      <div class="ro-n">${detalhe}</div>
    </div>
    <div class="ro">
      <div class="ro-k">Cartão vigente</div>
      <div class="ro-v dim">${periodo?`${fmtMesRef(periodo.ini)} → ${fmtMesRef(periodo.fim)}`:'—'}</div>
      <div class="ro-n">${periodo?`cartão nº ${periodo.ciclo} · vale ${fmtVal(desconto + p.valor)}`:'sem data de cadastro'}</div>
    </div>`;
}

function atualizar(){
  const p = PLANOS[planoAtual];
  contratos = [{
    contrato_id:'sim', status:'Ativo', diaVencimento:String(p.dia),
    dataContrato: dtCadastro,
    plano:{nome:p.nome, valor:String(p.valor), velocidade:p.velocidade, tecnologia:'Fibra Óptica'}
  }];
  faturasList = montarFaturas();
  const periodo = periodoCartao(contratos[0]);
  // o painel espelha o cartão: só as faturas do período vigente
  const doPeriodo = periodo
    ? faturasList.filter(f => f.mes_referencia >= periodo.ini && f.mes_referencia <= periodo.fim)
    : faturasList;
  // mesma contagem do cartão: selos = meses pagos em dia dentro do período
  const streak = slotsDoCartao(periodo, doPeriodo).filter(s => s.estado === 'ok').length;
  renderLedger(periodo);
  renderReadout(streak, premiosGanhos(doPeriodo), periodo);
  renderFidelidade(session.nome, contratos[0], 0, faturasList);
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
planoAtual = 'prata';
document.getElementById('btnPrata').classList.add('on');
// Padrão: cliente de 12 meses atrás — as 12 faturas do cartão já venceram,
// então dá para preencher o cartão inteiro clicando.
const d0 = new Date();
setCadastro(`${d0.getFullYear()-1}-${String(d0.getMonth()+1).padStart(2,'0')}-10`);
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
