const nodemailer = require('nodemailer');
require('dotenv').config();

// imports
const { readHTMLcontent } = require('../utils/readHTMLcontent');

const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
}

const generateEmailBody = async (product, type) => {
    const THRESHOLD_PERCENTAGE = 40;

    const shortenedTitle = product.title.length > 20 ? `${product.title.substring(0, 20)}...` : product.title;

    // read HTML content
    let welcomeContent = await readHTMLcontent('./lib/nodemailer/html_content/welcome_mail.html');

    // html content passing
    welcomeContent = welcomeContent.replace(/{{PRODUCT_TITLE}}/g, product.title);
    welcomeContent = welcomeContent.replace(/{{PRODUCT_IMG}}/g, product.image);
    welcomeContent = welcomeContent.replace(/{{PRODUCT_URL}}/g, product.url);

    console.log(welcomeContent);

    let subject = "";
    let body = "";

    switch (type) {
        case Notification.WELCOME:
            subject = `Welcome to Price Tracking for ${shortenedTitle}`;
            body = welcomeContent;
          break;

        case Notification.CHANGE_OF_STOCK:
            subject = `${shortenedTitle} is now back in stock!`;
            body = `<div>
            <h4>Hey, ${product.title} is now restocked! Grab yours before they run out again!</h4>
            <p>See the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
          </div>`;
          break;

        case Notification.LOWEST_PRICE:
            subject = `Lowest Price Alert for ${shortenedTitle}`;
            body = `
              <div>
                <h4>Hey, ${product.title} has reached its lowest price ever!!</h4>
                <p>Grab the product <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a> now.</p>
              </div>`;
            break;
        
        case Notification.THRESHOLD_MET:
            subject = `Discount Alert for ${shortenedTitle}`;
            body = `
                <div>
                    <h4>Hey, ${product.title} is now available at a discount more than ${THRESHOLD_PERCENTAGE}%!</h4>
                    <p>Grab it right away from <a href="${product.url}" target="_blank" rel="noopener noreferrer">here</a>.</p>
                </div>`;
            break;
    
        default:
            throw new Error("Invalid notification type.");
    }

    return {subject, body};
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'ibrahimrasithbusiness@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1
});

const sendEmail = async (emailContent, sendTo) => {

    const mailOptions = {
        from: 'ibrahimrasithbusiness@gmail.com',
        to: sendTo,
        html: emailContent.body,
        subject: emailContent.subject,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) return console.log(error);
        console.log('Email sent:', info);
    })

}

module.exports = {
    generateEmailBody,
    sendEmail,
}