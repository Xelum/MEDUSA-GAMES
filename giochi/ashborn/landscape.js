// Connected landscapes: shared height field for rendering, walking and water.
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
export const HIGHLANDS=[
 {x:-110,z:-307,rx:91,rz:68,h:21,angle:.43,flat:.30},
 {x:155,z:-285,rx:72,rz:105,h:23,angle:-.35,flat:.39},
 {x:290,z:-156,rx:84,rz:54,h:18,angle:.75,flat:.22},
 {x:-294,z:-225,rx:81,rz:78,h:19,angle:.30,flat:.34},
 {x:-235,z:55,rx:66,rz:87,h:10,angle:-.6,flat:.26},
 {x:260,z:200,rx:78,rz:58,h:13,angle:.8,flat:.42},
 {x:42,z:339,rx:69,rz:56,h:9,angle:.4,flat:.34}
];
export const NEW_CAVES=[
 {id:'brookcave',name:'Grotta del ruscello',kind:'cave',x:73,z:-63,r:13,biome:0,guard:'wolf',reward:{flint:12,coal:8,hide:3},lore:'Un piccolo rifugio scavato dalle acque.'},
 {id:'moonstone',name:'Caverna della pietra lunare',kind:'cave',x:-242,z:-173,r:16,biome:1,guard:'forestwraith',reward:{amber:16,copper:12,coal:10},lore:'Cristalli viola segnano il cammino.'},
 {id:'ironhollow',name:'Miniera del gigante',kind:'cave',x:147,z:-231,r:16,biome:3,guard:'frostwraith',reward:{iron:18,coal:14,icecrystal:8},lore:'Una miniera abbandonata sotto un altopiano.'},
 {id:'sandvault',name:'Caverna del sole nascosto',kind:'cave',x:302,z:161,r:15,biome:2,guard:'sandstalker',reward:{copper:16,tin:10,amber:6},lore:'Le sabbie nascondono una rete di cunicoli.'},
 {id:'reedcave',name:'Grotta dei giunchi',kind:'cave',x:-181,z:218,r:15,biome:4,guard:'swampwraith',reward:{venom:8,clay:15,coal:10},lore:'Una caverna umida custodita dagli spiriti.'},
 {id:'fallsdepth',name:'Antro della cascata',kind:'cave',x:-48,z:-228,r:13,biome:3,guard:'frostwraith',reward:{icecrystal:14,iron:10,fur:5},lore:'Segui il torrente fino al passaggio nelle rocce.'}
];
const ROUTES=[
 {name:'Torrente del gelo',width:4.7,points:[[-112,-297],[-102,-282],[-104,-262],[-94,-246],[-92,-225],[-90,-222],[-73,-202],[-59,-190],[-56,-187],[-38,-166]],level:[28,24,20,16,15.6,11,7,6.4,3,0]},
 {name:'Fiume delle radure',width:5.8,points:[[126,-62],[130,-31],[118,-7],[119,22],[111,43],[126,71],[119,91],[100,117],[76,136],[48,152],[18,167]],level:[.45,.03,.03,.03,.03,.03,.03,.03,.03,.03,.03]},
 {name:'Fiume dei salici',width:6.5,points:[[-147,101],[-165,128],[-179,154],[-195,179],[-207,205],[-214,236],[-229,266],[-227,303],[-220,350]],level:[.03,.03,.03,.03,.03,.03,.03,.03,.03]}
];
// Sample a winding spline into short segments and index it spatially.
function cat(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)}
export function createLandscape(legacyHeight,waterDist,protectedPoints){
 const routes=ROUTES.map((r,ri)=>{const points=[];for(let j=0;j<r.points.length-1;j++){const a=r.points[Math.max(0,j-1)],b=r.points[j],c=r.points[j+1],d=r.points[Math.min(r.points.length-1,j+2)],n=Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/2);for(let i=0;i<n;i++){const t=i/n;points.push({x:cat(a[0],b[0],c[0],d[0],t),z:cat(a[1],b[1],c[1],d[1],t),y:lerp(r.level[j],r.level[j+1],smooth(t)),w:r.width*(.86+.18*Math.sin((j+t)*1.7+ri))})}}const p=r.points.at(-1);points.push({x:p[0],z:p[1],y:r.level.at(-1),w:r.width});return{...r,points}});
 const buckets=new Map(),K=32;for(const r of routes)for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],pad=16;for(let z=Math.floor((Math.min(a.z,b.z)-pad)/K);z<=Math.floor((Math.max(a.z,b.z)+pad)/K);z++)for(let x=Math.floor((Math.min(a.x,b.x)-pad)/K);x<=Math.floor((Math.max(a.x,b.x)+pad)/K);x++){const key=x+','+z;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push([a,b])}}
 function river(x,z){let best=null,bd=Infinity;for(const [a,b] of buckets.get(Math.floor(x/K)+','+Math.floor(z/K))||[]){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1))),d=Math.hypot(x-a.x-dx*t,z-a.z-dz*t);if(d<bd){bd=d;best={d,w:lerp(a.w,b.w,t),y:lerp(a.y,b.y,t)}}}return best}
 function terrain(x,z){let y=legacyHeight(x,z),rise=0;for(const m of HIGHLANDS){const dx=x-m.x,dz=z-m.z,c=Math.cos(m.angle),s=Math.sin(m.angle),u=(dx*c+dz*s)/m.rx,v=(-dx*s+dz*c)/m.rz,r=Math.hypot(u,v)*(1+.10*Math.sin(u*7+v*4)+.055*Math.cos(v*9-u*5));if(r>=1)continue;const t=1-smooth((r-m.flat)/(1-m.flat));rise+=m.h*t*(.95+.05*Math.sin(u*5-v*3))}
 let fade=1;for(const p of protectedPoints){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+22)fade=Math.min(fade,smooth((d-p.r)/22))}y+=rise*fade*smooth((waterDist(x,z)-24)/16);
 for(const p of NEW_CAVES){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+10)y=lerp(y,legacyHeight(p.x,p.z),1-smooth((d-p.r)/10))}
 const r=river(x,z);if(r){const bank=smooth((r.d-r.w*.96)/Math.max(5,r.w*1.0));const bed=r.y-.85-(1-smooth(r.d/r.w))*.7;y=lerp(bed,y,bank)}
 return y}
 return {routes,river,terrain,wet(x,z,pad=0){const r=river(x,z);return !!r&&r.d<r.w+pad},near(x,z){const r=river(x,z);return r&&r.d<r.w+2}};
}
export function buildRivers(T,scene,landscape,coarse){
 const root=new T.Group();scene.add(root);const time={value:0},mat=new T.ShaderMaterial({uniforms:{time},side:T.DoubleSide,transparent:true,depthWrite:true,vertexShader:'varying vec2 vUv;varying vec3 wp;void main(){vUv=uv;wp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float time;varying vec2 vUv;varying vec3 wp;void main(){float a=.5+.5*sin(vUv.y*2.4-time*4.+sin(vUv.x*20.)*1.8);float b=.5+.5*sin(wp.x*2.3+wp.z*1.6-time*1.5);float shore=1.-smoothstep(.02,.15,min(vUv.x,1.-vUv.x));vec3 c=mix(vec3(.12,.40,.46),vec3(.33,.72,.73),a*.45+b*.25);c=mix(c,vec3(.82,.94,.89),shore*.65+pow(a*b,7.)*.3);gl_FragColor=vec4(c,.91);}'});const meshes=[];const foamGeo=new T.BufferGeometry(),foamPos=[],foamPhase=[];
 for(const r of landscape.routes){const pos=[],uv=[],idx=[];let distance=0;for(let i=0;i<r.points.length;i++){const p=r.points[i],a=r.points[Math.max(0,i-1)],b=r.points[Math.min(r.points.length-1,i+1)],d=Math.hypot(b.x-a.x,b.z-a.z)||1,nx=-(b.z-a.z)/d,nz=(b.x-a.x)/d;if(i)distance+=Math.hypot(p.x-a.x,p.z-a.z);for(const side of [-1,1]){pos.push(p.x+nx*p.w*.91*side,p.y+.08,p.z+nz*p.w*.91*side);uv.push((side+1)/2,distance)}if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);const fall=(a.y-p.y)/Math.max(.01,Math.hypot(a.x-p.x,a.z-p.z));if(fall>.58){for(let j=0;j<(coarse?4:8);j++){const t=j*2.39996;foamPos.push(p.x+Math.sin(t)*p.w*.75,p.y+.15,p.z+Math.cos(t)*1.2);foamPhase.push((i*7+j)*.618033%1)}}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=new T.Mesh(geo,mat);root.add(m);meshes.push(m)}
 foamGeo.setAttribute('position',new T.Float32BufferAttribute(foamPos,3));foamGeo.setAttribute('phase',new T.Float32BufferAttribute(foamPhase,1));const foam=new T.Points(foamGeo,new T.ShaderMaterial({uniforms:{time},transparent:true,depthWrite:false,vertexShader:'attribute float phase;uniform float time;varying float fade;void main(){float f=fract(phase+time*.7);vec3 p=position+vec3(sin(phase*31.)*f*.7,sin(f*3.14159)*1.1,cos(phase*27.)*f*1.4);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(160./max(1.,-mv.z),2.,28.);fade=sin(f*3.14159);}',fragmentShader:'varying float fade;void main(){float a=max(0.,1.-length(gl_PointCoord-.5)*2.);gl_FragColor=vec4(.78,.94,.96,a*a*fade*.65);}'}));foam.frustumCulled=false;root.add(foam);return {root,update(t){time.value=t;root.visible=true},hide(){root.visible=false}};
}
// Deterministic clustered forest candidates. A ring of trees surrounds intentional clearings.
export function groveCandidates(x,z,biome){const list=[];for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const a=Math.floor(x/38)+i,b=Math.floor(z/38)+j;let seed=(Math.imul(a,73856093)^Math.imul(b,19349663)^12459)>>>0;const r=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const cx=(a+.25+r()*.5)*38,cz=(b+.25+r()*.5)*38,bi=biome(cx,cz),gate=r();if(Math.hypot(cx,cz)<17||gate>[.76,.96,.09,.35,.65][bi])continue;const n=[12,19,5,9,13][bi],radius=9+r()*7;for(let k=0;k<n;k++){const angle=k*2.39996+r()*.3,d=radius*(.35+.65*Math.sqrt((k+1)/n)),xx=cx+Math.cos(angle)*d,zz=cz+Math.sin(angle)*d;list.push({id:'grove:'+a+':'+b+':'+k,kind:bi===1&&r()>.42?'oak':'wood',x:xx,z:zz,rot:r()*Math.PI*2,tier:1,seed:(Math.abs(a*1231+b*419+k*37)%9000)+6000})}}return list}
