// Shared appearance schema for the live game and Character Studio.
export const DETAIL_GROUPS=[
 {name:'Viso',items:[['headSize','Dimensione testa','body'],['jawWidth','Larghezza mascella','face'],['chin','Mento','face'],['cheeks','Zigomi','face'],['noseWidth','Larghezza naso','face'],['noseLength','Lunghezza naso','face'],['eyeSpacing','Distanza occhi','face'],['brow','Arcata sopraccigliare','face']]},
 {name:'Fisico',items:[['muscleDetail','Muscolatura','body'],['shoulders','Larghezza spalle','body'],['chest','Volume torace','body'],['waist','Larghezza vita','body'],['legWidth','Spessore gambe','body'],['stature','Statura fine','body']]},
 {name:'Dettagli',items:[['skinTone','Tonalità della pelle','face'],['hairTone','Tonalità capelli','face'],['beardLength','Lunghezza barba','face'],['hairLength','Lunghezza capelli','face'],['paintStrength','Intensità pitture','face']]}
];
export const DETAILS=DETAIL_GROUPS.flatMap(g=>g.items);
export const DETAIL_DEFAULTS=Object.fromEntries(DETAILS.map(([k])=>[k,0]));
export const LOOK_PRESETS={
 explorer:{name:'Esploratore',hair:2,beard:1,build:0,face:2,mark:0,outfit:2,shoulders:-20,waist:-15,stature:15},
 warrior:{name:'Guerriero',hair:3,beard:3,build:2,face:1,mark:1,outfit:1,shoulders:45,jawWidth:35,muscleDetail:30,chest:25},
 elder:{name:'Anziano del clan',hair:5,beard:2,hairColor:4,build:1,face:2,mark:2,outfit:0,cheeks:30,chin:15,beardLength:55,hairLength:20}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function normalizeDetails(ch){const out={...ch};for(const [k] of DETAILS)out[k]=Number.isFinite(out[k])?clamp(Math.round(out[k]),-100,100):0;return out}
export function detail(ch,k){return clamp(Number(ch[k])||0,-100,100)/100}
export function heightScale(ch){return ([.92,1,1.09][ch.height]||1)*(1+detail(ch,'stature')*.045)}
export function appearanceColors(T,ch,skin,hair){return {skin:new T.Color(skin).lerp(new T.Color(detail(ch,'skinTone')>=0?0xecc59e:0x67432e),Math.abs(detail(ch,'skinTone'))*.32),hair:new T.Color(hair).lerp(new T.Color(detail(ch,'hairTone')>=0?0xbfa68b:0x11100f),Math.abs(detail(ch,'hairTone'))*.34)}}
export function applyPreset(ch,key){const {name,...preset}=LOOK_PRESETS[key]||{};return normalizeDetails({...ch,...DETAIL_DEFAULTS,...preset})}
export function randomDetails(ch){for(const [k] of DETAILS)ch[k]=Math.round((Math.random()-.5)*105);return ch}
export function mountDetails(parent,ch,onChange){parent.replaceChildren();for(const group of DETAIL_GROUPS){const section=document.createElement('details');section.className='detail-section';section.open=group.name==='Viso';const summary=document.createElement('summary');summary.textContent=group.name+' · '+group.items.length+' regolazioni';section.append(summary);for(const [key,title,focus] of group.items){const label=document.createElement('label');label.className='morph-row';const row=document.createElement('span');row.textContent=title;const output=document.createElement('output');output.dataset.detailValue=key;row.append(output);const input=document.createElement('input');input.type='range';input.min=-100;input.max=100;input.step=5;input.dataset.detailKey=key;input.setAttribute('aria-label',title);input.value=ch[key]||0;output.textContent=input.value;input.addEventListener('input',()=>{output.textContent=input.value;onChange(key,Number(input.value),focus)});label.append(row,input);section.append(label)}parent.append(section)}}
export function syncDetails(parent,ch){for(const input of parent.querySelectorAll('[data-detail-key]'))input.value=ch[input.dataset.detailKey]||0;for(const output of parent.querySelectorAll('[data-detail-value]'))output.textContent=ch[output.dataset.detailValue]||0}
