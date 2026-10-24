(function(){
  // old single-page links (fullpanel.co/#about) go to the real pages
  var routes={services:"/services/",how:"/how-it-works/",about:"/about/",contact:"/contact/"};
  if(location.pathname==="/"&&routes[location.hash.slice(1)]){location.replace(routes[location.hash.slice(1)]);return}

  // header
  var header=document.querySelector(".site-header");
  window.addEventListener("scroll",function(){header.classList.toggle("scrolled",window.scrollY>8)},{passive:true});
  var mb=document.getElementById("menu-btn"),sheet=document.getElementById("mobile-sheet");
  mb.addEventListener("click",function(){var o=sheet.hidden;sheet.hidden=!o;mb.setAttribute("aria-expanded",String(o));mb.textContent=o?"Close":"Menu"});

  // analytics events (no-ops until GA4 is set up in site.json)
  function track(name,params){if(window.gtag)gtag("event",name,params)}
  document.addEventListener("click",function(e){var a=e.target.closest('a[href^="https://calendar.proton.me/bookings"]');if(a)track("booking_click",{link_url:a.href})});

  // copy email
  var cp=document.getElementById("copy");
  if(cp)cp.addEventListener("click",function(){var t=document.getElementById("email").textContent;
    function sel(){var r=document.createRange();r.selectNodeContents(document.getElementById("email"));var s=getSelection();s.removeAllRanges();s.addRange(r);cp.textContent="Selected"}
    try{navigator.clipboard.writeText(t).then(function(){cp.textContent="Copied"},sel)}catch(e){sel()}
    setTimeout(function(){cp.textContent="Copy"},2000)});

  // forms: consult requests (Formspree, same setup as layered.health) and
  // email signups. A successful consult request sends generate_lead and a
  // signup sends sign_up; neither sends what the person typed.
  var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function setInvalid(form,input,errFor,bad){var field=input.closest(".field");if(field)field.classList.toggle("invalid",bad);input.setAttribute("aria-invalid",String(bad));var err=form.querySelector('[data-error-for="'+errFor+'"]');if(err)err.hidden=!bad}
  [].forEach.call(document.querySelectorAll("form[data-form]"),function(form){
    var kind=form.getAttribute("data-form"),status=form.querySelector(".form-status"),btn=form.querySelector('[type="submit"]');
    function say(t){status.hidden=false;status.textContent=t}
    form.addEventListener("submit",function(e){e.preventDefault();
      // required text boxes (marked data-err) must be filled in; email must look like one
      var firstBad=null,emailIn=form.querySelector('input[type="email"]');
      [].forEach.call(form.querySelectorAll("input[data-err]"),function(input){var bad=!input.value.trim();setInvalid(form,input,input.getAttribute("data-err"),bad);if(bad&&!firstBad)firstBad=input});
      var badE=!EMAIL_RE.test(emailIn.value.trim());setInvalid(form,emailIn,"email",badE);if(badE&&!firstBad)firstBad=emailIn;
      if(firstBad){firstBad.focus();return}
      var endpoint=form.getAttribute("data-endpoint");
      if(!endpoint){say("This form isn't connected yet. Please email info@fullpanel.co.");return}
      var srcIn=form.querySelector('[name="source"],[name="fields[signup_source]"]'),source=srcIn?srcIn.value:"";
      var data=new FormData(form);
      // the hidden trap field is only ever filled in by bots; Formspree checks
      // it itself, MailerLite doesn't know it, so for signups check it here
      if(kind!=="consult"){if(data.get("_gotcha")){form.reset();say(form.getAttribute("data-success"));return}data.delete("_gotcha")}
      btn.disabled=true;say("Sending\u2026");
      // Formspree answers {ok:true}; MailerLite answers {success:true}, and
      // reports errors with a 200 status, so check the body as well
      fetch(endpoint,{method:"POST",headers:{"Accept":"application/json"},body:data})
        .then(function(r){if(!r.ok)throw new Error();return r.json().catch(function(){return{}})})
        .then(function(d){if(d.ok===false||d.success===false)throw new Error();form.reset();
          if(kind==="consult")track("generate_lead",{form_id:"consult-form",form_source:source});
          else track("sign_up",{method:"email",form_source:source});
          say(form.getAttribute("data-success"))})
        .catch(function(){say("Something went wrong. Please try again, or email info@fullpanel.co.")})
        .then(function(){btn.disabled=false});
    });
  });
})();
