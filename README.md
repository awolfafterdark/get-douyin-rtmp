#get-douyin-rtmp🔐
Douyin [Live Companion] Push Streaming Key Obtaining Tool

### General idea
Obtain the rtmp address returned from broadcasting through a middleman agent

### Implementation process
1. User installs CA certificate
2. Start the proxy server
3. Broadcasting detected
4. Parse and get the RTMP address
5. Force the end of the live broadcast companion (cannot click to disconnect)
6. OBS intervenes in streaming
7. Turn off the proxy server
8. Exit this process

## Precautions
To turn off the live broadcast, please run the live broadcast companion again, click Continue live broadcast and then close the live broadcast. Otherwise, even if the stream is not pushed, it will not be downloaded immediately (I am too lazy to write down the broadcast)

### grateful
- [anyproxy](https://github.com/alibaba/anyproxy)
- [nexe](https://github.com/nexe/nexe)
