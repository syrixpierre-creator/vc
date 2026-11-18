let p = 'ffmpeg';
try {
  p = require('ffmpeg-static') || 'ffmpeg';
} catch (_) {
  try {
    p = require('@ffmpeg-installer/ffmpeg').path || 'ffmpeg';
  } catch (_) {}
}
module.exports = p;
