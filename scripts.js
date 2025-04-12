const player = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const progressBar = document.getElementById('progress-bar');
const trackTitle = document.getElementById('track-title');
const playlistEl = document.getElementById('playlist');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

const playlist = [
  { title: "Bohemian Rhapsody", file: "musica1.mp3" },
  { title: "Imagine", file: "musica2.mp3" },
  { title: "Hotel California", file: "musica3.mp3" }
];

let currentTrack = 0;
let isShuffle = false;
let repeatMode = 'none'; // 'none' | 'all' | 'one'
let originalPlaylist = [...playlist];

function init() {
  renderPlaylist();
  updatePlaylistStyles();
  addEventListeners();
  loadTrack(currentTrack);
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item playlist-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${track.title}</span>
      <span class="badge text-bg-secondary">${formatTime(track.duration || 0)}</span>
    `;
    li.onclick = () => loadTrack(index);
    playlistEl.appendChild(li);
  });
}

function addEventListeners() {
  playBtn.onclick = togglePlay;
  nextBtn.onclick = nextTrack;
  prevBtn.onclick = prevTrack;
  shuffleBtn.onclick = toggleShuffle;
  repeatBtn.onclick = toggleRepeat;

  player.ontimeupdate = updateProgress;
  player.onloadedmetadata = updateDuration;
  player.onended = handleTrackEnd;
  progressBar.oninput = seekTrack;
}

function loadTrack(index) {
  currentTrack = index;
  const track = playlist[index];
  player.src = track.file;
  trackTitle.textContent = track.title;
  player.play().catch(() => {}); // silencioso se autoplay for bloqueado
  updatePlayButton();
  updatePlaylistStyles();
}

function togglePlay() {
  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }
  updatePlayButton();
}

function updatePlayButton() {
  const icon = player.paused ? 'play-fill' : 'pause-fill';
  playBtn.innerHTML = `<i class="bi bi-${icon} fs-4"></i>`;
}

function updateProgress() {
  if (!player.duration) return;
  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = progress || 0;
  currentTimeEl.textContent = formatTime(player.currentTime);
}

function updateDuration() {
  durationEl.textContent = formatTime(player.duration);
}

function seekTrack() {
  if (!player.duration) return;
  player.currentTime = (progressBar.value / 100) * player.duration;
}

function nextTrack() {
  if (isShuffle) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * playlist.length);
    } while (newIndex === currentTrack && playlist.length > 1);
    currentTrack = newIndex;
  } else {
    currentTrack = (currentTrack + 1) % playlist.length;
  }
  loadTrack(currentTrack);
}

function prevTrack() {
  if (player.currentTime > 5) {
    player.currentTime = 0;
  } else {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('text-primary', isShuffle);
  playlist.length = 0;
  playlist.push(...(isShuffle ? shuffleArray([...originalPlaylist]) : [...originalPlaylist]));
  renderPlaylist();
  updatePlaylistStyles();
}

function toggleRepeat() {
  const modes = ['none', 'all', 'one'];
  repeatMode = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
  repeatBtn.classList.toggle('text-primary', repeatMode !== 'none');
  repeatBtn.innerHTML = {
    none: '<i class="bi bi-repeat"></i>',
    all: '<i class="bi bi-repeat"></i>',
    one: '<i class="bi bi-repeat-1"></i>'
  }[repeatMode];
}

function handleTrackEnd() {
  if (repeatMode === 'one') {
    player.currentTime = 0;
    player.play();
  } else if (repeatMode === 'all' || currentTrack < playlist.length - 1) {
    nextTrack();
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updatePlaylistStyles() {
  document.querySelectorAll('.playlist-item').forEach((item, index) => {
    item.classList.toggle('active', index === currentTrack);
  });
}

init();