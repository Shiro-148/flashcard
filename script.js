const videoList = [
  "C:/Users/LENOVO/Videos/wallpaper/bocchi-walking-in-the-rain-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/samurai-sword-stars-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/cozy-autumn-rain-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/empty-classroom-in-the-evening-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/penacony-raining-stars-honkai-star-rail-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/anime-girl-looking-at-the-cherry-blossoms-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/elaina-drinking-coffee-near-window-majo-no-tabitabi-wallpaperwaifu-com.mp4",
  "C:/Users/LENOVO/Videos/wallpaper/anime-girl-silhouette-watching-the-plane-wallpaperwaifu-com.mp4",
];

function saveProgress() {
  if (cards.length === 0) return;
  localStorage.setItem('flashcardProgress', JSON.stringify({
    cards,
    originalCards,
    currentIndex,
    isFront,
    showMeaning,
    showNote,
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
        showMeaning = obj.showMeaning ?? false;
        showNote = obj.showNote ?? false;
        
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

window.onload = function () {
  const select = document.getElementById('videoSelect');
  videoList.forEach((src, idx) => {
    const opt = document.createElement('option');
    opt.value = src;
    opt.textContent = `${idx + 1}`;
    select.appendChild(opt);
  });
  const lastBg = localStorage.getItem('bgVideo');
  if (lastBg && videoList.includes(lastBg)) {
    changeBgVideo(lastBg);
    select.value = lastBg;
  } else {
    changeBgVideo(videoList[0]);
    select.value = videoList[0];
  }
  document.getElementById('btn-meaning').classList.remove('active');
  document.getElementById('btn-note').classList.remove('active');

  let isTextWhite = localStorage.getItem('flashcardTextWhite');
  if (isTextWhite === null) isTextWhite = 'true';
  isTextWhite = isTextWhite === 'true';
  window.isTextWhite = isTextWhite;
  
  document.getElementById('toggleTextColorText').textContent = '🌗';
  const btn = document.getElementById('toggleTextColorBtn');
  btn.classList.toggle('text-white', isTextWhite);
  btn.classList.toggle('text-black', !isTextWhite);
  
  const cardButtons = document.querySelectorAll('.content-main button');
  cardButtons.forEach(btn => {
    btn.style.color = isTextWhite ? '#ffffff' : '#000000';
  });
  document.getElementById('videoSelect').style.color = isTextWhite ? '#ffffff' : '#000000';
  document.getElementById('openFileBtn').style.color = isTextWhite ? '#ffffff' : '#000000';
  document.getElementById('toggleSideBtn').style.color = isTextWhite ? '#ffffff' : '#000000';
  
  const searchInput = document.querySelector('form input[name="q"]');
  const searchBtn = document.querySelector('form button[type="submit"]');
  if (searchInput) {
    searchInput.style.color = isTextWhite ? '#ffffff' : '#000000';
    searchInput.style.setProperty('--placeholder-color', isTextWhite ? '#fff' : '#000');
    searchInput.classList.toggle('text-white', isTextWhite);
    searchInput.classList.toggle('text-black', !isTextWhite);
  }
  if (searchBtn) {
    searchBtn.style.color = isTextWhite ? '#ffffff' : '#000000';
  }
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(card => {
    card.style.color = isTextWhite ? '#ffffff' : '#000000';
  });
  loadProgress();
};

function toggleVideoSelect() {
  const select = document.getElementById('videoSelect');
  const openFileBtn = document.getElementById('openFileBtn');
  const isHidden = select.style.display === 'none';
  select.style.display = isHidden ? 'inline' : 'none';
  openFileBtn.style.display = isHidden ? 'inline' : 'none';
}

document.getElementById('videoFileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  videoList.push(url);
  const select = document.getElementById('videoSelect');
  const opt = document.createElement('option');
  opt.value = url;
  opt.textContent = 'Video mới';
  select.appendChild(opt);
  select.value = url;
  onVideoSelected(url);
  select.style.display = 'none';
  document.getElementById('openFileBtn').style.display = 'none';
});

function onVideoSelected(src) {
  changeBgVideo(src);
  const select = document.getElementById('videoSelect');
  select.value = src;
  document.getElementById('videoSelect').style.display = 'none';
  document.getElementById('openFileBtn').style.display = 'none';
}

function changeBgVideo(src) {
  document.getElementById('bg-source').src = src;
  document.getElementById('bg-video').load();
  localStorage.setItem('bgVideo', src);
}

let originalCards = [];
let cards = [];
let currentIndex = 0;
let isFront = true;
let showMeaning = false;
let showNote = false;
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
    btnText.textContent = `🔄`;
  }
}

// --- LOGIC MỚI: Xử lý nhiều file ---

// Hàm hỗ trợ đọc file CSV trả về Promise
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

// Hàm hỗ trợ đọc file XLSX trả về Promise
function readXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        // Lọc bỏ dòng trống
        resolve(rows.filter(row => row.length > 0));
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Xử lý sự kiện chọn file (đã sửa để hỗ trợ nhiều file)
document.getElementById('csvFile').addEventListener('change', async function (e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  let combinedData = [];

  // Tạo danh sách các Promise để đọc file song song
  const readPromises = files.map(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      return readCSVFile(file);
    } else if (ext === 'xlsx') {
      return readXLSXFile(file);
    } else {
      return Promise.resolve([]); // Bỏ qua file không đúng định dạng
    }
  });

  try {
    // Chờ tất cả file đọc xong
    const results = await Promise.all(readPromises);
    
    // Gộp tất cả kết quả lại thành 1 mảng lớn
    results.forEach(data => {
      combinedData = combinedData.concat(data);
    });

    if (combinedData.length > 0) {
      originalCards = combinedData;
      cards = [...originalCards];
      currentIndex = 0;
      isFront = true;
      showMeaning = false;
      showNote = false;
      showCard();
    } else {
      alert("Không tìm thấy dữ liệu trong các file đã chọn.");
    }
  } catch (err) {
    console.error("Lỗi khi đọc file:", err);
    alert("Có lỗi xảy ra khi đọc file.");
  }
  
  // Reset input để có thể chọn lại cùng file nếu muốn
  e.target.value = ''; 
});

