import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {exportPDF,exportDOCX,exportCSV,reportBlocks,buildPrintHTML,reportFilename,exportDossierZIP,exportPresentationPV,zipStore} from '../dist/js/exports.js';

// Charge exactement les moteurs embarqués dans la PWA.
for (const [file, globalName] of [['pdf-lib.min.js','PDFLib'],['docx.umd.js','docx']]) {
 const mod={exports:{}};
 new Function('module','exports',await readFile(new URL('../dist/vendor/'+file,import.meta.url),'utf8'))(mod,mod.exports);
 globalThis[globalName]=mod.exports;
}
const png=process.env.EXPORT_QA_IMAGE ? 'data:image/png;base64,'+(await readFile(process.env.EXPORT_QA_IMAGE)).toString('base64') : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jkuEAAAAASUVORK5CYII=';
export const fixture={
 id:'qa-export-demo',state:'established',number:12,documentType:'rectificatif',relatedNumber:8,relatedDate:'2026-10-19',changeReason:'Rectification du repérage constaté sur le terrain.',createdAt:'2026-10-23T10:20:00Z',updatedAt:'2026-10-23T11:00:00Z',lockedAt:'2026-10-23T10:45:00Z',contentHash:'a'.repeat(64),
 meta:{commandNumber:'CMD-TEST-2026',enterprise:'Entreprise de démonstration',marketObject:'Renouvellement de câbles de signalisation',operation:'Chantier de démonstration',location:'Zone technique - accès sud',line:'Ligne de démonstration',track:'Voie 2',pkStart:'100+250',pkEnd:'100+420',framework:true,executionOrder:'BC-17',productionUnit:'Unité de test',contractLot:'Lot SE',numberByLot:true,author:'Rédacteur de test',authorRole:'Surveillant travaux',authorOrganization:'Organisme de démonstration',initiatedBy:'enterprise',initiativeDate:'2026-10-20',companyRequestDate:'2026-10-20',factDate:'2026-10-23',factEndDate:'2026-10-23',title:'Constat du déroulage et du raccordement des câbles',description:'Les représentants ont constaté la présence du câble dans le caniveau, son repérage et les longueurs relevées avant fermeture.\nLes données ci-dessous décrivent les faits observés sur le chantier.',conditions:'Temps sec. Accès réalisé par le portail sud.',hiddenWorks:true,hiddenBefore:'2026-10-24',constatDate:'2026-10-23',invitationDate:'2026-10-21',invitationChannel:'Courriel',invitationReference:'INV-2026-03',category:'Travaux destinés à être cachés'},
 measurements:[
  {designation:'Câble de signalisation posé',reference:'C01',quantity:'145,5',unit:'m',dimensions:'Longueur relevée : 145,5 m',location:'PK 100+250 à 100+395',note:'Repérage visible sur les extrémités.'},
  {designation:'Boîtes de raccordement',reference:'B01 à B03',quantity:'3',unit:'u',dimensions:'Enveloppe 400 × 300 × 200 mm',location:'Voie 2',note:'Étiquettes relevées : B01, B02, B03.'}
 ],
 participants:[{name:'Représentant MOE',company:'Organisme de démonstration',party:'moe',role:'Surveillant',habilitation:'Délégation de test',present:true},{name:'Représentant entreprise',company:'Entreprise de démonstration',party:'enterprise',role:'Chef de chantier',habilitation:'Délégation de test',present:true}],
 followUp:{presentationDate:'2026-10-23',notifiedDate:'2026-10-23',companyResponse:'reserves',reservations:'La localisation de la boîte B03 reste à préciser par l’entreprise.',observations:'Observation écrite reçue et jointe au dossier de démonstration.',observationsDate:'2026-10-23',pvReference:'PV-DEMO-12',pvDate:'2026-10-23',dispatchDate:'2026-10-23',dispatchMethod:'Courriel',dispatchReference:'ENVOI-12',recipients:'Maître d’œuvre ; entreprise ; suivi du marché',humanDecision:'Maintenir le suivi ouvert jusqu’à la réponse documentée.',humanDecisionDate:'2026-10-23'},
 signatures:{moe:{name:'Représentant habilité MOE',role:'Maître d’œuvre',habilitation:'Délégation de test',date:'2026-10-23',dataUrl:png,versionHash:'a'.repeat(64),ack:true},enterprise:{name:'Représentant habilité entreprise',role:'Conducteur de travaux',habilitation:'Délégation de test',date:'2026-10-23',dataUrl:'',versionHash:'',ack:false}},
 evidence:[{id:'photo1',type:'sketch',name:'croquis-demo.png',mime:'image/png',dataUrl:png,caption:'Croquis de démonstration destiné à la vérification de l’export.',date:'2026-10-23',location:'Zone technique',width:1,height:1},{id:'pdf1',type:'document',name:'piece-documentaire-demo.pdf',mime:'application/pdf',dataUrl:'data:application/pdf;base64,JVBERg==',caption:'Pièce documentaire à transmettre séparément.'}],journal:[]
};

