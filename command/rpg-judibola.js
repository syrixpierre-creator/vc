/*
By Alecia Md
wa.me/6287842203625
Grup/saluran: https://chat.whatsapp.com/BuORXg43p6T0cjEedoGUWO
*/
const Fruatre = async (m, { conn, usedPrefix, args, command }) => {
  // Inisialisasi objek jbRooms dan jbVotes jika belum ada
  conn.jbRooms = conn.jbRooms || {};
  conn.jbVotes = conn.jbVotes || {};

  // Daftar klub yang tersedia
  const clubs = [
    "Real Madrid", "Manchester United", "Inter Milan", "Barcelona",
    "Liverpool", "Paris Saint-Germain", "Chelsea", "Juventus",
    "Borussia Dortmund", "Atletico Madrid", "RB Leipzig", "Porto",
    "Arsenal", "Shakhtar Donetsk", "Red Bull Salzburg", "AC Milan",
    "Braga", "PSV Eindhoven", "Lazio", "Red Star Belgrade", "FC Copenhagen"
  ];

  // Fungsi untuk mengacak array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Fungsi untuk menghitung vote
  const countVotes = (votes) => {
    const voteCount = { "1": 0, "2": 0 };
    Object.values(votes).forEach(vote => {
      if (voteCount[vote] !== undefined) {
        voteCount[vote]++;
      }
    });
    return voteCount;
  };

  // Handle perintah tanpa argumen atau dengan argumen 'help'
  if (!args[0] || args[0] === "help") {
    const message = `❌ *Invalid option!*

Available options:
- create
- join
- player
- mulai
- vote 1/2
- delete`;
    await conn.sendMessage(m.chat, {
      text: message
    });
    return;
  }

  // Logika berdasarkan argumen pertama
  switch (args[0].toLowerCase()) {
    case 'create':
      // Logika untuk membuat room
      if (conn.jbRooms[m.chat]) {
        return m.reply('Room sudah ada.');
      }
      conn.jbRooms[m.chat] = {
        players: [],
        gameStarted: false,
        clubs: [],
        bank: 0 // Inisialisasi bank untuk taruhan
      };
      m.reply('✅ *Room created.* Players can join now.');
      break;

    case 'join':
      // Logika agar pemain bergabung ke room
      if (!conn.jbRooms[m.chat]) {
        return m.reply('❌ *No room yet.* Create one with .jb create');
      }
      if (conn.jbRooms[m.chat].gameStarted) {
        return m.reply('❌ *The game has already started.*');
      }
      if (conn.jbRooms[m.chat].players.find(p => p.id === m.sender)) {
        return m.reply('❌ *You already joined.*');
      }
      const playerName = m.pushName || conn.getName(m.sender);
      conn.jbRooms[m.chat].players.push({ id: m.sender, name: playerName });
      conn.jbRooms[m.chat].bank += 1000000; // Tambahkan taruhan ke bank
      m.reply(`✅ *You joined the room.* Bet: 1000000. Total: ${conn.jbRooms[m.chat].bank}`);
      break;

    case 'player':
      // Logika untuk daftar pemain yang bergabung
      if (!conn.jbRooms[m.chat]) {
        return m.reply('❌ *No room yet.* Create one with .jb create');
      }
      const players = conn.jbRooms[m.chat].players;
      m.reply(`Pemain yang bergabung: \n${players.map(p => `${p.name} (${p.id})`).join('\n')}`);
      break;

    case 'mulai':
      // Logika untuk memulai game
      if (!conn.jbRooms[m.chat]) {
        return m.reply('❌ *No room yet.* Create one with .jb create');
      }
      if (conn.jbRooms[m.chat].players.length < 2) {
        return m.reply('Minimal 2 pemain untuk memulai game.');
      }
      shuffleArray(clubs);
      conn.jbRooms[m.chat].clubs = [clubs[0], clubs[1]];
      conn.jbRooms[m.chat].gameStarted = true;
      m.reply(`⚽ *Game started!* 1 ${clubs[0]} vs 2 ${clubs[1]}. Vote your club.`);
      break;

    case 'vote':
      // Logika untuk vote
      if (!conn.jbRooms[m.chat]) {
        return m.reply('❌ *No room yet.* Create one with .jb create');
      }
      if (!conn.jbRooms[m.chat].gameStarted) {
        return m.reply('❌ *The game has not started.* Start with .jb mulai');
      }
      if (!args[1] || !['1', '2'].includes(args[1])) {
        return m.reply('❌ *Invalid choice.* Use .jb vote 1 or 2');
      }
      const vote = args[1];
      const currentRoom = conn.jbRooms[m.chat];
      const player = currentRoom.players.find(p => p.id === m.sender);
      if (!player) {
        return m.reply('❌ *You have not joined the room.*');
      }
      conn.jbVotes[m.sender] = vote;
      m.reply(`Anda memilih klub nomor ${vote}.`);

      // Cek apakah semua pemain sudah melakukan vote
      const voteCount = countVotes(conn.jbVotes);
      if (Object.keys(conn.jbVotes).length === currentRoom.players.length) {
        m.reply('Semua pemain telah vote. Pertandingan akan segera dimulai...');

        // Jeda 25 detik
        setTimeout(() => {
          m.reply('⏳ The match has started. Please wait...');

          // Jeda untuk simulasi pertandingan
          setTimeout(() => {
            // Tentukan pemenang berdasarkan vote terbanyak
            const winnerVote = voteCount["1"] > voteCount["2"] ? "1" : "2";
            const winningClub = currentRoom.clubs[winnerVote - 1];
            const winners = currentRoom.players.filter(player => conn.jbVotes[player.id] === winnerVote);

            m.reply(`⚽ *Match finished.*\nWinner: ${winningClub}\n\nPlayers who chose ${winningClub}:\n${winners.map(w => w.name).join('\n')}`);

            // Bersihkan room dan votes setelah pertandingan selesai
            delete conn.jbRooms[m.chat];
            delete conn.jbVotes[m.chat];
          }, 25000); // Jeda 25 detik untuk simulasi pertandingan
        }, 25000); // Jeda 25 detik sebelum pertandingan dimulai
      }
      break;

    case 'delete':
      // Logika untuk menghapus room
      if (!conn.jbRooms[m.chat]) {
        return m.reply('❌ *No room yet.*');
      }
      delete conn.jbRooms[m.chat];
      delete conn.jbVotes[m.chat];
      m.reply('Room telah dihapus.');
      break;

    default:
      m.reply('❌ *Unknown command.*');
  }
};

Fruatre.help = ['judibola']
Fruatre.tags = ['rpg']
Fruatre.command = /^(judibola|jb)$/i
Fruatre.group = true
module.exports = Fruatre;