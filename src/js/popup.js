/* ============================================================
   Lead-capture pop-up. Markup: _includes/partials/popup.njk.
   Styles: the "Pop-up" section of css/styles.css.

   Desktop: opens on exit intent (the mouse leaves through the top of
   the window) once the visitor has been on the site 30 seconds or has
   scrolled half the page. Phones and touch screens: a slim bar slides
   up after 60% of the page, and tapping it opens the form as a bottom
   sheet. Shows at most once every 14 days, never after a submit, and
   never on the contact page. Add ?popup=1 to a URL to force it open.
   ============================================================ */
(function(){
  var pop=document.getElementById("fp-pop"),bar=document.getElementById("fp-bar");
  if(!pop||!bar)return;
  var card=pop.querySelector(".fp-pop-card"),form=pop.querySelector("form"),btn=form.querySelector('[type="submit"]');
  var fail=form.querySelector(".fp-pop-fail"),label=btn.textContent;
  var KEY="fp-popup",WAIT=14*864e5,EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var force=/[?&]popup=1(&|$)/.test(location.search);
  var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch=window.matchMedia&&matchMedia("(max-width: 767px), (hover: none), (pointer: coarse)").matches;
  if(!force&&(/^\/contact\/?$/.test(location.pathname)||location.hash==="#contact"))return;

  // analytics (no-ops until GA4 is set up in site.json)
  function track(name,params){if(window.gtag)gtag("event",name,params||{})}

  // suppression: {shown: time, done: true} in localStorage. Without storage,
  // `seen` still limits it to once per page load. ?popup=1 skips all of it.
  var seen=false;
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){return null}}
  function save(patch){if(force)return;try{var s=JSON.parse(localStorage.getItem(KEY)||"{}")||{};for(var k in patch)s[k]=patch[k];localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
  function allowed(){
    if(force)return true;if(seen)return false;
    var s=load();if(!s)return true;
    return !s.done&&!(s.shown&&Date.now()-s.shown<WAIT)}
  function markShown(){seen=true;save({shown:Date.now()})}

  // engagement: time on the site (this browser session) and deepest scroll
  var start=Date.now();
  try{start=+sessionStorage.getItem("fp-popup-start")||start;sessionStorage.setItem("fp-popup-start",String(start))}catch(e){}
  var deepest=0;
  function depth(){var max=document.documentElement.scrollHeight-innerHeight;return max>0?scrollY/max:0}

  // background scroll lock, keeping the page from shifting when the scrollbar goes
  function lock(on){var d=document.documentElement;
    if(on){var w=innerWidth-d.clientWidth;d.style.overflow="hidden";if(w>0)d.style.paddingRight=w+"px"}
    else{d.style.overflow="";d.style.paddingRight=""}}

  function show(el){el.hidden=false;void el.offsetWidth;el.classList.add("is-open")}
  function hide(el){el.classList.remove("is-open");if(calm)el.hidden=true;else setTimeout(function(){if(!el.classList.contains("is-open"))el.hidden=true},180)}

  // the dialog (a centered card, or a bottom sheet on touch screens)
  var isOpen=false,lastFocus=null;
  function focusables(){return [].filter.call(card.querySelectorAll('a[href],button:not([disabled]),input:not([type="hidden"]):not(.hp)'),function(el){return el.offsetParent!==null})}
  function open(kind){
    if(isOpen)return;isOpen=true;lastFocus=document.activeElement;
    pop.classList.toggle("is-sheet",touch);
    if(!bar.hidden)hide(bar);
    show(pop);lock(true);
    var step2=!pop.querySelector('[data-pop-step="2"]').hidden;
    (step2?document.getElementById("fp-pop-done"):document.getElementById("fp-pop-name")).focus();
    // opening the sheet from the bar was already counted when the bar appeared
    if(kind!=="sheet"){markShown();track("popup_shown",{popup_type:kind})}}
  function close(){
    if(!isOpen)return;isOpen=false;
    hide(pop);lock(false);track("popup_closed",{popup_type:touch?"sheet":"modal"});
    if(lastFocus&&lastFocus.focus&&lastFocus.offsetParent!==null)lastFocus.focus()}

  [].forEach.call(pop.querySelectorAll("[data-pop-close]"),function(el){el.addEventListener("click",close)});
  document.addEventListener("keydown",function(e){
    if(!isOpen)return;
    if(e.key==="Escape"){e.preventDefault();close();return}
    if(e.key!=="Tab")return;
    // keep Tab and Shift+Tab inside the card
    var f=focusables(),first=f[0],last=f[f.length-1],a=document.activeElement;
    if(e.shiftKey&&(a===first||!card.contains(a))){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&(a===last||!card.contains(a))){e.preventDefault();first.focus()}});
  document.addEventListener("focusin",function(e){if(isOpen&&!card.contains(e.target))focusables()[0].focus()});

  // the slim bar on touch screens
  function showBar(){if(!bar.hidden)return;markShown();show(bar);track("popup_shown",{popup_type:"bar"})}
  bar.querySelector("[data-pop-open]").addEventListener("click",function(){open("sheet")});
  bar.querySelector("[data-bar-close]").addEventListener("click",function(){hide(bar);track("popup_closed",{popup_type:"bar"})});

  // triggers
  if(force){if(touch)showBar();else open("modal")}
  else if(allowed()){
    if(touch){
      var onScroll=function(){deepest=Math.max(deepest,depth());
        if(deepest>=.6){removeEventListener("scroll",onScroll);if(allowed())showBar()}};
      addEventListener("scroll",onScroll,{passive:true});
    }else{
      addEventListener("scroll",function(){deepest=Math.max(deepest,depth())},{passive:true});
      document.addEventListener("mouseout",function(e){
        if(e.relatedTarget||e.clientY>0||isOpen)return;
        if((Date.now()-start>=30000||deepest>=.5)&&allowed())open("modal")});
    }
  }

  // form: inline checks, then the same Formspree request as the contact form
  function setErr(input,msg){var err=document.getElementById(input.id+"-err");
    err.textContent=msg;err.hidden=!msg;input.setAttribute("aria-invalid",msg?"true":"false");return !!msg}
  function check(input){
    if(input.name==="first_name")return setErr(input,input.value.trim()?"":"Please add your first name.");
    if(input.name==="last_name")return setErr(input,input.value.trim()?"":"Please add your last name.");
    var v=input.value.trim();
    return setErr(input,!v?"Please add your email address.":EMAIL_RE.test(v)?"":"Check the email address; it looks incomplete.")}
  [form.first_name,form.last_name,form.email].forEach(function(input){
    input.addEventListener("input",function(){if(input.getAttribute("aria-invalid")==="true")check(input)})});

  form.addEventListener("submit",function(e){e.preventDefault();
    var bad=[form.first_name,form.last_name,form.email].filter(check);
    if(bad.length){bad[0].focus();return}
    fail.hidden=true;btn.disabled=true;btn.textContent="Sending…";
    fetch(form.getAttribute("action"),{method:"POST",headers:{"Accept":"application/json"},body:new FormData(form)})
      .then(function(r){if(!r.ok)throw new Error();return r.json().catch(function(){return{}})})
      .then(function(d){if(d.ok===false)throw new Error();
        seen=true;save({done:true,shown:Date.now()});
        track("popup_submitted",{form_source:"popup"});
        // the same key event the other consult forms send
        track("generate_lead",{form_id:"consult-form",form_source:"popup"});
        // step 2: swap the form for the booking link
        pop.querySelector('[data-pop-step="1"]').hidden=true;
        pop.querySelector('[data-pop-step="2"]').hidden=false;
        card.setAttribute("aria-labelledby","fp-pop-done");card.setAttribute("aria-describedby","fp-pop-done-desc");
        document.getElementById("fp-pop-done").focus()})
      .catch(function(){fail.hidden=false})
      .then(function(){btn.disabled=false;btn.textContent=label})});

  pop.querySelector("[data-pop-book]").addEventListener("click",function(){track("booking_clicked",{form_source:"popup"})});
})();
