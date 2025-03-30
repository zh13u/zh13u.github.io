const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const songs = ["Ai wo Komete Umi.mp3",
               "Sayonara no Natsui.mp3",
               "Inochi no Namae.mp3",
               "Lemon.mp3"
              ]; // Thay bằng danh sách thực tế
let songIndex = 0;

function loadSong(index) {
    audio.src = `/assets/music/${songs[index]}`;
    audio.load();
    audio.addEventListener("canplaythrough", () => {
        if (songIndex === 0) {
            audio.play();
            playPauseBtn.textContent = "⏸";
        }
    }, { once: true });
}

function playPause() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = "⏸";
    } else {
        audio.pause();
        playPauseBtn.textContent = "▶️";
    }
}

function prevSong() {
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex);
    audio.play();
}

function nextSong() {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex);
    audio.play();
}

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener('ended', nextSong); // Khi bài hát kết thúc, tự động chuyển bài

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

playPauseBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
loadSong(songIndex);