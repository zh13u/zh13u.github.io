const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const songs = ["Ai wo Komete Umi.mp3", "Sayonara no Natsui.mp3", "Inochi no Namae.mp3"];
let songIndex = localStorage.getItem("currentSong") ? parseInt(localStorage.getItem("currentSong")) : 0;

function loadSong(index, resumeTime = 0, autoplay = false) {
    if (audio.src.includes(songs[index])) {
        audio.currentTime = resumeTime;
        if (autoplay) {
            audio.play();
            playPauseBtn.textContent = "⏸";
        }
        return;
    }

    audio.src = `/assets/music/${songs[index]}`;
    audio.addEventListener("canplaythrough", () => {
        audio.currentTime = resumeTime;
        if (autoplay) {
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
    loadSong(songIndex, 0, true);
    localStorage.setItem("currentSong", songIndex);
}

function nextSong() {
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex, 0, true);
    localStorage.setItem("currentSong", songIndex);
}

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
    localStorage.setItem("currentTime", audio.currentTime);
});

audio.addEventListener('ended', nextSong);

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

playPauseBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

window.addEventListener("DOMContentLoaded", () => {
    const savedTime = localStorage.getItem("currentTime") ? parseFloat(localStorage.getItem("currentTime")) : 0;
    const savedPlaying = localStorage.getItem("isPlaying") === "true";

    loadSong(songIndex, savedTime, savedPlaying);
});

audio.addEventListener("play", () => {
    localStorage.setItem("isPlaying", "true");
});

audio.addEventListener("pause", () => {
    localStorage.setItem("isPlaying", "false");
});

window.addEventListener("DOMContentLoaded", () => {
    const savedTime = localStorage.getItem("currentTime") ? parseFloat(localStorage.getItem("currentTime")) : 0;
    const savedPlaying = localStorage.getItem("isPlaying") === "true"; // Lấy trạng thái phát nhạc trước đó

    loadSong(songIndex, savedTime, savedPlaying);

    // Nếu trước khi reload nhạc đang phát, tiếp tục phát
    if (savedPlaying) {
        setTimeout(() => {
            audio.play();
            playPauseBtn.textContent = "⏸";
        }, 500); // Thêm độ trễ nhỏ để đảm bảo audio đã load xong
    }
});
