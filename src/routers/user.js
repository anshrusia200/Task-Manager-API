const express = require("express");
const User = require("../models/user");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const {
  sendWelcomeEmail,
  sendCancelEmail,
  sendPasswordEmail,
} = require("../emails/account");
const sharp = require("sharp");
const validator = require("email-validator");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  if (!req.user) {
    return res.render("index");
  }
  const tasks = await Task.find({ userId: req.user.userId });

  return res.render("tasks_login", {
    user: req.user,
    success_message: "",
    error_message: "",
    tasks,
  });
});

router.get("/loggedout", async (req, res) => {
  res.render("index_logout", { success_message: req.flash("success_message") });
});
router.get("/about", async (req, res) => {
  res.render("about");
});
router.get("/users", auth, async (req, res) => {
  if (!req.user) {
    return res.render("register", {
      error_message: req.flash("error_message") || "",
    });
  }
  const tasks = await Task.find({ userId: req.user.userId });

  return res.render("tasks_login", {
    success_message: "",
    error_message: "",
    user: req.user,
    tasks,
  });
});

router.post("/users", async (req, res) => {
  function UserId() {
    var text = "";
    var len = 10;
    var char_list =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
      text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
  }
  const user1 = await User.findOne({ email: req.body.email });
  let duplicate = false;
  if (user1) {
    if (user1.email == req.body.email) {
      duplicate = true;
    }
  }
  let valid = validator.validate(req.body.email);
  console.log(valid);
  // let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
  // if (!regex.test(req.body.email)) {
  //   invalid = true;
  // }
  let errorMsg = "";
  if (req.body.password.length < 7) {
    errorMsg = "Password must be minimum 7 characters";
  }
  if (duplicate) {
    errorMsg = " Email is already registered";
  }
  if (!valid) {
    errorMsg = " Email is invalid";
  }

  let userId = UserId();
  const user = new User({
    ...req.body,
    userId: userId,
  });

  if (errorMsg === "") {
    try {
      await user.save();
      sendWelcomeEmail(user.email, user.name);
      const token = await user.generateAuthToken(); // generateAuthToken is a replacble name for function that generates token everytime user registers or logins .....the function name can be changed to anything else
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 18000000),
        httpOnly: true,
      });

      res.redirect("/users/login");
    } catch (e) {
      req.flash("error_message", "User could not be Registered");
      res.redirect("/users");
    }
  } else {
    req.flash("error_message", errorMsg);
    res.redirect("/users");
  }
});

// router.get("/users/login", auth, async (req, res) => {
//   res.render("tasks_login");
// });
router.get("/users/login", auth, async (req, res) => {
  if (!req.user) {
    return res.render("login", {
      success_message: req.flash("success_message") || "",
      error_message: req.flash("error_message") || "",
    });
  }
  const tasks = await Task.find({ userId: req.user.userId });

  return res.render("tasks_login", {
    success_message: "",
    error_message: "",
    user: req.user,
    tasks,
  });
});

router.post("/users/login", async (req, res) => {
  email = req.body.email;
  password = req.body.password;
  const user = await User.findByCredentials(email, password);
  if (user != undefined) {
    try {
      const token = await user.generateAuthToken(); // generateAuthToken is a replacble name for function that generates token everytime user registers or logins .....the function name can be changed to anything else
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 18000000), //18000000 ms = 5 hrs of token expiration
        httpOnly: true,
      });
      req.flash("success_message", "Login Successfull");
      res.redirect("/users/tasks");
    } catch (e) {
      req.flash("error_message", "Cannot Login");
      res.redirect("/users/login");
    }
  } else {
    req.flash("error_message", "Incorrect Email address or Password");
    res.redirect("/users/login");
  }
});

router.get("/users/forgotPassword", async (req, res) => {
  res.render("forgot_pass", {
    error_message: req.flash("error_message"),
    success_message: req.flash("success_message"),
  });
});
router.post("/users/forgotPassword", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    req.flash("error_message", "Email not registered");
    return res.redirect("/users/forgotPassword");
  } else {
    console.log(user.email);
    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
      email: user.email,
      id: user.userId,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "10min" });

    const link =
      req.headers.origin + `/users/reset-password/${user.userId}/${token}`;
    sendPasswordEmail(user.email, user.name, link);
    // console.log(link);
    req.flash("success_message", "Password Link sent to your email");
    return res.redirect("/users/forgotPassword");
  }
});

