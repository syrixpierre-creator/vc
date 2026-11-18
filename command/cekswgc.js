/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
let handler = async (m) => {
  console.log(
    JSON.stringify(m.message, null, 2)
  )

  m.reply('Message success dilog ke console.')
}

handler.command = /^cekswgc$/i
module.exports = handler