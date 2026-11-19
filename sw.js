var V='dealerhisab-v2',EXT='dealerhisab-ext';
var SHELL=['./','index.html','firebase-config.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==V&&n!==EXT}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);
 if(u.hostname==='www.gstatic.com'&&u.pathname.indexOf('/firebasejs/')===0){e.respondWith(caches.open(EXT).then(function(c){return c.match(r).then(function(m){return m||fetch(r).then(function(x){if(x&&x.ok)c.put(r,x.clone());return x})})}));return}
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(r).then(function(x){if(x&&x.ok){var cl=x.clone();caches.open(V).then(function(c){c.put(r,cl)})}return x}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('index.html')})}));
});
