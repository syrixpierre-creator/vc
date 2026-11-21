/**
 * QUEEN AKUMA v2.8.0 - QUEEN AKUMA port: Anime commands (AniList + nekos.best)
 * AniList GraphQL: is VM se 403 (Cloudflare) - host par chal sakta hai;
 * fail gracefully hota hai (clear error, crash nahi). nekos.best,
 * trace.moe aur animechan VM se live verify hain.
 * SKIP (pehle se hain): .anime .manga .character .staff .trailer
 *  .schedule .trending (alias) .animequote .neko .kick2 aur baaki
 *  reaction aliases (angry/clap/confused/cuddle/feed/handhold/
 *  highfive/nom/peck/shrug/sleep/smile/stare/tickle/wave/yeet).
 * Adult content filter: isAdult + Hentai/Ecchi genre hamesha excluded.
 */
const fei = require('../lib/feiApi');

const FAIL = '❌ *API is not responding. Try again later.*';

function safeHttpsUrl(value) {
  try {
    const u = new URL(String(value || '').trim());
    return u.protocol === 'https:' ? u.href : null;
  } catch (_) { return null; }
}

function cleanAnimeText(value, limit) {
  let text = String(value == null ? '' : value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/~![\s\S]*?!~/g, '[spoiler hidden]')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      const cp = Number.parseInt(n, 16);
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ' ';
    })
    .replace(/&#(\d+);/g, (_, n) => {
      const cp = Number.parseInt(n, 10);
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ' ';
    })
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
  const lim = limit || 600;
  if (text.length > lim) text = text.slice(0, Math.max(0, lim - 1)).trimEnd() + '…';
  return text;
}

function titleName(title) {
  title = title || {};
  return title.english || title.romaji || title.native || 'Unknown';
}

function score(media) {
  return media && media.averageScore ? (media.averageScore / 10).toFixed(1) : 'N/A';
}

