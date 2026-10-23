(function(){
  // old single-page links (fullpanel.co/#about) go to the real pages
  var routes={services:"/services/",how:"/how-it-works/",about:"/about/",contact:"/contact/"};
  if(location.pathname==="/"&&routes[location.hash.slice(1)]){location.replace(routes[location.hash.slice(1)]);return}

  // header
  var header=document.querySelector(".site-header");
  window.addEventListener("scroll",function(){header.classList.toggle("scrolled",window.scrollY>8)},{passive:true});
  var mb=document.getElementById("menu-btn"),sheet=document.getElementById("mobile-sheet");
  mb.addEventListener("click",function(){var o=sheet.hidden;sheet.hidden=!o;mb.setAttribute("aria-expanded",String(o));mb.textContent=o?"Close":"Menu"});

  // copy email
  var cp=document.getElementById("copy");
  if(cp)cp.addEventListener("click",function(){var t=document.getElementById("email").textContent;
    function sel(){var r=document.createRange();r.selectNodeContents(document.getElementById("email"));var s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent="Selected"}
    try{navigator.clipboard.writeText(t).then(function(){cp.textContent="Copied"},sel)}catch(e){sel()}
    setTimeout(function(){cp.textContent="Copy"},2000)});

  // form (Formspree, same setup as layered.health)
  var form=document.getElementById("consult-form");
  if(!form)return;
  var status=document.getElementById("form-status"),btn=document.getElementById("f-submit");
  function say(t){status.hidden=false;status.textContent=t}
  function check(id,fieldId,errId,bad){var el=document.getElementById(id);document.getElementById(fieldId).classList.toggle("invalid",bad);el.setAttribute("aria-invalid",String(bad));document.getElementById(errId).hidden=!bad;return el}
  form.addEventListener("submit",function(e){e.preventDefault();
    var n=document.getElementById("f-name"),em=document.getElementById("f-email");
    var badN=!n.value.trim(),badE=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    check("f-name","name-field","f-name-err",badN);check("f-email","email-field","f-email-err",badE);
    if(badN){n.focus();return}if(badE){em.focus();return}
    var endpoint=form.getAttribute("data-endpoint");
    if(!endpoint){say("This form isn't connected yet. Please email info@fullpanel.co and I'll follow up to find a time.");return}
    btn.disabled=true;say("Sending…");
    fetch(endpoint,{method:"POST",headers:{"Accept":"application/json"},body:new FormData(form)})
      .then(function(r){if(!r.ok)throw new Error();form.reset();say("Thanks, your request is in. I'll be in touch to find a time.")})
      .catch(function(){say("Something went wrong. Please try again, or email info@fullpanel.co.")})
      .then(function(){btn.disabled=false});
  });
})();
