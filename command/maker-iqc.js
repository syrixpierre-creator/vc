/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/**
  FakeIphoneChat - maker

 𖣔 Type   : Plugin ESM
 𖣔 Source : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
 𖣔 Create by : Lznycx
 𖣔 Edit   : ChatGPT
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

let handler = async (m, { text, command, conn, usedPrefix }) => {
    if (!text)
        return m.reply(
            `*🧩 Enter text!*\n*Example: ${usedPrefix + command} info kangg*`
        )

    await conn.sendMessage(m.chat, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    const primary =
        `https://brat.siputzx.my.id/iphone-quoted` +
        `?time=12.00` +
        `&batteryPercentage=90` +
        `&carrierName=AXIS` +
        `&messageText=${encodeURIComponent(text)}` +
        `&emojiStyle=apple`

    const fallback =
        `https://api.nexray.eu.cc/maker/iqc?text=${encodeURIComponent(text)}`

    try {
        // Cek API utama
        await axios.get(primary, {
            responseType: 'arraybuffer',
            timeout: 15000
        })

        await conn.sendMessage(
            m.chat,
            {
                image: { url: primary },
                caption: '*✨ iPhone chat success dibuat*'
            },
            { quoted: m }
        )
    } catch (e) {
        console.log('[IQC] Primary failed, memakai fallback...')

        try {
            await axios.get(fallback, {
                responseType: 'arraybuffer',
                timeout: 15000
            })

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: fallback },
                    caption: '*✨ iPhone chat success dibuat (Fallback API)*'
                },
                { quoted: m }
            )
        } catch (err) {
            console.error(err)
            m.reply('*🍂 All server currently bermasalah. Try again nanti.*')
        }
    } finally {
        await conn.sendMessage(m.chat, {
            react: {
                text: '',
                key: m.key
            }
        })
    }
}

handler.help = ['iqc']
handler.tags = ['maker']
handler.command = /^(iqc|fakeiphonechat)$/i
handler.limit = true
handler.register = false
module.exports = handler