function pretty(value) {
  return String(value || '?').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function dateText(date) {
  if (!date || !date.year) return '?';
  const parts = [String(date.year)];
  if (date.month) parts.push(String(date.month).padStart(2, '0'));
  if (date.day) parts.push(String(date.day).padStart(2, '0'));
  return parts.join('-');
}

function secondsText(value) {
  let seconds = Math.max(0, Math.floor(Number(value) || 0));
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return [days ? days + 'd' : '', hours ? hours + 'h' : '', minutes + 'm'].filter(Boolean).join(' ');
}

function cover(media) {
  const image = media && media.coverImage;
  return safeHttpsUrl(image && (image.extraLarge || image.large));
}

function formatMedia(media, synopsisLimit) {
  const title = (media && media.title) || {};
  const size = [];
  if (media.episodes) size.push(media.episodes + ' eps');
  if (media.chapters) size.push(media.chapters + ' ch');
  if (media.volumes) size.push(media.volumes + ' vol');
  const studios = media.studios && media.studios.nodes
    ? media.studios.nodes.map(s => s.name).filter(Boolean).join(', ')
    : '';
  const lines = ['*' + titleName(title) + '*'];
  if (title.native) lines.push('🇯🇵 ' + cleanAnimeText(title.native, 100));
  lines.push(
    '⭐ Score: ' + score(media) + '   ❤️ Favorites: ' + (Number(media.favourites) || 0).toLocaleString('en-US'),
    '📺 ' + pretty(media.format) + ' • ' + (size.join(' • ') || '?') + ' • ' + pretty(media.status),
    '📅 ' + dateText(media.startDate) + ' → ' + dateText(media.endDate)
  );
  if (studios) lines.push('🎬 ' + cleanAnimeText(studios, 180));
  if (Array.isArray(media.genres) && media.genres.length) lines.push('🎭 ' + media.genres.join(', '));
  lines.push('', cleanAnimeText(media.description, synopsisLimit || 600) || 'No synopsis available.', '');
  const url = safeHttpsUrl(media.siteUrl);
  if (url) lines.push('🔗 ' + url);
  return lines.join('\n');
}

function formatTopList(items) {
  return items.map((media, i) => (i + 1) + '. *' + cleanAnimeText(titleName(media.title), 120) + '* ⭐ ' + score(media)).join('\n');
}

const MEDIA_FIELDS = [
  'id siteUrl format status episodes chapters volumes season seasonYear averageScore popularity favourites genres isAdult',
  'description(asHtml: false)',
  'title { romaji english native }',
  'coverImage { extraLarge large }',
  'bannerImage',
  'startDate { year month day }',
  'endDate { year month day }',
  'studios(isMain: true) { nodes { name } }'
].join(' ');

const LIST_QUERY = 'query($t: MediaType, $sort: [MediaSort], $page: Int, $per: Int, ' +
  '$st: MediaStatus, $season: MediaSeason, $year: Int, $g: String) {' +
  ' Page(page: $page, perPage: $per) {' +
  '  media(type: $t, sort: $sort, status: $st, season: $season, seasonYear: $year, genre: $g,' +
  '        isAdult: false, genre_not_in: ["Hentai", "Ecchi"]) {' + MEDIA_FIELDS + '}' +
  ' }' +
  '}';

const CHAR_FIELDS = [
  'id siteUrl favourites description(asHtml: false) gender age',
  'name { full native } image { large }',
  'media(perPage: 3, sort: POPULARITY_DESC) { nodes { isAdult title { romaji english } } }'
].join(' ');

async function findAnimeMedia(search, type, extra) {
  const query = 'query($s: String, $t: MediaType) { Media(search: $s, type: $t, isAdult: false, ' +
    'genre_not_in: ["Hentai", "Ecchi"]) { ' + MEDIA_FIELDS + ' ' + (extra || '') + ' } }';
  const data = await fei.anilistQuery(query, { s: search, t: type || 'ANIME' });
  if (!data.Media || data.Media.isAdult) throw new Error('No anime/manga found with that name.');
  return data.Media;
}

async function mediaList(kind, sort, per, page, extra) {
  const variables = { t: kind, sort: [sort], page, per, st: null, season: null, year: null, g: null };
  if (extra.status) variables.st = extra.status;
  if (extra.season) variables.season = extra.season;
  if (extra.year) variables.year = extra.year;
  if (extra.genre) variables.g = extra.genre;
  const data = await fei.anilistQuery(LIST_QUERY, variables);
  const items = ((data.Page && data.Page.media) || []).filter(item =>
    item && !item.isAdult && !(item.genres || []).some(g => ['Hentai', 'Ecchi'].indexOf(g) !== -1)
  );
  if (!items.length) throw new Error('No matching anime/manga found.');
  return items;
}

async function findCharacter(search) {
  const data = await fei.anilistQuery('query($s: String) { Character(search: $s) { ' + CHAR_FIELDS + ' } }', { s: search });
  if (!data.Character) throw new Error('Character not found.');
  return data.Character;
}

function formatCharacter(character, limit) {
  const works = ((character.media && character.media.nodes) || [])
    .filter(item => item && !item.isAdult)
    .map(item => titleName(item.title))
    .filter(Boolean)
    .join(', ') || 'N/A';
  const name = character.name || {};
  const lines = ['*' + cleanAnimeText(name.full || 'Unknown character', 160) +
    (name.native ? ' (' + cleanAnimeText(name.native, 80) + ')' : '') + '*'];
  const meta = [character.gender, character.age ? 'Age ' + character.age : ''].filter(Boolean).join(' • ');
  if (meta) lines.push('🧬 ' + cleanAnimeText(meta, 100));
  lines.push(
    '❤️ Favorites: ' + (Number(character.favourites) || 0).toLocaleString('en-US'),
    '🎬 From: ' + cleanAnimeText(works, 240),
    '',
    cleanAnimeText(character.description, limit || 450) || 'No bio available.',
    ''
  );
  const url = safeHttpsUrl(character.siteUrl);
  if (url) lines.push('🔗 ' + url);
  return lines.join('\n');
}

function result(title, text, image, gif) {
  return { title, text: String(text || ''), image: image || null, gif: gif || null };
}

async function sendAnimeResult(sock, chatId, message, data) {
  const title = cleanAnimeText(data.title || 'Anime', 140);
  const rawBody = String(data.text || (data.image || data.gif ? 'Media attached below.' : 'No details were returned.'));
  const body = rawBody.split(/\r?\n/).map(l => cleanAnimeText(l, 600)).join('\n').slice(0, 3400);
  await sock.sendMessage(chatId, { text: fei.box(title, body) }, { quoted: message });
  if (data.image) {
    const url = safeHttpsUrl(data.image);
    if (url) await sock.sendMessage(chatId, { image: { url }, caption: '🖼 *' + title + '*' });
  }
  if (data.gif) {
    const url = safeHttpsUrl(data.gif);
    if (url) await sock.sendMessage(chatId, { video: { url }, gifPlayback: true, caption: '🎞 *' + title + '*' });
  }
}

function makeAnime(cmd, desc, usage, run, opts) {
  opts = opts || {};
  return {
    command: cmd, aliases: [], category: 'fei-anime', description: desc, usage,
    async handler(sock, message, args, context = {}) {
      const chatId = context.chatId || message.key.remoteJid;
      const input = (args || []).join(' ').trim();
      const reply = (t) => sock.sendMessage(chatId, { text: t }, { quoted: message });
      if (opts.required && !input) return reply('❌ Usage: ' + usage);
      if (input.length > (opts.maxLength || 180)) return reply('❌ Argument ' + (opts.maxLength || 180) + ' characters se kam rakho.');
      if (opts.progress !== false) {
        await sock.sendMessage(chatId, { text: '⏳ _' + (opts.progressText || 'Fetching anime information') + '. Please wait…_' }, { quoted: message }).catch(() => {});
      }
      try {
        const data = await run(input);
        await sendAnimeResult(sock, chatId, message, data);
      } catch (e) {
        await reply('⚠️ ' + String((e && e.message) || FAIL).slice(0, 220));
      }
    }
  };
}

const animeInfo = [
  makeAnime('charpic', 'Character ki picture dikhao', '.charpic <character>', async (arg) => {
    const c = await findCharacter(arg);
    return result('🖼 CHARACTER PICTURE', '*' + cleanAnimeText(c.name && c.name.full, 160) + '*', safeHttpsUrl(c.image && c.image.large));
  }, { required: true, label: 'character name' }),
  makeAnime('studio', 'Anime studio aur uske popular works', '.studio <studio>', async (arg) => {
    const query = 'query($s: String) { Studio(search: $s) {' +
      ' name siteUrl favourites isAnimationStudio' +
      ' media(sort: POPULARITY_DESC, perPage: 8) { nodes { isAdult averageScore title { romaji english } coverImage { large } } }' +
      ' } }';
    const data = await fei.anilistQuery(query, { s: arg });
    const studio = data.Studio;
    if (!studio) throw new Error('Studio not found.');
    const works = ((studio.media && studio.media.nodes) || []).filter(item => item && !item.isAdult);
    const lines = [
      '*' + cleanAnimeText(studio.name, 180) + '*',
      '❤️ Favorites: ' + (Number(studio.favourites) || 0).toLocaleString('en-US'),
      '',
      '*Popular works:*',
      ...(works.length ? works.map((item, i) => (i + 1) + '. *' + cleanAnimeText(titleName(item.title), 120) + '* ⭐ ' + score(item)) : ['No public works listed.'])
    ];
    const site = safeHttpsUrl(studio.siteUrl);
    if (site) lines.push('', '🔗 ' + site);
    return result('🏢 sTUDIO', lines.join('\n'), safeHttpsUrl(works[0] && works[0].coverImage && works[0].coverImage.large));
  }, { required: true, label: 'studio name' }),
  makeAnime('recommend', 'Pasand anime jaisa aur anime dhoondo', '.recommend <anime>', async (arg) => {
    const extra = 'recommendations(sort: RATING_DESC, perPage: 8) {' +
      ' nodes { rating mediaRecommendation { isAdult averageScore title { romaji english } coverImage { large } } } }';
    const media = await findAnimeMedia(arg, 'ANIME', extra);
    const recs = media.recommendations && media.recommendations.nodes || [];
    const items = recs.map(row => row.mediaRecommendation).filter(item => item && !item.isAdult);
    if (!items.length) throw new Error('No recommendation found.');
    return result('💞 RECOMMENDATIONs', 'If you liked *' + cleanAnimeText(titleName(media.title), 150) + ':*\n\n' + formatTopList(items), cover(media));
  }, { required: true, label: 'anime title' }),
  makeAnime('episodes', 'Episode list aur next air time', '.episodes <anime>', async (arg) => {
    const media = await findAnimeMedia(arg, 'ANIME', 'streamingEpisodes { title } nextAiringEpisode { episode timeUntilAiring }');
    const air = media.nextAiringEpisode;
    let heading = '*' + cleanAnimeText(titleName(media.title), 160) + '*\n📺 ' + (media.episodes || '?') + ' episodes • ' + pretty(media.status);
    if (air) heading += '\n⏰ Ep ' + air.episode + ' airs in ' + secondsText(air.timeUntilAiring);
    const eps = media.streamingEpisodes || [];
    const body = eps.length ? eps.slice(0, 20).map(ep => '• ' + cleanAnimeText(ep.title, 90)).join('\n') : '(No episode titles available.)';
    return result('🎞 EPIsODEs', heading + '\n\n' + body, cover(media));
  }, { required: true, label: 'anime title' }),
  makeAnime('animechars', 'Anime ke main characters ki list', '.animechars <anime>', async (arg) => {
    const extra = 'characters(sort: FAVOURITES_DESC, perPage: 10) { edges { role node { name { full } image { large } } } }';
    const media = await findAnimeMedia(arg, 'ANIME', extra);
    const edges = (media.characters && media.characters.edges) || [];
    if (!edges.length) throw new Error('No characters found for this anime.');
    const lines = edges.map((edge, i) => (i + 1) + '. *' + cleanAnimeText(edge.node && edge.node.name && edge.node.name.full, 120) + '* (' + pretty(edge.role) + ')');
    return result('👥 ANIME CHARACTERs', '*' + cleanAnimeText(titleName(media.title), 160) + '* cast:\n\n' + lines.join('\n'), safeHttpsUrl(edges[0].node && edges[0].node.image && edges[0].node.image.large));
  }, { required: true, label: 'anime title' }),
  makeAnime('pictures', 'Anime ki cover/banner art', '.pictures <anime>', async (arg) => {
    const media = await findAnimeMedia(arg);
    const image = safeHttpsUrl(media.bannerImage) || cover(media);
    if (!image) throw new Error('No cover or banner image found.');
    return result('🖼 ANIME PICTURE', '*' + cleanAnimeText(titleName(media.title), 160) + '*', image);
  }, { required: true, label: 'anime title' }),
  makeAnime('streaming', 'Where to watch an anime (streaming links)', '.streaming <anime>', async (arg) => {
    const media = await findAnimeMedia(arg, 'ANIME', 'externalLinks { site url type }');
    const links = (media.externalLinks || []).filter(link => link && link.type === 'STREAMING' && safeHttpsUrl(link.url));
    if (!links.length) throw new Error('No streaming links found for this anime.');
    return result('📡 WHERE TO WATCH', '*' + cleanAnimeText(titleName(media.title), 160) + '*\n\n' +
      links.slice(0, 8).map(link => '• *' + cleanAnimeText(link.site, 80) + '*: ' + safeHttpsUrl(link.url)).join('\n'), cover(media));
  }, { required: true, label: 'anime title' }),
  makeAnime('review', 'Anime ka top-rated review', '.review <anime>', async (arg) => {
    const extra = 'reviews(limit: 1, sort: RATING_DESC) { nodes { summary body(asHtml: false) score user { name } siteUrl } }';
    const media = await findAnimeMedia(arg, 'ANIME', extra);
    const reviews = (media.reviews && media.reviews.nodes) || [];
    if (!reviews.length) throw new Error('No review found for this anime.');
    const review = reviews[0];
    const lines = [
      '*' + cleanAnimeText(titleName(media.title), 160) + '*',
      '👤 ' + cleanAnimeText((review.user && review.user.name) || 'Unknown user', 80) + '   ⭐ ' + (review.score || '?') + '/100',
      '',
      '_' + cleanAnimeText(review.summary, 150) + '_',
      '',
      cleanAnimeText(review.body, 650)
    ];
    const site = safeHttpsUrl(review.siteUrl);
    if (site) lines.push('', '🔗 ' + site);
    return result('📝 ANIME REVIEW', lines.join('\n'), cover(media));
  }, { required: true, label: 'anime title' }),
];

const animeLists = [
  makeAnime('genres', 'List of all anime genres', '.genres', async () => {
    const data = await fei.anilistQuery('{ GenreCollection }');
    const genres = (data.GenreCollection || []).filter(g => ['hentai', 'ecchi'].indexOf(String(g).toLowerCase()) === -1).sort();
    if (!genres.length) throw new Error('Genre list not found.');
    return result('🎭 ANIME GENREs', 'Use *.genre <name>* for a top pick.\n\n' + genres.join(', '));
  }, { progressText: 'Loading anime genres' }),
  makeAnime('genre', 'Genre se ek top anime chuno', '.genre <genre>', async (arg) => {
    const data = await fei.anilistQuery('{ GenreCollection }');
    const genres = (data.GenreCollection || []).filter(g => ['hentai', 'ecchi'].indexOf(String(g).toLowerCase()) === -1);
    const match = genres.find(g => g.toLowerCase() === arg.toLowerCase());
    if (!match) throw new Error('Unknown genre. See the list with .genres');
    const items = await mediaList('ANIME', 'SCORE_DESC', 25, Math.floor(Math.random() * 4) + 1, { genre: match });
    const media = items[Math.floor(Math.random() * items.length)];
    return result('🎭 GENRE PICK', '🎭 Genre: ' + match + '\n\n' + formatMedia(media, 450), cover(media));
  }, { required: true, label: 'genre' }),
  ...[
    ['topanime', 'ANIME', 'SCORE_DESC', '🏆 TOP ANIME', 'Top 10 anime by score', {}],
    ['topmanga', 'MANGA', 'SCORE_DESC', '🏆 TOP MANGA', 'Top 10 manga by score', {}],
    ['popular', 'ANIME', 'POPULARITY_DESC', '🔥 MOsT POPULAR', 'Most popular anime', {}],
    ['favorite', 'ANIME', 'FAVOURITES_DESC', '❤️ ғAN ғAVORITEs', 'Most favorited anime', {}],
    ['airing', 'ANIME', 'SCORE_DESC', '📡 TOP AIRING', 'Highly rated anime currently airing', { status: 'RELEASING' }],
    ['upcoming', 'ANIME', 'POPULARITY_DESC', '⏳ UPCOMING ANIME', 'Popular upcoming anime', { status: 'NOT_YET_RELEASED' }],
  ].map(([name, kind, sort, title, description, extra]) =>
    makeAnime(name, description, '.' + name, async () => {
      const items = await mediaList(kind, sort, 10, 1, extra);
      return result(title, formatTopList(items), cover(items[0]));
    }, { progressText: 'Loading anime rankings' })
  ),
  makeAnime('season', 'Is season ke popular anime', '.season', async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const season = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][Math.floor((month - 1) / 3)];
    const items = await mediaList('ANIME', 'POPULARITY_DESC', 10, 1, { season, year: now.getFullYear() });
    return result('🌸 ' + pretty(season) + ' ' + now.getFullYear(), formatTopList(items), cover(items[0]));
  }, { progressText: "Loading this season's anime" }),
  makeAnime('topchars', 'Sabse zyada favorite characters', '.topchars', async () => {
    const query = 'query { Page(perPage: 10) { characters(sort: FAVOURITES_DESC) { name { full } favourites image { large } } } }';
    const data = await fei.anilistQuery(query);
    const characters = (data.Page && data.Page.characters) || [];
    if (!characters.length) throw new Error('Popular characters nahi mile.');
    return result('🏆 TOP CHARACTERs', characters.map((c, i) =>
      (i + 1) + '. *' + cleanAnimeText(c.name && c.name.full, 120) + '* ❤️ ' +
      (Number(c.favourites) || 0).toLocaleString('en-US')).join('\n'),
      safeHttpsUrl(characters[0].image && characters[0].image.large));
  }, { progressText: 'Loading popular characters' }),
  makeAnime('nextep', 'Anime ka next episode kab aayega', '.nextep <anime>', async (arg) => {
    const media = await findAnimeMedia(arg, 'ANIME', 'nextAiringEpisode { episode timeUntilAiring }');
    const next = media.nextAiringEpisode;
    const text = next
      ? '*' + cleanAnimeText(titleName(media.title), 160) + '*\n📺 Episode ' + next.episode + ' airs in *' + secondsText(next.timeUntilAiring) + '*'
      : '*' + cleanAnimeText(titleName(media.title), 160) + '*\nStatus: ' + pretty(media.status) + '. No upcoming episode is listed.';
    return result('⏰ NExT EPIsODE', text, cover(media));
  }, { required: true, label: 'anime title' }),
  makeAnime('randomanime', 'Random popular anime', '.randomanime', async () => {
    const media = (await mediaList('ANIME', 'POPULARITY_DESC', 1, Math.floor(Math.random() * 600) + 1))[0];
    return result('🎲 RANDOM ANIME', formatMedia(media, 450), cover(media));
  }, { progressText: 'Picking a random anime' }),
  makeAnime('randommanga', 'Random popular manga', '.randommanga', async () => {
    const media = (await mediaList('MANGA', 'POPULARITY_DESC', 1, Math.floor(Math.random() * 600) + 1))[0];
    return result('🎲 RANDOM MANGA', formatMedia(media, 450), cover(media));
  }, { progressText: 'Picking a random manga' }),
  makeAnime('randomchar', 'Random anime character', '.randomchar', async () => {
    const query = 'query($p: Int) { Page(page: $p, perPage: 1) { characters(sort: FAVOURITES_DESC) { ' + CHAR_FIELDS + ' } } }';
    const data = await fei.anilistQuery(query, { p: Math.floor(Math.random() * 800) + 1 });
    const characters = (data.Page && data.Page.characters) || [];
    if (!characters.length) throw new Error('Character not found.');
    const c = characters[0];
    return result('🎲 RANDOM CHARACTER', formatCharacter(c, 350), safeHttpsUrl(c.image && c.image.large));
  }, { progressText: 'Picking a random character' }),
  makeAnime('whatanime', 'Screenshot se anime pehchano (trace.moe)', '.whatanime <screenshot URL>', async (arg) => {
    let screenshot;
    try { screenshot = new URL(arg); } catch (_) { throw new Error('Valid public screenshot URL do.'); }
    if (screenshot.protocol !== 'https:') throw new Error('HTTPS screenshot URL use karo.');
    const match = await fei.traceMoe(screenshot.href);
    const media = (match.anilist && typeof match.anilist === 'object') ? match.anilist : {};
    if (media.isAdult) throw new Error('Adult result skipped.');
    const title = (media.title && (media.title.english || media.title.romaji)) || match.filename || 'Unknown anime';
    const sceneSeconds = Math.max(0, Math.floor(Number(match.from) || 0));
    const minutes = Math.floor(sceneSeconds / 60);
    const seconds = String(sceneSeconds % 60).padStart(2, '0');
    const similarity = (Number(match.similarity) || 0) * 100;
    const text = '*' + cleanAnimeText(title, 160) + '*\n📺 Episode: ' + (match.episode || 'N/A') +
      '\n⏱ Scene at ' + minutes + ':' + seconds +
      '\n🎯 Match: ' + similarity.toFixed(1) + '%' + (similarity < 87 ? '\n⚠️ Low confidence' : '');
    return result('🔎 ANIME IDENTIғIED', text, safeHttpsUrl(match.image));
  }, { required: true, label: 'HTTPS screenshot URL', maxLength: 1500, progressText: 'Checking the screenshot with trace.moe' }),
  ...[
    ['waifu2', 'waifu', '💖 WAIғU', 'Your waifu 💖'],
    ['husbando', 'husbando', '💙 HUsBANDO', 'Your husbando 💙'],
    ['kitsune', 'kitsune', '🦊 KITsUNE', 'Fox girl 🦊'],
  ].map(([name, endpoint, title, label]) =>
    makeAnime(name, 'Random anime image: ' + label, '.' + name, async () => {
      const item = await fei.nekos(endpoint);
      const lines = [label, '🎨 Artist: ' + cleanAnimeText(item.artist_name || 'Unknown', 100)];
      const source = safeHttpsUrl(item.source_url);
      if (source) lines.push('🔗 ' + source);
      return result(title, lines.join('\n'), item.url);
    }, { progressText: 'Fetching anime art' })
  ),
];

