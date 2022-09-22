const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: {
      type: String,
      required: true,
      trim: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true, //remove extra spaces
      lowercase: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     req.flash("error_message", "Email is invalid");
      //   }
      // },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      // validate(value) {
      //   if (value.toLowerCase().includes("password")) {
      //     req.flash(
      //       "error_message",
      //       "Password cannot contain the word `password` "
      //     );
      //   }
      // },
    },
    age: {
      type: Number,
      default: 0,
      // validate(value) {
      //   if (value < 0) {
      //     throw new Error("Age must be a positive number");
      //   }
      // },
    },

    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual Property - Its a relationship between two entities ...here between User and tasks
// userSchema.virtual("tasks", {
//   ref: "Task",
//   localField: "_id",
//   foreignField: "owner",
// });

userSchema.methods.toJSON = function () {
  // toJSON is helping in remove all tokens and password from the user object
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  // the METHODS are available on the instances(instance means an object created)
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "10h",
  }); //yha pr toString ka use isliye kiya h because the _id used is of object type

  user.tokens = user.tokens.concat({ token }); // yha pr token : token ko sirf token likha h shorthand me
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // static methods are accessible on the models also known as the model methods
  const user = await User.findOne({ email });
  let isMatch = false;
  if (user != undefined) {
    isMatch = await bcrypt.compare(password, user.password);
  }
  if (isMatch) {
    return user;
  } else {
    console.log("Incorrect password");
    return;
  }
};

//middleware is something that allows to do a particular thing before doing an action on the schema. So we first implicitly converted the object to a schema so that we can use pre hook to hash the user passwords before saving them

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  // we are not using arrow functions because this keyword will not be allowed
  const user = this; // here this gives us the ability to access individual user before saving them

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // console.log('just before saving')
  next();
});

//delete user tasks when user is removed
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
