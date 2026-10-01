(async()=>{
 let stop,timeout,receivedServer=false;
 const emit=detail=>{window.VAULT_REMOTE=detail;window.dispatchEvent(new CustomEvent('vault-data',{detail}));};
 try{
  timeout=setTimeout(()=>emit({status:'error',message:'Kết nối đang chậm. Vui lòng kiểm tra Internet; website vẫn đang chờ dữ liệu Firebase.'}),15000);
  const [{db,readableError},{collection,onSnapshot},{publicSong}]=await Promise.all([import('./firebase-client.js?v=20261001-story-pages'),import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js'),import('./song-model.js?v=20261001-story-pages')]);
  stop=onSnapshot(collection(db,'songs'),{includeMetadataChanges:true},snapshot=>{
   if(snapshot.metadata.fromCache){if(receivedServer)emit({status:'error',message:'Đang chờ đồng bộ lại. Hiển thị dữ liệu Firebase nhận gần nhất.'});return;}
   receivedServer=true;clearTimeout(timeout);let skipped=0;
   const songs=snapshot.docs.flatMap(doc=>{try{return [publicSong(doc)];}catch{skipped++;return [];}}).sort((a,b)=>(b.year??0)-(a.year??0)||a.title.localeCompare(b.title,'vi'));
   emit({status:'live',songs,message:skipped?`${skipped} bản ghi thiếu tên bài hát đang được ẩn.`:''});
  },error=>{clearTimeout(timeout);emit({status:'error',message:readableError(error)});});
 }catch{clearTimeout(timeout);emit({status:'error',message:'Không tải được Firebase. Mở website qua HTTP/HTTPS và kiểm tra Internet.'});}
 window.addEventListener('pagehide',()=>{clearTimeout(timeout);stop?.();},{once:true});
})();
