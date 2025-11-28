// --- DANH SÁCH VIDEO MẶC ĐỊNH ---
const videoList = [
  "https://res.cloudinary.com/dqlghjiyb/video/upload/v1764346962/cat-and-bee-moewalls-com_lpmrhd.mp4",
  "https://res.cloudinary.com/dqlghjiyb/video/upload/v1764346961/abi-toads-sledding-moewalls-com_as8kvs.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/bocchi-walking-in-the-rain-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/samurai-sword-stars-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/cozy-autumn-rain-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/empty-classroom-in-the-evening-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/penacony-raining-stars-honkai-star-rail-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/anime-girl-looking-at-the-cherry-blossoms-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/elaina-drinking-coffee-near-window-majo-no-tabitabi-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/anime-girl-silhouette-watching-the-plane-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/rain-at-night-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/ocean-painting-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/japanese-restaurant-street-day-and-night-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/traditional-japanese-room-day-and-night-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/adorable-black-kitten-with-big-amber-eyes-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/doggie-corgi-playing-with-his-friend-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/japanese-street-at-night-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/abi-toads-sledding-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/black-cat-bus-stop-at-dusk-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/lazy-river-abi-toads-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/frogs-lily-pad-riding-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/cat-and-bee-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/frog-couple-relaxing-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/floating-ducks-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/frog-sleeping-near-the-waterfall-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/serene-twilight-from-a-seaside-balcony-moewalls-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/beach-island-moewalls-com.mp4",
];

// --- CÁC BIẾN TOÀN CỤC ---
let originalCards = [];
let cards = [];
let currentIndex = 0;
let isFront = true;
let frontColumnIndex = 0;
let currentVideoSrc = "";
let isDraggingMode = false;

// BIẾN CHO TÍNH NĂNG TỪ KHÓ & TIẾN ĐỘ RIÊNG
let markedCards = new Set();
let isReviewMode = false;
let savedIndexNormal = 0; // Lưu vị trí khi ở chế độ thường
let savedIndexReview = 0; // Lưu vị trí khi ở chế độ ôn tập

window.onload = function () {
  let isTextWhite = localStorage.getItem("flashcardTextWhite");
  if (isTextWhite === null) isTextWhite = "true";
  isTextWhite = isTextWhite === "true";
  window.isTextWhite = isTextWhite;
  applyTextColor();

  const lastBg = localStorage.getItem("bgVideo");
  if (lastBg && (videoList.includes(lastBg) || lastBg.startsWith("blob:"))) {
    changeBgVideo(lastBg);
  } else {
    changeBgVideo(videoList[0]);
  }

  loadProgress();
  setupInteractions();
  restorePosition();

  updateReviewBtnState();
};

function setupInteractions() {
  makeDraggable("mainContent");

  const flashcard = document.getElementById("flashcard");
  if (flashcard) {
    flashcard.onclick = null;
    flashcard.removeAttribute("onclick");

    flashcard.addEventListener("click", function (e) {
      if (e.target.closest(".star-icon")) return;
      if (isDraggingMode) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      flipCard();
    });
  }
}

// --- LOGIC KÉO THẢ (DRAG) - ĐÃ CẬP NHẬT CENTER ANCHOR ---
function makeDraggable(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let isMouseDown = false;
  let startX, startY; // Tọa độ chuột
  let offsetX, offsetY; // Khoảng cách từ chuột đến tâm thẻ

  element.addEventListener("mousedown", function (e) {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.closest("button") ||
      e.target.closest(".star-icon")
    )
      return;

    isMouseDown = true;
    isDraggingMode = false;
    startX = e.clientX;
    startY = e.clientY;

    // Lấy kích thước và vị trí hiện tại
    const rect = element.getBoundingClientRect();

    // Tính toán tâm hiện tại của thẻ
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Tính khoảng cách lệch giữa chuột và tâm thẻ
    offsetX = e.clientX - centerX;
    offsetY = e.clientY - centerY;

    // QUAN TRỌNG: Luôn giữ transform translate để căn giữa
    element.style.transform = "translate(-50%, -50%)";
    element.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", function (e) {
    if (!isMouseDown) return;
    e.preventDefault();

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDraggingMode = true;
    }

    // Vị trí mới = Vị trí chuột hiện tại - Khoảng lệch so với tâm
    // Lúc này left/top đại diện cho TÂM của thẻ
    const newLeft = e.clientX - offsetX;
    const newTop = e.clientY - offsetY;

    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;
  });

  window.addEventListener("mouseup", function (e) {
    if (isMouseDown) {
      if (isDraggingMode) {
        // Lưu vị trí (lúc này left/top là tọa độ tâm)
        const pos = { left: element.style.left, top: element.style.top };
        localStorage.setItem("flashcardPosition", JSON.stringify(pos));
        setTimeout(() => {
          isDraggingMode = false;
        }, 100);
      }
      isMouseDown = false;
      element.style.cursor = "default";
      const card = document.getElementById("flashcard");
      if (card) card.style.cursor = "grab";
    }
  });
}

