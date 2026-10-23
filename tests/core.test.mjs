import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  newRecord, defaults, clone, scopeKey, nextNumber, makeCorrection,
  duplicateRecord, validateRecord, addDays, deadlines, hashContent,
  checkBackup, encryptBackup, decryptBackup, esc,
} from '../dist/js/core.js';
import { CATEGORIES, RULES, FIELD_PROMPTS } from '../dist/js/references.js';

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', {value:webcrypto, configurable:true});
const PNG = 'data:image/png;base64,iVBORw0KGgo=';
function validRecord() {
 const r = newRecord({author:'Alice Martin',role:'Représentante MOE désignée',organization:'MOE test',productionUnit:'UP TEST'});
 Object.assign(r.meta, {
  commandNumber:'BC-001',enterprise:'Entreprise test',marketObject:'Travaux de signalisation',
  operation:'Chantier de test',location:'Voie 1, PK 100+200',title:'Dimensions relevées avant remblaiement',
  description:'Une fouille ouverte a été observée. Les dimensions ont été relevées au mètre.',
  category:'dimensions_fouilles',factDate:'2026-10-20',constatDate:'2026-10-20',
  invitationDate:'2026-10-19',invitationChannel:'courriel',invitationReference:'Courriel du 19/10/2026',
 });
 r.participants=[
  {id:'person-moe',party:'moe',present:true,name:'Alice Martin',role:'MOE'},
  {id:'person-enterprise',party:'enterprise',present:true,name:'Bruno Thomas',role:'Chef de chantier'},
 ];
 r.measurements=[{id:'measure1',designation:'Fouille F1',quantity:'1',unit:'u',dimensions:'1,20 m × 0,80 m × 0,90 m relevés',note:'Mesure au mètre'}];
 r.evidence=[{id:'photo1',type:'photo',filename:'fouille.png',caption:'Fouille F1 avant remblaiement, repère PK 100+200.',dataUrl:PNG}];
 return r;
}
const problems=r=>validateRecord(r,CATEGORIES).errors;
const hasProblem=(r,re)=>problems(r).some(e=>re.test(e.text));
async function establishedRecord(number=1) {
 const r=validRecord();r.state='established';r.number=number;r.lockedAt='2026-10-20T10:00:00.000Z';r.contentHash=await hashContent(r);return r;
}
const backupOf=documents=>({app:'attachement-pro',schemaVersion:1,documents,projects:[],settings:defaults()});

