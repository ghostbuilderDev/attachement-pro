/**
 * Attachement Pro - exports intégralement locaux.
 * Vendors attendus : globalThis.PDFLib et globalThis.docx.
 * Aucun accès réseau, aucune dépendance à une API ou à un serveur.
 */

import { CATEGORIES } from './references.js';

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MISSING = 'Non renseigné';
const TYPE_LABELS = { initial: 'Attachement initial', rectificatif: 'Attachement rectificatif', abrogatoire: 'Attachement abrogatoire' };
const RESPONSES = { pending: 'En attente de position de l’entreprise', accepted: 'Accepté par l’entreprise', reserves: 'Réserves formulées par l’entreprise', refused: 'Refus de signer déclaré', absent: 'Entreprise absente au constat' };
const PARTIES = { moe: 'Maîtrise d’œuvre', enterprise: 'Entreprise', other: 'Autre intervenant' };

function str(value) { return value === null || value === undefined ? '' : String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); }
function val(value) { return str(value).trim() || MISSING; }
export function escapeHTML(value) { return str(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function date(value) {
  const s = str(value);
  if (!s) return MISSING;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}
function time(value) {
  if (!value) return MISSING;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? str(value) : d.toLocaleString('fr-FR', {timeZone: 'Europe/Paris'});
}
function imageURL(url) { return typeof url === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/\r\n]+=*$/.test(url) ? url : ''; }
function validSignature(signature, record) {
  return record.state !== 'draft' && !!record.contentHash && signature?.versionHash === record.contentHash && !!imageURL(signature?.dataUrl);
}
function recordTitle(record) { return `ATTACHEMENT N° ${record.number == null ? 'À ATTRIBUER' : record.number}`; }
function stateLabel(record) { return record.state === 'draft' ? 'BROUILLON - Document non établi' : 'ÉTABLI - ' + (RESPONSES[record.followUp?.companyResponse] || 'Suivi contradictoire à compléter'); }

export function reportFilename(record, extension = 'pdf') {
  const base = `Attachement_${record.meta?.commandNumber || 'sans-commande'}_${record.number ?? 'brouillon'}_${record.meta?.factDate || new Date().toISOString().slice(0, 10)}`;
  return base.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 160) + '.' + str(extension).replace(/[^a-zA-Z0-9]/g, '');
}

