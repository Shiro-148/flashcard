const videoList = [
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

function saveProgress() {
  if (cards.length === 0) return;
  localStorage.setItem('flashcardProgress', JSON.stringify({
    cards,
    originalCards,
    currentIndex,
    isFront,
    frontColumnIndex
  }));
}

function loadProgress() {
  const data = localStorage.getItem('flashcardProgress');
  if (data) {
    try {
      const obj = JSON.parse(data);
      if (Array.isArray(obj.cards) && obj.cards.length > 0) {
        cards = obj.cards;
        originalCards = obj.originalCards || obj.cards;
        currentIndex = obj.currentIndex || 0;
        isFront = obj.isFront ?? true;
        
        if (typeof obj.frontColumnIndex !== 'undefined') {
          frontColumnIndex = obj.frontColumnIndex;
        } else {
          frontColumnIndex = (obj.isSwapSides) ? 1 : 0;
        }
        
        updateSideButtonText();
        showCard();
        return true;
      }
    } catch (e) { }
  }
  return false;
}

let currentVideoSrc = "";

window.onload = function () {
  // Khởi tạo màu chữ
  let isTextWhite = localStorage.getItem('flashcardTextWhite');
  if (isTextWhite === null) isTextWhite = 'true';
  isTextWhite = isTextWhite === 'true';
  window.isTextWhite = isTextWhite;
  
  applyTextColor();

  // Khởi tạo video
  const lastBg = localStorage.getItem('bgVideo');
  if (lastBg && (videoList.includes(lastBg) || lastBg.startsWith('blob:'))) {
    changeBgVideo(lastBg);
  } else {
    changeBgVideo(videoList[0]);
  }
  
  loadProgress();
};

// --- LOGIC ẨN / HIỆN CONTENT ---
function toggleContentVisibility() {
    const content = document.getElementById('mainContent');
    const btnText = document.getElementById('eyeIcon');
    
    // Toggle class thay vì display trực tiếp để dễ quản lý
    content.classList.toggle('content-hidden');
    
    if (content.classList.contains('content-hidden')) {
        btnText.textContent = '🙈'; // Icon khỉ che mắt (hoặc icon mở mắt tùy ý)
    } else {
        btnText.textContent = '🐾'; // Icon mắt
    }
}

// --- LOGIC VIDEO MODAL MỚI ---
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = ''; // Clear cũ

    videoList.forEach((src, idx) => {
        const btn = document.createElement('button');
        btn.className = 'video-item-btn';
        
        // Lấy tên file cho gọn
        let name = `Video ${idx + 1}`;
        try {
           if(src.startsWith('blob:')) {
               name = `Video Upload ${idx+1}`;
           } else {
               const parts = src.split('/');
               // Lấy 1 đoạn tên ngắn gọn
               const fileName = parts[parts.length - 1];
               name = fileName.substring(0, 10) + '...'; 
           }
        } catch(e){}

        btn.innerHTML = `<span style="font-size:24px;">🎬</span><span>${name}</span>`;
        
        if (src === currentVideoSrc) {
            btn.classList.add('active');
        }

        btn.onclick = function() {
            changeBgVideo(src);
            closeVideoModal();
        };
        grid.appendChild(btn);
    });

    modal.style.display = 'block';
}

function closeVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('videoModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Xử lý chọn file video từ máy
document.getElementById('videoFileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  videoList.push(url);
  changeBgVideo(url);
  closeVideoModal();
});


function changeBgVideo(src) {
  currentVideoSrc = src;
  const bgVideo = document.getElementById('bg-video');
  const bgSource = document.getElementById('bg-source');
  
  // Chỉ reload nếu src thay đổi để tránh giật
  if(bgSource.src !== src && bgSource.src !== window.location.href + src) {
      bgSource.src = src;
      bgVideo.load();
  }
  localStorage.setItem('bgVideo', src);
}

let originalCards = [];
let cards = [];
let currentIndex = 0;
let isFront = true;
// Đã bỏ biến showMeaning, showNote vì sẽ mặc định hiện ở mặt sau
let frontColumnIndex = 0; 

function toggleSide() {
  frontColumnIndex = (frontColumnIndex + 1) % 4;
  updateSideButtonText();
  isFront = true;
  showCard();
}

