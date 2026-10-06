// Inline palette controller shared by both landing pages. ATTR is injected by the generator.
module.exports = (attr, standalone) => `(function(){
  var ATTR=${JSON.stringify(attr)}, root=document.documentElement;
  function viewerMode(){var t=root.getAttribute('data-theme');if(t==='dark'||t==='light')return t;try{return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){return 'light';}}
  var cur=root.getAttribute(ATTR)||'';
  var gender=/akhwat/.test(cur)?'akhwat':'ikhwan';
  var mode=${standalone ? 'viewerMode()' : "/dark/.test(cur)?'dark':'light'"};
  try{var s=JSON.parse(localStorage.getItem('mb.landing')||'null');if(s){gender=s.g||gender;${standalone ? '' : 'mode=s.m||mode;'}}}catch(e){}
  function apply(){
    root.setAttribute(ATTR,gender+'-'+mode);
    root.style.colorScheme=mode;
    document.querySelectorAll('[data-set-g]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-set-g')===gender?'true':'false');});
    document.querySelectorAll('[data-set-m]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-set-m')===mode?'true':'false');});
    try{localStorage.setItem('mb.landing',JSON.stringify({g:gender,m:mode}));}catch(e){}
    document.querySelectorAll('.fk-seg').forEach(function(g){var ind=g.querySelector('.ind'),a=g.querySelector('[aria-pressed="true"],[aria-selected="true"]');if(!ind||!a)return;ind.style.width=a.offsetWidth+'px';ind.style.transform='translateX('+(a.offsetLeft-parseFloat(getComputedStyle(ind).left))+'px)';});
  }
  document.addEventListener('click',function(e){
    var g=e.target.closest&&e.target.closest('[data-set-g]'), m=e.target.closest&&e.target.closest('[data-set-m]');
    if(g){gender=g.getAttribute('data-set-g');apply();}
    if(m){mode=m.getAttribute('data-set-m');apply();}
  });
  ${standalone ? "new MutationObserver(function(){var v=viewerMode();if(v!==mode){mode=v;apply();}}).observe(root,{attributes:true,attributeFilter:['data-theme']});" : ''}
  apply();
})();`;
