/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
/*
✨ YuriPuki
💫 Nama Fitur: Codegen
🤖 Type : Plugin Esm
🔗 Sumber : https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J
*/
const axios = ((__i)=>__i&&__i.default?__i.default:__i)(require('axios'));

const supportedLanguages = [
  'JavaScript', 'C#', 'C++', 'Java', 'Ruby', 'Go', 'Python', 'Custom'
]

const supportedModels = [
  'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo',
  'claude-3-opus', 'claude-3-5-sonnet'
]

async function generateCode(prompt, language = 'JavaScript', model = 'gpt-4o-mini') {
  if (!supportedLanguages.includes(language)) {
    return {
      status: false,
      error: `Bahasa ga ada. Gunakan salah satu: ${supportedLanguages.join(', ')}`
    }
  }

  if (!supportedModels.includes(model)) {
    return {
      status: false,
      error: `Model AI ga ada. Pilih salah satu: ${supportedModels.join(', ')}`
    }
  }

  const finalPrompt = language === 'Custom'
    ? prompt
    : `Tulis kode in bahasa ${language} for: ${prompt}`

  try {
    const response = await axios.post(
      'https://best-ai-code-generator.toolzflow.app/api/chat/public',
      {
        chatSettings: {
          model: model,
          temperature: 0.3,
          contextLength: 16385,
          includeProfileContext: false,
          includeWorkspaceInstructions: false,
          includeExampleMessages: false
        },
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that writes code in requested language.'
          },
          {
            role: 'user',
            content: finalPrompt
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'code_response',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Generated code' }
              },
              required: ['code']
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://best-ai-code-generator.toolzflow.app',
          'Referer': 'https://best-ai-code-generator.toolzflow.app/',
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*'
        }
      }
    )

    const rawCode = response.data?.code || ''
    const formattedCode = rawCode
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')

    return {
      status: true,
      code: formattedCode.trim() || 'ga there is kode that dihasilkan.'
    }
  } catch (e) {
    return {
      status: false,
      error: `Request failed: ${e.message}`
    }
  }
}

const handler = async (m, { text, args }) => {
  const [lang = 'JavaScript', model = 'gpt-4o-mini', ...promptArr] = args
  const prompt = promptArr.join(' ')

  if (!prompt) {
    return m.reply(`✏️ Example:\n.codegen Python gpt-4o-mini buat fungsi validasi otp`)
  }

  const result = await generateCode(prompt, lang, model)
  if (!result.status) return m.reply(`❌ ${result.error}`)

  m.reply(`📦 Result generate kode:\n\n\`\`\`${lang}\n${result.code}\n\`\`\``)
}

handler.help = ['codegen <lang> <model> <prompt>']
handler.tags = ['tools', 'ai']
handler.command = ['codegen']
handler.limit = true
handler.register = true
module.exports = handler