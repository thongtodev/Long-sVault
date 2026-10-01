export function vinylTheme(r){return String(r.category||'').trim().toLowerCase()==='dalab'||/\bda\s*lab\b/i.test(String(r.artist||''))?'burgundy':'pink';}
export const CATEGORIES=['underground','soundcloud','dalab','solo','other'];
const ALLOWED_HOSTS={youtube:['youtube.com','www.youtube.com','m.youtube.com','youtu.be','music.youtube.com'],spotify:['open.spotify.com'],appleMusic:['music.apple.com'],itunes:['itunes.apple.com','music.apple.com'],soundcloud:['soundcloud.com','www.soundcloud.com','m.soundcloud.com','on.soundcloud.com']};
const text=value=>typeof value==='string'?value.normalize('NFC'):'';
export function safeLink(value,kind){if(!value)return '';try{const u=new URL(value.trim());if(u.protocol!=='https:'||u.username||u.password)return '';if(kind&&!(ALLOWED_HOSTS[kind]||[]).includes(u.hostname))return '';return u.href;}catch{return '';}}
export function validateSong(input){
 const title=text(input.title).trim(),artist=text(input.artist).trim(),category=text(input.category).trim();
 if(!title||title.length>300)throw new Error('Tên ca khúc cần có từ 1 đến 300 ký tự.');
 if(artist.length>500)throw new Error('Nghệ sĩ tối đa 500 ký tự.');
 if(!category||category.length>80)throw new Error('Nhập category, tối đa 80 ký tự.');
 const year=input.year===''||input.year==null?null:Number(input.year);
 if(year!==null&&(!Number.isInteger(year)||year<1800||year>2100))throw new Error('Năm phải từ 1800 đến 2100, hoặc để trống.');
 const data={title,artist,category,year};
 for(const [key,max] of Object.entries({date:100,description:20000,detail:2000,meta:500,lyric:50000})){data[key]=text(input[key]).trim();if(data[key].length>max)throw new Error(`${key} tối đa ${max} ký tự.`);}
 for(const key of Object.keys(ALLOWED_HOSTS)){const raw=text(input[key]).trim();data[key]=safeLink(raw,key);if(raw.length>2048||(raw&&!data[key]))throw new Error(`Liên kết ${key} không hợp lệ. Dùng HTTPS và đúng nền tảng.`);}
 return data;
}
// Reading is deliberately tolerant of optional/missing fields in existing songs.
export function publicSong(snapshot){const raw=snapshot.data();const title=text(raw.title).trim();if(!title)throw new Error('Thiếu title');const year=raw.year==null||raw.year===''?null:Number(raw.year);const song={id:snapshot.id,title,artist:text(raw.artist),category:text(raw.category).trim()||'other',year:Number.isInteger(year)&&year>=1800&&year<=2100?year:null,date:text(raw.date),description:text(raw.description),detail:text(raw.detail),meta:text(raw.meta),lyric:text(raw.lyric)};song.vinylColor=vinylTheme(raw);song.featured=raw.featured===true;for(const key of Object.keys(ALLOWED_HOSTS))song[key]=safeLink(text(raw[key]),key);return song;}
export function fingerprint(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(fingerprint).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+fingerprint(value[k])).join(',')+'}';}
