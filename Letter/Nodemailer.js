const nodemailer = require('nodemailer');

const config = require('../../config').letters.email;

const transporter = nodemailer.createTransport(
    {
        host: config.smtp,
        secure: true,
        auth: {
            user: config.user,
            pass: config.pswd,
        },
        tls: {
            rejectUnauthorized: false,
        },
    },
);

/**
 * Class for send email with nodemailer.
 */

class Nodemailer {
    constructor() {
        this.user = null;
        this.msg = '';
        this.file = null;
        this.subject = null;
    }

    setUser(user) {
        this.user = user;
    }

    setMsg(msg) {
        this.msg = msg;
    }

    setSubject(subject) {
        this.subject = subject;
    }

    setFile(file) {
        this.file = file;
    }

    send() {
        return new Promise((resolve, reject) => {
            const params = {
                from: config.from,
                to: this.user,
                subject: this.subject,
                html: this.msg,
                attachments: this.file,
            };
            transporter.sendMail(params, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('Email has been sending');
                }
            });
        });
    }
}

module.exports = Nodemailer;
