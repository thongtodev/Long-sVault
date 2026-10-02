'use strict';
(() => {
  const titles = {
    'tat-ca-bai-hat': 'Kho nhạc — Long’s Vault',
    underground: 'Underground — Long’s Vault',
    soundcloud: 'SoundCloud — Long’s Vault',
    'da-lab-classics': 'Da LAB — Long’s Vault',
    'bai-rieng': 'Solo — Long’s Vault',
    'artist-chronology': 'Dòng thời gian — Long’s Vault',
    'loi-bai-hat-and-ghi-chu': 'Ghi chú âm nhạc — Long’s Vault',
    've-emcee-l': 'Về Emcee L — Long’s Vault',
    'dieu-khoan-luu-tru': 'Chính sách — Long’s Vault',
    'bai-hat': 'Chi tiết ca khúc — Long’s Vault'
  };

  function currentRoute() {
    const pathname = location.pathname.replace(/\/+$/, '') || '/';
    if (pathname === '/bai-hat' || pathname.startsWith('/bai-hat/')) return 'bai-hat';
    const routes = {
      '/': 'tat-ca-bai-hat',
      '/kho-nhac': 'tat-ca-bai-hat',
      '/tat-ca-bai-hat': 'tat-ca-bai-hat',
      '/underground': 'underground',
      '/soundcloud': 'soundcloud',
      '/da-lab': 'da-lab-classics',
      '/da-lab-classics': 'da-lab-classics',
      '/solo': 'bai-rieng',
      '/bai-rieng': 'bai-rieng',
      '/dong-thoi-gian': 'artist-chronology',
      '/artist-chronology': 'artist-chronology',
      '/ghi-chu': 'loi-bai-hat-and-ghi-chu',
      '/loi-bai-hat-and-ghi-chu': 'loi-bai-hat-and-ghi-chu',
      '/ve-emcee-l': 've-emcee-l',
      '/chinh-sach': 'dieu-khoan-luu-tru',
      '/dieu-khoan-luu-tru': 'dieu-khoan-luu-tru'
    };
    return routes[pathname] || 'tat-ca-bai-hat';
  }

  function syncTitle() {
    document.title = location.pathname === '/' ? 'Long’s Vault' : (titles[currentRoute()] || 'Long’s Vault');
  }

  const pushState = history.pushState;
  history.pushState = function (...args) {
    const result = pushState.apply(this, args);
    requestAnimationFrame(syncTitle);
    return result;
  };
  window.addEventListener('popstate', () => requestAnimationFrame(syncTitle));
  window.addEventListener('hashchange', () => requestAnimationFrame(syncTitle));
  syncTitle();
})();