// Couverture des décisions qui changent le sens ou la traçabilité d'un attachement.
test('un constat complet avec deux représentants et une preuve peut être établi',()=>{
 const report=validateRecord(validRecord(),CATEGORIES);
 assert.deepEqual(report.errors,[]);assert.equal(report.score,100);
});
test('les rubriques essentielles du modèle ne peuvent pas être omises',()=>{
 for(const key of ['commandNumber','enterprise','marketObject','author','title','location','factDate','description','constatDate']){
  const r=validRecord();r.meta[key]=' ';assert.ok(problems(r).length>0,`Champ omis non détecté : ${key}`);
 }
});
test('la constatation requiert un représentant MOE effectivement présent',()=>{
 const r=validRecord();r.participants[0].present=false;
 assert.ok(hasProblem(r,/maîtrise d’œuvre présent/i));
});
test('la convocation doit être datée, identifiée et associée à une preuve',()=>{
 for(const key of ['invitationDate','invitationChannel','invitationReference']){
  const r=validRecord();r.meta[key]='';assert.ok(hasProblem(r,/convocation/i),key);
 }
});
test('l’absence exige la vérification explicite de la convocation et de la représentation',()=>{
 const r=validRecord();r.followUp.companyResponse='absent';r.participants[1].present=false;
 assert.ok(hasProblem(r,/absence de représentant/i));
 r.meta.convocationConfirmed=true;
 assert.deepEqual(problems(r),[]);
});
test('un représentant entreprise présent est incompatible avec la situation entreprise absente',()=>{
 const r=validRecord();r.followUp.companyResponse='absent';r.meta.convocationConfirmed=true;
 assert.ok(hasProblem(r,/absen|présen|contradic/i),'L’interface ne doit pas conserver simultanément une présence et une absence.');
});
test('les catégories B exigent une demande entreprise datée',()=>{
 for(const category of CATEGORIES.filter(c=>c.initiative==='B')){
  const r=validRecord();r.meta.category=category.id;
  assert.ok(hasProblem(r,/demande du Titulaire/i),category.id);
  r.meta.initiatedBy='enterprise';assert.ok(hasProblem(r,/date de réception/i),category.id);
  r.meta.companyRequestDate='2026-10-18';assert.deepEqual(problems(r),[],category.id);
 }
});
test('les catégories EXCLUDED exigent la trace de la demande expresse du Titulaire',()=>{
 for(const category of CATEGORIES.filter(c=>c.initiative==='EXCLUDED')){
  const r=validRecord();r.meta.category=category.id;
  assert.ok(hasProblem(r,/exigence expresse/i),category.id);
  r.meta.exceptionRequest='Demande expresse écrite du Titulaire reçue le 18/10/2026, réf. DEM-01.';
  assert.deepEqual(problems(r),[],category.id);
 }
});
test('la qualification force majeure est bloquée dans texte, relevés et légendes',()=>{
 for(const write of [
  r=>r.meta.title='Force majeure constatée',r=>r.meta.description='FORCE\nMAJEURE',
  r=>r.meta.conditions='force\u00a0majeure',r=>r.changeReason='Conséquence de force majeure',
  r=>r.measurements[0].note='Force majeure',r=>r.measurements[0].designation='Force majeure',
  r=>r.measurements[0].dimensions='Force majeure',r=>r.evidence[0].caption='Force majeure',
 ]){const r=validRecord();write(r);assert.ok(hasProblem(r,/force majeure/i));}
});
test('les relevés acceptent décimales françaises et unités mais refusent une formule',()=>{
 const r=validRecord();r.measurements[0].quantity='1,25';r.measurements[0].unit='m';assert.deepEqual(problems(r),[]);
 r.measurements[0].quantity='1.25';assert.deepEqual(problems(r),[]);
 r.measurements[0].quantity='1,25 × 2';assert.ok(hasProblem(r,/pas une formule/i));
 r.measurements[0].quantity='1,25';r.measurements[0].unit='';assert.ok(hasProblem(r,/unité/i));
});
test('fin d’événement et constat ne peuvent précéder le fait',()=>{
 const r=validRecord();r.meta.factEndDate='2026-10-19';assert.ok(hasProblem(r,/fin du fait/i));
 r.meta.factEndDate='';r.meta.constatDate='2026-10-19';assert.ok(hasProblem(r,/constat précède/i));
});
test('des dates impossibles ou non ISO sont rejetées avant établissement',()=>{
 for(const value of ['2026-02-31','2026-13-01','31/10/2026','pas une date']){
  const r=validRecord();r.meta.factDate=value;r.meta.constatDate=value;r.meta.invitationDate=value;
  assert.ok(problems(r).length>0,`Date invalide acceptée : ${value}`);
 }
});
test('refus et réserves sans PV sont signalés comme procédure incomplète',()=>{
 for(const response of ['refused','reserves']){
  const r=validRecord();r.followUp.companyResponse=response;
  const report=validateRecord(r,CATEGORIES);
  assert.ok([...report.errors,...report.warnings].some(e=>/PV de présentation/i.test(e.text)));
 }
});