const GIF_REACTIONS = [
  'baka', 'bleh', 'blowkiss', 'bored', 'carry', 'dance', 'facepalm',
  'handshake', 'kabedon', 'lappillow', 'laugh', 'nod', 'nope', 'nya',
  'pout', 'run', 'salute', 'shake', 'shocked', 'sip', 'spin', 'teehee',
  'think', 'thumbsup', 'wag', 'yawn'
];

const animeGifs = GIF_REACTIONS.map(name =>
  makeAnime(name, 'Anime reaction GIF: ' + name, '.' + name + ' [text]', async (arg) => {
    const item = await fei.nekos(name);
    const lines = ['*' + name.toUpperCase() + '*' + (arg ? ' ' + cleanAnimeText(arg, 80) : ''),
      '🎞 From: _' + cleanAnimeText(item.anime_name || 'Unknown anime', 120) + '_'];
    const source = safeHttpsUrl(item.source_url);
    if (source) lines.push('🔗 ' + source);
    return result('🎞 ' + pretty(name), lines.join('\n'), null, item.url);
  }, { maxLength: 80, progressText: 'Fetching an anime reaction GIF' })
);

const animeCommands = [...animeInfo, ...animeLists, ...animeGifs];

const animemenu = {
  command: 'animemenu', aliases: ['animehelp'], category: 'fei-anime',
  description: 'Anime commands ki list dikhao', usage: '.animemenu',
  async handler(sock, message, args, context = {}) {
    const chatId = context.chatId || message.key.remoteJid;
    const info = animeInfo.map(c => '.' + c.command).join(', ');
    const lists = animeLists.map(c => '.' + c.command).join(', ');
    const gifs = animeGifs.map(c => '.' + c.command).join(', ');
    const text = fei.box('📖 ANIME MENU',
      '*Anime Info*\n' + info +
      '\n\n*Rankings & Random*\n' + lists +
      '\n\n*Anime GIFs*\n' + gifs +
      '');
    await sock.sendMessage(chatId, { text }, { quoted: message });
  }
};

module.exports = { commands: [animemenu, ...animeCommands] };
