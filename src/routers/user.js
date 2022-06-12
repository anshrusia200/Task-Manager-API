const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");
const sharp = require("sharp");
const validator = require("email-validator");
const router = new express.Router();

router.get("/", auth, async (req, res) => {
  res.render("tasks", {
    user: req.user,
  });
});
router.get("/loggedout", async (req, res) => {
  res.render("index_logout", { success_message: req.flash("success_message") });
});
router.get("/about", async (req, res) => {
  res.render("about");
});
router.get("/users", async (req, res) => {
  res.render("register", { error_message: req.flash("error_message") });
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
        expires: new Date(Date.now() + 86400000),
        httpOnly: true,
      });
      req.flash(
        "success_message",
        "Account Created Successfully! Now you can Login. "
      );
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

router.get("/users/login", async (req, res) => {
  res.render("login", {
    success_message: req.flash("success_message"),
    error_message: req.flash("error_message"),
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
        expires: new Date(Date.now() + 86400000), //86400000 ms = 1 day of token expiration
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
router.get("/users/tasks", auth, async (req, res) => {
  res.render("tasks", {
    user: req.user,
    success_message: req.flash("success_message"),
  });
});
router.get("/users/about", auth, async (req, res) => {
  res.render("about_after");
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);

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
  req.user.tokens = req.user.tokens.filter((token) => {
    return token.token !== req.token;
  });
  await req.user.save();
  console.log("loggedOut");
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
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer; // buffer contains access to all the binary data of that avatar
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
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
