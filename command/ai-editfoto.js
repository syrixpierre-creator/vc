/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
📌 Nama Fitur: Edit foto
🏷️ Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
🔗 Sumber skrep :
https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
Req : dri ngl
✍️ Author : ZenzzXD
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));
const FormData = ((__i)=>__i&&__i.default?__i.default:__i)(require('form-data'));

async function editImage(imageBuffer, prompt) {
  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'image.png',
    contentType: 'image/png'
  })
  form.append('prompt', prompt)
  form.append('model', 'gpt-image-1')
  form.append('n', '1')
  form.append('size', '1024x1024')
  form.append('quality', 'medium')

  const response = await axios.post(
    'https://api.openai.com/v1/images/edits',
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`
      }
    }
  )

  const base64 = response.data?.data?.[0]?.b64_json
  if (!base64) throw new Error('ga ada respon dari api open e ay')
  return Buffer.from(base64, 'base64')
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`example ni : .editfoto ubah jadi anime`)

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime.startsWith('image/')) return m.reply(`example ni : .editfoto ubah jadi anime`)

  try {
    m.reply('waitt bg')
    let img = await q.download()
    let resultBuffer = await editImage(img, text)
    await conn.sendFile(m.chat, resultBuffer, 'edit.png', 'donee', m)
  } catch (err) {
    m.reply(`Eror kak : ${err.message}`)
  }
}

handler.help = ['editfoto <prompt>']
handler.tags = ['ai']
handler.command = ['editfoto']
handler.limit = true
handler.register = true
module.exports = handler