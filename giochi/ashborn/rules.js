// Pure survival rules — independent of rendering.
export const ITEMS={bench:'Banco da lavoro',wood:'Legna',stone:'Pietra',fiber:'Fibra',berries:'Bacche',hide:'Pelle',meat:'Carne cruda',food:'Carne cotta',axe:'Ascia di pietra',pickaxe:'Piccone di pietra',sword:'Spada di pietra',spear:'Lancia',tunic:'Tunica',boots:'Calzari',campfire:'Falò',hammer:'Martello',plank:'Tavole di legno',flint:'Selce',resin:'Resina',mushroom:'Funghi',clay:'Argilla',copper:'Minerale di rame',torch:'Torcia',flintaxe:'Ascia di selce',oak:'Legno di quercia',cactus:'Frutto del deserto',icecrystal:'Cristallo di gelo',reed:'Giunco palustre',amber:'Ambra',bone:'Ossa',fang:'Zanna',fur:'Pelliccia',venom:'Essenza palustre',linen:'Tela grezza',wintercoat:'Mantello di pelliccia'};
export const RECIPES=[
{id:'bench',name:'Banco da lavoro',cost:{wood:4},desc:'Crea il banco e posizionalo sul terreno. Premi E accanto ad esso per aprire le ricette avanzate.'},
{id:'axe',name:'Ascia di pietra',cost:{wood:2,stone:3,fiber:1},desc:'5 danni al legno per colpo.'},
{id:'pickaxe',name:'Piccone di pietra',cost:{wood:2,stone:4,fiber:2},desc:'6 danni alle rocce per colpo.'},
{id:'sword',name:'Spada di pietra',cost:{wood:2,stone:5,fiber:2},desc:'30 danni agli animali per colpo.'},
{id:'spear',name:'Lancia',cost:{wood:3,stone:2,fiber:2},desc:'Attacchi a distanza ravvicinata più efficaci.'},
{id:'tunic',name:'Tunica grezza',cost:{fiber:6,hide:1},desc:'Protegge dal freddo notturno.'},
{id:'boots',name:'Calzari',cost:{fiber:3,hide:1},desc:'Consuma meno energia correndo.'},
{id:'campfire',name:'Falò',cost:{wood:5,stone:4},desc:'Posiziona un fuoco, scaldati e cucina.'},
{id:'hammer',name:'Martello',cost:{wood:3,stone:2},desc:'Apre la modalità costruzione.'},
{id:'plank',name:'Tavole di legno',cost:{wood:2},qty:4,bench:true,desc:'Quattro tavole per costruire pavimenti e pareti.'},
{id:'torch',name:'Torcia',cost:{wood:1,resin:2},bench:true,desc:'Illumina la notte se equipaggiata.'},
{id:'flintaxe',name:'Ascia di selce',cost:{wood:3,flint:4,fiber:2},bench:true,desc:'8 danni al legno per colpo.'},
{id:'food',name:'Cuoci la carne',cost:{meat:1},fire:true,desc:'Richiede un falò vicino.'}];
export const LIMIT=480;
for(const r of RECIPES)if(!['bench','hammer','campfire','axe','food'].includes(r.id))r.bench=true;
RECIPES.push({id:'linen',name:'Tela grezza',cost:{fiber:3,reed:2},qty:2,bench:true,desc:'Tessuto ricavato da fibre e giunchi.'},{id:'wintercoat',name:'Mantello di pelliccia',cost:{fur:3,linen:2},bench:true,desc:'Protezione dal freddo, anche sulle montagne.'});
export const LIMIT_OLD=230;
export const WEAPONS=['axe','pickaxe','sword','spear','hammer','torch','flintaxe'];
export const QUICK_ITEMS=[...WEAPONS,'bench','tunic','boots','wintercoat','berries','food','mushroom','cactus'];
export const HP={wood:15,stone:12,fiber:3,berries:3,chest:10,wolf:55,boar:70,deer:40,flint:5,clay:8,copper:18,mushroom:2,oak:25,cactus:4,icecrystal:22,reed:4,amber:12,rabbit:18,fox:32,scorpion:45,icewolf:80,crocodile:95,shade:45,forestwraith:65,sandstalker:70,frostwraith:90,swampwraith:80};
export const DAMAGE={hand:{wood:1,stone:1,fiber:1,berries:1,chest:1,animal:5},axe:{wood:5,stone:1,fiber:2,berries:2,chest:5,animal:14},pickaxe:{wood:1,stone:6,fiber:1,berries:1,chest:2,animal:10},sword:{wood:1,stone:1,fiber:3,berries:3,chest:2,animal:30},spear:{wood:1,stone:1,fiber:1,berries:1,chest:1,animal:24}};
export const hitDamage=(weapon,kind)=>{const k=['wolf','boar','deer','rabbit','fox','scorpion','icewolf','crocodile','shade','forestwraith','sandstalker','frostwraith','swampwraith'].includes(kind)?'animal':['flint','clay','copper','icecrystal','amber'].includes(kind)?'stone':kind==='oak'?'wood':kind==='reed'?'fiber':['mushroom','cactus'].includes(kind)?'berries':kind;return (weapon==='flintaxe'?{...DAMAGE.axe,wood:8,animal:20}:weapon==='hammer'?{...DAMAGE.hand,wood:2,stone:2}:DAMAGE[weapon]||DAMAGE.hand)[k]||1};
export function movement(x,z,yaw){return {dx:-Math.cos(yaw)*x+Math.sin(yaw)*z,dz:Math.sin(yaw)*x+Math.cos(yaw)*z}}
export function assignSlot(s,i,id){if(!Number.isInteger(i)||i<0||i>8||id!==null&&!s.inventory[id])return false;if(id){const previous=s.hotbar.indexOf(id);if(previous>=0)s.hotbar[previous]=null}s.hotbar[i]=id;if(i===s.selected||!s.hotbar[s.selected])selectSlot(s,s.selected);return true}
export function selectSlot(s,i){if(!Number.isInteger(i)||i<0||i>8)return false;s.selected=i;const id=s.hotbar[i];s.equipped.weapon=WEAPONS.includes(id)&&s.inventory[id]?id:null;return true}
export const DEFAULT_CHARACTER={name:'Barbaro',skin:1,hair:0,beard:1,build:1,eyes:0,hairColor:0,face:0,mark:0,height:1};
export function fresh(character=DEFAULT_CHARACTER){return {v:4,buildings:[],nextBuildId:1,hotbar:Array(9).fill(null),selected:0,damage:{},character:{...DEFAULT_CHARACTER,...character},health:100,hunger:100,thirst:100,stamina:100,time:8*60,elapsed:0,inventory:{},equipped:{weapon:null,tunic:false,boots:false,wintercoat:false},x:0,z:0,yaw:0,harvested:{},fires:[],opened:{},kills:0}}
export const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export function add(s,id,n=1){if(!ITEMS[id]||!Number.isFinite(n)||n<=0)return;s.inventory[id]=(s.inventory[id]||0)+n;if(QUICK_ITEMS.includes(id)&&!s.hotbar.includes(id)){const i=s.hotbar.findIndex((v,i)=>i>0&&v===null);if(i>=0)s.hotbar[i]=id}}
export function has(s,cost){return Object.entries(cost).every(([k,n])=>(s.inventory[k]||0)>=n)}
export function take(s,id,n=1){if((s.inventory[id]||0)<n)return false;s.inventory[id]-=n;if(!s.inventory[id]){delete s.inventory[id];for(let i=0;i<9;i++)if(s.hotbar[i]===id)s.hotbar[i]=null;if(s.equipped.weapon===id)s.equipped.weapon=null}return true}
export function craft(s,id,nearFire=false,nearBench=false){const r=RECIPES.find(x=>x.id===id);if(!r||!has(s,r.cost)||r.fire&&!nearFire||r.bench&&!nearBench)return false;if([...WEAPONS,'tunic','boots','wintercoat'].includes(id)&&s.inventory[id])return false;for(const [k,n] of Object.entries(r.cost))take(s,k,n);add(s,id,r.qty||1);return true}
export function equip(s,id){if(!(s.inventory[id]>0))return false;if(WEAPONS.includes(id)){if(s.equipped.weapon===id){const empty=s.hotbar.findIndex(v=>v===null);if(empty>=0)selectSlot(s,empty);else assignSlot(s,s.selected,null);s.equipped.weapon=null}else{let i=s.hotbar.indexOf(id);if(i<0){i=s.hotbar.findIndex(v=>v===null);if(i<0)i=s.selected;assignSlot(s,i,id)}selectSlot(s,i)}}else if(id==='tunic'||id==='boots'||id==='wintercoat')s.equipped[id]=!s.equipped[id];else return false;return true}
export function eat(s,id){if(!['berries','food','mushroom','cactus'].includes(id)||!take(s,id))return false;s.hunger=clamp(s.hunger+(id==='food'?38:id==='mushroom'?18:id==='cactus'?22:13));s.health=clamp(s.health+(id==='food'?6:1));return true}
export function drink(s){s.thirst=clamp(s.thirst+45)}
export function tick(s,dt,{running=false,warm=false,cold=false}={}){s.elapsed+=dt;s.time+=dt*1.8;const hour=s.time/60%24,night=hour<6||hour>20;s.hunger=clamp(s.hunger-dt*(running?.16:.105));s.thirst=clamp(s.thirst-dt*(running?.24:.14));s.stamina=clamp(s.stamina+dt*(running?(s.equipped.boots?-14:-20):12));if(s.hunger===0||s.thirst===0)s.health=clamp(s.health-dt*2.5);else if((night||cold)&&!warm&&!s.equipped.wintercoat&&(!s.equipped.tunic||cold))s.health=clamp(s.health-dt*.23);else if(s.hunger>65&&s.thirst>65)s.health=clamp(s.health+dt*.2)}
export function load(raw){try{const a=JSON.parse(raw);if(![1,2,3,4].includes(a?.v)||!a.character||!a.inventory||!Number.isFinite(a.health)||a.health<=0)return null;const s=fresh(a.character);for(const k of ['health','hunger','thirst','stamina'])s[k]=clamp(Number.isFinite(a[k])?a[k]:100);for(const k of ['time','elapsed','kills'])s[k]=Number.isFinite(a[k])?Math.max(0,a[k]):s[k];for(const k of ['x','z'])s[k]=clamp(Number.isFinite(a[k])?a[k]:0,-LIMIT,LIMIT);s.yaw=Number.isFinite(a.yaw)?a.yaw:0;for(const [k,n] of Object.entries(a.inventory))if(ITEMS[k]&&Number.isInteger(n)&&n>0)s.inventory[k]=Math.min(n,9999);s.equipped={weapon:WEAPONS.includes(a.equipped?.weapon)&&s.inventory[a.equipped.weapon]?a.equipped.weapon:null,tunic:!!a.equipped?.tunic&&!!s.inventory.tunic,boots:!!a.equipped?.boots&&!!s.inventory.boots,wintercoat:!!a.equipped?.wintercoat&&!!s.inventory.wintercoat};s.harvested=a.v>=4&&a.harvested&&typeof a.harvested==='object'?a.harvested:{};s.damage=a.v>=4&&a.damage&&typeof a.damage==='object'?a.damage:{};if(Array.isArray(a.hotbar)){s.hotbar=Array.from({length:9},(_,i)=>s.inventory[a.hotbar[i]]?a.hotbar[i]:null);selectSlot(s,Number.isInteger(a.selected)?clamp(a.selected,0,8):0)}else{for(const id of QUICK_ITEMS)if(s.inventory[id]){const i=s.hotbar.findIndex((v,i)=>i>0&&!v);if(i>=0)s.hotbar[i]=id}const i=s.hotbar.indexOf(s.equipped.weapon);selectSlot(s,i>=0?i:0)}s.opened=a.opened&&typeof a.opened==='object'?a.opened:{};s.fires=Array.isArray(a.fires)?a.fires.filter(f=>Number.isFinite(f.x)&&Number.isFinite(f.z)).slice(0,30):[];s.buildings=Array.isArray(a.buildings)?a.buildings.filter(b=>PIECES[b.kind]&&[b.x,b.y,b.z,b.rot,b.id].every(Number.isFinite)&&Math.abs(b.x)<=LIMIT&&Math.abs(b.z)<=LIMIT).slice(0,450).map(b=>({...b,open:!!b.open})):[];s.nextBuildId=Math.max(0,...s.buildings.map(b=>b.id))+1;return s}catch{return null}}

