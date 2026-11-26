import {HUMAN_DATA as D} from './human-data.js?v=7';
import {GARMENT as G} from './garment-data.js?v=8';
import {detail,appearanceColors} from './appearance.js?v=9';
import {MUSCLES,OUTFITS,EYES,variantMorph} from './choices.js?v=10';
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const decode=s=>{const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',out=new Uint8Array(Math.floor(s.length*3/4)-(s.endsWith('==')?2:s.endsWith('=')?1:0));let j=0;for(let i=0;i<s.length;i+=4){const n=(abc.indexOf(s[i])<<18)|(abc.indexOf(s[i+1])<<12)|((abc.indexOf(s[i+2])&63)<<6)|(abc.indexOf(s[i+3])&63);out[j++]=n>>16&255;if(j<out.length)out[j++]=n>>8&255;if(j<out.length)out[j++]=n&255}return out};
const p16=s=>new Int16Array(decode(s).buffer),base=p16(D.p),morph=p16(D.m),uvRaw=p16(D.uv),tri=new Uint16Array(decode(D.i).buffer),bi=decode(D.bi),bw=decode(D.bw);
const scale=2.30/(9.3003+8.181),floor=-8.181;
export const characterInfo={vertices:D.count,triangles:tri.length/3,bones:D.bones.length};
export function createCharacter(T,visuals,ch,eq,root,skin,hair){
 const body=new T.Group();root.add(body);const ownG=[],ownM=[],V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Q=()=>new T.Quaternion(),qx=a=>Q().setFromAxisAngle(V(1,0,0),a);
 ch=variantMorph(ch);const muscle=clamp((MUSCLES[ch.build]??.57)+detail(ch,'muscleDetail')*.24,0,1.2),faceScale=[1,1.08,.92][ch.face]??1,style=ch.outfit??0;const palette=appearanceColors(T,ch,skin,hair);skin=palette.skin;hair=palette.hair;const q=k=>detail(ch,k),ga=(v,c,w)=>Math.exp(-(((v-c)/w)**2));
 function source(x,y,z){
 const ox=x,oy=y,oz=z,ax=Math.abs(ox),side=Math.sign(ox);
 if(oy>7.1){const a=clamp((oy-7.1)/.65,0,1),head=q('headSize')*.065*a;x*=1+(faceScale-1)*a+head;y+=(oy-8.15)*head;z+=(oz-.25)*head;
 const jaw=ga(oy,7.26,.43)*ga(ax,.55,.45),chin=ga(oy,7.15,.30)*ga(ax,0,.40)*a,cheek=ga(oy,7.90,.34)*ga(ax,.56,.25)*clamp((oz-.35)/.8,0,1),nose=ga(oy,7.93,.35)*ga(ax,0,.35)*clamp((oz-.8)/.65,0,1),eye=ga(oy,8.17,.33)*ga(ax,.39,.26),brow=ga(oy,8.39,.18)*ga(ax,.42,.38)*clamp((oz-.45)/.8,0,1);
 x+=side*(q('jawWidth')*.13*jaw*a+q('cheeks')*.10*cheek+q('eyeSpacing')*.075*eye)+ox*q('noseWidth')*.40*nose;z+=q('chin')*.16*chin+q('cheeks')*.12*cheek+q('noseLength')*.19*nose+q('brow')*.11*brow;y-=q('chin')*.10*chin;y+=q('brow')*.09*brow;
 }else{const fade=clamp((7.1-oy)/.65,0,1),shoulder=ga(oy,5.5,1.35)*fade,waist=ga(oy,2.15,1.4)*ga(ax,0,2.3),chest=ga(oy,4.85,1.2)*ga(ax,0,2.1);x+=ox*(q('shoulders')*.105*shoulder+q('waist')*.12*waist);z+=oz*(q('waist')*.10*waist+q('chest')*.14*chest);if(oy<.5){const w=clamp((.5-oy)/1.3,0,1)*ga(oy,-2.8,4.3),center=side*(.81+clamp(-oy/8,0,1)*.15);x+=(ox-center)*q('legWidth')*.15*w;z+=(oz-.10)*q('legWidth')*.14*w}}
 return V(x*scale,(y-floor)*scale,z*scale)
 }
 const points=[],raw=[],positions=[],uv=[],colors=[];
 const shade=new T.Color();
 for(let i=0;i<D.count;i++){let x=(base[i*3]+morph[i*3]*muscle)/1000,y=(base[i*3+1]+morph[i*3+1]*muscle)/1000,z=(base[i*3+2]+morph[i*3+2]*muscle)/1000;raw.push([x,y,z]);const p=source(x,y,z);points.push(p);positions.push(p.x,p.y,p.z);uv.push(uvRaw[i*2]/16000,uvRaw[i*2+1]/16000);
  const warm=Math.max(0,1-Math.abs(y-7.65)/.55)*Math.max(0,1-Math.abs(Math.abs(x)-.43)/.3)*clamp((z-.9)*2,0,1);
  const jointWarm=ga(y,-3.1,.55)*.018+ga(y,3.8,.4)*.014,earWarm=ga(y,7.9,.45)*ga(Math.abs(x),.90,.20)*.024;const tone=.99+.011*Math.sin(x*8+y*4+z*3)+.007*Math.sin(x*32+z*21);shade.setRGB(clamp(tone+warm*.025+jointWarm+earWarm,.91,1.07),clamp(tone-warm*.028-jointWarm*.4-earWarm,.89,1.04),clamp(tone-warm*.04-jointWarm*.7-earWarm,.87,1.03));
  if(y>7.22&&y<7.54&&Math.abs(x)<.31&&z>1.42){const strength=clamp((z-1.42)*4,0,.45)*clamp(1-Math.abs(y-7.39)/.16,0,1);shade.lerp(new T.Color(1,.65,.59),strength)}
  colors.push(shade.r,shade.g,shade.b);
 }
 function mat(color,kind,extra={}){const m=visuals.material(color,kind,extra);ownM.push(m);return m}
 const attachments=[];const skinMat=mat(skin,'skin',{roughness:.86,bumpScale:.0009,vertexColors:true}),leather=mat(OUTFITS[style]||0x634329,'cloth',{roughness:.91,bumpScale:.006}),dark=mat(0x352b23,'cloth',{bumpScale:.012}),linen=mat([0x6a6e4e,0x635e50,0x6b5639,0x77483d][style]||0x6a6e4e,'cloth',{bumpScale:.009}),fur=mat(0x75634e,'bark',{bumpScale:.022}),metal=new T.MeshStandardMaterial({color:0x9d8658,metalness:.58,roughness:.62}),hairMat=mat(hair,'bark',{roughness:.93,bumpScale:.002}),hairLight=mat(new T.Color(hair).lerp(new T.Color(0x927b5b),.18),'bark',{roughness:.93,bumpScale:.002});ownM.push(metal);
 const geometry=new T.BufferGeometry();ownG.push(geometry);geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(Uint16Array.from(bi),4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(Float32Array.from(bw,x=>x/255),4));
 // Assign clothing directly to the continuous mesh, so the body remains covered even during movement.
 const bins=Array.from({length:5},()=>[]);
 function armWeight(i){let n=0;for(let j=0;j<4;j++)if(bi[i*4+j]>=1&&bi[i*4+j]<=6)n+=bw[i*4+j]/255;return n}
 for(let j=0;j<tri.length;j+=3){const ids=[tri[j],tri[j+1],tri[j+2]],v=ids.map(i=>raw[i]),x=v.reduce((s,p)=>s+Math.abs(p[0]),0)/3,y=v.reduce((s,p)=>s+p[1],0)/3,a=ids.reduce((s,i)=>s+armWeight(i),0)/3;let k=0;
  if(a<.48&&y<2.3&&y>-1.7)k=1;
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
 // Lightweight procedural locomotion: blended gait, softened foot contact and body weight.
 const gaitRest=jointPos.map((p,i)=>parents[i]>=0?p.clone().sub(jointPos[parents[i]]).normalize():V());
 const gaitA=Q(),gaitB=Q(),gaitInv=Q(),gaitTip=Q(),gaitAxis=V(1,0,0),gaitLeg1=V(),gaitLeg2=V(),gaitArm1=V(),gaitArm2=V(),gaitPivot=V(0,1.06,0),gaitOffset=V();
 const gaitLengths=jointPos.map((p,i)=>parents[i]>=0?p.distanceTo(jointPos[parents[i]]):0);
 function pair(i,j,k,d1,d2,tipAngle=null){gaitA.setFromUnitVectors(gaitRest[j],d1.normalize());gaitB.setFromUnitVectors(gaitRest[k],d2.normalize());bones[i].quaternion.copy(gaitA);bones[j].quaternion.copy(gaitInv.copy(gaitA).invert().multiply(gaitB));if(tipAngle===null)bones[k].quaternion.identity();else bones[k].quaternion.copy(gaitInv.copy(gaitB).invert().multiply(gaitTip.setFromAxisAngle(gaitAxis,tipAngle)));return gaitB}
 // Two-bone leg IK: a planted foot sweeps backward, then lifts and returns forward.
 const gaitTarget=V(),gaitDirection=V(),gaitBend=V(),gaitKnee=V(),gaitGround1=V(),gaitGround2=V(),gaitBodyInv=Q(),gaitFootQ=Q();
 let neutralHand=[],gaitSpeed=0,gaitSide=0,gaitForward=1,gaitAir=0,gaitTurn=0,gaitHit=0,bodyLift=0,leanX=0,leanZ=0,twist=0;
 function animate(phase=0,speed=0,jumping=false,attack=0,time=0,strafe=0,forward=1,dt=1/60,turn=0,guard=0,swim=0){
  dt=clamp(Number.isFinite(dt)?dt:1/60,0,.05);const blend=1-Math.exp(-14*dt),relax=1-Math.exp(-8*dt);
  gaitSpeed+=(clamp(speed,0,7)-gaitSpeed)*blend;gaitSide+=(clamp(strafe,-1,1)-gaitSide)*blend;gaitForward+=(clamp(forward,-1,1)-gaitForward)*blend;
  gaitAir+=((jumping?1:0)-gaitAir)*blend;gaitTurn+=(clamp(turn,-5,5)-gaitTurn)*relax;gaitHit+=(clamp(attack,0,1)-gaitHit)*(1-Math.exp(-22*dt));
  const swimming=clamp(swim,0,1),stroke=time*(speed>.2?5.5:2.2),walk=clamp(gaitSpeed/2.65,0,1),run=clamp((gaitSpeed-2.65)/3.05,0,1),air=gaitAir,ground=(1-air)*(1-swimming);
  const stance=.60-.13*run,span=(.51+.105*run)*walk,legLift=(.105+.14*run)*walk;
  // Match a human stride: foot centers beneath the hips, no wide A-pose.
  const feet=[];
  let pelvisDrop=0;
  for(let i=0;i<2;i++){
   const side=i===0?1:-1,l=i===0?7:10,u=((phase/TAU+i*.5)%1+1)%1;
   let travel,footLift,toe;
   if(u<stance){const t=u/stance;travel=1-2*t;footLift=0;toe=(-.09*Math.max(0,1-t*6)+.14*Math.max(0,(t-.82)/.18))*walk}
   else{const t=(u-stance)/(1-stance),smooth=t*t*(3-2*t);travel=-1+2*smooth;footLift=Math.sin(Math.PI*t)*legLift;toe=.10*Math.sin(Math.PI*t)*walk}
   const hip=jointPos[l],ankle=jointPos[l+2],len=gaitLengths[l+1]+gaitLengths[l+2],width=Math.abs(hip.x)*(.78+.06*run);
   const lateral=clamp(-gaitSide*travel*span*.45,-.08,.08),x=side*Math.max(.095,width+side*lateral),z=ankle.z+gaitForward*travel*span,y=ankle.y+footLift;
   const reach=Math.hypot(x-hip.x,z-hip.z),vertical=Math.sqrt(Math.max(.04,(len*.993)**2-reach**2));
   pelvisDrop=Math.max(pelvisDrop,hip.y-y-vertical);
   feet.push({travel,footLift,toe,x,y,z});
  }
  const lift=(-Math.max(0,pelvisDrop)-.007*walk)*ground+(1-walk)*Math.sin(time*2.1)*.003;
  bodyLift+=(lift-bodyLift)*(1-Math.exp(-22*dt));
  leanX+=((walk*(.018+run*.11)*gaitForward+.035*air)-leanX)*relax;
  leanZ+=((-gaitSide*walk*.035-gaitTurn*.008+Math.sin(phase)*walk*.014)*ground-leanZ)*relax;
  twist+=((Math.sin(phase)*walk*(.025+run*.022)*ground-gaitTurn*.005)-twist)*blend;
  body.rotation.set(leanX*(1-swimming)+.82*swimming,twist*(1-swimming),leanZ*(1-swimming)+Math.sin(stroke)*.06*swimming);
  gaitOffset.copy(gaitPivot).applyEuler(body.rotation);
  body.position.set(gaitPivot.x-gaitOffset.x+Math.sin(phase)*walk*.012*ground,bodyLift+gaitPivot.y-gaitOffset.y,gaitPivot.z-gaitOffset.z);
  gaitBodyInv.setFromEuler(body.rotation).invert();
  for(let i=0;i<2;i++){
   const side=i===0?1:-1,a=i===0?1:4,l=i===0?7:10,p=phase+i*Math.PI,{travel,toe,x,y,z}=feet[i];
   const hip=jointPos[l],upperLength=gaitLengths[l+1],lowerLength=gaitLengths[l+2];
   gaitTarget.set(x,y,z).sub(body.position).applyQuaternion(gaitBodyInv);
   gaitDirection.copy(gaitTarget).sub(hip);const length=clamp(gaitDirection.length(),Math.abs(upperLength-lowerLength)+.001,(upperLength+lowerLength)*.998);gaitDirection.normalize();
   const along=(upperLength*upperLength-lowerLength*lowerLength+length*length)/(2*length),bend=Math.sqrt(Math.max(0,upperLength*upperLength-along*along));
   gaitBend.set(0,0,1);gaitBend.addScaledVector(gaitDirection,-gaitBend.dot(gaitDirection)).normalize();
   gaitKnee.copy(gaitDirection).multiplyScalar(along).addScaledVector(gaitBend,bend);
   gaitGround1.copy(gaitKnee).normalize();gaitGround2.copy(gaitDirection).multiplyScalar(length).sub(gaitKnee).normalize();
   const jumpAngle=i===0?-.44:.22,swimAngle=Math.sin(stroke+i*Math.PI)*.32;
   gaitLeg1.set(side*.045,-1,0).applyAxisAngle(gaitAxis,jumpAngle*air+swimAngle*swimming).normalize();
   gaitLeg2.set(side*.025,-1,0).applyAxisAngle(gaitAxis,(jumpAngle+.65)*air+(swimAngle+.43)*swimming).normalize();
   gaitLeg1.lerp(gaitGround1,ground).normalize();gaitLeg2.lerp(gaitGround2,ground).normalize();
   pair(l,l+1,l+2,gaitLeg1,gaitLeg2,toe*ground+.13*air+.25*swimming);if(ground>.98){gaitFootQ.setFromAxisAngle(gaitAxis,toe);bones[l+2].quaternion.copy(gaitInv.copy(gaitB).invert().multiply(gaitBodyInv).multiply(gaitFootQ))}
   // Arms oppose the planted leg; elbow flex and shoulder rotation increase during running.
   const hit=i===0?0:gaitHit,block=i===0?clamp(guard,0,1):0,armSwing=travel*walk*(.19+.30*run)*gaitForward*ground-.34*air;
   const upper=((armSwing*(1-hit)-1.4*hit)*(1-block)-1.08*block)*(1-swimming)+(-1.1+Math.sin(stroke+i*Math.PI)*1.05)*swimming;
   gaitArm1.set(side*(.085+.035*run)*(1-block)+Math.sin(p)*.018*gaitSide,-1,.018).applyAxisAngle(gaitAxis,upper);
   const elbow=.14+walk*.10+run*.52+hit*.48+block*.68;
   gaitArm2.set(side*.055-block*.48,-1,.06).applyAxisAngle(gaitAxis,upper-elbow);
   const r=pair(a,a+1,a+2,gaitArm1,gaitArm2);if(!neutralHand[i])neutralHand[i]=r.clone();
  }
 }

 animate();
 const offhand=new T.Group();bones[3].add(offhand);offhand.position.copy(V(0,-.055,.025).applyQuaternion(neutralHand[0].clone().invert()));offhand.quaternion.copy(neutralHand[0].clone().invert());const hand=new T.Group();bones[6].add(hand);hand.position.copy(V(0,-.055,.025).applyQuaternion(neutralHand[1].clone().invert()));hand.quaternion.copy(neutralHand[1].clone().invert());
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
 const skirtP=[],skirtUV=[],skirtW=[],skirtBins=[[],[]],N=48,levels=[2.26,2.12,1.78,1.36,.85,.28,-.32,-.95,-1.42].map((y,i)=>i<3?y:y+([0,0,0,0,-.18,.16,-.09,.10][style]||0)*(i-2)/6);
 // Source CC0 helper skirt gives the flare; fit it to the body at each slice.
 const helper=G.positions.map((p,i)=>source(...p.map((x,k)=>x+G.morph[i][k]*muscle)));
 for(let j=0;j<levels.length;j++){const y=source(0,levels[j],0).y,section=crossSection(y);
  for(let i=0;i<=N;i++){const a=i/N*TAU,s=Math.sin(a),c=Math.cos(a);const actual=radial(section,s,c);let fitted=0,best=Infinity,weight=null;
   for(let k=0;k<helper.length;k++){const q=helper[k],angle=Math.atan2(q.x,q.z-midZ),da=Math.atan2(Math.sin(angle-a),Math.cos(angle-a)),dist=Math.abs(q.y-y)*3+Math.abs(da)*.12;if(dist<best){best=dist;fitted=Math.hypot(q.x,q.z-midZ);weight=G.weights[k]}}
   const flare=clamp((j-2)/6,0,1),fallback=Math.hypot(.175*s,.139*c),r=Math.max(actual+.004+(j<2?.001:.008),j<3?actual||fallback:fitted+.008+flare*.012)*(1+flare*.017*Math.cos(a*12));
   const w=Array(13).fill(0);let blend=j<=2?0:Math.min(.90,(j-2)*.17);w[0]=1-blend;const side=clamp(.5+s*1.1,0,1);w[7]=blend*side;w[10]=blend*(1-side);
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
 // Clip triangles against a continuous hairline field, instead of selecting whole faces.
 function smoothOverlay(field,material,inflate,extra=(v)=>v,name='Fitted hair'){
  const pos=[],u=[],w=[],idx=[],lookup=new Map(),anchors=[];
  const val=raw.map(p=>field(...p));
  function vertex(i,j=i,t=0){const key=i===j?'v'+i:'e'+Math.min(i,j)+':'+Math.max(i,j);if(lookup.has(key))return lookup.get(key);
   const src=raw[i].map((x,k)=>x+(raw[j][k]-x)*t),base=points[i].clone().lerp(points[j],t),n=V(normal.getX(i),normal.getY(i),normal.getZ(i)).lerp(V(normal.getX(j),normal.getY(j),normal.getZ(j)),t).normalize(),v=base.clone().addScaledVector(n,inflate(src,Math.max(0,field(...src))));extra(v,src,Math.max(0,field(...src)));
   const k=pos.length/3;lookup.set(key,k);pos.push(v.x,v.y,v.z);u.push((uv[i*2]+(uv[j*2]-uv[i*2])*t)*4,(uv[i*2+1]+(uv[j*2+1]-uv[i*2+1])*t)*4);const wi=vertexWeights(i),wj=vertexWeights(j);w.push(wi.map((x,k)=>x+(wj[k]-x)*t));if(i===j)anchors.push({point:v.clone(),source:src,index:i});return k
  }
  for(let j=0;j<tri.length;j+=3){const f=[tri[j],tri[j+1],tri[j+2]];if(f.every(i=>val[i]<=0))continue;const polygon=[];for(let e=0;e<3;e++){const i=f[e],k=f[(e+1)%3],a=val[i],b=val[k];if(a>0)polygon.push(vertex(i));if((a>0)!==(b>0))polygon.push(vertex(i,k,a/(a-b)))}for(let k=1;k<polygon.length-1;k++)idx.push(polygon[0],polygon[k],polygon[k+1])}
  if(idx.length)skinned(name,pos,u,idx,w,material);return anchors
 }
 const hairStyle=ch.hair||0;
 const hairline=(x,y,z)=>7.81+.86*clamp((z-.05)/.95,0,1)+.095*Math.cos(x*4);
 const scalpField=(x,y,z)=>Math.min(y-hairline(x,y,z),y-7.6,1.06-Math.abs(x),[4,8].includes(hairStyle)?(hairStyle===8?.27:.40)-Math.abs(x)+.25*clamp((.3-z)*2,0,1):2);
 const cap=hairStyle?smoothOverlay(scalpField,hairMat,(p,f)=>.0015+clamp(f*.030,0,hairStyle===1?.009:hairStyle===8?.065:.030),undefined,'Continuous fitted scalp'):[];
 function nearestAnchor(list,p){let best=null,d=Infinity;for(const a of list){const v=a.point.distanceToSquared(p);if(v<d){d=v;best=a}}return best}
 // Tapered coherent locks: start under the surface and follow the cap with no independent floating roots.
 function lock(pts,radii,m){const curve=new T.CatmullRomCurve3(pts),p=[],u=[],ix=[],n=16,sides=10,frames=curve.computeFrenetFrames(n,false);for(let i=0;i<=n;i++){const t=i/n,q=curve.getPointAt(t),j=Math.min(radii.length-2,Math.floor(t*(radii.length-1))),f=t*(radii.length-1)-j,r=radii[j]*(1-f)+radii[j+1]*f;for(let k=0;k<=sides;k++){const a=k/sides*TAU,v=q.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*.83);p.push(v.x,v.y,v.z);u.push(k/sides,t*3)}}for(let i=0;i<n;i++)for(let k=0;k<sides;k++){const a=i*(sides+1)+k,b=a+sides+1;ix.push(a,b,a+1,b,b+1,a+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ix);g.computeVertexNormals();return add(body,g,m)}
 if(hairStyle>=2&&cap.length){const back=cap.filter(a=>a.source[2]<.32),rear=back.length?back:cap;
  if(hairStyle===2||hairStyle===7){for(let i=0;i<15;i++){const t=i/14,angle=(t-.5)*Math.PI,side=Math.sin(angle),goal=source(side*.68,8.45+Math.cos(angle)*.29,.18-Math.cos(angle)*.48),anchor=nearestAnchor(rear,goal),p=anchor.point.clone(),len=(hairStyle===7?.37:.24)+.07*Math.cos(angle);
   lock([p.clone().lerp(points[anchor.index],.8),p.clone().add(V(side*.025,-.052,-.028)),p.clone().add(V(side*.042,-len*.65,-.043)),p.clone().add(V(side*.046,-len,-.026))],[.012,.034,.031,.003],i%4===0?hairLight:hairMat)
  }}
  if([3,5,9].includes(hairStyle)){const n=hairStyle===5?2:1;for(let k=0;k<n;k++){const goal=source(n===1?0:k===0?-.45:.45,8.46,-.39),a=nearestAnchor(rear,goal),p=a.point.clone(),end=p.clone().add(V(0,-.31*(1+q('hairLength')*.35),-.075));const center=[p.clone().lerp(points[a.index],.85),p.clone().add(V(0,-.048,-.043)),p.clone().add(V(0,-.17*(1+q('hairLength')*.35),-.11)),end];lock(center,[.022,.040,.026,.008],hairMat);
   if(hairStyle===5||hairStyle===9)for(let j=0;j<3;j++)lock(Array.from({length:13},(_,i)=>{const t=i/12,q=new T.CatmullRomCurve3(center).getPoint(t),ang=t*TAU*3+j*TAU/3,r=.016*Math.sin(Math.PI*t)*.8;return q.add(V(Math.cos(ang)*r,0,Math.sin(ang)*r))}),[.008,.015,.012,.002],j===1?hairLight:hairMat);
   add(body,new T.SphereGeometry(.013,12,8),metal,end.x,end.y+.022,end.z);
  }}
 }
 if(hairStyle===6&&cap.length){const a=nearestAnchor(cap,source(0,9.12,-.26)),p=a.point.clone(),end=p.clone().add(V(0,.06,-.045));lock([p.clone().lerp(points[a.index],.8),p.clone().add(V(0,.025,-.01)),end,p.clone().add(V(0,.05,-.07))],[.020,.048,.048,.008],hairMat);add(body,new T.SphereGeometry(.016,12,8),metal,p.x,p.y+.012,p.z-.012)}
 const beard=ch.beard||0;
 if(beard){const field=(x,y,z)=>{const ax=Math.abs(x),jaw=Math.min(y-6.91,7.43+ax*.72-y,.77-ax,z-.59),mustache=Math.min(.42-ax,y-7.49,7.65-.09*ax-y,z-1.18);return beard===4?mustache:beard===5?Math.max(mustache,Math.min(jaw,.28-ax)):Math.max(jaw,mustache)};
  smoothOverlay(field,hairMat,(p,f)=>.001+clamp(f*.035,0,beard===6?.0018:beard===1?.005*(1+q('beardLength')*.6):.016),(v,p,f)=>{if([2,3,7].includes(beard)&&p[1]<7.35){const t=clamp((7.35-p[1])/.43,0,1),center=clamp(1-Math.abs(p[0])/.75,0,1);v.y-=(beard===7?.22:beard===3?.16:.09)*(1+q('beardLength')*.55)*t*center;v.z+=.018*t*center}},'Continuous fitted beard')
 }
 // Tunic and winter coat use the underlying continuous skinned body surface.
 if(eq.wintercoat)overlay((x,y,z)=>y>4.8&&y<6.65&&Math.abs(x)<2.6,fur,.014,undefined,'Fitted fur collar');
 const iris=new T.MeshStandardMaterial({color:EYES[ch.eyes]||0x60422b,roughness:.32}),eyeWhite=new T.MeshStandardMaterial({color:0xbdb7a9,roughness:.62}),pupil=new T.MeshStandardMaterial({color:0x171612,roughness:.32});ownM.push(iris,eyeWhite,pupil);
 for(const side of ['l','r']){const c=source(...D.joints[side+'-eye'].p);const e=add(body,new T.SphereGeometry(.014,16,12),eyeWhite,c.x,c.y,c.z-.002);add(body,new T.SphereGeometry(.0065,16,10),iris,c.x,c.y,c.z+.010);add(body,new T.SphereGeometry(.003,12,8),pupil,c.x,c.y,c.z+.015);const sign=side==='l'?1:-1;smoothOverlay((x,y,z)=>Math.min(1-((source(x,y,z).x-c.x)/.027)**2-((y-(8.39+.045*Math.cos(x*8)))/.045)**2,z-1.02),hairMat,()=>.0015,undefined,'Fitted eyebrow')}
 if(ch.mark){const m=new T.MeshStandardMaterial({color:[0,0x804f41,0x274f71,0x8c392b,0x3f4231,0x25201c,0xc7c0a9,0x895446,0x35566a,0x704238][ch.mark]||0x3f4231,roughness:.95,transparent:true,opacity:.78,depthWrite:false});ownM.push(m);const kind=ch.mark;
 smoothOverlay((x,y,z)=>{const ax=Math.abs(x),base=z-.8,cheek=Math.min(y-7.56,8.54-y,.11-Math.abs(ax-(.43+(y-8)*.12)));let field=cheek;if(kind===1)field=Math.min(x,y-7.56,8.54-y,.06-Math.abs(x-(.38+(y-8)*.25)));if(kind===4)field=Math.min(cheek,8.08-y);if(kind===5)field=Math.min(.10-Math.abs(y-8.15),.84-ax);if(kind===6)field=Math.min(.20-Math.abs(ax-.49),y-7.75,8.29-y);if(kind===7)field=Math.min(x,.06-Math.abs(x-(.39+(y-8.38)*.25)),y-8.14,8.64-y);if(kind===8)field=Math.min(.23-Math.abs(ax-.49),Math.max(.045-Math.abs(y-7.85),.045-Math.abs(y-8.02)));if(kind===9)field=Math.min(y-8.34,8.73-y,Math.max(.045-Math.abs(x),.045-Math.abs(Math.abs(x)-(y-8.34)*.58)));return Math.min(base,field)},m,()=>.0018,undefined,'Fitted face marking')
 }

 return {body,arms:[bones[1],bones[4]],legs:[bones[7],bones[10]],hand,offhand,skinMat,mesh,skeleton,attachments,animate,dispose(){for(const g of ownG)g.dispose();for(const m of ownM)m.dispose();skeleton.dispose()}};
}
