const express = require('express');
const router = express.Router(); 
const auhorController = require("../controller/authorController");
const blogController = require("../controller/blogController");
const middleWare=require("../middleWare/mid")


router.post("/authors",auhorController.registerAuthor);

router.post("/blogs" ,blogController.createBlog);

router.get("/blogs", blogController.getBlogs);

router.put("/blogs/:blogId",middleWare.authentication,blogController.updateblog);

router.delete("/blogs/:blogId",middleWare.authentication,blogController.deleteBlogById);

router.delete("/blogs", middleWare.authentication,blogController.deleteBlogByParams);

router.post("/login",auhorController.login);


module.exports = router;