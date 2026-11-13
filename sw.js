const CACHE='liftlog-pwa-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const isDocument=event.request.mode==='navigate'||/\/index\.html$/.test(new URL(event.request.url).pathname);
  if(isDocument){
    event.respondWith(fetch(event.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return resp;}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(saved=>saved||fetch(event.request).then(resp=>{if(resp.ok&&event.request.url.startsWith(self.registration.scope)){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return resp;})));
});
