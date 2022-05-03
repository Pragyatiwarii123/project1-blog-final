const express = require('express');
const router = express.Router(); 
const auhorController = require("../controller/authorController");
const blogController = require("../controller/blogController");
const middleware = require("../middleWare/mid");


router.post("/authors",auhorController.createAuthor);

router.post("/blogs" ,middleware.authentication,middleware.authorization2, blogController.createBlog);

router.get("/blogs",middleware.authentication, blogController.getBlogs);

router.put("/blogs/:blogId",middleware.authentication,middleware.authorization1, blogController.updateblog);

router.delete("/blogs/:blogId",middleware.authentication,middleware.authorization1,blogController.deleteblog);

<<<<<<< HEAD
router.delete("/blogs",blogController.deleteblog2);
=======
router.delete("/blogs",middleware.authentication,middleware.authorization3, blogController.deleteblog2);

router.post("/login",auhorController.login);
>>>>>>> 9fa262709fd3c0f8e4ea8780f0b4bf592eea91fe


module.exports = router;