// Pure survival rules — independent of rendering.
export const ITEMS={shield:'Scudo di legno',banditloot:'Moneta antica',coal:'Carbone',tin:'Minerale di stagno',iron:'Minerale di ferro',copperbar:'Lingotto di rame',tinbar:'Lingotto di stagno',bronze:'Lingotto di bronzo',ironbar:'Lingotto di ferro',wool:'Lana',bearhide:'Pelliccia di orso',bearmeat:'Carne di orso cruda',bearfood:'Carne di orso cotta',beararmor:'Armatura di orso',well:'Pozzo',flintpickaxe:'Piccone di selce',flintsword:'Spada di selce',copperaxe:'Ascia di rame',copperpickaxe:'Piccone di rame',coppersword:'Spada di rame',bronzeaxe:'Ascia di bronzo',bronzepickaxe:'Piccone di bronzo',bronzesword:'Spada di bronzo',ironaxe:'Ascia di ferro',ironpickaxe:'Piccone di ferro',ironsword:'Spada di ferro',wardrobe:'Armadio di legno',chest:'Cassa di legno',bench:'Banco da lavoro',hoe:'Zappa di pietra',sapling:'Germoglio di albero',wood:'Legna',stone:'Pietra',fiber:'Fibra',berries:'Bacche',hide:'Pelle',meat:'Carne cruda',food:'Carne cotta',axe:'Ascia di pietra',pickaxe:'Piccone di pietra',sword:'Spada di pietra',spear:'Lancia',tunic:'Tunica',boots:'Calzari',campfire:'Falò',hammer:'Martello di pietra',plank:'Tavole di legno',flint:'Selce',resin:'Resina',mushroom:'Funghi',clay:'Argilla',copper:'Minerale di rame',torch:'Torcia',flintaxe:'Ascia di selce',oak:'Legno di quercia',cactus:'Frutto del deserto',icecrystal:'Cristallo di gelo',reed:'Giunco palustre',amber:'Ambra',bone:'Ossa',fang:'Zanna',fur:'Pelliccia',venom:'Essenza palustre',linen:'Tela grezza',wintercoat:'Mantello di pelliccia'};
export const RECIPES=[
{id:'bench',name:'Banco da lavoro',cost:{wood:4},desc:'Crea il banco e posizionalo sul terreno. Premi E accanto ad esso per aprire le ricette avanzate.'},
{id:'axe',name:'Ascia di pietra',cost:{wood:2,stone:3,fiber:1},desc:'5 danni al legno per colpo.'},
{id:'pickaxe',name:'Piccone di pietra',cost:{wood:2,stone:4,fiber:2},desc:'6 danni alle rocce per colpo.'},
{id:'sword',name:'Spada di pietra',cost:{wood:2,stone:5,fiber:2},desc:'30 danni agli animali per colpo.'},
{id:'spear',name:'Lancia',cost:{wood:3,stone:2,fiber:2},desc:'Attacchi a distanza ravvicinata più efficaci.'},
{id:'tunic',name:'Tunica grezza',cost:{fiber:6,hide:1},desc:'Protegge dal freddo notturno.'},
{id:'boots',name:'Calzari',cost:{fiber:3,hide:1},desc:'Consuma meno energia correndo.'},
{id:'campfire',name:'Falò',cost:{wood:5,stone:4},desc:'Posiziona un fuoco, scaldati e cucina.'},
{id:'hammer',name:'Martello di pietra',cost:{wood:3,stone:2},desc:'Equipaggialo e premi il tasto destro per costruire e lavorare le tavole ovunque.'},
{id:'plank',name:'Tavole di legno',cost:{wood:2},qty:4,hammer:true,desc:'Quattro tavole ottenute con il martello, senza banco da lavoro.'},
{id:'torch',name:'Torcia',cost:{wood:1,resin:2},bench:true,desc:'Illumina la notte se equipaggiata.'},
{id:'flintaxe',name:'Ascia di selce',cost:{wood:3,flint:4,fiber:2},bench:true,desc:'8 danni al legno per colpo.'},
];
export const LIMIT=480;
for(const r of RECIPES)if(!['bench','hammer','campfire','axe','food','plank'].includes(r.id))r.bench=true;
RECIPES.push({id:'hoe',name:'Zappa di pietra',cost:{wood:3,stone:3,fiber:1},bench:true,desc:'Modifica il terreno: alza, abbassa o livella il suolo.'},{id:'sapling',name:'Germoglio di albero',cost:{wood:1,resin:1},bench:true,desc:'Pianta un germoglio sul terreno libero: cresce in cinque minuti di gioco.'},{id:'linen',name:'Tela grezza',cost:{fiber:3,reed:2},qty:2,bench:true,desc:'Tessuto ricavato da fibre e giunchi.'},{id:'wintercoat',name:'Mantello di pelliccia',cost:{fur:3,linen:2},bench:true,desc:'Protezione dal freddo, anche sulle montagne.'});
RECIPES.push({id:'well',name:'Pozzo',cost:{stone:20},requires:'pickaxe',desc:'Richiede un piccone di pietra nello zaino (non consumato). Posa il pozzo e premi E per bere.'},
{id:'bronze',name:'Fondi il bronzo',cost:{copperbar:2,tinbar:1},qty:2,bench:true,desc:'Lega due lingotti di rame e uno di stagno al banco.'},
{id:'beararmor',name:'Armatura di orso',cost:{bearhide:4,hide:2,wool:2},bench:true,desc:'Riduce del 35% i danni dei nemici e protegge dal freddo.'});
for(const [tier,mat] of [['flint','flint'],['copper','copperbar'],['bronze','bronze'],['iron','ironbar']])for(const [type,qty] of [['axe',4],['pickaxe',5],['sword',5]]){const id=tier+type;if(!RECIPES.some(r=>r.id===id))RECIPES.push({id,name:ITEMS[id],cost:{[mat]:qty,wood:2,fiber:1},bench:true,desc:'Equipaggiamento di livello '+tier+'.'})}
RECIPES.push({id:'shield',name:'Scudo di legno',cost:{wood:8,hide:2},bench:true,desc:'Mano sinistra, indipendente dall’arma. Premi il destro al momento dell’impatto: finestra di parata 0,32 s.'});
export const LIMIT_OLD=230;
export const WEAPONS=['axe','pickaxe','sword','spear','hammer','torch','flintaxe','hoe','flintpickaxe','flintsword','copperaxe','copperpickaxe','coppersword','bronzeaxe','bronzepickaxe','bronzesword','ironaxe','ironpickaxe','ironsword'];
export const QUICK_ITEMS=[...WEAPONS,'bench','chest','wardrobe','campfire','sapling','tunic','boots','wintercoat','beararmor','beararmor','well','bearfood','berries','food','mushroom','cactus'];
export const HP={bandit:85,sheep:35,pig:45,bear:160,coal:22,tin:30,iron:48,cow:60,wood:15,stone:12,log:18,fiber:3,berries:3,chest:10,wolf:55,boar:70,deer:40,flint:5,clay:8,copper:18,mushroom:2,oak:25,cactus:4,icecrystal:22,reed:4,amber:12,rabbit:18,fox:32,scorpion:45,icewolf:80,crocodile:95,shade:45,forestwraith:65,sandstalker:70,frostwraith:90,swampwraith:80};
export const DAMAGE={hand:{wood:1,stone:1,fiber:1,berries:1,chest:1,animal:5},axe:{wood:5,stone:1,fiber:2,berries:2,chest:5,animal:14},pickaxe:{wood:1,stone:6,fiber:1,berries:1,chest:2,animal:10},sword:{wood:1,stone:1,fiber:3,berries:3,chest:2,animal:30},spear:{wood:1,stone:1,fiber:1,berries:1,chest:1,animal:24}};
export const miningRank=w=>({pickaxe:1,flintpickaxe:2,copperpickaxe:3,bronzepickaxe:4,ironpickaxe:5}[w]||0);
export const miningRequirement=k=>({flint:1,coal:1,copper:2,tin:3,iron:4}[k]||0);
export const hitDamage=(weapon,kind)=>{if(miningRank(weapon)<miningRequirement(kind))return 0;const k=['bandit','sheep','pig','bear','cow','wolf','boar','deer','rabbit','fox','scorpion','icewolf','crocodile','shade','forestwraith','sandstalker','frostwraith','swampwraith'].includes(kind)?'animal':['coal','tin','iron','flint','clay','copper','icecrystal','amber'].includes(kind)?'stone':['oak','log'].includes(kind)?'wood':kind==='reed'?'fiber':['mushroom','cactus'].includes(kind)?'berries':kind;
 const tier=['flint','copper','bronze','iron'].find(t=>weapon?.startsWith(t)),rank=tier?['flint','copper','bronze','iron'].indexOf(tier)+1:0;
 const base=tier?weapon.slice(tier.length):weapon;if(rank&&DAMAGE[base])return (DAMAGE[base][k]||1)+(k==='animal'?rank*6:k==='wood'&&base==='axe'?rank*3:k==='stone'&&base==='pickaxe'?rank*3:0);
 return (weapon==='hammer'?{...DAMAGE.hand,wood:2,stone:2}:DAMAGE[weapon]||DAMAGE.hand)[k]||1};
