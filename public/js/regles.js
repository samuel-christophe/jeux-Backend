'use strict'

window.addEventListener('DOMContentLoaded',()=>{
  var start = document.getElementById('start').style;
  window.addEventListener('scroll', (element)=>{
    start.top = (220 + element.view.scrollY) + 'px';
  });
});
