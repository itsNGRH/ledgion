import { today, id, formatRupiah, checkLevelUp, showLevelUp, applyTheme } from './utils.js';
import { saveState } from './storage.js';

/* =========================
   HOME
========================= */
export function renderHome(state) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

  let income = 0;
  let expense = 0;

  state.transactions.forEach(t => {
    if (t.date.startsWith(currentMonth)) {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    }
  });

  const balance = income - expense;
  const mission = state.missions.period.input;

  document.getElementById('app').innerHTML = `
    <div class="section">
      <h2>Halo, ${state.user.name}</h2>
      <p>Level ${state.user.level} · ${state.user.title}</p>
    </div>

    <div class="card">
      <h3>Ringkasan</h3>
      <p>💰 Pemasukan: ${formatRupiah(income)}</p>
      <p>💸 Pengeluaran: ${formatRupiah(expense)}</p>
    </div>

    <div class="card">
      <h3>Saldo</h3>
      <p>
        ${balance >= 0 ? '🟢 Surplus' : '🔴 Defisit'}
        ${formatRupiah(balance)}
      </p>
    </div>

    <div class="card">
      <h3>Progress</h3>
      <p>
        🎯 Input Transaksi:
        ${mission.progress} / ${mission.target}
        ${mission.completed ? '✓' : ''}
      </p>
    </div>

    <div class="card">
      <h3>Konsistensi</h3>
      <p>🔥 Streak: ${state.user.streak} hari</p>
    </div>

    <button class="btn-primary" id="add">
      + Transaksi
    </button>
  `;

  document.getElementById('add').onclick = () => {
    renderTransactionScreen(state);
  };
}

