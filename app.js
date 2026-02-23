// === GIRIN BODY LOG — App ===

const MEMBERS = {
  girin: { name: '기린 (박승현)', short: '기린' },
  minho: { name: '김민호', short: '민호' },
  seunghun: { name: '이승훈', short: '승훈' }
};

const START_DATE = new Date('2026-02-24');
const END_DATE = new Date('2026-04-20');

let currentMember = 'girin';
let charts = {};

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  initTabs();
  initMemberSelector();
  initConditionSlider();
  initBreakToggle();
  initAddExercise();
  initSaveButton();
  loadTodayRecord();
  updateWeekInfo();
});

// === 날짜 ===
function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function setTodayDate() {
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const el = document.getElementById('today-date');
  if (el) {
    el.textContent = `(${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} ${days[today.getDay()]}요일)`;
  }
}

// === 탭 ===
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const tab = document.getElementById('tab-' + btn.dataset.tab);
      if (tab) tab.classList.add('active');

      if (btn.dataset.tab === 'dashboard') renderDashboard();
      if (btn.dataset.tab === 'guild') renderGuild();
    });
  });
}

// === 멤버 선택 ===
function initMemberSelector() {
  document.querySelectorAll('.member-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.member-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMember = btn.dataset.member;
      loadTodayRecord();
      // 대시보드가 보이면 새로고침
      if (document.getElementById('tab-dashboard').classList.contains('active')) {
        renderDashboard();
      }
    });
  });
}

// === 컨디션 슬라이더 ===
function initConditionSlider() {
  const slider = document.getElementById('condition');
  const display = document.getElementById('condition-value');
  if (slider && display) {
    slider.addEventListener('input', () => {
      display.textContent = slider.value;
    });
  }
}

// === 브레이크 토글 ===
function initBreakToggle() {
  const breakCheck = document.getElementById('break-done');
  const breakRow = document.getElementById('break-count-row');
  if (breakCheck && breakRow) {
    breakCheck.addEventListener('change', () => {
      breakRow.style.display = breakCheck.checked ? 'flex' : 'none';
    });
  }
}

// === 추가 운동 ===
function initAddExercise() {
  const btn = document.getElementById('add-exercise-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const container = document.getElementById('extra-exercises');
      const row = document.createElement('div');
      row.className = 'extra-row';
      row.innerHTML = `
        <input type="text" placeholder="운동 이름" class="extra-name">
        <input type="number" placeholder="시간(분)" class="extra-duration">
      `;
      container.appendChild(row);
    });
  }
}

// === 저장 ===
function initSaveButton() {
  const btn = document.getElementById('save-btn');
  if (btn) {
    btn.addEventListener('click', saveRecord);
  }
}

function saveRecord() {
  const today = getTodayStr();

  const extras = [];
  document.querySelectorAll('.extra-row').forEach(row => {
    const name = row.querySelector('.extra-name').value.trim();
    const duration = row.querySelector('.extra-duration').value;
    if (name) extras.push({ name, duration: Number(duration) || 0 });
  });

  const record = {
    date: today,
    member: currentMember,
    body: {
      weight: Number(document.getElementById('weight').value) || null,
      bodyFat: Number(document.getElementById('body-fat').value) || null,
      sleepHours: Number(document.getElementById('sleep-hours').value) || null,
      condition: Number(document.getElementById('condition').value) || 5
    },
    workout: {
      morning: document.getElementById('morning-done').checked,
      breakDone: document.getElementById('break-done').checked,
      breakCount: Number(document.getElementById('break-count').value) || 0,
      evening: document.getElementById('evening-done').checked,
      extras: extras
    },
    note: document.getElementById('daily-note').value.trim(),
    savedAt: new Date().toISOString()
  };

  // localStorage에 저장 (추후 Firebase로 전환)
  const key = `bodylog_${currentMember}`;
  const allRecords = JSON.parse(localStorage.getItem(key) || '{}');
  allRecords[today] = record;
  localStorage.setItem(key, JSON.stringify(allRecords));

  const msg = document.getElementById('save-message');
  if (msg) {
    msg.textContent = '저장 완료!';
    setTimeout(() => { msg.textContent = ''; }, 2000);
  }
}

// === 불러오기 ===
function loadTodayRecord() {
  const today = getTodayStr();
  const key = `bodylog_${currentMember}`;
  const allRecords = JSON.parse(localStorage.getItem(key) || '{}');
  const record = allRecords[today];

  // 초기화
  document.getElementById('weight').value = '';
  document.getElementById('body-fat').value = '';
  document.getElementById('sleep-hours').value = '';
  document.getElementById('condition').value = 5;
  document.getElementById('condition-value').textContent = '5';
  document.getElementById('morning-done').checked = false;
  document.getElementById('break-done').checked = false;
  document.getElementById('break-count').value = 1;
  document.getElementById('break-count-row').style.display = 'none';
  document.getElementById('evening-done').checked = false;
  document.getElementById('daily-note').value = '';

  if (record) {
    if (record.body.weight) document.getElementById('weight').value = record.body.weight;
    if (record.body.bodyFat) document.getElementById('body-fat').value = record.body.bodyFat;
    if (record.body.sleepHours) document.getElementById('sleep-hours').value = record.body.sleepHours;
    if (record.body.condition) {
      document.getElementById('condition').value = record.body.condition;
      document.getElementById('condition-value').textContent = record.body.condition;
    }
    document.getElementById('morning-done').checked = record.workout.morning;
    document.getElementById('break-done').checked = record.workout.breakDone;
    if (record.workout.breakDone) {
      document.getElementById('break-count-row').style.display = 'flex';
      document.getElementById('break-count').value = record.workout.breakCount;
    }
    document.getElementById('evening-done').checked = record.workout.evening;
    if (record.note) document.getElementById('daily-note').value = record.note;
  }
}