export const PIECES={
bench:{name:'Banco da lavoro',cost:{wood:4},desc:'Posalo a terra, poi premi E per aprire le ricette esclusive.',hp:40},
floor:{name:'Pavimento in tavole',cost:{plank:2},desc:'Fondazione quadrata 2 × 2.',hp:30,bench:true},
wall:{name:'Parete di legno',cost:{plank:2},desc:'Protegge la casa. Si aggancia ai lati dei pavimenti.',hp:35,bench:true},
door:{name:'Porta di legno',cost:{plank:3},desc:'Apri e chiudi con E.',hp:35,bench:true},
roof:{name:'Tetto di legno',cost:{plank:3},desc:'Copre un pavimento con almeno una parete di sostegno e offre riparo.',hp:30,bench:true},
fence:{name:'Recinzione',cost:{wood:3},desc:'Delimita la tua base.',hp:20,bench:true},
post:{name:'Palo di legno',cost:{wood:2},desc:'Palo verticale per sostenere i tetti.',hp:30,bench:true},
beam:{name:'Trave di legno',cost:{plank:2},desc:'Trave orizzontale sopra un pavimento.',hp:30,bench:true},
window:{name:'Parete con finestra',cost:{plank:3},desc:'Parete con apertura per far entrare la luce.',hp:30,bench:true},
ramp:{name:'Rampa di legno',cost:{plank:3},desc:'Accesso inclinato alla fondazione.',hp:25,bench:true},
slopedroof:{name:'Tetto inclinato',cost:{plank:4},desc:'Copertura inclinata per il rifugio.',hp:35,bench:true}
};
export const benchNear=(s,x=s.x,z=s.z)=>s.buildings.some(b=>b.kind==='bench'&&Math.hypot(b.x-x,b.z-z)<=22);
export const cell=(n)=>Math.round(n/2)*2;
export function planPiece(s,kind,x,z,rot,ground,dry=true){
 const p=PIECES[kind];if(!p)return {ok:false,reason:'Pezzo sconosciuto'};
 rot=((Math.round(rot)%4)+4)%4;const edge=['wall','door','fence','window'].includes(kind);let cx=cell(x),cz=cell(z);
 if(edge){if(rot%2)cx=cell(x-1)+1;else cz=cell(z-1)+1}
 const floor=s.buildings.find(b=>b.kind==='floor'&&b.x===cx&&b.z===cz),adj=edge?s.buildings.filter(b=>b.kind==='floor'&&(rot%2?b.z===cz&&Math.abs(b.x-cx)===1:b.x===cx&&Math.abs(b.z-cz)===1)):[],base=floor||adj[0];
 const neighbor=s.buildings.find(b=>b.kind==='floor'&&Math.abs(b.x-cx)+Math.abs(b.z-cz)===2);const y=kind==='floor'?(neighbor?neighbor.y:ground(cx,cz)+.12):['roof','slopedroof','beam'].includes(kind)?(floor?.y??ground(cx,cz))+2.4:base?base.y+.14:ground(cx,cz);
 const b={kind,x:cx,y,z:cz,rot};let reason='';
 if(!dry||Math.abs(cx)>LIMIT||Math.abs(cz)>LIMIT)reason='Terreno non valido';
 else if(Math.hypot(s.x-cx,s.z-cz)>7)reason='Troppo lontano';
 else if(s.buildings.length>=450)reason='Limite costruzioni raggiunto';
 else if(p.bench&&(!benchNear(s)||!benchNear(s,cx,cz)))reason='Serve un banco da lavoro vicino';
 else if(kind==='floor'&&neighbor&&Math.abs(neighbor.y-ground(cx,cz))>1.15)reason='Terreno troppo irregolare';
 else if(['wall','door','window'].includes(kind)&&!adj.length)reason='Serve un pavimento adiacente';
 else if(['roof','slopedroof','beam'].includes(kind)&&!floor)reason='Serve un pavimento sotto il tetto';
 else if(['roof','slopedroof','beam'].includes(kind)&&!s.buildings.some(q=>(['wall','door','window'].includes(q.kind)&&Math.abs(q.x-cx)+Math.abs(q.z-cz)===1)||(q.kind==='post'&&q.x===cx&&q.z===cz)))reason='Serve una parete o una porta di sostegno';
 else if(s.buildings.some(q=>q.x===cx&&q.z===cz&&(q.kind===kind||edge&&['wall','door','fence','window'].includes(q.kind))))reason='Spazio occupato';
 else if(!(kind==='bench'&&s.inventory.bench>0)&&!has(s,p.cost))reason='Materiali insufficienti';
 return {ok:!reason,reason,piece:b};
}
export function placePiece(s,plan){if(!plan?.ok||!PIECES[plan.piece.kind])return null;const packed=plan.piece.kind==='bench'&&s.inventory.bench>0;if(!packed&&!has(s,PIECES[plan.piece.kind].cost))return null;const b={...plan.piece,id:s.nextBuildId++,open:false};if(packed)take(s,'bench');else for(const [k,n] of Object.entries(PIECES[b.kind].cost))take(s,k,n);s.buildings.push(b);return b}
export function removePiece(s,id){const i=s.buildings.findIndex(b=>b.id===id);if(i<0)return false;const b=s.buildings[i];s.buildings.splice(i,1);for(const [k,n] of Object.entries(PIECES[b.kind].cost))add(s,k,n);return true}

