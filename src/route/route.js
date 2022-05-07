const express = require('express');
const router = express.Router(); 
const auhorController = require("../controller/authorController");
const blogController = require("../controller/blogController");
const middleware = require("../middleWare/mid");


router.post("/authors",auhorController.registerAuthor);

router.post("/blogs" ,middleware.authentication,middleware.authorization2, blogController.createBlog);

router.get("/blogs",middleware.authentication, blogController.getBlogs);

router.put("/blogs/:blogId",middleware.authentication,middleware.authorization1, blogController.updateblog);

router.delete("/blogs",middleware.authentication, blogController.deleteBlogById);

router.delete("/blogs/:blogId",middleware.authentication,middleware.authorization1,blogController.deleteBlogByParams);

router.post("/login",auhorController.login);


module.exports = router;