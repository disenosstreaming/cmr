// Service worker del CRM móvil.
// Red primero: siempre intenta traer la versión nueva; si no hay internet usa la copia guardada.
// Para forzar que todos descarguen cambios, sube el número de CACHE.
const CACHE='crm-mobile-v1';
const SHELL=['./mobile.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Solo archivos propios; Firebase y fuentes van directo a la red
  if(url.origin!==location.origin)return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./mobile.html')))
  );
});
