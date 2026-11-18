/* QUEEN AKUMA legacy plugin (family A) — converted automatically */
const fetch = ((__i)=>__i&&__i.default?__i.default:__i)(require('node-fetch'));

var handler = async (m, { conn, text }) => {
    if (!text) throw `*Masukan Judul Anime That Ingin You Cari !*`;

    let res = await fetch('https://api.jikan.moe/v4/anime?q=' + text);

    if (!res.ok) throw 'Not found';

    let json = await res.json();
    let animeData = json.data[0];

    if (!animeData) throw 'Anime not found.';

    let {
        title_japanese,
        url,
        type,
        score,
        members,
        status,
        synopsis,
        favorites,
        images,
        genres,
    } = animeData;

    let genreList = genres.map((genre) => genre.name).join(', ');

    let animeingfo = `
Title: ${title_japanese}
Type: ${type}
Genres: ${genreList}
Score: ${score}
Members: ${members}
Status: ${status}
Favorites: ${favorites}
URL: ${url}
Synopsis: ${synopsis}
`;

    conn.sendFile(m.chat, images.jpg.image_url, 'anjime.jpg', `*ANIME INFO*\n` + animeingfo, m);
};

handler.help = ['animeinfo <anime>'];
handler.tags = ['internet'];
handler.command = /^(animeinfo)$/i;

handler.register = true
module.exports = handler