export function jumpStep(y,v,dt){const speed=v-14*dt,next=y+speed*dt;return next<=0?{y:0,v:0}:{y:next,v:speed}}
export function biomeWeights(x,z){const wx=x+36*Math.sin(z*.016)+23*Math.sin((x+z)*.031),wz=z+42*Math.sin(x*.013)-18*Math.cos((x-z)*.027);const sites=[[0,0],[-275,-45],[265,35],[20,-310],[-25,300],[-355,260],[350,-250],[320,330],[-300,-340]],types=[0,1,2,3,4,4,2,1,3];const d=Array(5).fill(Infinity);for(let i=0;i<sites.length;i++)d[types[i]]=Math.min(d[types[i]],Math.hypot(wx-sites[i][0],wz-sites[i][1])+(types[i]===0?0:20));const min=Math.min(...d),weights=d.map(v=>Math.exp(-(v-min)/22)),sum=weights.reduce((a,b)=>a+b,0);return weights.map(v=>v/sum)}
export function biomeIndex(x,z){const w=biomeWeights(x,z);return w.indexOf(Math.max(...w))}
export const LOCAL_RESOURCES=[['wood','stone','fiber','berries','flint'],['wood','oak','stone','fiber','mushroom','amber'],['wood','stone','fiber','cactus','copper'],['wood','stone','fiber','icecrystal','flint'],['wood','stone','reed','mushroom','clay']];
export const LOCAL_FAUNA=[['rabbit','boar'],['deer','fox'],['scorpion'],['icewolf'],['crocodile']];
export const NIGHT_MOBS=['shade','forestwraith','sandstalker','frostwraith','swampwraith'];
