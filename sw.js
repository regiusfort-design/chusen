/* 夏祭り抽選券 QR入力 ─ オフライン用サービスワーカー
   アプリを更新したら下の CACHE のバージョン番号(v2 の数字)を上げてください。 */
var CACHE = "natsumatsuri-qr-v2";
var ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon.svg"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        // 取得できたものはキャッシュに追加(同一オリジンのみ)
        try{
          if(res && res.status === 200 && e.request.url.indexOf(self.location.origin) === 0){
            var copy = res.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          }
        }catch(err){}
        return res;
      }).catch(function(){
        // オフラインでナビゲーション時は index.html を返す
        if(e.request.mode === "navigate") return caches.match("index.html");
      });
    })
  );
});
