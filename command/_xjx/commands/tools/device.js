const {
  getDevice
} = require("@whiskeysockets/baileys");
const DEVICE_LABELS = {
  'android': "Android",
  'ios': "iOS (iPhone/iPad)",
  'web': "WhatsApp Web",
  'desktop': "WhatsApp Desktop",
  'unknown': "Unknown"
};
module.exports = {
  'name': 'getdevice',
  'aliases': ["device", "checkdevice"],
  'category': "tools",
  'description': "Detect what device a quoted message was sent from",
  'usage': ".device (reply to any message)",
  async 'execute'(v1, v2, v3, v4) {
    const {
      from: v5,
      reply: v6
    } = v4;
    const v7 = v2.message?.['extendedTextMessage']?.["contextInfo"] || v2.message?.['imageMessage']?.["contextInfo"] || v2.message?.["videoMessage"]?.["contextInfo"] || v2.message?.['audioMessage']?.["contextInfo"] || v2.message?.["stickerMessage"]?.["contextInfo"] || v2.message?.['buttonsResponseMessage']?.["contextInfo"] || v2.message?.['listResponseMessage']?.['contextInfo'];
    if (!v7?.['stanzaId']) {
      return v6(" *Device Checker*\n\nReply to any message to detect what device it was sent from.");
    }
    const v8 = v7.stanzaId;
    const v9 = getDevice(v8);
    const v10 = DEVICE_LABELS[v9] || '' + v9;
    return v6("*Device Detected*\n\nThis message was sent from *" + v10 + '*');
  }
};
