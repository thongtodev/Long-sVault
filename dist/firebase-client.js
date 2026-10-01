import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js?v=20261001-story-pages';
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export function readableError(error) {
 const code=String(error?.code||'');
 const messages={
 'permission-denied':'Chưa có quyền truy cập. Hãy kiểm tra Firestore Rules và quyền admin.',
 'unavailable':'Chưa kết nối được Firebase. Kiểm tra Internet rồi thử lại.',
 'failed-precondition':'Firebase chưa sẵn sàng. Kiểm tra đã tạo Cloud Firestore (default).',
 'auth/invalid-credential':'Email hoặc mật khẩu không đúng.',
 'auth/invalid-email':'Địa chỉ email không hợp lệ.',
 'auth/user-disabled':'Tài khoản đã bị vô hiệu hóa.',
 'auth/too-many-requests':'Đã thử quá nhiều lần. Vui lòng đợi rồi đăng nhập lại.',
 'auth/operation-not-allowed':'Chưa bật đăng nhập Email/Password trong Firebase Authentication.',
 'auth/configuration-not-found':'Chưa thiết lập Firebase Authentication cho dự án này.',
 'auth/network-request-failed':'Không kết nối được dịch vụ đăng nhập. Kiểm tra Internet.',
 'auth/invalid-api-key':'Firebase API key không hợp lệ. Kiểm tra cấu hình dự án.',
 'auth/unauthorized-domain':'Tên miền này chưa được cho phép trong Firebase Authentication.'
 };
 return messages[code] || `Không hoàn tất được thao tác${code?' ('+code+')':''}. Vui lòng thử lại.`;
}
