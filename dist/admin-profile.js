import {db,readableError} from './firebase-client.js?v=20261001-story-pages';
import {doc,onSnapshot,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import {fingerprint} from './song-model.js?v=20261001-story-pages';
const $=s=>document.querySelector(s);
const clone=v=>JSON.parse(JSON.stringify(v));
const defaults=()=>clone(window.VAULT_PROFILE_DEFAULTS||{});
let data=defaults(),version=null,dirty=false,busy=false,stop=null,account=null,ready=false,sequence=0;
const fields={imageUrl:'profile-image',imageAlt:'profile-image-alt',eyebrow:'profile-eyebrow',stageName:'profile-stage',headline:'profile-headline',lead:'profile-lead',quote:'profile-quote',aboutTitle:'profile-about-title',bio:'profile-bio',fanTitle:'profile-fan-title',fanNote:'profile-fan-note'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=(text,kind='')=>{$('#profile-status').textContent=text;$('#profile-status').className='admin-status '+kind;};
export const profileUnsaved=()=>dirty||busy;
export function stopProfile(){sequence++;stop?.();stop=null;account=null;ready=false;dirty=false;const form=$('#profile-fields');if(form)form.disabled=true;const save=$('#save-profile');if(save)save.disabled=true;}
function lines(value){return String(value??'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);}
function serializeRows(rows,keys){return (rows||[]).map(row=>keys.map(k=>String(row?.[k]??'')).join(' | ')).join('\n');}
function fill(){for(const [key,id] of Object.entries(fields))$('#'+id).value=data[key]??'';$('#profile-tags').value=(data.tags||[]).join('\n');$('#profile-facts').value=serializeRows(data.facts,['label','value']);$('#profile-skills').value=(data.skills||[]).join('\n');$('#profile-roles').value=serializeRows(data.roles,['name','en']);$('#profile-career').value=serializeRows(data.career,['time','title','text']);$('#profile-dalab').value=serializeRows(data.daLab,['title','year','note']);$('#profile-solo').value=serializeRows(data.solo,['title','year','note']);$('#profile-fan-notes').value=(data.fanNotes||[]).join('\n\n');$('#profile-social').value=serializeRows(data.social,['label','value','url']);}
function parseRows(text,count){return lines(text).map(line=>{const parts=line.split('|').map(x=>x.trim());while(parts.length<count)parts.push('');return parts.slice(0,count);});}
function collect(){const next={...data};for(const [key,id] of Object.entries(fields))next[key]=$('#'+id).value.trim();next.imageUrl=next.imageUrl||'assets/profile/about.jpg';if(!(/^https:\/\//.test(next.imageUrl)||next.imageUrl.startsWith('assets/')))throw new Error('Hình ảnh cần là URL HTTPS hoặc đường dẫn assets/.');next.tags=lines($('#profile-tags').value);next.facts=parseRows($('#profile-facts').value,2).map(([label,value])=>({label,value})).filter(x=>x.label&&x.value);next.skills=lines($('#profile-skills').value);next.roles=parseRows($('#profile-roles').value,2).map(([name,en])=>({name,en})).filter(x=>x.name);next.career=parseRows($('#profile-career').value,3).map(([time,title,text])=>({time,title,text})).filter(x=>x.time&&x.title);next.daLab=parseRows($('#profile-dalab').value,3).map(([title,year,note])=>({title,year,note})).filter(x=>x.title);next.solo=parseRows($('#profile-solo').value,3).map(([title,year,note])=>({title,year,note})).filter(x=>x.title);next.fanNotes=String($('#profile-fan-notes').value).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);next.social=parseRows($('#profile-social').value,3).map(([label,value,url])=>({label,value,url})).filter(x=>x.label&&x.value).map(x=>{if(x.url&&!(/^https:\/\//.test(x.url)||/^mailto:/.test(x.url)))throw new Error('URL mạng xã hội phải bắt đầu bằng HTTPS hoặc mailto:.');return x;});for(const [key,max] of Object.entries({imageUrl:2048,imageAlt:300,eyebrow:120,stageName:120,headline:300,lead:600,quote:500,aboutTitle:160,bio:3000,fanTitle:180,fanNote:500}))if(String(next[key]??'').length>max)throw new Error(`${key} vượt quá ${max} ký tự.`);return next;}
export async function startProfile(user){
 stopProfile();const token=sequence;account=user;status('Đang đồng bộ profile với Firebase…');
 try{
  const ref=doc(db,'settings','profile');
  const initial=defaults();
  if(!initial.stageName)throw new Error('PROFILE_DEFAULTS_MISSING');
  await runTransaction(db,async tx=>{
   const current=await tx.get(ref);
   if(token!==sequence)throw new Error('PROFILE_CANCELLED');
   if(!current.exists())tx.set(ref,{...initial,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.uid});
  });
  if(token!==sequence)return;
  stop=onSnapshot(ref,{includeMetadataChanges:true},snap=>{
   if(token!==sequence||snap.metadata.fromCache||snap.metadata.hasPendingWrites)return;
   if(!snap.exists()){ready=false;$('#profile-fields').disabled=true;$('#save-profile').disabled=true;status('Không tìm thấy profile trên Firebase. Đăng nhập lại để khởi tạo.','error');return;}
   ready=true;$('#profile-fields').disabled=busy;$('#save-profile').disabled=busy;
   if(!dirty&&!busy){data={...defaults(),...snap.data()};version=fingerprint(snap.data());fill();status('Profile đã lưu trên Firebase. Bạn có thể chỉnh sửa và bấm Lưu profile.','success');}
  },e=>{if(token!==sequence)return;ready=false;$('#profile-fields').disabled=true;$('#save-profile').disabled=true;status('Chưa đọc được settings/profile. '+readableError(e),'error');});
 }catch(e){if(token!==sequence)return;ready=false;$('#profile-fields').disabled=true;$('#save-profile').disabled=true;status('Chưa đồng bộ được profile. '+readableError(e),'error');}
}
$('#profile-form').addEventListener('submit',e=>e.preventDefault());
$('#profile-form').addEventListener('input',()=>{dirty=true;});
$('#profile-reset').addEventListener('click',()=>{if(busy||!confirm('Khôi phục nội dung profile mặc định? Sau đó bấm Lưu profile để áp dụng.'))return;data=defaults();fill();dirty=true;status('Đã nạp nội dung mặc định vào biểu mẫu.','success');});
$('#save-profile').addEventListener('click',async()=>{if(!ready||busy||!account)return;let value;try{value=collect();}catch(e){status(e.message,'error');return;}busy=true;$('#profile-fields').disabled=true;$('#save-profile').disabled=true;const token=sequence;try{const ref=doc(db,'settings','profile');await runTransaction(db,async tx=>{const old=await tx.get(ref);if((old.exists()?fingerprint(old.data()):null)!==version)throw new Error('CONFLICT');tx.set(ref,{...value,updatedAt:serverTimestamp(),updatedBy:account.uid});});if(token!==sequence)return;dirty=false;status('Đã lưu profile. Trang người dùng sẽ tự cập nhật.','success');startProfile(account);}catch(e){status(e.message==='CONFLICT'?'Profile đã đổi ở nơi khác. Tải lại rồi chỉnh sửa lại.':readableError(e),'error');}finally{busy=false;if(token===sequence){$('#profile-fields').disabled=!ready;$('#save-profile').disabled=!ready;}}});
