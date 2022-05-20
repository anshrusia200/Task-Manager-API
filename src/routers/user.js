const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const {sendWelcomeEmail, sendCancelEmail } = require('../emails/account')
const sharp = require('sharp')
const router = new express.Router()


// router.get('/', auth, async (req,res) => {
//     res.render("createTask")
// })

router.get('/', async (req,res) => {
    res.render("index")
})
router.get('/about', async (req,res) => {
    res.render("about")
})
router.get('/users', async (req,res) => {
    res.render("register")
})
router.get('/users/login', async (req,res) => {
    res.render("login")
})
router.get('/users/createTask', auth, async (req,res) => {
    res.render("createTask")
})
router.get('/users/abouts', auth, async (req,res) => {
    res.render("about_after")
})
router.post('/users', async (req,res) => {
    const user  = new User(req.body)   
    
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()    // generateAuthToken is a replacble name for function that generates token everytime user registers or logins .....the function name can be changed to anything else
        res.cookie("jwt", token, {
            expires : new Date(Date.now() + 600000),
            httpOnly : true
        })
        res.render("register-success")
    }catch(e){
        res.status(400).send(e)
    }
    
    // user.save().then(() => {
        //          res.status(201).send(user)
        //      }).catch((e)=> {
            //          res.status(400).send(e)
            //      })
        })
        
router.post('/users/login', async (req,res) => {
    try {
        email = req.body.email
        password = req.body.password
        const user = await User.findByCredentials(email , password)
        const token = await user.generateAuthToken()    // generateAuthToken is a replacble name for function that generates token everytime user registers or logins .....the function name can be changed to anything else
        res.cookie("jwt", token, {
            expires : new Date(Date.now() + 600000),
            httpOnly : true
        })
        res.status(201).redirect('/users/createTask')
    
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/users/me', auth , async (req,res) => {
    res.send(req.user)
    
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
})
// router.get('/users/logout', auth , async(req,res) => {
    
// })
router.get('/users/logout', auth , async(req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.redirect('/')

    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth , async(req,res) => {
    try {
        req.user.tokens = []
      
        await req.user.save()

        res.send('Logged from all devices successfully.')
    }
     catch (e) {
        res.status(500).send()
    }
})




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

router.patch('/users/me', auth ,async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error : 'Invalid updates!'})
    }
 
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        }) 

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new : true, runValidators: true })

        await req.user.save()

        // if(!user) res.status(404).send()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth , async (req,res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     return res.status(404).send({error : 'User not found'})
        // }

        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({ 
    limits: {
        fileSize : 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('Please upload a jpg or png'))
        }
        cb(undefined, true)
    }
})



router.post('/users/me/avatar', auth ,  upload.single('avatar') , async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer          // buffer contains access to all the binary data of that avatar
    await req.user.save()
    res.send()
}, (error, req, res ,next) => {
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth , async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type' , 'image/png') 
        res.send(user.avatar)
    }
    catch(e){
        res.status(400).send()
    }
})

module.exports = router