export function movement(x,z,yaw){return {dx:-Math.cos(yaw)*x+Math.sin(yaw)*z,dz:Math.sin(yaw)*x+Math.cos(yaw)*z}}
export function assignSlot(s,i,id){if(!Number.isInteger(i)||i<0||i>8||id!==null&&!s.inventory[id])return false;if(id){const previous=s.hotbar.indexOf(id);if(previous>=0)s.hotbar[previous]=null}s.hotbar[i]=id;if(i===s.selected||!s.hotbar[s.selected])selectSlot(s,s.selected);return true}
export function selectSlot(s,i){if(!Number.isInteger(i)||i<0||i>8)return false;s.selected=i;const id=s.hotbar[i];s.equipped.weapon=WEAPONS.includes(id)&&s.inventory[id]?id:null;return true}
export const DEFAULT_CHARACTER={name:'Barbaro',skin:1,hair:3,beard:1,build:1,eyes:0,hairColor:0,face:0,mark:0,height:1,outfit:0};
export function fresh(character=DEFAULT_CHARACTER){return {v:5,worldVersion:13,terrain:{},planted:[],interiorVersion:2,discoveries:[],adventure:{stats:{},completed:[],claimed:[]},breath:100,exploredTiles:[],interiorExplored:{},buildings:[],nextBuildId:1,containers:{},cooking:{},graves:[],nextGraveId:1,mapMarkers:[],nextMarkerId:1,respawnBed:null,groundDrops:[],nextDropId:1,hotbar:Array(9).fill(null),selected:0,damage:{},character:{...DEFAULT_CHARACTER,...character},health:100,hunger:100,thirst:100,stamina:100,time:8*60,elapsed:0,inventory:{},equipped:{weapon:null,tunic:false,boots:false,wintercoat:false,beararmor:false,shield:false},x:0,z:0,yaw:0,harvested:{},fires:[],opened:{},kills:0}}
export const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export function add(s,id,n=1){if(!ITEMS[id]||!Number.isFinite(n)||n<=0)return;s.inventory[id]=(s.inventory[id]||0)+n;if(QUICK_ITEMS.includes(id)&&!s.hotbar.includes(id)){const i=s.hotbar.findIndex((v,i)=>i>0&&v===null);if(i>=0)s.hotbar[i]=id}}
export function has(s,cost){return Object.entries(cost).every(([k,n])=>(s.inventory[k]||0)>=n)}
export function take(s,id,n=1){if((s.inventory[id]||0)<n)return false;s.inventory[id]-=n;if(!s.inventory[id]){delete s.inventory[id];for(let i=0;i<9;i++)if(s.hotbar[i]===id)s.hotbar[i]=null;if(s.equipped.weapon===id)s.equipped.weapon=null;if(['tunic','boots','wintercoat','beararmor','shield'].includes(id))s.equipped[id]=false}return true}
export function craft(s,id,nearFire=false,nearBench=false){const r=RECIPES.find(x=>x.id===id);if(!r||!has(s,r.cost)||r.fire&&!nearFire||r.bench&&!nearBench||r.hammer&&s.equipped.weapon!=='hammer'||r.requires&&!s.inventory[r.requires])return false;if([...WEAPONS,'tunic','boots','wintercoat','beararmor','shield'].includes(id)&&s.inventory[id])return false;for(const [k,n] of Object.entries(r.cost))take(s,k,n);add(s,id,r.qty||1);recordAdventure(s,'crafted',r.qty||1);return true}
export function equip(s,id){if(!(s.inventory[id]>0))return false;if(WEAPONS.includes(id)){if(s.equipped.weapon===id){const empty=s.hotbar.findIndex(v=>v===null);if(empty>=0)selectSlot(s,empty);else assignSlot(s,s.selected,null);s.equipped.weapon=null}else{let i=s.hotbar.indexOf(id);if(i<0){i=s.hotbar.findIndex(v=>v===null);if(i<0)i=s.selected;assignSlot(s,i,id)}selectSlot(s,i)}}else if(id==='tunic'||id==='boots'||id==='wintercoat'||id==='beararmor'||id==='shield')s.equipped[id]=!s.equipped[id];else return false;return true}
export function eat(s,id){if(!['berries','food','bearfood','mushroom','cactus'].includes(id)||!take(s,id))return false;s.hunger=clamp(s.hunger+(id==='bearfood'?55:id==='food'?38:id==='mushroom'?18:id==='cactus'?22:13));s.health=clamp(s.health+(id==='bearfood'?12:id==='food'?6:1));return true}
export function drink(s){s.thirst=clamp(s.thirst+45)}
export function tick(s,dt,{running=false,warm=false,cold=false}={}){s.elapsed+=dt;s.time+=dt*1.8;const hour=s.time/60%24,night=hour<6||hour>20;s.hunger=clamp(s.hunger-dt*(running?.16:.105));s.thirst=clamp(s.thirst-dt*(running?.24:.14));s.stamina=clamp(s.stamina+dt*(running?(s.equipped.boots?-14:-20):12));if(s.hunger===0||s.thirst===0)s.health=clamp(s.health-dt*2.5);else if((night||cold)&&!warm&&!s.equipped.wintercoat&&!s.equipped.beararmor&&(!s.equipped.tunic||cold))s.health=clamp(s.health-dt*.23);else if(s.hunger>65&&s.thirst>65)s.health=clamp(s.health+dt*.2)}
export function load(raw){try{const a=JSON.parse(raw);if(![1,2,3,4,5].includes(a?.v)||!a.character||!a.inventory||!Number.isFinite(a.health)||a.health<=0)return null;const s=fresh(a.character);s.worldVersion=Number.isFinite(a.worldVersion)?a.worldVersion:0;for(const k of ['health','hunger','thirst','stamina','breath'])s[k]=clamp(Number.isFinite(a[k])?a[k]:100);for(const k of ['time','elapsed','kills'])s[k]=Number.isFinite(a[k])?Math.max(0,a[k]):s[k];for(const k of ['x','z'])s[k]=clamp(Number.isFinite(a[k])?a[k]:0,-LIMIT,LIMIT);s.yaw=Number.isFinite(a.yaw)?a.yaw:0;for(const [k,n] of Object.entries(a.inventory))if(ITEMS[k]&&Number.isInteger(n)&&n>0)s.inventory[k]=Math.min(n,9999);s.equipped={weapon:WEAPONS.includes(a.equipped?.weapon)&&s.inventory[a.equipped.weapon]?a.equipped.weapon:null,tunic:!!a.equipped?.tunic&&!!s.inventory.tunic,boots:!!a.equipped?.boots&&!!s.inventory.boots,wintercoat:!!a.equipped?.wintercoat&&!!s.inventory.wintercoat,beararmor:!!a.equipped?.beararmor&&!!s.inventory.beararmor,shield:!!a.equipped?.shield&&!!s.inventory.shield};s.harvested=a.v>=4&&a.harvested&&typeof a.harvested==='object'?a.harvested:{};s.damage=a.v>=4&&a.damage&&typeof a.damage==='object'?a.damage:{};if(Array.isArray(a.hotbar)){s.hotbar=Array.from({length:9},(_,i)=>s.inventory[a.hotbar[i]]?a.hotbar[i]:null);selectSlot(s,Number.isInteger(a.selected)?clamp(a.selected,0,8):0)}else{for(const id of QUICK_ITEMS)if(s.inventory[id]){const i=s.hotbar.findIndex((v,i)=>i>0&&!v);if(i>=0)s.hotbar[i]=id}const i=s.hotbar.indexOf(s.equipped.weapon);selectSlot(s,i>=0?i:0)}s.opened=a.opened&&typeof a.opened==='object'?a.opened:{};s.fires=Array.isArray(a.fires)?a.fires.filter(f=>Number.isFinite(f.x)&&Number.isFinite(f.z)).slice(0,30):[];s.buildings=Array.isArray(a.buildings)?a.buildings.filter(b=>PIECES[b.kind]&&[b.x,b.y,b.z,b.rot,b.id].every(Number.isFinite)&&Math.abs(b.x)<=LIMIT&&Math.abs(b.z)<=LIMIT).slice(0,450).map(b=>({...b,rot:normalizeRotation(b.rot),open:!!b.open})):[];s.nextBuildId=Math.max(Number.isInteger(a.nextBuildId)?a.nextBuildId:1,Math.max(0,...s.buildings.map(b=>b.id))+1);for(const [id,slots] of Object.entries(a.containers||{}))if(Array.isArray(slots))s.containers[id]=normalizeSlots(slots,containerCapacity(s,id));s.groundDrops=Array.isArray(a.groundDrops)?a.groundDrops.filter(d=>d&&ITEMS[d.item]&&Number.isInteger(d.qty)&&d.qty>0&&Number.isFinite(d.x)&&Number.isFinite(d.z)&&Number.isInteger(d.id)&&typeof d.area==='string').map(d=>({...d,ready:Number.isFinite(d.ready)?d.ready:0})):[];s.nextDropId=Math.max(Number.isInteger(a.nextDropId)?a.nextDropId:1,Math.max(0,...s.groundDrops.map(d=>d.id))+1);s.terrain={};for(const [k,v] of Object.entries(a.terrain||{}).slice(0,5000))if(/^\d+,\d+$/.test(k)&&Number.isFinite(v)&&Math.abs(v)<=3)s.terrain[k]=v;s.planted=Array.isArray(a.planted)?a.planted.filter(b=>Number.isFinite(b.x)&&Number.isFinite(b.z)&&Number.isInteger(b.id)&&Math.abs(b.x)<=LIMIT&&Math.abs(b.z)<=LIMIT).slice(0,180).map(b=>({...b,plantedAt:Number.isFinite(b.plantedAt)?b.plantedAt:s.elapsed-300})):[];if(a.interiorVersion!==2){for(const d of s.groundDrops)if(d.area.startsWith('interior:')){d.x*=1.35;d.z*=1.35}}s.respawnBed=Number.isInteger(a.respawnBed)?a.respawnBed:null;for(const [id,c] of Object.entries(a.cooking||{})){if(!c)continue;if(Array.isArray(c.jobs)){s.cooking[id]={jobs:c.jobs.filter(j=>PROCESS_OUTPUT[j.item]&&Number.isInteger(j.qty)&&j.qty>0).map(j=>({item:j.item,qty:Math.min(9999,j.qty)})),output:Object.fromEntries(Object.entries(c.output||{}).filter(([k,n])=>Object.values(PROCESS_OUTPUT).includes(k)&&Number.isInteger(n)&&n>0)),remaining:Math.max(.001,Math.min(30,Number(c.remaining)||30)),fuel:Math.max(0,Number.isFinite(c.fuel)?c.fuel:0)}}else if(Number.isInteger(c.queued)&&c.queued>=0&&Number.isInteger(c.ready)&&c.ready>=0){s.cooking[id]={...c};cookState(s,id)}}s.graves=Array.isArray(a.graves)?a.graves.filter(g=>g&&Number.isInteger(g.id)&&Number.isFinite(g.x)&&Number.isFinite(g.z)&&typeof g.area==='string'&&g.items&&typeof g.items==='object').map(g=>({...g,items:Object.fromEntries(Object.entries(g.items).filter(([id,n])=>ITEMS[id]&&Number.isInteger(n)&&n>0))})):[];s.nextGraveId=Math.max(Number.isInteger(a.nextGraveId)?a.nextGraveId:1,...s.graves.map(g=>g.id+1));s.mapMarkers=Array.isArray(a.mapMarkers)?a.mapMarkers.filter(m=>m&&Number.isSafeInteger(m.id)&&m.id>0&&['death','pin'].includes(m.kind)&&validMarkerPoint(m.area,m.x,m.z)).map(m=>({id:m.id,kind:m.kind,area:m.area,x:m.x,z:m.z,name:markerText(m.name,48,m.kind==='death'?'Morte':'Punto di riferimento'),description:markerText(m.description,240),graveId:Number.isSafeInteger(m.graveId)?m.graveId:null,day:Number.isFinite(m.day)?Math.max(1,Math.floor(m.day)):null})):s.graves.map((g,i)=>({id:i+1,kind:'death',area:g.area,x:g.x,z:g.z,name:'Morte',description:'',graveId:g.id,day:null}));s.nextMarkerId=Math.max(Number.isSafeInteger(a.nextMarkerId)?a.nextMarkerId:1,1,...s.mapMarkers.map(m=>m.id+1));s.adventure=normalizeAdventure(a.adventure);s.discoveries=Array.isArray(a.discoveries)?[...new Set(a.discoveries.filter(x=>Number.isInteger(x)&&x>=0&&x<5))]:[];s.exploredTiles=Array.isArray(a.exploredTiles)?[...new Set(a.exploredTiles.filter(i=>Number.isInteger(i)&&i>=0&&i<MAP_GRID*MAP_GRID))]:[];for(const [id,cells] of Object.entries(a.interiorExplored||{}).slice(0,100)){if(/^[a-zA-Z0-9_-]+$/.test(id)&&Array.isArray(cells))s.interiorExplored[id]=[...new Set(cells.filter(k=>typeof k==='string'&&/^-?\d{1,3},-?\d{1,3}$/.test(k)))].slice(0,1000)}if(!Array.isArray(a.exploredTiles)){revealMap(s,s.x,s.z);for(const b of [...s.buildings,...s.planted,...s.graves.filter(g=>g.area==='world'),...s.mapMarkers.filter(m=>m.kind==='death'&&m.area==='world')])revealMap(s,b.x,b.z)}return s}catch{return null}}

