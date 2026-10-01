(async () => {
  // Local-file playback remains available even if Firebase cannot be reached.
  const [{ createAmbientPlayer }, { defaultSettings, playbackSettings }] = await Promise.all([
    import('./ambient-player.js?v=20261001-disc-only'),
    import('./site-settings-model.js?v=20261001-story-pages')
  ]);
  const player = createAmbientPlayer();
  let stop;
  try {
    const [{ db }, { doc, onSnapshot }] = await Promise.all([
      import('./firebase-client.js?v=20261001-story-pages'),
      import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
    ]);
    stop = onSnapshot(doc(db, 'settings', 'site'), snapshot => {
      try { player.apply(playbackSettings(snapshot.exists() ? snapshot.data() : defaultSettings())); }
      catch { /* Keep the last valid configuration. */ }
    }, () => player.apply(defaultSettings()));
  } catch { player.apply(defaultSettings()); }
  window.addEventListener('pagehide', event => {
    if (event.persisted) player.suspend();
    else { stop?.(); player.destroy(); }
  });
  window.addEventListener('pageshow', event => { if (event.persisted) player.resume(); });
})().catch(() => { /* Background audio must never block the archive. */ });
