const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      res.clearCookie("jwt");
      return res.render("login", {
        success_message: req.flash("success_message") || "",
        error_message: req.flash("error_message") || "",
      });
    }
    req.token = token;
    req.user = user;
    return next();
  } catch (e) {
    console.log(e);
    res.clearCookie("jwt");
    res.render("index");
  }
};
module.exports = auth;
