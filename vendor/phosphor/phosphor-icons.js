/* Phosphor Icons v2.1.1 — Local loader (vendorized) */
(function(){
  var base = document.currentScript.src.replace(/[^/]*$/, '');
  var weights = ['regular','fill','bold','duotone'];
  var head = document.head;
  weights.forEach(function(w){
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + w + '.css';
    head.appendChild(link);
  });
})();