// Giữ lại hàm parseCSV cũ để tương thích nếu cần (dù logic mới đã tích hợp sẵn)
function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
  originalCards = lines.map(line => line.split(','));
  cards = [...originalCards];
  currentIndex = 0;
  isFront = true;
  showMeaning = false;
  showNote = false;
  showCard();
}

function showCard() {
  const flashcard = document.getElementById('flashcard');
  if (cards.length === 0) {
    flashcard.innerHTML = "<div>Không có dữ liệu</div>";
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
    const frontText = content[frontColumnIndex];
    html += `<div class = "front">${frontText}</div>`;
    
    if (showMeaning && meaning && frontColumnIndex !== 2) {
      html += `<div style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">${meaning}</div>`;
    }
    if (showNote && note && frontColumnIndex !== 3) {
      html += `<div style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">${note}</div>`;
    }
  } else {
    if (col1) html += `<div style="margin-bottom: 8px;font-size:40px;">${col1}</div>`;
    if (col2) html += `<div style="margin-bottom: 8px; font-weight: bold;">${col2}</div>`;
    if (meaning) html += `<div style="margin-bottom: 5px; font-style: italic; opacity: 0.9;">${meaning}</div>`;
    if (note) html += `<div style="opacity: 0.9;">${note}</div>`;
  }

  flashcard.innerHTML = html;
  flashcard.style.color = window.isTextWhite ? '#ffffff' : '#000000';
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
  showMeaning = false;
  showNote = false;
  document.getElementById('btn-meaning').classList.remove('active');
  document.getElementById('btn-note').classList.remove('active');
  showCard();
}

