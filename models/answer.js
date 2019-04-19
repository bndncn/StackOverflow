const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answerSchema = new Schema({
    _id: Schema.Types.ObjectId,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    user: String,
    body: String,
    score: Number,
    is_accepted: Boolean,
    timestamp: Number,
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }]
},
    {
        toJSON: {
            transform: function (doc, ret) {
                console.log('deleting fields from Answer');
                ret.id = ret._id;
                delete ret._id;
                delete ret.user_id;
                delete ret.__v;
            }
        }
    }
);

module.exports = mongoose.model('Answer', answerSchema);
