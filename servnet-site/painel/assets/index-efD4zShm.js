import{j as d,A as u,l as m,t as r}from"./page-dashboard-Dbqm2OjX.js";import"./supabase-DthfXWp1.js";let a=null;async function s(){var l,c;if(!a)return;const{data:{user:t}}=await d.auth.getUser(),i=(t==null?void 0:t.email)??"—",x=t!=null&&t.created_at?new Date(t.created_at).toLocaleDateString("pt-BR"):"—",f=localStorage.getItem("gt_layout")||"hex",p=document.documentElement.dataset.theme||"dark",g=[{k:"hex",icon:"⬡",label:"Hexagonal"},{k:"square",icon:"⊞",label:"Quadrado"},{k:"circle",icon:"◉",label:"Círculos"},{k:"rect",icon:"☰",label:"Lista"}],n=e=>`
    display:inline-flex;align-items:center;gap:6px;
    padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;
    font-weight:600;border:1px solid;transition:all .18s;
    ${e?"background:var(--primary,#2563eb);color:#fff;border-color:var(--primary,#2563eb);":"background:transparent;color:var(--text-muted,#6b7280);border-color:var(--border,#e5e7eb);"}
  `;a.innerHTML=`
    <div style="padding:16px 16px 32px;max-width:520px;">
      <h1 style="font-size:20px;font-weight:700;margin:0 0 20px;">Configurações</h1>

      <!-- Layout de navegação -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:20px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:600;margin:0 0 6px;color:var(--text-muted,#6b7280);
          text-transform:uppercase;letter-spacing:.04em;">Layout de navegação</h2>
        <p style="font-size:12px;color:var(--text-muted,#9ca3af);margin:0 0 14px;">
          Escolha como os módulos são exibidos na tela principal.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${g.map(e=>`
            <button data-cfg-layout="${e.k}" style="${n(e.k===f)}">
              ${e.icon} ${e.label}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Tema -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:20px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:600;margin:0 0 6px;color:var(--text-muted,#6b7280);
          text-transform:uppercase;letter-spacing:.04em;">Tema</h2>
        <p style="font-size:12px;color:var(--text-muted,#9ca3af);margin:0 0 14px;">
          Aparência da interface.
        </p>
        <div style="display:flex;gap:8px;">
          <button data-cfg-theme="dark"  style="${n(p==="dark")} ">🌙 Escuro</button>
          <button data-cfg-theme="light" style="${n(p==="light")}">☀️ Claro</button>
        </div>
      </div>

      <!-- Perfil -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:20px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:600;margin:0 0 14px;color:var(--text-muted,#6b7280);
          text-transform:uppercase;letter-spacing:.04em;">Perfil</h2>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:2px;">E-mail</div>
            <div style="font-size:15px;font-weight:500;">${i}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted,#9ca3af);margin-bottom:2px;">Usuário desde</div>
            <div style="font-size:14px;">${x}</div>
          </div>
        </div>
      </div>

      <!-- Segurança -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:20px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:600;margin:0 0 14px;color:var(--text-muted,#6b7280);
          text-transform:uppercase;letter-spacing:.04em;">Segurança</h2>
        <button id="btn-alterar-senha" style="
          width:100%;padding:11px;border-radius:8px;
          border:1px solid var(--border,#e5e7eb);
          background:transparent;color:var(--text,#111);
          font-size:14px;font-weight:500;cursor:pointer;text-align:left;
        ">🔑 Alterar senha</button>
      </div>

      <!-- Sobre -->
      <div style="background:var(--bg-card,#fff);border-radius:12px;padding:20px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:16px;">
        <h2 style="font-size:14px;font-weight:600;margin:0 0 14px;color:var(--text-muted,#6b7280);
          text-transform:uppercase;letter-spacing:.04em;">Sobre</h2>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;color:var(--text-muted,#9ca3af);">Aplicação</span>
            <span style="font-size:14px;font-weight:500;">${u} Financeiro</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:14px;color:var(--text-muted,#9ca3af);">Versão</span>
            <span style="font-size:14px;font-weight:500;">${m}</span>
          </div>
        </div>
      </div>

      <!-- Sair -->
      <button id="btn-sair" style="
        width:100%;padding:12px;border-radius:8px;border:none;
        background:#fee2e2;color:#dc2626;
        font-size:14px;font-weight:600;cursor:pointer;
      ">Sair da conta</button>
    </div>
  `,a.querySelectorAll("[data-cfg-layout]").forEach(e=>{e.addEventListener("click",()=>{const o=e.dataset.cfgLayout;typeof window.applyLayout=="function"&&window.applyLayout(o),r.ok("Layout alterado para "+o),s()})}),a.querySelectorAll("[data-cfg-theme]").forEach(e=>{e.addEventListener("click",()=>{const o=e.dataset.cfgTheme;localStorage.setItem("gt_theme",o),typeof window.applyTheme=="function"&&window.applyTheme(o),r.ok("Tema alterado ✓"),s()})}),(l=a.querySelector("#btn-alterar-senha"))==null||l.addEventListener("click",async()=>{const{error:e}=await d.auth.resetPasswordForEmail(i,{redirectTo:`${location.origin}/update-password.html`});e?r.err("Erro: "+e.message):r.ok("E-mail de redefinição enviado para "+i)}),(c=a.querySelector("#btn-sair"))==null||c.addEventListener("click",async()=>{await d.auth.signOut(),window.location.href="/painel/"})}async function v(t){a=t,await s()}export{v as initConfig};