export const PIECES={
well:{name:'Pozzo',cost:{stone:20},desc:'Richiede un piccone di pietra non consumato. Premi E per bere.',hp:65},
smelter:{name:'Fornace',cost:{stone:20,clay:8,wood:4},desc:'Fonde rame, stagno e ferro usando legna o carbone.',hp:65},
campfire:{name:'Falò',cost:{wood:5,stone:4},desc:'Posiziona il fuoco e cuoci la carne in 30 secondi.',hp:25},
bed:{name:'Letto',cost:{wood:12,wool:4},desc:'Riposa durante la notte in un riparo sicuro.',hp:20},
wardrobe:{name:'Armadio di legno',cost:{wood:16,plank:8},desc:'Sedici slot di deposito, ante apribili e recuperabile dopo la distruzione.',hp:35},
chest:{name:'Cassa di legno',cost:{wood:8},desc:'Otto slot di deposito. Recuperabile dopo la distruzione.',hp:24},
bench:{name:'Banco da lavoro',cost:{wood:4},desc:'Posalo a terra, poi premi E per aprire le ricette esclusive.',hp:40},
floor:{name:'Pavimento in tavole',cost:{plank:2},desc:'Fondazione quadrata 2 × 2.',hp:30},
wall:{name:'Parete di legno',cost:{plank:2},desc:'Protegge la casa. Punta un bordo del pavimento o la parte superiore di una parete per sovrapporla.',hp:35},
door:{name:'Porta di legno',cost:{plank:3},desc:'Apri e chiudi con E.',hp:35},
roof:{name:'Tetto di legno',cost:{plank:3},desc:'Copre un pavimento con almeno una parete di sostegno e offre riparo.',hp:30},
fence:{name:'Recinzione',cost:{wood:3},desc:'Delimita la tua base.',hp:20},
post:{name:'Palo di legno',cost:{wood:2},desc:'Palo verticale per sostenere i tetti.',hp:30},
beam:{name:'Trave di legno',cost:{plank:2},desc:'Trave orizzontale sopra un pavimento.',hp:30},
window:{name:'Parete con finestra',cost:{plank:3},desc:'Parete con apertura per far entrare la luce.',hp:30},
ramp:{name:'Rampa di legno',cost:{plank:3},desc:'Accesso inclinato alla fondazione.',hp:25},
slopedroof:{name:'Tetto inclinato',cost:{plank:4},desc:'Copertura inclinata per il rifugio.',hp:35},
stonebase:{name:'Fondazione di pietra',cost:{stone:6},desc:'Base solida in pietra per il tuo rifugio.',hp:65},
stairs:{name:'Scala di legno',cost:{plank:4},desc:'Gradini per raggiungere un pavimento rialzato.',hp:30},
firebowl:{name:'Braciere',cost:{stone:5,wood:2,resin:1},desc:'Illumina e riscalda la base.',hp:30}
};
export const benchNear=(s,x=s.x,z=s.z)=>s.buildings.some(b=>b.kind==='bench'&&Math.hypot(b.x-x,b.z-z)<=22);
export const cell=(n)=>Math.round(n/2)*2;
export const isFloor=k=>k==='floor'||k==='stonebase';
export const isEdge=k=>['wall','door','window','fence'].includes(k);
export const isCover=k=>['roof','slopedroof','beam'].includes(k);
export const WALL_HEIGHT=2.16;
export const isStackWall=k=>['wall','door','window'].includes(k);
export const wallTop=b=>b.y+WALL_HEIGHT;
// Rotation is stored in quarter-turn units, now fractional. Legacy saves retain their angles.
export const normalizeRotation=r=>((r%4)+4)%4;
export function localPoint(b,x,z){const a=b.rot*Math.PI/2,c=Math.cos(a),s=Math.sin(a),dx=x-b.x,dz=z-b.z;return{x:c*dx-s*dz,z:s*dx+c*dz}}
export function footprint(b,x,z,hx=1,hz=1,pad=0){const p=localPoint(b,x,z);return Math.abs(p.x)<hx+pad&&Math.abs(p.z)<hz+pad}
export function offsetPiece(b,x,z){const a=b.rot*Math.PI/2,c=Math.cos(a),s=Math.sin(a);return{x:b.x+c*x+s*z,z:b.z-s*x+c*z}}
const dims={well:[.9,.9,0,2.2],smelter:[.85,.85,0,2.1],wall:[1.025,.11,0,2.16],door:[1,.12,0,2.16],window:[1,.12,0,2.16],fence:[1,.10,0,1.25],floor:[1,1,-.12,.12],stonebase:[1,1,-.46,.13],roof:[1.08,1.08,-.16,.09],slopedroof:[1.04,1.2,-.12,1.25],beam:[1.06,.12,-.12,.12],post:[.18,.18,0,2.4],bed:[.73,.98,0,1.08],wardrobe:[.78,.46,0,2.2],chest:[.47,.32,0,.78],bench:[.86,.62,0,1.8],campfire:[.63,.63,0,.85],firebowl:[.58,.58,0,.9],stairs:[1,1,0,1.2],ramp:[1,1,0,.65],sapling:[.18,.18,0,.6]};
export function pieceBounds(b){return dims[b.kind]||[.5,.5,0,1]}
export function overlapPieces(a,b,margin=.035){const A=pieceBounds(a),B=pieceBounds(b);if(a.y+A[3]<=b.y+B[2]+margin||b.y+B[3]<=a.y+A[2]+margin)return false;
 const axes=o=>{const t=o.rot*Math.PI/2;return [[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]]},u=axes(a),v=axes(b),dx=b.x-a.x,dz=b.z-a.z;
 for(const axis of [...u,...v]){const dot=k=>Math.abs(axis[0]*k[0]+axis[1]*k[1]);if(Math.abs(dx*axis[0]+dz*axis[1])>=A[0]*dot(u[0])+A[1]*dot(u[1])+B[0]*dot(v[0])+B[1]*dot(v[1])-margin)return false}return true
}
export function snapPlacement(s,kind,x,z,rot,target,y){
 if(!target)return{x,z,rot};
 if(isFloor(target.kind)&&isEdge(kind)){const p=localPoint(target,x,z),side=Math.abs(p.x)>Math.abs(p.z);const q=offsetPiece(target,side?Math.sign(p.x||1):0,side?0:Math.sign(p.z||1));return{...q,rot:normalizeRotation(target.rot+(side?1:0)),supportId:target.id}}
 if(isFloor(target.kind)&&isFloor(kind)){const p=localPoint(target,x,z),side=Math.abs(p.x)>Math.abs(p.z);const q=offsetPiece(target,side?2*Math.sign(p.x||1):0,side?0:2*Math.sign(p.z||1));return{...q,rot:target.rot,supportId:target.id}}
 if(isStackWall(target.kind)&&target.kind!=='door'&&isStackWall(kind)&&y>=target.y+1.08)return{x:target.x,z:target.z,rot:target.rot,supportId:target.id};
 if(isCover(kind)&&isFloor(target.kind))return{x:target.x,z:target.z,rot:target.rot,supportId:target.id};
 if(isCover(kind)&&isStackWall(target.kind)&&y>=target.y+1.08){const floors=s.buildings.filter(b=>isFloor(b.kind)&&Math.hypot(b.x-target.x,b.z-target.z)<1.65).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z));if(floors.length)return{x:floors[0].x,z:floors[0].z,rot:floors[0].rot,supportId:target.id}}
 return{x,z,rot}
}
export function planPiece(s,kind,x,z,rot,ground,dry=true,snap=null){
 const p=kind==='sapling'?{cost:{sapling:1}}:PIECES[kind];if(!p||![x,z,rot].every(Number.isFinite))return{ok:false,reason:'Posizione non valida'};
 rot=normalizeRotation(rot);const support=snap?.supportId!=null?s.buildings.find(b=>b.id===snap.supportId):null;
 const stacked=isStackWall(kind)&&support&&isStackWall(support.kind)&&support.kind!=='door';
 const floor=s.buildings.filter(b=>isFloor(b.kind)&&footprint(b,x,z,1.04,1.04)).sort((a,b)=>b.y-a.y)[0];
 const base=isFloor(kind)?(support&&isFloor(support.kind)?support.y:ground(x,z)+.12):floor?floor.y+.14:ground(x,z);
 const covers=isCover(kind),supports=covers?s.buildings.filter(b=>(isStackWall(b.kind)||b.kind==='post')&&Math.hypot(b.x-x,b.z-z)<=1.75&&b.y>=base-1&&b.y<=base+.65):[];
 const elevated=covers&&support&&isStackWall(support.kind);
 const y=stacked?wallTop(support):elevated?wallTop(support)+.10:covers?(supports.length?Math.max(...supports.map(b=>b.y+(b.kind==='post'?2.4:2.16)))+.10:base+2.3):base;
 const b={kind,x,y,z,rot,...(stacked||elevated?{supportId:support.id}:covers&&supports.length?{supportId:supports.sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0].id}:floor&&!isFloor(kind)?{supportId:floor.id}:{})};let reason='';
 if(!dry||Math.abs(x)>LIMIT||Math.abs(z)>LIMIT)reason='Terreno non valido';
 else if(Math.hypot(s.x-x,s.z-z,Math.max(0,y-ground(s.x,s.z)-1.4))>7.5||Math.hypot(s.x-x,s.z-z)>7)reason='Troppo lontano';
 else if(kind!=='sapling'&&s.buildings.length>=450)reason='Limite costruzioni raggiunto';
 else if(kind==='well'&&!s.inventory.well&&!s.inventory.pickaxe)reason='Serve un piccone di pietra nello zaino';
 else if(kind==='well'&&floor)reason='Il pozzo richiede terreno libero';
 else if(kind==='sapling'&&(floor||s.planted.length>=180))reason='Serve terreno libero';
 else if(isFloor(kind)&&support&&isFloor(support.kind)&&Math.abs(y-ground(x,z))>1.15)reason='Terreno troppo irregolare';
 else if(covers&&!supports.length&&!elevated)reason='Serve una parete o un palo di sostegno';
 else if(s.buildings.some(q=>overlapPieces(b,q)&&!(covers&&(isStackWall(q.kind)||q.kind==='post')&&Math.abs(y-q.y-(q.kind==='post'?2.4:2.16))<.18)&&!(isEdge(kind)&&isEdge(q.kind)&&Math.hypot(x-q.x,z-q.z)>.8&&Math.hypot(x-q.x,z-q.z)<1.6&&Math.abs(Math.sin((rot-q.rot)*Math.PI/2))>.7)))reason='Spazio occupato';
 else if(!(['bench','chest','wardrobe','campfire','well'].includes(kind)&&s.inventory[kind]>0)&&!has(s,p.cost))reason='Materiali insufficienti';
 return{ok:!reason,reason,piece:b}
}
export function placePiece(s,plan){if(!plan?.ok||!PIECES[plan.piece.kind])return null;const packed=['bench','chest','wardrobe','campfire','well'].includes(plan.piece.kind)&&s.inventory[plan.piece.kind]>0;if(!packed&&(!has(s,PIECES[plan.piece.kind].cost)||plan.piece.kind==='well'&&!s.inventory.pickaxe))return null;const b={...plan.piece,id:s.nextBuildId++,open:false};if(packed)take(s,b.kind);else for(const [k,n] of Object.entries(PIECES[b.kind].cost))take(s,k,n);s.buildings.push(b);return b}
export function upperWallDepends(s,b){return isStackWall(b.kind)&&s.buildings.some(q=>isStackWall(q.kind)&&(q.supportId===b.id||Math.hypot(q.x-b.x,q.z-b.z)<.08&&Math.abs(Math.sin((q.rot-b.rot)*Math.PI/2))<.02&&Math.abs(q.y-wallTop(b))<.12))}
export function removePiece(s,id){const i=s.buildings.findIndex(b=>b.id===id);if(i<0)return false;const b=s.buildings[i];if(upperWallDepends(s,b)||s.buildings.some(q=>q.supportId===b.id))return false;s.buildings.splice(i,1);for(const [k,n] of Object.entries(PIECES[b.kind].cost))add(s,k,n);return true}

