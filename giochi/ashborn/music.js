// Ashborn original instrumental score. No external samples, streams or libraries.
// Three hand-written modal themes, played by a soft plucked-string and flute synthesizer.
const themes={
 home:{bpm:68,root:50,chords:[[0,7,15],[5,12,21],[3,10,17],[7,14,19],[0,7,15],[8,15,19],[5,12,20],[0,7,12]],melody:[[12,15,17,19],[17,15,12,null],[10,12,15,17],[14,12,10,null],[12,15,19,20],[19,17,15,12],[12,10,7,10],[12,null,7,null]]},
 wild:{bpm:72,root:55,chords:[[0,7,16],[5,12,19],[9,16,24],[7,14,17],[0,7,16],[4,11,19],[5,12,21],[0,7,12]],melody:[[12,null,16,19],[17,16,14,null],[16,19,21,19],[14,12,11,null],[12,14,16,19],[19,16,14,11],[12,17,16,14],[12,null,7,null]]},
 depths:{bpm:60,root:48,chords:[[0,7,15],[3,10,17],[5,12,19],[0,7,12],[8,15,19],[3,10,17],[5,12,20],[0,7,12]],melody:[[12,15,null,19],[17,null,15,12],[10,12,17,null],[15,12,null,null],[15,19,20,null],[17,15,10,null],[12,15,17,10],[12,null,7,null]]}
};
const hz=n=>440*Math.pow(2,(n-69)/12);
const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
export function createMusic(){
 let ctx=null,master=null,bus=null,filter=null,delay=null,echo=null,clock=null,next=0,bar=0,theme='home',requested='home',volume=.35,enabled=true,hidden=false,disposed=false,voices=new Set();
 function apply(){if(!ctx)return;const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setTargetAtTime(enabled&&!hidden?volume*.55:0,t,.16)}
 function voice(n,start,dur,amp,type){
  if(!ctx||!Number.isFinite(n)||voices.size>=64)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type==='pluck'?'triangle':'sine';osc.frequency.value=hz(n);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,amp),start+(type==='pluck'?.025:.24));
  if(type==='pluck')gain.gain.exponentialRampToValueAtTime(Math.max(.0002,amp*.24),start+Math.min(.34,dur*.6));
  else gain.gain.setValueAtTime(Math.max(.0002,amp),start+Math.max(.25,dur-.40));
  gain.gain.exponentialRampToValueAtTime(.0001,start+dur);
  osc.connect(gain);gain.connect(bus);voices.add(osc);osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};osc.start(start);osc.stop(start+dur+.03);
 }
 function schedule(){
  if(!ctx||ctx.state!=='running'||!enabled||hidden||volume<=0)return;
  if(next<ctx.currentTime)next=ctx.currentTime+.12;
  while(next<ctx.currentTime+.30){
   if(bar===0)theme=requested;
   const score=themes[theme],beat=60/score.bpm,chord=score.chords[bar],melody=score.melody[bar],base=score.root;
   voice(base+chord[0]-12,next,beat*3.85,.095,'pad');
   voice(base+chord[1],next+.04,beat*3.75,.045,'pad');
   const order=[0,1,2,1,0,2,1,2];
   for(let j=0;j<8;j++){if(j===7&&bar===7)continue;voice(base+chord[order[j]],next+j*beat*.5,beat*.95,j%2?.065:.09,'pluck')}
   for(let j=0;j<4;j++)if(melody[j]!=null)voice(base+melody[j],next+j*beat+.03,beat*.91,.065,'flute');
   bar=(bar+1)%8;next+=beat*4+(bar===0?4.5:0);
  }
 }
 async function unlock(){
  if(disposed||!enabled)return;
  try{
   if(!ctx){
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
    ctx=new Audio();master=ctx.createGain();master.gain.value=0;
    bus=ctx.createGain();bus.gain.value=.72;filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2700;filter.Q.value=.45;
    delay=ctx.createDelay(1);delay.delayTime.value=.29;echo=ctx.createGain();echo.gain.value=.19;
    bus.connect(filter);filter.connect(master);filter.connect(delay);delay.connect(echo);echo.connect(master);echo.connect(delay);master.connect(ctx.destination);
    clock=setInterval(schedule,150);
   }
   if(ctx.state==='suspended')await ctx.resume();apply();schedule();
  }catch{/* Audio failure must never prevent gameplay. */}
 }
 function setTheme(t){if(themes[t])requested=t}
 function setVolume(v,on=true){volume=clamp(v);enabled=!!on;apply()}
 function setHidden(v){hidden=!!v;apply()}
 function dispose(){disposed=true;if(clock!==null)clearInterval(clock);if(ctx){try{ctx.close()?.catch?.(()=>{})}catch{}}}
 return {unlock,setTheme,setVolume,setHidden,dispose};
}
