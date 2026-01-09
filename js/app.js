import { loadState, saveState } from './storage.js';
import { today, checkLevelUp, showLevelUp, applyTheme } from './utils.js';
import { renderHome, renderMission, renderTransactionScreen, renderProfile } from './screens.js';

export const store = { state: {} };
const state = loadState();

/* =========================
   NORMALIZE STATE (WAJIB)
========================= */
state.missions ??= {};
state.missions.daily ??= {};
state.missions.daily.login ??= { completed: false };
state.missions.period ??= {};
state.missions.period.input ??= { progress: 0, target: 5, completed: false };

state.stats ??= {};
state.stats.totalTransactionCount ??= 0;
state.stats.totalXp ??= 0;
state.stats.totalCoin ??= 0;
state.stats.dailyTransactionXPCount ??= 0;
state.stats.lastXPDate ??= null;

state.transactions ??= [];

store.state = state;

state.user ??= {};
state.user.name ??= 'User';
state.user.streak ??= 0;
state.user.lastLogin ??= null;
state.user.xp ??= 0;
state.user.level ??= 1;
state.user.title ??= 'Ledger Initiate';

state.user.isFirstLaunch ??= (state.user.name === 'User' && state.user.streak === 0);

state.themes ??= {};
state.themes.active ??= 'light';
state.themes.owned ??= ['light'];

/* =========================
   RESET MISSION 3 HARI
========================= */
const now = Date.now();
if (!state.missions.resetAt || now > state.missions.resetAt) {
  state.missions.resetAt = now + 3 * 24 * 60 * 60 * 1000;
  state.missions.daily.login.completed = false;
  state.missions.period.input = { progress: 0, target: 5, completed: false };
}

/* =========================
   LOGIN HARIAN + STREAK
========================= */
const todayDate = today();

if (state.user.lastLogin !== todayDate) {
  state.user.lastLogin = todayDate;
  state.user.streak += 1;

  // reset XP harian
  state.stats.dailyTransactionXPCount = 0;
  state.stats.lastXPDate = todayDate;

  if (!state.missions.daily.login.completed) {
    state.user.xp += 10;
    state.stats.totalXp += 10;
    state.missions.daily.login.completed = true;
  }

  const levelUpEvent = checkLevelUp(state.user);
  if (levelUpEvent.leveledUp) {showLevelUp(levelUpEvent);}

}

saveState(state);


/* =========================
   NAVIGATION
========================= */
function navigate(screen) {
  // BLOCK SEMUA SCREEN JIKA FIRST LAUNCH
  if (state.user.isFirstLaunch) {
    document.getElementById('app').innerHTML = `
      <div class="card">
        <h3>👋 Selamat Datang di Ledgion!</h3>
        <p>Masukkan nama kamu untuk mulai misi mencatat keuangan.</p>

        <input id="name-input" placeholder="Nama kamu" />
        <button class="btn-primary" id="save-name">Mulai</button>
      </div>
    `;

    document.getElementById('save-name').onclick = () => {
      const val = document.getElementById('name-input').value.trim();
      if (!val) return;

      state.user.name = val;
      state.user.isFirstLaunch = false;
      saveState(state);
      navigate('home');
    };

    return;
  }

  const levelUpEvent = checkLevelUp(state.user);
  if (levelUpEvent.leveledUp) {showLevelUp(levelUpEvent);}

  // NORMAL NAVIGATION
  if (screen === 'home') renderHome(state);
  if (screen === 'transaction') renderTransactionScreen(state);
  if (screen === 'mission') renderMission(state);
  if (screen === 'profile') renderProfile(state);

  saveState(state);
}

document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.nav));
});

// FIRST RENDER
navigate('home');

const validThemes = ['light', 'dark', 'red', 'green', 'blue', 'yellow', 'magenta', 'cyan'];

if (!validThemes.includes(state.themes.active)) {
  state.themes.active = 'light';
}

applyTheme(state.themes.active);
saveState(state);