export function jumpStep(y,v,dt){const speed=v-14*dt,next=y+speed*dt;return next<=0?{y:0,v:0}:{y:next,v:speed}}
export function biomeWeights(x,z){const wx=x+36*Math.sin(z*.016)+23*Math.sin((x+z)*.031),wz=z+42*Math.sin(x*.013)-18*Math.cos((x-z)*.027);const sites=[[0,0],[-275,-45],[265,35],[20,-310],[-25,300],[-355,260],[350,-250],[320,330],[-300,-340]],types=[0,1,2,3,4,4,2,1,3];const d=Array(5).fill(Infinity);for(let i=0;i<sites.length;i++)d[types[i]]=Math.min(d[types[i]],Math.hypot(wx-sites[i][0],wz-sites[i][1])+(types[i]===0?0:20));const min=Math.min(...d),weights=d.map(v=>Math.exp(-(v-min)/22)),sum=weights.reduce((a,b)=>a+b,0);return weights.map(v=>v/sum)}
export function biomeIndex(x,z){const w=biomeWeights(x,z);return w.indexOf(Math.max(...w))}
export const LOCAL_RESOURCES=[['wood','stone','fiber','berries','flint'],['wood','oak','stone','fiber','mushroom','amber'],['wood','stone','fiber','cactus','copper'],['wood','stone','fiber','icecrystal','flint'],['wood','stone','reed','mushroom','clay']];
export const LOCAL_FAUNA=[['rabbit','boar','cow','sheep','pig'],['deer','fox','bear','wolf'],['scorpion'],['icewolf','bear'],['crocodile']];
export const NIGHT_MOBS=['shade','forestwraith','sandstalker','frostwraith','swampwraith'];

