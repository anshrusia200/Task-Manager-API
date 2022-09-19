const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "rusiaansh123@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, <strong> ${name} </strong>. Let me know how you get along with the app.`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "rusiaansh123@gmail.com",
    subject: "Account cancelled !",
    text: `Good Bye ${name}. Thanks for being a part of our organisation. Please let me know what could have I done to make your experience better and make you stay. Sorry to see you go and hope to see you again.`,
  });
};

const sendPasswordEmail = (email, name, link) => {
  sgMail.send({
    to: email,
    from: "rusiaansh123@gmail.com",
    subject: "Password Reset !",
    html: `<p style="font-size: 20px;">Hey <strong> ${name} </strong>, Your request for passoword reset is approved . Please click on the button to reset your password 👇: </p> <br> <a href="${link}"><button style="padding: 10px; background-color: #007bff;font-size: 20px;color: #fff; border-radius:10px;border:none;">Password Reset</button></a>`,
  });
};
module.exports = {
  sendWelcomeEmail, // sendWelcomeEmail : sendWelcomeEmail ko es6 shorthand se likha h
  sendCancelEmail,
  sendPasswordEmail,
};
