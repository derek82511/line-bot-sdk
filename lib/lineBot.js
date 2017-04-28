var util = require('util');
var events = require('events');
var crypto = require('crypto');

var co = require('co');
var axios = require('axios');

var _baseUrl = 'https://api.line.me';

function LineBot(options) {
    this._textRegexpCallbacks = [];

    this.getChannelName = options.getChannelName;
    this.getToken = options.getToken;
    this.getSecret = options.getSecret;

    this.verifySignature = options.verifySignature;
}

util.inherits(LineBot, events.EventEmitter);

LineBot.prototype.onText = function (regexp, callback) {
    this._textRegexpCallbacks.push({
        regexp: regexp,
        callback: callback
    });
};

LineBot.prototype._request = function (channelName, method, path, payload, type) {
    var self = this;

    return new Promise(function (resolve, reject) {
        co(function* () {
            var token = yield self.getToken(channelName);

            var opts = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                url: _baseUrl + path,
                data: payload || {}
            };

            if (type === 'content') opts.responseType = 'arraybuffer';

            try {
                var response = yield axios(opts);

                resolve(response.data);
            } catch (error) {
                reject(error.response.data);
            }
        }).catch((err) => {
            reject(err);
        });
    });
};

LineBot.prototype.processEvents = function (events, req) {
    var self = this;

    setTimeout(function () {
        self.emit('events', events, req);
        events.forEach(function (event) {
            event.channelName = events.channelName;
            self.parseEvent.bind(self)(event);
        });
    });
};

LineBot.prototype.parseEvent = function (event) {
    var type = event.source.type;

    this.emit('event', event);
    this.emit('event:' + type, event);

    event.type = event.type || '';

    switch (event.type) {
        case 'message':
            this.emit('message', event);
            this.emit('message:' + type, event);

            if (event.message.type === 'text' && event.message.text) {
                this.emit('text', event);
                this.emit('text:' + type, event);
                this._textRegexpCallbacks.forEach(function (rgx) {
                    var result = rgx.regexp.exec(event.message.text);
                    if (result) rgx.callback(event, result);
                });
            } else {
                if (event.message.type === 'audio' || event.message.type === 'video' || event.message.type === 'image') {
                    this.emit('message-with-content');
                    this.emit('message-with-content:' + type, event);
                }
                this.emit('non-text', event);
                this.emit('non-text:' + type, event);
                this.emit(event.message.type, event);
            }

            break;
        case 'follow':
            this.emit('follow', event);
            this.emit('follow:' + type, event);

            break;
        case 'unfollow':
            this.emit('unfollow', event);
            this.emit('unfollow:' + type, event);

            break;
        case 'join':
            this.emit('join', event);
            this.emit('join:' + type, event);

            break;
        case 'leave':
            this.emit('leave', event);
            this.emit('leave:' + type, event);

            break;
        case 'postback':
            this.emit('postback', event);
            this.emit('postback:' + type, event);

            break;
        case 'beacon':
            this.emit('beacon', event);
            this.emit('beacon:' + type, event);

            break;
        default:
            break;
    }
};

LineBot.prototype.pushMessage = function (channelName, channel, messages) {
    var pushEndpoint = '/v2/bot/message/push';

    messages = Array.isArray(messages) ? messages : [messages];

    if (messages.length < 1 || messages.length > 5) return Promise.reject('Invalid messages length');

    var payload = {
        to: channel,
        messages: messages
    };

    return this._request(channelName, 'post', pushEndpoint, payload);
};

LineBot.prototype.multicast = function (channelName, channels, messages) {
    var multicastEndpoint = '/v2/bot/message/multicast';

    if (!channels) return Promise.reject('no channels');
    if (!messages) return Promise.reject('no messages');

    messages = Array.isArray(messages) ? messages : [messages];
    channels = Array.isArray(channels) ? channels : [channels];

    if (messages.length < 1 || messages.length > 5) return Promise.reject('Invalid messages length');
    if (channels.length < 1 || channels.length > 150) return Promise.reject('Invalid channels length');

    var payload = {
        to: channels,
        messages: messages
    };

    return this._request(channelName, 'post', multicastEndpoint, payload);
};

LineBot.prototype.replyMessage = function (channelName, replyToken, messages) {
    var replyEndpoint = '/v2/bot/message/reply';

    messages = Array.isArray(messages) ? messages : [messages];

    if (messages.length < 1 || messages.length > 5) return Promise.reject('Invalid messages length');

    var payload = {
        replyToken: replyToken,
        messages: messages
    };

    return this._request(channelName, 'post', replyEndpoint, payload);
};

LineBot.prototype.getContent = function (channelName, messageId) {
    if (!messageId || typeof messageId !== 'string') return Promise.reject('No messageId');

    var contentEndpoint = '/v2/bot/message/' + messageId + '/content';

    return this._request(channelName, 'get', contentEndpoint, null, 'content');
};

LineBot.prototype.getProfile = function (channelName, userId) {
    if (!userId || typeof userId !== 'string') return Promise.reject('No userId');

    var profileEndpoint = '/v2/bot/profile/' + userId;

    return this._request(channelName, 'get', profileEndpoint, null);
};

LineBot.prototype.leaveChannel = function (channelName, channel) {
    var channelId = channel && (channel.groupId || channel.roomId);

    if (!channelId) return Promise.reject('No channelId');

    var leaveEndpoint = channel.groupId ? '/v2/bot/group/' + channel + '/leave' : '/v2/bot/room/' + channel + '/leave';

    return this._request(channelName, 'post', leaveEndpoint, null);
};

LineBot.prototype.expressLine = function () {
    var self = this;

    var _getSignature = function (secret, buf) {
        return crypto.createHmac('sha256', secret).update(buf, 'utf-8').digest('base64');
    };

    return function (req, res, next) {
        co(function* () {
            var channelName = yield self.getChannelName(req);

            if (self.verifySignature) {
                var lineHeaderName = 'X-Line-Signature';
                var lineHeader = lineHeaderName.toLowerCase();
                var expected = req.headers[lineHeader];

                var secret = yield self.getSecret(channelName);
                var rawBody = JSON.stringify(req.body);

                var calculated = _getSignature(secret, rawBody);

                if (expected !== calculated) {
                    return res.status(400).send({ error: 'Invalid signature' });
                }
            }

            var events = req.body && req.body.events;

            if (events) {
                events.channelName = channelName;

                res.status(200).send('OK');
                self.processEvents(events, req);
            } else {
                console.log('events not found');
                res.status(400).send({ error: 'events not found' });
            }
        }).catch((err) => {
            console.log(err);
            res.status(400).send({ error: err.message });
        });
    };
};

module.exports = LineBot;