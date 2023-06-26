const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const axios = require('axios');

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
                resolve1(responsePayload)
            });
        })

    })
        ;

}


app.get("/", async (req, res) => {
  let url = req.query.url;
  if (url){
    let data = await getInfo(url);
    res.json(data);
  }
  else {
    res.type('html').send(html);
  }
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`
