"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageConfig_js_1 = (function(){try{return require("../lib/messageConfig");}catch(e){return {};}}());
const config_js_1 = __importDefault(require("../settings"));
// Common misspellings dictionary
const commonMistakes = {
    // Common English misspellings
    'recieve': 'receive',
    'occured': 'occurred',
    'seperate': 'separate',
    'definately': 'definitely',
    'existance': 'existence',
    'independant': 'independent',
    'persue': 'pursue',
    'calender': 'calendar',
    'beleive': 'believe',
    'freind': 'friend',
    'accomodate': 'accommodate',
    'aquire': 'acquire',
    'arguement': 'argument',
    'concious': 'conscious',
    'enviroment': 'environment',
    'goverment': 'government',
    'maintainance': 'maintenance',
    'neccessary': 'necessary',
    'occurence': 'occurrence',
    'priviledge': 'privilege',
    'publically': 'publicly',
    'reccommend': 'recommend',
    'restarant': 'restaurant',
    'suprise': 'surprise',
    'tommorrow': 'tomorrow',
    'untill': 'until',
    'wierd': 'weird',
    'writting': 'writing',
    'accross': 'across',
    'adress': 'address',
    'agressive': 'aggressive',
    'alot': 'a lot',
    'amature': 'amateur',
    'anually': 'annually',
    'apartment': 'apartment',
    'apparant': 'apparent',
    'apparrel': 'apparel',
    'appearence': 'appearance',
    'arguement': 'argument',
    'assasinate': 'assassinate',
    'barbituate': 'barbiturate',
    'basicaly': 'basically',
    'biginning': 'beginning',
    'belive': 'believe',
    'benifit': 'benefit',
    'bussiness': 'business',
    'camoflage': 'camouflage',
    'catagory': 'category',
    'cemetary': 'cemetery',
    'changeable': 'changeable',
    'collage': 'college',
    'comitment': 'commitment',
    'commitee': 'committee',
    'completly': 'completely',
    'concious': 'conscious',
    'consciencious': 'conscientious',
    'conveniant': 'convenient',
    'criticise': 'criticize',
    'decieve': 'deceive',
    'definate': 'definite',
    'desparate': 'desperate',
    'develope': 'develop',
    'diference': 'difference',
    'dilema': 'dilemma',
    'disapear': 'disappear',
    'disapoint': 'disappoint',
    'disasterous': 'disastrous',
    'documant': 'document',
    'embarass': 'embarrass',
    'equiptment': 'equipment',
    'excede': 'exceed',
    'excellant': 'excellent',
    'exersize': 'exercise',
    'existance': 'existence',
    'experiance': 'experience',
    'extrordinary': 'extraordinary',
    'familiar': 'familiar',
    'fianlly': 'finally',
    'foriegn': 'foreign',
    'fourty': 'forty',
    'foward': 'forward',
    'freqent': 'frequent',
    'frustation': 'frustration',
    'garantee': 'guarantee',
    'grateful': 'grateful',
    'happend': 'happened',
    'harass': 'harass',
    'height': 'height',
    'hinderance': 'hindrance',
    'humn': 'human',
    'idiosy': 'idiocy',
    'ignorance': 'ignorance',
    'illegible': 'illegible',
    'imitate': 'imitate',
    'immediatly': 'immediately',
    'implement': 'implement',
    'important': 'important',
    'inconveniance': 'inconvenience',
    'independant': 'independent',
    'indispensible': 'indispensable',
    'innoculate': 'inoculate',
    'inteligence': 'intelligence',
    'intresting': 'interesting',
    'irresistable': 'irresistible',
    'knowlege': 'knowledge',
    'labratory': 'laboratory',
    'lengthen': 'lengthen',
    'libary': 'library',
    'lieing': 'lying',
    'maintainance': 'maintenance',
    'managment': 'management',
    'manouver': 'maneuver',
    'maintance': 'maintenance',
    'neccesary': 'necessary',
    'occassion': 'occasion',
    'occured': 'occurred',
    'offical': 'official',
    'ommision': 'omission',
    'opperate': 'operate',
    'oppurtunity': 'opportunity',
    'origional': 'original',
    'outragous': 'outrageous',
    'parrallel': 'parallel',
    'parliment': 'parliament',
    'percieve': 'perceive',
    'perserverance': 'perseverance',
    'persue': 'pursue',
    'posession': 'possession',
    'potatoe': 'potato',
    'preceeding': 'preceding',
    'presense': 'presence',
    'priviledge': 'privilege',
    'procede': 'proceed',
    'proffessor': 'professor',
    'promise': 'promise',
    'pronounciation': 'pronunciation',
    'publically': 'publicly',
    'purpose': 'purpose',
    'quarantine': 'quarantine',
    'questionaire': 'questionnaire',
    'reccommend': 'recommend',
    'recieve': 'receive',
    'reciept': 'receipt',
    'reconize': 'recognize',
    'relevent': 'relevant',
    'religeous': 'religious',
    'repetition': 'repetition',
    'restarant': 'restaurant',
    'rhythm': 'rhythm',
    'ridiculous': 'ridiculous',
    'seperate': 'separate',
    'sergent': 'sergeant',
    'similiar': 'similar',
    'sincerly': 'sincerely',
    'sophmore': 'sophomore',
    'sorround': 'surround',
    'spose': 'suppose',
    'straight': 'straight',
    'stratagy': 'strategy',
    'strenth': 'strength',
    'succeed': 'succeed',
    'sucess': 'success',
    'suprise': 'surprise',
    'surrounded': 'surrounded',
    'tecnical': 'technical',
    'tempature': 'temperature',
    'tennis': 'tennis',
    'terrible': 'terrible',
    'thier': 'their',
    'tommorrow': 'tomorrow',
    'tounge': 'tongue',
    'truely': 'truly',
    'twelth': 'twelfth',
    'tyranny': 'tyranny',
    'ultimately': 'ultimately',
    'untill': 'until',
    'unusal': 'unusual',
    'vaccum': 'vacuum',
    'vegetable': 'vegetable',
    'villian': 'villain',
    'weather': 'weather',
    'wierd': 'weird',
    'wich': 'which',
    'withold': 'withhold',
    'writting': 'writing'
};
exports.default = {
    command: 'spell',
    aliases: ['spellcheck', 'spelling', 'correct'],
    category: 'utility',
    description: 'Check the spelling of a word',
    usage: '.spell <word>',
    isPrefixless: false,
    handler: async (sock, message, args, context) => {
        const { chatId } = context;
        const botName = config_js_1.default.botName || '★彡 [ QUEEN AKUMA] 彡★';
        if (!args.length) {
            await sock.sendMessage(chatId, {
                text: ` ⟮ ✏️ ${botName} ⟯⊷
 *SPELL CHECKER*

 *Usage:*
 .spell <word>

 *Example:*
 .spell recieve
 .spell definately

 *Note:* Only common misspellings are detected.
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
            return;
        }
        const word = args[0].toLowerCase().trim();
        const correction = commonMistakes[word];
        if (correction) {
            // Find similar suggestions
            const suggestions = [];
            const wordLen = word.length;
            const entries = Object.entries(commonMistakes);
            for (const [misspelled, correct] of entries) {
                if (misspelled !== word &&
                    Math.abs(misspelled.length - wordLen) <= 2 &&
                    misspelled[0] === word[0]) {
                    suggestions.push({ misspelled, correct });
                    if (suggestions.length >= 3)
                        break;
                }
            }
            let suggestionText = '';
            if (suggestions.length > 0) {
                suggestionText = `\n\n💡 *Did you mean one of these?*\n`;
                for (const s of suggestions) {
                    suggestionText += ` • "${s.misspelled}" → *${s.correct}*\n`;
                }
            }
            await sock.sendMessage(chatId, {
                text: ` ⟮ ✏️ ${botName} ⟯⊷
 *SPELL CHECK RESULT*

 ❌ Misspelled: *"${word}"*
 ✅ Correction: *"${correction}"*
${suggestionText}

 💡 *Tip:* ${correction.length > word.length ? 'This word has more letters than you typed.' : 'Check the spelling carefully.'}
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
        else {
            // Check if word exists in dictionary (simple check)
            const isCommonWord = Object.values(commonMistakes).includes(word) ||
                Object.keys(commonMistakes).includes(word);
            await sock.sendMessage(chatId, {
                text: ` ⟮ ✏️ ${botName} ⟯⊷
 *SPELL CHECK RESULT*

 ✅ *"${word}"* appears to be spelled correctly!

 📚 *Word Info:*
  Length: ${word.length} characters
  ${isCommonWord ? '✓ This word is in our dictionary' : '✓ Common spelling'}

 💡 *Note:* Only common misspellings are detected.
 If you think this is wrong, try another spelling.
⊷

_⚡ Powered by ${botName}_`
            }, { quoted: messageConfig_js_1.fakeSender });
        }
    }
};

module.exports = exports.default;