// Persisted height edits, interpolated over the same mesh grid as the renderer.
export const TERRAIN_STEP=980/320;
export function terrainDelta(edits,x,z){const u=Math.max(0,Math.min(320,(x+490)/TERRAIN_STEP)),v=Math.max(0,Math.min(320,(z+490)/TERRAIN_STEP)),i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j,k=(x,z)=>edits[x+','+z]||0;return a+b<=1?k(i,j)*(1-a-b)+k(i+1,j)*a+k(i,j+1)*b:k(i+1,j+1)*(a+b-1)+k(i+1,j)*(1-b)+k(i,j+1)*(1-a)}
export function editTerrain(s,x,z,mode,base){if(Math.hypot(s.x-x,s.z-z)>7||Math.abs(x)>LIMIT-4||Math.abs(z)>LIMIT-4||s.buildings.some(b=>Math.hypot(b.x-x,b.z-z)<6))return [];const ci=Math.round((x+490)/TERRAIN_STEP),cj=Math.round((z+490)/TERRAIN_STEP),target=base(s.x,s.z)+terrainDelta(s.terrain,s.x,s.z),out=[];for(let j=cj-1;j<=cj+1;j++)for(let i=ci-1;i<=ci+1;i++){const xx=i*TERRAIN_STEP-490,zz=j*TERRAIN_STEP-490,d=Math.hypot(xx-x,zz-z);if(d>4.5||i<0||i>320||j<0||j>320)continue;const key=i+','+j,old=s.terrain[key]||0,w=1-d/5;const next=clamp(mode==='level'?old+(target-base(xx,zz)-old)*w:old+(mode==='raise'?.6:-.6)*w,-3,3);if(Math.abs(next-old)>.001){s.terrain[key]=next;out.push({i,j,x:xx,z:zz,delta:next})}}return out}

