// IndexedDB : transactions atomiques, contrôle des modifications concurrentes.
export const APP_SCOPE=new URL('../',import.meta.url).pathname;
const DB_NAME=`attachement-pro-v1:${APP_SCOPE}`;let dbPromise;
export function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{if(!globalThis.indexedDB)return reject(new Error('Ce navigateur ne permet pas la sauvegarde locale.'));const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;const docs=db.createObjectStore('documents',{keyPath:'id'});docs.createIndex('scopeNumber','scopeNumber',{unique:true});db.createObjectStore('projects',{keyPath:'id'});db.createObjectStore('settings',{keyPath:'id'});};req.onsuccess=()=>{req.result.onversionchange=()=>req.result.close();resolve(req.result);};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Fermer les autres onglets de l’application pour ouvrir la base.'));});return dbPromise;}
function requestPromise(r){return new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function all(store){const db=await openDB();return requestPromise(db.transaction(store).objectStore(store).getAll());}
export async function get(store,id){const db=await openDB();return requestPromise(db.transaction(store).objectStore(store).get(id));}
export async function put(store,value,expectedUpdatedAt){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');const os=tx.objectStore(store);let failure;tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(failure||tx.error||new Error('La sauvegarde locale a échoué.'));tx.onerror=()=>{};if(expectedUpdatedAt!==undefined){const req=os.get(value.id);req.onsuccess=()=>{if(!req.result||req.result.updatedAt!==expectedUpdatedAt){failure=new Error(!req.result?'Ce document a été supprimé dans un autre onglet. Exportez votre saisie avant de fermer ce dossier.':'Ce document a été modifié dans un autre onglet. Exportez votre saisie puis rouvrez le document.');failure.name='ConflictError';tx.abort();}else os.put(value);};}else os.put(value);});}
export async function remove(store,id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export async function saveSettings(settings){return put('settings',{...settings,id:'main'});}
export async function loadSettings(){return (await get('settings','main'))||{};}
export async function importBatch(documents,projects,settings,expectedVersions={}){
 if(!expectedVersions||typeof expectedVersions!=='object'||Array.isArray(expectedVersions)||![Object.prototype,null].includes(Object.getPrototypeOf(expectedVersions)))throw new Error('Les versions attendues pour la restauration sont invalides.');
 const entries=documents.map(value=>{
  if(!Object.prototype.hasOwnProperty.call(expectedVersions,value.id))throw new Error('Version attendue manquante : recommencez la vérification de la restauration.');
  const expected=expectedVersions[value.id];
  if(expected!==null&&typeof expected!=='string')throw new Error('Version attendue invalide : recommencez la vérification de la restauration.');
  return {value,expected};
 });
 const db=await openDB();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['documents','projects','settings'],'readwrite');
  const store=tx.objectStore('documents');let failure,aborted=false,remaining=entries.length;
  tx.oncomplete=()=>resolve();
  tx.onerror=()=>{};
  tx.onabort=()=>reject(failure||tx.error||new Error('Import annulé : aucune donnée modifiée.'));
  const abort=error=>{if(aborted)return;aborted=true;failure=error;tx.abort();};
  const writeAll=()=>{
   if(aborted)return;
   try{
    for(const {value} of entries)store.put(value);
    for(const project of projects)tx.objectStore('projects').put(project);
    if(settings)tx.objectStore('settings').put({...settings,id:'main'});
   }catch(error){abort(error);}
  };
  if(!remaining){writeAll();return;}
  // Toutes les lectures et écritures restent dans la même transaction.
  // Une arrivée, suppression ou modification depuis la confirmation annule tout.
  for(const {value,expected} of entries){
   const request=store.get(value.id);
   request.onsuccess=()=>{
    if(aborted)return;
    const current=request.result;
    if(expected===null?current!==undefined:!current||current.updatedAt!==expected){
     const error=new Error('Un dossier a été ajouté, modifié ou supprimé depuis la vérification. Aucun élément n’a été restauré. Recommencez l’import.');
     error.name='ConflictError';abort(error);return;
    }
    remaining--;if(!remaining)writeAll();
   };
  }
 });
}
