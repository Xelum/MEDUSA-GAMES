// Original Ashborn environment art: terrain material blending, coherent weather and local VFX.
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,fract=x=>x-Math.floor(x),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const hash=(x,z)=>fract(Math.sin(x*127.1+z*311.7)*43758.5453);
function noise(x,z){const a=Math.floor(x),b=Math.floor(z),u=smooth(fract(x)),v=smooth(fract(z));return mix(mix(hash(a,b),hash(a+1,b),u),mix(hash(a,b+1),hash(a+1,b+1),u),v)}
export function weatherAt(minute,bi){const slot=Math.floor(minute/210),phase=fract(minute/210),r=hash(slot+7,bi+41),q=hash(slot+8,bi+41);const amount=x=>bi===2?(x>.66?.75:0):bi===3?(x>.46?.85:.12):bi===4?(x>.24?.72:.2):x>.69?.85:x>.48?.33:0;const storm=mix(amount(r),amount(q),smooth((phase-.72)/.28));const wind=clamp(.24+storm*.63+hash(slot,bi)*.13);return {storm,wind,name:bi===2&&storm>.35?'Vento di sabbia':bi===3&&storm>.25?'Neve':bi!==2&&bi!==3&&storm>.55?'Pioggia':bi===4?'Foschia':storm>.23?'Nuvoloso':'Sereno'}}
export function terrainArt(T,mat,coarse){
 const n=256,pixels=new Uint8Array(n*n*4);for(let z=0;z<n;z++)for(let x=0;x<n;x++){const u=x/n,v=z/n;let broad=0,detail=0; // periodic value noise, seamless on all edges
 const tile=(f)=>{const X=u*f,Z=v*f,a=Math.floor(X),b=Math.floor(Z),s=smooth(fract(X)),t=smooth(fract(Z)),h=(i,j)=>hash((i+f)%f,(j+f)%f);return mix(mix(h(a,b),h(a+1,b),s),mix(h(a,b+1),h(a+1,b+1),s),t)};
 broad=tile(8)*.62+tile(19)*.26+tile(43)*.12;detail=tile(48)*.50+tile(109)*.30+hash(x,z)*.20;
 const grit=tile(36)*.55+tile(87)*.45,vein=1-Math.abs(Math.sin(u*TAU*7+tile(13)*4+v*TAU*4));const i=(z*n+x)*4;pixels[i]=Math.round(broad*255);pixels[i+1]=Math.round(detail*255);pixels[i+2]=Math.round(grit*255);pixels[i+3]=Math.round(vein*255)}
 const tex=new T.DataTexture(pixels,n,n,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
 const wet={value:0},sun={value:1};mat.bumpScale=.10;
 mat.onBeforeCompile=shader=>{shader.uniforms.ashSurface={value:tex};shader.uniforms.ashWet=wet;shader.uniforms.ashDay=sun;
 shader.vertexShader='attribute vec4 ashRegions;attribute float ashMarsh;varying vec4 vAshRegions;varying float vAshMarsh;varying vec3 vAshGround;varying float vAshSlope;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvAshGround=(modelMatrix*vec4(transformed,1.0)).xyz;vAshSlope=abs(normal.y);vAshRegions=ashRegions;vAshMarsh=ashMarsh;');
 shader.fragmentShader='uniform sampler2D ashSurface;uniform float ashWet;uniform float ashDay;varying vec4 vAshRegions;varying float vAshMarsh;varying vec3 vAshGround;varying float vAshSlope;\n'+shader.fragmentShader.replace('#include <map_fragment>',`
 vec2 ashP=vAshGround.xz;
 vec4 ashMacro=texture2D(ashSurface,ashP*.038);
 vec4 ashMicro=texture2D(ashSurface,ashP*.57);
 float ashDesert=clamp(vAshRegions.z,0.,1.);
 float ashSnow=clamp(vAshRegions.w,0.,1.);
 float ashMoss=clamp(vAshRegions.y+vAshMarsh,0.,1.);
 float ashRock=smoothstep(.12,.43,1.-vAshSlope+ashMacro.r*.16);
 float ashSoil=smoothstep(.52,.73,ashMacro.r+ashMicro.r*.13)*(1.-ashDesert)*(1.-ashSnow)*(1.-ashRock);
 float ashPath=smoothstep(.68,.83,ashMacro.a)*smoothstep(.42,.62,ashMacro.r)*.36;
 vec3 ashGrass=diffuseColor.rgb*mix(.75,1.23,ashMacro.r)*mix(.82,1.17,ashMicro.g);
 vec3 ashEarth=mix(vec3(.17,.115,.063),vec3(.075,.095,.055),ashMoss)*mix(.68,1.28,ashMicro.r);
 vec3 ashStone=mix(vec3(.17,.18,.155),vec3(.34,.37,.37),ashMicro.b)*mix(.76,1.15,ashMacro.g);
 vec3 ashSand=mix(vec3(.28,.19,.105),vec3(.60,.45,.25),ashMacro.r)*(.88+.20*ashMicro.g+.055*sin(dot(ashP,vec2(7.3,4.4))+ashMacro.g*10.));
 vec3 ashIce=mix(vec3(.36,.45,.48),vec3(.79,.85,.86),ashMicro.g);
 vec3 ashMud=mix(vec3(.068,.080,.052),vec3(.18,.19,.11),ashMacro.r);
 vec3 ashColor=mix(ashGrass,ashEarth,clamp(ashSoil+ashPath,0.,.83));
 ashColor=mix(ashColor,ashMud,vAshMarsh*smoothstep(.30,.68,ashMacro.r)*.76);
 ashColor=mix(ashColor,ashSand,ashDesert*.91);
 ashColor=mix(ashColor,ashIce,ashSnow*smoothstep(.16,.51,ashMacro.r+vAshGround.y*.012));
 ashColor=mix(ashColor,ashStone,ashRock*(1.-ashDesert*.58));
 diffuseColor.rgb=ashColor*(1.-ashWet*.21*(1.-ashSnow));
 `).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.48,ashWet*.5);');
 };mat.customProgramCacheKey=()=> 'ashborn-terrain-14';return {update(w,d){wet.value=w;sun.value=d},texture:tex}
}
// Real particle sprites with soft edges, stable world-space positions and bounded populations.
export function createEnvironment(T,scene,height,coarse){
 const root=new T.Group();scene.add(root);const n=64;
 function spriteTexture(kind){const p=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=(x+.5-n/2)/(n/2),v=(y+.5-n/2)/(n/2),r=Math.hypot(u,v);let alpha=Math.pow(Math.max(0,1-r*r),kind==='mist'?2.5:kind==='glow'?4:1.6);if(kind==='leaf')alpha=Math.pow(Math.max(0,1-u*u*3-v*v),.65)*(.55+.45*Math.cos(u*6));if(kind==='smoke')alpha*=.55+.45*noise(x*.16,y*.16);if(kind==='flake')alpha=Math.max(alpha*.34,Math.exp(-Math.abs(u)*32)*Math.max(0,1-Math.abs(v))*Math.exp(-r*r*2),Math.exp(-Math.abs(v)*32)*Math.max(0,1-Math.abs(u))*Math.exp(-r*r*2));const i=(y*n+x)*4;p[i]=p[i+1]=p[i+2]=255;p[i+3]=Math.round(clamp(alpha)*255)}const t=new T.DataTexture(p,n,n,T.RGBAFormat);t.needsUpdate=true;return t}
 const textures=Object.fromEntries(['mist','glow','leaf','smoke','flake'].map(k=>[k,spriteTexture(k)]));
 function layer(max,kind,size,color,opacity,add=false){const data=new Float32Array(max*3),colors=new Float32Array(max*3).fill(1),g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(data,3));g.setAttribute('color',new T.BufferAttribute(colors,3));g.setDrawRange(0,0);const m=new T.PointsMaterial({map:textures[kind],color,size,opacity,transparent:true,vertexColors:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending});const o=new T.Points(g,m);o.frustumCulled=false;root.add(o);return{data,colors,g,m,o,max}}
 const motes=layer(coarse?48:105,'glow',.10,0xf0d6a2,.58,true),leaves=layer(coarse?14:35,'leaf',.20,0xb0a45a,.64),mist=layer(coarse?12:30,'mist',9,0xb3c5bb,.11),snow=layer(coarse?65:155,'flake',.17,0xf1f5f4,.78),smoke=layer(coarse?50:120,'smoke',.72,0xb1b0a5,.35),sparks=layer(coarse?35:80,'glow',.105,0xffb56d,.9,true),dust=layer(coarse?40:100,'mist',.52,0xd3af7c,.24);
 const rainMax=coarse?110:310,rainData=new Float32Array(rainMax*6),rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(rainData,3));rg.setDrawRange(0,0);const rm=new T.LineBasicMaterial({color:0xb6cad5,transparent:true,opacity:.26,depthWrite:false}),rain=new T.LineSegments(rg,rm);rain.frustumCulled=false;root.add(rain);
 function put(l,i,x,y,z,brightness=1){l.data[i*3]=x;l.data[i*3+1]=y;l.data[i*3+2]=z;l.colors[i*3]=l.colors[i*3+1]=l.colors[i*3+2]=brightness}
 function finish(l,k){l.o.visible=k>0;l.g.setDrawRange(0,k);l.g.attributes.position.needsUpdate=l.g.attributes.color.needsUpdate=true}
 let cx=Infinity,cz=Infinity,cache=new Map();
 function ground(x,z){const a=Math.round(x/3),b=Math.round(z/3),k=a+','+b;if(!cache.has(k))cache.set(k,height(a*3,b*3));return cache.get(k)}
 function invalidate(){cache.clear();cx=cz=Infinity}
 function update({x,z,y,t,day,bi,weather,indoors=false,sources=[]}){
  if(Math.floor(x/12)!==cx||Math.floor(z/12)!==cz){cx=Math.floor(x/12);cz=Math.floor(z/12);cache.clear()}
  const storm=weather.storm,wind=weather.wind,night=1-day;
  const point=(i,speed,radius)=>{const a=i*2.399963+t*speed,r=radius*(.2+.8*hash(i,41));return[x+Math.cos(a)*r,z+Math.sin(a)*r]};
  let k=0;const mc=indoors?Math.floor(motes.max*.38):bi===2?0:bi===3?Math.floor(motes.max*.16):Math.floor(motes.max*(day<.68?.66:.32));motes.m.color.set(indoors?0xc6b99a:day<.68?0xc6df83:0xead5a0);motes.m.size=indoors?.065:day<.68?.13:.065;motes.m.opacity=indoors?.32:day<.68?.65:.30;
  for(let i=0;i<mc;i++){const [xx,zz]=point(i,.036,indoors?5:24),yy=indoors?.25+hash(i,22)*3:ground(xx,zz)+.4+hash(i,22)*2.7;put(motes,k++,xx,yy+.22*Math.sin(t*1.7+i),zz,.45+.55*(.5+.5*Math.sin(t*2.2+i*3)))}finish(motes,k);
  k=0;if(!indoors&&(bi===0||bi===1||bi===4)){leaves.m.color.set(bi===1?0x9a9a55:0xb8aa67);for(let i=0;i<leaves.max*(bi===1?1:.38);i++){const [xx,zz]=point(i,.024+wind*.065,19),yy=ground(xx,zz)+.25+fract(hash(i,8)-t*(.04+wind*.018))*4;put(leaves,k++,xx+.25*Math.sin(t+i),yy,zz, .6+.35*hash(i,4))}}finish(leaves,k);
  k=0;if(!indoors){mist.m.opacity=[.026,.067,.037,.085,.105][bi]*(.7+.6*night+.5*storm);mist.m.color.set([0xc3d1c4,0xa3b8ab,0xe2c8a0,0xd8e3eb,0x92b09c][bi]);mist.m.size=bi===4?9:7;for(let i=0;i<mist.max;i++){const [xx,zz]=point(i,.008+wind*.006,33);put(mist,k++,xx,ground(xx,zz)+.7+hash(i,17)*.6,zz,.55+.4*hash(i,55))}}finish(mist,k);
  k=0;if(!indoors&&bi===3){for(let i=0;i<snow.max*(.18+storm*.80);i++){const xx=x+(fract(hash(i,17)+t*.014*wind)-.5)*33,zz=z+(hash(i,21)-.5)*33,yy=ground(xx,zz)+fract(hash(i,93)-t*.063)*10;put(snow,k++,xx,yy,zz,.45+.55*hash(i,4))}}finish(snow,k);
  k=0;if(!indoors&&bi===2&&storm>.12){dust.m.opacity=.14+storm*.11;for(let i=0;i<dust.max*storm;i++){const xx=x+(fract(hash(i,14)+t*.045*wind)-.5)*36,zz=z+(hash(i,28)-.5)*28;put(dust,k++,xx,ground(xx,zz)+.18+hash(i,5)*1.7,zz,.6+.4*hash(i,31))}}finish(dust,k);
  let rc=0;if(!indoors&&bi!==2&&bi!==3&&storm>.35){rc=Math.floor(rainMax*storm);rm.opacity=.12+storm*.18;for(let i=0;i<rc;i++){const xx=x+(fract(hash(i,15)+t*.02*wind)-.5)*27,zz=z+(hash(i,23)-.5)*27,yy=ground(xx,zz)+fract(hash(i,94)-t*.82)*10,j=i*6;rainData[j]=xx;rainData[j+1]=yy;rainData[j+2]=zz;rainData[j+3]=xx-wind*.23;rainData[j+4]=yy+.40+storm*.24;rainData[j+5]=zz+.06}}rain.visible=rc>0;rg.setDrawRange(0,rc*2);rg.attributes.position.needsUpdate=true;
  let sc=0,ec=0;const nearby=sources.filter(a=>Math.hypot(a.x-x,a.z-z)<19).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)).slice(0,coarse?3:6);
  for(const a of nearby){for(let i=0;i<17&&sc<smoke.max;i++){const f=fract(t*.24+hash(i,5)),ang=i*2.4+t*.3,r=.07+f*.52;put(smoke,sc++,a.x+Math.sin(ang)*r+(indoors?.12:wind)*f*1.5,a.y+f*3.1,a.z+Math.cos(ang)*r,(1-f)*.7)}for(let i=0;i<12&&ec<sparks.max;i++){const f=fract(t*.58+hash(i,7)),ang=i*2.4+t;put(sparks,ec++,a.x+Math.sin(ang)*(.09+f*.29),a.y+f*1.5,a.z+Math.cos(ang)*(.09+f*.25),1-f*.72)}}finish(smoke,sc);finish(sparks,ec);
 }return {root,update,invalidate,layers:{motes,leaves,mist,snow,smoke,sparks,dust,rain}}
}
