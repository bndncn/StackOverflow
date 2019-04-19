const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    _id: Schema.Types.ObjectId,
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    body: String,
    score: Number,
    view_count: Number,
    view_user_id: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    view_IP: [String],
    answer_count: Number,
    timestamp: Number,
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }], 
    tags: [String],
    accepted_answer_id: { type: Schema.Types.ObjectId, ref: 'Answer', default: null },
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    answers_user_ids: [{ type: Schema.Types.ObjectId, ref: 'User' }]
},
    {
        toJSON: {
            transform: function (doc, ret) {
                console.log('deleting fields from Question');
                ret.id = ret._id;
                ret.user = ret.user_id;
                ret.answer_count = ret.answers.length;
                delete ret.answers;
                delete ret.answers_user_ids;
                delete ret.view_IP;
                delete ret.view_user_id;
                delete ret._id;
                delete ret.user_id;
                delete ret.__v;
            }
        }
    }
);

module.exports = mongoose.model('Question', questionSchema);
