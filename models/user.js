var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: Schema.Types.ObjectId,
    username: String,
    hash: String,
    email: String,
    key: String,
    verified: Boolean,
    reputation: Number,
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }]
},
    {
        toJSON: {
            transform: function (doc, ret) {
                // console.log('deleting fields from User');
                delete ret._id;
                delete ret.username;
                delete ret.hash;
                /* keep email */
                delete ret.key;
                delete ret.verified;
                /* keep reputation */
                delete ret.questions;
                delete ret.answers;
                delete ret.__v;
            }
        }
    }
);

module.exports = mongoose.model('User', UserSchema); 