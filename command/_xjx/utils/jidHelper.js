const map = new Map();
const jidUser = j => String(j || '').split('@')[0].split(':')[0];
module.exports = {
  jidUser,
  resolvePhone: j => String(j || '').split('@')[0].split(':')[0].replace(/\D/g, ''),
  rememberLidMapping: (lid, pn) => {
    if (lid && pn) {
      map.set(String(lid || '').split('@')[0].split(':')[0], String(pn || '').split('@')[0].split(':')[0]);
    }
  },
  getLidMappingValue: lid => map.get(String(lid || '').split('@')[0].split(':')[0]) || null,
  rememberParticipantLidMapping: () => {}
};
