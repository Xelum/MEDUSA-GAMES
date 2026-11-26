// Directional melee hit volume: no pixel-perfect aiming and no hits behind the player.
export function createCombatAim(T){
 const ray=new T.Raycaster(),box=new T.Box3();
 function pick({origin,yaw,weapon,targets,blockers,height,blocked=()=>false}){
  const range=weapon==='spear'?3.25:weapon?.endsWith('sword')?2.85:weapon?.endsWith('pickaxe')?2.55:weapon?.endsWith('axe')?2.75:2.15,half=weapon==='spear'?Math.PI/5:Math.PI*.29,fx=Math.sin(yaw),fz=Math.cos(yaw),candidates=[];
  for(const t of targets){if(!t.g?.visible||t.dead||!t.maxHp)continue;const dx=t.x-origin.x,dz=t.z-origin.z,d=Math.hypot(dx,dz);if(d>range+1.5||d<.001||fx*dx+fz*dz<=0)continue;t.g.updateWorldMatrix(true,true);box.setFromObject(t.g);const radius=Math.min(1.2,Math.max(.2,Math.max(box.max.x-box.min.x,box.max.z-box.min.z)*.5));const distance=Math.max(0,d-radius*.65);const angle=Math.acos(Math.max(-1,Math.min(1,(fx*dx+fz*dz)/d)));if(distance>range||angle>half+Math.min(.22,Math.asin(Math.min(.95,radius/d)))||box.min.y>origin.y+1.0||box.max.y<origin.y-1.35)continue;
   const point=new T.Vector3(t.x,Math.max(box.min.y+.02,Math.min(box.max.y-.02,origin.y)),t.z);candidates.push({target:t,point,score:distance+angle*.7})}
  candidates.sort((a,b)=>a.score-b.score);
  for(const c of candidates){const delta=c.point.clone().sub(origin),d=delta.length();if(d<.001)continue;let obstruction=false;for(let v=.18;v<d-.18;v+=.18){const q=origin.clone().addScaledVector(delta,v/d);if(blocked(q.x,q.z)||q.y<height(q.x,q.z)-.08){obstruction=true;break}}if(obstruction)continue;ray.set(origin,delta.normalize());ray.near=.05;ray.far=Math.max(.05,d-.22);for(const g of blockers)g.updateWorldMatrix(true,true);if(ray.intersectObjects(blockers.filter(g=>g.visible),true).some(h=>h.object.visible))continue;return {...c,valid:true,reason:''}}
  return null
 }return {pick}
}
