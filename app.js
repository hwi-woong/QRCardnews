/* ── app.js — 본죽&비빔밥 카드뉴스 생성기 ──────────────── */

// ── 색상 팔레트 ──────────────────────────────────────────
const COLOR = {
  brown:      '#3d2b1f',
  brownMid:   '#8b6340',
  brownLight: '#c8a97a',
  beige:      '#f5ede0',
  cream:      '#fffce0',
  yellow:     '#fdd835',
  orange:     '#e65100',
  red:        '#c62828',
  gold:       '#ffc107',
  white:      '#ffffff',
  textSub:    '#7a5030',
};

// ── DOM 참조 ─────────────────────────────────────────────
const formPanel   = document.getElementById('formPanel');
const resultPanel = document.getElementById('resultPanel');
const generateBtn = document.getElementById('generateBtn');
const saveBtn     = document.getElementById('saveBtn');
const backBtn     = document.getElementById('backBtn');
const canvas      = document.getElementById('cardCanvas');
const ctx         = canvas.getContext('2d');

// ── 상태 ─────────────────────────────────────────────────
let state = { storeName: '', phone: '', discount: '', kakaoUrl: '' };

// ── QRCode 라이브러리 동적 로드 ───────────────────────────
function loadQRLib(callback) {
  if (window.QRCode) { callback(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.onload  = callback;
  script.onerror = () => { console.error('QR 라이브러리 로드 실패'); callback(); };
  document.head.appendChild(script);
}

// ── 이벤트 바인딩 ─────────────────────────────────────────
generateBtn.addEventListener('click', handleGenerate);
saveBtn.addEventListener('click', handleSave);
backBtn.addEventListener('click', handleBack);

// ── 생성 핸들러 ───────────────────────────────────────────
function handleGenerate() {
  const storeName = document.getElementById('storeName').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const discount  = document.getElementById('discount').value.trim();
  const kakaoUrl  = document.getElementById('kakaoUrl').value.trim();

  if (!storeName) { showError('storeName', '매장명을 입력해주세요!'); return; }
  if (!discount)  { showError('discount',  '할인 혜택을 입력해주세요!'); return; }
  if (!kakaoUrl)  { showError('kakaoUrl',  '카카오채널 링크를 입력해주세요!'); return; }

  state = { storeName, phone, discount, kakaoUrl };

  formPanel.style.display   = 'none';
  resultPanel.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // QR 라이브러리 로드 후 생성
  loadQRLib(() => generateQRAndDraw());
}

// ── QR 생성 → 카드 렌더 ──────────────────────────────────
function generateQRAndDraw() {
  // 히든 div에 QR 생성 (로컬, CORS 없음)
  let hiddenDiv = document.getElementById('__qrHidden');
  if (!hiddenDiv) {
    hiddenDiv = document.createElement('div');
    hiddenDiv.id = '__qrHidden';
    hiddenDiv.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(hiddenDiv);
  }
  hiddenDiv.innerHTML = '';

  if (!window.QRCode) {
    // 라이브러리 없으면 QR 없이 렌더
    renderCard(null);
    return;
  }

  new QRCode(hiddenDiv, {
    text:          state.kakaoUrl,
    width:         300,
    height:        300,
    colorDark:     COLOR.brown,
    colorLight:    COLOR.cream,
    correctLevel:  QRCode.CorrectLevel.H,
  });

  // canvas 요소 추출 (약간의 딜레이 필요)
  setTimeout(() => {
    const qrCanvas = hiddenDiv.querySelector('canvas');
    renderCard(qrCanvas);
  }, 150);
}

function handleSave() {
  try {
    const link = document.createElement('a');
    link.download = `bonjuk_cardnews_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    alert('저장 실패! 이미지 위에서 우클릭 → 이미지 저장을 이용해주세요.');
  }
}

function handleBack() {
  resultPanel.style.display = 'none';
  formPanel.style.display   = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 에러 표시 ─────────────────────────────────────────────
function showError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  input.focus();
  input.style.borderColor = '#c62828';
  alert(msg);
  setTimeout(() => { input.style.borderColor = ''; }, 2000);
}

// ── 카드 렌더링 ───────────────────────────────────────────
function renderCard(qrSource) {
  const W = 560, H = 800;
  canvas.width  = W;
  canvas.height = H;

  drawBackground(W, H);
  drawHeader(W, state.storeName);
  drawTitleZone(W);
  drawBenefitBox(W, state.discount);
  drawQRZone(W, qrSource);
  drawStepsZone(W, state.discount);
  drawFooter(W, H, state.storeName, state.phone);
}

// ── 드로우 헬퍼 ───────────────────────────────────────────
function roundRect(x, y, w, h, r, fill, stroke, sw = 2) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,   x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  if (fill)   { ctx.fillStyle = fill;     ctx.fill();   }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function font(size, bold = false) {
  return `${bold ? 'bold ' : ''}${size}px 'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif`;
}

// ── 섹션별 드로우 ─────────────────────────────────────────
function drawBackground(W, H) {
  roundRect(0, 0, W, H, 20, COLOR.cream);
}

function drawHeader(W, storeName) {
  ctx.beginPath();
  ctx.moveTo(0, 20); ctx.arcTo(0, 0, 20, 0, 20);
  ctx.lineTo(W - 20, 0); ctx.arcTo(W, 0, W, 20, 20);
  ctx.lineTo(W, 62); ctx.lineTo(0, 62); ctx.closePath();
  ctx.fillStyle = COLOR.brown; ctx.fill();
  ctx.fillStyle = '#f0e6d3';
  ctx.font = font(15, true); ctx.textAlign = 'center';
  ctx.fillText('본죽&비빔밥  ' + (storeName || '○○점'), W / 2, 38);
}

function drawTitleZone(W) {
  ctx.fillStyle = COLOR.cream; ctx.fillRect(0, 62, W, 136);
  [[34,94,22],[58,118,13],[W-38,98,18],[W-62,90,12]].forEach(([x,y,sz]) => {
    ctx.fillStyle = COLOR.gold; ctx.font = sz + 'px serif';
    ctx.textAlign = 'center'; ctx.fillText('✦', x, y);
  });
  ctx.fillStyle = COLOR.brown; ctx.font = font(28, true); ctx.textAlign = 'center';
  ctx.fillText('카카오톡 채널 추가하고', W / 2, 106);
  ctx.fillText('혜택 받으세요! 💬', W / 2, 144);
}

function drawBenefitBox(W, discount) {
  roundRect(24, 206, W - 48, 72, 14, COLOR.yellow);
  ctx.fillStyle = COLOR.brown; ctx.font = font(13, true); ctx.textAlign = 'center';
  ctx.fillText('채널 추가하면', W / 2, 230);
  ctx.fillStyle = COLOR.orange; ctx.font = font(32, true);
  ctx.fillText((discount || '20%') + '  할인 쿠폰 즉시 발급!', W / 2, 264);
}

function drawQRZone(W, qrSource) {
  ctx.fillStyle = '#fff8e1'; ctx.fillRect(0, 292, W, 244);
  ctx.fillStyle = COLOR.brown; ctx.font = font(13, true); ctx.textAlign = 'center';
  ctx.fillText('📱  카메라로 QR 코드를 스캔하세요', W / 2, 316);

  const qs = 190, qx = (W - qs) / 2, qy = 330;
  roundRect(qx - 8, qy - 8, qs + 16, qs + 16, 10, COLOR.white, COLOR.brown, 3);

  if (qrSource) {
    try { ctx.drawImage(qrSource, qx, qy, qs, qs); }
    catch (_) { drawQRFallback(qx, qy, qs); }
  } else {
    drawQRFallback(qx, qy, qs);
  }

  ctx.fillStyle = COLOR.brownMid; ctx.font = font(11); ctx.textAlign = 'center';
  ctx.fillText('스캔 후 채널 추가 → 쿠폰 즉시 발급!', W / 2, qy + qs + 24);
}

function drawQRFallback(x, y, s) {
  ctx.fillStyle = '#f0ece4'; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = '#bbb'; ctx.font = font(12); ctx.textAlign = 'center';
  ctx.fillText('QR 코드', x + s / 2, y + s / 2 - 8);
  ctx.fillText('로딩 중...', x + s / 2, y + s / 2 + 10);
}

function drawStepsZone(W, discount) {
  ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(28, 548); ctx.lineTo(W - 28, 548); ctx.stroke();
  ctx.fillStyle = COLOR.cream; ctx.fillRect(0, 548, W, 178);
  ctx.fillStyle = COLOR.brown; ctx.font = font(15, true); ctx.textAlign = 'center';
  ctx.fillText('📋  참여 방법', W / 2, 576);

  const steps = [
    { n:'1', icon:'💬', t1:'카카오톡 실행',  t2:"'본죽&비빔밥' 검색" },
    { n:'2', icon:'➕', t1:'채널 추가',      t2:'채널 추가 버튼 탭!' },
    { n:'3', icon:'🎁', t1:'쿠폰 발급',      t2:(discount||'20%')+' 쿠폰 사용!' },
  ];

  const colW = (W - 56) / 3;
  steps.forEach((s, i) => {
    const sx = 28 + i * colW + 6, sy = 588, sw = colW - 12;
    roundRect(sx, sy, sw, 124, 12, COLOR.white, '#e8d8b0', 1.5);
    ctx.beginPath(); ctx.arc(sx + sw / 2, sy + 24, 18, 0, Math.PI * 2);
    ctx.fillStyle = COLOR.brown; ctx.fill();
    ctx.fillStyle = COLOR.white; ctx.font = font(14, true); ctx.textAlign = 'center';
    ctx.fillText(s.n, sx + sw / 2, sy + 29);
    ctx.font = '22px serif'; ctx.fillText(s.icon, sx + sw / 2, sy + 70);
    ctx.fillStyle = COLOR.brown; ctx.font = font(10, true); ctx.textAlign = 'center';
    ctx.fillText(s.t1, sx + sw / 2, sy + 90);
    ctx.fillStyle = COLOR.textSub; ctx.font = font(9); ctx.textAlign = 'center';
    if (ctx.measureText(s.t2).width > sw - 8) {
      const mid = Math.ceil(s.t2.length / 2);
      ctx.fillText(s.t2.slice(0, mid), sx + sw / 2, sy + 104);
      ctx.fillText(s.t2.slice(mid),    sx + sw / 2, sy + 116);
    } else {
      ctx.fillText(s.t2, sx + sw / 2, sy + 104);
    }
    if (i < 2) {
      ctx.fillStyle = COLOR.brownLight; ctx.font = font(20); ctx.textAlign = 'center';
      ctx.fillText('›', sx + sw + 10, sy + 66);
    }
  });
}

function drawFooter(W, H, storeName, phone) {
  ctx.beginPath();
  ctx.moveTo(0, 726); ctx.lineTo(W, 726); ctx.lineTo(W, H - 20);
  ctx.arcTo(W, H, W - 20, H, 20); ctx.lineTo(20, H);
  ctx.arcTo(0, H, 0, H - 20, 20); ctx.closePath();
  ctx.fillStyle = COLOR.brown; ctx.fill();
  ctx.fillStyle = '#f0e6d3'; ctx.font = font(13, true); ctx.textAlign = 'left';
  ctx.fillText('🏠  본죽&비빔밥 ' + (storeName || '○○점'), 22, 752);
  if (phone) {
    ctx.fillStyle = COLOR.brownLight; ctx.font = font(11);
    ctx.fillText('📞  ' + phone, 22, 770);
  }
  ctx.fillStyle = COLOR.brownLight; ctx.font = font(10); ctx.textAlign = 'right';
  ctx.fillText('🛵  배달의민족 · 쿠팡이츠 · 본오더 · 땡겨요', W - 20, 756);
  ctx.fillStyle = '#6b4a2a'; ctx.font = font(10); ctx.textAlign = 'center';
  ctx.fillText('정성 가득, 건강 가득한 한 끼로 보답하겠습니다', W / 2, 788);
}
