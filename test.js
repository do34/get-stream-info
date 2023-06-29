const axios = require('axios');
let URL = 'https://cdn.cybercdn.live/Radio2000/MP3/icecast.audio'
// URL = "https://broadcast.adpronet.com/radio/8010/radio.mp3"

const detectCharacterEncoding = require('detect-character-encoding');
var Iconv = require('iconv').Iconv;
var Buffer2 = require('buffer').Buffer;


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
                    let str = Buffer.from(chunk).toString();
                    const charsetMatch = detectCharacterEncoding(chunk);
                    try {
                      const automaticEnc = ["UTF-16BE",'UTF-8']
                      if (charsetMatch && automaticEnc.indexOf(charsetMatch.encoding) < 0) {
                        responsePayload.charSet = charsetMatch;
                        if (charsetMatch.encoding.indexOf("ISO-8859") > -1) {
                          console.log("decoding ISO-8859-1")
                          var tempBuffer = new Buffer2.from(chunk, 'iso-8859-8');
                          var iconv = new Iconv('ISO-8859-8', 'UTF-8');
                          var tempBuffer = iconv.convert(tempBuffer);
                          str = Buffer.from(tempBuffer).toString();
                        }
                        // else if (charsetMatch.encoding.indexOf("ISO-8859-1") > -1) {
                        //     console.log("decoding ISO-8859-1")
                        //   var tempBuffer = new Buffer2.from(chunk, 'iso-8859-1');
                        //   var iconv = new Iconv('ISO-8859-1', 'UTF-8');
                        //   var tempBuffer = iconv.convert(tempBuffer);
                        //   str = Buffer.from(tempBuffer).toString();
                        // }
                        else if (charsetMatch.encoding.indexOf("1255") > -1) {
                          var tempBuffer = new Buffer2.from(chunk, 'CP1255');
                          var iconv = new Iconv('CP1255', 'UTF-8');
                          var tempBuffer = iconv.convert(tempBuffer);
                          str = Buffer.from(tempBuffer).toString();
                        }
                      }
                    }
                    catch (e) {
                        console.log(e)
                      str = Buffer.from(chunk).toString();
                      responsePayload.charSet = charsetMatch ? charsetMatch.encoding : "unknown";
                      responsePayload.error = JSON.stringify(e);
                    }

                    const idx = str.indexOf(needle);
                    if (idx > -1) {
                        let data = str.substring(idx + needle.length);
                        responsePayload.data = data.substring(0, data.indexOf(";")).replace(/['"]/g, "");
                        responsePayload.ok = true;
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