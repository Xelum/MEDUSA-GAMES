// Stable gameplay, adaptive rendering. Neither quality nor frame rate changes world generation.
export function spatialIndex(cell=16){
 const buckets=new Map(),keys=new WeakMap();const key=(x,z)=>Math.floor(x/cell)+','+Math.floor(z/cell);
 return {add(o){const k=key(o.x,o.z);if(keys.has(o))this.remove(o);let set=buckets.get(k);if(!set)buckets.set(k,set=new Set());set.add(o);keys.set(o,k)},remove(o){const k=keys.get(o);if(k===undefined)return;const set=buckets.get(k);set?.delete(o);if(set?.size===0)buckets.delete(k);keys.delete(o)},near(x,z,r){const result=[],rr=r*r;for(let j=Math.floor((z-r)/cell);j<=Math.floor((z+r)/cell);j++)for(let i=Math.floor((x-r)/cell);i<=Math.floor((x+r)/cell);i++){const set=buckets.get(i+','+j);if(!set)continue;for(const o of set)if((o.x-x)**2+(o.z-z)**2<=rr)result.push(o)}return result}}
}
export function createGovernor(initial=1){
 let scale=initial,elapsed=0,frames=0,bad=0,good=0,cooldown=0,fps=60;
 return {reset(){scale=initial;elapsed=frames=bad=good=cooldown=0;fps=60},get scale(){return scale},get fps(){return fps},sample(dt,target=60){if(!Number.isFinite(dt)||dt<=0||dt>.5)return false;elapsed+=dt;frames++;if(elapsed<1.5)return false;fps=frames/elapsed;cooldown=Math.max(0,cooldown-elapsed);elapsed=frames=0;if(fps<target*.82){bad++;good=0}else if(fps>target*.96){good++;bad=0}else{bad=good=0}if(cooldown>0)return false;let next=scale;if(bad>=2)next=Math.max(.62,Math.round((scale-.12)*100)/100);else if(good>=5)next=Math.min(initial,Math.round((scale+.06)*100)/100);if(next===scale)return false;scale=next;bad=good=0;cooldown=4;return true}}
}

// Find a stable exit on dry land. Prefer the actual approach and test an escape corridor,
// not just the center point (which can be technically free but surrounded by rocks).
export function findSafeExit(origin,{clear,height,dry=()=>true,limit=480,forward=0,maxRadius=32}){
 const valid=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&Math.abs(x)<limit-1&&Math.abs(z)<limit-1&&dry(x,z)&&clear(x,z);
 const comfortable=(x,z)=>{if(!valid(x,z))return false;for(let i=0;i<8;i++){const a=i*Math.PI/4;if(!valid(x+Math.sin(a)*.32,z+Math.cos(a)*.32))return false}return true};
 const escape=(x,z)=>{for(let i=0;i<12;i++){const a=forward+i*Math.PI/6,dx=Math.sin(a),dz=Math.cos(a);let y=height(x,z),ok=Number.isFinite(y);for(let j=1;j<=6&&ok;j++){const xx=x+dx*j*.3,zz=z+dz*j*.3,next=height(xx,zz);if(!comfortable(xx,zz)||!Number.isFinite(next)||Math.abs(next-y)>.48)ok=false;y=next}if(ok)return true}return false};
 if(comfortable(origin.x,origin.z)&&escape(origin.x,origin.z))return {x:origin.x,z:origin.z};
 for(const r of [.8,1.5,2.4,3.5,5,7,10,14,20,26,32]){if(r>maxRadius)break;const steps=Math.max(12,Math.ceil(r*3));for(let i=0;i<steps;i++){const a=forward+((i%2?1:-1)*Math.ceil(i/2))*Math.PI*2/steps,x=origin.x+Math.sin(a)*r,z=origin.z+Math.cos(a)*r;if(comfortable(x,z)&&escape(x,z))return{x,z}}}
 return null;
}

// Preserve cadence across slightly late RAF callbacks. On native <= target refresh,
// render each callback instead of dropping a frame because of timer jitter.
export function createFramePacer(){
 let previous=null,deadline=null,cap=0,native=1000/60;
 return {reset(){previous=deadline=null;cap=0;native=1000/60},due(now,target){
  const interval=1000/target,delta=previous===null?interval:now-previous;previous=now;
  if(delta>1&&delta<100)native+=(delta-native)*.12;
  if(target!==cap||deadline===null||delta>250){cap=target;deadline=now+interval;return true}
  if(native>=interval*.91){deadline=now+interval;return true}
  if(now+Math.min(1.5,native*.16)<deadline)return false;
  deadline+=interval;
  if(deadline<now-interval)deadline=now+interval;
  return true;
 }};
}
