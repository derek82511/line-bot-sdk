# line-bot-sdk

Line Messaging API SDK for Node.js based on [Muhammad Mustadi](https://mustadi.xyz) node-line-messaging-api.

## Features
* Line Messaging API 封裝
* Message Builder
* Express Line Middleware
* 以設定 Promise 的方式彈性設定如何取得 Channel 相關參數 (Token, Secret)

## Installation

```sh
$ npm install https://github.com/derek82511/line-bot-sdk.git
```

## Usage

- 設定 lineBot 物件
```js
const lineBot = new LineBot({
    getChannelName: (req) => {
        //設定如何由 req 取得 line channelName
        return Promise.resolve(req.params.channelName);
    },
    getToken: (channelName) => {
        //設定如何由 channelName 取得 token
        return new Promise((resolve, reject) => {
             //todo ...
             resolve('your token');
             
             //error
             //reject(Error);
        });
    },
    getSecret: (channelName) => {
        //設定如何由 channelName 取得 secret
        return new Promise((resolve, reject) => {
            //todo ...
            resolve('your secret');
            
            //error
            //reject(Error);
        });
    },
    verifySignature: true
});
```
* 使用 Express Middleware 設定 Webhook
```js
app.post('/line/webhook/:channelName', lineBot.expressLine());
```

* 使用 lineBot 物件 Handle 事件
```js
lineBot.on('follow', event => {
    const { channelName, replyToken } = event;
    //...
});

lineBot.on('message', event => {
    const { channelName, replyToken, message } = event;
    //...
});
```
* Event Type
  * message
  * follow
  * unfollow
  * join
  * leave
  * postback
  * beacon

* 使用 lineBot 物件對 Line 發送 Message
```js
//reply
const replyMessages = new MessageBuilder()
    .addText('your reply message')
    .addText('your reply message')
    .build();

lineBot.replyMessage(channelName, replyToken, replyMessages).then(data => {
    console.log(data);
}, err => {
    console.log(err);
});

//push
const pushMessages = new MessageBuilder()
    .addText('your push message')
    .addText('your push message')
    .build();

lineBot.pushMessage(channelName, 'channelId or userId', pushMessages).then(data => {
    console.log(data);
}, err => {
    console.log(err);
});
```

* Message Builder API
  * addText
  * addImage
  * addVideo
  * addAudio
  * addLocation
  * addSticker
  * addButtons
  * addConfirm
  * addCarousel
  * build

## References
* LINE Bot API Docs <https://devdocs.line.me/>

## License
The MIT License (MIT)

Copyright &copy; 2016 [Muhammad Mustadi](https://mustadi.xyz)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

MIT License

Copyright (c) 2017 Chang, Cheng-Yi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
