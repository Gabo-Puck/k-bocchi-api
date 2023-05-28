const nodemailer = require("nodemailer");
nodemailer.createTestAccount()
const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:"kbocchi.email.system@gmail.com",
        pass:"tlibesxyjdouxkrw"
    },
    tls:{
        rejectUnauthorized: false
    },
    connectionTimeout:9000,
})

module.exports = {
    transporter
}