/* ── app.js — 본죽&비빔밥 네이버 리뷰 QR 생성기 ── */

// ── QR 라이브러리 로드 ────────────────────────────────────
function loadQRLib(callback) {
  if (window.QRCode) { callback(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  s.onload  = callback;
  s.onerror = () => { alert('네트워크 오류. 새로고침 후 다시 시도해주세요.'); };
  document.head.appendChild(s);
}

// ── 생성 ─────────────────────────────────────────────────
function generate() {
  const storeName = document.getElementById('storeName').value.trim();
  const phone     = document.getElementById('phone').value.trim();
  const naverUrl  = document.getElementById('naverUrl').value.trim();

  if (!storeName) { shake('storeName'); alert('매장명을 입력해주세요!'); return; }
  if (!naverUrl)  { shake('naverUrl');  alert('네이버 리뷰 링크를 입력해주세요!'); return; }
  if (!naverUrl.startsWith('http')) { alert('올바른 링크를 입력해주세요!\n예) https://naver.me/xxxxxxxx'); return; }

  loadQRLib(() => {
    const hidden = document.getElementById('__qrHidden');
    hidden.innerHTML = '';

    new QRCode(hidden, {
      text:         naverUrl,
      width:        260,
      height:       260,
      colorDark:    '#1a7a34',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });

    setTimeout(() => {
      const qrSrc = hidden.querySelector('canvas');
      if (!qrSrc) { alert('QR 생성 실패. 다시 시도해주세요.'); return; }

      // 메인 캔버스에 복사
      const canvas = document.getElementById('qrCanvas');
      canvas.width  = 260;
      canvas.height = 260;
      const c = canvas.getContext('2d');
      c.fillStyle = '#fff';
      c.fillRect(0, 0, 260, 260);
      c.drawImage(qrSrc, 0, 0, 260, 260);

      // 매장 정보 표시
      document.getElementById('qrStoreName').textContent = '본죽&비빔밥 ' + storeName;
      document.getElementById('qrPhone').textContent     = phone ? '📞 ' + phone : '';
      document.getElementById('resultDesc').textContent  = storeName + ' 리뷰 QR코드가 완성됐어요!';

      // 화면 전환
      document.getElementById('formCard').style.display   = 'none';
      const resultCard = document.getElementById('resultCard');
      resultCard.style.display = 'block';
      resultCard.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  });
}

// ── 저장 ─────────────────────────────────────────────────
function saveQR() {
  const canvas    = document.getElementById('qrCanvas');
  const storeName = document.getElementById('storeName').value.trim() || '매장';
  try {
    const a = document.createElement('a');
    a.download = `naver_review_qr_${storeName}.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch(e) {
    alert('QR코드 위에서 우클릭 → 이미지 저장을 이용해주세요.');
  }
}

// ── 다시 입력 ─────────────────────────────────────────────
function goBack() {
  document.getElementById('resultCard').style.display = 'none';
  document.getElementById('formCard').style.display   = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 흔들기 애니메이션 ─────────────────────────────────────
function shake(id) {
  const el = document.getElementById(id);
  el.style.animation = 'shake 0.3s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

// ── 엔터키 지원 ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ['storeName', 'phone', 'naverUrl'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') generate();
    });
  });
});

// 흔들기 키프레임 동적 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    25%    { transform: translateX(-6px); }
    75%    { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);
