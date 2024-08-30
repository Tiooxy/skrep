const axios = require("axios")
const cheerio = require("cheerio")

const IP = () => {
    const octet = () => Math.floor(Math.random() * 256);
    return `${octet()}.${octet()}.${octet()}.${octet()}`;
};

async function openai(text) {
    try {
        const {
            data: res
        } = await axios.post("https://chatgpt4online.org/wp-json/mwai/v1/start_session", {}, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                "x-forwarded-for": await IP(),
                "X-Real-IP": await IP()
            }
        });

        const url = 'https://chatgpt4online.org/wp-json/mwai-ui/v1/chats/submit';
        const data = {
            botId: "chatbot-qm966k",
            customId: null,
            session: "N/A",
            messages: [{
                role: "user",
                content: text
            }],
            newMessage: text,
            stream: false
        };

        const headers = {
            'Content-Type': 'application/json',
            'X-WP-Nonce': res.restNonce,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            "x-forwarded-for": await IP(),
            "X-Real-IP": await IP(),
            'Referer': 'https://chatgpt4online.org/'
        };

        // Send chat message
        const response = await axios.post(url, data, {
            headers: headers
        });

        if (response.status === 200) {
            return response.data.reply;
        } else {
            throw response.statusText;
        }
    } catch (error) {
        throw error;
    }
}

async function blackbox(teks, agent) {
    try {
           let userId, id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

        
        let json = {
            "messages": [{
                "id": id,
                "content": teks,
                "role": "user"
            }],
            "id": id,
            "previewToken": null,
            "userId": userId,
            "codeModelMode": true,
            "agentMode": {
                "mode": true,
                "id": agent || "tioYvlHC5x"
            },
            "trendingAgentMode": {},
            "isMicMode": false,
            "isChromeExt": false,
            "githubToken": null
        }

        let { data } = await axios.post('https://www.blackbox.ai/api/chat', json);
        let result = data.replace(/\$\@\$\w+=\S+\$/g, '');
        return result;
    } catch (e) {
        return e;
    }
}

module.exports = {
openai,
blackbox
}