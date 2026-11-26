// Real-time procedural art assets. No image mockups or external textures.
export function createVisuals(T,renderer,coarse){
 let seed=813;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function texture(kind,size=256){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),im=c.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,u=x/size*TAU,v=y/size*TAU;let a=0;
   if(kind==='bark')a=Math.sin(u*19+Math.sin(v*2)*2.4)*21+Math.sin(u*47+Math.cos(v*3)*1.2)*13+Math.sin(u*6+Math.sin(v))*17-23*Math.pow(.5+.5*Math.sin(u*23+Math.sin(v*4)*1.1),12)+7*Math.sin(u*83+v*7);
   else if(kind==='cloth')a=Math.sin(u*56)*9+Math.cos(v*53)*9+Math.sin(u*5+v*3)*6;
   else if(kind==='skin')a=Math.sin(u*7+v*3)*3+Math.sin(u*19-v*11)*2;
   else a=Math.sin(u*7+v*4)*10+Math.sin(u*18-v*11)*7+Math.cos(u*33+v*19)*6+Math.sin(u*2-v*3)*12;
   const n=clamp((kind==='skin'?217:185)+a+(rnd()-.5)*(kind==='skin'?12:48),0,255);im.data[i]=n;im.data[i+1]=n;im.data[i+2]=n;im.data[i+3]=255;
  }c.putImageData(im,0,0);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 }
 const maps={bark:texture('bark'),cloth:texture('cloth'),skin:texture('skin'),stone:texture('stone'),earth:texture('earth',512)};
 function material(color,kind,extra={}){const map=maps[kind];return new T.MeshStandardMaterial({color,roughness:kind==='skin'?.7:.93,map,bumpMap:map,bumpScale:kind==='skin'?.012:kind==='bark'?.105:.035,...extra})}
 const cache=new Map();function mat(color,kind){const k=color+':'+kind;if(!cache.has(k))cache.set(k,material(color,kind));return cache.get(k)}
 function object(p,g,m,x=0,y=0,z=0){const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh}
 // A continuous anatomically profiled surface. Ring values: height, width, depth, center depth.
 function form(rings,profile=null,segments=40){
  const verts=[],uv=[],indices=[];
  for(let j=0;j<rings.length;j++){const [y,rx,rz,cz=0]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*TAU,si=Math.sin(a),co=Math.cos(a);let x=si*rx,z=co*rz+cz;if(profile){const p=profile(x,y,z,co,si);x=p[0];z=p[1]}verts.push(x,y,z);uv.push(i/segments,j/(rings.length-1))}}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,b,a+1,b+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 // Catmull-Rom interpolation keeps silhouette and normals continuous.
 function smooth(r){const out=[];for(let i=0;i<r.length-1;i++){const a=r[Math.max(0,i-1)],b=r[i],c=r[i+1],d=r[Math.min(r.length-1,i+2)];for(let k=0;k<4;k++){const t=k/4;out.push(b.map((v,j)=>.5*((2*v)+(-a[j]+c[j])*t+(2*a[j]-5*v+4*c[j]-d[j])*t*t+(-a[j]+3*v-3*c[j]+d[j])*t*t*t)))}}out.push(r.at(-1));return out.map(([y,x,z,c])=>[y,Math.max(.001,x),Math.max(.001,z),c])}
 const ga=(x,y,cx,cy,wx,wy)=>Math.exp(-(((x-cx)/wx)**2)-(((y-cy)/wy)**2));
 function anatomy(ch,eq,root,skin,hair,build){
  const body=new T.Group();root.add(body);const skinMat=material(skin,'skin'),hairMat=material(hair,'bark',{bumpScale:.008}),leather=mat(0x715033,'cloth'),cloth=mat(0x74724d,'cloth'),dark=mat(0x3e2d21,'cloth'),iron=mat(0xb09a66,'stone'),iris=mat([0x614331,0x6c8657,0x7fa9c6,0x989e9e,0xba8a45][ch.eyes]||0x614331,'skin');
  const own=[];function surface(p,r,material,fn=null,n=40){const g=form(smooth(r),fn,n);own.push(g);return object(p,g,material)}
  const torsoR=[[1.03,.20,.15,0],[1.16,.255,.18,0],[1.27,.245,.16,0],[1.40,.265,.167,0],[1.54,.315,.19,0],[1.66,.36,.205,0],[1.73,.35,.17,0],[1.79,.225,.145,0],[1.85,.132,.115,0],[1.96,.115,.105,0],[2.0,.09,.09,0]].map(r=>[r[0],r[1]*build,r[2],r[3]]);
  const torso=surface(body,torsoR,eq.tunic?cloth:skinMat,(x,y,z,co)=>{if(co>.35&&!eq.tunic){const xx=Math.abs(x)/build;z+=.045*ga(xx,y,.145,1.63,.13,.11)-.019*ga(xx,y,0,1.63,.035,.115);for(const yy of [1.33,1.43,1.52])z+=.014*ga(xx,y,.085,yy,.06,.043);z-=.012*ga(xx,y,0,1.42,.025,.18)}if(co<-.4)z-=.027*ga(Math.abs(x),y,.14,1.62,.12,.18);return[x,z]});
  const skirt=surface(body,[[.87,.20,.19,0],[.91,.32*build,.23,0],[1.12,.27*build,.21,0],[1.19,.26*build,.19,0]],leather,(x,y,z,co,si)=>[x,z+.015*Math.sin(Math.atan2(si,co)*8)]);
  const belt=surface(body,[[1.14,.273*build,.21,0],[1.22,.267*build,.205,0]],dark);
  const buckle=object(body,new T.BoxGeometry(.115,.077,.035),iron,0,1.18,.217);own.push(buckle.geometry);
  // A shaped head with recessed eye sockets, projecting nose and continuous jaw.
  const head=new T.Group();head.position.y=2.08;head.scale.x=[1,1.11,.91][ch.face]||1;body.add(head);
  const faceR=[[-.23,.065,.078,.035],[-.195,.105,.105,.025],[-.15,.137,.117,.003],[-.08,.145,.135,.001],[0,.155,.145,0],[.075,.154,.142,-.008],[.14,.149,.134,-.01],[.20,.125,.115,-.01],[.235,.073,.074,-.012],[.248,.002,.002,0]];
  surface(head,faceR,skinMat,(x,y,z,co)=>{if(co>.25){const a=Math.abs(x);z+=.073*ga(x,y,0,-.015,.036,.072)+.028*ga(x,y,0,-.066,.053,.026)+.023*ga(a,y,.098,-.025,.045,.045)-.030*ga(a,y,.070,.049,.042,.034)+.019*ga(a,y,.07,.091,.057,.025)+.026*ga(x,y,0,-.109,.075,.025)+.022*ga(x,y,0,-.181,.068,.036);z-=.008*ga(x,y,0,-.118,.075,.007)}return[x,z]});
  const ell=new T.SphereGeometry(1,24,16);own.push(ell);
  const oval=(p,m,x,y,z,sx,sy,sz)=>{const q=object(p,ell,m,x,y,z);q.scale.set(sx,sy,sz);return q};
  for(const side of [-1,1]){
   oval(head,skinMat,side*.153,-.023,-.003,.025,.056,.035);
   oval(head,mat(0x94684d,'skin'),side*.165,-.024,.009,.009,.032,.018);
   oval(head,mat(0xd9d6c5,'skin'),side*.070,.047,.127,.034,.016,.018);
   oval(head,iris,side*.070,.047,.142,.012,.012,.005);
   oval(head,mat(0x171d1a,'skin'),side*.070,.047,.146,.005,.008,.003);
   const brow=oval(head,hairMat,side*.072,.081,.139,.047,.009,.013);brow.rotation.z=side*.09;
  }
  oval(head,mat(0x825b48,'skin'),0,-.12,.153,.051,.006,.008);
  if(ch.hair){surface(head,[[.075,.159,.149,-.024],[.13,.164,.15,-.024],[.195,.145,.135,-.018],[.245,.105,.095,-.012],[.265,.003,.003,0]],hairMat,(x,y,z,co)=>[x,z+(co<0?.017:0)]);
   if(ch.hair===2)surface(head,[[-.15,.15,.10,-.115],[-.03,.17,.13,-.10],[.13,.163,.13,-.055]],hairMat,(x,y,z,co)=>[x,z-.05*Math.max(0,co)]);
   if(ch.hair===3){oval(head,hairMat,0,.19,-.145,.095,.083,.105);oval(head,hairMat,0,.055,-.205,.057,.135,.065)}
  }
  if(ch.beard){const long=ch.beard===2;surface(head,[[long?-.39:-.245,.018,.035,.105],[-.22,.097,.076,.077],[-.16,.132,.082,.057],[-.09,.145,.072,.036]],hairMat,(x,y,z,co)=>[x,z+.025*Math.max(0,co)]);for(const side of [-1,1])oval(head,hairMat,side*.043,-.091,.163,.043,.014,.014)}
  if(ch.mark){const color=ch.mark===1?0x8e4d3b:ch.mark===2?0x345c74:0x8f3f2f;for(const side of ch.mark===1?[1]:[-1,1]){const m=oval(head,mat(color,'skin'),side*.108,.003,.130,.012,.049,.007);m.rotation.z=side*-.55}}
  const arms=[],legs=[];
  for(const side of [-1,1]){
   const arm=new T.Group();arm.position.set(side*.335*build,1.71,0);body.add(arm);arms.push(arm);
   surface(arm,[[-.72,.051,.045,.023],[-.65,.057,.058,.023],[-.58,.065,.061,.014],[-.49,.087,.082,.016],[-.40,.087,.084,.012],[-.32,.082,.08,0],[-.20,.114*build,.107,0],[-.08,.137*build,.123,0],[.015,.112*build,.104,0],[.075,.015,.018,0]],skinMat,(x,y,z,co)=>[x+side*.035*(1-Math.abs(y)/.72),z+.018*ga(x,y,0,-.22,.08,.1)*Math.max(0,co)]);
   oval(arm,skinMat,-side*.039,-.646,.049,.025,.061,.026);
   const leg=new T.Group();leg.position.set(side*.145*build,1.04,0);body.add(leg);legs.push(leg);
   surface(leg,[[-.96,.067,.09,.045],[-.83,.068,.077,.014],[-.71,.085,.084,-.007],[-.59,.11,.12,-.016],[-.46,.092,.102,.012],[-.35,.111,.118,0],[-.17,.143*build,.148,0],[0,.133*build,.145,0],[.07,.06,.07,0]],eq.boots?dark:skinMat);
   oval(leg,eq.boots?dark:skinMat,0,-.947,.098,.093,.058,.155);
   if(eq.boots)for(let i=0;i<4;i++)surface(leg,[[-.81+i*.09,.095,.10,0],[-.785+i*.09,.095,.10,0]],leather);
  }
  if(eq.wintercoat){surface(body,[[1.26,.30,.235,0],[1.55,.36,.24,0],[1.75,.40,.23,0],[1.84,.22,.13,0]],mat(0x73614c,'bark'))}
  return {body,arms,legs,skinMat,dispose(){for(const g of own)g.dispose();skinMat.dispose();hairMat.dispose()}};
 }
 // Bark and wood with visible grain; branching tree silhouettes and layered foliage.
 // Individual irregular leaves, alpha-cutout on crossed 3D foliage cards.
 const leafCanvas=document.createElement('canvas');leafCanvas.width=leafCanvas.height=256;const lc=leafCanvas.getContext('2d');
 for(let i=0;i<245;i++){const a=rnd()*TAU,d=Math.sqrt(rnd())*111,x=128+Math.cos(a)*d,y=128+Math.sin(a)*d,w=4+rnd()*8,l=10+rnd()*16;lc.save();lc.translate(x,y);lc.rotate(rnd()*TAU);const light=157+Math.floor(rnd()*88);lc.fillStyle='rgb('+light+','+Math.min(255,light+14)+','+Math.max(0,light-20)+')';lc.beginPath();lc.moveTo(0,-l/2);lc.quadraticCurveTo(w,-l*.12,0,l/2);lc.quadraticCurveTo(-w,l*.1,0,-l/2);lc.fill();lc.strokeStyle='rgba(70,85,47,.5)';lc.lineWidth=.65;lc.beginPath();lc.moveTo(0,-l/2);lc.lineTo(0,l/2);lc.stroke();lc.restore()}
 const windClock={value:0},windPower={value:.3};function foliageWind(m,grass=false){m.onBeforeCompile=shader=>{shader.uniforms.ashWindTime=windClock;shader.uniforms.ashWindStrength=windPower;shader.vertexShader='uniform float ashWindTime;uniform float ashWindStrength;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ashPhase=ashWindTime*1.65+instanceMatrix[3].x*.19+instanceMatrix[3].z*.13;float ashBend=position.y*position.y;transformed.x+=sin(ashPhase)*ashBend*(.22+ashWindStrength*.62);transformed.z+=cos(ashPhase*.73)*ashBend*.22;\n#else\nfloat ashPhase=ashWindTime*1.3+modelMatrix[3].x*.13+modelMatrix[3].z*.14;transformed.x+=sin(ashPhase+position.y)*(.012+ashWindStrength*.060);transformed.z+=cos(ashPhase*.73+position.x)*.028;\n#endif`)};m.customProgramCacheKey=()=>grass?'ash-grass-wind-30':'ash-leaf-wind-30';return m}
 const leafTex=new T.CanvasTexture(leafCanvas);leafTex.colorSpace=T.SRGBColorSpace;const leafMats=new Map(),leafShapes=[];
 const needleCanvas=document.createElement('canvas');needleCanvas.width=needleCanvas.height=256;const nc=needleCanvas.getContext('2d');for(let j=0;j<17;j++){const a=j*2.399963,r=20+(j%5)*16,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r;nc.save();nc.translate(x,y);nc.rotate(a+Math.PI/2);nc.strokeStyle='#8f9377';nc.lineWidth=2;nc.beginPath();nc.moveTo(0,-40);nc.lineTo(0,42);nc.stroke();for(let k=0;k<22;k++){const yy=-40+k*3.8,len=8+Math.sin(k/22*Math.PI)*20;for(const side of [-1,1]){nc.strokeStyle=['#bec7a6','#899778','#d0d2b4'][(j+k)%3];nc.lineWidth=1.6;nc.beginPath();nc.moveTo(0,yy);nc.lineTo(side*len,yy-8-(k%3));nc.stroke()}}nc.restore()}const needleTex=new T.CanvasTexture(needleCanvas);needleTex.colorSpace=T.SRGBColorSpace;
 function leafMat(c,needle=false){const key=c+':'+needle;if(!leafMats.has(key))leafMats.set(key,foliageWind(new T.MeshStandardMaterial({color:c,map:needle?needleTex:leafTex,alphaTest:needle?.31:.43,side:T.DoubleSide,roughness:.96,emissive:c,emissiveIntensity:.075})));return leafMats.get(key)}
 for(let k=0;k<5;k++){const pos=[],uv=[],ind=[];for(let i=0;i<22;i++){const a=i*2.399963+k,b=(i%7-3)/3,rad=.28+((i*17)%13)/20,x=Math.cos(a)*rad,z=Math.sin(a)*rad,y=b*.58,w=.48+((i*7)%5)*.11,hh=.46+(i%4)*.13;const u=new T.Vector3(Math.cos(a),.16*Math.sin(a),Math.sin(a)).normalize(),v=new T.Vector3(-.30*Math.sin(a),.87,.3*Math.cos(a)).normalize();const start=pos.length/3;for(const [s,t] of [[-1,-1],[1,-1],[1,1],[-1,1]])pos.push(x+s*u.x*w+t*v.x*hh,y+s*u.y*w+t*v.y*hh,z+s*u.z*w+t*v.z*hh);uv.push(0,0,1,0,1,1,0,1);ind.push(start,start+1,start+2,start,start+2,start+3)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();leafShapes.push(g)}
 function leaves(p,c,idx,x,y,z,sx,sy,sz,needle=false){const m=object(p,leafShapes[idx%leafShapes.length],leafMat(c,needle),x,y,z);m.scale.set(sx,sy,sz);return m}
 const trunkGeo=new T.CylinderGeometry(.64,1,1,9,4),leafGeo=new T.IcosahedronGeometry(1,2),pineGeo=new T.ConeGeometry(1,1,11,2);
 function tree(g,bi,bio,kind,seedId){
  const r=n=>{const v=Math.sin(seedId*17.91+n*78.233)*43758.5453;return v-Math.floor(v)},bark=mat(bi===2?0x94734e:0x6d5943,'bark'),size=kind==='oak'?1.25:1;
  function limb(a,b,radius){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A);const m=object(g,trunkGeo,bark);m.position.copy(A.clone().add(B).multiplyScalar(.5));m.scale.set(radius,d.length(),radius);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
  const height=(4.8+r(1)*2.5)*size*(bi===1?1.40:bi===3?1.12:1);
  const lean=bi===4?.55:.19;limb([0,-.16,0],[lean*.5,height*.63,-.08],.32*size);limb([lean*.5,height*.55,-.08],[lean,height,0],.17*size);for(let i=0;i<4;i++){const a=i*TAU/4+r(60+i)*.55;limb([0,.55,0],[Math.sin(a)*(.70+r(72+i)*.30)*size,-.09,Math.cos(a)*(.70+r(72+i)*.30)*size],.13*size)}
  const rare=bi===1&&r(42)>.84,foliage=bi===0||kind==='oak'||bi===4||rare;const canopy=rare?[0x4e627d,0x7875aa,0xa699c6]:bi===0&&r(42)>.76?[0x9f633b,0xc49048,0xe3b85d]:bi===4&&r(42)>.74?[0x3f7268,0x51978a,0x78b5a5]:bio.tree;
  if(bi===2){for(let i=0;i<8;i++){const a=i*TAU/8;const x=Math.cos(a)*1.45,z=Math.sin(a)*1.45;limb([.19,height,0],[x,height-.45,z],.055);const m=object(g,leafGeo,mat(bio.tree[i%3],'earth'),x*.78,height-.25,z*.78);m.scale.set(.25,.12,1.15);m.rotation.y=-a+Math.PI/2}}
  else if(foliage){for(let i=0;i<7;i++){const a=i*TAU/7+r(i+5)*.7,x=Math.sin(a)*(1+r(i+20))*.85*size,z=Math.cos(a)*(1+r(i+21))*.85*size,y=height*(.66+r(i+30)*.30);limb([0,height*.42,0],[x,y,z],.10*size);const m=leaves(g,canopy[i%3],i,x,y,z,1.67*size,1.16*size,1.61*size);m.rotation.y=a}leaves(g,canopy[2],3,.12,height,.1,1.72*size,1.36*size,1.70*size)}
  else {for(let i=0;i<6;i++){const f=i/6,y=height*(.42+f*.57),m=leaves(g,canopy[i%3],i,Math.sin(i*2)*.12,y,Math.cos(i*2)*.13,(2.27-f*1.75)*size,1.12-f*.52,(2.05-f*1.58)*size,true);m.rotation.y=r(i+12)*TAU}}
  return height;
 }
 const noiseGLSL=`float ashHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float ashNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(ashHash(i),ashHash(i+vec2(1.,0.)),f.x),mix(ashHash(i+vec2(0.,1.)),ashHash(i+vec2(1.,1.)),f.x),f.y);}`;
 function groundMaterial(){const m=material(0xffffff,'earth',{vertexColors:true,bumpScale:.18,flatShading:false});m.map=maps.earth.clone();m.map.repeat.set(245,245);m.map.needsUpdate=true;m.bumpMap=m.map;m.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 ashWorld;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nashWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader='varying vec3 ashWorld;\n'+noiseGLSL+'\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nvec2 ashP=ashWorld.xz;float ashBroad=ashNoise(ashP*.13)*.7+ashNoise(ashP*.46)*.3;float ashGrit=ashNoise(ashP*12.0);float ashStones=smoothstep(.71,.89,ashNoise(ashP*2.8));float ashSoil=smoothstep(.36,.59,ashBroad);diffuseColor.rgb*=mix(.72,1.22,ashBroad)*mix(.86,1.10,ashGrit);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.79,.68,.53),ashSoil*.28);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.23,.19),ashStones*.22);');};return m}
 // Local terrain detail is instanced and re-centered in small chunks, not thousands of draw calls.
 function meadow(scene,height,dry,biomeIndex,BIOMES,blocked=()=>false){
  // Bounded instanced meadow: fine continuous curved blades, root-to-tip shading.
  const n=coarse?6000:24000,flowerN=coarse?65:160;let quality=coarse?'medium':'high';
  const blade=new T.BufferGeometry(),pos=[],cols=[],indices=[];
  for(let j=0;j<4;j++){
   const a=j*2.39996,cs=Math.cos(a),sn=Math.sin(a),h=.36+(j%3)*.11,offset=(j-2)*.035,start=pos.length/3;
   for(let k=0;k<=3;k++){const t=k/3,w=.029*(1-t)*(.75+(j%2)*.25)+.001,bend=.14*t*t,light=.46+.54*t;
    for(const side of [-1,1]){const xx=side*w,zz=bend;pos.push(xx*cs-zz*sn+offset,t*h,xx*sn+zz*cs);cols.push(light,light,light*.88)}
   }
   for(let k=0;k<3;k++){const q=start+k*2;indices.push(q,q+1,q+2,q+2,q+1,q+3)}
  }
  blade.setAttribute('position',new T.Float32BufferAttribute(pos,3));blade.setAttribute('color',new T.Float32BufferAttribute(cols,3));blade.setIndex(indices);blade.computeVertexNormals();
  const grassMat=foliageWind(new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,side:T.DoubleSide,roughness:1,emissive:0x2f481e,emissiveIntensity:.12}),true);
  const flowerGeo=new T.BufferGeometry(),flowerVerts=[];for(let j=0;j<5;j++){const a=j*TAU/5,cs=Math.cos(a),sn=Math.sin(a);for(const [x,y,z] of [[0,0,0],[.48,.15,.45],[1.2,.25,0],[0,0,0],[1.2,.25,0],[.48,.15,-.45]])flowerVerts.push(x*cs-z*sn,y,x*sn+z*cs)}flowerGeo.setAttribute('position',new T.Float32BufferAttribute(flowerVerts,3));flowerGeo.computeVertexNormals();const grass=new T.InstancedMesh(blade,grassMat,n),petals=new T.InstancedMesh(flowerGeo,new T.MeshStandardMaterial({color:0xffffff,roughness:.86,side:T.DoubleSide}),flowerN);grass.frustumCulled=petals.frustumCulled=false;grass.receiveShadow=true;scene.add(grass,petals);const dummy=new T.Object3D(),grassColors=[[0x43852f,0x71a53b,0x93b84c],[0x306c36,0x478a3f,0x659b47],[0x8e923e,0xb5a44d,0xc3ad62],[0x769a90,0x8eb1a0,0xacc7b8],[0x39763c,0x53894a,0x7b9b42]].map(a=>a.map(c=>new T.Color(c))),grassTips=[0xc3d77a,0xa4c86a,0xd6ba76,0xc4dad3,0xb6c76b].map(c=>new T.Color(c));const grassTint=new T.Color();let cx=Infinity,cz=Infinity;
  function update(x,z,t){windClock.value=t;const qx=Math.floor(x/12),qz=Math.floor(z/12);if(qx===cx&&qz===cz)return;cx=qx;cz=qz;let i=0,j=0;
   // Deterministic 12-unit patches: grass never reshuffles when the player crosses a chunk.
   const tiles=[];const radius=quality==='low'?2:3,cap=Math.min(n,quality==='low'?3800:quality==='medium'?10500:24000);for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dz*dz<=radius*radius+1)tiles.push([dx,dz]);
   tiles.sort((a,b)=>a[0]*a[0]+a[1]*a[1]-b[0]*b[0]-b[1]*b[1]);const samples=coarse?(quality==='low'?180:quality==='medium'?245:300):quality==='low'?240:quality==='medium'?420:900;
   for(const [dx,dz] of tiles){const gx=qx+dx,gz=qz+dz;let st=((gx*739391+gz*19349663)^813)>>>0;const r=()=>{st=(Math.imul(st,1664525)+1013904223)>>>0;return st/4294967296};
    for(let k=0;k<samples&&i<cap;k++){const xx=(gx+r())*12,zz=(gz+r())*12,bi=biomeIndex(xx,zz),chance=r(),sz=.61+r()*.76,rot=r()*TAU,sy=.7+r()*.6,tint=r(),flower=r();const patch=.5+.25*Math.sin(xx*.21+Math.cos(zz*.14)*2)+.25*Math.sin(zz*.19-xx*.06);if(!dry(xx,zz)||blocked(xx,zz)||chance<.10*(1-patch)||bi===2&&chance<.985||bi===3&&chance<.94||bi===1&&chance<.10||bi===4&&chance<.25)continue;const yy=height(xx,zz);dummy.position.set(xx,yy-.04,zz);dummy.rotation.set(0,rot,0);dummy.scale.set(sz*(.78+patch*.32),sz*sy*(.60+patch*.80),sz*(.78+patch*.32));dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,grassTint.copy(grassColors[bi][k%3]).lerp(grassTips[bi],tint*.42));i++;if(j<flowerN&&(bi===0||bi===1||bi===4)&&flower<.009&&patch>.62){dummy.position.y=yy+.12;dummy.scale.set(.11,.12,.11);dummy.updateMatrix();petals.setMatrixAt(j,dummy.matrix);petals.setColorAt(j,new T.Color([0xdcc58a,0xc2a4d0,0xf2e7be,0xcda15e][k%4]));j++}}
   }
   grass.count=i;petals.count=j;grass.instanceMatrix.needsUpdate=petals.instanceMatrix.needsUpdate=true;if(grass.instanceColor)grass.instanceColor.needsUpdate=true;if(petals.instanceColor)petals.instanceColor.needsUpdate=true;
  }return{update,setQuality(q){if(q!==quality){quality=q;cx=cz=Infinity}},invalidate(){cx=cz=Infinity}}
 }
 function sky(scene){const uniforms={day:{value:1},storm:{value:0},sunDir:{value:new T.Vector3(-.7,.4,.2)},clock:{value:0},aurora:{value:0}};const m=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec3 vDir;uniform float day;uniform float storm;uniform vec3 sunDir;uniform float clock;uniform float aurora;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){vec3 d=normalize(vDir);float h=max(0.,d.y);vec3 night=mix(vec3(.16,.23,.34),vec3(.025,.035,.105),h);vec3 light=mix(vec3(.79,.86,.77),vec3(.16,.43,.77),pow(h,.55));vec3 col=mix(night,light,day);float dusk=pow(max(0.,1.-abs(sunDir.y)*3.4),2.)*day;col=mix(col,vec3(.82,.39,.27),dusk*pow(1.-h,4.)*.45);col=mix(col,vec3(.33,.40,.43)*(.35+.65*day),storm*.65);float glow=max(0.,dot(d,normalize(sunDir)));col+=vec3(1.,.54,.20)*pow(glow,24.)*.58*day*(1.-storm*.8)+vec3(1.,.82,.54)*pow(glow,1500.)*2.*day*(1.-storm*.9);vec2 uv=d.xz/(.24+h)*3.+vec2(clock*.003,0.);float cl=noise(uv)*.62+noise(uv*2.3)*.25+noise(uv*5.)*.13;col=mix(col,mix(vec3(.91,.88,.76),vec3(.40,.45,.47),storm),smoothstep(.56-storm*.22,.77-storm*.12,cl)*smoothstep(.01,.18,h)*(.65+storm*.30)*day);float star=step(.9985,hash(floor(d.xz/(.10+h)*390.)))*smoothstep(.04,.4,h);col+=vec3(.7,.85,1.)*star*(1.-day)*(1.-storm)*.95;
 float dark=(1.-smoothstep(.08,.35,day))*(1.-storm*.92);
 vec3 moonDir=normalize(vec3(.42,.58,-.70));float md=max(0.,dot(d,moonDir));float moon=smoothstep(.9988,.9992,md);col+=dark*(vec3(.42,.62,1.)*pow(md,85.)*.18+vec3(.87,.93,1.)*moon*.95);
 // Thin, slowly shifting aurora ribbons, integrated in the existing sky shader.
 if(aurora>.01&&dark>.01&&h>.05){float az=atan(d.z,d.x),bend=.35+.10*sin(az*2.7+clock*.032)+.045*sin(az*5.1-clock*.025);float a=(h-bend)/.065,b=(h-bend-.13)/.095;float ribbon=exp(-a*a),ribbon2=exp(-b*b);float folds=.48+.52*pow(.5+.5*sin(az*24.+sin(az*5.)*3.+clock*.08),2.);float gate=smoothstep(-.65,.15,d.z)*smoothstep(.05,.22,h);col+=aurora*dark*gate*folds*(vec3(.12,.76,.53)*ribbon*.64+vec3(.47,.22,.90)*ribbon2*.31);}
 gl_FragColor=vec4(col,1.);}
 `});const sky=new T.Mesh(new T.SphereGeometry(360,32,20),m);sky.frustumCulled=false;sky.renderOrder=-100;scene.add(sky);return{update(pos,day,dir,t,storm=0,bi=0,quality='high'){uniforms.aurora.value=quality==='low'?0:[.25,.68,.08,1,.43][bi];uniforms.storm.value=storm;sky.position.copy(pos);uniforms.day.value=day;uniforms.sunDir.value.copy(dir);uniforms.clock.value=t}}
 }
 function water(m){const clock={value:0};m.onBeforeCompile=shader=>{shader.uniforms.ashWaterTime=clock;shader.vertexShader='varying vec2 ashWaterPos;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nashWaterPos=position.xy;');shader.fragmentShader='varying vec2 ashWaterPos;uniform float ashWaterTime;\n'+noiseGLSL+'\n'+shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat ashR=length(ashWaterPos);float ashWave=(sin(ashWaterPos.x*2.3+ashWaterPos.y*1.6+ashWaterTime*1.2)*.5+sin(ashWaterPos.y*4.6-ashWaterPos.x*1.4+ashWaterTime*.85)*.25+sin(ashWaterPos.x*.8+ashWaterTime*.6)*.25)*.5+.5;float ashFoam=smoothstep(18.4,19.7,ashR+ashNoise(ashWaterPos*.8)*.6)*smoothstep(.45,.85,ashWave);diffuseColor.rgb=mix(diffuseColor.rgb*mix(.8,1.25,ashWave),vec3(.63,.85,.79),ashFoam*.65);float ashGlint=pow(max(0.,sin(ashWaterPos.x*3.4+ashWaterPos.y*4.1+ashWaterTime*1.7)*sin(ashWaterPos.y*2.3-ashWaterTime*.8)),12.);diffuseColor.rgb+=vec3(.13,.25,.24)*ashGlint;').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+vec3(.073*sin(ashWaterPos.x*3.1+ashWaterTime)+.025*cos(ashWaterPos.y*5.7-ashWaterTime*1.4),.065*cos(ashWaterPos.y*2.7-ashWaterTime*.8),0.));');};return t=>{clock.value=t}}
 function effects(scene){const max=180,geo=new T.IcosahedronGeometry(1,0),m=new T.MeshStandardMaterial({color:0xffffff,roughness:.8}),inst=new T.InstancedMesh(geo,m,max),dummy=new T.Object3D(),particles=[];inst.frustumCulled=false;inst.count=0;scene.add(inst);function burst(x,y,z,color,n=14){for(let i=0;i<n;i++){const a=rnd()*TAU,v=.6+rnd()*2.3;particles.push({x,y:y+rnd()*.3,z,vx:Math.cos(a)*v,vy:1+rnd()*2.4,vz:Math.sin(a)*v,t:.55+rnd()*.7,c:color,size:.035+rnd()*.08})}if(particles.length>max)particles.splice(0,particles.length-max)}function update(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.t-=dt;if(p.t<=0){particles.splice(i,1);continue}p.vy-=7*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt}for(let i=0;i<particles.length;i++){const p=particles[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.x*2,p.z*3,p.t*4);dummy.scale.setScalar(p.size*Math.min(1,p.t*3));dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);inst.setColorAt(i,new T.Color(p.c))}inst.count=particles.length;inst.instanceMatrix.needsUpdate=true;if(inst.instanceColor)inst.instanceColor.needsUpdate=true}return{burst,update,root:inst}}
 return {material,mat,anatomy,tree,groundMaterial,meadow,sky,water,effects,setWind(t,w){windClock.value=t;windPower.value=w}};
}