export const CHEST_SLOTS=8;
export function containerCapacity(s,id){return s.buildings.some(b=>'built:'+b.id===id&&b.kind==='wardrobe')?16:8}
export function normalizeSlots(slots,count=8){return Array.from({length:count},(_,i)=>{const v=slots?.[i];return v&&ITEMS[v.item]&&Number.isInteger(v.qty)&&v.qty>0?{item:v.item,qty:v.qty}:null})}
export function chestSlots(s,id,initial={}){if(!Object.prototype.hasOwnProperty.call(s.containers,id))s.containers[id]=normalizeSlots(Object.entries(initial).map(([item,qty])=>({item,qty})),containerCapacity(s,id));return s.containers[id]}
export function depositChest(s,id,item,qty,index=null){const slots=chestSlots(s,id);if(!ITEMS[item]||!Number.isInteger(qty)||qty<1||(s.inventory[item]||0)<qty)return false;if(index===null){index=slots.findIndex(v=>v?.item===item);if(index<0)index=slots.indexOf(null)}if(!Number.isInteger(index)||index<0||index>=slots.length||slots[index]&&slots[index].item!==item)return false;if(!take(s,item,qty))return false;slots[index]={item,qty:(slots[index]?.qty||0)+qty};return true}
export function withdrawChest(s,id,index,qty){const slots=chestSlots(s,id),v=slots[index];if(!v||!Number.isInteger(qty)||qty<1||qty>v.qty)return false;add(s,v.item,qty);v.qty-=qty;if(!v.qty)slots[index]=null;return true}
export function moveChestSlot(s,id,from,to){const slots=chestSlots(s,id);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=slots.length||to>=slots.length||!slots[from]||from===to)return false;if(slots[to]?.item===slots[from].item){slots[to].qty+=slots[from].qty;slots[from]=null}else [slots[from],slots[to]]=[slots[to],slots[from]];return true}
export function groundDrop(s,item,qty,x,z,area='world',delay=.8){if(!ITEMS[item]||!Number.isInteger(qty)||qty<1||!Number.isFinite(x)||!Number.isFinite(z))return null;const d={id:s.nextDropId++,item,qty,x,z,area,ready:s.elapsed+delay};s.groundDrops.push(d);return d}
export function collectDrop(s,id){const i=s.groundDrops.findIndex(d=>d.id===id&&d.ready<=s.elapsed);if(i<0)return null;const [d]=s.groundDrops.splice(i,1);add(s,d.item,d.qty);return d}
export function breakChest(s,id,x,z,area='world',recover=true){const slots=chestSlots(s,id),out=[],item=containerCapacity(s,id)===16?'wardrobe':'chest';for(let i=0;i<slots.length;i++){const v=slots[i];if(v){const angle=i*2.39996,dist=.85+(i%3)*.22;out.push(groundDrop(s,v.item,v.qty,x+Math.sin(angle)*dist,z+Math.cos(angle)*dist,area,1.1))}}if(recover)out.push(groundDrop(s,item,1,x,z,area,1.1));delete s.containers[id];return out}

