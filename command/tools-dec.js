/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const FormData = ((__i)=>__i&&__i.default?__i.default:__i)(require('form-data'));
const cheerio = require('cheerio');

async function encode(text) {
   let d = new FormData();
   d.append("input", text);
   d.append("charset", "UTF-8");
   d.append("separator", "lf");
   d.append("newlines", "on");
   let headers = {
      ...d.getHeaders()
   }
   let { data } = await axios.post("https://www.base64encode.org/", d, { headers });
   let $ = cheerio.load(data)
   return {
     result: $("#output").text().trim()
   }
}

async function decode(text) {
   let d = new FormData();
   d.append("input", text);
   d.append("charset", "UTF-8");
   let headers = {
      ...d.getHeaders()
   }
   let { data } = await axios.post("https://www.base64decode.org/", d, { headers });
   let $ = cheerio.load(data)
   return {
     result: $("#output").text().trim()
   }
}

async function handler(m, { text, args, command }) {
    if (command === 'encode') {
        if (!args[0]) return m.reply('Which text that mau diubah ke base64?')
        try {
            m.reply('Tunggu bentar...')
            const result = await encode(args.join(' '))
            m.reply(`*Base64 Encode*\n\n▢ *Original:* ${args.join(' ')}\n\n▢ *Result:* ${result.result}`)
        } catch (error) {
            console.error(error)
            m.reply('Waduh error nih, coba lagi ya!')
        }
    } else if (command === 'decode') {
        if (!args[0]) return m.reply('Which text base64 that mau didecode?')
        try {
            m.reply('Tunggu bentar...')
            const result = await decode(args.join(' '))
            m.reply(`*Base64 Decode*\n\n▢ *Base64:* ${args.join(' ')}\n\n▢ *Result:* ${result.result}`)
        } catch (error) {
            console.error(error)
            m.reply('Kayaknya text that you kasih bukan base64 deh, or there is error. Coba cek again ya!')
        }
    }
}

handler.help = ['encode', 'decode']
handler.tags = ['tools']
handler.command = ['encode', 'decode']
handler.limit = false
module.exports = handler;