import {HUMAN_DATA as D} from './human-data.js?v=7';
import {GARMENT as G} from './garment-data.js?v=8';
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const decode=s=>{const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',out=new Uint8Array(Math.floor(s.length*3/4)-(s.endsWith('==')?2:s.endsWith('=')?1:0));let j=0;for(let i=0;i<s.length;i+=4){const n=(abc.indexOf(s[i])<<18)|(abc.indexOf(s[i+1])<<12)|((abc.indexOf(s[i+2])&63)<<6)|(abc.indexOf(s[i+3])&63);out[j++]=n>>16&255;if(j<out.length)out[j++]=n>>8&255;if(j<out.length)out[j++]=n&255}return out};
const p16=s=>new Int16Array(decode(s).buffer),base=p16(D.p),morph=p16(D.m),uvRaw=p16(D.uv),tri=new Uint16Array(decode(D.i).buffer),bi=decode(D.bi),bw=decode(D.bw);
const scale=2.30/(9.3003+8.181),floor=-8.181;
export const characterInfo={vertices:D.count,triangles:tri.length/3,bones:D.bones.length};
export function createCharacter(T,visuals,ch,eq,root,skin,hair){
 const body=new T.Group();root.add(body);const ownG=[],ownM=[],V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Q=()=>new T.Quaternion(),qx=a=>Q().setFromAxisAngle(V(1,0,0),a);
 const muscle=[.12,.57,.96][ch.build]??.57,faceScale=[1,1.08,.92][ch.face]??1,style=ch.outfit??0;
 function source(x,y,z){if(y>7.1){const a=clamp((y-7.1)/.65,0,1);x*=1+(faceScale-1)*a}return V(x*scale,(y-floor)*scale,z*scale)}
 const points=[],raw=[],positions=[],uv=[],colors=[];
 const shade=new T.Color();
 for(let i=0;i<D.count;i++){let x=(base[i*3]+morph[i*3]*muscle)/1000,y=(base[i*3+1]+morph[i*3+1]*muscle)/1000,z=(base[i*3+2]+morph[i*3+2]*muscle)/1000;raw.push([x,y,z]);const p=source(x,y,z);points.push(p);positions.push(p.x,p.y,p.z);uv.push(uvRaw[i*2]/16000,uvRaw[i*2+1]/16000);
  const warm=Math.max(0,1-Math.abs(y-7.65)/.55)*Math.max(0,1-Math.abs(Math.abs(x)-.43)/.3)*clamp((z-.9)*2,0,1);
  const tone=.94+.055*Math.sin(x*15+y*7+z*8)+.025*Math.sin(x*83+z*53);shade.setRGB(clamp(tone+warm*.035,.75,1.06),clamp(tone-warm*.055,.72,1.02),clamp(tone-warm*.07,.7,1.02));
  if(y>7.22&&y<7.54&&Math.abs(x)<.31&&z>1.42){const strength=clamp((z-1.42)*4,0,.45)*clamp(1-Math.abs(y-7.39)/.16,0,1);shade.lerp(new T.Color(1,.65,.59),strength)}
  colors.push(shade.r,shade.g,shade.b);
 }
 function mat(color,kind,extra={}){const m=visuals.material(color,kind,extra);ownM.push(m);return m}
 const attachments=[];const skinMat=mat(skin,'skin',{roughness:.78,bumpScale:.0025,vertexColors:true}),leather=mat([0x634329,0x514035,0x514a31,0x704337][style]||0x634329,'cloth',{roughness:.94,bumpScale:.018}),dark=mat(0x352b23,'cloth',{bumpScale:.012}),linen=mat([0x6a6e4e,0x635e50,0x6b5639,0x77483d][style]||0x6a6e4e,'cloth',{bumpScale:.009}),fur=mat(0x75634e,'bark',{bumpScale:.022}),metal=new T.MeshStandardMaterial({color:0x9d8658,metalness:.58,roughness:.62}),hairMat=mat(hair,'bark',{roughness:.86,bumpScale:.007}),hairLight=mat(new T.Color(hair).lerp(new T.Color(0x927b5b),.18),'bark',{roughness:.88,bumpScale:.005});ownM.push(metal);
 const geometry=new T.BufferGeometry();ownG.push(geometry);geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(Uint16Array.from(bi),4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(Float32Array.from(bw,x=>x/255),4));
 // Assign clothing directly to the continuous mesh, so the body remains covered even during movement.
 const bins=Array.from({length:5},()=>[]);
 function armWeight(i){let n=0;for(let j=0;j<4;j++)if(bi[i*4+j]>=1&&bi[i*4+j]<=6)n+=bw[i*4+j]/255;return n}
 for(let j=0;j<tri.length;j+=3){const ids=[tri[j],tri[j+1],tri[j+2]],v=ids.map(i=>raw[i]),x=v.reduce((s,p)=>s+Math.abs(p[0]),0)/3,y=v.reduce((s,p)=>s+p[1],0)/3,a=ids.reduce((s,i)=>s+armWeight(i),0)/3;let k=0;
  if(a<.48&&y<2.3&&y>-2.05)k=1;
  if(eq.tunic&&((a<.55&&y>=1.45&&y<6.48)||(a>.45&&y>4.95)))k=3;
  if(eq.wintercoat&&a<.62&&y>=1.45&&y<6.53)k=4;
  if(eq.boots&&a<.3&&y< -5.2)k=2;
  if(a>.83&&y>2.45&&y<2.88&&x>4.4)k=2;
  bins[k].push(...ids);
 }
 let offset=0;for(let i=0;i<bins.length;i++){geometry.addGroup(offset,bins[i].length,i);offset+=bins[i].length}geometry.setIndex(bins.flat());geometry.computeVertexNormals();
 const normal=geometry.attributes.normal;
 const mesh=new T.SkinnedMesh(geometry,[skinMat,leather,dark,linen,fur]);mesh.castShadow=mesh.receiveShadow=true;mesh.frustumCulled=false;body.add(mesh);
 const bones=[],jointNames=[null,'l-shoulder','l-elbow','l-hand','r-shoulder','r-elbow','r-hand','l-upper-leg','l-knee','l-ankle','r-upper-leg','r-knee','r-ankle'],parents=[-1,0,1,2,0,4,5,0,7,8,0,10,11],jointPos=jointNames.map(n=>n?source(...D.joints[n].p.map((x,i)=>x+D.joints[n].d[i]*muscle)):V());
 for(let i=0;i<13;i++){const b=new T.Bone();b.name=D.bones[i];b.position.copy(jointPos[i]);if(parents[i]>=0){b.position.sub(jointPos[parents[i]]);bones[parents[i]].add(b)}else mesh.add(b);bones.push(b)}
 root.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);
 // Natural standing pose, with independent upper and lower limbs.
 function absRotation(i,child,desired){return Q().setFromUnitVectors(jointPos[child].clone().sub(jointPos[i]).normalize(),desired.normalize())}
 function pair(i,j,k,d1,d2,tip=null){const a=absRotation(i,j,d1),b=absRotation(j,k,d2);bones[i].quaternion.copy(a);bones[j].quaternion.copy(a.clone().invert().multiply(b));bones[k].quaternion.copy(tip?b.clone().invert().multiply(tip):Q());return b}
 let neutralHand=[],neutralFoot=null;
 function animate(phase=0,speed=0,jumping=false,attack=0,time=0){const walk=clamp(speed/3.6,0,1),run=clamp((speed-3.6)/3.2,0,1),amp=walk*(.42+run*.23);let lowest=Infinity;
  for(let i=0;i<2;i++){const side=i===0?1:-1,a=i===0?1:4,l=i===0?7:10,w=Math.sin(phase+i*Math.PI),c=Math.cos(phase+i*Math.PI),legAngle=jumping?(i===0?-.5:.24):w*amp,armAngle=jumping?-.48:-w*amp*.78,hit=i===0?0:attack,upper=hit>0?-1.4*hit:armAngle;
   const leg1=V(side*.042,-1,0).applyQuaternion(qx(legAngle)),leg2=V(side*.02,-1,0).applyQuaternion(qx(legAngle+(!jumping?Math.max(0,-c)*walk*(.52+run*.25):.57)));
   pair(l,l+1,l+2,leg1,leg2,qx(jumping?.16:legAngle*.18));const footY=jointPos[l].y+leg1.y*jointPos[l+1].distanceTo(jointPos[l])+leg2.y*jointPos[l+2].distanceTo(jointPos[l+1]);lowest=Math.min(lowest,footY);
   const arm1=V(side*.20,-1,.02).applyQuaternion(qx(upper)),arm2=V(side*.055,-1,.10).applyQuaternion(qx(upper-(hit>0?.55*hit:.13+walk*.18)));
   const r=pair(a,a+1,a+2,arm1,arm2);if(!neutralHand[i])neutralHand[i]=r.clone();
  }
  if(neutralFoot===null)neutralFoot=lowest;body.position.y=(jumping?0:clamp(neutralFoot-lowest,-.25,.035))+(1-walk)*Math.sin(time*2.1)*.006;
 }
 animate();
 const hand=new T.Group();bones[6].add(hand);hand.position.copy(V(0,-.055,.025).applyQuaternion(neutralHand[1].clone().invert()));hand.quaternion.copy(neutralHand[1].clone().invert());
 // Fit the garment to the same morphed mesh and bind it to the SAME skeleton.
 function add(p,g,m,x=0,y=0,z=0){ownG.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
 function skinned(name,pos,uvs,indices,weights,materials,groups=null){
  const g=new T.BufferGeometry();ownG.push(g);g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);const ii=[],ww=[];for(const a of weights){const top=a.map((v,i)=>[i,v]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=top.reduce((s,p)=>s+p[1],0)||1;ii.push(...top.map(p=>p[0]));ww.push(...top.map(p=>p[1]/sum))}g.setAttribute('skinIndex',new T.Uint16BufferAttribute(ii,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(ww,4));if(groups)for(const a of groups)g.addGroup(...a);g.computeVertexNormals();const m=new T.SkinnedMesh(g,materials);m.name=name;m.castShadow=m.receiveShadow=true;m.frustumCulled=false;body.add(m);m.bind(skeleton,mesh.bindMatrix);attachments.push(m);return m
 }
 function vertexWeights(i){const w=Array(13).fill(0);for(let j=0;j<4;j++)w[bi[i*4+j]]+=bw[i*4+j]/255;return w}
 // Exact horizontal cross-section of the anatomical body (ray/segment intersections).
 // Belt edge is conformal to the actual torso; skirt flares gradually from the fitted rim.
 function crossSection(y){const out=[];for(let j=0;j<tri.length;j+=3){const ids=[tri[j],tri[j+1],tri[j+2]];if(ids.some(i=>armWeight(i)>.25))continue;const f=ids.map(i=>points[i]),q=[];for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3];if((a.y<=y&&b.y>y)||(b.y<=y&&a.y>y)){const t=(y-a.y)/(b.y-a.y);q.push([a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t])}}if(q.length===2)out.push(q)}return out}
 const beltY=source(0,2.12,0).y,midZ=.036;
 function radial(section,s,c){let far=0;for(const [[ax,az],[bx,bz]] of section){const dx=bx-ax,dz=bz-az,zz=az-midZ,den=s*dz-c*dx;if(Math.abs(den)<1e-9)continue;const t=(ax*dz-zz*dx)/den,u=(ax*c-zz*s)/den;if(t>0&&u>=-.0001&&u<=1.0001)far=Math.max(far,t)}return far}
 const skirtP=[],skirtUV=[],skirtW=[],skirtBins=[[],[]],N=72,levels=[2.26,2.12,1.78,1.36,.85,.28,-.32,-.95,-1.42];
 // Source CC0 helper skirt gives the flare; fit it to the body at each slice.
 const helper=G.positions.map((p,i)=>source(...p.map((x,k)=>x+G.morph[i][k]*muscle)));
 for(let j=0;j<levels.length;j++){const y=source(0,levels[j],0).y,section=crossSection(y);
  for(let i=0;i<=N;i++){const a=i/N*TAU,s=Math.sin(a),c=Math.cos(a);const actual=radial(section,s,c);let fitted=0,best=Infinity,weight=null;
   for(let k=0;k<helper.length;k++){const q=helper[k],angle=Math.atan2(q.x,q.z-midZ),da=Math.atan2(Math.sin(angle-a),Math.cos(angle-a)),dist=Math.abs(q.y-y)*3+Math.abs(da)*.12;if(dist<best){best=dist;fitted=Math.hypot(q.x,q.z-midZ);weight=G.weights[k]}}
   const flare=clamp((j-2)/6,0,1),fallback=Math.hypot(.175*s,.139*c),r=Math.max(actual+.004+(j<2?.001:.008),j<3?actual||fallback:fitted+.007+flare*.013)*(1+flare*.028*Math.cos(a*12));
   const w=Array(13).fill(0);let blend=j<=2?0:Math.min(.78,(j-2)*.125);w[0]=1-blend;const side=clamp(.5+s*1.1,0,1);w[7]=blend*side;w[10]=blend*(1-side);
   // Preserve the helper's own body-side weight bias without folding the waistband.
   if(weight&&j>2){const l=weight[7]+weight[8],r=weight[10]+weight[11],sum=l+r;if(sum>.02){w[7]=blend*(.55*side+.45*l/sum);w[10]=blend-w[7]}}
   skirtP.push(s*r,y+(j===levels.length-1?.018*Math.sin(a*5):0),midZ+c*r);skirtUV.push(i/N*3,j/(levels.length-1));skirtW.push(w);
  }
 }
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;skirtBins[j<2?1:0].push(a,b,a+1,b,b+1,a+1)}
 const skirt=skinned('Fitted leather kilt and integrated belt',skirtP,skirtUV,skirtBins.flat(),skirtW,[leather,dark],[[0,skirtBins[0].length,0],[skirtBins[0].length,skirtBins[1].length,1]]);
 leather.side=dark.side=T.DoubleSide;
 // Buckle rests directly on the front of the fitted belt (root-weighted).
 const front=radial(crossSection(beltY),0,1)+midZ+.009;
 add(body,new T.BoxGeometry(.075,.048,.013),metal,0,beltY,front);add(body,new T.BoxGeometry(.047,.026,.014),dark,0,beltY,front+.009);
 // Surface overlays keep the source topology, vertex weights and actual head shape.
 function overlay(predicate,material,inflate,extra=(p)=>p,name='Surface detail'){
  const ids=[],map=new Map(),p=[],u=[],w=[],anchors=[];
  for(let j=0;j<tri.length;j+=3){const f=[tri[j],tri[j+1],tri[j+2]],center=[0,1,2].map(k=>f.reduce((s,i)=>s+raw[i][k],0)/3);if(!predicate(...center))continue;
   for(const i of f){if(!map.has(i)){map.set(i,p.length/3);const v=points[i].clone().addScaledVector(V(normal.getX(i),normal.getY(i),normal.getZ(i)),typeof inflate==='function'?inflate(raw[i]):inflate);extra(v,raw[i]);p.push(v.x,v.y,v.z);u.push(uv[i*2]*4,uv[i*2+1]*4);w.push(vertexWeights(i));anchors.push({point:v.clone(),source:raw[i],index:i})}ids.push(map.get(i))}
  }if(!ids.length)return [];skinned(name,p,u,ids,w,material);return anchors
 }
 function strand(pts,r,m){const c=new T.CatmullRomCurve3(pts);return add(body,new T.TubeGeometry(c,14,r,7,false),m)}
 const hairStyle=ch.hair||0;
 const hairline=(x,y,z)=>z>.82?8.63:z>.30?8.21:7.74;
 const cap=hairStyle?overlay((x,y,z)=>y>hairline(x,y,z)&&y>7.55&&Math.abs(x)<1.02&&(hairStyle!==4||Math.abs(x)<.40||z<.15&&Math.abs(x)<.52),hairMat,raw=>.003+clamp((raw[1]-hairline(...raw))*.022,0,hairStyle===1?.010:.026),undefined,'Fitted scalp cap'):[];
 function nearestAnchor(list,p){let best=null,d=Infinity;for(const a of list){const v=a.point.distanceToSquared(p);if(v<d){d=v;best=a}}return best}
 // Every hair lock and braid begins at an actual fitted cap vertex, never a fixed world point.
 if(hairStyle>=2&&cap.length){const back=cap.filter(a=>a.source[2]<.24),rear=back.length?back:cap;
  const count=hairStyle===2?20:hairStyle===4?12:10;
  for(let i=0;i<count;i++){const t=i/(count-1),a=(t-.5)*Math.PI,goal=source(Math.sin(a)*.62,8.3+Math.cos(a)*.30,.22-Math.cos(a)*.48),anchor=nearestAnchor(rear,goal),p=anchor.point.clone(),side=Math.sin(a);
   const len=hairStyle===2?.30:hairStyle===4?.09:.12,tip=p.clone().add(V(side*.045,-len,-.025)),start=p.clone().lerp(points[anchor.index],.55);
   strand([start,p.clone().add(V(side*.016,-.036,-.018)),p.clone().add(V(side*.04,-len*.55,-.035)),tip],hairStyle===2?.014:.010,i%4===0?hairLight:hairMat)
  }
  if(hairStyle===3||hairStyle===5){const n=hairStyle===5?2:1;for(let k=0;k<n;k++){const goal=source(n===1?0:k===0?-.48:.48,8.35,-.40),a=nearestAnchor(rear,goal),p=a.point.clone();for(let j=0;j<3;j++)strand(Array.from({length:12},(_,i)=>{const t=i/11,angle=t*TAU*3+j*TAU/3,rad=.011*Math.min(1,t*6)*(1-t*.35);return p.clone().add(V(Math.cos(angle)*rad,-.31*t,-.07*Math.sin(t*Math.PI*.8)+Math.sin(angle)*rad))}),.012,j===1?hairLight:hairMat);add(body,new T.SphereGeometry(.017,10,8),metal,p.x,p.y-.30,p.z-.042)}}
 }
 const beard=ch.beard||0;
 if(beard){const chin=overlay((x,y,z)=>y>6.88&&y<7.79&&z>.58&&Math.abs(x)<.69&&(y<7.27||Math.abs(x)>.27||y>7.48&&y<7.65),hairMat,beard===1?.004:.009,undefined,'Fitted beard');if(beard>=2&&chin.length){for(let i=0;i<10;i++){const x=(i-4.5)*.012,goal=source(x/scale,7.12,1.12),a=nearestAnchor(chin,goal),p=a.point.clone();strand([p.clone().lerp(points[a.index],.55),p.clone().add(V(0,-.035,.012)),p.clone().add(V(-x*.3,-(beard===3?.19:.115),.008))],.009,i%3===0?hairLight:hairMat)}}}
 // Tunic and winter coat use the underlying continuous skinned body surface.
 if(eq.wintercoat)overlay((x,y,z)=>y>4.8&&y<6.65&&Math.abs(x)<2.6,fur,.014,undefined,'Fitted fur collar');
 const iris=new T.MeshStandardMaterial({color:[0x60422b,0x547548,0x668fa9,0x858f95,0xad7738][ch.eyes]||0x60422b,roughness:.32}),eyeWhite=new T.MeshStandardMaterial({color:0xd8d4c5,roughness:.42}),pupil=new T.MeshStandardMaterial({color:0x171612,roughness:.32});ownM.push(iris,eyeWhite,pupil);
 for(const side of ['l','r']){const c=source(...D.joints[side+'-eye'].p);const e=add(body,new T.SphereGeometry(.016,24,16),eyeWhite,c.x,c.y,c.z);add(body,new T.SphereGeometry(.008,18,12),iris,c.x,c.y,c.z+.015);add(body,new T.SphereGeometry(.0038,12,8),pupil,c.x,c.y,c.z+.021);const sign=side==='l'?1:-1;overlay((x,y,z)=>Math.abs(x*scale-c.x)<.036&&y>8.35&&y<8.54&&z>1.05,hairMat,.0015,undefined,'Fitted brow')}
 if(ch.mark){const m=new T.MeshStandardMaterial({color:ch.mark===1?0x804f41:ch.mark===2?0x274f71:ch.mark===3?0x8c392b:0x3f4231,roughness:.95});ownM.push(m);overlay((x,y,z)=>z>.8&&y>7.56&&y<8.54&&(ch.mark===1?x>0&&Math.abs(x-(.38+(y-8)*.25))<.07:Math.abs(Math.abs(x)-(.43+(y-8)*.12))<.11&&(ch.mark!==4||y<8.08)),m,.0018)}
 return {body,arms:[bones[1],bones[4]],legs:[bones[7],bones[10]],hand,skinMat,mesh,skeleton,attachments,animate,dispose(){for(const g of ownG)g.dispose();for(const m of ownM)m.dispose();skeleton.dispose()}};
}
