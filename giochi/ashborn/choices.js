// Compact player-facing character choices. Existing option indices remain compatible.
export const LABELS={
 skin:['Chiara','Olivasta','Bruna','Scura','Avorio','Dorata','Ramata','Ebano'],
 hair:['Rasati','Corti','Lunghi','Coda','Cresta','Doppia treccia','Nodo alto','Alle spalle','Sfumati con cresta','Treccia singola'],
 beard:['Rasato','Corta','Lunga','Da guerriero','Baffi','Pizzetto','Barba di tre giorni','A punta'],
 build:['Asciutta','Atletica','Robusta','Snella','Massiccia','Muscolosa'],
 eyes:['Castani','Verdi','Azzurri','Grigi','Ambra','Nocciola','Blu profondo','Verde ghiaccio'],
 hairColor:['Castano','Nero','Ramato','Biondo','Grigio','Castano chiaro','Rosso scuro','Argento','Biondo cenere'],
 face:['Regolare','Squadrato','Affilato','Mascella larga','Zigomi alti','Naso aquilino','Volto stretto','Lineamenti marcati'],
 mark:['Nessuno','Cicatrice','Pittura blu','Pittura rossa','Pittura verde','Striscia nera','Pittura bianca','Cicatrice al sopracciglio','Doppia striscia','Simbolo rituale'],
 height:['Basso','Medio','Alto','Molto basso','Medio-basso','Medio-alto','Molto alto'],
 outfit:['Cuoio selvaggio','Cuoio scuro','Cuoio muschio','Cuoio rosso','Lino grezzo','Pelle di cervo','Cuoio cenere','Pelle delle dune']
};
export const SKINS=[0xe2b58e,0xbf8e61,0x895a3c,0x5b392b,0xf0cbb0,0xcfa36d,0xa36a48,0x3b2520];
export const HAIRS=[0x3b281d,0x211c1a,0x8c5833,0xc0a16b,0xa1a4a1,0x74523a,0x672c20,0xc5c5bd,0x99866d];
export const EYES=[0x60422b,0x547548,0x668fa9,0x858f95,0xad7738,0x82713d,0x344f7f,0x79a49a];
export const OUTFITS=[0x634329,0x514035,0x514a31,0x704337,0x9e8b68,0x9b6d43,0x555654,0xb0915b];
export const HEIGHTS=[.92,1,1.09,.86,.96,1.045,1.14];
export const MUSCLES=[.12,.57,.96,.03,.90,1.15];
const BODY=[{},{},{},{shoulders:-40,waist:-45,chest:-25,legWidth:-25},{shoulders:65,waist:65,chest:60,legWidth:60},{shoulders:65,waist:-30,chest:45,legWidth:25}];
const FACE=[{},{},{},{jawWidth:80,chin:40},{cheeks:85,jawWidth:-25},{noseLength:90,noseWidth:20},{headSize:-25,jawWidth:-65,eyeSpacing:-30},{jawWidth:50,cheeks:55,brow:80,chin:35}];
export function cleanLook(ch,defaults){const out={name:typeof ch?.name==='string'?ch.name.slice(0,20):defaults.name};for(const [k,choices] of Object.entries(LABELS)){const v=ch?.[k];out[k]=Number.isInteger(v)&&v>=0&&v<choices.length?v:defaults[k]??0}return out}
export function variantMorph(ch){return {...ch,...(BODY[ch.build]||{}),...(FACE[ch.face]||{})}}
export function choiceHeight(ch){return HEIGHTS[ch.height]||1}