function updateSideButtonText() {
  const btnText = document.getElementById('toggleSideText');
  if (btnText) {
    btnText.textContent = `🔄`; // Có thể thay icon tùy mặt nếu muốn
  }
}

// ... (Giữ nguyên logic đọc file readCSVFile, readXLSXFile, event listener csvFile)
function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      const data = lines.map(line => line.split(','));
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function readXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(rows.filter(row => row.length > 0));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

document.getElementById('csvFile').addEventListener('change', async function (e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  let combinedData = [];
  const readPromises = files.map(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') return readCSVFile(file);
    else if (ext === 'xlsx') return readXLSXFile(file);
    else return Promise.resolve([]);
  });

  try {
    const results = await Promise.all(readPromises);
    results.forEach(data => { combinedData = combinedData.concat(data); });
    if (combinedData.length > 0) {
      originalCards = combinedData;
      cards = [...originalCards];
      currentIndex = 0;
      isFront = true;
      showCard();
    } else {
      alert("Không tìm thấy dữ liệu.");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi khi đọc file.");
  }
  e.target.value = ''; 
});

function showCard() {
  const flashcard = document.getElementById('flashcard');
  if (cards.length === 0) {
    flashcard.innerHTML = "<div>Chưa có dữ liệu</div>";
    saveProgress();
    return;
  }
  const card = cards[currentIndex];
  
  const col1 = card[0] || '';
  const col2 = card[1] || '';
  const meaning = card[2] || '';
  const note = card[3] || '';
  
  const content = [col1, col2, meaning, note];

  let html = `<div class = "count" style="font-size:12px;opacity:0.7;margin-bottom:4px; font-weight: 600;">${currentIndex + 1} / ${cards.length}</div>`;

  if (isFront) {
    // MẶT TRƯỚC: Chỉ hiện nội dung chính
    const frontText = content[frontColumnIndex];
    html += `<div class = "front">${frontText}</div>`;
  } else {
    // MẶT SAU: Hiện đầy đủ thông tin (Mặc định hiện hết vì đã bỏ nút chọn)
    if (col1) html += `<div style="margin-bottom: 8px;font-size:40px;">${col1}</div>`;
    if (col2) html += `<div style="margin-bottom: 8px; font-weight: bold;">${col2}</div>`;
    // Luôn hiện Âm Hán và Nghĩa ở mặt sau
    if (meaning) html += `<div style="margin-bottom: 5px; font-style: italic; opacity: 0.9;">${meaning}</div>`;
    if (note) html += `<div style="opacity: 0.9;">${note}</div>`;
  }

  flashcard.innerHTML = html;
  applyTextColor(); // Đảm bảo màu chữ đúng sau khi render
  saveProgress();
}

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

function applyTextColor() {
    const color = window.isTextWhite ? '#ffffff' : '#000000';
    
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => card.style.color = color);
    
    const cardButtons = document.querySelectorAll('button');
    cardButtons.forEach(btn => btn.style.color = color);
    
    // Cập nhật icon nút toggle màu
    document.getElementById('toggleTextColorText').textContent = '🌗';
    const btn = document.getElementById('toggleTextColorBtn');
    btn.classList.toggle('text-white', window.isTextWhite);
    btn.classList.toggle('text-black', !window.isTextWhite);
}

document.getElementById('toggleTextColorBtn').addEventListener('click', function () {
  window.isTextWhite = !window.isTextWhite;
  applyTextColor();
  localStorage.setItem('flashcardTextWhite', window.isTextWhite);
});

window.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    nextCard();
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    prevCard();
  } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    flipCard();
  }
  // Đã bỏ shortcut '1', '2', 'q', 'e' vì đã bỏ tính năng ẩn/hiện từng phần
});

// Xử lý click nền (Chỉ khi không click vào modal)
window.addEventListener('click', function (e) {
  if (e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('select') ||
      e.target.closest('label') ||
      e.target.closest('.video-modal-content') || // Không flip khi click trong modal
      e.target.closest('.flashcard')) {
    return;
  }
  // Chỉ flip khi modal không hiển thị
  if(document.getElementById('videoModal').style.display !== 'block') {
      flipCard();
  }
});

window.addEventListener('contextmenu', function (e) {
   if (e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('.video-modal-content') ||
      e.target.closest('.flashcard')) {
    return;
  }
  e.preventDefault();
  nextCard();
});