// === 대시보드 렌더링 ===
function renderDashboard() {
  const key = `bodylog_${currentMember}`;
  const allRecords = JSON.parse(localStorage.getItem(key) || '{}');
  const dates = Object.keys(allRecords).sort();

  // 통계
  const totalDays = dates.length;
  const streak = calcStreak(dates);
  const conditions = dates.map(d => allRecords[d].body.condition).filter(v => v);
  const sleeps = dates.map(d => allRecords[d].body.sleepHours).filter(v => v);
  const avgCond = conditions.length ? (conditions.reduce((a, b) => a + b, 0) / conditions.length).toFixed(1) : '-';
  const avgSleep = sleeps.length ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1) : '-';

  document.getElementById('streak-count').textContent = streak;
  document.getElementById('total-days').textContent = totalDays;
  document.getElementById('avg-condition').textContent = avgCond;
  document.getElementById('avg-sleep').textContent = avgSleep;

  // 차트
  renderWeightChart(dates, allRecords);
  renderConditionChart(dates, allRecords);
  renderRoutineChart(dates, allRecords);
  renderRecentRecords(dates, allRecords);
}

function calcStreak(dates) {
  if (!dates.length) return 0;
  let streak = 0;
  const today = new Date(getTodayStr());
  let check = new Date(today);

  while (true) {
    const dateStr = check.getFullYear() + '-' +
      String(check.getMonth() + 1).padStart(2, '0') + '-' +
      String(check.getDate()).padStart(2, '0');
    if (dates.includes(dateStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderWeightChart(dates, records) {
  const ctx = document.getElementById('weight-chart');
  if (!ctx) return;

  if (charts.weight) charts.weight.destroy();

  const data = dates.map(d => ({
    x: d,
    y: records[d].body.weight
  })).filter(p => p.y);

  charts.weight = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: '체중 (kg)',
        data: data,
        borderColor: '#6c5ce7',
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#6c5ce7'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: 'category', ticks: { color: '#888' }, grid: { color: '#2a2a3e' } },
        y: { ticks: { color: '#888' }, grid: { color: '#2a2a3e' } }
      },
      plugins: { legend: { labels: { color: '#e0e0e0' } } }
    }
  });
}

function renderConditionChart(dates, records) {
  const ctx = document.getElementById('condition-chart');
  if (!ctx) return;

  if (charts.condition) charts.condition.destroy();

  const condData = dates.map(d => ({ x: d, y: records[d].body.condition })).filter(p => p.y);
  const sleepData = dates.map(d => ({ x: d, y: records[d].body.sleepHours })).filter(p => p.y);

  charts.condition = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: '컨디션 (1~10)',
          data: condData,
          borderColor: '#00cec9',
          backgroundColor: 'rgba(0, 206, 201, 0.1)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 4,
          pointBackgroundColor: '#00cec9'
        },
        {
          label: '수면 (시간)',
          data: sleepData,
          borderColor: '#fdcb6e',
          backgroundColor: 'rgba(253, 203, 110, 0.1)',
          fill: false,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 4,
          pointBackgroundColor: '#fdcb6e'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: 'category', ticks: { color: '#888' }, grid: { color: '#2a2a3e' } },
        y: { position: 'left', min: 1, max: 10, ticks: { color: '#00cec9' }, grid: { color: '#2a2a3e' } },
        y1: { position: 'right', min: 0, max: 12, ticks: { color: '#fdcb6e' }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: '#e0e0e0' } } }
    }
  });
}

function renderRoutineChart(dates, records) {
  const ctx = document.getElementById('routine-chart');
  if (!ctx) return;

  if (charts.routine) charts.routine.destroy();

  const recent = dates.slice(-7);
  const mornings = recent.map(d => records[d].workout.morning ? 1 : 0);
  const breaks = recent.map(d => records[d].workout.breakDone ? 1 : 0);
  const evenings = recent.map(d => records[d].workout.evening ? 1 : 0);

  charts.routine = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: recent.map(d => d.slice(5)),
      datasets: [
        { label: '아침', data: mornings, backgroundColor: 'rgba(108, 92, 231, 0.7)' },
        { label: '브레이크', data: breaks, backgroundColor: 'rgba(0, 206, 201, 0.7)' },
        { label: '저녁', data: evenings, backgroundColor: 'rgba(0, 184, 148, 0.7)' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#888' }, grid: { color: '#2a2a3e' } },
        y: { min: 0, max: 1, ticks: { display: false }, grid: { color: '#2a2a3e' } }
      },
      plugins: { legend: { labels: { color: '#e0e0e0' } } }
    }
  });
}