// Continuité de la numérotation et conservation de la source lors de corrections.
test('la numérotation commence à 1 et ne recycle pas les numéros archivés',()=>{
 const r=validRecord();assert.equal(nextNumber(r,[]),1);
 const old=clone(r);old.number=8;old.archived=true;
 assert.equal(nextNumber(r,[old]),9);
});
test('la séquence se sépare par commande et normalise espaces/casse',()=>{
 const r=validRecord(),old=clone(r);old.number=3;old.meta.commandNumber='  bc-001  ';
 assert.equal(scopeKey(r),scopeKey(old));assert.equal(nextNumber(r,[old]),4);
 old.meta.commandNumber='BC-002';assert.equal(nextNumber(r,[old]),1);
});
test('accord-cadre : séquences indépendantes par ordre et unité de production',()=>{
 const r=validRecord();Object.assign(r.meta,{framework:true,executionOrder:'OE-1',productionUnit:'UP-A'});
 const same=clone(r);same.number=7;
 const otherOrder=clone(same);otherOrder.meta.executionOrder='OE-2';otherOrder.number=25;
 const otherUnit=clone(same);otherUnit.meta.productionUnit='UP-B';otherUnit.number=40;
 assert.equal(nextNumber(r,[same,otherOrder,otherUnit]),8);
 r.meta.executionOrder='';assert.ok(hasProblem(r,/Accord-cadre/i));
});
test('la séquence par lot ne s’applique que lorsque le choix est adopté',()=>{
 const r=validRecord();Object.assign(r.meta,{numberByLot:true,contractLot:'LOT-1'});
 const same=clone(r);same.number=4;const other=clone(same);other.meta.contractLot='LOT-2';other.number=10;
 assert.equal(nextNumber(r,[same,other]),5);
 r.meta.contractLot='';assert.ok(hasProblem(r,/préciser le lot/i));
 r.meta.numberByLot=false;assert.equal(nextNumber(r,[same,other]),1);
});
test('un rectificatif garde le lien source, reprend le prochain numéro et efface signatures/établissement',async()=>{
 const source=await establishedRecord(4);source.signatures.moe.dataUrl=PNG;source.signatures.enterprise.dataUrl=PNG;
 source.followUp.dispatchDate='2026-10-22';const frozen=structuredClone(source);
 const r=makeCorrection(source,'rectificatif',{author:'Claire Durand'});
 assert.deepEqual(source,frozen,'La source doit rester inchangée.');
 assert.notEqual(r.id,source.id);assert.equal(r.documentType,'rectificatif');assert.equal(r.relatedId,source.id);
 assert.equal(r.relatedNumber,4);assert.equal(r.relatedDate,'2026-10-20');assert.equal(r.number,null);assert.equal(r.state,'draft');
 assert.equal(r.lockedAt,'');assert.equal(r.contentHash,'');assert.equal(r.signatures.moe.dataUrl,'');assert.equal(r.signatures.enterprise.dataUrl,'');
 assert.equal(r.followUp.dispatchDate,'');assert.equal(r.meta.author,'Claire Durand');assert.equal(nextNumber(r,[source]),5);
 assert.ok(hasProblem(r,/motif de rectification/i));
});
test('un nouvel acte ne reprend pas comme acquises les présences du constat précédent',async()=>{
 const source=await establishedRecord();
 for(const r of [makeCorrection(source,'rectificatif'),makeCorrection(source,'abrogatoire'),duplicateRecord(source)]){
  assert.equal(r.participants.filter(p=>p.present).length,0,'Les représentants peuvent être proposés, mais leur présence doit être confirmée de nouveau.');
 }
});
test('un abrogatoire ne reproduit pas les mesures et preuves comme de nouveaux constats',async()=>{
 const r=makeCorrection(await establishedRecord(6),'abrogatoire');
 assert.equal(r.relatedNumber,6);assert.match(r.meta.title,/Abrogation/);assert.equal(r.meta.description,'');
 assert.deepEqual(r.measurements,[]);assert.deepEqual(r.evidence,[]);
});
test('une copie indépendante n’est pas un rectificatif et conserve la source',async()=>{
 const source=await establishedRecord();const r=duplicateRecord(source);
 assert.equal(r.documentType,'initial');assert.equal(r.relatedId,'');assert.equal(r.relatedNumber,'');assert.equal(r.number,null);
 assert.notEqual(r.id,source.id);assert.equal(source.number,1);
});