function restorePosition() {
  const savedPos = localStorage.getItem("flashcardPosition");
  const content = document.getElementById("mainContent");

  if (content) {
    // Đảm bảo thẻ luôn được căn giữa theo điểm neo
    content.style.transform = "translate(-50%, -50%)";

    if (savedPos) {
      try {
        const pos = JSON.parse(savedPos);
        if (pos.left && pos.top) {
          content.style.left = pos.left;
          content.style.top = pos.top;
        }
      } catch (e) {
        // Fallback nếu lỗi
        content.style.left = "50%";
        content.style.top = "50%";
      }
    } else {
      // Mặc định ở giữa màn hình
      content.style.left = "50%";
      content.style.top = "50%";
    }
  }
}

// --- LOGIC LƯU TRỮ VÀ TIẾN ĐỘ ---

function saveProgress() {
  if (cards.length === 0 && !isReviewMode) return;

  // Tính toán vị trí để lưu:
  // Nếu đang ở Review -> currentIndex là của Review, còn savedIndexNormal giữ nguyên.
  // Nếu đang ở Normal -> currentIndex là của Normal, còn savedIndexReview giữ nguyên.
  const currentNormal = isReviewMode ? savedIndexNormal : currentIndex;
  const currentReview = isReviewMode ? currentIndex : savedIndexReview;

  localStorage.setItem(
    "flashcardProgress",
    JSON.stringify({
      cards: isReviewMode ? originalCards : cards,
      savedIndexNormal: currentNormal, // Lưu vị trí Normal riêng
      savedIndexReview: currentReview, // Lưu vị trí Review riêng
      isFront,
      frontColumnIndex,
      markedCards: Array.from(markedCards),
      isReviewMode,
    })
  );
}