router.get("/users/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findOne({ userId: id });
  // console.log(user.email);
  if (user == null) {
    res.flash("error_message", "Invalid Link");
    return res.redirect("/users/forgotPassword");
  }
  const secret = process.env.JWT_SECRET + user.password;
  try {
    const payload = jwt.verify(token, secret);

    res.render("reset_password", {
      email: user.email,
      id: user.userId,
      token: token,
      success_message: req.flash("success_message"),
      error_message: req.flash("error_message"),
    });
  } catch (error) {
    req.flash("error_message", "Invalid link");
    return res.redirect("/users/forgotPassword");
  }
});

router.post("/users/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findOne({ userId: id });

  if (user == null) {
    req.flash("error_message", "Reset request expired or invalid");
    return res.redirect("/users/forgotPassword");
  }
  const secret = process.env.JWT_SECRET + user.password;

  try {
    const payload = jwt.verify(token, secret);
    if (req.body.password.length < 7 || req.body.confirm_password.length < 7) {
      req.flash("error_message", "Password must be minimum 7 characters");
      return res.redirect(`/users/reset-password/${id}/${token}`);
    }
    if (req.body.password == req.body.confirm_password) {
      user.password = req.body.password;
      user.save();
      req.flash(
        "success_message",
        "Password reset successfull. Login with new password"
      );
      return res.redirect("/users/login");
    } else {
      req.flash("error_message", "Password and confirm password must be same");
      return res.redirect(`/users/reset-password/${id}/${token}`);
    }
  } catch (error) {}
});

router.get("/users/tasks", auth, async (req, res) => {
  if (!req.user) {
    return res.render("index");
  }
  const match = {};
  // const sort = {};
  var tasks = await Task.find({ userId: req.user.userId });
  if (req.query.status) {
    match.status = req.query.status;

    var tasks2 = tasks.filter(checkStatus);
    function checkStatus(task) {
      if (task.status === match.status) {
        return task;
      }
    }
    tasks = tasks2;
  }
  res.render("tasks_login", {
    user: req.user,
    success_message: req.flash("success_message"),
    tasks,
  });
});
router.get("/users/about", auth, async (req, res) => {
  if (!req.user) {
    return res.render("index");
  }
  return res.render("about_after", {
    user: req.user,
  });
});

router.get("/users/me", auth, async (req, res) => {
  if (!req.user) {
    return res.render("index");
  }
  const tasks_completed = await Task.find({
    userId: req.user.userId,
    status: "Completed",
  });
  const completed = tasks_completed.length;
  const tasks_not_started = await Task.find({
    userId: req.user.userId,
    status: "Not Started",
  });
  const not_started = tasks_not_started.length;
  const tasks_in_progress = await Task.find({
    userId: req.user.userId,
    status: "In Progress",
  });
  const in_progress = tasks_in_progress.length;
  const total = completed + in_progress + not_started;
  console.log(total);
  res.render("profile", {
    user: req.user,
    total,
    completed,
    not_started,
    in_progress,
  });

  // try {
  //     const users = await User.find({})
  //     res.send(users)
  // } catch (e) {
  //     res.status(500).send()
  // }
  //    User.find({}).then((users) => {
  //        res.send(users)
  //    }).catch((e) => {
  //        res.status(500).send()
  //    })
});
// router.get('/users/logout', auth , async(req,res) => {

// })
router.get("/users/logout", auth, async (req, res) => {
  res.clearCookie("jwt");
  req.user.tokens = req.user.tokens.filter((token) => {
    return token.token !== req.token;
  });
  await req.user.save();

  req.flash("success_message", "You are logged out");
  res.redirect("/loggedout");
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();

    res.send("Logged from all devices successfully.");
  } catch (e) {
    res.status(500).send();
  }
});

// router.get('/users/:id', async (req,res) => {      // /:id is saying that someone will search for a user with a id which can be anything
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if(!user) res.status(404).send()
//         res.send(user)

//     } catch (e) {
//         res.status(500).send()
//     }
//     // User.findById(_id).then((user) => {
//     //     if(!user) res.status(404).send()

//     //     res.send(user)
//     // }).catch((e) => {
//     //     res.status(500).send()
//     // })
// })

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);

  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true })

    await req.user.save();

    // if(!user) res.status(404).send()

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id)

    // if(!user) {
    //     return res.status(404).send({error : 'User not found'})
    // }

    await req.user.remove();
    sendCancelEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload a jpg or png"));
    }
    cb(undefined, true); // cb --> callback --> first argument is whether there is an error and second if is it success
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("image"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer; // buffer contains access to all the binary data of that avatar
    await req.user.save();
    res.render("profile", {
      user: req.user,
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
