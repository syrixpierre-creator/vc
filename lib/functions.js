module.exports = {
  getBuffer: async () => Buffer.alloc(0),
  fetchJson: async () => ({}),
  runtime: () => '0s',
  clockString: (ms) => String(ms),
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),
  isUrl: (u) => /^https?:\/\//i.test(String(u||'')),
  getGroupAdmins: (participants=[]) => participants.filter(p => p.admin).map(p => p.id),
  parseMention: (t='') => [...String(t).matchAll(/@(\d+)/g)].map(m => m[1]+'@s.whatsapp.net'),
  getRandom: (ext='') => `${Math.floor(Math.random()*10000)}${ext}`
};