// Les échéances restent des alertes ; aucun test ne présume une décision juridique.
test('les jours calendaires restent exacts aux passages de mois et de changement d’heure',()=>{
 assert.equal(addDays('2026-10-24',7),'2026-10-31');assert.equal(addDays('2026-12-28',7),'2027-01-04');
 assert.equal(addDays('2028-02-28',1),'2028-02-29');assert.equal(addDays('2026-02-28',1),'2026-03-01');
});
test('aucune échéance ne doit être fabriquée à partir d’une date impossible',()=>{
 assert.equal(addDays('2026-02-31',7),'');assert.equal(addDays('2026-13-01',7),'');assert.equal(addDays('',7),'');
});
test('demande entreprise : alerte à sept jours, supprimée après constat',()=>{
 const r=validRecord();r.meta.companyRequestDate='2026-10-20';r.meta.constatDate='';
 const due=deadlines(r,'2026-10-25').find(x=>x.type==='constat');assert.equal(due.due,'2026-10-27');assert.equal(due.remaining,2);
 r.meta.constatDate='2026-10-26';assert.equal(deadlines(r,'2026-10-25').some(x=>x.type==='constat'),false);
});
test('observations : dix jours après présentation, sans acceptation automatique après échéance',()=>{
 const r=validRecord();r.state='established';r.followUp.companyResponse='reserves';r.followUp.presentationDate='2026-10-20';
 const before=structuredClone(r);const due=deadlines(r,'2026-10-31').find(x=>x.type==='observations');
 assert.equal(due.due,'2026-10-30');assert.equal(due.remaining,-1);assert.equal(due.tone,'red');
 assert.deepEqual(r,before);assert.equal(r.followUp.humanDecision,'');
 r.followUp.observationsDate='2026-10-28';assert.equal(deadlines(r).some(x=>x.type==='observations'),false);
});
test('transmission : sept jours après signature, avec les trois destinataires suivis',()=>{
 const r=validRecord();r.signatures.moe.date='2026-10-20';r.signatures.enterprise.date='2026-10-21';
 assert.equal(deadlines(r,'2026-10-22').find(x=>x.type==='transmission').due,'2026-10-27');
 r.followUp.dispatchDate='2026-10-22';r.followUp.dispatchMoe=true;r.followUp.dispatchEnterprise=true;
 assert.ok(deadlines(r).some(x=>x.type==='transmission'),'La copie au suivi du marché manque.');
 r.followUp.dispatchMarket=true;assert.equal(deadlines(r).some(x=>x.type==='transmission'),false);
});
test('absence de signature : pas de point de départ de transmission inventé',()=>{
 const r=validRecord();r.followUp.companyResponse='absent';r.followUp.presentationDate='2026-10-20';
 assert.equal(deadlines(r).some(x=>x.type==='transmission'),false);
});
test('les ouvrages cachés ont une alerte dédiée avant leur disparition',()=>{
 const r=validRecord();r.meta.hiddenWorks=true;r.meta.hiddenBefore='2026-10-22';
 const due=deadlines(r,'2026-10-23').find(x=>x.type==='hidden');assert.equal(due.remaining,-1);assert.equal(due.tone,'red');
});

