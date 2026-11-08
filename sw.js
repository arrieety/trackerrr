function setupMap(){
 if(!window.L){
  document.getElementById('mapMessage').textContent='Map library unavailable.';
  return;
 }

 tileLayer=L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
   subdomains:'abcd',
   maxZoom:20,
   attribution:'© OpenStreetMap © CARTO'
  }
 ).addTo(map);

 tileLayer.on('tileerror',()=>{
  document.getElementById('mapMessage').textContent=
   'Map tiles unavailable. Check your internet or map provider access.';
 });

 tileLayer.on('load',()=>{
  document.getElementById('mapMessage').textContent=
   'Lakbay map ready';
 });
}
setupMap();
