(function(){
  // old single-page links (fullpanel.co/#about) go to the real pages
  var routes={services:"/services/",how:"/how-it-works/",about:"/about/",contact:"/contact/"};
  if(location.pathname==="/"&&routes[location.hash.slice(1)]){location.replace(routes[location.hash.slice(1)]);return}

  // motion: cards fade up as they scroll in, and the stats count up. Skipped
  // with reduced motion or without IntersectionObserver, which leaves
  // everything visible and the numbers as written.
  var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!calm&&"IntersectionObserver" in window){
    // cards and list items; anything already on screen stays put so the page never flashes
    var revealIO=new IntersectionObserver(function(entries){
      var shown=0;
      entries.forEach(function(en){if(!en.isIntersecting)return;var el=en.target;
        // items arriving together cascade, 70ms apart, at most 280ms
        el.style.setProperty("--reveal-delay",Math.min(shown++*70,280)+"ms");el.classList.add("in");revealIO.unobserve(el);
        // once its own slide-up ends, drop the classes so later hovers and sticky children behave normally
        el.addEventListener("transitionend",function done(e){if(e.target!==el||e.propertyName!=="transform")return;el.removeEventListener("transitionend",done);el.classList.remove("reveal","in");el.style.removeProperty("--reveal-delay")})});
    },{rootMargin:"0px 0px -8% 0px",threshold:.12});
    [].forEach.call(document.querySelectorAll(".card,.step,.principles li,.facts li,.feel-list li,.svc,.timeline li,.faq details,.cta,.capture"),function(el){
      if(el.getBoundingClientRect().top<innerHeight)return;
      el.classList.add("reveal");revealIO.observe(el)});

    // stats: "300+" ticks up from 0 the first time it's on screen
    var ease=function(t){return 1-Math.pow(1-t,4)};
    var countIO=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(!en.isIntersecting)return;countIO.unobserve(en.target);
        var el=en.target,shown=el.firstChild,target=+el.getAttribute("data-count"),suffix=el.getAttribute("data-suffix"),start=null,dur=1400;
        function frame(now){if(start===null)start=now;var t=Math.min((now-start)/dur,1);shown.textContent=Math.round(target*ease(t))+suffix;if(t<1)requestAnimationFrame(frame)}
        requestAnimationFrame(frame)});
    },{threshold:.6});
    [].forEach.call(document.querySelectorAll(".fact-num"),function(el){
      var m=el.textContent.trim().match(/^(\d+)(.*)$/);if(!m)return;
      // screen readers get the real figure; the ticking copy is hidden from them
      el.setAttribute("data-count",m[1]);el.setAttribute("data-suffix",m[2]);
      el.innerHTML='<span aria-hidden="true">0'+m[2]+'</span><span class="visually-hidden">'+m[0]+'</span>';
      countIO.observe(el)});
  }

  // header
  var header=document.querySelector(".site-header");
  window.addEventListener("scroll",function(){header.classList.toggle("scrolled",window.scrollY>8)},{passive:true});
  var mb=document.getElementById("menu-btn"),sheet=document.getElementById("mobile-sheet");
  mb.addEventListener("click",function(){var o=sheet.hidden;sheet.hidden=!o;mb.setAttribute("aria-expanded",String(o));mb.textContent=o?"Close":"Menu"});

  // analytics events (no-ops until GA4 is set up in site.json)
  function track(name,params){if(window.gtag)gtag("event",name,params)}
  document.addEventListener("click",function(e){var a=e.target.closest('a[href^="https://calendar.proton.me/bookings"]');if(a)track("booking_click",{link_url:a.href})});
  document.addEventListener("click",function(e){var a=e.target.closest("a[data-cta]");if(a)track("consult_cta_click",{form_source:a.getAttribute("data-cta")})});

  // founders rate: /contact/?offer=founders adds it to the consult request and says so above the form
  if(/[?&]offer=founders(&|$)/.test(location.search)){
    [].forEach.call(document.querySelectorAll('input[name="offer"]'),function(i){i.value="Founders rate (40% off setup services)"});
    [].forEach.call(document.querySelectorAll("[data-offer-note]"),function(n){n.hidden=false})}

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
