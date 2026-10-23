// Attachement Pro — modèle, contrôles et règles de gestion sans accès au réseau.
export const APP_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
export const clone = value => JSON.parse(JSON.stringify(value));
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatDate = value => { if(!value) return 'Non renseigné'; const d = new Date(String(value).length===10 ? `${value}T12:00:00` : value); return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('fr-FR'); };
export const formatDateTime = value => !value ? '' : new Date(value).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'});
export const formatBytes = n => n < 1024*1024 ? `${Math.round(n/1024)} Ko` : `${(n/1024/1024).toFixed(1)} Mo`;
export const defaults = () => ({organization:'',author:'',role:'',authorOrganization:'',productionUnit:'',email:'',theme:'light',photoQuality:'standard',lastBackupAt:'',showArchived:false,version:1});
const DOCUMENT_TYPES = ['initial','rectificatif','abrogatoire'];
const COMPANY_RESPONSES = ['pending','accepted','reserves','refused','absent'];
const PROCEDURE_PURPOSES = ['convocation','pv','observations','signedCopy','dispatch'];
const META_DATES = ['initiativeDate','companyRequestDate','factDate','factEndDate','hiddenBefore','constatDate','invitationDate'];
const META_TIMES = ['factStartTime','factEndTime','constatTime'];
const DATE_LABELS = {initiativeDate:'initiative',companyRequestDate:'réception de la demande',factDate:'début du fait',factEndDate:'fin du fait',hiddenBefore:'recouvrement ou disparition',constatDate:'constatation',invitationDate:'convocation',presentationDate:'présentation',notifiedDate:'notification',observationsDate:'réception des observations',dispatchDate:'transmission',pvDate:'procès-verbal',humanDecisionDate:'décision de suivi',acceptanceDate:'acceptation'};
const TIME_LABELS = {factStartTime:'début du fait',factEndTime:'fin du fait',constatTime:'constatation'};
const textPresent = value => typeof value === 'string' && value.trim().length > 0;
const plainObject = value => !!value && typeof value === 'object' && !Array.isArray(value) && [Object.prototype,null].includes(Object.getPrototypeOf(value));
function validDate(value) {
 if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
 const d = new Date(`${value}T12:00:00Z`);
 return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value;
}
function validTime(value) { return typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value); }
function validTimestamp(value) { return typeof value === 'string' && validDate(value.slice(0,10)) && /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value) && Number.isFinite(Date.parse(value)); }
export function addDays(date,days) {
 if(!validDate(date) || !Number.isInteger(days)) return '';
 const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()+days);
 if(!Number.isFinite(d.getTime())) return '';
 const result = d.toISOString().slice(0,10); return validDate(result) ? result : '';
}
export function daysBetween(a,b) { return validDate(a) && validDate(b) ? Math.round((Date.parse(`${b}T12:00:00Z`)-Date.parse(`${a}T12:00:00Z`))/86400000) : NaN; }
export function newRecord(settings={},project={}) {
 const now=new Date().toISOString();
 const r={schemaVersion:SCHEMA_VERSION,id:uid(),createdAt:now,updatedAt:now,state:'draft',number:null,scopeNumber:undefined,projectId:project.id||'',documentType:'initial',relatedId:'',relatedNumber:'',relatedDate:'',changeReason:'',archived:false,lockedAt:'',contentHash:'',
 meta:{commandNumber:project.commandNumber||'',enterprise:project.enterprise||'',marketObject:project.marketObject||'',operation:project.name||'',location:project.location||'',line:project.line||'',track:'',pkStart:'',pkEnd:'',framework:false,executionOrder:'',productionUnit:settings.productionUnit||'',numberByLot:false,contractLot:'',author:settings.author||'',authorRole:settings.role||'',authorOrganization:settings.organization||'',initiatedBy:'moe',initiativeDate:today(),companyRequestDate:'',companyRequestReference:'',factDate:today(),factEndDate:'',factStartTime:'',factEndTime:'',title:'',description:'',conditions:'',category:'',hiddenWorks:false,hiddenBefore:'',constatDate:'',constatTime:'',invitationDate:'',invitationChannel:'',invitationReference:'',convocationConfirmed:false,exceptionRequest:'',designationReference:''},
 measurements:[],participants:[],evidence:[],
 followUp:{presentationDate:'',notifiedDate:'',refusalReason:'',reservations:'',observations:'',observationsDate:'',dispatchDate:'',dispatchMethod:'',dispatchReference:'',recipients:'',companyResponse:'pending',pvReference:'',pvDate:'',pvCircumstances:'',humanDecision:'',humanDecisionDate:'',humanDecisionAuthor:'',acceptanceDate:'',dispatchMoe:false,dispatchEnterprise:false,dispatchMarket:false,procedureFiles:[]},
 signatures:{moe:blankSignature(),enterprise:blankSignature()},journal:[]};
 addEvent(r,'creation','Création du brouillon'); return r;
}
export const blankSignature=()=>({name:'',role:'',habilitation:'',date:'',dataUrl:'',ack:false,versionHash:''});
export function addEvent(record,kind,text) { record.journal ||= []; record.journal.push({id:uid(),at:new Date().toISOString(),kind,text}); }
export function scopeKey(record) { const m=record.meta; return JSON.stringify([m.commandNumber.trim().toUpperCase(),m.framework?m.executionOrder.trim().toUpperCase():'',m.framework?m.productionUnit.trim().toUpperCase():'',m.numberByLot?m.contractLot.trim().toUpperCase():'']); }
export function nextNumber(record,records) { const scope=scopeKey(record); return 1+Math.max(0,...records.filter(x=>x.number&&scopeKey(x)===scope).map(x=>Number(x.number)||0)); }
export function numberLabel(r) { return r.number?`N° ${r.number}`:'Brouillon'; }
export function status(r) {
 if(r.archived) return {label:'Archivé',tone:'gray'};
 if(r.state==='draft') return {label:'Brouillon',tone:'amber'};
 if(r.followUp.companyResponse==='refused') return {label:'Refus de signer',tone:'red'};
 if(r.followUp.companyResponse==='reserves') return {label:'Avec réserves',tone:'amber'};
 if(r.followUp.companyResponse==='absent') return {label:'Entreprise absente',tone:'amber'};
 if(r.followUp.dispatchDate) return {label:'Transmis',tone:'teal'};
 if(r.signatures.moe.dataUrl&&r.signatures.enterprise.dataUrl) return {label:'Signé des deux parties',tone:'teal'};
 return {label:'Établi · à suivre',tone:'blue'};
}
export function deadlines(record,day=today()) {
 const f=record.followUp,m=record.meta,out=[];
 const put=(type,label,start,days,complete,source)=>{if(!start||complete)return;const due=addDays(start,days),remaining=daysBetween(day,due);if(!due||!Number.isFinite(remaining))return;out.push({type,label,due,remaining,tone:remaining<0?'red':remaining<=2?'amber':'teal',source});};
 put('constat','Constat demandé par l’entreprise',m.companyRequestDate,7,m.constatDate,'RGF00099 p. 34 et 36');
 if(['refused','reserves'].includes(f.companyResponse)) put('observations','Observations écrites du Titulaire',f.presentationDate,10,f.observationsDate,'RGF00099 p. 36');
 const signatureDates=[record.signatures.moe.date,record.signatures.enterprise.date].filter(validDate).sort();
 put('transmission','Transmission de l’attachement',signatureDates[0],7,f.dispatchDate&&f.dispatchMoe&&f.dispatchEnterprise&&f.dispatchMarket,'RGF00099 p. 37');
 if(m.hiddenWorks&&validDate(m.hiddenBefore)&&validDate(day)&&record.state==='draft') {const remaining=daysBetween(day,m.hiddenBefore);out.push({type:'hidden',label:'Constater avant recouvrement / disparition',due:m.hiddenBefore,remaining,tone:remaining<0?'red':'amber',source:'RGF00099 p. 34'});}
 return out;
}
export function validateRecord(r,categories=[]) {
 const errors=[],warnings=[];
 if(!plainObject(r)||!plainObject(r.meta)||!plainObject(r.followUp)||!Array.isArray(r.participants)||!Array.isArray(r.measurements)||!Array.isArray(r.evidence))return {errors:[{text:'Structure de document invalide. Restaurer une sauvegarde valide.',step:'cadre'}],warnings,score:0};
 const m=r.meta;
 if(!DOCUMENT_TYPES.includes(r.documentType))errors.push({text:'Type d’attachement non reconnu.',step:'cadre'});
 if(!['moe','enterprise'].includes(m.initiatedBy))errors.push({text:'Initiative de l’attachement non reconnue.',step:'cadre'});
 if(!COMPANY_RESPONSES.includes(r.followUp.companyResponse))errors.push({text:'Position de l’entreprise non reconnue.',step:'suivi'});
 for(const key of META_DATES)if(m[key]!==''&&m[key]!==undefined&&!validDate(m[key]))errors.push({text:`Date de ${DATE_LABELS[key]} invalide : choisir une date réelle.`,step:['factDate','factEndDate','hiddenBefore'].includes(key)?'faits':'contradictoire'});
 for(const key of META_TIMES)if(m[key]!==''&&m[key]!==undefined&&!validTime(m[key]))errors.push({text:`Horaire de ${TIME_LABELS[key]} invalide : utiliser HH:MM.`,step:key==='constatTime'?'contradictoire':'faits'});
 for(const [key,value] of Object.entries(r.followUp))if(key.endsWith('Date')&&value!==''&&!validDate(value))errors.push({text:`Date de ${DATE_LABELS[key]||'suivi'} invalide.`,step:'suivi'});
 const required=[['commandNumber','Numéro de commande','cadre'],['enterprise','Entreprise titulaire','cadre'],['marketObject','Objet du marché','cadre'],['author','Rédacteur désigné','cadre'],['title','Objet de l’attachement','faits'],['location','Emplacement des travaux','cadre'],['factDate','Date du fait','faits'],['description','Description factuelle','faits'],['constatDate','Date de la constatation','contradictoire']];
 for(const [key,label,step] of required)if(!String(m[key]||'').trim())errors.push({text:`${label} à renseigner.`,step});
 if(/\[\s*[àa]\s+compl[ée]ter\s*\]/iu.test(m.description||''))errors.push({text:'La description contient encore « [À compléter] ». Remplacer chaque repère par des faits constatés ou retirer la rubrique inutile.',step:'faits'});
 if(m.framework&&(!textPresent(m.executionOrder)||!textPresent(m.productionUnit)))errors.push({text:'Accord-cadre : préciser l’ordre d’exécution / bon de commande et l’unité de production.',step:'cadre'});
 if(m.numberByLot&&!textPresent(m.contractLot))errors.push({text:'Numérotation par lot : préciser le lot adopté.',step:'cadre'});
 if(r.documentType!=='initial'&&(!r.relatedId||!textPresent(r.changeReason)))errors.push({text:'Indiquer l’attachement d’origine et le motif de rectification / abrogation.',step:'cadre'});
 if(!r.participants.some(p=>p?.party==='moe'&&p.present===true&&textPresent(p.name)))errors.push({text:'Nommer le représentant de la maîtrise d’œuvre présent au constat.',step:'contradictoire'});
 const absent=r.followUp.companyResponse==='absent';
 if(!absent&&!r.participants.some(p=>p?.party==='enterprise'&&p.present===true&&textPresent(p.name)))errors.push({text:'Nommer le représentant de l’entreprise présent, ou consigner son absence.',step:'contradictoire'});
 if(absent&&r.participants.some(p=>p?.party==='enterprise'&&p.present===true))errors.push({text:'L’entreprise ne peut pas être déclarée absente si un représentant est indiqué présent.',step:'contradictoire'});
 if(!m.invitationDate||!m.invitationChannel||!m.invitationReference)errors.push({text:'Tracer la convocation : date, moyen et référence de preuve.',step:'contradictoire'});
 if(absent&&!m.convocationConfirmed)errors.push({text:'Confirmer la vérification de la convocation et de l’absence de représentant.',step:'contradictoire'});
 const cat=categories.find(c=>c.id===m.category);
 if(cat?.initiative==='B'&&m.initiatedBy!=='enterprise')errors.push({text:'Cette catégorie est prévue à la demande du Titulaire. Renseigner cette demande.',step:'faits'});
 if(cat?.initiative==='EXCLUDED'&&!textPresent(m.exceptionRequest))errors.push({text:'Ce cas relève normalement d’un autre document. Tracer l’exigence expresse du Titulaire avant de poursuivre.',step:'faits'});
 if(m.initiatedBy==='enterprise'&&!m.companyRequestDate)errors.push({text:'Renseigner la date de réception de la demande de l’entreprise.',step:'cadre'});
 const factStrings=[m.title,m.description,m.conditions,r.changeReason,...r.measurements.flatMap(x=>[x?.designation,x?.note,x?.dimensions]),...r.evidence.map(x=>x?.caption)];
 if(factStrings.some(s=>/force\s+majeure/i.test(s||'')))errors.push({text:'Remplacer la qualification « force majeure » par une description des faits et de leurs conséquences observées (p. 39).',step:'faits'});
 if(factStrings.some(s=>/(?:\d[\d .,]*\s*(?:€|euros?)\b|\b(?:indemnisable|responsabilité|dédommagement)\b)/i.test(s||'')))warnings.push({text:'Relire les qualifications et mentions financières : l’attachement constate des faits, sans interprétation ni calcul de règlement.',step:'faits'});
 if(m.factEndDate&&m.factEndDate<m.factDate)errors.push({text:'La fin du fait précède son début.',step:'faits'});
 if(m.constatDate&&m.factDate&&m.constatDate<m.factDate)errors.push({text:'La date de constat précède la date du fait.',step:'contradictoire'});
 if(m.invitationDate&&m.constatDate&&m.invitationDate>m.constatDate)warnings.push({text:'La convocation est postérieure à la constatation : vérifier la chronologie et expliquer les circonstances.',step:'contradictoire'});
 if(m.hiddenWorks&&!m.hiddenBefore)warnings.push({text:'Préciser la date prévue de recouvrement / disparition pour surveiller le constat.',step:'faits'});
 if(m.hiddenWorks&&m.hiddenBefore&&m.constatDate&&m.constatDate>m.hiddenBefore)warnings.push({text:'Constat après la date prévue de disparition : vérifier que les faits étaient encore observables.',step:'faits'});
 if(!r.evidence.length)warnings.push({text:'Aucune pièce jointe : ajouter des photos commentées ou un croquis si utile à la preuve.',step:'pieces'});
 if(r.evidence.some(x=>!textPresent(x?.caption)))warnings.push({text:'Certaines pièces n’ont pas de légende descriptive.',step:'pieces'});
 for(const q of r.measurements) {
  if(!plainObject(q)){errors.push({text:'Une ligne de relevé a une structure invalide.',step:'mesures'});continue;}
  if(!textPresent(q.designation))errors.push({text:'Une ligne de relevé n’a pas de désignation.',step:'mesures'});
  if(q.quantity!==''&&!/^-?\d+(?:[.,]\d+)?$/.test(String(q.quantity).replace(/\s/g,'')))errors.push({text:`Quantité non numérique pour « ${q.designation||'ligne sans nom'} ». Saisir un relevé, pas une formule.`,step:'mesures'});
  if(q.quantity!==''&&!textPresent(q.unit))errors.push({text:`Préciser l’unité pour « ${q.designation||'ligne sans nom'} ».`,step:'mesures'});
 }
 if(['refused','reserves'].includes(r.followUp.companyResponse)&&!r.followUp.pvReference)warnings.push({text:'Un PV de présentation doit être établi et annexé pour le refus ou les réserves.',step:'suivi'});
 return {errors,warnings,score:Math.round((required.length-required.filter(([key])=>!String(m[key]||'').trim()).length)/required.length*100)};
}
function canonical(v) { if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])]));return v; }
export function contentPayload(r) { return canonical({id:r.id,number:r.number,documentType:r.documentType,relatedId:r.relatedId,relatedNumber:r.relatedNumber,relatedDate:r.relatedDate,changeReason:r.changeReason,meta:r.meta,measurements:r.measurements,participants:r.participants,evidence:r.evidence}); }
export async function hashContent(r) { if(!globalThis.crypto?.subtle)throw new Error('Le scellement local nécessite HTTPS ou localhost.');const b=new TextEncoder().encode(JSON.stringify(contentPayload(r)));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join(''); }
export function makeCorrection(source,kind,settings={}) { if(!DOCUMENT_TYPES.includes(kind))throw new Error('Type d’attachement non reconnu.');const r=clone(source);r.id=uid();r.state='draft';r.number=null;delete r.scopeNumber;r.documentType=kind;r.relatedId=source.id;r.relatedNumber=source.number;r.relatedDate=source.lockedAt?.slice(0,10)||source.meta.constatDate;r.changeReason='';r.createdAt=r.updatedAt=new Date().toISOString();r.archived=false;r.lockedAt='';r.contentHash='';r.signatures={moe:blankSignature(),enterprise:blankSignature()};r.followUp=newRecord(settings).followUp;r.participants=r.participants.map(p=>({...p,present:false,absenceReason:''}));r.journal=[];r.meta.constatDate='';r.meta.constatTime='';r.meta.invitationDate='';r.meta.invitationReference='';r.meta.convocationConfirmed=false;r.meta.author=settings.author||source.meta.author;if(kind==='abrogatoire'){r.meta.title=`Abrogation de l’attachement n° ${source.number}`;r.meta.description='';r.measurements=[];r.evidence=[];}addEvent(r,'creation',`Création d’un attachement ${kind} lié au n° ${source.number}`);return r; }
export function duplicateRecord(source,settings={}) { const r=makeCorrection(source,'initial',settings);r.relatedId='';r.relatedNumber='';r.relatedDate='';r.meta.title=`${source.meta.title} — copie`;r.meta.factDate=today();r.meta.factEndDate='';r.journal=[];addEvent(r,'creation','Nouveau brouillon créé à partir d’une copie');return r; }
export function parseQuantity(value){const n=Number(String(value).replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:null;}
function mediaHeader(value,pattern) {
 if(typeof value!=='string'||value.length>36*1024*1024)return null;
 const match=pattern.exec(value);if(!match)return null;
 const encoded=value.slice(match[0].length).replace(/[\r\n]/g,'');
 if(!encoded||encoded.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded))return null;
 try{return {mime:match[1],header:atob(encoded.slice(0,24))};}catch{return null;}
}
export function isRasterData(value) {
 const data=mediaHeader(value,/^data:(image\/(?:png|jpeg|webp));base64,/);if(!data)return false;
 if(data.mime==='image/png')return data.header.startsWith('\x89PNG\r\n\x1a\n');
 if(data.mime==='image/jpeg')return data.header.startsWith('\xff\xd8\xff');
 return data.header.startsWith('RIFF')&&data.header.slice(8,12)==='WEBP';
}
export function isPDFData(value) { const data=mediaHeader(value,/^data:(application\/pdf);base64,/);return !!data&&data.header.startsWith('%PDF-'); }
function checkMediaList(items,{procedure=false}={}) {
 if(!Array.isArray(items)||items.length>200)throw new Error('Liste de pièces jointe invalide ou trop volumineuse.');
 const ids=new Set();
 for(const item of items){
  if(!plainObject(item)||!textPresent(item.id)||ids.has(item.id)||typeof item.caption!=='string'||!['photo','sketch','document'].includes(item.type))throw new Error('Structure de pièce jointe invalide (identifiant, type ou légende).');
  ids.add(item.id);
  if(!textPresent(item.name)&&!textPresent(item.filename))throw new Error('Nom de pièce jointe invalide.');
  if(item.type==='document'?!isPDFData(item.dataUrl):!isRasterData(item.dataUrl))throw new Error('Pièce jointe de format non pris en charge ou contenu invalide.');
  if(procedure&&!PROCEDURE_PURPOSES.includes(item.purpose))throw new Error('Type de pièce de procédure non reconnu.');
  for(const key of ['name','filename','caption','date','location','mime','originalName'])if(item[key]!==undefined&&typeof item[key]!=='string')throw new Error(`Champ de pièce jointe invalide : ${key}.`);
  if(item.date&&!validDate(item.date))throw new Error('Date de pièce jointe invalide.');
  if(item.mime&&!item.dataUrl.startsWith(`data:${item.mime};base64,`))throw new Error('Format déclaré de la pièce différent de son contenu.');
  for(const key of ['width','height','size','originalSize'])if(item[key]!==undefined&&(!Number.isFinite(item[key])||item[key]<0))throw new Error(`Champ numérique de pièce jointe invalide : ${key}.`);
 }
}
export function checkBackup(data) {
 if(!plainObject(data)||data.app!=='attachement-pro'||data.schemaVersion!==1||!Array.isArray(data.documents)||!Array.isArray(data.projects)||!plainObject(data.settings))throw new Error('Ce fichier n’est pas une sauvegarde Attachement Pro version 1.');
 if(data.documents.length>10000||data.projects.length>2000)throw new Error('Sauvegarde trop volumineuse.');
 const ids=new Set(),numberedScopes=new Set(),baseline=newRecord();
 for(const r of data.documents){
  if(!plainObject(r)||!textPresent(r.id)||ids.has(r.id)||!['draft','established'].includes(r.state)||!plainObject(r.meta)||!plainObject(r.signatures)||!plainObject(r.followUp)||!Array.isArray(r.measurements)||!Array.isArray(r.evidence)||!Array.isArray(r.participants)||!Array.isArray(r.journal))throw new Error('Structure de document invalide ou identifiant répété.');
  ids.add(r.id);
  if(r.schemaVersion!==SCHEMA_VERSION||!DOCUMENT_TYPES.includes(r.documentType)||typeof r.archived!=='boolean')throw new Error('Version ou type de document invalide.');
  for(const key of ['id','projectId','relatedId','relatedDate','changeReason','lockedAt','contentHash','createdAt','updatedAt'])if(typeof r[key]!=='string')throw new Error(`Champ de document invalide : ${key}.`);
  if(!validTimestamp(r.createdAt)||!validTimestamp(r.updatedAt)||(r.lockedAt&&!validTimestamp(r.lockedAt))||(r.relatedDate&&!validDate(r.relatedDate)))throw new Error('Date de document invalide.');
  if(r.relatedNumber!==''&&!(Number.isSafeInteger(r.relatedNumber)&&r.relatedNumber>0))throw new Error('Numéro de document d’origine invalide.');
  for(const k of Object.keys(baseline.meta)){if(typeof r.meta[k]!==typeof baseline.meta[k])throw new Error(`Champ de cadre invalide : ${k}.`);}
  if(!['moe','enterprise'].includes(r.meta.initiatedBy))throw new Error('Initiative de document invalide.');
  for(const key of META_DATES)if(r.meta[key]&&!validDate(r.meta[key]))throw new Error(`Date de cadre invalide : ${key}.`);
  for(const key of META_TIMES)if(r.meta[key]&&!validTime(r.meta[key]))throw new Error(`Horaire de cadre invalide : ${key}.`);
  for(const [key,value] of Object.entries(baseline.followUp)){
   if(key==='procedureFiles')continue;
   if(typeof r.followUp[key]!==typeof value)throw new Error(`Champ de suivi invalide : ${key}.`);
   if(key.endsWith('Date')&&r.followUp[key]&&!validDate(r.followUp[key]))throw new Error(`Date de suivi invalide : ${key}.`);
  }
  if(!COMPANY_RESPONSES.includes(r.followUp.companyResponse))throw new Error('Position de l’entreprise non reconnue.');
  for(const party of ['moe','enterprise']){
   const s=r.signatures[party];
   if(!plainObject(s))throw new Error('Structure de signature invalide.');
   for(const [key,value] of Object.entries(blankSignature()))if(typeof s[key]!==typeof value)throw new Error(`Champ de signature invalide : ${key}.`);
   if((s.dataUrl&&!isRasterData(s.dataUrl))||(s.date&&!validDate(s.date))||(s.versionHash&&!/^[a-f0-9]{64}$/.test(s.versionHash)))throw new Error('Image, date ou empreinte de signature invalide.');
  }
  checkMediaList(r.evidence);checkMediaList(r.followUp.procedureFiles,{procedure:true});
  const participantIds=new Set(),measurementIds=new Set();
  for(const p of r.participants){
   if(!plainObject(p)||!textPresent(p.id)||participantIds.has(p.id)||typeof p.name!=='string'||typeof p.present!=='boolean'||!['moe','enterprise','other'].includes(p.party))throw new Error('Structure de participant invalide.');
   participantIds.add(p.id);
   for(const key of ['role','company','habilitation','absenceReason'])if(p[key]!==undefined&&typeof p[key]!=='string')throw new Error(`Champ de participant invalide : ${key}.`);
  }
  for(const q of r.measurements){
   if(!plainObject(q)||!textPresent(q.id)||measurementIds.has(q.id)||typeof q.designation!=='string'||typeof q.unit!=='string'||!(typeof q.quantity==='string'||Number.isFinite(q.quantity)))throw new Error('Structure de relevé invalide.');
   measurementIds.add(q.id);
   for(const key of ['dimensions','note','location'])if(q[key]!==undefined&&typeof q[key]!=='string')throw new Error(`Champ de relevé invalide : ${key}.`);
  }
  if(r.followUp.companyResponse==='absent'&&r.participants.some(p=>p.party==='enterprise'&&p.present))throw new Error('Présence d’un représentant incompatible avec l’absence de l’entreprise.');
  for(const event of r.journal)if(!plainObject(event)||!textPresent(event.id)||!validTimestamp(event.at)||typeof event.kind!=='string'||typeof event.text!=='string')throw new Error('Structure du journal de suivi invalide.');
  if(r.state==='established'&&(!Number.isSafeInteger(r.number)||r.number<1||!/^[a-f0-9]{64}$/.test(r.contentHash||'')))throw new Error('Un document établi ne possède pas de numéro ou d’empreinte valide.');
  if(r.state==='draft'&&r.number!==null)throw new Error('Un brouillon ne doit pas porter de numéro établi.');
  if(r.state==='established'){
   const key=`${scopeKey(r)}:${r.number}`;
   if(numberedScopes.has(key))throw new Error('Doublon de numéro d’attachement dans la même portée de commande.');
   numberedScopes.add(key);
  }
  if(r.measurements.length>1000||r.participants.length>100||r.journal.length>20000)throw new Error('Le document dépasse les limites prises en charge.');
 }
 const projectIds=new Set();
 for(const p of data.projects){
  if(!plainObject(p)||!textPresent(p.id)||projectIds.has(p.id))throw new Error('Structure de projet invalide ou identifiant répété.');
  projectIds.add(p.id);
  for(const key of ['name','commandNumber','enterprise','marketObject','location','line','productionUnit'])if(p[key]!==undefined&&typeof p[key]!=='string')throw new Error(`Champ de projet invalide : ${key}.`);
 }
 for(const [key,value] of Object.entries(defaults()))if(data.settings[key]!==undefined&&typeof data.settings[key]!==typeof value)throw new Error(`Paramètre invalide : ${key}.`);
 return data;
}
const toBase64 = data => {let s='';for(let i=0;i<data.length;i+=32768)s+=String.fromCharCode(...data.subarray(i,i+32768));return btoa(s);};
const fromBase64 = str => Uint8Array.from(atob(str),c=>c.charCodeAt(0));
async function encryptionKey(password,salt,usage) {const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,[usage]);}
export async function encryptBackup(data,password){if(password.length<10)throw new Error('Utiliser un mot de passe d’au moins 10 caractères.');const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await encryptionKey(password,salt,'encrypt');const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(data)));return {app:'attachement-pro-encrypted',version:1,kdf:'PBKDF2-SHA256',iterations:310000,salt:toBase64(salt),iv:toBase64(iv),ciphertext:toBase64(new Uint8Array(encrypted))};}
export async function decryptBackup(data,password){if(data.version!==1||data.iterations!==310000)throw new Error('Format chiffré non reconnu.');try{const key=await encryptionKey(password,fromBase64(data.salt),'decrypt');const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(data.iv)},key,fromBase64(data.ciphertext));return JSON.parse(new TextDecoder().decode(decoded));}catch{throw new Error('Mot de passe incorrect ou sauvegarde altérée.');}}
