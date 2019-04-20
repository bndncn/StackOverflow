const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const mediaSchema = new Schema({
    _id: Schema.Types.ObjectId,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    mimetype: String,
    used: Boolean,
    content: Buffer
});

module.exports = mongoose.model('Media', mediaSchema);
