const express = require("express");
const User = require("./userDb");
const Post = require("../posts/postDb");

const router = express.Router();

router.post("/", validateUser, (req, res) => {
  const user = req.body;
  User.insert(user)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "error inserting the user" });
    });
});

router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const post = req.body;
  Post.insert(post)
    .then(post => {
      res.status(201).json(post);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error adding post" });
    });
});

router.get("/", (req, res) => {
  User.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "there are problems getting the users" });
    });
});

router.get("/:id", validateUserId, (req, res) => {
  console.log("get user");
  res.status(200).json(req.user);
  //   const { id } = req.params;
  //   User.getById(id).then(user => {
  //     if (user) {
  //       res.status(200).json(user);
  //     } else {
  //       res.status(404).json({ user: "User ID does not exist" });
  //     }
  //   });
});

router.get("/:id/posts", validateUserId, (req, res) => {
  const { id } = req.params;
  User.getUserPosts(id)
    .then(posts => res.status(200).json(posts))
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error getting user posts" });
    });
});

router.delete("/:id", validateUserId, (req, res) => {
  const { id } = req.user;

  User.remove(id)
    .then(() => res.status(204).end())
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error deleting user" });
    });
});

router.put("/:id", validateUserId, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  User.update(id, { name })
    .then(() => {
      User.getById(id)
        .then(user => res.status(200).json(user))
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: "Error getting user" });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Error updating user" });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;
  User.getById(id).then(user => {
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(404).json({ user: "User ID does not exist" });
    }
  });
}

function validateUser(req, res, next) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  if (typeof name !== "string") {
    return res.status(400).json({ error: "Name must be string" });
  }
  req.body = { name };
  next();
}

function validatePost(req, res, next) {
  const { id: user_id } = req.params;
  const { text } = req.body;

  if (!req.body) {
    return res.status(400).json({ error: "Posts requires body" });
  }
  if (!text) {
    return res.status(400).json({ error: "Posts requires text" });
  }
  req.body = { user_id, text };

  next();
}

module.exports = router;