/** Une même représentation alimente PDF, Word et impression. */
export function reportBlocks(record, settings = {}) {
  const m = record.meta || {}, f = record.followUp || {}, blocks = [];
  const p = (text, options = {}) => blocks.push({kind: 'p', text: str(text), ...options});
  const h = text => blocks.push({kind: 'h', text});
  const kv = (label, value) => p(`${label} : ${val(value)}`);
  const table = (headers, rows, widths) => blocks.push({kind:'table', headers, rows, widths});
  p(recordTitle(record), {title:true});
  p(TYPE_LABELS[record.documentType] || TYPE_LABELS.initial, {subtitle:true});
  p(stateLabel(record), {status:true});
  if (record.documentType === 'rectificatif') p(`Annule et remplace l’attachement n° ${val(record.relatedNumber)} du ${date(record.relatedDate)}.`, {bold:true});
  if (record.documentType === 'abrogatoire') p(`Abroge l’attachement n° ${val(record.relatedNumber)} du ${date(record.relatedDate)}.`, {bold:true});
  if (record.documentType !== 'initial' && record.changeReason) kv('Motif', record.changeReason);

  h('Identification du marché');
  kv('N° de commande', m.commandNumber);
  kv('Entreprise titulaire', m.enterprise);
  kv('Objet du marché', m.marketObject);
  if (m.framework) {
    kv('Accord-cadre - ordre d’exécution ou bon de commande', m.executionOrder);
    kv('Unité de production', m.productionUnit);
  }
  if (m.contractLot) kv(m.numberByLot ? 'Lot - série de numérotation distincte' : 'Lot', m.contractLot);
  kv('Attachement pris', m.initiatedBy === 'enterprise' ? 'sur demande de l’entreprise' : 'à l’initiative du maître d’œuvre');
  kv('Date de l’initiative', date(m.initiativeDate));
  if (m.companyRequestDate) kv('Demande de l’entreprise reçue le', date(m.companyRequestDate));
  if (m.companyRequestReference) kv('Référence de la demande de l’entreprise', m.companyRequestReference);
  if (m.exceptionRequest) kv('Exigence expresse du titulaire pour cette constatation', m.exceptionRequest);
  const startFact = date(m.factDate) + (m.factStartTime ? ` à ${m.factStartTime}` : '');
  const endFact = m.factEndDate || m.factEndTime ? date(m.factEndDate || m.factDate) + (m.factEndTime ? ` à ${m.factEndTime}` : '') : '';
  kv('Date du fait ou de l’événement', startFact + (endFact && endFact !== startFact ? ` - ${endFact}` : ''));
  if (m.category) kv('Situation déclarée', m.categoryLabel || CATEGORIES.find(c => c.id === m.category)?.label || m.category);

  h('Emplacement et objet de l’attachement');
  kv('Chantier ou opération', m.operation);
  kv('Emplacement des travaux', m.location);
  if (m.line) kv('Ligne', m.line);
  if (m.track) kv('Voie', m.track);
  if (m.pkStart || m.pkEnd) kv('Repérage PK', `${val(m.pkStart)}${m.pkEnd ? ` à ${m.pkEnd}` : ''}`);
  kv('Objet de l’attachement', m.title);
  h('Description des faits constatés');
  p(val(m.description));
  if (m.conditions) { h('Circonstances et conditions constatées'); p(m.conditions); }
  if (m.designationReference) kv('Référence des désignations et documents techniques', m.designationReference);
  if (m.hiddenWorks) kv('Ouvrage destiné à être caché ou inaccessible - échéance annoncée', date(m.hiddenBefore));

  if (record.measurements?.length) {
    h('Quantités et dimensions relevées');
    p('Relevés factuels. Les calculs de règlement et les prix ne figurent pas dans cet attachement.', {small:true});
    table(['Désignation / référence', 'Quantité / unité', 'Dimensions relevées', 'Emplacement', 'Observation factuelle'], record.measurements.map(row => [
      `${val(row.designation)}${row.reference ? `\nRéf. ${row.reference}` : ''}`,
      `${val(row.quantity)}${row.unit ? ` ${row.unit}` : ''}`,
      str(row.dimensions) || '-', str(row.location) || '-', str(row.note) || '-'
    ]), [0.29,0.13,0.20,0.17,0.21]);
  }

  h('Constatation contradictoire');
  kv('Constatation faite le', date(m.constatDate) + (m.constatTime ? ` à ${m.constatTime}` : ''));
  if (m.invitationDate || m.invitationChannel || m.invitationReference) {
    kv('Convocation adressée le', date(m.invitationDate));
    kv('Mode de convocation', m.invitationChannel);
    kv('Référence de la preuve de convocation', m.invitationReference);
  }
  if (m.convocationConfirmed) p('Convocation des parties confirmée par le rédacteur.');
  if (record.participants?.length) {
    table(['Représentant / organisme', 'Qualité et habilitation', 'Présence au constat'], record.participants.map(person => [
      `${val(person.name)}\n${str(person.company) || PARTIES[person.party] || 'Intervenant'}`,
      `${PARTIES[person.party] || 'Intervenant'}${person.role ? `\n${person.role}` : ''}${person.habilitation ? `\nHabilitation : ${person.habilitation}` : ''}`,
      person.present === false ? `Absent${person.absenceReason ? `\n${person.absenceReason}` : ''}` : 'Présent'
    ]), [0.36,0.42,0.22]);
  } else p('Représentants présents : non renseignés.');

  h('Présentation et position de l’entreprise');
  kv('Présentation de l’attachement le', date(f.presentationDate));
  if (f.notifiedDate) kv('Notification le', date(f.notifiedDate));
  kv('Position de l’entreprise', RESPONSES[f.companyResponse] || RESPONSES.pending);
  if (f.companyResponse === 'accepted') kv('Acceptation déclarée le', date(f.acceptanceDate || record.signatures?.enterprise?.date));
  if (f.refusalReason) kv('Refus de signer - motif déclaré', f.refusalReason);
  if (f.reservations) kv('Réserves formulées', f.reservations);
  if (f.observations) {
    kv('Observations écrites reçues le', date(f.observationsDate));
    p(f.observations);
  }
  if (f.pvDate || f.pvReference) kv('Procès-verbal de présentation', `${val(f.pvReference)} - ${date(f.pvDate)}`);
  if (f.pvCircumstances) kv('Circonstances consignées au procès-verbal', f.pvCircumstances);
  if (f.humanDecision) {
    kv('Décision de suivi saisie par le responsable', f.humanDecision);
    kv('Date de cette décision', date(f.humanDecisionDate));
    if (f.humanDecisionAuthor) kv('Responsable ayant consigné cette décision', f.humanDecisionAuthor);
  }

  h('Représentants habilités et signatures');
  for (const party of ['moe','enterprise']) {
    const s = record.signatures?.[party] || {};
    blocks.push({kind:'signature', party, label: party === 'moe' ? 'Maître d’œuvre' : 'Entreprise', signature:s, valid:validSignature(s,record)});
  }
  p('Les tracés manuscrits reproduits dans ce document ne constituent pas, à eux seuls, une signature électronique qualifiée. Les noms, habilitations et dates déclarés restent à vérifier selon le circuit du marché.', {small:true});

  h('Transmission et suivi');
  kv('Transmission le', date(f.dispatchDate));
  kv('Mode de transmission', f.dispatchMethod);
  if (f.dispatchReference) kv('Référence de la preuve d’envoi', f.dispatchReference);
  kv('Destinataires déclarés', f.recipients);
  const dispatched = [f.dispatchMoe ? 'original au maître d’œuvre' : '', f.dispatchEnterprise ? 'copie à l’entreprise' : '', f.dispatchMarket ? 'copie au suivi du marché' : ''].filter(Boolean);
  if (dispatched.length) kv('Transmissions déclarées comme effectuées', dispatched.join(' ; '));
  if (m.author || settings.author) kv('Rédacteur', m.author || settings.author);
  if (m.authorRole || settings.role) kv('Qualité du rédacteur', m.authorRole || settings.role);
  if (m.authorOrganization || settings.organization) kv('Organisme du rédacteur', m.authorOrganization || settings.organization);
  if (record.lockedAt) kv('Établi dans l’application le', time(record.lockedAt));
  if (record.contentHash) {
    kv('Empreinte du constat établi', record.contentHash);
    p('Empreinte locale du contenu établi ; elle ne remplace pas une certification ou un horodatage externe.', {small:true});
  }

  const purposeLabels = {convocation:'Convocation',pv:'Procès-verbal',observations:'Observations écrites',signedCopy:'Exemplaire signé',dispatch:'Preuve de transmission'};
  const evidenceGroup = (evidence, procedure = false) => {
    if (!evidence.length) return;
    h(procedure ? 'Pièces de procédure et de suivi' : 'Pièces jointes au constat et repérage des annexes');
    if (procedure) p('Pièces ajoutées pour le suivi après établissement. Elles ne sont pas couvertes par l’empreinte du constat gelé indiquée plus haut.', {small:true});
    const documents = evidence.filter(item => !imageURL(item.dataUrl));
    if (documents.length) p('Les fichiers documentaires (dont les PDF) sont répertoriés ci-dessous mais ne sont pas fusionnés dans ce document. Ils doivent être joints séparément à l’envoi ; ils restent disponibles dans le dossier et sa sauvegarde.', {small:true});
    table(['N°', 'Nature / fichier', 'Légende et repérage'], evidence.map((item, i) => [
      (procedure ? 'P' : '') + (i + 1), `${procedure ? purposeLabels[item.purpose] || 'Pièce de suivi' : item.type === 'sketch' ? 'Croquis' : item.type === 'photo' ? 'Photo' : 'Document'}\n${val(item.name)}`,
      `${str(item.caption) || '-'}${item.date ? `\nDate déclarée : ${date(item.date)}` : ''}${item.location ? `\n${item.location}` : ''}`
    ]), [0.07,0.37,0.56]);
    evidence.forEach((item, i) => {
      if (!imageURL(item.dataUrl)) return;
      blocks.push({kind:'image', item, index:(procedure ? 'P' : '') + (i + 1), procedure, purposeLabel:purposeLabels[item.purpose] || 'Pièce de suivi'});
    });
  };
  evidenceGroup(record.evidence || []);
  evidenceGroup(f.procedureFiles || [], true);
  h('Références de rédaction');
  p('RGF00099, version 01 du 03/03/2026, extraits transmis pages 33 à 43 ; modèle d’attachement fourni. Le présent document est rédigé par son auteur avec Attachement Pro.', {small:true});
  return blocks;
}

