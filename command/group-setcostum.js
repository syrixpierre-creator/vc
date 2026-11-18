/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m, { usedPrefix, command, text }) => {
	if (!text) throw `Teksnya mana?\n\nContoh:\n${usedPrefix + command} Hi @user\n\n@user = User Tag\n@subject = Nama Group\n@desc = Deskripsi Group`;
	let chat = global.db.data.chats[m.chat];

	switch (command) {
		case 'setwelcome':
			chat.sWelcome = text;
			m.reply('✅ Message welcome success diset:\n\nketik .enable welcome for aktifkan welcome nya yaa🥰' + text);
			break;
		case 'setbye':
			chat.sBye = text;
			m.reply('✅ Message bye success diset:\n' + text);
			break;
		case 'setpromote':
			chat.sPromote = text;
			m.reply('✅ Message promote success diset:\n' + text);
			break;
		case 'setdemote':
			chat.sDemote = text;
			m.reply('✅ Message demote success diset:\n' + text);
			break;
	}
};

handler.help = ['welcome', 'bye', 'promote', 'demote'].map((v) => 'set' + v + ' <teks>');
handler.tags = ['group'];
handler.command = /^(setwelcome|setbye|setpromote|setdemote)$/i;
handler.group = true;
handler.admin = true;
module.exports = handler;