export const TREE_GROWTH_SECONDS=300;
export function treeGrowth(b,elapsed){return Math.max(0,Math.min(1,(elapsed-b.plantedAt)/TREE_GROWTH_SECONDS))}
export function treeScale(b,elapsed){const t=treeGrowth(b,elapsed);return .10+.90*t*t*(3-2*t)}

export const COOK_SECONDS=30;
export const FUEL_SECONDS={wood:60,coal:180};
export const PROCESS_OUTPUT={meat:'food',bearmeat:'bearfood',copper:'copperbar',tin:'tinbar',iron:'ironbar'};
export function cookState(s,id){let c=s.cooking[id];if(!c||!Array.isArray(c.jobs)){const old=c||{};c=s.cooking[id]={jobs:old.queued?[{item:'meat',qty:old.queued}]:[],output:old.ready?{food:old.ready}:{},remaining:old.queued?Math.max(.001,Math.min(30,old.remaining||30)):30,fuel:0}}return c}
export function addFuel(s,id,item){if(!FUEL_SECONDS[item]||!take(s,item,1))return false;const c=cookState(s,id);c.fuel+=FUEL_SECONDS[item];return true}
export function queueProcess(s,id,item,count=1,smelter=false){if(!(smelter?['copper','tin','iron']:['meat','bearmeat']).includes(item)||!Number.isInteger(count)||count<1||!take(s,item,count))return false;const c=cookState(s,id);if(!c.jobs.length)c.remaining=30;const last=c.jobs.at(-1);if(last?.item===item)last.qty+=count;else c.jobs.push({item,qty:count});return true}
export function queueMeat(s,id,count=1){return queueProcess(s,id,'meat',count)}
export function advanceCooking(s,dt){if(!Number.isFinite(dt)||dt<=0)return false;let changed=false;for(const id of Object.keys(s.cooking)){const c=cookState(s,id),burn=Math.min(c.fuel,dt);c.fuel=Math.max(0,c.fuel-burn);let left=burn;while(c.jobs.length&&left>1e-8){const used=Math.min(c.remaining,left);c.remaining-=used;left-=used;if(c.remaining<=1e-8){const j=c.jobs[0],out=PROCESS_OUTPUT[j.item];c.output[out]=(c.output[out]||0)+1;if(--j.qty<=0)c.jobs.shift();c.remaining=30;changed=true}}}return changed}
export function collectCooked(s,id){const c=cookState(s,id);let n=0;for(const [item,qty] of Object.entries(c.output)){add(s,item,qty);n+=qty}c.output={};return n}
export function unpackCooking(s,id){const c=cookState(s,id),items={...c.output};for(const j of c.jobs)items[j.item]=(items[j.item]||0)+j.qty;delete s.cooking[id];return items}
export function sleepAt(s,id){const bed=s.buildings.find(b=>b.id===id&&b.kind==='bed'),minute=s.time%1440;if(!bed||minute>=480&&minute<1200)return false;s.time=(Math.floor(s.time/1440)+(minute>=1200?1:0))*1440+480;s.respawnBed=id;s.health=clamp(s.health+25);s.stamina=100;return true}
export function deathInventory(s,area='world'){const items={...s.inventory};let grave=null;if(Object.keys(items).length){grave={id:s.nextGraveId++,x:s.x,z:s.z,area,items};s.graves.push(grave)}addMapMarker(s,{kind:'death',area,x:s.x,z:s.z,name:'Morte',graveId:grave?.id??null,day:Math.floor(s.time/1440)+1});s.inventory={};s.hotbar=Array(9).fill(null);s.selected=0;s.equipped={weapon:null,tunic:false,boots:false,wintercoat:false,beararmor:false,shield:false};return grave}
export function respawnPoint(s){const bed=s.buildings.find(b=>b.id===s.respawnBed&&b.kind==='bed');return bed?{x:bed.x,z:bed.z,bed}: {x:0,z:0,bed:null}}
export function recoverGrave(s,id,area,x,z){const i=s.graves.findIndex(g=>g.id===id&&g.area===area&&Math.hypot(g.x-x,g.z-z)<=2.6);if(i<0)return false;for(const [item,n] of Object.entries(s.graves[i].items))add(s,item,n);s.graves.splice(i,1);return true}

export const PARRY_WINDOW=.32,PARRY_COOLDOWN=.75;
export function parryValid(active,elapsed,angle){return !!active&&elapsed>=0&&elapsed<=PARRY_WINDOW&&Math.abs(angle)<=Math.PI*.38}
export function enemyAttackProfile(kind){return kind==='bear'?{wind:.83,reach:2.35,damage:25,recovery:1.1}:kind==='bandit'?{wind:.65,reach:2.25,damage:18,recovery:.85}:kind==='crocodile'?{wind:.68,reach:2.15,damage:18,recovery:1}:kind==='boar'?{wind:.64,reach:1.85,damage:12,recovery:.9}:NIGHT_MOBS.includes(kind)?{wind:.72,reach:2.05,damage:14,recovery:.85}:{wind:.58,reach:1.85,damage:9,recovery:.8}}

function markerText(v,max,fallback=''){return typeof v==='string'?v.trim().slice(0,max)||fallback:fallback}
function validMarkerPoint(area,x,z){return typeof area==='string'&&(area==='world'||/^interior:[a-zA-Z0-9_-]+$/.test(area))&&Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<=LIMIT&&Math.abs(z)<=LIMIT}
export function addMapMarker(s,{kind='pin',area='world',x,z,name='',description='',graveId=null,day=null}){if(!validMarkerPoint(area,x,z)||!['pin','death'].includes(kind)||kind==='pin'&&s.mapMarkers.filter(m=>m.kind==='pin').length>=200)return null;const m={id:s.nextMarkerId++,kind,area,x,z,name:markerText(name,48,kind==='death'?'Morte':'Punto di riferimento'),description:markerText(description,240),graveId,day};s.mapMarkers.push(m);return m}
export function editMapMarker(s,id,name,description){const m=s.mapMarkers.find(m=>m.id===id);if(!m||m.kind!=='pin')return false;m.name=markerText(name,48,'Punto di riferimento');m.description=markerText(description,240);return true}
export function removeMapMarker(s,id){const i=s.mapMarkers.findIndex(m=>m.id===id);if(i<0)return false;s.mapMarkers.splice(i,1);return true}

