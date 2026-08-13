// Service worker do PWA — só existe pra deixar o app instalável e carregar
// mais rápido em visitas repetidas. O sistema depende do Supabase pra
// funcionar de verdade, então NÃO promete uso offline: é rede primeiro,
// e só cai no cache (versão anterior) se a rede falhar (ex: sem sinal por
// um instante) — melhor que tela em branco, mas os dados podem estar
// desatualizados até a conexão voltar.
const CACHE_NAME = "holding-app-shell-v1";
const APP_SHELL = [
  "./sistema-financeiro-holding.html",
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
    fetch(event.request)
      .then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
