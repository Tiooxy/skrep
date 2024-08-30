const {
    instagram,
    tiktok,
    threads,
    pinterest,
    soundcloud,
    SFile,
    facebook,
    tiktokSearch,
    mediafire,
    xhs,
    douyin,
    GDriveDl
} = require('./library/downloader');

const {
openai,
blackbox
} = require('./library/ai');

module.exports = {
downloader: {
instagram,
    tiktok,
    threads,
    pinterest,
    soundcloud,
    SFile,
    facebook,
    tiktokSearch,
    mediafire,
    xhs,
    douyin,
    GDriveDl
    },
ai: {
openai,
blackbox
 }
}