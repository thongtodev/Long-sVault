// One persistent player outside the route container; navigating does not restart audio.
export function createAmbientPlayer(root = document) {
  const panel = root.createElement('aside');
  panel.className = 'ambient-player ambient-compact ambient-vinyl';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Nhạc nền');
  panel.innerHTML = '<button type="button" class="ambient-toggle" aria-label="Bật nhạc nền" aria-pressed="false"><span class="ambient-notes" aria-hidden="true"><span>♪</span><span>♫</span><span>♩</span><span>♪</span><span>♫</span></span><span class="vinyl-spin orgel-disc rotating-carousel" aria-hidden="true"><span class="orgel-ring orgel-ring-outer"><span class="orgel-ring orgel-ring-inner"><span class="orgel-hub"><span class="orgel-spindle"><span></span></span></span></span></span></span><span class="ambient-indicator" aria-hidden="true">▶</span></button><label class="sr-only" for="ambient-track">Chọn nhạc nền</label><select id="ambient-track"></select><audio preload="auto" hidden></audio>';
  root.body.append(panel);
  const audio = panel.querySelector('audio');
  const toggle = panel.querySelector('button');
  const select = panel.querySelector('select');
  let settings, userPaused = false, externalPaused = false, waiting = false, failed = false, revision = 0, sounding = false;

  function updateButton() {
    const playing = sounding && !audio.paused && !audio.ended;
    panel.classList.toggle('is-playing', playing);
    toggle.querySelector('.ambient-indicator').textContent = playing ? 'Ⅱ' : '▶';
    toggle.title = playing ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền';
    toggle.setAttribute('aria-label', playing ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền');
    toggle.setAttribute('aria-pressed', String(playing));
  }
  async function play() {
    if (!settings?.audioEnabled || userPaused || externalPaused || failed || !audio.getAttribute('src')) return;
    const attempt = revision;
    try {
      await audio.play();
      if (attempt !== revision) return;
      waiting = false;
    } catch (error) {
      if (attempt !== revision) return;
      waiting = error.name === 'NotAllowedError';
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') { failed = true; panel.hidden = true; }
    }
    updateButton();
  }
  function loadTrack(track) {
    if (!track) return;
    revision++;
    waiting = false;
    failed = false;
    audio.pause();
    audio.autoplay = settings.audioEnabled && !userPaused && !externalPaused;
    audio.src = track.url;
    panel.hidden = !settings.audioEnabled;
    play();
  }
  toggle.addEventListener('click', () => {
    if (!audio.paused) { userPaused = true; waiting = false; audio.autoplay = false; audio.pause(); }
    else { userPaused = false; externalPaused = false; failed = false; play(); }
    updateButton();
  });
  select.addEventListener('change', () => loadTrack(settings.tracks.find(t => t.id === select.value)));
  audio.addEventListener('play', () => {
    if (!settings?.audioEnabled || userPaused || externalPaused) { audio.pause(); return; }
    waiting = false; panel.hidden = false; updateButton();
  });
  audio.addEventListener('playing', () => { sounding = true; updateButton(); });
  for (const event of ['pause', 'ended', 'waiting', 'stalled', 'emptied']) {
    audio.addEventListener(event, () => { sounding = false; updateButton(); });
  }
  audio.addEventListener('error', () => { waiting = false; failed = true; sounding = false; updateButton(); panel.hidden = true; });

  function gesture(event) {
    if (panel.contains(event.target)) return;
    if (settings?.pauseOnExternal && event.target.closest?.('.platform-btn,.player-play,.listen-link')) {
      externalPaused = true; waiting = false; audio.autoplay = false; audio.pause(); return;
    }
    if (waiting) play();
  }
  root.addEventListener('click', gesture);
  root.addEventListener('keydown', gesture);
  return {
    apply(next) {
      const previous = settings;
      settings = next;
      const selected = next.tracks.some(t => t.id === select.value) ? select.value : next.defaultTrack;
      select.replaceChildren(...next.tracks.map(track => {
        const option = root.createElement('option'); option.value = track.id; option.textContent = track.title; return option;
      }));
      select.value = selected;
      select.hidden = next.tracks.length < 2;
      audio.loop = next.loop;
      audio.volume = next.volume / 100;
      const track = next.tracks.find(t => t.id === selected);
      panel.hidden = !next.audioEnabled || !track || failed;
      if (!next.audioEnabled || !track) { revision++; waiting = false; audio.autoplay = false; audio.pause(); return; }
      if (audio.getAttribute('src') !== track.url) loadTrack(track);
      else if (!previous?.audioEnabled) play();
    },
    suspend() { audio.pause(); },
    resume() { play(); },
    destroy() { revision++; audio.pause(); root.removeEventListener('click', gesture); root.removeEventListener('keydown', gesture); panel.remove(); }
  };
}