/* =========================
   TRANSACTION SCREEN
========================= */
const CATEGORY_MAP = {
  expense: [
    { value: 'Makan', label: 'Makan' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Hiburan', label: 'Hiburan' },
    { value: 'Lainnya', label: 'Lainnya' }
  ],
  income: [
    { value: 'Gaji', label: 'Gaji' },
    { value: 'Bonus', label: 'Bonus' },
    { value: 'Usaha', label: 'Usaha' },
    { value: 'Lainnya', label: 'Lainnya' }
  ]
};

function renderCategoryOptions(type) {
  const select = document.getElementById('category');
  select.innerHTML = CATEGORY_MAP[type]
    .map(c => `<option value="${c.value}">${c.label}</option>`)
    .join('');
}

export function renderTransactionScreen(state) {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  let filterMonth = state.ui?.transactionFilterMonth || currentMonth;

  // Hitung saldo
  let income = 0;
  let expense = 0;
  state.transactions.forEach(t => {
    if (t.date.startsWith(filterMonth)) { // pakai filterMonth supaya sesuai filter
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    }
  });
  const balance = income - expense;

  document.getElementById('app').innerHTML = `
    <div class="section">
      <h2>📝 Transaksi</h2>
    </div>

    <div class="card">
      <form id="trx-form">

        <label>
          Tanggal
          <input id="date" type="date" value="${today()}" />
        </label>

        <label>
          Jenis
          <select id="type">
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </label>

        <label>
          Kategori
          <select id="category"></select>
        </label>

        <label>
          Keterangan (opsional)
          <input id="note" type="text" />
        </label>

        <label>
          Nominal
          <input id="amount" type="text" inputmode="numeric" />
        </label>

        <button type="submit" class="btn-primary">
          Simpan
        </button>

      </form>
    </div>

    <div class="section" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <h3 style="margin:0;">📜 Riwayat</h3>
      <div style="display:flex;align-items:center;gap:6px;">
        <label for="month-filter" style="margin:0;">Filter Bulan:</label>
        <input type="month" id="month-filter" value="${filterMonth}" />
      </div>
    </div>

    <div class="card">
      <div style="overflow-x:auto">
        <table width="100%" cellspacing="0" cellpadding="6">  
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Nominal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody id="trx-list">
            ${state.transactions
              .filter(t => t.date.startsWith(filterMonth))
              .map(t => {
                const d = new Date(t.date);
                const formattedDate = `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
                return `
                  <tr>
                    <td>${formattedDate}</td>
                    <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                    <td>${t.category || '-'}</td>
                    <td>${t.note || '-'}</td>
                    <td style="text-align:right; padding-right:12px;">${formatRupiah(t.amount)}</td>
                    <td>
                      <button class="btn-danger delete-btn" data-id="${t.id}">Hapus</button>
                    </td>
                  </tr>
                `;
              }).join('') || `
                <tr>
                  <td colspan="6" align="center">Belum ada transaksi</td>
                </tr>
              `}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <p style="margin:0;font-weight:500;">Saldo</p>
      <p style="margin:0;font-weight:700;color:${balance >= 0 ? '#16A34A' : '#DC2626'};">${formatRupiah(balance)}</p>
    </div>

  `;

  // =========================
  // Setup form dan kategori
  const form = document.getElementById('trx-form');
  const typeSelect = document.getElementById('type');
  const amountInput = document.getElementById('amount');

  renderCategoryOptions(typeSelect.value);
  typeSelect.onchange = () => renderCategoryOptions(typeSelect.value);

  amountInput.addEventListener('input', () => {
    const raw = amountInput.value.replace(/\D/g,'');
    if (!raw) { amountInput.value = ''; return; }
    const number = Number(raw);
    if (isNaN(number)) return;
    amountInput.value = formatRupiah(number);
  });

  // =========================
  // Tambah transaksi
  form.onsubmit = (e) => {
    e.preventDefault();
    const amount = Number(amountInput.value.replace(/\./g,''));
    if (amount < 1000) return;

    const trx = {
      id: id(),
      date: document.getElementById('date').value,
      type: typeSelect.value,
      category: document.getElementById('category').value,
      note: document.getElementById('note').value,
      amount,
      createdAt: Date.now()
    };

    state.transactions.push(trx);
    state.stats.totalTransactionCount += 1;

    if (state.stats.dailyTransactionXPCount < 5) {
      state.user.xp += 10;
      state.stats.totalXp += 10;
      state.stats.dailyTransactionXPCount += 1;
    }

    if (!state.missions.period.input.completed) {
      state.missions.period.input.progress += 1;
      if (state.missions.period.input.progress >= state.missions.period.input.target) {
        state.missions.period.input.completed = true;
        state.user.xp += 30;
        state.stats.totalXp += 30;
        state.stats.totalCoin += 2;
      }
    }

    if (state.stats.totalTransactionCount % 10 === 0) {
      state.stats.totalCoin += 1;
    }

    const levelUpEvent = checkLevelUp(state.user);
    if (levelUpEvent.leveledUp) showLevelUp(levelUpEvent);

    saveState(state);
    renderTransactionScreen(state);
  };

  // =========================
  // Filter bulan
  const monthFilter = document.getElementById('month-filter');
  monthFilter.onchange = () => {
    state.ui ??= {};
    state.ui.transactionFilterMonth = monthFilter.value;
    renderTransactionScreen(state);
  };

  // =========================
  // Hapus transaksi dengan modal konfirmasi
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const trxId = btn.dataset.id;
      const trx = state.transactions.find(t => t.id === trxId);
      if (!trx) return;

      // Modal overlay
      const overlay = document.createElement('div');
      overlay.classList.add('modal-overlay');

      const modal = document.createElement('div');
      modal.classList.add('modal-content');

      modal.innerHTML = `
        <h3>⚠️ Hapus Transaksi?</h3>
        <p>${trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${formatRupiah(trx.amount)}</p>
        <div style="display:flex;justify-content:center;gap:12px;margin-top:16px;">
          <button id="confirm-delete" class="btn-danger">YA</button>
          <button id="cancel-delete" class="btn-secondary">BATAL</button>
        </div>
      `;
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      document.getElementById('confirm-delete').onclick = () => {
        state.transactions = state.transactions.filter(t => t.id !== trxId);
        saveState(state);
        document.body.removeChild(overlay);
        renderTransactionScreen(state);
      };

      document.getElementById('cancel-delete').onclick = () => {
        document.body.removeChild(overlay);
      };
    };
  });
}

/* =========================
   MISSION + THEME SHOP
========================= */
export function renderMission(state) {
  const period = state.missions.period.input;
  const progressPercent = Math.min(
    100,
    Math.round((period.progress / period.target) * 100)
  );

  const themes = [
    { id: 'light', name: 'Light', color: '#FFFFFF', price: 0 },
    { id: 'dark', name: 'Dark', color: '#111827', price: 1 },
    { id: 'red', name: 'Red', color: '#FF0000', price: 2 },
    { id: 'green', name: 'Green', color: '#00FF00', price: 2 },
    { id: 'blue', name: 'Blue', color: '#0000FF', price: 2 },
    { id: 'yellow', name: 'Yellow', color: '#FFFF00', price: 3 },
    { id: 'magenta', name: 'Magenta', color: '#FF00FF', price: 3 },
    { id: 'cyan', name: 'Cyan', color: '#00FFFF', price: 3 }
  ];

  document.getElementById('app').innerHTML = `
    <div class="section" style="display:flex;justify-content:space-between;align-items:center;">
      <h2>🎯 Misi</h2>
      <p>XP: ${state.user.xp}</p>
    </div>

    <div class="card">
      <h3>🌞 Harian</h3>
      <p>🔑 Login</p>
      <p>
        Status:
        <strong>
          ${state.missions.daily.login.completed ? '✓ Selesai' : 'Belum selesai'}
        </strong>
      </p>
      <p style="font-size:12px;color:#6B7280">
        Reward: +10 XP
      </p>
    </div>

    <div class="card">
      <h3>📆 Periodik</h3>
      <p>✍️ Transaksi</p>
      <p><strong>${period.progress} / ${period.target}</strong></p>

      <div style="
        background:#E5E7EB;
        border-radius:8px;
        overflow:hidden;
        height:8px;
        margin:8px 0;
      ">
        <div style="
          width:${progressPercent}%;
          height:100%;
          background:#4F46E5;
        "></div>
      </div>

      <p style="font-size:12px;color:#6B7280">
        Reward: +30 XP, +2 Coin
      </p>
    </div>

    <div class="section" style="display:flex;justify-content:space-between;align-items:center;">
      <h2>🎨 Toko</h2>
      <p>Coin: ${state.stats.totalCoin}</p>
    </div>

    ${themes.map(t => {
      const owned = state.themes.owned.includes(t.id);
      const active = state.themes.active === t.id;

      let action = '';
      if (active) action = '<button class="btn-secondary" disabled>Aktif</button>';
      else if (owned) action = `<button class="btn-secondary" data-use="${t.id}">Pakai</button>`;
      else action = `<button class="btn-secondary" data-buy="${t.id}">Beli ${t.price} Coin</button>`;

      return `
        <div class="card" style="display:flex;align-items:center;gap:12px">
          <div style="
            width:36px;
            height:36px;
            border-radius:8px;
            background:${t.color};
          "></div>

          <div style="flex:1">
            <p><strong>${t.name}</strong></p>
            <p style="font-size:12px;color:#6B7280">
              ${t.price === 0 ? 'Gratis' : `${t.price} Coin`}
            </p>
          </div>

          ${action}
        </div>
      `;
    }).join('')}
  `;

  document.querySelectorAll('[data-use]').forEach(btn => {
    btn.onclick = () => {
        const themeId = btn.dataset.use;
        state.themes.active = themeId;
        applyTheme(themeId);
        saveState(state);
        renderMission(state);
    };
  });

  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => {
      const theme = themes.find(t => t.id === btn.dataset.buy);

      if (
        state.stats.totalCoin >= theme.price &&
        !state.themes.owned.includes(theme.id)
      ) {
        state.stats.totalCoin -= theme.price;
        state.themes.owned.push(theme.id);
        state.themes.active = theme.id;
        applyTheme(theme.id);
        saveState(state);
        renderMission(state);
      }
    };
  });
}

/* =========================
   PROFILE
========================= */
export function renderProfile(state) {
  const xpCurrent = state.user.xp;
  const xpNext = state.user.level * 100;
  const xpPercent = Math.min(
    100,
    Math.round((xpCurrent / xpNext) * 100)
  );

  document.getElementById('app').innerHTML = `
    <!-- HEADER -->
    <div class="section" style="text-align:center">
      <h2>${state.user.name}</h2>
      <p style="color:#6B7280">
        ${state.user.title}
      </p>
    </div>

    <!-- LEVEL -->
    <div class="card" style="text-align:center">
      <p style="font-size:14px;color:#6B7280">
        Level
      </p>
      <h1 style="margin:4px 0">
        ${state.user.level}
      </h1>

      <div style="
        background:#E5E7EB;
        border-radius:8px;
        overflow:hidden;
        height:10px;
        margin:12px 0;
      ">
        <div style="
          width:${xpPercent}%;
          height:100%;
          background:#4F46E5;
        "></div>
      </div>

      <p style="font-size:12px;color:#6B7280">
        ${xpCurrent} / ${xpNext} XP
      </p>
    </div>

    <!-- STATISTIK -->
    <div class="card">
      <h3>📊 Statistik</h3>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
        margin-top:12px;
      ">
        <div>
          <p>🟡 ${state.stats.totalCoin} Coin</p>
        </div>

        <div>
          <p>🔥 ${state.user.streak} hari</p>
        </div>

        <div>
          <p>📝 ${state.stats.totalTransactionCount} Transaksi</p>
        </div>

        <div>
          <p>⭐ ${state.stats.totalXp} Total XP</p>
        </div>
      </div>
    </div>

    <div class="card">
        <h3>🏅 Penghargaan</h3>

        <p style="margin-top:8px">
            Kamu berada di
            <strong>Level ${state.user.level}</strong>
            dengan title
            <strong>${state.user.title}</strong>.
        </p>

        <p style="font-size:14px;color:#6B7280;margin-top:6px">
            ${
            state.user.streak >= 7
                ? 'Konsistensi kamu sudah terbentuk. Pertahankan kebiasaan ini.'
                : state.user.streak >= 3
                ? 'Kamu sedang membangun kebiasaan mencatat keuangan.'
                : 'Awal yang baik. Konsistensi kecil lebih penting dari sempurna.'
            }
        </p>
    </div>

    <!-- RESET -->
    <div class="card">
      <h3>⚠️ Reset</h3>
      <p style="font-size:14px">
        Semua data keuangan dan progres akan dihapus.
      </p>
      <button id="reset" class="btn-danger">
        Reset Data
      </button>
    </div>
  `;

    document.getElementById('reset').onclick = () => {
        const ok = confirm('Yakin ingin menghapus semua data?');
        if (!ok) return;

        document.body.className = '';

        document.body.classList.add('theme-light');

        localStorage.removeItem('ledgion_state');

        location.replace(location.pathname);
        };

}
