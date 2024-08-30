const axios = require("axios")
const cheerio = require("cheerio")
const FormData = require("form-data")
const {
    Blob
} = require('formdata-node')
const {
    fileTypeFromBuffer
} = require('file-type')

async function instagram(url) {
    try {
        const indown = axios.create({
            baseURL: 'https://indown.io/',
            withCredentials: true,
        });

        const {
            data: html,
            headers
        } = await indown.get('/');
        const $ = cheerio.load(html);
        const token = $('input[name="_token"]').val();
        const cookies = headers['set-cookie'].join('; ');

        const {
            data: ip
        } = await axios.get('https://api.ipify.org');

        const formData = new FormData();
        formData.append('referer', 'https://indown.io/insta-stories-download');
        formData.append('locale', 'en');
        formData.append('p', ip);
        formData.append('_token', token);
        formData.append('link', url);

        const response = await indown.post('/download', formData, {
            headers: {
                'XSRF-TOKEN': token,
                ...formData.getHeaders(),
                'Cookie': cookies,
            },
        });

        const $result = cheerio.load(response.data);
        const videoLink = $result('.btn-group-vertical a').first().attr('href');

        if (videoLink) {
            const hasil = new URL(videoLink).searchParams.get('url');
            return [hasil];
        } else {
            const imageUrls = [];
            $result('.image-link img').each((index, element) => {
                const imgSrc = $(element).attr('src');
                if (imgSrc) {
                    imageUrls.push(imgSrc);
                }
            });
            return imageUrls;
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function tiktok(url) {
    try {
        const data = new URLSearchParams({
            'id': url,
            'locale': 'id',
            'tt': 'RFBiZ3Bi'
        });

        const headers = {
            'HX-Request': true,
            'HX-Trigger': '_gcaptcha_pt',
            'HX-Target': 'target',
            'HX-Current-URL': 'https://ssstik.io/id',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://ssstik.io/id'
        };

        const response = await axios.post('https://ssstik.io/abc?url=dl', data, {
            headers
        });
        const html = response.data;

        const $ = cheerio.load(html);

        const author = $('#avatarAndTextUsual h2').text().trim();
        const title = $('#avatarAndTextUsual p').text().trim();
        const video = $('.result_overlay_buttons a.download_link').attr('href');
        const audio = $('.result_overlay_buttons a.download_link.music').attr('href');
        const imgLinks = [];
        $('img[data-splide-lazy]').each((index, element) => {
            const imgLink = $(element).attr('data-splide-lazy');
            imgLinks.push(imgLink);
        });

        const result = {
            isSlide: video ? false : true,
            author,
            title,
            result: video || imgLinks,
            audio
        };
        return result
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function threads(url) {

    const regex = /post\/([^/?]+)/;
    const match = url.match(regex);
    const id = match ? match[1] : null;

    if (id) {
        let headers = {
            accept: "*/*"
        };

        let {
            data
        } = await axios.get(`https://threadster.app/download/${id}`, {
            headers
        });
        let $ = cheerio.load(data);
        const result = [];

        $('.download__items .image img').each((index, element) => {
            const imgUrl = $(element).attr('src');
            if (imgUrl) {
                result.push(imgUrl);
            } else {
                false
            }
        });

        $('.download__wrapper .download__items .download_item.active .video_wrapper .video video').each((index, element) => {
            const videoUrl = $(element).attr('src');
            if (videoUrl) {
                result.push(videoUrl);
            } else {
                false
            }
        });

        return {
            result
        }

    } else {
        return {
            msg: "koe pekok su ra enek id ne"
        }
    }

}

async function pinterest(url) {
try {
const urls = 'https://pinterestdownloader.io/frontendService/DownloaderService';
const params = {
  url
};

let { data } = await axios.get(urls, { params })
return data
} catch (e) {
return {msg: e}
}
}

async function soundcloud(url) {

    const csrf = await axios.get("https://soundcloudtool.com/").then(data => {
    const $ = cheerio.load(data.data);
    const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    return csrfToken
    })
    
    const formData = new URLSearchParams();
    formData.append('csrfmiddlewaretoken', csrf);
    formData.append('soundcloud', url); 

    try {
        
        const response = await axios.post('https://soundcloudtool.com/soundcloud-downloader-tool', formData, {
            headers: {
                'Referer': 'https://soundcloudtool.com/', 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        
        const $ = cheerio.load(response.data); 
        const trackLink = $('#trackLink');
        const title = trackLink.attr('data-filename');
        const link = trackLink.attr('href');
        
        return { title, link};
    } catch (error) {
        throw error;
    }
}

class SFile {
    constructor() {}

    async rndm(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    async sfileUpload(buffer, desc) {
        try {
            const { ext, mime } = await fileTypeFromBuffer(buffer);
            let form = new FormData();
            const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
            let name = await this.rndm(10) + ".";
            form.append('file1', blob, name + ext);
            form.append('des', desc);
            let res = await fetch('https://sfile.mobi/guest_remote_parser.php', {
                method: 'POST',
                headers: {
                    enctype: "multipart/form-data"
                },
                body: form
            });
            let img = await res.text();
            const $ = cheerio.load(img);
            const msg = $('.news').contents().first().text().trim();
            const url = $('.news a').first().attr('href');
            return {
                msg,
                url
            };
        } catch (e) {
            throw e;
        }
    }

    async sfileDownload(url) {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47",
            Referer: url,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        };
        try {
            const { data, headers: responseHeaders } = await axios.get(url, { headers: headers });
            const cookies = responseHeaders["set-cookie"]?.map(cookie => cookie.split(";")[0]).join("; ") || "";
            headers.Cookie = cookies;
            const filename = data.match(/<h1 class="intro">(.*?)<\/h1>/s)?.[1] || "unknown";
            const mimetype = data.match(/<div class="list">.*? - (.*?)<\/div>/)?.[1] || "";
            const downloadUrl = data.match(/<a class="w3-button w3-blue w3-round" id="download" href="([^"]+)"/)?.[1];
            headers.Referer = downloadUrl;
            if (!downloadUrl) return { status: false, message: "Download URL tidak ditemukan" };
            const { data: downloadPageData } = await axios.get(downloadUrl, { headers: headers });
            const finalDownloadUrl = downloadPageData.match(/<a class="w3-button w3-blue w3-round" id="download" href="([^"]+)"/)?.[1];
            const key = downloadPageData.match(/&k='\+(.*?)';/)?.[1].replace(`'`, "");
            const finalUrl = finalDownloadUrl + (key ? `&k=${key}` : "");
            const filesize = downloadPageData.match(/Download File \((.*?)\)/)?.[1];
            if (!finalUrl) return { status: false, message: "Download URL tidak ditemukan" };
            const { data: fileBuffer, headers: fileHeaders } = await axios.get(finalUrl, {
                responseType: "arraybuffer",
                headers: { ...headers, Referer: url }
            });
            const filenameFinal = fileHeaders["content-disposition"]?.match(/filename=["']?([^"';]+)["']?/)?.[1] || "unknown";
            const $ = cheerio.load(data);
            const description = $('span').text();
            return {
                status: true,
                data: {
                    filename: filenameFinal,
                    description,
                    filesize: filesize,
                    mimetype: mimetype || fileHeaders["content-type"],
                    buffer: fileBuffer
                }
            };
        } catch (err) {
            console.error("Error:", err);
            return { status: false, message: err.message || "Kesalahan tidak diketahui" };
        }
    }

    async search(query, page = 1) {
        let res = await fetch(`https://sfile.mobi/search.php?q=${query}&page=${page}`);
        let $ = cheerio.load(await res.text());
        let result = [];
        $('div.list').each(function () {
            let title = $(this).find('a').text();
            let size = $(this).text().trim().split('(')[1];
            let link = $(this).find('a').attr('href');
            if (link) result.push({ title, size: size.replace(')', ''), link });
        });
        return result;
    }
}

async function facebook(url) {
    try {
        // Prepare the request data
        const requestData = new URLSearchParams({
            id: url,
            locale: 'en'
        });

        // Make a POST request to the target URL
        const response = await axios.post('https://getmyfb.com/process', requestData, {
            headers: {
                'HX-Request': 'true',
                'HX-Trigger': 'form',
                'HX-Target': 'target',
                'HX-Current-URL': 'https://getmyfb.com/',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        });

        // Load the response data into cheerio for parsing
        let $ = cheerio.load(response.data)
      let urls = []

      $("ul > li").map((a, b) => {
         urls.push({ quality: $(b).text().trim(), url: $(b).find("a").attr("href") })
      })

      let result = {
         description: $("div.results-item > div.results-item-text").text().trim(),
         urls
      }

      if (urls.length == 0) return $("h4").text()

      return result
    } catch (error) {
        throw error
    }
}

async function tiktokSearch(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1
        }
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee]; 

        const result = {
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function mediafire(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const {
                data,
                status
            } = await axios.get(url)
            const $ = cheerio.load(data);
            let filename = $('.dl-info > div > div.filename').text();
            let filetype = $('.dl-info > div > div.filetype').text();
            let filesize = $('a#downloadButton').text().split("(")[1].split(")")[0];
            let uploadAt = $('ul.details > li:nth-child(2)').text().split(": ")[1];
            let link = $('#downloadButton').attr('href');
            let desc = $('div.description > p.description-subheading').text();
            if (typeof link === undefined) return resolve({
                status: false,
                msg: 'No result found'
            })
            let result = {
                status: true,
                filename: filename,
                filetype: filetype,
                filesize: filesize,
                uploadAt: uploadAt,
                link: link,
                desc: desc
            }
            console.log(result)
            resolve(result)
        } catch (err) {
            console.error(err)
            resolve({
                status: false,
                msg: 'No result found'
            })
        }
    })
}

async function xhs(url) {

    const instance = axios.create({
        baseURL: 'https://snapvideo.io',
        headers: {
            'Content-Type': 'ultipart/form-data'
        }
    });

    let form = new FormData();
    form.append('url', url);

    try {
        const response = await instance.post('/wp-json/aio-dl/video-data/', form);
        return response.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function douyin(url) {
  const config = {
    method: 'post',
    url: 'https://savetik.co/api/ajaxSearch',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': '*/*',
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: `q=${url}&lang=en`
  };

  try {
    const { data } = await axios(config);
    const $ = cheerio.load(data.data);
    let urls = [];
    let media;
    let result = {
     slide: false,
      status: 200,
      creator: 'tio',
      media: media
    };

    $('a:contains("Download Photo")').each((index, element) => {
      const url = $(element).attr('href');
      urls.push(url);
    });

    if (urls.length === 0) {
      media = {};
      media = {
        mp4_1: $('a:contains("Download MP4 [1]")').attr('href'),
        mp4_2: $('a:contains("Download MP4 [2]")').attr('href'),
        mp4_hd: $('a:contains("Download MP4 HD")').attr('href'),
        mp3: $('a:contains("Download MP3")').attr('href')
      };
     result.slide = false
      result.media = media;
    } else {
      result.slide = true
      result.media = urls;
    }

    return result;
  } catch (error) {
    console.error(error);
    return { status: 500, creator: 'tio', error: error.message };
  }
}

async function GDriveDl(url) {
	let id
	if (!(url && url.match(/drive\.google/i))) throw 'Invalid URL'
	id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
	if (!id) throw 'ID Not Found'
	let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
		method: 'post',
		headers: {
			'accept-encoding': 'gzip, deflate, br',
			'content-length': 0,
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
			'origin': 'https://drive.google.com',
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
			'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
			'x-drive-first-party': 'DriveWebUi',
			'x-json-requested': 'true' 
		}
	})
	let { fileName, sizeBytes, downloadUrl } =  JSON.parse((await res.text()).slice(4))
	if (!downloadUrl) throw 'Link Download Limit!'
	let data = await fetch(downloadUrl)
	if (data.status !== 200) throw data.statusText
	return { downloadUrl, fileName, fileSize: sizeBytes, mimetype: data.headers.get('content-type') }
}

module.exports = {
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
    GDriveDl,
};