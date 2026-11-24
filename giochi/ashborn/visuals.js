// Real-time procedural art assets. No image mockups or external textures.
export function createVisuals(T,renderer,coarse){
 let seed=813;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const TAU=Math.PI*2,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function texture(kind,size=256){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),im=c.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,u=x/size*TAU,v=y/size*TAU;let a=0;
   if(kind==='bark')a=Math.sin(u*19+Math.sin(v*2)*1.8)*19+Math.sin(u*47+Math.cos(v*3)*.9)*9+Math.sin(u*6+Math.sin(v))*17;
   else if(kind==='cloth')a=Math.sin(u*56)*9+Math.cos(v*53)*9+Math.sin(u*5+v*3)*6;
   else if(kind==='skin')a=Math.sin(u*7+v*3)*3+Math.sin(u*19-v*11)*2;
   else a=Math.sin(u*7+v*4)*10+Math.sin(u*18-v*11)*7+Math.cos(u*33+v*19)*6+Math.sin(u*2-v*3)*12;
   const n=clamp((kind==='skin'?217:185)+a+(rnd()-.5)*(kind==='skin'?12:48),0,255);im.data[i]=n;im.data[i+1]=n;im.data[i+2]=n;im.data[i+3]=255;
  }c.putImageData(im,0,0);const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 }
 const maps={bark:texture('bark'),cloth:texture('cloth'),skin:texture('skin'),stone:texture('stone'),earth:texture('earth',512)};
 function material(color,kind,extra={}){const map=maps[kind];return new T.MeshStandardMaterial({color,roughness:kind==='skin'?.7:.93,map,bumpMap:map,bumpScale:kind==='skin'?.012:kind==='bark'?.075:.035,...extra})}
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
 const trunkGeo=new T.CylinderGeometry(.64,1,1,9,4),leafGeo=new T.IcosahedronGeometry(1,2),pineGeo=new T.ConeGeometry(1,1,11,2);
 function tree(g,bi,bio,kind,seedId){
  const r=n=>{const v=Math.sin(seedId*17.91+n*78.233)*43758.5453;return v-Math.floor(v)},bark=mat(bi===2?0x94734e:0x6d5943,'bark'),size=kind==='oak'?1.25:1;
  function limb(a,b,radius){const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A);const m=object(g,trunkGeo,bark);m.position.copy(A.clone().add(B).multiplyScalar(.5));m.scale.set(radius,d.length(),radius);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
  const height=(4.6+r(1)*1.4)*size;
  limb([0,-.16,0],[.10,height*.63,-.08],.32*size);limb([.1,height*.55,-.08],[.19,height,0],.17*size);
  const foliage=bi===0||kind==='oak'||bi===4;
  if(bi===2){for(let i=0;i<8;i++){const a=i*TAU/8;const x=Math.cos(a)*1.45,z=Math.sin(a)*1.45;limb([.19,height,0],[x,height-.45,z],.055);const m=object(g,leafGeo,mat(bio.tree[i%3],'earth'),x*.78,height-.25,z*.78);m.scale.set(.25,.12,1.15);m.rotation.y=-a+Math.PI/2}}
  else if(foliage){for(let i=0;i<7;i++){const a=i*TAU/7+r(i+5)*.7,x=Math.sin(a)*(1+r(i+20))*.85*size,z=Math.cos(a)*(1+r(i+21))*.85*size,y=height*(.66+r(i+30)*.30);limb([0,height*.42,0],[x,y,z],.10*size);const m=object(g,leafGeo,mat(bio.tree[i%3],'earth'),x,y,z);m.scale.set(1.05*size,.82*size,1.15*size);m.rotation.y=a}const m=object(g,leafGeo,mat(bio.tree[2],'earth'),.12,height,.1);m.scale.set(1.23*size,1.05*size,1.18*size)}
  else {for(let i=0;i<6;i++){const f=i/6,y=height*(.42+f*.57),m=object(g,pineGeo,mat(bio.tree[i%3],'earth'),Math.sin(i*2)*.12,y,Math.cos(i*2)*.13);m.scale.set((1.9-f*1.45)*size,2.0-f*.85,(1.75-f*1.35)*size);m.rotation.y=r(i+12)*TAU}}
  return height;
 }
 function groundMaterial(){const m=material(0xffffff,'earth',{vertexColors:true,bumpScale:.32,flatShading:false});m.map=maps.earth.clone();m.map.repeat.set(245,245);m.map.needsUpdate=true;m.bumpMap=m.map;return m}
 // Local terrain detail is instanced and re-centered in small chunks, not thousands of draw calls.
 function meadow(scene,height,dry,biomeIndex,BIOMES){
  const n=coarse?2200:9000,flowerN=coarse?220:850,positions=[],flowerPositions=[];
  const blade=new T.BufferGeometry();blade.setAttribute('position',new T.Float32BufferAttribute([-.04,0,0,.04,0,0,.015,.28,.065,-.04,0,0,.015,.28,.065,-.017,.48,.14],3));blade.computeVertexNormals();
  const grassMat=new T.MeshStandardMaterial({color:0xffffff,side:T.DoubleSide,roughness:1});const time={value:0};
  grassMat.onBeforeCompile=shader=>{shader.uniforms.ashTime=time;shader.vertexShader='uniform float ashTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\ntransformed.x += sin(ashTime*1.7+instanceMatrix[3].x*.25+instanceMatrix[3].z*.13)*position.y*position.y*.33;\n#endif')};
  const grass=new T.InstancedMesh(blade,grassMat,n),petals=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),new T.MeshStandardMaterial({color:0xffffff,roughness:.86}),flowerN);grass.frustumCulled=petals.frustumCulled=false;grass.receiveShadow=true;scene.add(grass,petals);const dummy=new T.Object3D();let cx=Infinity,cz=Infinity;
  function update(x,z,t){time.value=t;const qx=Math.floor(x/12)*12,qz=Math.floor(z/12)*12;if(qx===cx&&qz===cz)return;cx=qx;cz=qz;let i=0,j=0;let st=((qx*739391+qz*19349663)^813)>>>0;const r=()=>{st=(Math.imul(st,1664525)+1013904223)>>>0;return st/4294967296};
   for(let k=0;k<n*2&&i<n;k++){const a=r()*TAU,d=Math.sqrt(r())*34,xx=qx+Math.sin(a)*d,zz=qz+Math.cos(a)*d;if(!dry(xx,zz))continue;const bi=biomeIndex(xx,zz);if(bi===2&&r()<.88||bi===3&&r()<.77)continue;const yy=height(xx,zz),sz=.45+r()*.95;dummy.position.set(xx,yy-.04,zz);dummy.rotation.set(0,r()*TAU,0);dummy.scale.set(sz,sz*(.7+r()*.6),sz);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new T.Color(BIOMES[bi].tree[i%3]).lerp(new T.Color(0xb1b36a),r()*.38));i++;if(j<flowerN&&(bi===0||bi===1||bi===4)&&r()<.09){dummy.position.y=yy+.32;dummy.scale.set(.067,.10,.067);dummy.updateMatrix();petals.setMatrixAt(j,dummy.matrix);petals.setColorAt(j,new T.Color([0xdcc58a,0xc2a4d0,0xf2e7be,0xcda15e][j%4]));j++}}
   grass.count=i;petals.count=j;grass.instanceMatrix.needsUpdate=petals.instanceMatrix.needsUpdate=true;if(grass.instanceColor)grass.instanceColor.needsUpdate=true;if(petals.instanceColor)petals.instanceColor.needsUpdate=true;
  }return{update}
 }
 function sky(scene){const uniforms={day:{value:1},sunDir:{value:new T.Vector3(-.7,.4,.2)},clock:{value:0}};const m=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms,vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec3 vDir;uniform float day;uniform vec3 sunDir;uniform float clock;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
 void main(){vec3 d=normalize(vDir);float h=max(0.,d.y);vec3 night=mix(vec3(.10,.13,.20),vec3(.015,.025,.07),h);vec3 light=mix(vec3(.75,.76,.66),vec3(.22,.43,.65),pow(h,.55));vec3 col=mix(night,light,day);float glow=max(0.,dot(d,normalize(sunDir)));col+=vec3(1.,.54,.20)*pow(glow,24.)*.42*day+vec3(1.,.82,.54)*pow(glow,1500.)*2.*day;vec2 uv=d.xz/(.24+h)*3.+vec2(clock*.003,0.);float cl=noise(uv)*.62+noise(uv*2.3)*.25+noise(uv*5.)*.13;col=mix(col,vec3(.91,.88,.76),smoothstep(.56,.77,cl)*smoothstep(.01,.18,h)*.7*day);gl_FragColor=vec4(col,1.);}
 `});const sky=new T.Mesh(new T.SphereGeometry(360,32,20),m);sky.frustumCulled=false;sky.renderOrder=-100;scene.add(sky);return{update(pos,day,dir,t){sky.position.copy(pos);uniforms.day.value=day;uniforms.sunDir.value.copy(dir);uniforms.clock.value=t}}
 }
 return {material,mat,anatomy,tree,groundMaterial,meadow,sky};
}