// Permanent fog-of-war. 8 m cells, revealed only near actual player positions.
export const MAP_CELL=8,MAP_GRID=Math.ceil(LIMIT*2/MAP_CELL),MAP_REVEAL_RADIUS=24;
const explorationSets=new WeakMap();
function explorationSet(s){let c=explorationSets.get(s);if(!c||c.tiles!==s.exploredTiles||c.set.size!==s.exploredTiles.length){c={tiles:s.exploredTiles,set:new Set(s.exploredTiles)};explorationSets.set(s,c)}return c.set}
export function mapTile(x,z){if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>LIMIT||Math.abs(z)>LIMIT)return -1;return Math.min(MAP_GRID-1,Math.floor((z+LIMIT)/MAP_CELL))*MAP_GRID+Math.min(MAP_GRID-1,Math.floor((x+LIMIT)/MAP_CELL))}
export function mapExplored(s,x,z){return explorationSet(s).has(mapTile(x,z))}
export function revealMap(s,x,z,radius=MAP_REVEAL_RADIUS){if(mapTile(x,z)<0)return 0;const seen=explorationSet(s),left=Math.max(0,Math.floor((x+LIMIT-radius)/MAP_CELL)),right=Math.min(MAP_GRID-1,Math.floor((x+LIMIT+radius)/MAP_CELL)),top=Math.max(0,Math.floor((z+LIMIT-radius)/MAP_CELL)),bottom=Math.min(MAP_GRID-1,Math.floor((z+LIMIT+radius)/MAP_CELL));let n=0;for(let j=top;j<=bottom;j++)for(let i=left;i<=right;i++){const id=j*MAP_GRID+i,cx=-LIMIT+(i+.5)*MAP_CELL,cz=-LIMIT+(j+.5)*MAP_CELL;if(!seen.has(id)&&Math.hypot(cx-x,cz-z)<=radius){seen.add(id);s.exploredTiles.push(id);n++}}const id=mapTile(x,z);if(!seen.has(id)){seen.add(id);s.exploredTiles.push(id);n++}return n}
export function visitInterior(s,id,key){const list=s.interiorExplored[id]||(s.interiorExplored[id]=[]);if(!list.includes(key))list.push(key)}

export const SWIM_SECONDS=25;
export function swimTick(s,dt,swimming){if(!Number.isFinite(dt)||dt<=0)return;if(swimming){const safe=s.breath/100*SWIM_SECONDS;s.breath=clamp(s.breath-100/SWIM_SECONDS*dt);s.health=clamp(s.health-12*Math.max(0,dt-safe))}else s.breath=clamp(s.breath+22*dt)}
const ADVENTURE_STATS=['crafted','parries','dodges','swum','dungeons','treasures','bosses'];
export const OBJECTIVES=[
 ['craft','Le prime creazioni','Crea 5 oggetti.','crafted',5,{wood:6,stone:4}],
 ['bench','Una nuova casa','Posiziona un banco da lavoro.','bench',1,{fiber:5,wood:6}],
 ['shelter','Un riparo sicuro','Costruisci un tetto.','shelter',1,{food:2}],
 ['night','La prima alba','Sopravvivi fino al secondo giorno.','days',1,{food:3}],
 ['swim','Oltre la riva','Nuota per 30 metri complessivi.','swum',30,{berries:6}],
 ['biomes','Figlio delle cinque terre','Visita tutti e cinque i biomi.','biomes',5,{amber:3,hide:3}],
 ['explore','Cartografo','Rivela il 10% del territorio.','map',10,{food:4,wood:10}],
 ['sites','Sulle tracce degli antichi','Scopri 10 luoghi principali.','sites',10,{copper:5,coal:5}],
 ['all_sites','L’esploratore leggendario','Scopri tutti i luoghi principali disponibili.','sites','all',{iron:8,amber:8}],
 ['hunt','Cacciatore','Sconfiggi 15 creature.','kills',15,{hide:4,food:3}],
 ['parry','Maestro dello scudo','Esegui 5 parate perfette.','parries',5,{wood:8,hide:2}],
 ['dodge','Sfuggente','Schiva 5 attacchi usando lo scatto evasivo.','dodges',5,{food:3}],
 ['dungeon','Nelle profondità','Sconfiggi tutti i guardiani di 3 sotterranei.','dungeons',3,{coal:8,flint:5}],
 ['treasure','Cercatore di tesori','Apri 5 forzieri antichi.','treasures',5,{copper:6,amber:2}],
 ['boss','Sterminatore di guardiani','Sconfiggi 5 guardiani finali.','bosses',5,{iron:8,fur:4}]
].map(([id,name,desc,stat,goal,reward])=>({id,name,desc,stat,goal,reward}));
export function normalizeAdventure(a){const ids=new Set(OBJECTIVES.map(o=>o.id));return {stats:Object.fromEntries(ADVENTURE_STATS.map(k=>[k,Number.isFinite(a?.stats?.[k])?clamp(a.stats[k],0,1e8):0])),completed:Array.isArray(a?.completed)?[...new Set(a.completed.filter(k=>ids.has(k)))]:[],claimed:Array.isArray(a?.claimed)?[...new Set(a.claimed.filter(k=>ids.has(k)&&a.completed?.includes(k)))]:[]}}
export function recordAdventure(s,key,n=1){if(ADVENTURE_STATS.includes(key)&&Number.isFinite(n)&&n>0)s.adventure.stats[key]=(s.adventure.stats[key]||0)+n}
export function objectiveProgress(s,siteIds=[]){const stat={...s.adventure.stats,bench:+s.buildings.some(b=>b.kind==='bench'),shelter:+s.buildings.some(b=>b.kind==='roof'||b.kind==='slopedroof'),days:Math.max(0,Math.floor(s.time/1440)),biomes:s.discoveries.length,map:100*s.exploredTiles.length/(MAP_GRID*MAP_GRID),sites:siteIds.filter(id=>s.opened['discover:'+id]).length,kills:s.kills};return OBJECTIVES.map(o=>{const goal=o.goal==='all'?Math.max(1,siteIds.length):o.goal,value=Math.min(goal,stat[o.stat]||0);return {...o,goal,value,done:s.adventure.completed.includes(o.id)||value>=goal,claimed:s.adventure.claimed.includes(o.id)}})}
export function updateObjectives(s,siteIds){const newly=[];for(const o of objectiveProgress(s,siteIds)){if(o.done&&!s.adventure.completed.includes(o.id)){s.adventure.completed.push(o.id);newly.push(o.name)}}return newly}
export function claimObjective(s,id,siteIds){updateObjectives(s,siteIds);const o=OBJECTIVES.find(o=>o.id===id);if(!o||!s.adventure.completed.includes(id)||s.adventure.claimed.includes(id))return false;s.adventure.claimed.push(id);for(const [k,n] of Object.entries(o.reward))add(s,k,n);return true}
