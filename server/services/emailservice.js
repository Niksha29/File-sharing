import nodemailer from 'nodemailer';

async function sendMail({ from, to, subject, text, html }) {
    // Create a nodemailer transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // SMTP host from environment variables
        port: process.env.SMTP_PORT, // SMTP port from environment variables
        secure: false, // Use TLS if true, otherwise false (typically port 465 for true, 587 for false)
        auth: {
            user: process.env.MAIL_USER, // Your email user credentials
            pass: process.env.MAIL_PASS  // Your email password
        }
    });

    try {
        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from,     // Sender address
            to,       // List of receivers
            subject,  // Subject line
            text,     // Plain text body
            html      // HTML body
        });

        console.log('Message sent: %s', info.messageId);  // Log the result

    } catch (error) {
        console.error('Error sending email:', error);  // Log any error encountered
    }
}

export default sendMail;