function prevCard() {
  if (cards.length === 0) return;
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  isFront = true;
  showMeaning = false;
  showNote = false;
  document.getElementById('btn-meaning').classList.remove('active');
  document.getElementById('btn-note').classList.remove('active');
  showCard();
}

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentIndex = 0;
  isFront = true;
  showMeaning = false;
  showNote = false;
  document.getElementById('btn-meaning').classList.remove('active');
  document.getElementById('btn-note').classList.remove('active');
  showCard();
}

function toggleMeaning() {
  showMeaning = !showMeaning;
  document.getElementById('btn-meaning').classList.toggle('active', showMeaning);
  showCard();
}

function toggleNote() {
  showNote = !showNote;
  document.getElementById('btn-note').classList.toggle('active', showNote);
  showCard();
}

document.getElementById('toggleTextColorBtn').addEventListener('click', function () {
  window.isTextWhite = !window.isTextWhite;
  const flashcards = document.querySelectorAll('.flashcard');
  flashcards.forEach(card => {
    card.style.color = window.isTextWhite ? '#ffffff' : '#000000';
  });
  const cardButtons = document.querySelectorAll('.content-main button');
  cardButtons.forEach(btn => {
    btn.style.color = window.isTextWhite ? '#ffffff' : '#000000';
  });
  document.getElementById('videoSelect').style.color = window.isTextWhite ? '#ffffff' : '#000000';
  document.getElementById('openFileBtn').style.color = window.isTextWhite ? '#ffffff' : '#000000';
  document.getElementById('toggleSideBtn').style.color = window.isTextWhite ? '#ffffff' : '#000000';
  
  const searchInput = document.querySelector('form input[name="q"]');
  const searchBtn = document.querySelector('form button[type="submit"]');
  if (searchInput) {
    searchInput.style.color = window.isTextWhite ? '#ffffff' : '#000000';
    searchInput.style.setProperty('--placeholder-color', window.isTextWhite ? '#fff' : '#000');
    searchInput.classList.toggle('text-white', window.isTextWhite);
    searchInput.classList.toggle('text-black', !window.isTextWhite);
  }
  if (searchBtn) {
    searchBtn.style.color = window.isTextWhite ? '#ffffff' : '#000000';
  }
  localStorage.setItem('flashcardTextWhite', window.isTextWhite);
  document.getElementById('toggleTextColorText').textContent = '🌗';
  const btn = document.getElementById('toggleTextColorBtn');
  btn.classList.toggle('text-white', window.isTextWhite);
  btn.classList.toggle('text-black', !window.isTextWhite);
});

(function () {
  const style = document.createElement('style');
  style.innerHTML = `
        form input[name="q"]::placeholder {
          color: var(--placeholder-color, #cccccc);
          opacity: 1;
        }
      `;
  document.head.appendChild(style);
})();

window.addEventListener('DOMContentLoaded', function () {
  window.scrollTo(0, document.body.scrollHeight);
});

window.addEventListener('keydown', function (e) {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) return;

  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    nextCard();
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    prevCard();
  } else if (e.key === '0' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
    flipCard();
  } else if (e.key === '2' || e.key === 'ArrowUp' || e.key === 'e' || e.key === 's' || e.key === 'E' || e.key === 'S') {
    toggleNote();
  } else if (e.key === '1' || e.key === 'q' || e.key === 'Q' || e.key === 'W' || e.key === 'w' || e.key === 'CapsLock') {
    toggleMeaning();
  }
});

// Xử lý click nền
window.addEventListener('click', function (e) {
  if (e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('select') ||
      e.target.closest('label') ||
      e.target.closest('.flashcard')) {
    return;
  }
  flipCard();
});

window.addEventListener('contextmenu', function (e) {
  if (e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('select') ||
      e.target.closest('label') ||
      e.target.closest('.flashcard')) {
    return;
  }
  e.preventDefault();
  nextCard();
});