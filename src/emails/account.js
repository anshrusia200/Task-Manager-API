const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "rusiaansh123@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
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

module.exports = {
  sendWelcomeEmail, // sendWelcomeEmail : sendWelcomeEmail ko es6 shorthand se likha h
  sendCancelEmail,
};
