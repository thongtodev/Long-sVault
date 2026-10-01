const statusEl=document.getElementById('status');
const timer=setTimeout(()=>{statusEl.textContent='Kết nối đang chậm. Kiểm tra Internet; phần đăng nhập sẽ hiện khi Firebase tải xong.';},15000);
import('./admin.js?v=20261001-disc-only').then(()=>clearTimeout(timer)).catch(()=>{clearTimeout(timer);statusEl.classList.add('error');statusEl.textContent='Không tải được Firebase. Hãy mở trang qua HTTP/HTTPS và kiểm tra kết nối Internet. Xem hướng dẫn thiết lập bên dưới.';});