const PRINT_CSS = `
  @page{size:A4;margin:17mm 17mm 18mm}
  *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:10pt;line-height:1.45;color:#17202b;margin:0;background:#fff}
  main{max-width:180mm;margin:20px auto;padding:0 4mm}h1{font-size:22pt;line-height:1.2;margin:0 0 5mm;color:#000}h2{font-size:12pt;line-height:1.3;margin:7mm 0 3mm;color:#000;break-after:avoid}
  p{margin:0 0 2.5mm;white-space:pre-wrap;overflow-wrap:anywhere}p.subtitle{font-size:13pt;font-weight:600}p.status{font-size:10pt;font-weight:700;margin:0 0 5mm}p.small{font-size:8.5pt;color:#4c5968}p.bold{font-weight:700}
  table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:9pt;margin:2mm 0 5mm}th,td{border:1px solid #d9d9d9;padding:2.5mm;vertical-align:top;overflow-wrap:anywhere;white-space:pre-wrap}th{background:#e8eef4;color:#000;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}
  figure{margin:7mm 0;break-inside:avoid}figure.annex{break-before:page}figure img{display:block;max-width:100%;max-height:190mm;object-fit:contain;margin:3mm auto}figcaption{font-size:9pt;white-space:pre-wrap;overflow-wrap:anywhere}
  .sig{break-inside:avoid;margin:4mm 0 6mm;padding-top:2mm}.sig img{display:block;width:auto;max-width:70mm;height:22mm;object-fit:contain;object-position:left}.sig strong{display:block;margin-bottom:2mm}.empty-signature{height:18mm;border-bottom:1px solid #9ca3af;max-width:75mm}
  .print-controls{position:sticky;top:0;padding:12px 18px;background:#e8eef4;border-bottom:1px solid #bdc9d6;font-family:Arial,sans-serif;display:flex;justify-content:space-between;gap:15px;align-items:center}.print-controls button{font:inherit;border:0;border-radius:6px;background:#17384d;color:#fff;padding:10px 16px;cursor:pointer}.print-note{font-size:9pt;margin:0}
  @media print{main{max-width:none;margin:0;padding:0}.print-controls{display:none}a{color:inherit}p{orphans:3;widows:3}}
`;

