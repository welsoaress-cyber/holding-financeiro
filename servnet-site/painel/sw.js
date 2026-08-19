// Service worker do PWA — carregamento rápido com cache + atualização em background.
// Estratégia: stale-while-revalidate.
//   1. Serve o cache imediatamente (carregamento instantâneo em visitas repetidas)
//   2. Busca nova versão em background com "no-cache" (valida ETag/Last-Modified)
//   3. Se o arquivo mudou, atualiza o cache — próxima visita já pega a nova versão
//   4. O app mostra banner "nova versão disponível" via verificarNovaVersao()
//   5. Primeira visita (sem cache): aguarda a rede normalmente
const CACHE_NAME = "holding-app-shell-v3";
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // deixa Supabase/CDNs passarem direto

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);

      // Busca em background: "no-cache" valida com o servidor via ETag/Last-Modified.
      // Se o arquivo não mudou, o servidor responde 304 (sem baixar 812KB de novo).
      // Se mudou, baixa a nova versão e atualiza o cache para a próxima visita.
      const networkFetch = fetch(event.request, { cache: "no-cache" })
        .then((resp) => {
          if (resp.ok) cache.put(event.request, resp.clone());
          return resp;
        })
        .catch(() => cached || new Response("", { status: 503 }));

      // Stale-while-revalidate: cache disponível → entrega imediato + atualiza em background.
      // Sem cache (primeira visita) → aguarda a rede.
      return cached || networkFetch;
    })
  );
});