test('Le brouillon reste explicite et tous les champs du constat sont transmis',()=>{
 const d=structuredClone(fixture);d.state='draft';d.number=null;
 const html=buildPrintHTML(d);
 assert.match(html,/BROUILLON/);assert.match(html,/À ATTRIBUER/);assert.match(html,/Annule et remplace/);
 assert.match(html,/Maître d’œuvre/);assert.match(html,/145,5/);assert.match(html,/pièce|Pièce/);
 assert.doesNotMatch(html,/Tracé rattaché/);
 assert.match(reportFilename(d,'docx'),/brouillon.*\.docx$/);
});
test('HTML échappé, pièces non raster exclues et signature invalide non reproduite',()=>{
 const d=structuredClone(fixture);d.meta.title='<script>evil()</script>';d.evidence[0].dataUrl='data:image/svg+xml,<svg onload="evil()"/>';d.signatures.moe.versionHash='incorrect';
 const html=buildPrintHTML(d);
 assert.doesNotMatch(html,/<script>evil/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/src="data:image\/svg/);assert.doesNotMatch(html,/Tracé rattaché/);
});
test('CSV UTF-8 neutralise les formules et conserve retours et séparateurs',async()=>{
 const d=structuredClone(fixture);d.meta.title='=HYPERLINK("https://example.test")';
 const csv=await exportCSV([d]).text();
 assert.match(csv,/"'=HYPERLINK/);assert.match(csv,/CMD-TEST-2026/);assert.match(csv,/\r\n/);
});
test('PDF et DOCX natifs contiennent les données et restent générables hors réseau',async()=>{
 const pdf=await exportPDF(fixture),word=await exportDOCX(fixture);
 const pdfBytes=new Uint8Array(await pdf.arrayBuffer());const wordBytes=new Uint8Array(await word.arrayBuffer());
 assert.equal(pdf.type,'application/pdf');assert.equal(new TextDecoder().decode(pdfBytes.slice(0,5)),'%PDF-');assert.equal(wordBytes[0],0x50);assert.equal(wordBytes[1],0x4b);
 const loaded=await globalThis.PDFLib.PDFDocument.load(pdfBytes);assert.ok(loaded.getPageCount()>=3);assert.ok(wordBytes.length>5000);
 if(process.env.EXPORT_QA_DIR){await mkdir(process.env.EXPORT_QA_DIR,{recursive:true});await writeFile(process.env.EXPORT_QA_DIR+'/attachement-demo.pdf',pdfBytes);await writeFile(process.env.EXPORT_QA_DIR+'/attachement-demo.docx',wordBytes);await writeFile(process.env.EXPORT_QA_DIR+'/attachement-demo.html',buildPrintHTML(fixture));}
});
test('Les cellules très longues et les mots sans espaces passent sur plusieurs pages',async()=>{
 const d=structuredClone(fixture);d.evidence=[];d.meta.description='Constat relevé. '.repeat(220)+'FIN-DESCRIPTION';
 d.measurements[0].note='Détail observé sur chantier. '.repeat(180)+'FIN-CELLULE';d.measurements[1].reference='X'.repeat(240);
 const pdf=await exportPDF(d);const bytes=new Uint8Array(await pdf.arrayBuffer());const loaded=await globalThis.PDFLib.PDFDocument.load(bytes);assert.ok(loaded.getPageCount()>=5);
 if(process.env.EXPORT_QA_DIR)await writeFile(process.env.EXPORT_QA_DIR+'/attachement-long.pdf',bytes);
});

test('Pièces de suivi, heures et preuve de transmission restent visibles et distinctes du constat gelé',()=>{
 const d=structuredClone(fixture);
 d.meta.factStartTime='09:15';d.meta.factEndTime='12:30';d.meta.constatTime='10:45';
 d.followUp.procedureFiles=[{...d.evidence[0],purpose:'pv',name:'PV-image.png'}];
 d.followUp.dispatchMoe=true;d.followUp.pvCircumstances='REFUS-PV-TEST';d.followUp.humanDecisionAuthor='RESPONSABLE-TEST';
 const html=buildPrintHTML(d);
 assert.match(html,/09:15/);assert.match(html,/12:30/);assert.match(html,/10:45/);
 assert.match(html,/Annexe P1 - Procès-verbal/);assert.match(html,/ne sont pas couvertes par l’empreinte/);
 assert.match(html,/original au maître d’œuvre/);assert.match(html,/REFUS-PV-TEST/);assert.match(html,/RESPONSABLE-TEST/);
});

function readStoredZIP(bytes) {
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decoder=new TextDecoder(),entries=new Map();
 let at=0;
 while(at+30<bytes.length&&view.getUint32(at,true)===0x04034b50){
  assert.equal(view.getUint16(at+8,true),0,'archive ZIP STORE sans compression');
  const length=view.getUint32(at+18,true),nameLength=view.getUint16(at+26,true),extraLength=view.getUint16(at+28,true);
  const name=decoder.decode(bytes.slice(at+30,at+30+nameLength));
  const start=at+30+nameLength+extraLength;
  entries.set(name,bytes.slice(start,start+length));at=start+length;
 }
 assert.equal(view.getUint32(at,true),0x02014b50,'répertoire central présent');
 assert.equal(view.getUint32(bytes.length-22,true),0x06054b50,'fin d’archive ZIP présente');
 assert.equal(view.getUint16(bytes.length-12,true),entries.size,'nombre de fichiers cohérent');
 return entries;
}
test('ZIP natif : CRC32 connu et répertoire central corrects',async()=>{
 const zip=zipStore([{name:'verification.txt',bytes:new TextEncoder().encode('123456789')}]);
 const bytes=new Uint8Array(await zip.arrayBuffer());
 assert.equal(new DataView(bytes.buffer).getUint32(14,true),0xcbf43926);
 assert.equal(new TextDecoder().decode(readStoredZIP(bytes).get('verification.txt')),'123456789');
});
test('Dossier ZIP complet, noms sûrs et sauvegarde intégrale restaurable',async()=>{
 const r=structuredClone(fixture);r.evidence[0].name='../../croquis / bizarre.png';
 r.followUp.procedureFiles=[{...r.evidence[1],id:'procedure-test',purpose:'pv',name:'../../PV signé.pdf'}];
 const before=JSON.stringify(r),settings={author:'Auteur de test'};
 const zip=await exportDossierZIP(r,settings);assert.equal(zip.type,'application/zip');
 const bytes=new Uint8Array(await zip.arrayBuffer()),entries=readStoredZIP(bytes);
 assert.equal(entries.size,7);
 for(const name of entries.keys()){assert.ok(!name.startsWith('/'));assert.ok(!name.includes('..'));assert.ok(!name.includes('\\'));}
 assert.ok(entries.has('pieces-constat/001_croquis___bizarre.png'));
 assert.ok(entries.has('pieces-procedure/001_pv_PV_signe.pdf'));
 const backup=JSON.parse(new TextDecoder().decode(entries.get('sauvegarde-dossier.json')));
 assert.equal(backup.app,'attachement-pro');assert.equal(backup.schemaVersion,1);assert.deepEqual(backup.documents,[r]);assert.deepEqual(backup.projects,[]);assert.deepEqual(backup.settings,settings);
 assert.equal(JSON.stringify(r),before,'l’export ne modifie pas le dossier');
 assert.equal(new TextDecoder().decode(entries.get(reportFilename(r,'pdf')).slice(0,5)),'%PDF-');
 if(process.env.EXPORT_QA_DIR)await writeFile(process.env.EXPORT_QA_DIR+'/dossier-demo.zip',bytes);
});
test('Le projet de PV est un vrai PDF distinct sans réutilisation des signatures',async()=>{
 const r=structuredClone(fixture);r.followUp.pvCircumstances='CIRCONSTANCES-PV-TEST';
 const blob=await exportPresentationPV(r);assert.equal(blob.type,'application/pdf');
 const bytes=new Uint8Array(await blob.arrayBuffer()),pdf=await globalThis.PDFLib.PDFDocument.load(bytes);
 assert.equal(pdf.getTitle(),'PROJET DE PROCÈS-VERBAL DE PRÉSENTATION');
 assert.ok(pdf.getPageCount()>=2);
 const images=pdf.context.enumerateIndirectObjects().filter(([,obj])=>obj?.dict?.get(globalThis.PDFLib.PDFName.of('Subtype'))?.toString()==='/Image');
 assert.equal(images.length,0,'aucune image de signature ou de preuve n’a été copiée dans le PV');
 if(process.env.EXPORT_QA_DIR)await writeFile(process.env.EXPORT_QA_DIR+'/projet-pv-demo.pdf',bytes);
});
