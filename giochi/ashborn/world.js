// World Overhaul: deterministic terrain, explorable architecture and streamed biome detail.
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
export const SITES=[
 {id:'watchtower',name:'Torre del vento',kind:'tower',x:54,z:33,r:8,biome:0,reward:{wood:12,stone:8,hide:2},lore:'Una vedetta dimenticata.'},
 {id:'cave',name:'Grotta delle radici',kind:'cave',x:-118,z:-91,r:15,biome:1,reward:{amber:6,flint:12,mushroom:8},lore:'Cristalli nascosti sotto le radici.',guard:'forestwraith'},
 {id:'crypt',name:'Cripta dei re perduti',kind:'crypt',x:-215,z:-118,r:16,biome:1,reward:{amber:12,bone:12,hide:5,copper:8},lore:'Il tesoro dei re dimenticati.',guard:'shade'},
 {id:'caravan',name:'Carovana perduta',kind:'caravan',x:212,z:112,r:9,biome:2,reward:{copper:6,wood:8,cactus:6},lore:'Le dune hanno inghiottito i mercanti.'},
 {id:'frostcave',name:'Grotta del cuore di ghiaccio',kind:'cave',x:94,z:-246,r:15,biome:3,reward:{icecrystal:15,fur:5,flint:8},lore:'Il ghiaccio custodisce un cuore luminoso.',guard:'frostwraith'},
 {id:'witch',name:'Casa della strega',kind:'witch',x:-82,z:245,r:12,biome:4,lore:'La custode della palude conosce gli antichi rimedi.'},
 {id:'marshcrypt',name:'Cripta delle acque nere',kind:'crypt',x:-132,z:285,r:16,biome:4,reward:{venom:9,clay:12,bone:10,reed:8},lore:'Il culto delle acque nere è scomparso.',guard:'swampwraith'},
 {id:'campold',name:'Capanna del cacciatore',kind:'hut',x:-65,z:84,r:8,biome:0,reward:{hide:4,meat:3,fiber:10},lore:'Il cacciatore non è mai tornato.'}
];
export function oldBase(x,z,w,d){const base=1.9*Math.sin(x*.041)*Math.cos(z*.046)+.72*Math.sin(x*.098+z*.073)+.3*Math.cos(z*.19-x*.09)+1.5,extra=w[3]*(7+5*Math.sin(x*.037)*Math.cos(z*.042))+w[2]*(2+1.6*Math.sin(x*.065+z*.034))-w[4]*.6+w[1]*1.2,t=clamp((d-17)/9,0,1);return -.8+(base+extra+.8)*t*t*(3-2*t)}
export function relief(x,z,w,d){const edge=smooth((Math.hypot(x,z)-27)/65)*smooth((d-26)/16),ridge=Math.pow(.5+.5*Math.sin(x*.024+Math.sin(z*.023)*1.7)*Math.cos(z*.027),2),hills=3.8*Math.sin(x*.017+z*.011)*Math.cos(z*.024)+1.3*Math.cos(x*.061-z*.043);
 return edge*(w[0]*(2.4+ridge*5+hills*.45)+w[1]*(3+ridge*7+hills*.7)+w[2]*(2+3.5*Math.sin(x*.048+z*.019+Math.sin(z*.034)*1.4))+w[3]*(9+ridge*24+hills*1.25)+w[4]*(.4+1.2*Math.sin(x*.061)*Math.cos(z*.057)))}