function loadProgress() {
  const data = localStorage.getItem("flashcardProgress");
  if (data) {
    try {
      const obj = JSON.parse(data);

      if (obj.markedCards) {
        markedCards = new Set(obj.markedCards);
      }

      // Load các vị trí đã lưu
      savedIndexNormal = obj.savedIndexNormal || 0;
      savedIndexReview = obj.savedIndexReview || 0;
      let savedReviewMode = obj.isReviewMode || false;

      if (Array.isArray(obj.cards) && obj.cards.length > 0) {
        originalCards = obj.originalCards || obj.cards;

        // Khôi phục đúng chế độ và vị trí tương ứng
        if (savedReviewMode) {
          const difficultCards = originalCards.filter((c) =>
            markedCards.has(JSON.stringify(c))
          );
          if (difficultCards.length > 0) {
            isReviewMode = true;
            cards = difficultCards;
            currentIndex = savedIndexReview; // Khôi phục vị trí Review
          } else {
            isReviewMode = false;
            cards = originalCards;
            currentIndex = savedIndexNormal; // Fallback về Normal
          }
        } else {
          isReviewMode = false;
          cards = originalCards;
          currentIndex = savedIndexNormal; // Khôi phục vị trí Normal
        }

        // Kiểm tra an toàn biên
        if (currentIndex >= cards.length) currentIndex = 0;

        isFront = obj.isFront ?? true;
        frontColumnIndex =
          typeof obj.frontColumnIndex !== "undefined"
            ? obj.frontColumnIndex
            : 0;

        updateSideButtonText();
        updateReviewBtnState();
        showCard();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return false;
}

// --- TÍNH NĂNG ĐÁNH DẤU & CHUYỂN CHẾ ĐỘ (LOGIC MỚI) ---

function toggleMark() {
  if (cards.length === 0) return;
  const currentCard = cards[currentIndex];
  const signature = JSON.stringify(currentCard);

  if (markedCards.has(signature)) {
    markedCards.delete(signature);
  } else {
    markedCards.add(signature);
  }
  showCard();
  saveProgress();
}

function toggleReviewMode() {
  // Logic: Khi chuyển chế độ, lưu vị trí hiện tại vào biến tương ứng
  // và lấy vị trí đã lưu của chế độ kia ra dùng.

  if (!isReviewMode) {
    // --- CHUYỂN TỪ THƯỜNG -> REVIEW ---
    const difficultCards = originalCards.filter((c) =>
      markedCards.has(JSON.stringify(c))
    );

    // Nếu không có từ khó, thoát êm (không alert)
    if (difficultCards.length === 0) return;

    // 1. Lưu tiến độ Normal hiện tại
    savedIndexNormal = currentIndex;

    // 2. Chuyển sang Review
    cards = difficultCards;
    isReviewMode = true;

    // 3. Khôi phục tiến độ Review cũ
    currentIndex = savedIndexReview;

    // Safety: Nếu danh sách từ khó ngắn lại (do bỏ đánh dấu) và index bị lố
    if (currentIndex >= cards.length) currentIndex = 0;
  } else {
    // --- CHUYỂN TỪ REVIEW -> THƯỜNG ---

    // 1. Lưu tiến độ Review hiện tại
    savedIndexReview = currentIndex;

    // 2. Chuyển về Normal
    cards = [...originalCards];
    isReviewMode = false;

    // 3. Khôi phục tiến độ Normal cũ
    currentIndex = savedIndexNormal;

    // Safety
    if (currentIndex >= cards.length) currentIndex = 0;
  }

  isFront = true; // Luôn reset về mặt trước khi đổi danh sách cho đỡ rối
  updateReviewBtnState();
  showCard();
}

function updateReviewBtnState() {
  const btn = document.getElementById("reviewBtn");
  if (!btn) return;

  if (isReviewMode) {
    // ĐANG BẬT: Vàng, Active
    btn.classList.add("active-mode");
    btn.style.color = "#FFD700";
    btn.innerHTML = `<span class="effect"></span><span class="effect"></span><span class="effect"></span><span class="effect"></span><span>🔖</span>`;
    btn.title = "Chế độ: Từ khó";
  } else {
    // ĐANG TẮT: Trắng/Xám (theo theme), Inactive
    btn.classList.remove("active-mode");
    // Reset style inline để nó ăn theo CSS class hoặc hàm applyTextColor
    btn.style.color = "";
    btn.innerHTML = `<span class="effect"></span><span class="effect"></span><span class="effect"></span><span class="effect"></span><span>🏷️</span>`;
    btn.title = "Chế độ: Tất cả";
  }
  // Gọi lại applyTextColor để đảm bảo màu icon ☆ đúng với theme (đen/trắng) nếu đang tắt review
  if (!isReviewMode) applyTextColor();
}

// --- HIỂN THỊ THẺ ---

function showCard() {
  const flashcard = document.getElementById("flashcard");
  if (cards.length === 0) {
    flashcard.innerHTML = "<div>Chưa có dữ liệu</div>";
    saveProgress();
    return;
  }

  const card = cards[currentIndex];
  const content = [
    card[0] || "",
    card[1] || "",
    card[2] || "",
    card[3] || "",
    card[4] || "",
  ];

  const isMarked = markedCards.has(JSON.stringify(card));
  const starColor = isMarked ? "#FFD700" : "rgba(255,255,255,0.3)";
  const starSymbol = isMarked ? "★" : "☆";

  let headerHtml = `
    <div class="card-header">
        <div class="count">
            ${isReviewMode ? "" : ""}${currentIndex + 1} / ${
    cards.length
  }
        </div>
        <div class="star-icon" onclick="toggleMark()" style="color: ${starColor}">
            ${starSymbol}
        </div>
    </div>
  `;

  let bodyHtml = "";
  if (isFront) {
    bodyHtml = `<div class = "front">${content[frontColumnIndex]}</div>`;
  } else {
    if (content[0])
      bodyHtml += `<div style="margin-bottom: 8px;font-size:40px;">${content[0]}</div>`;
    if (content[1])
      bodyHtml += `<div style="margin-bottom: 8px; font-weight: bold;">${content[1]}</div>`;
    if (content[2])
      bodyHtml += `<div style="margin-bottom: 5px; font-style: italic; opacity: 0.9;">${content[2]}</div>`;
    if (content[3])
      bodyHtml += `<div style="opacity: 0.9;">${content[3]}</div>`;
    if (content[4])
      bodyHtml += `<div style="opacity: 0.8; font-size: 0.9em; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 5px; margin-top:5px;">${content[4]}</div>`;
  }

  flashcard.innerHTML = headerHtml + bodyHtml;
  applyTextColor();
  saveProgress();
}

// --- CÁC HÀM TIỆN ÍCH KHÁC ---

function flipCard() {
  isFront = !isFront;
  showCard();
}

function nextCard() {
  if (cards.length === 0) return;
  currentIndex = (currentIndex + 1) % cards.length;
  isFront = true;
  showCard();
}

function prevCard() {
  if (cards.length === 0) return;
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  isFront = true;
  showCard();
}

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentIndex = 0;
  isFront = true;
  showCard();
}

function toggleSide() {
  frontColumnIndex = (frontColumnIndex + 1) % 5;
  updateSideButtonText();
  isFront = true;
  showCard();
}

function updateSideButtonText() {
  const btnText = document.getElementById("toggleSideText");
  if (btnText) btnText.textContent = `🔄`;
}

function toggleContentVisibility() {
  const content = document.getElementById("mainContent");
  const btnText = document.getElementById("eyeIcon");
  content.classList.toggle("content-hidden");
  btnText.textContent = content.classList.contains("content-hidden")
    ? "🙈"
    : "🐾";
}

function applyTextColor() {
  const color = window.isTextWhite ? "#ffffff" : "#000000";
  document
    .querySelectorAll(".flashcard")
    .forEach((card) => (card.style.color = color));

  // Nút vẫn giữ màu, chỉ đổi màu chữ bên trong flashcard và icon
  const btns = document.querySelectorAll("button");
  btns.forEach((btn) => {
    // Nếu là nút review VÀ đang bật review -> giữ nguyên màu vàng, không đổi theo theme
    if (btn.id === "reviewBtn" && isReviewMode) return;
    btn.style.color = color;
  });

  document.getElementById("toggleTextColorText").textContent = "🌗";
  const btn = document.getElementById("toggleTextColorBtn");
  btn.classList.toggle("text-white", window.isTextWhite);
}

document
  .getElementById("toggleTextColorBtn")
  .addEventListener("click", function () {
    window.isTextWhite = !window.isTextWhite;
    applyTextColor();
    localStorage.setItem("flashcardTextWhite", window.isTextWhite);
  });

// Phím tắt
window.addEventListener("keydown", function (e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") nextCard();
  else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") prevCard();
  else if (
    e.key === " " ||
    e.key === "Enter" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowUp"
  )
    flipCard();
  else if (e.key === "m" || e.key === "M") toggleMark();
});

// --- XỬ LÝ FILE CSV/XLSX ---

function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      resolve(lines.map((line) => line.split(",")));
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(rows.filter((row) => row.length > 0));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

document
  .getElementById("csvFile")
  .addEventListener("change", async function (e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    let combinedData = [];
    const readPromises = files.map((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "csv") return readCSVFile(file);
      else if (ext === "xlsx") return readXLSXFile(file);
      else return Promise.resolve([]);
    });

    try {
      const results = await Promise.all(readPromises);
      results.forEach((data) => {
        combinedData = combinedData.concat(data);
      });
      if (combinedData.length > 0) {
        originalCards = combinedData;
        cards = [...originalCards];

        // Khi load file mới, reset mọi thứ về 0 và tắt Review mode
        isReviewMode = false;
        updateReviewBtnState();

        savedIndexNormal = 0;
        savedIndexReview = 0;
        currentIndex = 0;
        isFront = true;
        showCard();
      } else {
        alert("Không tìm thấy dữ liệu.");
      }
    } catch (err) {
      alert("Lỗi khi đọc file.");
    }
    e.target.value = "";
  });

// --- XỬ LÝ VIDEO ---

function openVideoModal() {
  const modal = document.getElementById("videoModal");
  const grid = document.getElementById("videoGrid");
  grid.innerHTML = "";

  videoList.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.className = "video-item-btn";
    let name = `Video ${idx + 1}`;
    try {
      if (src.startsWith("blob:")) name = `Video Upload ${idx + 1}`;
      else {
        const parts = src.split("/");
        name = parts[parts.length - 1].substring(0, 10) + "...";
      }
    } catch (e) {}

    btn.innerHTML = `<span style="font-size:24px;">🎬</span><span>${name}</span>`;
    if (src === currentVideoSrc) btn.classList.add("active");
    btn.onclick = function () {
      changeBgVideo(src);
      closeVideoModal();
    };
    grid.appendChild(btn);
  });
  modal.style.display = "block";
}

function closeVideoModal() {
  document.getElementById("videoModal").style.display = "none";
}
window.onclick = function (event) {
  const modal = document.getElementById("videoModal");
  if (event.target == modal) modal.style.display = "none";
};

document
  .getElementById("videoFileInput")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    videoList.push(url);
    changeBgVideo(url);
    closeVideoModal();
  });

function changeBgVideo(src) {
  currentVideoSrc = src;
  const bgVideo = document.getElementById("bg-video");
  const bgSource = document.getElementById("bg-source");
  if (bgSource.src !== src && bgSource.src !== window.location.href + src) {
    bgSource.src = src;
    bgVideo.load();
  }
  localStorage.setItem("bgVideo", src);
}
// --- LOGIC MENU HAMBURGER (MỚI) ---

function toggleMenu() {
  const toolbar = document.getElementById("toolBar");
  const menuIcon = document.getElementById("menuIcon");

  // Toggle class 'menu-open'
  toolbar.classList.toggle("menu-open");

  if (toolbar.classList.contains("menu-open")) {
    menuIcon.textContent = "❌"; // Hoặc dùng icon đóng khác
  } else {
    menuIcon.textContent = "☰"; // Hoặc icon bánh răng ⚙️
  }
}