function renderRecentRecords(dates, records) {
  const container = document.getElementById('recent-records');
  if (!container) return;

  const recent = dates.slice(-7).reverse();

  if (!recent.length) {
    container.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 1rem;">아직 기록이 없습니다. 오늘부터 시작하세요!</p>';
    return;
  }

  container.innerHTML = recent.map(d => {
    const r = records[d];
    const badges = [];
    if (r.workout.morning) badges.push('<span class="badge badge-morning">아침</span>');
    if (r.workout.breakDone) badges.push('<span class="badge badge-break">브레이크</span>');
    if (r.workout.evening) badges.push('<span class="badge badge-evening">저녁</span>');
    return `
      <div class="record-item">
        <span class="record-date">${d.slice(5)}</span>
        <span>컨디션 ${r.body.condition || '-'} | 수면 ${r.body.sleepHours || '-'}h</span>
        <div class="record-badges">${badges.join('')}</div>
      </div>
    `;
  }).join('');
}

// === 길드 현황 ===
function renderGuild() {
  const grid = document.getElementById('guild-grid');
  const ranking = document.getElementById('guild-ranking');
  if (!grid || !ranking) return;

  const memberData = [];

  Object.keys(MEMBERS).forEach(id => {
    const key = `bodylog_${id}`;
    const records = JSON.parse(localStorage.getItem(key) || '{}');
    const dates = Object.keys(records).sort();
    const streak = calcStreak(dates);
    const total = dates.length;
    const latest = dates.length ? records[dates[dates.length - 1]] : null;
    const cond = latest ? latest.body.condition : null;

    memberData.push({
      id, ...MEMBERS[id], streak, total, cond,
      lastDate: dates.length ? dates[dates.length - 1] : '기록 없음',
      weekScore: calcWeekScore(dates, records)
    });
  });

  // Guild Cards
  grid.innerHTML = memberData.map(m => {
    let condClass = '';
    let condText = '-';
    if (m.cond) {
      condText = `컨디션 ${m.cond}`;
      condClass = m.cond >= 7 ? 'condition-high' : m.cond >= 4 ? 'condition-mid' : 'condition-low';
    }
    return `
      <div class="guild-card">
        <div class="name">${m.short}</div>
        <div class="streak">${m.streak}</div>
        <div class="streak-label">연속 기록 (일)</div>
        <span class="condition-badge ${condClass}">${condText}</span>
        <div class="last-record">총 ${m.total}일 기록 | 최근: ${m.lastDate}</div>
      </div>
    `;
  }).join('');

  // Ranking
  const sorted = [...memberData].sort((a, b) => b.weekScore - a.weekScore);
  const rankColors = ['gold', 'silver', 'bronze'];
  ranking.innerHTML = sorted.map((m, i) => `
    <div class="rank-row">
      <span class="rank-number ${rankColors[i] || ''}">${i + 1}</span>
      <span class="rank-name">${m.name}</span>
      <span class="rank-score">${m.weekScore}점</span>
    </div>
  `).join('');
}

function calcWeekScore(dates, records) {
  const today = new Date(getTodayStr());
  let score = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    if (records[ds]) {
      const r = records[ds];
      if (r.workout.morning) score += 2;
      if (r.workout.breakDone) score += 1;
      if (r.workout.evening) score += 2;
      if (r.body.sleepHours >= 7) score += 1;
      if (r.body.condition >= 7) score += 1;
    }
  }
  return score;
}

// === 주차 정보 ===
function updateWeekInfo() {
  const today = new Date();
  const diffDays = Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  const progress = Math.min((diffDays / 56) * 100, 100);

  const weekEl = document.getElementById('current-week');
  const barEl = document.getElementById('week-bar');
  const infoEl = document.getElementById('week-info');

  if (!weekEl) return;

  let phase, info;
  if (weekNum <= 2) {
    phase = `${weekNum}주차 — 적응기`;
    info = '기본 횟수 유지. 습관 만들기에 집중하세요.';
  } else if (weekNum <= 4) {
    phase = `${weekNum}주차 — 성장기`;
    info = '횟수 +5, 플랭크 +15초. 몸이 적응했으니 한 단계 올려봅시다.';
  } else if (weekNum <= 6) {
    phase = `${weekNum}주차 — 강화기`;
    info = '세트 +1, 유산소 10분. 체력이 올라가는 게 느껴질 겁니다.';
  } else {
    phase = `${weekNum}주차 — 완성기`;
    info = '아침 15분 / 저녁 30분. 폐관수련 마무리, 최고의 컨디션으로!';
  }

  weekEl.textContent = phase;
  barEl.style.width = progress + '%';
  infoEl.textContent = info;
}
