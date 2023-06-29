const axios = require('axios');
let URL = 'https://cdn.cybercdn.live/Radio2000/MP3/icecast.audio'
URL = "https://broadcast.adpronet.com/radio/8010/radio.mp3"

const detectCharacterEncoding = require('detect-character-encoding');

async function getInfo(URL) {
    return new Promise((resolve1, reject1) => {
        const responsePayload = {
            url: URL,
            ok: false,
            data: ""
        }

        function streamToString(stream) {
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => {
                    const charsetMatch = detectCharacterEncoding(chunk);
                    let str = "";
                    if (charsetMatch.encoding == 'UTF-8'){
                        str = Buffer.from(chunk).toString();
                    }
                    else if (charsetMatch.encoding.indexOf("ISO-8859-8")>-1){
                        var Iconv  = require('iconv').Iconv;
                        var Buffer2 = require('buffer').Buffer;
                        var tempBuffer = new Buffer2(chunk, 'iso-8859-8');
                        var iconv = new Iconv('ISO-8859-8', 'UTF-8');
                        var tempBuffer = iconv.convert(tempBuffer);
                        str =  Buffer.from(tempBuffer).toString();
                    }
                    const idx = str.indexOf(needle);
                    if (idx > -1) {
                        let data = str.substring(idx + needle.length);
                        responsePayload.data = data.substring(0, data.indexOf(";")).replace(/['"]/g, "");
                        responsePayload.ok = true;
                        responsePayload.charSet = charsetMatch;
                        source.cancel('Kill Request!');
                    }
                });
                stream.on('error', (err) => reject(err));
                stream.on('end', () => resolve(""));
            })
        }

        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        const needle = 'StreamTitle=';

        axios.head(
            URL, {
            headers: {
                'User-Agent': 'Dailymate Radio/1.0',
                'Icy-MetaData': '1',
            },
        })
        .then(async (response) => {
            if (!response.headers['icy-metaint']) {
                return;
            }

            axios.get(
                URL, {
                responseType: "stream",
                headers: {
                    'User-Agent': 'Dailymate Radio/1.0',
                    'Icy-MetaData': '1',
                    "maxContentLength": response.headers['icy-metaint']
                },
                cancelToken: source.token
            })
            .then(async (response2) => {
                await streamToString(response2.data)
            })
            .catch(error => {
                // console.log(responsePayload);
                resolve1(responsePayload)
            });
        })

    })
        ;

}

async function main() {
    console.time("1")
    data = await getInfo(URL);
    console.log(data);
    console.timeEnd("1")
}

main()