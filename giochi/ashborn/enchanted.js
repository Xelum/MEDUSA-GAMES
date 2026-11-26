// Enchanted wilds: deterministic, streamed, non-interactive scenery.
// Six instanced batches, one point-sprite batch; no extra lights or shadow maps.
const TAU=Math.PI*2;
const rand=(x,z,i)=>{let v=Math.imul(x,73856093)^Math.imul(z,19349663)^Math.imul(i+1,83492791);v=Math.imul(v^(v>>>16),0x45d9f3b);return ((v^(v>>>16))>>>0)/4294967296};
export function createEnchantedWilds(T,scene,height,dry,biome,blocked,coarse){
 const root=new T.Group();scene.add(root);const dummy=new T.Object3D(),color=new T.Color();
 const cap=coarse?180:420;
 function batch(geo,emissive=false){const mat=new T.MeshStandardMaterial({color:0xffffff,roughness:emissive?.64:.94,flatShading:true,emissive:emissive?0x315e58:0x000000,emissiveIntensity:emissive?.33:0});const o=new T.InstancedMesh(geo,mat,cap);o.count=0;o.frustumCulled=false;o.castShadow=false;o.receiveShadow=true;root.add(o);return {o,n:0}}
 const stem=batch(new T.CylinderGeometry(.65,1,1,5)),capMesh=batch(new T.SphereGeometry(1,8,5,0,TAU,0,Math.PI/2),true),crystal=batch(new T.OctahedronGeometry(1,0),true),petal=batch(new T.IcosahedronGeometry(1,0)),leaf=batch(new T.SphereGeometry(1,5,3)),stone=batch(new T.DodecahedronGeometry(1,0));
 const batches=[stem,capMesh,crystal,petal,leaf,stone];
 const positions=new Float32Array(cap*3),colors=new Float32Array(cap*3),sizes=new Float32Array(cap),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('tint',new T.BufferAttribute(colors,3));geo.setAttribute('radius',new T.BufferAttribute(sizes,1));geo.setDrawRange(0,0);
 const uniforms={night:{value:0},time:{value:0},pixelScale:{value:400}};
 const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,toneMapped:false,vertexShader:`attribute vec3 tint;attribute float radius;uniform float pixelScale;varying vec3 vTint;varying float vPhase;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(radius*pixelScale/max(1.,-p.z),2.,52.);vTint=tint;vPhase=position.x*.31+position.z*.47;}`,fragmentShader:`varying vec3 vTint;varying float vPhase;uniform float night;uniform float time;void main(){float r=length(gl_PointCoord-.5)*2.;float fade=1.-smoothstep(.70,1.,r);float glow=exp(-r*r*5.)*.45+exp(-r*r*36.)*.55;gl_FragColor=vec4(vTint,glow*fade*(.10+.55*night)*(.78+.22*sin(time*1.4+vPhase)));}`});
 const glow=new T.Points(geo,material);glow.frustumCulled=false;root.add(glow);
 let gx=Infinity,gz=Infinity,quality=coarse?'medium':'high',glows=0;
 function put(b,x,y,z,sx,sy,sz,rot,c,tilt=0){if(b.n>=cap)return;dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,rot,tilt);dummy.updateMatrix();b.o.setMatrixAt(b.n,dummy.matrix);b.o.setColorAt(b.n,color.set(c));b.n++}
 function light(x,y,z,c,r){if(glows>=cap)return;const i=glows++*3;positions[i]=x;positions[i+1]=y;positions[i+2]=z;color.set(c);colors[i]=color.r;colors[i+1]=color.g;colors[i+2]=color.b;sizes[i/3]=r}
 function invalidate(){gx=gz=Infinity}
 function rebuild(x,z){gx=Math.floor(x/12);gz=Math.floor(z/12);for(const b of batches)b.n=0;glows=0;
 const radius=quality==='low'?1:quality==='medium'?2:3,attempts=quality==='high'&&!coarse?5:3;
 for(let j=-radius;j<=radius;j++)for(let i=-radius;i<=radius;i++){if(i*i+j*j>radius*radius+1)continue;const a=gx+i,b=gz+j;
 for(let k=0;k<attempts;k++){const R=n=>rand(a,b,k*37+n),xx=(a+.12+.76*R(0))*12,zz=(b+.12+.76*R(1))*12;if(Math.abs(xx)>475||Math.abs(zz)>475||!dry(xx,zz)||blocked(xx,zz))continue;const y=height(xx,zz),slope=Math.abs(height(xx+.45,zz)-y)+Math.abs(height(xx,zz+.45)-y);if(slope>.55)continue;const bi=biome(xx,zz),rot=R(2)*TAU,v=R(3),sz=.7+R(4)*.6;
 if((bi===1||bi===4)&&v<.55){const c=bi===1?(R(5)>.45?0x56dfd5:0xa995f2):0x9cdf75;for(let t=0;t<3;t++){const dx=Math.sin(rot+t*2.4)*.32,dz=Math.cos(rot+t*2.4)*.32,h=(.16+R(6+t)*.22)*sz;put(stem,xx+dx,y+h/2,zz+dz,.045,h,.045,rot,0xd0c9ab);put(capMesh,xx+dx,y+h,zz+dz,h*.64,h*.37,h*.64,rot,c);light(xx+dx,y+h+.055,zz+dz,c,.6*sz)}}
 else if((bi===3||bi===2||bi===1)&&v<.73){const c=bi===3?0x8edbff:bi===2?0xe8a86b:0xa39be8;for(let t=0;t<3;t++){const h=(.22+R(9+t)*.37)*sz;put(crystal,xx+Math.sin(rot+t*2)*.22,y+h*.42,zz+Math.cos(rot+t*2)*.22,h*.27,h*.66,h*.27,rot+t,c,(t-1)*.24)}put(stone,xx,y+.08,zz,.40,.14,.36,rot,bi===3?0x788e9b:0x756954);light(xx,y+.25,zz,c,.85)}
 else if(bi===0||bi===1){const c=R(8)>.5?0xffcf72:0xd5a4f6;for(let t=0;t<3;t++){const dx=Math.sin(rot+t*2.4)*.25,dz=Math.cos(rot+t*2.4)*.25,h=.22+R(11+t)*.15;put(stem,xx+dx,y+h/2,zz+dz,.023,h,.023,rot,0x527b38);for(let f=0;f<5;f++){const ang=f*TAU/5;put(petal,xx+dx+Math.cos(ang)*.065,y+h,zz+dz+Math.sin(ang)*.065,.065,.035,.065,ang,c)}}}
 else{const c=bi===4?0x739c56:bi===2?0xb2ad61:0x8db6ab;for(let t=0;t<5;t++){const a=rot+t*TAU/5;put(leaf,xx+Math.sin(a)*.15,y+.12+R(14+t)*.12,zz+Math.cos(a)*.15,.095,.25*sz,.065,a,c,.65)}}
 }}
 for(const b of batches){b.o.count=b.n;b.o.instanceMatrix.needsUpdate=true;if(b.o.instanceColor)b.o.instanceColor.needsUpdate=true}geo.setDrawRange(0,glows);for(const key of ['position','tint','radius'])geo.attributes[key].needsUpdate=true;
 }
 return {root,invalidate,update({x,z,t,day,pixelScale,quality:q='high'}){if(q!==quality){quality=q;invalidate()}root.visible=true;if(Math.floor(x/12)!==gx||Math.floor(z/12)!==gz)rebuild(x,z);uniforms.night.value=1-day;uniforms.time.value=t;uniforms.pixelScale.value=pixelScale;glow.visible=glows>0&&quality!=='low'},hide(){root.visible=false},stats(){return {instances:batches.map(b=>b.n),glows,cap}}};
}
