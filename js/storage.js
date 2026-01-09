const KEY = 'ledgion_state';

export function loadState() {
  try {
    const data = localStorage.getItem(KEY);
    if(data) return JSON.parse(data);
  } catch(e) { console.warn("Gagal load state:", e); }

  return {
    user: { name:'User', level:1, xp:0, title:'Ledger Initiate', streak:0, lastLogin:null },
    stats: { totalXp:0, totalCoin:0, totalTransactionCount:0, dailyTransactionXPCount:0 },
    transactions: [],
    missions: { resetAt:null, daily:{login:{completed:false}}, period:{input:{progress:0,target:5,completed:false}} },
    themes: { active:'light', owned:['light'] }
  };
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } 
  catch(e) { console.warn("Gagal save state:", e); }
  
}