// L’empreinte détecte les changements du contenu local ; elle ne certifie ni identité ni date.
test('l’empreinte reste stable à sérialisation identique et change avec chaque élément probatoire',async()=>{
 const source=validRecord(),hash=await hashContent(source);assert.match(hash,/^[a-f0-9]{64}$/);
 assert.equal(await hashContent(clone(source)),hash);
 for(const write of [
  r=>r.meta.description+=' Autre constat.',r=>r.meta.commandNumber='AUTRE',r=>r.number=8,
  r=>r.participants[0].name='Autre personne',r=>r.measurements[0].quantity='2',
  r=>r.evidence[0].caption='Autre légende',r=>r.evidence[0].dataUrl='data:image/png;base64,AAAA',
  r=>r.relatedId='autre-source',r=>r.documentType='abrogatoire',
 ]){const changed=clone(source);write(changed);assert.notEqual(await hashContent(changed),hash);}
});
test('un changement du suivi de transmission ou du journal ne falsifie pas le contenu constaté',async()=>{
 const r=validRecord(),hash=await hashContent(r);r.followUp.dispatchDate='2026-10-22';r.journal.push({at:'2026-10-22',kind:'transmission',text:'Copie transmise'});
 assert.equal(await hashContent(r),hash);
});
test('la sauvegarde refuse les identifiants répétés et des médias de format actif',()=>{
 const r=validRecord();assert.throws(()=>checkBackup(backupOf([r,clone(r)])),/identifiant/i);
 const bad=clone(r);bad.evidence[0].dataUrl='data:text/html;base64,AAAA';assert.throws(()=>checkBackup(backupOf([bad])),/format/i);
});
test('la sauvegarde refuse deux numéros établis identiques dans la même portée',async()=>{
 const a=await establishedRecord(2),b=await establishedRecord(2);
 assert.throws(()=>checkBackup(backupOf([a,b])),/numéro|numérot|doublon|séquence|portée/i);
});
test('une sauvegarde ne doit pas admettre une structure de signatures inutilisable',()=>{
 const r=validRecord();r.signatures={};assert.throws(()=>checkBackup(backupOf([r])),/signature|structure|champ/i);
});
test('une sauvegarde chiffrée se restaure et rejette un mauvais mot de passe',async()=>{
 const source=backupOf([validRecord()]);const encrypted=await encryptBackup(source,'un-mot-de-passe-de-test');
 assert.equal(encrypted.app,'attachement-pro-encrypted');assert.deepEqual(await decryptBackup(encrypted,'un-mot-de-passe-de-test'),clone(source));
 await assert.rejects(decryptBackup(encrypted,'mauvais-mot-de-passe'),/incorrect|altérée/i);
});
test('le rendu échappe les caractères HTML des saisies utilisateur',()=>{
 assert.equal(esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});
test('le référentiel expose les classifications importantes et toutes les aides de saisie',()=>{
 assert.equal(CATEGORIES.find(c=>c.id==='intemperies_total').initiative,'A');
 assert.equal(CATEGORIES.find(c=>c.id==='intemperies_partiel').initiative,'B');
 assert.equal(CATEGORIES.find(c=>c.id==='evenement_exceptionnel').initiative,'AB');
 assert.equal(CATEGORIES.find(c=>c.id==='essais_techniques').initiative,'EXCLUDED');
 assert.ok(RULES.some(r=>r.id==='no_force_majeure'));assert.ok(RULES.some(r=>r.id==='fact_only'));
 assert.equal(new Set(CATEGORIES.map(c=>c.id)).size,CATEGORIES.length);
 for(const c of CATEGORIES)assert.ok(FIELD_PROMPTS[c.id]?.length>0,c.id);
});
test('une sauvegarde refuse les sous-structures qui feraient échouer la rédaction',()=>{
 for(const corrupt of [
  r=>{delete r.evidence[0].caption;},
  r=>{delete r.measurements[0].designation;},
  r=>{delete r.measurements[0].unit;},
  r=>{delete r.participants[0].name;},
  r=>{r.participants[0].present='oui';},
 ]){const r=validRecord();corrupt(r);assert.throws(()=>checkBackup(backupOf([r])),/pièce|relevé|mesure|participant|champ|structure|légende/i);}
});
test('deux commandes différentes peuvent porter le même numéro d’attachement',async()=>{
 const a=await establishedRecord(2),b=await establishedRecord(2);b.meta.commandNumber='BC-002';b.contentHash=await hashContent(b);
 assert.doesNotThrow(()=>checkBackup(backupOf([a,b])));
});
test('les horaires d’une intervention de nuit sont conservés, validés et couverts par l’empreinte',async()=>{
 const r=validRecord();Object.assign(r.meta,{factStartTime:'23:00',factEndDate:'2026-10-21',factEndTime:'02:30',constatTime:'23:40'});
 assert.deepEqual(problems(r),[]);assert.doesNotThrow(()=>checkBackup(backupOf([r])));
 const hash=await hashContent(r);r.meta.factStartTime='23:10';assert.notEqual(await hashContent(r),hash);
 r.meta.factEndTime='25:10';assert.ok(hasProblem(r,/Horaire.*invalide/i));assert.throws(()=>checkBackup(backupOf([r])),/Horaire/i);
});
test('les pièces de procédure sont sauvegardées sans modifier le contenu factuel déjà établi',async()=>{
 const r=await establishedRecord(),hash=await hashContent(r);
 for(const purpose of ['convocation','pv','observations','signedCopy','dispatch']){
  r.followUp.procedureFiles.push({...clone(r.evidence[0]),id:`procedure-${purpose}`,purpose});
 }
 assert.equal(await hashContent(r),hash);assert.doesNotThrow(()=>checkBackup(backupOf([r])));
 r.followUp.procedureFiles[0].purpose='autre-inconnu';assert.throws(()=>checkBackup(backupOf([r])),/procédure/i);
});
test('les pièces de procédure reçoivent les mêmes contrôles de média que les preuves',()=>{
 const r=validRecord();r.followUp.procedureFiles=[{...clone(r.evidence[0]),id:'procedure-pv',purpose:'pv'}];
 assert.doesNotThrow(()=>checkBackup(backupOf([r])));
 r.followUp.procedureFiles[0].dataUrl='data:text/html;base64,PGh0bWw+';
 assert.throws(()=>checkBackup(backupOf([r])),/format|contenu/i);
});
test('les objets importés ne peuvent pas inventer de type de document, initiative ou réponse',()=>{
 for(const corrupt of [r=>r.documentType='facture',r=>r.meta.initiatedBy='tiers',r=>r.followUp.companyResponse='accepted-automatically']){
  const r=validRecord();corrupt(r);assert.ok(problems(r).length>0);assert.throws(()=>checkBackup(backupOf([r])));
 }
});
test('une image prétendue ne peut pas contenir une page HTML ou un autre format',()=>{
 for(const dataUrl of ['data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,PGh0bWw+', 'data:image/jpeg;base64,iVBORw0KGgo=']){
  const r=validRecord();r.evidence[0].dataUrl=dataUrl;assert.throws(()=>checkBackup(backupOf([r])),/format|contenu/i);
 }
});
test('les champs des signatures sont remis à vide lors d’un nouveau constat',async()=>{
 const source=await establishedRecord();Object.assign(source.signatures.moe,{name:'Alice Martin',habilitation:'Délégation D-01',role:'MOE',date:'2026-10-20',ack:true,dataUrl:PNG,versionHash:source.contentHash});
 const corrected=makeCorrection(source,'rectificatif');
 assert.equal(corrected.signatures.moe.name,'');assert.equal(corrected.signatures.moe.habilitation,'');assert.equal(corrected.signatures.moe.ack,false);
 assert.equal(corrected.participants[0].name,'Alice Martin');assert.equal(corrected.participants[0].present,false);assert.equal(corrected.participants[0].absenceReason,'');
});
test('une trame laissée À compléter ne peut pas être établie comme un constat',()=>{
 for(const placeholder of ['[À compléter]','[à compléter]','[ A completer ]']){
  const r=validRecord();r.meta.description+=`\nDescription du fait\n${placeholder}`;
  assert.ok(hasProblem(r,/contient encore.*compléter/i));
 }
 const r=validRecord();r.meta.description='Une fouille est visible. Les dimensions relevées sont détaillées dans le tableau.';
 assert.deepEqual(problems(r),[]);
});
