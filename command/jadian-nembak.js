/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const createUser = (jid) => {
  const users = global.db.data.users

  if (!users[jid]) users[jid] = {}

  if (!users[jid].relationship) {
    users[jid].relationship = {
      pasangan: '',
      pending: '',
      dari: '',
      sejak: 0
    }
  }

  return users[jid]
}

const tag = jid => '@' + jid.split('@')[0]
const same = (a, b) => a.split('@')[0] === b.split('@')[0]
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const kataTembak = [
"There is saat di which aku nggak suka sendiri. Tapi aku juga nggak mau all orang menemani, hanya you that kumau.",
"Aku baru sadar ternyata selama this you kaya! Kaya that aku cari selama this. You mau nggak jadi pacarku?",
"Aku berterima kasih pada mataku, sebab mata inilah that menuntunku for menemukanmu.",
"Aku boleh send CV ke you nggak? Soalnya aku mau ngelamar jadi pacar.",
"Aku bukan that terhebat, namun aku yakin kalau aku mampu membahagiakanmu with bermodalkan cinta and kasih sayang, you mau kan denganku?",
"Aku hanya cowok biasa that memiliki banyak kekurangan and mungkin tak pantas mengharapkan cintamu, namun if you bersedia menerimaku menjadi kekasih, aku berjanji will melakukan what pun that terbaik untukmu. Maukah you menerima cintaku?",
"Aku ingin bilang sesuatu. Udah lama aku suka sama aku, tapi aku nggak berani ngomong. Jadi, kuputuskan for WA saja. Aku pengin you jadi pacarku.",
"Aku ingin mengungkapkan sebuah hal that tak sanggup again aku pendam lebih lama. Aku mencintaimu, maukah you menjadi pacarku?",
"Aku ingin menjadi orang that can membuatmu tertawa and tersenyum setiap day. Maukah kau jadi pacarku?",
"Aku mau chat serius sama you. Selama this aku memendam rasa ke you and selalu memperhatikanmu. Kalau nggak keberatan, you mau jadi pacarku?",
"Aku melihatmu dan melihat sisa hidupku di depan mataku.",
"Aku memang not mempunyai segalanya, tapi setidaknya aku punya kasih sayang that cukup buat you.",
"Aku menyukaimu from first. You begitu sederhana, tetapi kesederhanaan that sangat istimewa di selaput mataku. Will sempurna if you that menjadi spesial di hati.",
"Aku naksir banget sama you. Maukah you jadi milikku?",
"Aku nggak there is ngabarin you bukan because aku gak punya kuota or pulsa, tapi again menikmati rasa rindu this buat you. Mungkin you will kaget mendengarnya. Selama this aku menyukaimu.",
"Aku nggak pengin you jadi matahari di hidupku, because walaupun hangat, you sangat jauh. Aku juga nggak mau you jadi udara, because walaupun aku butuh and you sangat dekat, tapi all orang juga can menghirupmu. Aku hanya ingin you jadi darah that can sangat dekat denganku.",
"Aku nggak tahu sampai kapan usiaku berakhir. That aku tahu, cintaku this selamanya hanya untukmu.",
"Aku sangat menikmati time that dihabiskan bersama day this. We juga already lama saling mengenal. Di day that cerah this, aku ingin mengungkapkan bahwa aku mencintaimu.",
"Aku selalu membayangkan betapa indahnya if suatu saat nanti we dapat membina bahtera rumah tangga and hidup bersama sampai akhir hayat. Namun, all that tak mungkin terjadi if we berdua sampai saat this bahkan not yet jadian. Maukah you menjadi kekasihku?",
"Aku siapkan mental for day this. You harus menjadi pacarku for mengobati rasa cinta that already tak terkendali this.",
"Aku tahu we gak seumur, tapi bolehkan aku seumur hidup sama you?",
"Aku tahu we already lama sahabatan. Tapi nggak wrong kan kalau aku suka sama you? What pun jawaban you aku terima. That terpenting that jujur from hati aku that terdalam.",
"Aku tak bisa memulai ini semua terlebih dahulu, namun aku akan berikan sebuah kode bahwa aku menyukai dirimu. Jika kau mengerti akan kode ini maka kita akan bersama.",
"Aku that terlalu bodoh or you that terlalu egois for membuat aku jatuh cinta kepadamu.",
"What pun tentangmu, tak pernah ku temukan bosan di dalamnya. Because berada di sampingmu, anugerah terindah bagiku. Jadilah kekasihku, hey you.",
"Atas izin Allah and restu mama papa, you mau nggak jadi pacarku?",
"Bagaimana kalau kita jadi komplotan pencuri? Aku mencuri hatimu dan kau mencuri hatiku.",
"Bahagia that kalau aku and you telah menjadi we.",
"Besok kalau udah nggak gabut, boleh nggak aku daftar jadi pacar you. Biar aku there is kerjaan buat selalu mikirin you.",
"Biarkan aku membuatmu bahagia selamanya. You hanya perlu melakukan satu hal: Jatuh cinta denganku.",
"Biarkan all kebahagiaanku menjadi milikmu, all kesedihanmu menjadi milikku. Biarkan seluruh dunia menjadi milikmu, hanya you that menjadi milikku!",
"Biarlah that lalu menjadi masa laluku, namun for masa kini maukah you menjadi masa depanku?",
"Bisakah you memberiku arahan ke hatimu? Sepertinya aku telah kehilangan diriku di matamu.",
"Bukanlah tahta ataupun harta that aku cari, will tetapi balasan cintaku that aku tunggu darimu. Dijawab ya.",
"Caramu can membuatku tertawa bahkan di day-day tergelap membuatku merasa lebih ringan from what pun. Aku mau you jadi milikku.",
"Cinta aku ke you that jangan diragukan again because cinta this tulus from lubuk hati that paling in.",
"Cintaku ke you tuh kayak angka 5 sampai 10. Nggak there is duanya. Aku mau you jadi satu-satunya wanita di hatiku.",
"Cowok which that berani-beraninya nyakitin you. Sini aku obati, asal you mau jadi pacar aku.",
"Hai, you again ngapain? Coba deh keluar rumah and lihat bulan malam this. Cahayanya indah and memesona, tapi will lebih indah again kalau aku there is di sampingmu. Gimana kalau we jadian, supaya setelah malam this can menatap rembulan sama-sama?",
"Hidupku indah because you bersamaku, you membuatku bahagia bahkan if aku merasa sedih and rendah. Senyummu menerangi hidupku and all kegelapan menghilang. Maukah you menjadi milikku?",
"This bukan rayuan, tapi this that aku rasakan. Aku ingin bertukar tulang denganmu. Aku jadi tulang punggungmu, you jadi tulang rusukku. Jadian yuk!",
"Ini cintaku, ambillah. Ini jiwaku, gunakan itu. Ini hatiku, jangan hancurkan. Ini tanganku, pegang dan bersama-sama kita akan membuatnya abadi.",
"Izinkan aku mengatakan sesuatu that menurutku sangat penting. Hey, kau punya tempat di hatiku that cannot dimiliki oleh orang lain. Tetaplah di sana and jadilah kekasihku. Mau?",
"If aku can memberimu hadiah, aku will memberimu cinta and tawa, hati that damai, mimpi and kegembiraan khusus selamanya. Biarkan aku melakukannya sekarang.",
"Kalau aku matahari, you mau nggak jadi langitku? Biar setiap saat setiap time can selalu bersama tanpa terpisah time.",
"Kalau you membuka message this, berarti you suka sama aku. Kalau you membalas message this, artinya you sayang sama aku. Kalau you mengabaikan message this, berarti you cinta sama aku. Kalau you menghapus message this, artinya you mau menerimaku jadi pacarmu.",
"Kalau kau bertanya-tanya apakah aku mencintaimu or not, jawabannya adalah iya.",
"You adalah satu-satunya that lebih mengerti aku daripada diriku sendiri. You adalah satu-satunya that dapat ku bagi segalanya, bahkan rahasia pribadiku. Aku ingin you selalu bersamaku. Aku mencintaimu.",
"You harus membiarkan aku mencintaimu, biarkan aku menjadi orang that memberimu all that you inginkan and butuhkan.",
"You that beda from cewek lain, you antik jarang found di tempat lain. Maukah you jadi pacar aku?",
"You kenal Iwan nggak? Iwan to be your boy friend.",
"You mau nggak jadi matahari di kehidupanku? Kalau mau, menjauhlah 149.6 juta KM from aku sekarang!",
"You nggak capek HTS-an sama aku? Aku capek tiap day jemput you, nemenin you pas again bad mood, menghibur you pas again sedih. We pacaran aja, yuk?",
"You nggak sadar ya, nggak perlu capek nyari kesana kemari, orang that tulus mencintai you there is di depan mata. Iya, aku.",
"You pantas mendapatkan that terbaik, seseorang that will mendukungmu tanpa batas, membiarkanmu tumbuh tanpa batas, and mencintaimu tanpa akhir. Apakah you will membiarkan aku menjadi orangnya?",
"You tahu enggak kenapa aku ngambil jurusan elektro? Because aku mau bikin pembangkit listrik tenaga cinta we, supaya rumah tangga we nanti paling terang.",
"You tahu kenapa day this aku menyatakan all this padamu? Because aku lebih memilih for malu because menyatakan cinta ditolak ketimbang menyesal because orang lain that lebih first menyatakannya.",
"You telah hidup in mimpiku for time that lama, bagaimana if menjadikannya nyata for sekali saja?",
"Kenapa aku baru sadar, ternyata selama this hatiku nyaman bersanding denganmu. Aku mau you jadi milikku.",
"kepada cewek incaran bukanlah perkara that mudah. There is banyak hal that perlu dipertimbangkan agar cintamu can diterima si doi. Selain memilih time that tepat, kata-kata for nembak cewek pun harus dipersiapkan.",
"Ketika aku bertemu denganmu, aku tak peduli with semuanya. Namun, ketika you pergi jauh dariku aku selalu mengharapkanmu. And apakah this cinta?",
"Ketika engkau memandangku, engkau akan melihat fisikku. Tetapi ketika engkau melihat hatiku, engkau akan menemukan dirimu sendiri ada di sana.",
"Ketika Hawa tercipta buat sang Adam, begitu indah kehidupan mereka izinkan aku menjadi sang Adam/Hawa buatmu karena aku sangat mencintaimu.",
"Ketika mata this memandang raut wajahmu that indah, hanya tiga kata that terucap from lubuk hatiku that paling in 'aku cinta you'.",
"We udah saling tahu masa lalu masing-masing. Tapi that not penting because sekarang aku hanya ingin membicarakan tentang masa depan. Mulai day this and seterusnya, maukah you menjadi pacarku?",
"Ku beranikan day this for mengungkapkan that selama this menjadi resah. Resah if you tak menjadi milikku selamanya.",
"Lebih spesial from nasi goreng, lebih indah from purnama. Ya, if you that temani akhir hidupku.",
"Sorry sebelumnya because cuma can bilang lewat WA. Sebenarnya, selama this aku memendam cinta and aku ingin you jadi pacarku. Mau?",
"Makanan busuk memanglah bau, kalau dimakan rasanya pahit sepahit jamu. Sebenarnya aku ingin you tahu, aku mau you terima cintaku.",
"Makan tahu bumbu petis. Merenung sambil makan buah duku. Aku bukan lelaki that romantis. Namun, maukah kau jadi pacarku?",
"Makasih, ya, selama this already mau temani aku. Entah that in suka ataupun duka. Tapi sekarang aku mau you berubah. Aku mau you bukan again jadi temanku, tapi aku mau you jadi pacarku.",
"Malam this sangat indah with cahaya rembulan that memesona namun will lebih indah kalau you resmi menjadi milikku.",
"Mataku mencarimu ketika you no. Hatiku sakit ketika aku not menemukanmu. You adalah alasan for all kebahagiaanku and tanpamu hidupku will sangat membosankan. Maukah you terus bersamaku?",
"Mau jadi pacarku nggak, lagi gabut nih. Coba dulu 1 bulan kalau nyaman lanjut deh.",
"Menjadi teman memang menyenangkan. Will lebih membahagiakan if you menjadi milikku.",
"Meski jarang buat you tertawa, setidaknya saya not selalu buat you sedih. Tapi kalau akhirnya humor saya not membuatmu tertawa again, semoga sedih saya can you tertawakan, ya. - Zarry Hendrik",
"Meskipun aku memiliki banyak hal for dikatakan, tetapi kata-kataku bersembunyi dariku and aku cannot mengungkapkannya. Hal sederhana that ingin aku katakan adalah aku mencintaimu day this and selalu.",
"Mungkin aku bukan Obama, tapi aku senang kalau can manggil you, o sayang. You mau nggak mulai saat this aku panggil seperti that?",
"Mungkin aku tak sanggup menyeberangi lautan, menghantam karang or menerjang badai. Tapi satu that aku sanggup, membuatmu bahagia. Izinkan aku membuktikannya, ya!",
"Neng, bakar-bakaran yuk! | Bakar what? | We bakar masa lalu and buka lembaran baru with cinta we.",
"Nggak perlu basa basi. We udah kenal lama, aku suka you what adanya. Jadian yuk!",
"Pepatah mengatakan, empat sehat lima sempurna. Namun, aku not merasakan kesempurnaan that sebelum aku merasakan kasih sayangmu.",
"Saatnya aku mengungkapkan perasaan that terdalam kepadamu. Aku ingin you tahu bahwa aku mencintaimu seperti aku not pernah mencintai who pun sebelumnya.",
"Saking jatuh cintanya aku sama you. Mendengar you kentut aja aku already bahagia.",
"Satu tambah satu sama with dua. Aku tanpamu nggak can what-what. Satu dua tiga sepuluh. Aku maunya you jadi pacarkuh.",
"Secantik-canriknya you, that nggak there is gunanya kalau nggak jadi punyaku.",
"Sejak kenal you, bawaannya pengin belajar terus. Belajar jadi that terbaik. For selanjutnya, you mau nggak ngebimbing aku, selalu there is di sampingku?",
"Senjata bertuah amatlah sakti. Kalah oleh iman nan hakiki. Maukah kau jadi orang that aku kasihi? Aku janji cintaku sampai mati.",
"Seseorang bermimpi tentangmu setiap malam. Seseorang cannot bernapas tanpamu, kesepian. Seseorang berharap suatu day kau will melihatnya. Seseorang that adalah aku.",
"Setelah day berlalu, aku yakin you pilihanku.",
"Setelah sekian lama bersama, aku ingin we not hanya sekadar teman saja. Aku yakin you paham maksudku, and aku berharap semoga you setuju. Aku mencintaimu.",
"Suatu ketika, there is seorang laki-laki that mencintai perempuan that tawanya bagaikan sebuah pertanyaan that seumur hidup ingin dijawabnya. Akulah laki-laki that, seorang laki-laki that currently menginginkan perempuan for jawaban di hidupnya. Perempuan that adalah you.",
"Suka maupun duka, senang maupun susah, you telah menghiasi hariku saat aku bersamamu and aku mau we selamanya dekat denganmu because aku mau you jadi pacar aku?",
"Tak there is alasan that pasti and jelas kenapa aku cinta you, tapi that pasti aku menginginkan aku bahagia denganmu and tak ingin sampai you terluka.",
"Tak can dibayangkan if di dunia this tak there is that namanya cinta. Ya, rasa cinta bagi sebagian orang memberi keindahan that membuat day-day semakin berwarna. Apalagi if perasaan cinta that we punya dibalas oleh orang that we suka.",
"Tak hanya menyenangkan, aku yakin you dapat diandalkan di masa depan.",
"Tak ragu again for ungkapkan kepada seseorang that there is di hati. That adalah you.",
"Telah banyak waktuku terlewati bersamamu, suka maupun duka senang maupun susah you telah menghiasi hariku saat aku bersamamu and aku mau we selamanya dekat denganmu. Because aku mau you jadi pacar aku?",
"Not peduli seberapa sederhanya and ketidakjelasan you. Tapi bagi aku, you adalah kesempurnaan that memiliki kejelasan. Aku mau you jadi pacarku.",
"For what memajang photo berdua? That aku mau fotomu there is in buku nikahku kelak. Maukah you jadi pacarku?"
]

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let target = null

  // Mention
  if (m.mentionedJid && m.mentionedJid.length) {
    target = m.mentionedJid[0]
  }

  // Reply
  else if (m.quoted) {
    target = m.quoted.sender
  }

  // Nomor
  else if (text) {
    let nomor = text.replace(/[^0-9]/g, '')
    if (!nomor) return m.reply('Nomor invalid.')
    target = nomor + '@s.whatsapp.net'
  }

  if (!target) {
    return m.reply(
      `Example usage:\n\n` +
      `${usedPrefix + command} @tag\n` +
      `${usedPrefix + command} 628xxxxxxxxxx`
    )
  }

  if (same(target, m.sender))
    return m.reply('❌ You cannot menembak diri sendiri.')

  if (same(target, conn.user.jid))
    return m.reply('❌ Bot cannot dijadikan pasangan.')

  let sender = createUser(m.sender)
  let receiver = createUser(target)

  if (sender.relationship.pasangan)
    return m.reply('💔 You already mempunyai pasangan.')

  if (receiver.relationship.pasangan)
    return conn.reply(
      m.chat,
      `💔 ${tag(target)} already mempunyai pasangan.`,
      m,
      {
        mentions: [target]
      }
    )

  // Auto jadian jika saling menembak
  if (receiver.relationship.pending === m.sender) {
    const now = Date.now()

    sender.relationship = {
      pasangan: target,
      pending: '',
      dari: '',
      sejak: now
    }

    receiver.relationship = {
      pasangan: m.sender,
      pending: '',
      dari: '',
      sejak: now
    }

    return conn.reply(
      m.chat,
      `🎉 *RESMI JADIAN!*\n\n` +
      `${tag(m.sender)} ❤️ ${tag(target)}\n\n` +
      `Semoga langgeng yaa~ 🥰`,
      m,
      {
        mentions: [m.sender, target]
      }
    )
  }

    // Simpan permintaan tembak
  sender.relationship.pending = target
  receiver.relationship.dari = m.sender

  return conn.reply(
    m.chat,
    `💌 *There is That Currently MENYATAKAN PERASAAN...*\n\n` +
    `${pick(kataTembak)}\n\n` +
    `${tag(m.sender)} ❤️ ${tag(target)}\n\n` +
    `Hanya ${tag(target)} that dapat menjawab.\n\n` +
    `Ketik:\n` +
    `• *${usedPrefix}terima* for menerima\n` +
    `• *${usedPrefix}tolak* for menolak`,
    m,
    {
      mentions: [m.sender, target]
    }
  )
}

handler.help = ['tembak @tag']
handler.tags = ['fun']
handler.command = /^(tembak|jadian)$/i
handler.group = true
module.exports = handler