export function worldHeight(x,z,weights,water,legacy=false){const w=weights(x,z),d=water(x,z),base=oldBase(x,z,w,d);if(legacy)return base;let y=base+relief(x,z,w,d);for(const site of SITES){const dist=Math.hypot(x-site.x,z-site.z);if(dist>site.r+13)continue;const target=oldBase(site.x,site.z,weights(site.x,site.z),water(site.x,site.z))+relief(site.x,site.z,weights(site.x,site.z),water(site.x,site.z));y+=(target-y)*(1-smooth((dist-site.r)/(13)));}return y}
export function siteScale(s){return s.kind==='crypt'?1.48:s.kind==='cave'?1.5:s.kind==='tower'?1.85:s.kind==='witch'||s.kind==='hut'?1.65:1.45}
export function protectedSite(x,z,pad=0){return SITES.some(s=>Math.hypot(x-s.x,z-s.z)<s.r+pad)}
export function buildWorld(T,scene,visuals,height,coarse){
 const sites=[],walls=[],lights=[],roofs=[],obstacles=[],geos={box:new T.BoxGeometry(1,1,1),rock:new T.IcosahedronGeometry(1,2),cyl:new T.CylinderGeometry(.82,1,1,10),cone:new T.ConeGeometry(1,1,12)},materials=new Map();
 function mat(c,k='stone'){let key=c+':'+k;if(!materials.has(key))materials.set(key,visuals.material(c,k,{roughness:.92}));return materials.get(key)}
 function mesh(p,geo,c,x,y,z,sx,sy,sz,k='stone'){const m=new T.Mesh(geos[geo],mat(c,k));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;p.add(m);return m}
 const B=(p,c,x,y,z,sx,sy,sz,k='bark')=>mesh(p,'box',c,x,y,z,sx,sy,sz,k),R=(p,c,x,y,z,sx,sy,sz)=>mesh(p,'rock',c,x,y,z,sx,sy,sz),C=(p,c,x,y,z,sx,sy,sz,k='bark')=>mesh(p,'cyl',c,x,y,z,sx,sy,sz,k);
 function wall(s,x,z,w,d,y=2,h=4,c=0x77786c){B(s.g,c,x,y,z,w,h,d,'stone');walls.push({site:s,x:s.x+x,z:s.z+z,w,d});}
 function torch(s,x,y,z,col=0xffb36b){C(s.g,0x574432,x,y-.25,z,.08,.55,.08);const f=mesh(s.g,'cone',col,x,y+.15,z,.16,.48,.16,'earth');f.material=new T.MeshBasicMaterial({color:col});const l=new T.PointLight(col,12,10,2);l.position.set(x,y+.24,z);s.g.add(l);lights.push({site:s,l,f,phase:x*3+z});}
 function stoneWall(s,x,z,w,d,h=4){wall(s,x,z,w,d,h/2,h);const along=w>d,count=Math.ceil(Math.max(w,d)/.85);for(let row=0;row<Math.ceil(h/.65);row++)for(let j=0;j<count;j++){const v=(j+.5)/count-.5;const px=x+(along?v*w:0),pz=z+(along?0:v*d),m=B(s.g,[0x838176,0x6e7168,0x919083][(row+j)%3],px,.33+row*.65,pz,along?w/count*.94:d+.06,.59,along?d+.06:d/count*.94,'stone');m.rotation.y=Math.sin(row+j)*.014}}
 function roof(s,x,z,w,d,h){const m=B(s.g,0x514e43,x,h,z,w,.40,d,'stone');roofs.push({site:s,m});return m}
 function doorWalls(s,w,z){stoneWall(s,-w*.34,z,w*.32,.75,3.7);stoneWall(s,w*.34,z,w*.32,.75,3.7);B(s.g,0x929082,0,3.45,z,w*.40,.65,.95,'stone')}
 function hut(s,witch){const w=5.6,d=6.4;for(const x of [-w/2,w/2]){wall(s,x,0,.35,d,1.6,3.2,0x64503b);for(let i=0;i<8;i++)B(s.g,0x84613d,x,.22+i*.39,0,.46,.32,d,'bark')}wall(s,0,-d/2,w,.35,1.6,3.2,0x66513b);for(const x of [-1.88,1.88]){wall(s,x,d/2,1.86,.35,1.6,3.2,0x705138);for(let i=0;i<8;i++)B(s.g,0x87643c,x,.22+i*.39,d/2,1.9,.32,.43)}
  B(s.g,0x4b382b,0,2.96,d/2,2.1,.44,.48);for(const side of [-1,1]){const r=B(s.g,witch?0x3b4d39:0x695038,side*1.72,3.79,0,4.1,.24,7.4,'cloth');r.rotation.z=side*-.55;roofs.push({site:s,m:r});for(let i=0;i<10;i++){const sh=B(s.g,witch?0x4c5c3d:0x8a6c42,side*1.72,3.92,(i-4.5)*.72,4.1,.08,.69,'bark');sh.rotation.z=side*-.55;roofs.push({site:s,m:sh})}}
  for(const x of [-2.55,2.55])for(const z of [-3,3])B(s.g,0x493628,x,1.6,z,.24,3.2,.24);B(s.g,0x796347,0,.05,0,5.35,.11,6,'bark');B(s.g,0x55412e,-1.75,.75,-1.8,1.5,.16,.76);for(const x of [-2.3,-1.2])B(s.g,0x55412e,x,.38,-1.8,.12,.76,.5);
  if(witch){const pot=R(s.g,0x343d37,-1.6,.58,1.05,.65,.54,.65);const rim=C(s.g,0x565d49,-1.6,.92,1.05,.58,.13,.58,'stone');const brew=C(s.g,0x9ec765,-1.6,1.00,1.05,.50,.06,.50,'earth');brew.material=new T.MeshBasicMaterial({color:0x8da64b});torch(s,-1.6,1.24,1.05,0x9fe48c);for(let i=0;i<5;i++){C(s.g,0x738d53,-2.3+i*.22,1.04,-1.8,.075,.3,.075,'earth')}const npc=new T.Group();npc.position.set(1.55,0,-1.65);s.g.add(npc);mesh(npc,'cone',0x3f4c36,0,.78,0,.63,1.48,.63,'cloth');R(npc,0xa58a6e,0,1.67,0,.16,.21,.16);C(npc,0x39362e,0,1.86,0,.41,.06,.41,'cloth');mesh(npc,'cone',0x39362e,0,2.09,0,.29,.53,.29,'cloth');s.npc={x:s.x+1.55,z:s.z-1.65};torch(s,2,2,2,0x8dce83)}else torch(s,2,2,2);
 }
 for(const def of SITES){const s={...def,scale:siteScale(def),g:new T.Group()};s.g.position.set(s.x,height(s.x,s.z),s.z);scene.add(s.g);sites.push(s);obstacles.push(s.g);
  if(s.kind==='cave'){const c=s.biome===3?0x85999e:0x686d60;wall(s,-4.7,0,1.4,15,2,4,c);wall(s,4.7,0,1.4,15,2,4,c);wall(s,0,-7.4,10,1.3,2,4,c);
   for(let i=0;i<9;i++)for(const side of [-1,1]){const r=R(s.g,c,side*(5.2+.25*Math.sin(i*2)),2.3,(i-4)*1.65,1.8,2.9,1.55);r.rotation.y=i*.7}
   for(let i=0;i<6;i++){const r=R(s.g,c,0,5.15,(i-2.5)*2.7,6.5,1.8,2.2);roofs.push({site:s,m:r})}
   for(const side of [-1,1]){R(s.g,c,side*3.8,1.8,7.35,2.1,2.6,1.9);walls.push({site:s,x:s.x+side*3.8,z:s.z+7.35,w:3,d:2})}for(let i=0;i<9;i++){const x=(i%2?-1:1)*(2.9+(i%3)*.34),z=-6+i*1.3;const gem=mesh(s.g,'cone',s.biome===3?0xa2e7f4:0x7fbba0,x,.52,z,.22,.95,.22,'stone');gem.rotation.z=.24*Math.sin(i);gem.material=new T.MeshStandardMaterial({color:s.biome===3?0x9edced:0x8cbfa1,emissive:0x36594d,emissiveIntensity:.7,roughness:.3})}torch(s,-3.4,2.0,4);torch(s,3.3,2.0,-4,s.biome===3?0x9fdcff:0x99d8ad);s.loot={x:s.x,z:s.z-5.7};s.inside={w:4,d:7.5};
  }else if(s.kind==='crypt'){stoneWall(s,-5.4,0,.8,17);stoneWall(s,5.4,0,.8,17);stoneWall(s,0,-8.5,11,.8);doorWalls(s,11,8.5);doorWalls(s,11,.2);roof(s,0,0,11.8,18.2,4.35);for(let i=0;i<8;i++){B(s.g,0x868477,(i-3.5)*1.38,4.78,0,1.28,.4,17.7,'stone');for(const side of [-1,1])B(s.g,0x979487,side*5.7,.35,(i-3.5)*2.15,.45,.65,1.4,'stone')}for(const z of [5,-4]){torch(s,-3.8,2,z,s.biome===4?0x8cce91:0xffb56d);torch(s,3.8,2,z)}s.loot={x:s.x,z:s.z-6.8};s.inside={w:4.85,d:8.1};
  }else if(s.kind==='witch'||s.kind==='hut'){hut(s,s.kind==='witch');s.inside={w:2.5,d:3};if(s.kind==='hut')s.loot={x:s.x+.8,z:s.z-1.8};
  }else if(s.kind==='tower'){for(let i=0;i<3;i++){stoneWall(s,-2.7,0,.7,5.5,3+i*.03);break}stoneWall(s,2.7,0,.7,5.5,3.8);stoneWall(s,0,-2.7,5.7,.7,4.1);for(let i=0;i<5;i++){B(s.g,0x89897d,2.7,4+i*.48,-1.7,.72,.44,2.2,'stone')}for(let i=0;i<5;i++)R(s.g,0x7a7b6c,-3.2+i*1.2,.35,3.4,.48,.35,.4);s.loot={x:s.x,z:s.z-1.4};
  }else{for(const x of [-2.1,2.1]){B(s.g,0x856342,x,.65,0,2.5,.3,3);for(const side of [-1,1]){const wheel=C(s.g,0x53432f,x+side*1.35,.54,0,.63,.14,.63);wheel.rotation.z=Math.PI/2}for(let i=0;i<4;i++)B(s.g,0x9c7650,x,.95,(i-1.5)*.66,2.35,.3,.58)}for(let i=0;i<5;i++)R(s.g,0xafa18a,-2+i,.17,3.2,.22,.14,.3);s.loot={x:s.x,z:s.z-2.4}}
  // Scale the architecture and its collision/interaction coordinates together.
  const k=s.scale;s.g.scale.set(k,k,k);
  for(const v of walls.filter(v=>v.site===s)){v.x=s.x+(v.x-s.x)*k;v.z=s.z+(v.z-s.z)*k;v.w*=k;v.d*=k}
  if(s.inside){s.inside.w*=k;s.inside.d*=k}
  if(s.loot){s.loot.x=s.x+(s.loot.x-s.x)*k;s.loot.z=s.z+(s.loot.z-s.z)*k}
  if(s.npc){s.npc.x=s.x+(s.npc.x-s.x)*k;s.npc.z=s.z+(s.npc.z-s.z)*k}
  for(const v of lights.filter(v=>v.site===s)){v.l.distance*=k}
 }
 function blocked(x,z){return walls.some(w=>w.site.g.visible&&Math.abs(x-w.x)<w.w/2+.24&&Math.abs(z-w.z)<w.d/2+.24)}
 function inside(x,z){return sites.find(s=>s.g.visible&&s.inside&&Math.abs(x-s.x)<s.inside.w&&Math.abs(z-s.z)<s.inside.d)}
 function update(x,z,t){for(const s of sites)s.g.visible=Math.hypot(x-s.x,z-s.z)<145;for(const v of lights){v.l.visible=v.site.g.visible&&Math.hypot(x-v.site.x,z-v.site.z)<20;v.l.intensity=10+2*Math.sin(t*9+v.phase);v.f.scale.y=.48*(1+.12*Math.sin(t*8+v.phase))}}
 function reheight(){for(const s of sites)s.g.position.y=height(s.x,s.z)}
 return {sites,obstacles,blocked,inside,update,reheight};
}
// Streamed instancing: many distinct forms, only a handful of draw calls.
// Stable, streamed harvestable ground objects. The same ID is used on every device.
export function createDetails(T,scene,visuals,height,dry,biomeIndex,blocked,coarse,sync){
 let cx=Infinity,cz=Infinity;
 function update(x,z){
  const gx=Math.floor(x/15),gz=Math.floor(z/15);if(gx===cx&&gz===cz)return;cx=gx;cz=gz;
  const entries=[];
  for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){
   if(dx*dx+dz*dz>13)continue;const ax=gx+dx,az=gz+dz;let seed=((ax*739391)^(az*19349663)^9123)>>>0;
   const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
   for(let i=0;i<12;i++){
    const px=(ax+r())*15,pz=(az+r())*15,bi=biomeIndex(px,pz),v=r(),size=r(),rot=r()*TAU,gate=r();
    const patch=.5+.28*Math.sin(px*.115+Math.cos(pz*.12)*2)+.22*Math.cos(pz*.16-px*.07);
    if(Math.abs(px)>480||Math.abs(pz)>480||!dry(px,pz)||blocked(px,pz)||gate>(bi===0?.36:bi===1?.65:bi===2?.4:bi===3?.52:.5)*(.4+patch*.8))continue;
    const kind=bi===0?(v<.35?'fiber':v<.8?'stone':v<.95?'fiber':'log'):bi===1?(v<.48?'fiber':v<.72?'log':v<.85?'fiber':'stone'):bi===2||bi===3?'stone':v<.64?'reed':v<.88?'log':'fiber';
    const tier=size<.5?0:size<.85?1:2;
    entries.push({id:'detail:'+ax+':'+az+':'+i,kind,x:px,z:pz,tier,rot});
   }
  }
  sync(entries);
 }
 return {update,invalidate(){cx=cz=Infinity}};
}

