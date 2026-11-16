(function(){
  "use strict";

  /* ============================================================
     CONFIGURACIÓN DE CONTACTO: único lugar a editar.
     - whatsapp: número con código de país, solo dígitos (ej. "593999999999")
     - instagram / tiktok: URL completa del perfil
     - email: correo de la marca
     Lo que esté vacío no se muestra en la página.
     ============================================================ */
  var CONFIG = {
    whatsapp: "593979865271",
    instagram: "https://www.instagram.com/wallis.ec/?hl=es",
    tiktok: "",
    email: ""
  };

  document.documentElement.classList.remove("no-js");
  var sinMov = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hayIO = "IntersectionObserver" in window;

  function waUrl(texto){
    return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
  }

  /* Canales de contacto: se activan solo si están configurados */
  var canales = {
    whatsapp: CONFIG.whatsapp && waUrl("Hola Walli’s, quiero más información."),
    instagram: CONFIG.instagram,
    tiktok: CONFIG.tiktok,
    email: CONFIG.email && "mailto:" + CONFIG.email
  };
  Object.keys(canales).forEach(function(k){
    var li = document.querySelector('[data-canal="' + k + '"]');
    if(!li || !canales[k]) return;
    li.hidden = false;
    var a = li.querySelector("a");
    if(k !== "whatsapp") a.href = canales[k];
  });

  /* Botones "Pedir": WhatsApp con mensaje precargado; si no hay número, llevan al formulario */
  if(CONFIG.whatsapp){
    document.querySelectorAll("[data-wa]").forEach(function(a){
      a.href = waUrl(a.getAttribute("data-wa"));
      a.target = "_blank"; a.rel = "noopener";
      a.removeAttribute("data-pedir");
    });
  }

  /* Navegación: borde al bajar (IntersectionObserver, sin listener de scroll) */
  var nav = document.getElementById("nav");
  var centinela = document.createElement("div");
  centinela.style.cssText = "position:absolute;top:0;height:8px;width:1px;pointer-events:none";
  document.body.prepend(centinela);
  if(hayIO){
    new IntersectionObserver(function(e){
      nav.classList.toggle("scrolled", !e[0].isIntersecting);
    }).observe(centinela);
  }

  /* Menú móvil */
  var btn = document.querySelector(".hamb");
  var menu = document.getElementById("menu-principal");
  function cerrarMenu(foco){
    if(!nav.classList.contains("abierto")) return;
    nav.classList.remove("abierto");
    btn.setAttribute("aria-expanded","false");
    btn.setAttribute("aria-label","Abrir menú");
    if(foco) btn.focus();
  }
  btn.addEventListener("click", function(){
    var ab = nav.classList.toggle("abierto");
    btn.setAttribute("aria-expanded", ab ? "true" : "false");
    btn.setAttribute("aria-label", ab ? "Cerrar menú" : "Abrir menú");
  });
  menu.addEventListener("click", function(e){ if(e.target.closest("a")) cerrarMenu(false); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") cerrarMenu(true); });
  window.addEventListener("resize", function(){ if(window.innerWidth > 980) cerrarMenu(false); });

  /* Revelado al entrar en pantalla */
  var rev = document.querySelectorAll(".revelar");
  if(sinMov || !hayIO){
    rev.forEach(function(el){ el.classList.add("visible"); });
  } else {
    var obs = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, {threshold:0.1, rootMargin:"0px 0px -50px 0px"});
    rev.forEach(function(el){ obs.observe(el); });
  }

  /* "Pedir X" preselecciona el producto en el formulario */
  var interes = document.getElementById("f-interes");
  document.addEventListener("click", function(e){
    var a = e.target.closest("[data-pedir]");
    if(!a || !interes) return;
    for(var i = 0; i < interes.options.length; i++){
      if(interes.options[i].text === a.getAttribute("data-pedir")){ interes.selectedIndex = i; break; }
    }
  });

  /* Calculadora: 15 g de Walli’s = 120 a 150 g de fruta fresca */
  var rango = document.getElementById("porciones");
  if(rango){
    var lin = document.getElementById("calc-lin");
    var seco = document.getElementById("calc-seco");
    var fresco = document.getElementById("calc-fresco");
    var pintar = function(){
      var n = +rango.value;
      lin.textContent = n + (n === 1 ? " porción al día" : " porciones al día");
      seco.textContent = (15 * n) + " g";
      fresco.textContent = (120 * n) + "-" + (150 * n) + " g";
    };
    rango.addEventListener("input", pintar);
    pintar();
  }

  /* Barra de pedido en móvil: visible fuera del hero y del formulario */
  var barra = document.getElementById("barra-movil");
  var hero = document.querySelector(".hero");
  var form = document.getElementById("form-contacto");
  if(barra && hero && form && hayIO){
    barra.hidden = false;
    var vis = {hero:true, form:false};
    var actualizar = function(){ barra.classList.toggle("visible", !vis.hero && !vis.form); };
    new IntersectionObserver(function(e){ vis.hero = e[0].isIntersecting; actualizar(); }).observe(hero);
    new IntersectionObserver(function(e){ vis.form = e[0].isIntersecting; actualizar(); }).observe(form);
  }

  var anio = document.getElementById("anio");
  if(anio) anio.textContent = new Date().getFullYear();

  /* Formulario: validación junto al campo y envío por WhatsApp */
  var ok = document.getElementById("form-ok");
  var enviar = document.getElementById("btn-enviar");
  function error(id, msg, campo){
    var p = document.getElementById(id);
    p.textContent = msg; p.hidden = !msg;
    if(campo) campo.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      ok.classList.remove("visible");
      var n = form.nombre, m = form.email, av = form.aviso;
      var v1 = n.value.trim() ? "" : "Escribe tu nombre.";
      var v2 = !m.value.trim() ? "Escribe tu correo." : (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.value) ? "" : "Revisa el formato del correo.");
      var v3 = av.checked ? "" : "Debes aceptar para poder responderte.";
      error("e-nombre", v1, n); error("e-email", v2, m); error("e-aviso", v3, null);
      var primero = v1 ? n : (v2 ? m : (v3 ? av : null));
      if(primero){ primero.focus(); return; }

      if(!CONFIG.whatsapp){
        /* Sin canal configurado NO se simula un envío exitoso: se avisa. */
        ok.textContent = "Este formulario aún no está conectado a un canal de contacto. Tu mensaje no se ha enviado.";
        ok.classList.add("visible");
        return;
      }
      var texto = "Hola Walli’s, soy " + n.value.trim() + " (" + m.value.trim() + ").\nMe interesa: " + form.interes.value + "." +
        (form.mensaje.value.trim() ? "\n" + form.mensaje.value.trim() : "");
      window.open(waUrl(texto), "_blank", "noopener");
      ok.textContent = "¡Gracias! Se abrió WhatsApp con tu mensaje listo para enviar.";
      ok.classList.add("visible");
      form.reset();
    });
    form.addEventListener("input", function(e){
      var map = {nombre:"e-nombre", email:"e-email", aviso:"e-aviso"};
      if(map[e.target.name]) error(map[e.target.name], "", e.target);
    });
  }
})();
