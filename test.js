const axios = require('axios');
const URL = 'https://broadcast.adpronet.com/radio/8010/radio.mp3'

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
                    const str = Buffer.from(chunk).toString();
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