export function createAtmosphere(T,scene,height,biomeIndex,coarse){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+.5-size/2)/(size/2),(y+.5-size/2)/(size/2)),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(255*Math.pow(Math.max(0,1-r*r),3))}
 const tex=new T.DataTexture(data,size,size,T.RGBAFormat);tex.needsUpdate=true;
 function layer(n,params){const pos=new Float32Array(n*3),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));const m=new T.PointsMaterial({map:tex,transparent:true,depthWrite:false,sizeAttenuation:true,...params}),points=new T.Points(g,m);points.frustumCulled=false;scene.add(points);return{pos,g,m,points,n}}
 const mist=layer(coarse?22:52,{size:7,opacity:.11,color:0xb4c0b3}),flies=layer(coarse?45:105,{size:.24,opacity:.9,color:0xdce9a0,blending:T.AdditiveBlending});
 function update(x,z,t,day,indoors){const b=biomeIndex(x,z),m=[.025,.10,.06,.12,.17][b],night=1-day;mist.points.visible=!indoors;flies.points.visible=!indoors&&(b===0||b===1||b===4)&&day<.74;
  mist.m.opacity=m*(.65+.35*night);mist.m.color.set([0xd2dbcd,0xa9c0ae,0xdac5a0,0xd8e9ef,0x91b09a][b]);mist.m.size=b===4?9:b===3?8:6;
  for(let i=0;i<mist.n;i++){const a=i*2.39996+t*.028,r=5+(i*7.19)%29,xx=x+Math.sin(a)*r,zz=z+Math.cos(a)*r;mist.pos[i*3]=xx;mist.pos[i*3+1]=height(xx,zz)+.6+(i%4)*.21;mist.pos[i*3+2]=zz}
  mist.g.attributes.position.needsUpdate=true;flies.m.opacity=.8*night;flies.m.size=.18+.035*Math.sin(t*2.1);
  if(flies.points.visible){for(let i=0;i<flies.n;i++){const a=i*2.39996+t*.10,r=3+(i*4.72)%22,xx=x+Math.sin(a)*r+.25*Math.sin(t*1.3+i),zz=z+Math.cos(a)*r;flies.pos[i*3]=xx;flies.pos[i*3+1]=height(xx,zz)+.4+(i%9)*.21+.22*Math.sin(t*1.4+i*1.7);flies.pos[i*3+2]=zz}flies.g.attributes.position.needsUpdate=true}
 }return {update}
}
