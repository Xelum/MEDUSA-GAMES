// Aimed melee: first visible mesh along the reticle, range and line of sight.
export function createCombatAim(T){
 const viewRay=new T.Raycaster(),reachRay=new T.Raycaster(),center=new T.Vector2(0,0);
 function visibleHit(ray,groups,owners){for(const hit of ray.intersectObjects(groups,true)){let o=hit.object,ok=true;while(o){if(!o.visible){ok=false;break}if(owners.has(o))break;o=o.parent}if(ok&&owners.has(o))return {...hit,owner:owners.get(o)}}return null}
 function terrainBlocks(origin,direction,distance,height){for(let d=.14;d<distance-.10;d+=.16){const x=origin.x+direction.x*d,y=origin.y+direction.y*d,z=origin.z+direction.z*d;if(y<height(x,z)-.035)return true}return false}
 function pick({camera,origin,yaw,range,targets,blockers,height}){
  camera.updateMatrixWorld(true);const owners=new Map(),groups=[];
  for(const t of targets){if(!t.g?.visible||t.dead||!t.maxHp)continue;owners.set(t.g,t);groups.push(t.g)}
  for(const g of blockers){if(!g?.visible||owners.has(g))continue;owners.set(g,null);groups.push(g)}
  for(const g of groups)g.updateWorldMatrix(true,true);
  viewRay.setFromCamera(center,camera);viewRay.near=0;viewRay.far=camera.position.distanceTo(origin)+range+2;
  const hit=visibleHit(viewRay,groups,owners);
  if(!hit||!hit.owner||terrainBlocks(viewRay.ray.origin,viewRay.ray.direction,hit.distance,height))return null;
  const t=hit.owner,delta=hit.point.clone().sub(origin),dist=delta.length(),horizontal=Math.hypot(delta.x,delta.z);
  if(dist>range||horizontal<.05)return {target:t,point:hit.point,valid:false,reason:'Fuori portata'};
  const dir=delta.clone().normalize();
  reachRay.set(origin,dir);reachRay.near=.03;reachRay.far=Math.max(.03,dist-.05);
  const obstacle=visibleHit(reachRay,groups,owners);
  if((obstacle&&obstacle.owner!==t)||terrainBlocks(origin,dir,dist,height))return {target:t,point:hit.point,valid:false,reason:'Bersaglio coperto'};
  const facing=(Math.sin(yaw)*delta.x+Math.cos(yaw)*delta.z)/horizontal;
  if(facing<.35)return {target:t,point:hit.point,valid:false,reason:'Girati verso il bersaglio'};
  return {target:t,point:hit.point,valid:true,reason:''}
 }
 return {pick};
}
