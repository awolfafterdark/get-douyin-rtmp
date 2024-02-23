const AnyProxy = require("anyproxy");
const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");
const os = require("os");

const PROXY_PORT = process.env.PROXY_PORT || 7982;

const rtmpConfigPath = path.join(os.homedir(), "live.txt");

function enableProxy() {
   return AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
     "127.0.0.1",
     PROXY_PORT
   );
}

function disableProxy() {
   return AnyProxy.utils.systemProxyMgr.disableGlobalProxy();
}

function installCA() {
   return new Promise((resolve, reject) => {
     if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
       AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
         if (!error) {
           const cwd = path.dirname(keyPath);
           console.clear();
           console.log(`
   1. Click [Install Certificate]
   2. Select [Local Computer] and click Next
   3. Select [Put all certificates into the following storage (P)] -> Click [Browse]
   4. Select the second [Trusted Root Certification Authority] -> click [OK] -> select [Next]
   5. Select [Finish] -> click [OK] -> click [OK]
   Please enter Enter after completing the above steps!
           `);
           exec("start rootCA.crt", { cwd });
           process.stdin.once("data", resolve);
         } else {
           console.error("Error generating certificate");
           reject(error);
         }
       });
     } else {
       resolve("Installed");
     }
   });
}

installCA().then(() => {
   console.clear();
   enableProxy();
   const rule = {
     summary: "Detection of Douyin anchor partner starting broadcast",
     async beforeSendResponse(req, res) {
       if (req.url.includes("https://webcast.amemv.com/webcast/room/create/")) {
         const body = JSON.parse(res.response.body);
         const baseUrl = body.data.stream_url.rtmp_push_url;
         const rtmpSecret = baseUrl.split("/").pop();
         const rtmpServer = baseUrl.split(rtmpSecret)[0];
         console.clear();
         const content = `
   Server: ${rtmpServer}
Streaming secret: ${rtmpSecret}
         `;
         fs.writeFileSync(rtmpConfigPath, content, {
           encoding: "utf8",
         });

         //Open notepad for convenience
         exec(`start ${rtmpConfigPath}`);

         console.log(`
${content}
         [After entering the server and streaming keys in OBS and applying the settings, please enter below and press Enter]
         `);

         process.stdin.once("data", () => {
           exec("taskkill /f /t /im live streaming companion.exe", () => {});
           console.log(`Please click [Start streaming] in OBS`);
           disableProxy();
           if (fs.existsSync(rtmpConfigPath)) {
             fs.rmSync(rtmpConfigPath);
           }
           console.log(`Completed, press any key to exit the software!`);
           process.stdin.once("data", () => {
             process.exit(0);
           });
         });
       }
       return null;
     },
   };
   const options = {
     rule,
     port: PROXY_PORT,
     silent: true,
     webInterface: {
       enable: false,
     },
     forceProxyHttps: true,
     dangerouslyIgnoreUnauthorized: true,
   };

   const proxyServer = new AnyProxy.ProxyServer(options);

   proxyServer.on("ready", () => {
     console.log("The software is ready, please start [Live Broadcast Companion] and click [Start Live Broadcast]");
   });

   proxyServer.start();
});
