
document.addEventListener("DOMContentLoaded", ()=>{
  var xMousePosition = 0;
  var yMousePosition = 0;
  document.addEventListener('mousemove',(e) => {
    xMousePosition = e.clientX + window.pageXOffset;
    yMousePosition = e.clientY + window.pageYOffset;
  });


  function OK()
  {
    alert("Renommer");
  }

  function NOK()
  {
    alert("Editer");
  }

  var contextmenu = (element) => {
    element.addEventListener('contextmenu', (event) => {rightClic(event)});
    function rightClic (event){
      event.preventDefault();
      var x = document.getElementById('ctxmenu1');
      if(x) x.parentNode.removeChild(x);

      var d = document.createElement('div');
      d.setAttribute('class', 'ctxmenu');
      d.setAttribute('id', 'ctxmenu1');
      element.parentNode.appendChild(d);
      d.style.left = xMousePosition + "px";
      d.style.top = yMousePosition + "px";
      d.addEventListener('mouseover', (e) => { this.style.cursor = 'pointer'; });
      d.addEventListener('click', (e) => { element.parentNode.removeChild(d);  });
      document.body.addEventListener('click', (e) => { element.parentNode.removeChild(d);  });

      var p = document.createElement('p');
      d.appendChild(p);
      p.addEventListener('click', () => { OK(); });
      p.setAttribute('class', 'ctxline');
      p.innerHTML = "OK";

      var p2 = document.createElement('p');
      d.appendChild(p2);
      p2.addEventListener('click', () =>  { NOK(); });
      p2.setAttribute('class', 'ctxline');
      p2.innerHTML = "NOK";

      return false;
    }
  };
  var cP = (function(){
    // déclaration de fonction constructeur
    var ConstructOfPosition = function(left, top, width, height, src){
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      this.src = src;
    };

    return function(l, t, w, h, s){
      // création d'un nouvel objet avec la fonction constructeur
      return new ConstructOfPosition(l, t, w, h, s);
    }
  })();
});
