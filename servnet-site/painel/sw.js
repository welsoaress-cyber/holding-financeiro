// Kill-switch: remove o service worker antigo (painel clássico) que ficou
// registrado no escopo /painel/ e limpa os caches dele, para o navegador
// voltar a buscar o painel v2 direto da rede.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
