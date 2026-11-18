const {
  resolvePhone
} = require('../../utils/jidHelper');
function stripJid(v1) {
  if (!v1 || typeof v1 !== "string") {
    return null;
  }
  return v1.split(':')[0].split('@')[0];
}
async function jidToNumber(v2, v3) {
  if (!v3 || typeof v3 !== "string") {
    return null;
  }
  const v4 = await resolvePhone(v2, v3);
  if (v4) {
    return String(v4).replace(/\D/g, '');
  }
  const v5 = stripJid(v3);
  return v5 ? v5.replace(/\D/g, '') : null;
}
const COUNTRY_CODES = {
  '355': {
    'name': "Albania",
    'flag': "🇦🇱"
  },
  '213': {
    'name': 'Algeria',
    'flag': '🇩🇿'
  },
  '376': {
    'name': 'Andorra',
    'flag': "🇦🇩"
  },
  '244': {
    'name': "Angola",
    'flag': "🇦🇴"
  },
  '374': {
    'name': "Armenia",
    'flag': "🇦🇲"
  },
  '994': {
    'name': 'Azerbaijan',
    'flag': "🇦🇿"
  },
  '973': {
    'name': "Bahrain",
    'flag': "🇧🇭"
  },
  '880': {
    'name': 'Bangladesh',
    'flag': "🇧🇩"
  },
  '375': {
    'name': "Belarus",
    'flag': '🇧🇾'
  },
  '501': {
    'name': "Belize",
    'flag': '🇧🇿'
  },
  '229': {
    'name': "Benin",
    'flag': "🇧🇯"
  },
  '975': {
    'name': 'Bhutan',
    'flag': "🇧🇹"
  },
  '591': {
    'name': "Bolivia",
    'flag': '🇧🇴'
  },
  '387': {
    'name': "Bosnia & Herzegovina",
    'flag': "🇧🇦"
  },
  '267': {
    'name': "Botswana",
    'flag': "🇧🇼"
  },
  '673': {
    'name': 'Brunei',
    'flag': "🇧🇳"
  },
  '359': {
    'name': 'Bulgaria',
    'flag': "🇧🇬"
  },
  '226': {
    'name': "Burkina Faso",
    'flag': "🇧🇫"
  },
  '257': {
    'name': 'Burundi',
    'flag': "🇧🇮"
  },
  '855': {
    'name': "Cambodia",
    'flag': '🇰🇭'
  },
  '237': {
    'name': "Cameroon",
    'flag': "🇨🇲"
  },
  '238': {
    'name': "Cape Verde",
    'flag': '🇨🇻'
  },
  '236': {
    'name': "Central African Republic",
    'flag': "🇨🇫"
  },
  '235': {
    'name': 'Chad',
    'flag': "🇹🇩"
  },
  '269': {
    'name': "Comoros",
    'flag': "🇰🇲"
  },
  '242': {
    'name': "Congo (Brazzaville)",
    'flag': "🇨🇬"
  },
  '243': {
    'name': "Congo (Kinshasa)",
    'flag': "🇨🇩"
  },
  '682': {
    'name': "Cook Islands",
    'flag': "🇨🇰"
  },
  '506': {
    'name': "Costa Rica",
    'flag': "🇨🇷"
  },
  '385': {
    'name': "Croatia",
    'flag': '🇭🇷'
  },
  '357': {
    'name': 'Cyprus',
    'flag': "🇨🇾"
  },
  '420': {
    'name': "Czech Republic",
    'flag': "🇨🇿"
  },
  '253': {
    'name': "Djibouti",
    'flag': "🇩🇯"
  },
  '593': {
    'name': "Ecuador",
    'flag': '🇪🇨'
  },
  '503': {
    'name': "El Salvador",
    'flag': '🇸🇻'
  },
  '240': {
    'name': "Equatorial Guinea",
    'flag': "🇬🇶"
  },
  '291': {
    'name': "Eritrea",
    'flag': '🇪🇷'
  },
  '372': {
    'name': "Estonia",
    'flag': '🇪🇪'
  },
  '268': {
    'name': "Eswatini",
    'flag': '🇸🇿'
  },
  '251': {
    'name': 'Ethiopia',
    'flag': "🇪🇹"
  },
  '679': {
    'name': "Fiji",
    'flag': "🇫🇯"
  },
  '358': {
    'name': 'Finland',
    'flag': "🇫🇮"
  },
  '594': {
    'name': "French Guiana",
    'flag': "🇬🇫"
  },
  '689': {
    'name': "French Polynesia",
    'flag': "🇵🇫"
  },
  '241': {
    'name': "Gabon",
    'flag': "🇬🇦"
  },
  '220': {
    'name': "Gambia",
    'flag': "🇬🇲"
  },
  '995': {
    'name': "Georgia",
    'flag': "🇬🇪"
  },
  '233': {
    'name': "Ghana",
    'flag': "🇬🇭"
  },
  '350': {
    'name': "Gibraltar",
    'flag': '🇬🇮'
  },
  '502': {
    'name': "Guatemala",
    'flag': "🇬🇹"
  },
  '224': {
    'name': 'Guinea',
    'flag': "🇬🇳"
  },
  '245': {
    'name': "Guinea-Bissau",
    'flag': "🇬🇼"
  },
  '592': {
    'name': 'Guyana',
    'flag': "🇬🇾"
  },
  '509': {
    'name': "Haiti",
    'flag': "🇭🇹"
  },
  '504': {
    'name': "Honduras",
    'flag': "🇭🇳"
  },
  '354': {
    'name': "Iceland",
    'flag': "🇮🇸"
  },
  '353': {
    'name': "Ireland",
    'flag': "🇮🇪"
  },
  '972': {
    'name': "Israel",
    'flag': "🇮🇱"
  },
  '962': {
    'name': "Jordan",
    'flag': "🇯🇴"
  },
  '254': {
    'name': "Kenya",
    'flag': '🇰🇪'
  },
  '686': {
    'name': "Kiribati",
    'flag': "🇰🇮"
  },
  '965': {
    'name': 'Kuwait',
    'flag': '🇰🇼'
  },
  '996': {
    'name': "Kyrgyzstan",
    'flag': "🇰🇬"
  },
  '856': {
    'name': "Laos",
    'flag': "🇱🇦"
  },
  '371': {
    'name': "Latvia",
    'flag': "🇱🇻"
  },
  '961': {
    'name': 'Lebanon',
    'flag': "🇱🇧"
  },
  '266': {
    'name': 'Lesotho',
    'flag': "🇱🇸"
  },
  '231': {
    'name': "Liberia",
    'flag': "🇱🇷"
  },
  '218': {
    'name': "Libya",
    'flag': "🇱🇾"
  },
  '423': {
    'name': "Liechtenstein",
    'flag': "🇱🇮"
  },
  '370': {
    'name': "Lithuania",
    'flag': "🇱🇹"
  },
  '352': {
    'name': "Luxembourg",
    'flag': "🇱🇺"
  },
  '261': {
    'name': 'Madagascar',
    'flag': "🇲🇬"
  },
  '265': {
    'name': "Malawi",
    'flag': "🇲🇼"
  },
  '960': {
    'name': "Maldives",
    'flag': "🇲🇻"
  },
  '223': {
    'name': 'Mali',
    'flag': "🇲🇱"
  },
  '356': {
    'name': "Malta",
    'flag': "🇲🇹"
  },
  '692': {
    'name': "Marshall Islands",
    'flag': "🇲🇭"
  },
  '222': {
    'name': "Mauritania",
    'flag': "🇲🇷"
  },
  '230': {
    'name': "Mauritius",
    'flag': "🇲🇺"
  },
  '262': {
    'name': "Mayotte / Réunion",
    'flag': "🇾🇹"
  },
  '373': {
    'name': "Moldova",
    'flag': "🇲🇩"
  },
  '377': {
    'name': 'Monaco',
    'flag': "🇲🇨"
  },
  '976': {
    'name': 'Mongolia',
    'flag': "🇲🇳"
  },
  '382': {
    'name': 'Montenegro',
    'flag': '🇲🇪'
  },
  '212': {
    'name': "Morocco",
    'flag': "🇲🇦"
  },
  '258': {
    'name': "Mozambique",
    'flag': '🇲🇿'
  },
  '264': {
    'name': "Namibia",
    'flag': "🇳🇦"
  },
  '674': {
    'name': "Nauru",
    'flag': "🇳🇷"
  },
  '977': {
    'name': "Nepal",
    'flag': "🇳🇵"
  },
  '687': {
    'name': "New Caledonia",
    'flag': '🇳🇨'
  },
  '505': {
    'name': "Nicaragua",
    'flag': "🇳🇮"
  },
  '227': {
    'name': 'Niger',
    'flag': '🇳🇪'
  },
  '234': {
    'name': "Nigeria",
    'flag': "🇳🇬"
  },
  '683': {
    'name': "Niue",
    'flag': "🇳🇺"
  },
  '968': {
    'name': 'Oman',
    'flag': "🇴🇲"
  },
  '680': {
    'name': "Palau",
    'flag': '🇵🇼'
  },
  '970': {
    'name': "Palestine",
    'flag': "🇵🇸"
  },
  '507': {
    'name': "Panama",
    'flag': "🇵🇦"
  },
  '675': {
    'name': "Papua New Guinea",
    'flag': "🇵🇬"
  },
  '595': {
    'name': "Paraguay",
    'flag': "🇵🇾"
  },
  '974': {
    'name': "Qatar",
    'flag': "🇶🇦"
  },
  '389': {
    'name': "North Macedonia",
    'flag': '🇲🇰'
  },
  '250': {
    'name': "Rwanda",
    'flag': "🇷🇼"
  },
  '685': {
    'name': 'Samoa',
    'flag': '🇼🇸'
  },
  '239': {
    'name': "São Tomé & Príncipe",
    'flag': "🇸🇹"
  },
  '966': {
    'name': "Saudi Arabia",
    'flag': "🇸🇦"
  },
  '221': {
    'name': 'Senegal',
    'flag': "🇸🇳"
  },
  '381': {
    'name': "Serbia",
    'flag': '🇷🇸'
  },
  '248': {
    'name': "Seychelles",
    'flag': "🇸🇨"
  },
  '232': {
    'name': "Sierra Leone",
    'flag': "🇸🇱"
  },
  '421': {
    'name': "Slovakia",
    'flag': "🇸🇰"
  },
  '386': {
    'name': 'Slovenia',
    'flag': '🇸🇮'
  },
  '677': {
    'name': "Solomon Islands",
    'flag': "🇸🇧"
  },
  '252': {
    'name': "Somalia",
    'flag': "🇸🇴"
  },
  '211': {
    'name': "South Sudan",
    'flag': '🇸🇸'
  },
  '249': {
    'name': "Sudan",
    'flag': '🇸🇩'
  },
  '597': {
    'name': 'Suriname',
    'flag': "🇸🇷"
  },
  '963': {
    'name': "Syria",
    'flag': "🇸🇾"
  },
  '992': {
    'name': "Tajikistan",
    'flag': "🇹🇯"
  },
  '255': {
    'name': "Tanzania",
    'flag': "🇹🇿"
  },
  '670': {
    'name': "Timor-Leste",
    'flag': '🇹🇱'
  },
  '228': {
    'name': 'Togo',
    'flag': "🇹🇬"
  },
  '676': {
    'name': "Tonga",
    'flag': "🇹🇴"
  },
  '216': {
    'name': "Tunisia",
    'flag': "🇹🇳"
  },
  '993': {
    'name': 'Turkmenistan',
    'flag': '🇹🇲'
  },
  '688': {
    'name': "Tuvalu",
    'flag': "🇹🇻"
  },
  '256': {
    'name': 'Uganda',
    'flag': "🇺🇬"
  },
  '380': {
    'name': "Ukraine",
    'flag': '🇺🇦'
  },
  '971': {
    'name': "United Arab Emirates",
    'flag': "🇦🇪"
  },
  '598': {
    'name': "Uruguay",
    'flag': "🇺🇾"
  },
  '998': {
    'name': "Uzbekistan",
    'flag': '🇺🇿'
  },
  '678': {
    'name': "Vanuatu",
    'flag': "🇻🇺"
  },
  '967': {
    'name': 'Yemen',
    'flag': "🇾🇪"
  },
  '260': {
    'name': 'Zambia',
    'flag': "🇿🇲"
  },
  '263': {
    'name': "Zimbabwe",
    'flag': "🇿🇼"
  },
  '20': {
    'name': 'Egypt',
    'flag': "🇪🇬"
  },
  '27': {
    'name': "South Africa",
    'flag': "🇿🇦"
  },
  '30': {
    'name': "Greece",
    'flag': '🇬🇷'
  },
  '31': {
    'name': 'Netherlands',
    'flag': "🇳🇱"
  },
  '32': {
    'name': "Belgium",
    'flag': "🇧🇪"
  },
  '33': {
    'name': 'France',
    'flag': "🇫🇷"
  },
  '34': {
    'name': 'Spain',
    'flag': "🇪🇸"
  },
  '36': {
    'name': "Hungary",
    'flag': "🇭🇺"
  },
  '39': {
    'name': "Italy",
    'flag': "🇮🇹"
  },
  '40': {
    'name': "Romania",
    'flag': "🇷🇴"
  },
  '41': {
    'name': "Switzerland",
    'flag': '🇨🇭'
  },
  '43': {
    'name': "Austria",
    'flag': "🇦🇹"
  },
  '44': {
    'name': "United Kingdom",
    'flag': "🇬🇧"
  },
  '45': {
    'name': 'Denmark',
    'flag': "🇩🇰"
  },
  '46': {
    'name': "Sweden",
    'flag': "🇸🇪"
  },
  '47': {
    'name': "Norway",
    'flag': "🇳🇴"
  },
  '48': {
    'name': "Poland",
    'flag': '🇵🇱'
  },
  '49': {
    'name': "Germany",
    'flag': "🇩🇪"
  },
  '51': {
    'name': "Peru",
    'flag': "🇵🇪"
  },
  '52': {
    'name': "Mexico",
    'flag': "🇲🇽"
  },
  '53': {
    'name': 'Cuba',
    'flag': "🇨🇺"
  },
  '54': {
    'name': "Argentina",
    'flag': '🇦🇷'
  },
  '55': {
    'name': "Brazil",
    'flag': '🇧🇷'
  },
  '56': {
    'name': "Chile",
    'flag': '🇨🇱'
  },
  '57': {
    'name': "Colombia",
    'flag': "🇨🇴"
  },
  '58': {
    'name': "Venezuela",
    'flag': "🇻🇪"
  },
  '60': {
    'name': "Malaysia",
    'flag': "🇲🇾"
  },
  '61': {
    'name': "Australia",
    'flag': "🇦🇺"
  },
  '62': {
    'name': "Indonesia",
    'flag': '🇮🇩'
  },
  '63': {
    'name': "Philippines",
    'flag': "🇵🇭"
  },
  '64': {
    'name': "New Zealand",
    'flag': "🇳🇿"
  },
  '65': {
    'name': 'Singapore',
    'flag': "🇸🇬"
  },
  '66': {
    'name': "Thailand",
    'flag': "🇹🇭"
  },
  '81': {
    'name': "Japan",
    'flag': "🇯🇵"
  },
  '82': {
    'name': "South Korea",
    'flag': '🇰🇷'
  },
  '84': {
    'name': "Vietnam",
    'flag': "🇻🇳"
  },
  '86': {
    'name': 'China',
    'flag': "🇨🇳"
  },
  '90': {
    'name': "Turkey",
    'flag': '🇹🇷'
  },
  '91': {
    'name': "India",
    'flag': "🇮🇳"
  },
  '92': {
    'name': "Pakistan",
    'flag': '🇵🇰'
  },
  '93': {
    'name': "Afghanistan",
    'flag': "🇦🇫"
  },
  '94': {
    'name': "Sri Lanka",
    'flag': "🇱🇰"
  },
  '95': {
    'name': 'Myanmar',
    'flag': "🇲🇲"
  },
  '98': {
    'name': "Iran",
    'flag': "🇮🇷"
  },
  '1': {
    'name': "USA / Canada",
    'flag': "🇺🇸"
  },
  '7': {
    'name': "Russia / Kazakhstan",
    'flag': "🇷🇺"
  }
};
function detectCountry(v6) {
  for (const v7 of [3, 2, 1]) {
    const v8 = v6.substring(0, v7);
    if (COUNTRY_CODES[v8]) {
      return {
        'dialCode': v8,
        'local': v6.substring(v7),
        'country': COUNTRY_CODES[v8]
      };
    }
  }
  return null;
}
module.exports = {
  'name': "wame",
  'aliases': ["walink", "whatslink", 'openwa'],
  'category': "utility",
  'description': "Generate a wa.me link from a quoted message or a number",
  'usage': ".wame  (reply to a message)  OR  .wame <number>",
  async 'execute'(v9, v10, v11, v12) {
    try {
      let v13 = null;
      let v14 = null;
      const v15 = v10.message?.["extendedTextMessage"]?.["contextInfo"];
      const v16 = v15?.["quotedMessage"];
      if (v16 && v15?.["participant"]) {
        v13 = await jidToNumber(v9, v15.participant);
        if (v13) {
          v14 = "quoted sender";
        }
      }
      if (!v13 && v16) {
        const v17 = v16.conversation || v16.extendedTextMessage?.["text"] || v16.imageMessage?.['caption'] || v16.videoMessage?.["caption"] || v16.documentMessage?.['caption'] || '';
        const v18 = v17.match(/\+?(\d[\d\s\-().]{6,}\d)/);
        if (v18) {
          v13 = v18[1].replace(/\D/g, '');
          v14 = "text in quoted message";
        }
      }
      if (!v13 && v11.length > 0) {
        v13 = v11.join('').replace(/\D/g, '');
        v14 = "provided number";
      }
      if (!v13 || v13.length < 7) {
        return v12.reply("❌ No phone number found.\n\n*Usage:*\n• Reply to any message → `.wame`\n• Direct number → `.wame 254712345678`");
      }
      const v19 = detectCountry(v13);
      const v20 = "https://wa.me/" + v13;
      let v21 = "🔗 *WhatsApp Link*\n\n";
      if (v19) {
        v21 += v19.country.flag + " *Country:* " + v19.country.name + "\n";
        v21 += "📞 *Dial Code:* +" + v19.dialCode + "\n";
        v21 += "🔢 *Local Number:* " + v19.local + "\n";
        v21 += "📱 *Full Number:* +" + v13 + "\n";
      } else {
        v21 += "📱 *Number:* +" + v13 + "\n";
      }
      v21 += "🌐 *Link:* " + v20 + "\n\n";
      v21 += "_Source: " + v14 + '_';
      await v9.sendMessage(v12.from, {
        'text': v21
      }, {
        'quoted': v10
      });
    } catch (v22) {
      console.error("[wame] error:", v22);
      await v12.reply("❌ Error: " + v22.message);
    }
  }
};
