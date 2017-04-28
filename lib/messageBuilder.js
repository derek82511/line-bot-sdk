function MessageBuilder() {
    this._payload = [];
}

MessageBuilder.prototype.addRaw = function (message) {
    if (this._payload.length === 5) {
        console.error('Maximum message count is 5');
        return this;
    }

    if (!message || typeof message !== 'object') {
        console.error('Message format is wrong');
        return this;
    }

    this._payload.push(message);

    return this;
};

MessageBuilder.prototype.addText = function (message) {
    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (!message) {
        console.error('Message format is wrong');
        return this;
    }

    this._payload.push({
        type: 'text',
        text: message.text || message || ''
    });

    return this;
};

MessageBuilder.prototype.addImage = function (options) {
    var originalUrl = options.originalUrl,
        previewUrl = options.previewUrl;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof originalUrl !== 'string' || typeof previewUrl !== 'string') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'image',
        originalContentUrl: originalUrl,
        previewImageUrl: previewUrl
    });

    return this;
};

MessageBuilder.prototype.addVideo = function (options) {
    var originalUrl = options.originalUrl,
        previewUrl = options.previewUrl;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof originalUrl !== 'string' || typeof previewUrl !== 'string') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'video',
        originalContentUrl: originalUrl,
        previewImageUrl: previewUrl
    });

    return this;
};

MessageBuilder.prototype.addAudio = function (options) {
    var originalUrl = options.originalUrl,
        duration = options.duration;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof originalUrl !== 'string' || typeof duration !== 'number') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'audio',
        originalContentUrl: originalUrl,
        duration: duration
    });

    return this;
};

MessageBuilder.prototype.addLocation = function (options) {
    var title = options.title,
        address = options.address,
        latitude = options.latitude,
        longitude = options.longitude;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof title !== 'string' || typeof address !== 'string' || typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'location',
        title: title,
        address: address,
        latitude: latitude,
        longitude: longitude
    });

    return this;
};

MessageBuilder.prototype.addSticker = function (options) {
    var packageId = options.packageId,
        stickerId = options.stickerId;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof packageId !== 'number' || typeof stickerId !== 'number') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'sticker',
        packageId: packageId,
        stickerId: stickerId
    });

    return this;
};

MessageBuilder.prototype.addButtons = function (options) {
    var thumbnailImageUrl = options.thumbnailImageUrl,
        altText = options.altText,
        title = options.title,
        text = options.text,
        actions = options.actions;

    if (!altText) {
        console.error('altText is empty');
        return this;
    }

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    if (typeof text !== 'string') {
        console.error('Type is Wrong');
        return this;
    }

    this._payload.push({
        type: 'template',
        altText: altText,
        template: {
            type: 'buttons',
            thumbnailImageUrl: thumbnailImageUrl,
            title: title && title.slice(0, 39),
            text: title ? text.slice(0, 59) : text.slice(0, 159),
            actions: actions
        }
    });

    return this;
};

MessageBuilder.prototype.addConfirm = function (options) {
    var altText = options.altText,
        text = options.text,
        actions = options.actions;

    if (this._payload.length === 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    this._payload.push({
        type: 'template',
        altText: altText,
        template: {
            type: 'confirm',
            text: text.slice(0, 239),
            actions: actions
        }
    });

    return this;
};

MessageBuilder.prototype.addCarousel = function (options) {
    var altText = options.altText,
        columns = options.columns;

    if (!altText) {
        console.error('altText is empty');
        return this;
    }

    if (this._payload.length >= 5) {
        console.error('Maximum payload count is 5');
        return this;
    }

    this._payload.push({
        type: 'template',
        altText: altText,
        template: {
            type: 'carousel',
            columns: columns.slice(0, 4).map(function (col) {
                return ({
                    thumbnailImageUrl: col.thumbnailImageUrl,
                    title: col.title,
                    text: col.text,
                    actions: col.actions
                });
            })
        }
    });

    return this;
};

MessageBuilder.prototype.build = function () {
    return this._payload;
};

module.exports = MessageBuilder;