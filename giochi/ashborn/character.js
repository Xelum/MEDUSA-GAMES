import {HUMAN_DATA as D} from './human-data.js?v=7';
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
 const skinMat=mat(skin,'skin',{roughness:.78,bumpScale:.0025,vertexColors:true}),leather=mat([0x634329,0x514035,0x514a31,0x704337][style]||0x634329,'cloth',{roughness:.94,bumpScale:.018}),dark=mat(0x352b23,'cloth',{bumpScale:.012}),linen=mat([0x6a6e4e,0x635e50,0x6b5639,0x77483d][style]||0x6a6e4e,'cloth',{bumpScale:.009}),fur=mat(0x75634e,'bark',{bumpScale:.022}),metal=new T.MeshStandardMaterial({color:0x9d8658,metalness:.58,roughness:.62}),hairMat=mat(hair,'bark',{roughness:.86,bumpScale:.007}),hairLight=mat(new T.Color(hair).lerp(new T.Color(0x927b5b),.18),'bark',{roughness:.88,bumpScale:.005});ownM.push(metal);
 const geometry=new T.BufferGeometry();ownG.push(geometry);geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('skinIndex',new T.Uint16BufferAttribute(Uint16Array.from(bi),4));geometry.setAttribute('skinWeight',new T.Float32BufferAttribute(Float32Array.from(bw,x=>x/255),4));
 // Assign clothing directly to the continuous mesh, so the body remains covered even during movement.
 const bins=Array.from({length:5},()=>[]);
 function armWeight(i){let n=0;for(let j=0;j<4;j++)if(bi[i*4+j]>=1&&bi[i*4+j]<=6)n+=bw[i*4+j]/255;return n}
 for(let j=0;j<tri.length;j+=3){const ids=[tri[j],tri[j+1],tri[j+2]],v=ids.map(i=>raw[i]),x=v.reduce((s,p)=>s+Math.abs(p[0]),0)/3,y=v.reduce((s,p)=>s+p[1],0)/3,a=ids.reduce((s,i)=>s+armWeight(i),0)/3;let k=0;
  if(a<.48&&y<2.1&&y>-2.0)k=1;
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
 // Original handmade clothing meshes and leather panel seams.
 function add(p,g,m,x=0,y=0,z=0){ownG.push(g);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
 function shape(rings,n=48,fold=0){const pos=[],u=[],ind=[];for(let j=0;j<rings.length;j++){const [y,rx,rz,cz=0]=rings[j];for(let i=0;i<=n;i++){const a=i/n*TAU,v=1+fold*Math.cos(a*9)*(1-j/(rings.length+1));pos.push(Math.sin(a)*rx*v,y,Math.cos(a)*rz*v+cz);u.push(i/n,j/(rings.length-1))}}for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;ind.push(a,a+1,b,b,a+1,b+1)}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ind);g.computeVertexNormals();return g}
 const hip=source(0,1.72,0).y,waist=Math.max(.24,...raw.filter(p=>p[1]>1.6&&p[1]<1.9&&Math.abs(p[0])<2.8).map(p=>Math.abs(p[0])*scale))+.025,depth=.165+muscle*.02;
 add(body,shape([[hip-.32,waist*1.04,depth*1.28,.005],[hip-.25,waist*1.13,depth*1.18,.005],[hip-.12,waist*1.06,depth*1.04,.005],[hip,waist,depth,.005]],48,.045),leather);
 add(body,shape([[hip-.025,waist+.012,depth+.016,.005],[hip+.06,waist+.006,depth+.012,.005]],48),dark);
 const buckle=add(body,new T.BoxGeometry(.098,.068,.025),metal,0,hip+.015,depth+.022);buckle.rotation.z=.04;
 add(body,new T.BoxGeometry(.055,.035,.027),dark,0,hip+.015,depth+.037);
 // Uneven vertical leather flaps, visible seam stitching and belt studs.
 for(let i=0;i<9;i++){const a=i/9*TAU,rx=waist*1.1,rz=depth*1.18;const flap=add(body,new T.BoxGeometry(.085,.19+(i%3)*.045,.013),i%3===0?dark:leather,Math.sin(a)*rx,hip-.16,Math.cos(a)*rz+.005);flap.rotation.y=a;flap.rotation.x=.08*Math.cos(a);const stud=add(body,new T.SphereGeometry(.008,8,6),metal,Math.sin(a)*(waist+.014),hip+.015,Math.cos(a)*(depth+.017)+.005);stud.scale.y=.8}
 if(eq.tunic||eq.wintercoat){const waistBelt=add(body,shape([[hip+.07,waist+.018,depth+.026],[hip+.12,waist+.012,depth+.02]],48),dark);if(eq.wintercoat){for(const side of [-1,1]){const patch=add(body,new T.SphereGeometry(1,24,16),fur,side*.24,1.86,-.008);patch.scale.set(.15,.095,.18)}const cape=add(body,shape([[hip-.22,.32,.15,-.16],[hip+.15,.30,.17,-.11],[1.8,.31,.13,-.06]],36,.07),fur);cape.material.side=T.DoubleSide}}
 // The scalp and beard are cut from the actual head surface, not independent balls.
 function overlay(predicate,material,inflate,extra=(p)=>p){const ids=[],map=new Map(),p=[],u=[];for(let j=0;j<tri.length;j+=3){const f=[tri[j],tri[j+1],tri[j+2]],center=[0,1,2].map(k=>f.reduce((s,i)=>s+raw[i][k],0)/3);if(!predicate(...center))continue;for(const i of f){if(!map.has(i)){map.set(i,p.length/3);const v=points[i].clone().addScaledVector(V(normal.getX(i),normal.getY(i),normal.getZ(i)),inflate);extra(v,raw[i]);p.push(v.x,v.y,v.z);u.push(uv[i*2]*4,uv[i*2+1]*4)}ids.push(map.get(i))}}if(!ids.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(ids);g.computeVertexNormals();return add(body,g,material)}
 const hairStyle=ch.hair||0;
 if(hairStyle)overlay((x,y,z)=>y>(z>.8?8.73:z>.30?8.25:7.75)&&y>7.6&&Math.abs(x)<.96,hairMat,hairStyle===1?.009:.019,(v,p)=>{if(hairStyle>=4&&Math.abs(p[0])<.32)v.y+=.022;return v});
 function strand(pts,r,m){const c=new T.CatmullRomCurve3(pts);return add(body,new T.TubeGeometry(c,14,r,6,false),m)}
 if([2,3,4,5].includes(hairStyle)){for(let i=0;i<(hairStyle===2?16:8);i++){const a=(i/(hairStyle===2?16:8))*Math.PI-Math.PI/2,side=Math.sign(Math.sin(a))||1,x=Math.sin(a)*.092,z=.025-Math.cos(a)*.10,y=2.22+Math.cos(a)*.025;const end=hairStyle===2?1.87:2.08;strand([V(x,y,z),V(x*1.32,2.12,z-.048),V(x*1.29,end+.10,z-.075),V(x*1.12,end,z-.055)],hairStyle===2?.014:.011,i%4===0?hairLight:hairMat)}}
 if(hairStyle===3||hairStyle===5){const count=hairStyle===5?2:1;for(let k=0;k<count;k++){const x=count===1?0:(k?-.063:.063);for(let j=0;j<3;j++)strand(Array.from({length:9},(_,i)=>{const t=i/8,a=i*1.9+j*TAU/3;return V(x+Math.cos(a)*.011*(1-t*.4),2.17-t*.38,-.08-.09*Math.sin(t*Math.PI*.8)+Math.sin(a)*.011)}),.014,j===1?hairLight:hairMat);add(body,new T.SphereGeometry(.019,10,8),metal,x,1.80,-.14)}}
 const beard=ch.beard||0;
 if(beard){overlay((x,y,z)=>y>6.88&&y<7.79&&z>.58&&Math.abs(x)<.69&&(y<7.27||Math.abs(x)>.27||y>7.48&&y<7.65),hairMat,beard===1?.009:.016);if(beard>=2){for(let i=0;i<11;i++){const x=(i-5)*.013,yy=source(0,7.19,0).y,zz=.17+Math.cos(i*.3)*.018;strand([V(x,yy,zz),V(x*.85,yy-.07,zz+.025),V(x*.45,yy-(beard===3?.23:.15),zz+.01)],.010,i%3===0?hairLight:hairMat)}}}
 const iris=new T.MeshStandardMaterial({color:[0x60422b,0x547548,0x668fa9,0x858f95,0xad7738][ch.eyes]||0x60422b,roughness:.32}),eyeWhite=new T.MeshStandardMaterial({color:0xd8d4c5,roughness:.42}),pupil=new T.MeshStandardMaterial({color:0x171612,roughness:.32});ownM.push(iris,eyeWhite,pupil);
 for(const side of ['l','r']){const c=source(...D.joints[side+'-eye'].p);const e=add(body,new T.SphereGeometry(.018,24,16),eyeWhite,c.x,c.y,c.z);add(body,new T.SphereGeometry(.008,18,12),iris,c.x,c.y,c.z+.015);add(body,new T.SphereGeometry(.0038,12,8),pupil,c.x,c.y,c.z+.021);const sign=side==='l'?1:-1;strand([V(c.x-sign*.025,c.y+.031,c.z+.018),V(c.x,c.y+.038,c.z+.020),V(c.x+sign*.028,c.y+.031,c.z+.009)],.0045,hairMat)}
 if(ch.mark){const m=new T.MeshStandardMaterial({color:ch.mark===1?0x804f41:ch.mark===2?0x274f71:ch.mark===3?0x8c392b:0x3f4231,roughness:.95});ownM.push(m);overlay((x,y,z)=>z>.8&&y>7.56&&y<8.54&&(ch.mark===1?x>0&&Math.abs(x-(.38+(y-8)*.25))<.07:Math.abs(Math.abs(x)-(.43+(y-8)*.12))<.11&&(ch.mark!==4||y<8.08)),m,.0018)}
 return {body,arms:[bones[1],bones[4]],legs:[bones[7],bones[10]],hand,skinMat,mesh,skeleton,animate,dispose(){for(const g of ownG)g.dispose();for(const m of ownM)m.dispose();skeleton.dispose()}};
}
