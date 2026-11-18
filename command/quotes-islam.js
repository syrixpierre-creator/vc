/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fs = ((__i)=>__i&&__i.default?__i.default:__i)(require('fs'));
const moment = ((__i)=>__i&&__i.default?__i.default:__i)(require('moment-timezone'));

let handler = async (m, { conn, usedPrefix, __dirname, text, command }) => {
let tag = `@${m.sender.replace(/@.+/, '')}`
  let mentionedJid = [m.sender]
let name = conn.getName(m.sender)
let flaaa2 = [
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=']
let islam = `${pickRandom(global.islam)}`
let nth = `☰  *ISLAM*  ☰`
m.reply(nth + `\n` + islam)
}
handler.help = ['q-islam']
handler.tags = ['quotes']
handler.command = /^(q-islam)$/i
handler.register = true
module.exports = handler

function ucapan() {
  const time = moment.tz('Asia/Jakarta').format('HH')
  let res = "Selamat Malam"
  if (time >= 4) {
    res = "Selamat Pagi"
  }
  if (time >= 10) {
    res = "Selamat Siang"
  }
  if (time >= 15) {
    res = "Selamat Sore"
  }
  if (time >= 18) {
    res = "Selamat Malam"
  }
  return res
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

global.islam = [
'Segala sesuatu telah Allah takdirkan. - QS. Al Qamar : 49',
'And sesungguhnya DIA lah that menjadikan orang tertawa and menangis. - QS. An Najm: 43',
'Janganlah you berduka cita, sesungguhnya Allah selalu bersama we.- QS At-Taubah: 40',
'Maka sesungguhnya bersama kesulitan itu ada kemudahan.QS Al Insyirah: 5',
'Sesungguhnya Allah not will mengubah keadaan suatu kaum hingga mereka merubah keadaan that there is pada diri mereka sendiri. - Q.S. Ar Rad: 11',
'Sesungguhnya Kami telah menciptakan manusia in bentuk that sebaik-baiknya. - QS At- Tin: 4',
'And Kami jadikan you berpasang-pasangan. - QS. An-Naba: 8',
'Maka jangan sekali-kali membiarkan kehidupan dunia this memperdayakan you. - QS. Fatir: 5',
'And bersabarlah you, sesungguhnya janji Allah adalah correct. - QS. Ar-Rum: 60',
'And barang who that bertakwa kepada Allah, niscaya Allah menjadikan baginya kemudahan in urusannya. - Q.S At-Talaq: 4',
'Allah not membebani seseorang melainkan sesuai with kesanggupannya. - QS. Al-Baqarah: 286',
'Tidakkah dia menyadari bahwa sesungguhnya Allah melihat segala perbuatannya?. - QS. Al-Alaq: 14',
'Bersabarlah wahai hati kelak will there is seseorang that datang and siap menemani sisa hidupmu in ketaatan',
'Diri we sendiri that can menentukan apakah cinta we berbuah dosa ataukah berbuah pahala',
'Dirimu that sebenarnya adalah what that you lakukan di saat di there is orang that melihatmu',
'Janji Allah tak pernah mengecewakan, and bila you masih meras kecewa mungkin there is that wrong with imanmu',
'Rasa syukur not will datang kepada orang that not beriman and not pernah kenyang',
'Maafkan aku andai what that aku tulis and aku share tentang ilmu agama not sesuai with coberku and kehidupanku that asli',
'Kebanyakan manusia lebih senang menyalahkan orang lain daripada menyalahkan diri sendiri',
'Biarlah orang melihat penampilah kita biasa, tetapi luar biasa di mata Allah',
'Bersyukurlah bila dalam penantianmu, kau tetap gigih dalam kesendirian, sebab artinya kau telah memuliakan jalan Allah',
'Malu akan sebuah masalah itu boleh tapi jangan berlebihan sebab jika kita Yakin Pertolongan Allah itu sangatlah nyata',
'Yakinlah bahwa there is do’a that terus dipanjatkan kepada Allah that not putus-putus from orang tua we agar we senantiasa menjadi anak that sholeh and sholehah',
'Setiap day aku berusaha semaksimal mungkin searching rizki that halal demi can menghalalkanmu',
'Jatuh cinta can jadi sangat menyakitkan if we not mampu for mengendalikannya',
]