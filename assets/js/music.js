const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

const songs = ["Umi_no_Koe.mp3",
               "Ai_wo_Komete_Umi.mp3",
               "Inochi_no_Namae.mp3",
               "Lemon.mp3",
               "Kokoronashi.mp3",
               "Sayonara_no_Natsui.mp3",
               "Suzume.mp3",
               "Uchiage_hanabi.mp3",
               "Haiiro_to_Ao.mp3",
               "Kamado_Tanjiro_no_Uta.mp3",
               "Missing_You.mp3"
];
let songIndex = localStorage.getItem("currentSong") ? parseInt(localStorage.getItem("currentSong")) : 0;

// Biến để theo dõi xem người dùng đã tương tác với trang chưa
let userInteracted = false;

// Đảm bảo người dùng đã tương tác trước khi phát nhạc
document.addEventListener("click", () => {
    userInteracted = true;
});

// Sửa hàm loadSong để kiểm tra chính sách autoplay
function loadSong(index, resumeTime = 0, autoplay = false) {
    const songPath = `/assets/music/${songs[index]}`;
    fetch(songPath, { method: "HEAD" })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Bài hát không tồn tại hoặc không thể truy cập: ${songs[index]}`);
            }

            if (audio.src.includes(songs[index])) {
                audio.currentTime = resumeTime;
                if (autoplay && userInteracted) {
                    audio.play().catch(err => {
                        console.warn("Không thể tự động phát nhạc:", err.message);
                    });
                    playPauseBtn.textContent = "⏸";
                }
                return;
            }

            audio.src = songPath;
            audio.addEventListener("canplaythrough", () => {
                audio.currentTime = resumeTime;
                if (autoplay && userInteracted) {
                    audio.play().catch(err => {
                        console.warn("Không thể tự động phát nhạc:", err.message);
                    });
                    playPauseBtn.textContent = "⏸";
                }
            }, { once: true });
        })
        .catch(err => {
            console.error(err.message);
            alert(`Không thể phát bài hát: ${songs[index]}`);
            nextSong(); // Tự động chuyển sang bài hát tiếp theo nếu bài hát hiện tại không tồn tại
        });
}

function playPause() {
    // Phát hoặc tạm dừng bài hát
    const playPauseBtn = document.getElementById('play-pause-btn');
    const icon = playPauseBtn.querySelector('i'); // Lấy phần tử icon bên trong nút

    if (audio.paused) {
        audio.play();
        icon.classList.remove('fa-play'); // Xóa icon play
        icon.classList.add('fa-pause');  // Thêm icon pause
    } else {
        audio.pause();
        icon.classList.remove('fa-pause'); // Xóa icon pause
        icon.classList.add('fa-play');    // Thêm icon play
    }
}

function prevSong() {
    // Chuyển đến bài hát trước đó
    songIndex = (songIndex - 1 + songs.length) % songs.length;
    loadSong(songIndex, 0, true);
    localStorage.setItem("currentSong", songIndex);
}

function nextSong() {
    // Chuyển đến bài hát tiếp theo
    songIndex = (songIndex + 1) % songs.length;
    loadSong(songIndex, 0, true);
    localStorage.setItem("currentSong", songIndex);
}

audio.addEventListener('timeupdate', () => {
    // Cập nhật thanh tiến trình và thời gian phát
    if (!isNaN(audio.duration)) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
    localStorage.setItem("currentTime", audio.currentTime);
});

audio.addEventListener('ended', nextSong);

audio.addEventListener('error', () => {
    // Xử lý lỗi khi phát bài hát
    console.error(`Lỗi khi phát bài hát: ${songs[songIndex]}`);
    alert(`Lỗi khi phát bài hát: ${songs[songIndex]}. Đang chuyển sang bài hát tiếp theo.`);
    nextSong(); // Tự động chuyển sang bài hát tiếp theo nếu xảy ra lỗi
});

function formatTime(seconds) {
    // Định dạng thời gian thành phút:giây
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

playPauseBtn.addEventListener('click', playPause);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

window.addEventListener("DOMContentLoaded", () => {
    // Lấy thời gian và trạng thái phát nhạc đã lưu
    const savedTime = localStorage.getItem("currentTime") ? parseFloat(localStorage.getItem("currentTime")) : 0;
    const savedPlaying = localStorage.getItem("isPlaying") === "true";

    loadSong(songIndex, savedTime, savedPlaying && userInteracted);

    if (savedPlaying && userInteracted) {
        setTimeout(() => {
            audio.play().catch(err => {
                console.warn("Không thể tự động phát nhạc:", err.message);
            });
            icon.classList.remove('fa-play'); // Xóa icon play
            icon.classList.add('fa-pause');  // Thêm icon pause
        }, 500); // Thêm độ trễ nhỏ để đảm bảo audio đã tải xong
    }
});

audio.addEventListener("play", () => {
    // Lưu trạng thái đang phát
    localStorage.setItem("isPlaying", "true");
});

audio.addEventListener("pause", () => {
    // Lưu trạng thái tạm dừng
    localStorage.setItem("isPlaying", "false");
});

window.addEventListener("DOMContentLoaded", () => {
    // Lấy thời gian và trạng thái phát nhạc trước đó
    const savedTime = localStorage.getItem("currentTime") ? parseFloat(localStorage.getItem("currentTime")) : 0;
    const savedPlaying = localStorage.getItem("isPlaying") === "true";

    loadSong(songIndex, savedTime, savedPlaying);

    // Nếu nhạc đang phát trước khi tải lại, tiếp tục phát
    if (savedPlaying) {
        setTimeout(() => {
            audio.play();
            playPauseBtn.textContent = "⏸";
        }, 500); // Thêm độ trễ nhỏ để đảm bảo audio đã tải xong
    }
});

// Hàm tua nhạc
function seekAudio() {
    if (!isNaN(audio.duration)) {
        const seekTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
}

// Lắng nghe sự kiện thay đổi giá trị của thanh tiến trình
progressBar.addEventListener('input', seekAudio);

// Hàm cập nhật trạng thái được chọn của sidebar
function updateSidebarSelection() {
    const currentPath = window.location.pathname.replace(/\/$/, ""); // Chuẩn hóa đường dẫn
    const sidebarLinks = document.querySelectorAll("#sidebar .nav-link");

    sidebarLinks.forEach(link => {
        const parentItem = link.closest(".nav-item");
        if (parentItem) {
            const linkPath = new URL(link.href).pathname.replace(/\/$/, ""); // Chuẩn hóa đường dẫn liên kết
            if (linkPath === currentPath) {
                parentItem.classList.add("active");
            } else {
                parentItem.classList.remove("active");
            }
        }
    });
}

// Xử lý chuyển trang AJAX mà không thay thế trình phát nhạc
document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link && link.getAttribute("href") && !link.getAttribute("href").startsWith("#")) {
        event.preventDefault();

        fetch(link.getAttribute("href"))
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const newDocument = parser.parseFromString(html, "text/html");
                const newContent = newDocument.getElementById("main-wrapper");

                // Chỉ thay thế nội dung của main-wrapper, không thay trình phát nhạc
                const mainWrapper = document.getElementById("main-wrapper");
                if (mainWrapper && newContent) {
                    mainWrapper.innerHTML = newContent.innerHTML;

                    // Khởi tạo lại các script hoặc thành phần cho nội dung mới
                    initializeNewContent();
                } else {
                    console.error("Không tìm thấy main-wrapper trong trang mới.");
                    alert("Lỗi: Không thể tải nội dung mới.");
                }

                // Cập nhật lịch sử trình duyệt
                history.pushState(null, "", link.getAttribute("href"));

                // Cập nhật trạng thái sidebar ngay lập tức
                updateSidebarSelection();
            })
            .catch(err => {
                console.error("Không thể tải trang:", err);
                alert("Lỗi: Không thể tải trang.");
            });
    }
});

// Xử lý điều hướng trình duyệt (back/forward)
window.addEventListener("popstate", () => {
    fetch(location.href)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lỗi HTTP! trạng thái: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const newDocument = parser.parseFromString(html, "text/html");
            const newContent = newDocument.getElementById("main-wrapper");

            const mainWrapper = document.getElementById("main-wrapper");
            if (mainWrapper && newContent) {
                mainWrapper.innerHTML = newContent.innerHTML;

                // Khởi tạo lại các script hoặc thành phần cho nội dung mới
                initializeNewContent();

                // Cập nhật trạng thái sidebar
                updateSidebarSelection();
            } else {
                console.error("Không tìm thấy main-wrapper trong trang mới.");
                alert("Lỗi: Không thể tải nội dung mới.");
            }
        })
        .catch(err => {
            console.error("Không thể tải trang:", err);
            alert("Lỗi: Không thể tải trang.");
        });
});

// Hàm khởi tạo lại các script hoặc thành phần cho nội dung mới
function initializeNewContent() {
    // Thêm logic khởi tạo lại tại đây, ví dụ: sự kiện, hoạt ảnh, v.v.
    console.log("Nội dung mới đã được khởi tạo.");
    updateSidebarSelection(); // Đảm bảo sidebar được cập nhật khi tải nội dung mới
}

// Hàm kiểm tra tất cả các bài hát trong danh sách
function validateSongs() {
    songs.forEach((song, index) => {
        const songPath = `/assets/music/${song}`;
        fetch(songPath, { method: "HEAD" })
            .then(response => {
                if (!response.ok) {
                    console.warn(`Bài hát không tồn tại hoặc không thể truy cập: ${song}`);
                }
            })
            .catch(err => {
                console.error(`Lỗi khi kiểm tra bài hát: ${song}`, err.message);
            });
    });
}

// Gọi hàm kiểm tra danh sách bài hát khi tải trang
window.addEventListener("DOMContentLoaded", () => {
    validateSongs();
    // Lấy thời gian và trạng thái phát nhạc đã lưu
    const savedTime = localStorage.getItem("currentTime") ? parseFloat(localStorage.getItem("currentTime")) : 0;
    const savedPlaying = localStorage.getItem("isPlaying") === "true";

    loadSong(songIndex, savedTime, savedPlaying);
});
