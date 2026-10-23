import {uid, today, isRasterData} from './core.js';
export const readDataURL = file => new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Impossible de lire ce fichier.'));reader.readAsDataURL(file);});
export const loadImage = src => new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Image non lisible. Utiliser une image JPEG, PNG ou WebP.'));i.src=src;});
export async function importEvidence(file,quality='standard'){
 if(file.size>25*1024*1024)throw new Error(`${file.name} dépasse 25 Mo. Réduisez le fichier avant l’import.`);
 if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)){const bytes=new Uint8Array(await file.slice(0,5).arrayBuffer());if(String.fromCharCode(...bytes)!=='%PDF-')throw new Error('Le fichier ne contient pas un PDF valide.');let dataUrl=await readDataURL(file);dataUrl=dataUrl.replace(/^data:[^;]+;/,'data:application/pdf;');return {id:uid(),type:'document',name:file.name,mime:'application/pdf',dataUrl,caption:'',date:today(),location:'',width:0,height:0,size:file.size,originalSize:file.size};}
 if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Formats acceptés : JPEG, PNG, WebP et PDF. Pour HEIC, exporter la photo en JPEG.');
 const original=await readDataURL(file),img=await loadImage(original);
 const maximum=quality==='high'?2560:1600,ratio=Math.min(1,maximum/Math.max(img.naturalWidth,img.naturalHeight));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const dataUrl=canvas.toDataURL('image/jpeg',quality==='high'?.9:.83);
 return {id:uid(),type:'photo',name:file.name.replace(/\.[^.]+$/,'.jpg'),originalName:file.name,mime:'image/jpeg',dataUrl,caption:'',date:today(),location:'',width:canvas.width,height:canvas.height,size:Math.floor(dataUrl.length*.75),originalSize:file.size,optimized:true};
}
export function downloadBlob(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
export function dataURLBlob(url){const [head,data]=url.split(',');const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));return new Blob([bytes],{type:head.match(/^data:([^;]+)/)?.[1]||'application/octet-stream'});}
// Canvas logique stable : les coordonnées sont indépendantes de la taille d’écran.
export async function drawingBoard(canvas,{background='',signature=false}={}){
 const ctx=canvas.getContext('2d');canvas.width=signature?1000:1400;canvas.height=signature?360:900;canvas.style.touchAction='none';
 let base=null;if(background&&isRasterData(background))base=await loadImage(background);
 const strokes=[],redoStack=[];let active=null,tool='pen',color='#123f3a',width=signature?3:4,text='';let grid=!signature&&!background;
 const point=e=>{const box=canvas.getBoundingClientRect();return {x:(e.clientX-box.left)*canvas.width/box.width,y:(e.clientY-box.top)*canvas.height/box.height};};
 function paintStroke(s){ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.lineJoin='round';const a=s.points[0],b=s.points.at(-1);if(!a)return;
  if(s.tool==='text'){ctx.font=`${s.width*4+16}px Arial`;ctx.fillText(s.text,a.x,a.y);return;}
  if(s.tool==='rect'){ctx.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);return;}
  ctx.beginPath();ctx.moveTo(a.x,a.y);
  if(['line','arrow'].includes(s.tool))ctx.lineTo(b.x,b.y);else for(const p of s.points)ctx.lineTo(p.x,p.y);
  if(s.points.length===1){ctx.lineTo(a.x+.1,a.y+.1);}ctx.stroke();
  if(s.tool==='arrow'){const angle=Math.atan2(b.y-a.y,b.x-a.x),len=20+s.width;ctx.beginPath();ctx.moveTo(b.x-len*Math.cos(angle-.45),b.y-len*Math.sin(angle-.45));ctx.lineTo(b.x,b.y);ctx.lineTo(b.x-len*Math.cos(angle+.45),b.y-len*Math.sin(angle+.45));ctx.stroke();}
 }
 function render(){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);if(grid){ctx.strokeStyle='#e8eeed';ctx.lineWidth=1;ctx.beginPath();for(let x=0;x<canvas.width;x+=35){ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);}for(let y=0;y<canvas.height;y+=35){ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);}ctx.stroke();}
  if(base){const f=Math.min(canvas.width/base.naturalWidth,canvas.height/base.naturalHeight);ctx.drawImage(base,(canvas.width-base.naturalWidth*f)/2,(canvas.height-base.naturalHeight*f)/2,base.naturalWidth*f,base.naturalHeight*f);}
  for(const s of strokes)paintStroke(s);if(active)paintStroke(active);
 }
 function down(e){e.preventDefault();canvas.setPointerCapture(e.pointerId);active={tool,color:tool==='eraser'?'#fff':color,width:tool==='eraser'?width*6:width,text,points:[point(e)]};render();}
 function move(e){if(!active)return;e.preventDefault();if(['line','arrow','rect'].includes(active.tool))active.points=[active.points[0],point(e)];else if(active.tool!=='text')active.points.push(point(e));render();}
 function up(e){if(!active)return;strokes.push(active);active=null;redoStack.length=0;render();}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);render();
 return {setTool:v=>{tool=v;},setColor:v=>{color=v;},setWidth:v=>{width=Number(v);},setText:v=>{text=v;},toggleGrid:()=>{grid=!grid;render();},undo:()=>{if(strokes.length)redoStack.push(strokes.pop());render();},redo:()=>{if(redoStack.length)strokes.push(redoStack.pop());render();},clear:()=>{strokes.length=0;redoStack.length=0;render();},isEmpty:()=>!strokes.length&&!base,export:()=>canvas.toDataURL('image/png'),destroy:()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);}};
}
