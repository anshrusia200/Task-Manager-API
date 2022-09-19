const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

// router.get("/new-task", auth, async (req, res) => {
//   res.render("task");
// });
router.post("/tasks", auth, async (req, res) => {
  //const task  = new Task(req.body)
  function TaskId() {
    var text = "";
    var len = 10;
    var char_list =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++) {
      text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    return text;
  }
  const taskId = TaskId();
  console.log(taskId);
  const task = new Task({
    ...req.body, // ... spread opeartor copies everything from request body into the Task object
    userId: req.user.userId,
    taskId: taskId,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    console.log(e);
    req.flash("error_message", "Task could not be saved. Please try again.");
    res.redirect("/users/tasks");
  }
  // task.save().then(() => {
  //          res.status(201).send(task)
  //      }).catch((e)=> {
  //          res.status(400).send(e)
  //      })
});

// GET /tasks?completed=true
//Get /tasks?limit=1&skip=20
//Get /tasks?sortBy = createdAt:desc

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    //remember that req.query.completed will give a string and not a boolean but we want a boolean
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":"); // parts krke ek array bana di h jisme createdAt , asc/desc 2 elements rhenge
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1; //ternary operator  //descending is -1 : reverse order , latest first
    /*yaha par sort[parts[0]] ka matlab h ki sort                       // ascending is 1 : original order , oldest first  
        object ki createdAt property ko parts[0] array ke 1st element     // -1 is true first
        ke barabar krdo   */ // 1 is false first
  }

  try {
    // const tasks = await Task.find({owner : req.user._id})
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort, // :  {
        //     // createdAt : 1        //descending is -1
        //                           // ascending is 1
        //     completed : -1    // -1 is true first
        //                       // 1 is false first
        // }
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }

  // Task.find({}).then((tasks) => {
  //     res.send(tasks)
  // }).catch((e) => {
  //     res.status(500).send()
  // })
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    //const task = await Task.findById(_id)
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) res.status(404).send();

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }

  // Task.findById(_id).then((task) => {
  //     if(!task) res.status(404).send()

  //     res.send(task)
  // }).catch((e) => {
  //     res.status(500).send()
  // })
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "title",
    "description",
    "progress",
    "status",
    "dueDate",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: "Invalid operation" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    // const task = await Task.findById(req.params.id)

    if (!task) res.status(404).send();

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    console.log("done");
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
