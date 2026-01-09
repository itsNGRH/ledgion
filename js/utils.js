export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function id() {
  return 'id_' + Date.now() + Math.floor(Math.random() * 1000);
}

export function xpToNextLevel(level) {
  return level * 100;
}

/**
 * Cek apakah user naik level
 * @param {Object} user - objek user {xp, level, title}
 * @returns {Object} info level up {leveledUp, oldLevel, newLevel, newTitle}
 */
export function checkLevelUp(user) {
  const oldLevel = user.level;
  let newLevel = oldLevel;
  let newTitle = null;

  // Hitung level baru berdasarkan XP, tapi jangan ubah XP di loop
  let remainingXP = user.xp;

  while (remainingXP >= xpToNextLevel(newLevel)) {
    remainingXP -= xpToNextLevel(newLevel);
    newLevel++;

    if (newLevel === 3) newTitle = 'Ledger Apprentice';
    if (newLevel === 5) newTitle = 'Ledger Adept';
    if (newLevel === 8) newTitle = 'Ledger Master';
  }

  // Jika tidak naik level, langsung return
  if (newLevel === oldLevel) return { leveledUp: false };

  // Update user sebenarnya setelah hitungan selesai
  user.xp = remainingXP;
  user.level = newLevel;
  if (newTitle) user.title = newTitle;

  return {
    leveledUp: true,
    oldLevel,
    newLevel,
    newTitle
  };
}

export function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID').format(number);
}

export function applyTheme(themeId) {
  const body = document.body;
  body.classList.remove(...body.classList.value.split(' ').filter(c => c.startsWith('theme-')));
  body.classList.add(`theme-${themeId}`);
}

/**
 * Tampilkan Level Up Notification (Toast + Modal)
 * @param {Object} event - hasil dari checkLevelUp()
 * event: { oldLevel, newLevel, newTitle }
 */
export function showLevelUp(event) {
  if (!event || !event.leveledUp) return;

  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');
  
  const modal = document.createElement('div');
  modal.classList.add('modal-content');

  modal.innerHTML = `
    <h2>🎉 Level Up!</h2>
    <p>Level ${event.oldLevel} → <strong>${event.newLevel}</strong></p>
    ${event.newTitle ? `<p>Title baru: <strong>${event.newTitle}</strong></p>` : ''}
    <button id="levelup-close">OK</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close handler
  document.getElementById('levelup-close').onclick = () => {
    document.body.removeChild(overlay);
  };

  // Optional: auto-close toast if no modal desired
  setTimeout(() => {
    if (document.getElementById('levelup-overlay')) {
      document.body.removeChild(overlay);
    }
  }, 5000);
}