export function buildPrintHTML(record, settings = {}) {
  let body = '';
  for (const block of reportBlocks(record, settings)) {
    if (block.kind === 'p') body += block.title ? `<h1>${escapeHTML(block.text)}</h1>` : `<p class="${block.subtitle ? 'subtitle' : block.status ? 'status' : block.small ? 'small' : block.bold ? 'bold' : ''}">${escapeHTML(block.text)}</p>`;
    else if (block.kind === 'h') body += `<h2>${escapeHTML(block.text)}</h2>`;
    else if (block.kind === 'table') body += `<table><colgroup>${block.widths.map(w=>`<col style="width:${w*100}%">`).join('')}</colgroup><thead><tr>${block.headers.map(v=>`<th>${escapeHTML(v)}</th>`).join('')}</tr></thead><tbody>${block.rows.map(row=>`<tr>${row.map(v=>`<td>${escapeHTML(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    else if (block.kind === 'signature') {
      const s = block.signature;
      body += `<section class="sig"><strong>${escapeHTML(block.label)}</strong><p>Nom : ${escapeHTML(val(s.name))}\nQualité : ${escapeHTML(val(s.role))}\nHabilitation : ${escapeHTML(val(s.habilitation))}\nDate : ${escapeHTML(date(s.date))}</p>`;
      body += block.valid ? `<img src="${imageURL(s.dataUrl)}" alt="Tracé de signature de ${escapeHTML(s.name)}"><p class="small">Tracé rattaché à l’empreinte du constat établi.</p>` : '<div class="empty-signature"></div><p class="small">Signature à recueillir sur cet exemplaire ou via le circuit de signature retenu.</p>';
      body += '</section>';
    } else if (block.kind === 'image') {
      const item = block.item;
      body += `<figure class="annex"><h2>Annexe ${block.index} - ${escapeHTML(block.procedure ? block.purposeLabel : item.type==='sketch'?'Croquis':'Photographie')}</h2><p>${escapeHTML(val(item.name))}</p><img src="${imageURL(item.dataUrl)}" alt="${escapeHTML(item.caption || item.name || 'Annexe visuelle')}"><figcaption>${escapeHTML(val(item.caption))}${item.date?'\nDate déclarée : '+escapeHTML(date(item.date)):''}${item.location?'\nEmplacement : '+escapeHTML(item.location):''}</figcaption></figure>`;
    }
  }
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(recordTitle(record))}</title><style>${PRINT_CSS}</style></head><body><div class="print-controls"><p class="print-note">Aperçu complet. Pour un PDF paginé, utilisez « Télécharger PDF » dans l’application.</p><button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button></div><main>${body}</main></body></html>`;
}

/** Décode uniquement des images matricielles ajoutées par l’utilisateur. */
async function rasterImage(url) {
  const checked = imageURL(url);
  if (!checked) throw new Error('La pièce visuelle ne contient pas une image PNG, JPEG ou WebP valide.');
  const mime = checked.slice(5, checked.indexOf(';'));
  if (mime === 'image/png' || mime === 'image/jpeg') {
    const binary = atob(checked.split(',')[1].replace(/\s/g,''));
    const bytes = Uint8Array.from(binary, ch=>ch.charCodeAt(0));
    return {bytes, mime};
  }
  if (typeof document === 'undefined' || typeof Image === 'undefined') throw new Error('Convertissez l’image WebP en PNG ou JPEG pour cet export.');
  const image = new Image();
  image.src = checked;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);
  return rasterImage(canvas.toDataURL('image/png'));
}
function rawImageSize(bytes, mime) {
  if (mime === 'image/png' && bytes.length > 24) {
    const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    return {width:view.getUint32(16),height:view.getUint32(20)};
  }
  if (mime === 'image/jpeg') {
    let pos=2;
    while (pos+8<bytes.length) {
      if(bytes[pos]!==255){pos++;continue;}
      const code=bytes[pos+1];
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(code)) return {height:(bytes[pos+5]<<8)|bytes[pos+6],width:(bytes[pos+7]<<8)|bytes[pos+8]};
      if(code===0xd8||code===0xd9){pos+=2;continue;}
      const len=(bytes[pos+2]<<8)|bytes[pos+3];if(len<2)break;pos+=2+len;
    }
  }
  return {width:1200,height:800};
}

/** PDF A4 avec pagination, en-têtes répétés et intégration locale des images. */
export async function exportPDF(record, settings = {}) {
  return renderPDF(record, settings);
}

async function renderPDF(record, settings = {}, options = {}) {
  const lib = globalThis.PDFLib;
  if (!lib?.PDFDocument) throw new Error('Le moteur PDF est indisponible. Rechargez l’application en ligne une fois.');
  const {PDFDocument,StandardFonts,rgb} = lib;
  const pdf = await PDFDocument.create();
  pdf.setTitle(options.title || recordTitle(record));pdf.setAuthor(record.meta?.author || settings.author || '');pdf.setSubject(record.meta?.title || 'Constat de travaux');pdf.setCreator('Attachement Pro');
  const regular = await pdf.embedFont(StandardFonts.Helvetica), bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const PAGE_W=595.28,PAGE_H=841.89,M=46,CONTENT_W=PAGE_W-M*2,TOP=PAGE_H-55,BOTTOM=51;
  const ink=rgb(.08,.12,.17),muted=rgb(.30,.34,.40),rule=rgb(.82,.85,.88),shade=rgb(.92,.94,.96);
  let page, y, pageNumber=0;
  const pages=[];
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const ctx=canvas?.getContext('2d');
  function width(text,size,font=regular) {
    try {return font.widthOfTextAtSize(text,size);} catch {
      if(ctx){ctx.font=`${font===bold?'bold ':''}${size}px Arial`;return ctx.measureText(text).width;}
      return [...text].length*size*.62;
    }
  }
  function wrap(text,maxWidth,size,font=regular) {
    const lines=[];
    for(const paragraph of str(text).replace(/\t/g,'    ').split(/\r?\n/)){
      if(!paragraph){lines.push('');continue;}
      let line='';
      for(const word of paragraph.split(/\s+/)){
        if(!word)continue;
        const candidate=line?line+' '+word:word;
        if(width(candidate,size,font)<=maxWidth){line=candidate;continue;}
        if(line){lines.push(line);line='';}
        if(width(word,size,font)<=maxWidth){line=word;continue;}
        for(const char of [...word]){
          if(line && width(line+char,size,font)>maxWidth){lines.push(line);line='';}
          line+=char;
        }
      }
      if(line)lines.push(line);
    }
    return lines.length?lines:[''];
  }
  async function draw(text,x,baseline,size=10,font=regular,color=ink){
    if(!text)return;
    try {font.encodeText(text);page.drawText(text,{x,y:baseline,size,font,color});}
    catch {
      if(!canvas||!ctx)throw new Error(`Caractère non pris en charge dans l’export PDF hors navigateur : ${text}. Utilisez le navigateur ou l’export Word.`);
      const scale=3, w=Math.ceil(width(text,size,font)+4),h=Math.ceil(size*1.65);
      canvas.width=Math.max(1,w*scale);canvas.height=Math.max(1,h*scale);
      ctx.scale(scale,scale);ctx.font=`${font===bold?'bold ':''}${size}px Arial`;ctx.fillStyle=`rgb(${Math.round(color.red*255)},${Math.round(color.green*255)},${Math.round(color.blue*255)})`;ctx.textBaseline='alphabetic';ctx.fillText(text,0,size*1.2);
      const image=await pdf.embedPng(canvas.toDataURL('image/png'));
      page.drawImage(image,{x,y:baseline-size*.45,width:w,height:h});
    }
  }
  async function newPage(){
    page=pdf.addPage([PAGE_W,PAGE_H]);pages.push(page);pageNumber++;y=TOP;
    if(pageNumber>1){
      const left=wrap(`${options.headerTitle || recordTitle(record)} - Commande ${val(record.meta?.commandNumber)}`,CONTENT_W-85,8,bold)[0];
      await draw(left,M,PAGE_H-30,8,bold,muted);
      await draw(options.project?'PROJET':record.state==='draft'?'BROUILLON':'ÉTABLI',PAGE_W-M-63,PAGE_H-30,8,bold,muted);
      page.drawLine({start:{x:M,y:PAGE_H-37},end:{x:PAGE_W-M,y:PAGE_H-37},thickness:.5,color:rule});
    }
  }
  async function ensure(height){if(y-height<BOTTOM)await newPage();}
  async function paragraph(text,{size=10,font=regular,color=ink,space=7,indent=0}={}){
    const lineHeight=size*1.42,lines=wrap(text,CONTENT_W-indent,size,font);
    if (lines.length <= 6) await ensure(lines.length * lineHeight + space);
    for(const line of lines){await ensure(lineHeight);await draw(line,M+indent,y-size,size,font,color);y-=lineHeight;}
    y-=space;
  }
  async function heading(text){await ensure(text === 'Représentants habilités et signatures' ? 205 : 60);y-=8;await paragraph(text,{size:12,font:bold,color:ink,space:9});}
  async function table(block){
    const size=8.7,lh=12.3,pad=6,cols=block.widths.map(w=>w*CONTENT_W);
    const headerLines=block.headers.map((text,i)=>wrap(text,cols[i]-pad*2,size,bold));
    const headerHeight=Math.max(...headerLines.map(lines=>lines.length))*lh+pad*2;
    const drawRow=async(lines,height,isHeader=false)=>{
      let x=M;const top=y;
      for(let c=0;c<cols.length;c++){
        page.drawRectangle({x,y:top-height,width:cols[c],height,color:isHeader?shade:rgb(1,1,1),borderColor:rule,borderWidth:.45});
        for(let n=0;n<lines[c].length;n++)await draw(lines[c][n],x+pad,top-pad-size-n*lh,size,isHeader?bold:regular,ink);
        x+=cols[c];
      }
      y-=height;
    };
    const header=async()=>{await ensure(headerHeight+lh+pad*2);await drawRow(headerLines,headerHeight,true);};
    if (block.rows.length) {
      const firstRowLines = Math.max(...block.rows[0].map((text,i)=>wrap(text,cols[i]-pad*2,size).length));
      await ensure(headerHeight + Math.min(firstRowLines, 6) * lh + pad*2);
    }
    await header();
    for(const row of block.rows){
      let lines=row.map((text,i)=>wrap(text,cols[i]-pad*2,size));
      const maxLines=Math.max(...lines.map(a=>a.length));
      let done=0;
      while(done<maxLines){
        let available=Math.floor((y-BOTTOM-pad*2)/lh);
        if(available<1){await newPage();await header();available=Math.floor((y-BOTTOM-pad*2)/lh);}
        const remaining=maxLines-done;
        // Conserver une ligne usuelle entière ; scinder les cellules exceptionnellement longues.
        if(done===0 && remaining>available && remaining*lh+pad*2 < TOP-BOTTOM-headerHeight){
          await newPage();await header();available=Math.floor((y-BOTTOM-pad*2)/lh);
        }
        const count=Math.max(1,Math.min(remaining,available));
        await drawRow(lines.map(a=>a.slice(done,done+count)),count*lh+pad*2);
        done+=count;
        if(done<maxLines){await newPage();await header();}
      }
    }
    y-=10;
  }
  async function embed(dataUrl){const r=await rasterImage(dataUrl);return r.mime==='image/png'?pdf.embedPng(r.bytes):pdf.embedJpg(r.bytes);}
  await newPage();
  for(const block of options.blocks || reportBlocks(record,settings)){
    if(block.kind==='p'){
      const size=block.title?21:block.subtitle?12:block.small?8.2:block.status?9.5:10;
      await paragraph(block.text,{size,font:block.title||block.subtitle||block.status||block.bold?bold:regular,color:block.small?muted:ink,space:block.title?6:block.status?12:7});
    } else if(block.kind==='h')await heading(block.text);
    else if(block.kind==='table')await table(block);
    else if(block.kind==='signature'){
      const s=block.signature;
      await ensure(153);
      await paragraph(block.label,{size:10.5,font:bold,space:5});
      await paragraph(`Nom : ${val(s.name)}\nQualité : ${val(s.role)}\nHabilitation : ${val(s.habilitation)}\nDate : ${date(s.date)}`,{size:9.5,space:5});
      if(block.valid){
        const im=await embed(s.dataUrl),scale=Math.min(200/im.width,48/im.height,1);
        await ensure(im.height*scale+18);
        page.drawImage(im,{x:M,y:y-im.height*scale,width:im.width*scale,height:im.height*scale});y-=im.height*scale+6;
        await paragraph('Tracé rattaché à l’empreinte du constat établi.',{size:7.8,color:muted,space:8});
      } else {
        await ensure(48);y-=35;page.drawLine({start:{x:M,y},end:{x:M+210,y},thickness:.6,color:rule});y-=8;
        await paragraph('Signature à recueillir sur cet exemplaire ou via le circuit retenu.',{size:7.8,color:muted,space:8});
      }
    } else if(block.kind==='image'){
      const item=block.item,im=await embed(item.dataUrl);
      if (y < TOP - 150) await newPage();
      await heading(`Annexe ${block.index} - ${block.procedure ? block.purposeLabel : item.type==='sketch'?'Croquis':'Photographie'}`);
      await paragraph(val(item.name),{size:9.5,space:10});
      const caption=[val(item.caption),item.date?`Date déclarée : ${date(item.date)}`:'',item.location?`Emplacement : ${item.location}`:''].filter(Boolean).join('\n');
      const captionLines=wrap(caption,CONTENT_W,9);
      const captionReserve=Math.min(captionLines.length*12.8+15,130);
      const availableHeight=Math.max(120,y-BOTTOM-captionReserve-14);
      const scale=Math.min(CONTENT_W/im.width,availableHeight/im.height,1.5),w=im.width*scale,h=im.height*scale;
      page.drawImage(im,{x:M+(CONTENT_W-w)/2,y:y-h,width:w,height:h});y-=h+10;
      await paragraph(caption,{size:9,color:muted,space:10});
    }
  }
  const total=pages.length;
  for(let i=0;i<pages.length;i++){
    page=pages[i];
    page.drawLine({start:{x:M,y:34},end:{x:PAGE_W-M,y:34},thickness:.5,color:rule});
    await draw(options.footerLabel || 'Attachement Pro - '+(record.state==='draft'?'Brouillon':'Constat établi'),M,21,7.3,regular,muted);
    const label=`Page ${i+1} / ${total}`;await draw(label,PAGE_W-M-width(label,7.3),21,7.3,regular,muted);
  }
  return new Blob([await pdf.save()],{type:'application/pdf'});
}

/** DOCX éditable et natif OOXML, sans HTML déguisé en document Word. */
export async function exportDOCX(record, settings = {}) {
  const d=globalThis.docx;
  if(!d?.Document)throw new Error('Le moteur Word est indisponible. Rechargez l’application en ligne une fois.');
  const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,BorderStyle,ShadingType,AlignmentType,VerticalAlign,HeadingLevel,Footer,PageNumber,ImageRun}=d;
  const children=[];
  const run=(text,options={})=>new TextRun({text:str(text),font:'Arial',color:'000000',...options});
  const para=(text,options={})=>new Paragraph({children:str(text).split(/\r?\n/).flatMap((line,index)=>index?[new TextRun({break:1}),run(line,options.run)]:[run(line,options.run)]),spacing:{after:110,line:260},...options,run:undefined});
  const borders={top:{style:BorderStyle.SINGLE,size:4,color:'D9D9D9'},bottom:{style:BorderStyle.SINGLE,size:4,color:'D9D9D9'},left:{style:BorderStyle.SINGLE,size:4,color:'D9D9D9'},right:{style:BorderStyle.SINGLE,size:4,color:'D9D9D9'}};
  const table=(block)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},columnWidths:block.widths.map(w=>Math.round(9638*w)),layout:d.TableLayoutType.FIXED,rows:[block.headers,...block.rows].map((row,rowIndex)=>new TableRow({tableHeader:rowIndex===0,cantSplit:row.every(text => str(text).length < 1000),children:row.map((text,i)=>new TableCell({width:{size:Math.round(9638*block.widths[i]),type:WidthType.DXA},borders,verticalAlign:VerticalAlign.CENTER,margins:{top:95,bottom:95,left:95,right:95},shading:{type:ShadingType.CLEAR,color:'auto',fill:rowIndex===0?'E8EEF4':'FFFFFF'},children:[para(text,{spacing:{after:0,line:240},run:{size:18,bold:rowIndex===0}})]}))}))});
  const imageRun=async(url,maxWidth,maxHeight,alt)=>{
    const img=await rasterImage(url),size=rawImageSize(img.bytes,img.mime),scale=Math.min(maxWidth/size.width,maxHeight/size.height,1.5);
    return new ImageRun({type:img.mime==='image/png'?'png':'jpg',data:img.bytes,transformation:{width:Math.max(1,Math.round(size.width*scale)),height:Math.max(1,Math.round(size.height*scale))},altText:{title:alt,name:alt,description:alt}});
  };
  for(const block of reportBlocks(record,settings)){
    if(block.kind==='p')children.push(para(block.text,{...(block.title?{heading:HeadingLevel.TITLE,spacing:{after:150,line:300}}:{}),...(block.subtitle?{spacing:{after:150,line:270}}:{}),run:{size:block.title?38:block.subtitle?25:block.small?17:20,bold:!!(block.title||block.subtitle||block.status||block.bold),color:block.small?'4C5968':'000000'},keepNext:!!(block.title||block.subtitle)}));
    else if(block.kind==='h')children.push(para(block.text,{heading:HeadingLevel.HEADING_1,keepNext:true,spacing:{before:240,after:140,line:280},run:{size:24,bold:true}}));
    else if(block.kind==='table'){children.push(table(block));children.push(para('',{spacing:{after:60,line:80},run:{size:4}}));}
    else if(block.kind==='signature'){
      const s=block.signature;
      children.push(para(block.label,{keepNext:true,spacing:{before:120,after:90},run:{bold:true,size:21}}));
      children.push(para(`Nom : ${val(s.name)}\nQualité : ${val(s.role)}\nHabilitation : ${val(s.habilitation)}\nDate : ${date(s.date)}`,{keepNext:true,run:{size:19}}));
      if(block.valid){children.push(new Paragraph({children:[await imageRun(s.dataUrl,260,65,'Tracé de signature de '+val(s.name))],spacing:{after:80}}));children.push(para('Tracé rattaché à l’empreinte du constat établi.',{run:{size:16,color:'4C5968'}}));}
      else children.push(para('Signature :\n\n________________________________',{spacing:{after:150},run:{size:18}}));
    } else if(block.kind==='image'){
      const item=block.item;
      children.push(para(`Annexe ${block.index} - ${block.procedure ? block.purposeLabel : item.type==='sketch'?'Croquis':'Photographie'}`,{pageBreakBefore:true,heading:HeadingLevel.HEADING_1,keepNext:true,spacing:{after:140},run:{size:24,bold:true}}));
      children.push(para(val(item.name),{keepNext:true,run:{size:19}}));
      children.push(new Paragraph({children:[await imageRun(item.dataUrl,620,650,item.caption||item.name||'Annexe visuelle')],alignment:AlignmentType.CENTER,spacing:{after:120}}));
      children.push(para([val(item.caption),item.date?`Date déclarée : ${date(item.date)}`:'',item.location?`Emplacement : ${item.location}`:''].filter(Boolean).join('\n'),{run:{size:18,color:'4C5968'}}));
    }
  }
  const doc=new Document({title:recordTitle(record),subject:record.meta?.title||'Constat de travaux',creator:record.meta?.author||settings.author||'Attachement Pro',description:'Attachement de travaux établi dans Attachement Pro',styles:{default:{document:{run:{font:'Arial',size:20,color:'000000'},paragraph:{spacing:{line:260,after:110}}},heading1:{run:{font:'Arial',size:24,bold:true,color:'000000'}},title:{run:{font:'Arial',size:38,bold:true,color:'000000'}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:963,right:1134,bottom:963,left:1134,header:425,footer:425}}},footers:{default:new Footer({children:[new Paragraph({children:[run(`${recordTitle(record)} - ${record.state==='draft'?'BROUILLON':'ÉTABLI'}    |    Page `,{size:15,color:'4C5968'}),new TextRun({children:[PageNumber.CURRENT],size:15}),run(' / ',{size:15}),new TextRun({children:[PageNumber.TOTAL_PAGES],size:15})],alignment:AlignmentType.RIGHT,spacing:{after:0}})]})},children}]});
  const blob=await Packer.toBlob(doc);
  return blob.type===MIME_DOCX?blob:new Blob([blob],{type:MIME_DOCX});
}

