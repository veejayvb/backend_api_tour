const nodemailer = require('nodemailer')

const sendEmail = async options => {
    //1) create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth : {
            user:process.env.EMAIL_USERNAME , 
            pass : process.env.EMAIL_PASSWORD
        }
    })

    //2.mail options
    const mailOptions = {
        from : "vijaybalaji <realadmin1@gmail.com>",
        to : options.email,
        subject : options.email,
        message: options.email,
        ContentType : options.email
    }

    //3.send the mail

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail