(() => {
'use strict';
const $=id=>document.getElementById(id),all=(s,root=document)=>Array.from(root.querySelectorAll(s));
const games=Array.isArray(window.MEDUSA_GAMES)?window.MEDUSA_GAMES:[],ready=games.filter(g=>g.playable&&g.url);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let status='all',genre='',query='';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const matches=g=>(status==='all'||(status==='playable'?g.playable:!g.playable))&&(!genre||g.genres.includes(genre))&&(!query||norm([g.title,g.subtitle,g.description,...g.genres].join(' ')).includes(query));
function el(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!=null)node.textContent=text;return node}
function nodeLink(g,cls,label){const a=el('a',cls,label);a.href=g.url;a.dataset.play=g.id;a.setAttribute('aria-label','Gioca a '+g.title);return a}
function artwork(g){
 const art=el('div','card-bg art-'+g.art);art.setAttribute('aria-hidden','true');
 if(g.cover){art.style.backgroundImage='url("'+g.cover+'")';return art}
 const symbol=el('div','art-symbol');
 const common='<defs><linearGradient id="h'+g.id+'" x2="1" y2="1"><stop stop-color="'+g.color+'"/><stop offset="1" stop-color="#17273c"/></linearGradient></defs>';
 let content='';
 if(g.art==='naval'){
  content='<g transform="translate(170 84) rotate(-19)"><path d="M-80 0L-35 -25 50 -25 95 0 50 25 -35 25Z" fill="#18283b" stroke="#81e9ff" stroke-width="2"/><path d="M-48 -13H42L63 0 42 13H-48Z" fill="url(#h'+g.id+')"/><rect x="-20" y="-13" width="27" height="26" rx="3" fill="#304a63" stroke="#a1f8ff"/><path d="M5 0H61" stroke="#c9f9ff" stroke-width="5"/><path d="M-56 -9H-34M-56 9H-34" stroke="#b0f9ff" stroke-width="3"/></g><path d="M0 138L300 52M0 155L300 69" stroke="#a7eaff" stroke-opacity=".18" stroke-width="2"/>';
 }else if(g.art==='stack'){
  const blocks=[[96,125],[136,125],[176,125],[116,90],[156,90],[136,55],[176,20]];
  content=blocks.map(([x,y],i)=>'<g transform="translate('+x+' '+y+')"><path d="M0 0L20 -11 40 0 20 11Z" fill="'+(i%2?'#edc9ff':'#98e7ff')+'"/><path d="M0 0V25L20 36V11Z" fill="'+(i%2?'#8253c0':'#407a9f')+'"/><path d="M20 11L40 0V25L20 36Z" fill="'+(i%2?'#51317d':'#244c73')+'"/></g>').join('');
 }else{
  content='<path d="M18 139H280M31 155H265" stroke="#f4b2e2" stroke-opacity=".25" stroke-width="3"/><path d="M103 60Q103 18 150 18T197 60V126L181 111 166 130 150 111 134 130 119 111 103 126Z" fill="url(#h'+g.id+')" stroke="#ffe0f8" stroke-width="2"/><ellipse cx="135" cy="65" rx="8" ry="12" fill="#20162a"/><ellipse cx="168" cy="65" rx="8" ry="12" fill="#20162a"/><path d="M31 65H89M52 85H90M10 105H75" stroke="#ffb2e5" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/>';
 }
 symbol.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 170">'+common+content+'</svg>';art.append(symbol);return art;
}
function feature(g){
 const c=el('article','feature-card');c.style.setProperty('--accent',g.color);c.append(artwork(g),el('div','card-mask'),el('span','tag',g.version?'✦ UPDATE V'+g.version:'✦ GIOCABILE ORA'),el('h3','',g.title),el('div','genre-line',g.genres.join(' · ')),el('p','',g.subtitle),nodeLink(g,'btn','▶ Gioca ora ›'));return c;
}
function card(g){
 const c=el('article','game-card');c.style.setProperty('--accent',g.color);
 const pic=el('div','game-picture');pic.append(artwork(g),el('div','card-mask'),el('span','tag',g.playable?'● GIOCABILE':'IN SVILUPPO'));
 const copy=el('div','game-card-copy');copy.append(el('h3','',g.title),el('div','genre-line',g.genres.join(' · ')),el('p','',g.description));
 if(g.playable&&g.url)copy.append(nodeLink(g,'btn','▶ Gioca ora'));else copy.append(el('span','soon','Prossimamente'));
 c.append(pic,copy);return c;
}
function render(){
 const list=games.filter(matches),grid=$('game-grid');grid.replaceChildren(...list.map(card));
 $('catalog-count').textContent=list.length+' di '+games.length+' giochi'+(genre?' · '+genre:'');
 $('empty').hidden=!!list.length;$('clear-genre').hidden=!genre;
 all('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.status===status)));
 all('[data-genre]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.genre===genre)));
}
function storageRead(){try{const data=JSON.parse(localStorage.getItem('medusa-recent-v1')||'[]');return Array.isArray(data)?data.filter(id=>ready.some(g=>g.id===id)).slice(0,4):[]}catch{return[]}}
function remember(id){try{localStorage.setItem('medusa-recent-v1',JSON.stringify([id,...storageRead().filter(x=>x!==id)].slice(0,4)))}catch{}}
function recent(){const ids=storageRead();$('recent').hidden=!ids.length;$('recent-grid').replaceChildren(...ids.map(id=>{const g=ready.find(x=>x.id===id),a=nodeLink(g,'recent-game',g.title);a.append(el('span','','▶'));return a}))}
$('featured-grid').replaceChildren(...ready.filter(g=>g.featured).map(feature));$('available-count').textContent=ready.length;$('upcoming-count').textContent=games.filter(g=>!g.playable).length;
render();recent();
document.addEventListener('click',e=>{
 const play=e.target.closest('[data-play]');if(play){remember(play.dataset.play);return}
 const filter=e.target.closest('[data-status]');if(filter){status=filter.dataset.status;render();return}
 const cat=e.target.closest('[data-genre]');if(cat){genre=genre===cat.dataset.genre?'':cat.dataset.genre;status='all';query='';$('search').value='';render();$('games').scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});return}
});
$('search').addEventListener('input',e=>{query=norm(e.target.value);render()});
$('clear-genre').addEventListener('click',()=>{genre='';render()});
$('reset-filters').addEventListener('click',()=>{status='all';genre=query='';$('search').value='';render()});
$('random-game').disabled=!ready.length;$('random-game').addEventListener('click',()=>{if(!ready.length)return;const last=storageRead()[0],pool=ready.length>1?ready.filter(g=>g.id!==last):ready,g=pool[Math.floor(Math.random()*pool.length)];remember(g.id);window.location.href=g.url});
const toggle=$('menu-toggle'),nav=$('nav');
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'}
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰'});
all('a',nav).forEach(a=>a.addEventListener('click',()=>{all('a',nav).forEach(x=>x.classList.toggle('active',x===a));closeMenu()}));
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();toggle.focus()}});
window.addEventListener('pageshow',recent);
if(!reduced){
 const particles=$('hero-particles');
 for(let i=0;i<38;i++){const p=el('i');p.style.setProperty('--x',((i*37.91)%100)+'%');p.style.setProperty('--s',(1.2+i%4*.65)+'px');p.style.setProperty('--color',i%3?'#9dff9d':'#bf94ff');p.style.setProperty('--duration',(7+i%8)+'s');p.style.setProperty('--delay',(-i*.37)+'s');particles.append(p)}
 const hero=document.querySelector('.hero'),art=document.querySelector('.hero-art');
 if(window.matchMedia('(pointer:fine)').matches){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;art.style.transform='scale(1.06) translate('+(-x*12)+'px,'+(-y*9)+'px)'});hero.addEventListener('pointerleave',()=>art.style.transform='scale(1.025)')}
 if('IntersectionObserver' in window){
  document.documentElement.classList.add('js-motion');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.07});all('.reveal').forEach(n=>observer.observe(n));
 }
}
})();