/** Registre CSV UTF-8 ; neutralise les formules à l’ouverture dans un tableur. */
export function exportCSV(records) {
  const header=['Commande','Numéro','Type','État','Chantier','Entreprise','Objet','Date du fait','Date du constat','Présentation','Position entreprise','Transmission','Pièces jointes','Identifiant local'];
  const cell=value=>{
    let s=str(value);
    if(/^[\t\r\n ]*[=+\-@]/.test(s))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  };
  const rows=records.map(r=>[r.meta?.commandNumber,r.number??'',TYPE_LABELS[r.documentType]||TYPE_LABELS.initial,r.state==='draft'?'Brouillon':'Établi',r.meta?.operation,r.meta?.enterprise,r.meta?.title,r.meta?.factDate,r.meta?.constatDate,r.followUp?.presentationDate,RESPONSES[r.followUp?.companyResponse]||RESPONSES.pending,r.followUp?.dispatchDate,r.evidence?.length||0,r.id]);
  return new Blob(['\uFEFF'+[header,...rows].map(row=>row.map(cell).join(';')).join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
}


/** Projet indépendant de PV de présentation ; aucune signature d’attachement réutilisée. */
export async function exportPresentationPV(record, settings = {}) {
  const m=record.meta||{},f=record.followUp||{},blocks=[];
  const p=(text,options={})=>blocks.push({kind:'p',text:str(text),...options});
  const h=text=>blocks.push({kind:'h',text});
  const kv=(label,value)=>p(`${label} : ${val(value)}`);
  p('PROJET DE PROCÈS-VERBAL DE PRÉSENTATION',{title:true});
  p(`${recordTitle(record)} - Commande ${val(m.commandNumber)}`,{subtitle:true});
  p('PROJET À VÉRIFIER ET À FAIRE SIGNER',{status:true});
  p('Ce projet reprend les informations déclarées dans le dossier. Vérifier les faits, les dates et les personnes présentes, compléter les mentions manquantes, puis recueillir les signatures selon le circuit du marché et annexer la copie signée. Ce fichier ne prouve pas, à lui seul, la présentation ni l’acceptation de l’attachement.',{small:true});

  h('Identification du dossier');
  kv('N° de commande',m.commandNumber);
  kv('N° d’attachement',record.number == null ? 'Brouillon sans numéro attribué' : record.number);
  kv('Entreprise titulaire',m.enterprise);
  kv('Objet du marché',m.marketObject);
  kv('Objet de l’attachement présenté',m.title);
  kv('Chantier ou opération',m.operation);
  if(m.framework){kv('Ordre d’exécution ou bon de commande',m.executionOrder);kv('Unité de production',m.productionUnit);}
  if(record.state==='draft')p('L’attachement de référence est encore un brouillon. Établir et numéroter l’attachement avant d’utiliser ce projet pour constater sa présentation.',{bold:true});

  h('Présentation de l’attachement');
  kv('Date de présentation déclarée',date(f.presentationDate));
  if(f.presentationTime)kv('Heure de présentation déclarée',f.presentationTime);
  kv('Date du procès-verbal',date(f.pvDate));
  kv('Référence du procès-verbal',f.pvReference);
  kv('Lieu de la présentation',f.pvLocation);
  kv('Position de l’entreprise déclarée dans le dossier',RESPONSES[f.companyResponse]||RESPONSES.pending);
  kv('Circonstances de la présentation à vérifier',f.pvCircumstances);

  h('Personnes présentes lors de la présentation');
  const hasPVPeople=Array.isArray(f.pvParticipants)&&f.pvParticipants.length>0;
  const people=hasPVPeople?f.pvParticipants:(record.participants||[]);
  if(!hasPVPeople)p('La liste ci-dessous est préremplie à partir des représentants renseignés pour le constat. Leur présence à la présentation doit être confirmée ou corrigée avant la signature du procès-verbal.',{small:true});
  const rows=people.length?people.map(person=>[
    `${val(person.name)}${person.company?'\n'+person.company:''}`,
    `${PARTIES[person.party]||'Intervenant'}${person.role?'\n'+person.role:''}${person.habilitation?'\nHabilitation : '+person.habilitation:''}`,
    hasPVPeople?(person.present===false?'Absent':'Présent'):'À confirmer'
  ]):[['À compléter','Maîtrise d’œuvre','À confirmer'],['À compléter','Entreprise','À confirmer']];
  blocks.push({kind:'table',headers:['Identité et organisme','Qualité et habilitation','Présence à la présentation'],rows,widths:[.36,.42,.22]});

  h('Refus de signer et réserves');
  kv('Refus de signer - motif déclaré',f.refusalReason);
  kv('Réserves formulées par l’entreprise',f.reservations);
  if(!f.refusalReason&&!f.reservations)p('Confirmer la situation constatée lors de la présentation. L’absence de texte dans ce projet ne vaut ni accord ni absence de réserves.',{small:true});
  h('Observations écrites et suites à donner');
  kv('Observations écrites déclarées',f.observations);
  kv('Date de réception des observations',date(f.observationsDate));
  if(f.humanDecision){kv('Décision de suivi saisie',f.humanDecision);kv('Date de la décision',date(f.humanDecisionDate));if(f.humanDecisionAuthor)kv('Responsable ayant consigné la décision',f.humanDecisionAuthor);}
  p('Repère de procédure : en cas de refus de signer ou de signature avec réserves, la présentation est consignée dans un procès-verbal et les observations écrites sont adressées dans les dix jours suivant la présentation, selon l’extrait RGF00099 fourni (page 36). La situation et les preuves sont à vérifier par le responsable du marché.',{small:true});

  h('Signatures du procès-verbal à recueillir');
  p('Les emplacements ci-dessous concernent exclusivement ce procès-verbal. Aucun tracé provenant de l’attachement n’a été repris.',{small:true});
  for(const [party,label] of [['moe','Pour le maître d’œuvre'],['enterprise','Pour l’entreprise']]){
    const source=f.pvSignatories?.[party]||{};
    blocks.push({kind:'signature',party,label,signature:{name:source.name||'À compléter',role:source.role||'À compléter',habilitation:source.habilitation||'À compléter',date:'',dataUrl:'',versionHash:''},valid:false});
  }
  p('En cas de refus de signer le procès-verbal, consigner le refus et les circonstances effectivement constatées dans la copie finalisée. Ne pas ajouter une signature au nom d’un représentant absent ou refusant de signer.',{small:true});

  const pieces=(f.procedureFiles||[]).filter(item=>['convocation','observations','signedCopy'].includes(item.purpose));
  if(pieces.length){
    h('Pièces de procédure déjà présentes au dossier');
    blocks.push({kind:'table',headers:['Nature','Fichier et légende'],widths:[.26,.74],rows:pieces.map(item=>[
      {convocation:'Convocation',observations:'Observations écrites',signedCopy:'Exemplaire signé'}[item.purpose],`${val(item.name)}${item.caption?'\n'+item.caption:''}`
    ])});
    p('Cette liste ne prouve pas la pertinence des pièces pour la présentation décrite. Vérifier les pièces et les joindre séparément au procès-verbal finalisé.',{small:true});
  }
  h('Références et préparation du projet');
  p('Projet préparé dans Attachement Pro à partir des informations du dossier et des repères de rédaction de RGF00099, version 01 du 03/03/2026, extraits transmis pages 33 à 43.',{small:true});
  if(m.author||settings.author)kv('Rédacteur déclaré',m.author||settings.author);
  return renderPDF(record,settings,{blocks,project:true,title:'PROJET DE PROCÈS-VERBAL DE PRÉSENTATION',headerTitle:'PROJET DE PV DE PRÉSENTATION',footerLabel:'PROJET de PV - À vérifier et à faire signer'});
}

let crcTable;
function crc32(bytes) {
  if(!crcTable){crcTable=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;crcTable[n]=c>>>0;}}
  let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&0xff]^(crc>>>8);return (crc^0xffffffff)>>>0;
}
function zipHeader(length) { const bytes=new Uint8Array(length);return {bytes,view:new DataView(bytes.buffer)}; }
/** Archive ZIP STORE conforme, UTF-8, CRC32 ; pas de dépendance ni de réseau. */
export function zipStore(files, generatedAt = new Date()) {
  if(files.length>65535)throw new Error('Le dossier contient trop de fichiers pour cette archive ZIP.');
  const encoder=new TextEncoder(),chunks=[],central=[];
  const y=Math.min(2107,Math.max(1980,generatedAt.getFullYear()));
  const dosDate=((y-1980)<<9)|((generatedAt.getMonth()+1)<<5)|generatedAt.getDate();
  const dosTime=(generatedAt.getHours()<<11)|(generatedAt.getMinutes()<<5)|Math.floor(generatedAt.getSeconds()/2);
  let offset=0;
  for(const file of files){
    const name=encoder.encode(file.name),data=file.bytes instanceof Uint8Array?file.bytes:new Uint8Array(file.bytes);
    if(name.length>65535||data.length>0xffffffff||offset+data.length+name.length+30>0xffffffff)throw new Error('Archive trop volumineuse. Réduisez les pièces jointes avant de réessayer.');
    const crc=crc32(data),local=zipHeader(30);
    local.view.setUint32(0,0x04034b50,true);local.view.setUint16(4,20,true);local.view.setUint16(6,0x0800,true);local.view.setUint16(8,0,true);local.view.setUint16(10,dosTime,true);local.view.setUint16(12,dosDate,true);local.view.setUint32(14,crc,true);local.view.setUint32(18,data.length,true);local.view.setUint32(22,data.length,true);local.view.setUint16(26,name.length,true);local.view.setUint16(28,0,true);
    chunks.push(local.bytes,name,data);
    const item=zipHeader(46);
    item.view.setUint32(0,0x02014b50,true);item.view.setUint16(4,20,true);item.view.setUint16(6,20,true);item.view.setUint16(8,0x0800,true);item.view.setUint16(10,0,true);item.view.setUint16(12,dosTime,true);item.view.setUint16(14,dosDate,true);item.view.setUint32(16,crc,true);item.view.setUint32(20,data.length,true);item.view.setUint32(24,data.length,true);item.view.setUint16(28,name.length,true);item.view.setUint16(30,0,true);item.view.setUint16(32,0,true);item.view.setUint16(34,0,true);item.view.setUint16(36,0,true);item.view.setUint32(38,0,true);item.view.setUint32(42,offset,true);
    central.push(item.bytes,name);offset+=30+name.length+data.length;
  }
  const centralLength=central.reduce((sum,b)=>sum+b.length,0);
  if(offset+centralLength+22>0xffffffff)throw new Error('Archive trop volumineuse. Réduisez les pièces jointes avant de réessayer.');
  const end=zipHeader(22);
  end.view.setUint32(0,0x06054b50,true);end.view.setUint16(4,0,true);end.view.setUint16(6,0,true);end.view.setUint16(8,files.length,true);end.view.setUint16(10,files.length,true);end.view.setUint32(12,centralLength,true);end.view.setUint32(16,offset,true);end.view.setUint16(20,0,true);
  return new Blob([...chunks,...central,end.bytes],{type:'application/zip'});
}
function attachmentBytes(item) {
  const match=str(item.dataUrl).match(/^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/\r\n]+=*)$/);
  if(!match)throw new Error(`Pièce non exportable : ${val(item.name)}. Seuls les fichiers PNG, JPEG, WebP et PDF enregistrés dans le dossier sont acceptés.`);
  const binary=atob(match[2].replace(/\s/g,''));
  return {bytes:Uint8Array.from(binary,c=>c.charCodeAt(0)),extension:{'image/png':'png','image/jpeg':'jpg','image/webp':'webp','application/pdf':'pdf'}[match[1]]};
}
function safeAttachmentName(name,extension) {
  const stem=str(name).replace(/\.[^.]*$/,'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_-]/g,'_').replace(/^_+|_+$/g,'').slice(0,110)||'piece';
  return stem+'.'+extension;
}

/** Un dossier autonome : PDF, Word, restauration JSON et pièces originales individuelles. */
export async function exportDossierZIP(record, settings = {}) {
  const exportedAt=new Date(),encoder=new TextEncoder();
  // Copier l’état avant les exports évite de mélanger deux états si l’écran évolue en parallèle.
  const snapshot=JSON.parse(JSON.stringify(record));
  const copiedSettings=JSON.parse(JSON.stringify(settings));
  const [pdf,docx]=await Promise.all([exportPDF(snapshot,copiedSettings),exportDOCX(snapshot,copiedSettings)]);
  const backup={app:'attachement-pro',schemaVersion:1,exportedAt:exportedAt.toISOString(),documents:[snapshot],projects:[],settings:copiedSettings};
  const files=[
    {name:reportFilename(snapshot,'pdf'),bytes:new Uint8Array(await pdf.arrayBuffer())},
    {name:reportFilename(snapshot,'docx'),bytes:new Uint8Array(await docx.arrayBuffer())},
    {name:'sauvegarde-dossier.json',bytes:encoder.encode(JSON.stringify(backup,null,2))}
  ];
  const inventory=[];
  for(const [directory,list] of [['pieces-constat',snapshot.evidence||[]],['pieces-procedure',snapshot.followUp?.procedureFiles||[]]]){
    for(let i=0;i<list.length;i++){
      const item=list[i],{bytes,extension}=attachmentBytes(item);
      const prefix=String(i+1).padStart(3,'0');
      const purpose=directory==='pieces-procedure'&&item.purpose?str(item.purpose).replace(/[^A-Za-z0-9_-]/g,'_')+'_':'';
      const name=`${directory}/${prefix}_${purpose}${safeAttachmentName(item.name,extension)}`;
      files.push({name,bytes});
      inventory.push(`${name}\n  Nom dans le dossier : ${val(item.name)}${item.caption?'\n  Légende : '+item.caption:''}`);
    }
  }
  const readme=[
    'DOSSIER ATTACHEMENT PRO',
    '',
    recordTitle(snapshot),
    'Commande : '+val(snapshot.meta?.commandNumber),
    'État : '+stateLabel(snapshot),
    'Export : '+exportedAt.toISOString(),
    '',
    'CONTENU',
    '- PDF : version paginée de l’attachement.',
    '- DOCX : version Word modifiable.',
    '- sauvegarde-dossier.json : à importer dans Attachement Pro pour restaurer ce dossier, ses pièces et les paramètres inclus.',
    '- pieces-constat/ : fichiers joints au constat, numérotés dans l’ordre du dossier.',
    '- pieces-procedure/ : fichiers de procédure et de suivi ajoutés au dossier.',
    '',
    'Les PDF joints au dossier sont des fichiers séparés : ils ne sont pas fusionnés dans le PDF de l’attachement.',
    'Les pièces de procédure ne sont pas couvertes par l’empreinte du constat gelé. Un projet de procès-verbal reste un projet tant qu’une copie finalisée et signée n’a pas été jointe.',
    'Les tracés manuscrits reproduits ne constituent pas, à eux seuls, une signature électronique qualifiée.',
    '',
    'INVENTAIRE DES PIÈCES',
    inventory.length?inventory.join('\n\n'):'Aucune pièce jointe.',
    ''
  ].join('\r\n');
  files.push({name:'LISEZ-MOI.txt',bytes:encoder.encode(readme)});
  return zipStore(files,exportedAt);
}
