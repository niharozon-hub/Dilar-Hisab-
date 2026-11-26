/* অফলাইনে চালানোর ফাইল। অ্যাপ নতুন করে দিলে V-এর সংখ্যা বাড়ান। */
var V='hisab-fb-v79',EXT='hisab-fb-ext';
var CORE=['./','index.html','manifest.webmanifest','offline.html','icon-192.png','icon-512.png','icon-maskable-512.png','logo.png'];
var CDN=/(^|\.)(gstatic\.com|fonts\.googleapis\.com|cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com)$/;
/* একে একে ক্যাশে: কোনো একটি ফাইল ব্যর্থ হলেও পুরো ইনস্টল বসে থাকে না (addAll-এর অ্যাটমিক সমস্যা দূর করা) */
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){
return Promise.all(CORE.map(function(u){
return fetch(u,{cache:'reload'}).then(function(r){if(r&&r.ok)return c.put(u,r.clone())}).catch(function(){/* একটি ব্যর্থ হলেও বাকিগুলো থাকবে */})
})).then(function(){return self.skipWaiting()})
}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('hisab-fb')===0&&k!==V&&k!==EXT}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
var r=e.request,u=new URL(r.url);
if(r.method!=='GET')return;
/* ফায়ারবেসের ডেটা/লগইন অনুরোধ কখনো জমা রাখা হয় না */
if(u.origin!==location.origin&&!CDN.test(u.hostname))return;
if(r.mode==='navigate'){
e.respondWith((async function(){
var cache=await caches.open(V);
var net=fetch(r).then(function(res){if(res&&res.ok)cache.put('index.html',res.clone());return res}).catch(function(){return null});
var hit=await cache.match('index.html');
/* টাইমআউট কমানো: ক্যাশে থাকলে ৩s, না থাকলে ৭s (আগে ছিল ৪s/২০s) */
var first=await Promise.race([net,new Promise(function(ok){setTimeout(function(){ok(null)},hit?3000:7000)})]);
if(first)return first;
if(hit)return hit;
/* সব ব্যর্থ হলে অফলাইন পেজ দেখাও (Response.error()-এর বদলে) */
var off=await cache.match('offline.html');
return off||(await net)||Response.error()})());
return}
if(u.origin===location.origin){
e.respondWith(caches.match(r).then(function(h){return h||fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res})}));
return}
e.respondWith(caches.open(EXT).then(function(c){return c.match(r).then(function(h){
var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(function(){return h});
return h||net})}))});
