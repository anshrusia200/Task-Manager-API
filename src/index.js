const express = require("express");
const path = require("path");
const ejs = require("ejs");
// const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");

require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

// const { updateOne } = require('./models/user')
// const Task = require('./models/task')
// const User = require('./models/user')

const app = express();
const port = 5500;

const publicDirectoryPath = path.join(__dirname, "../public"); //
// const viewsPath = path.join(__dirname, "../views");
// const partialsPath = path.join(__dirname, "../templates/partials");

// app.use(expressLayouts);
// app.set("views", viewsPath);
app.set("view engine", "ejs");

app.use(express.static(publicDirectoryPath));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(
  session({ secret: "TaskManager", resave: false, saveUninitialized: false })
);
app.use(flash());

// app.use(function (req, res, next) {
//   res.locals.success_message = req.flash("success_message");
//   res.locals.error_message = req.flash("error_message");
//   res.locals.error = req.flash("error");
//   next();
// });

app.use(userRouter);
app.use(taskRouter);

app.use(express.json()); // express.json grab s incoming json

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// const multer = require('multer')
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize : 1000000 // bytes
//     },
//     fileFilter(req, file, cb){
//         if (!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('Please upload a Word document'))
//         }
//         cb(undefined, true)
//         // cb(new Error('File must be a PDF'))
//         // cb(undefined , true)
//         // cb(undefined , false)
//     }
// })

// app.post('/upload',  upload.single('upload')  ,(req,res) => {      //single requires a string as an argument
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({error : error.message})
// })

//Express middlewares
// app.use((req,res,next) => {
//     // if(req.method) {
//     //     res.status(503).send('Sorry, the site is under maintenance!')
//     // }

//          res.status(503).send('Sorry, the site is under maintenance!') // upar wala if code bhi use kr skte h

// })

//
//Without middleware : new request -> run route handler
//
//with Middleware : new request -> do something -> run route handler
//

// const main = async () => {
//     //Finding User by their task
//     // const task = await Task.findById('61dd9536f3a7ea678fb328b6')
//     // await task.populate('owner')            // populate allows us to populate data from a relationship
//     // console.log(task.owner)

//     //Finding Task by their User
//     const user = await User.findById('61dd950ff3a7ea678fb328b0')
//     await user.populate('tasks')
//     console.log(user.tasks)
// }

// main()

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {

//     const token = jwt.sign({ _id: 'abc123' } , 'thisismynewcourse', { expiresIn: '5 second' })
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)

//     // const password = 'Red123'
//     // const hashedPassword = await bcrypt.hash(password, 8) // 8 is a perfect number of times to hash a password because it is both tough to crack and completes in small time
//     // console.log(password)
//     // console.log(hashedPassword)

//     // const isMatch = await bcrypt.compare('Red123', hashedPassword)
//     // console.log(isMatch)
//     }

// myFunction()
