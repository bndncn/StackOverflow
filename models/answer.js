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
    question_id: { type: Schema.Types.ObjectId, ref: 'Question' },
    media: [String],
    vote_user_ids: {
        type: Map,
        of: {
            vote_type: Boolean,
            waive_penalty: Number
        }
    }
},
    {
        toJSON: {
            transform: function (doc, ret) {
                // console.log('deleting fields from Answer');
                ret.id = ret._id;
                delete ret._id;
                delete ret.user_id;
                delete ret.__v;
                delete ret.question_id;
                delete ret.vote_user_ids;
            }
        }
    }
);

module.exports = mongoose.model('Answer', answerSchema);