// Stable gameplay, adaptive rendering. Neither quality nor frame rate changes world generation.
export function spatialIndex(cell=16){
 const buckets=new Map(),keys=new WeakMap();const key=(x,z)=>Math.floor(x/cell)+','+Math.floor(z/cell);
 return {add(o){const k=key(o.x,o.z);if(keys.has(o))this.remove(o);let set=buckets.get(k);if(!set)buckets.set(k,set=new Set());set.add(o);keys.set(o,k)},remove(o){const k=keys.get(o);if(k===undefined)return;const set=buckets.get(k);set?.delete(o);if(set?.size===0)buckets.delete(k);keys.delete(o)},near(x,z,r){const result=[],rr=r*r;for(let j=Math.floor((z-r)/cell);j<=Math.floor((z+r)/cell);j++)for(let i=Math.floor((x-r)/cell);i<=Math.floor((x+r)/cell);i++){const set=buckets.get(i+','+j);if(!set)continue;for(const o of set)if((o.x-x)**2+(o.z-z)**2<=rr)result.push(o)}return result}}
}
export function createGovernor(initial=1){
 let scale=initial,elapsed=0,frames=0,bad=0,good=0,cooldown=0,fps=60;
 return {reset(){scale=initial;elapsed=frames=bad=good=cooldown=0;fps=60},get scale(){return scale},get fps(){return fps},sample(dt,target=60){if(!Number.isFinite(dt)||dt<=0||dt>.5)return false;elapsed+=dt;frames++;if(elapsed<1.5)return false;fps=frames/elapsed;cooldown=Math.max(0,cooldown-elapsed);elapsed=frames=0;if(fps<target*.82){bad++;good=0}else if(fps>target*.96){good++;bad=0}else{bad=good=0}if(cooldown>0)return false;let next=scale;if(bad>=2)next=Math.max(.62,Math.round((scale-.12)*100)/100);else if(good>=5)next=Math.min(initial,Math.round((scale+.06)*100)/100);if(next===scale)return false;scale=next;bad=good=0;cooldown=4;return true}}
}
