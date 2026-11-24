// Pure survival rules — independent of rendering.
export const ITEMS={wood:'Legna',stone:'Pietra',fiber:'Fibra',berries:'Bacche',hide:'Pelle',meat:'Carne cruda',food:'Carne cotta',axe:'Ascia di pietra',spear:'Lancia',tunic:'Tunica',boots:'Calzari',campfire:'Falò'};
export const RECIPES=[
{id:'axe',name:'Ascia di pietra',cost:{wood:2,stone:3,fiber:1},desc:'Raccogli più legna e difenditi.'},
{id:'spear',name:'Lancia',cost:{wood:3,stone:2,fiber:2},desc:'Attacchi a distanza ravvicinata più efficaci.'},
{id:'tunic',name:'Tunica grezza',cost:{fiber:6,hide:1},desc:'Protegge dal freddo notturno.'},
{id:'boots',name:'Calzari',cost:{fiber:3,hide:1},desc:'Consuma meno energia correndo.'},
{id:'campfire',name:'Falò',cost:{wood:5,stone:4},desc:'Posiziona un fuoco, scaldati e cucina.'},
{id:'food',name:'Cuoci la carne',cost:{meat:1},fire:true,desc:'Richiede un falò vicino.'}];
export const DEFAULT_CHARACTER={name:'Barbaro',skin:1,hair:0,beard:1,build:1};
export function fresh(character=DEFAULT_CHARACTER){return {v:1,character:{...DEFAULT_CHARACTER,...character},health:100,hunger:100,thirst:100,stamina:100,time:8*60,elapsed:0,inventory:{},equipped:{weapon:null,tunic:false,boots:false},x:0,z:0,yaw:0,harvested:{},fires:[],opened:{},kills:0}}
export const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export function add(s,id,n=1){if(!ITEMS[id]||!Number.isFinite(n)||n<=0)return;s.inventory[id]=(s.inventory[id]||0)+n}
export function has(s,cost){return Object.entries(cost).every(([k,n])=>(s.inventory[k]||0)>=n)}
export function take(s,id,n=1){if((s.inventory[id]||0)<n)return false;s.inventory[id]-=n;if(!s.inventory[id])delete s.inventory[id];return true}
export function craft(s,id,nearFire=false){const r=RECIPES.find(x=>x.id===id);if(!r||!has(s,r.cost)||r.fire&&!nearFire)return false;if(['axe','spear','tunic','boots'].includes(id)&&s.inventory[id])return false;for(const [k,n] of Object.entries(r.cost))take(s,k,n);add(s,id);return true}
export function equip(s,id){if(!(s.inventory[id]>0))return false;if(id==='axe'||id==='spear')s.equipped.weapon=s.equipped.weapon===id?null:id;else if(id==='tunic'||id==='boots')s.equipped[id]=!s.equipped[id];else return false;return true}
export function eat(s,id){if(!['berries','food'].includes(id)||!take(s,id))return false;s.hunger=clamp(s.hunger+(id==='food'?38:13));s.health=clamp(s.health+(id==='food'?6:1));return true}
export function drink(s){s.thirst=clamp(s.thirst+45)}
export function tick(s,dt,{running=false,warm=false}={}){s.elapsed+=dt;s.time+=dt*1.8;const hour=s.time/60%24,night=hour<6||hour>20;s.hunger=clamp(s.hunger-dt*(running?.16:.105));s.thirst=clamp(s.thirst-dt*(running?.24:.14));s.stamina=clamp(s.stamina+dt*(running?(s.equipped.boots?-14:-20):12));if(s.hunger===0||s.thirst===0)s.health=clamp(s.health-dt*2.5);else if(night&&!warm&&!s.equipped.tunic)s.health=clamp(s.health-dt*.23);else if(s.hunger>65&&s.thirst>65)s.health=clamp(s.health+dt*.2)}
export function load(raw){try{const a=JSON.parse(raw);if(a?.v!==1||!a.character||!a.inventory||!Number.isFinite(a.health)||a.health<=0)return null;const s=fresh(a.character);for(const k of ['health','hunger','thirst','stamina'])s[k]=clamp(Number.isFinite(a[k])?a[k]:100);for(const k of ['time','elapsed','kills'])s[k]=Number.isFinite(a[k])?Math.max(0,a[k]):s[k];for(const k of ['x','z'])s[k]=clamp(Number.isFinite(a[k])?a[k]:0,-110,110);s.yaw=Number.isFinite(a.yaw)?a.yaw:0;for(const [k,n] of Object.entries(a.inventory))if(ITEMS[k]&&Number.isInteger(n)&&n>0)s.inventory[k]=Math.min(n,9999);s.equipped={weapon:['axe','spear'].includes(a.equipped?.weapon)&&s.inventory[a.equipped.weapon]?a.equipped.weapon:null,tunic:!!a.equipped?.tunic&&!!s.inventory.tunic,boots:!!a.equipped?.boots&&!!s.inventory.boots};s.harvested=a.harvested&&typeof a.harvested==='object'?a.harvested:{};s.opened=a.opened&&typeof a.opened==='object'?a.opened:{};s.fires=Array.isArray(a.fires)?a.fires.filter(f=>Number.isFinite(f.x)&&Number.isFinite(f.z)).slice(0,30):[];return s}catch{return null}}
