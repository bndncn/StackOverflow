const sendmail = require('sendmail')();

function emailKey(email, key) {
    console.log('in func emailKey');
    const htmlBody = 'validation key: <' + key + '>';
    console.log(email);
    sendmail({
	from: 'ubuntu@cse356.compas.cs.stonybrook.edu',
        to: email,
        subject: 'Please verify your account',
        html: htmlBody
    }, function (err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
};

module.exports.emailKey = emailKey;