var r=FetchEvent.prototype.respondWith
FetchEvent.prototype.respondWith=function(){return new URL(this.request.url).search.endsWith("bypass-sw")?void 0:r.apply(this,arguments)}