const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const { default: mongoose } = require("mongoose");


const stringChecking = function (data) {
    if (typeof data === 'undefined' || data === null) return false;
    if (typeof data === 'string' && data.trim().length == 0) return false;
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


//API2 

/*Create a blog document from request body. Get authorId in request body only.

Make sure the authorId is a valid authorId by checking the author exist in the authors collection.

Return HTTP status 201 on a succesful blog creation. Also return the blog document. The response should be a JSON object like this

Create atleast 5 blogs for each author

Return HTTP status 400 for an invalid request with a response body*/


const createBlog = async function (req, res) {
    try {
        const data = req.body;
        const authorId = req.body.authorId;

        const { title, body, category } = data;

        if (!isValidRequestBody (data)) {
            return res.status(400).send({ status: false, msg: "Please provide blog details" });
        }


        if (!stringChecking(title)) {
            return res.status(400).send({ status: false, msg: "Title is required...!" });
        }


        if (!stringChecking(body)) {
            return res.status(400).send({ status: false, msg: "Body is required...!" });
        }


        if (!stringChecking(category)) {
            return res.status(400).send({ status: false, msg: "Category is required...!" });
        }

        if (!authorId) {
            return res.status(400).send({ status: false, msg: "AuthorId is required...!" });
        }

        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, msg: `${authorId} is not a valid author Id` });
        }
        let createData = await blogModel.create(data);
        return res.status(201).send({ status: true, data: createData });

    }

    catch (error) {
        res.status(500).send({ status: false, msg: "Error", error: error.message });
    }
}


//API3

/*Returns all blogs in the collection that aren't deleted and are published
Return the HTTP status 200 if any documents are found. The response structure should be like this
If no documents are found then return an HTTP status 404 with a response like this
Filter blogs list by applying filters. Query param can have any combination of below filters.
By author Id
By category
List of blogs that have a specific tag
List of blogs that have a specific subcategory example of a query url: blogs?filtername=filtervalue&f2=fv2*/



const getBlogs = async function (req, res) {
    try {
        let authorId = req.query.authorId;
        let category = req.query.category;
        let tags = req.query.tags;
        let subcategory = req.query.subcategory;
        let filter = {}      

        if (category != undefined) {
            if (!stringChecking(category))
                return res.status(400).send({status: false, msg: "Please enter the category in right format...!" })
            filter.category = category
        }

        if (tags != undefined) {
            if (!stringChecking(tags))
                return res.status(400).send({status: false, msg: "Please enter the tag in right format...!" });
            filter.tags = tags
        }

        if (subcategory != undefined) {
            if (!stringChecking(subcategory))
                return res.status(400).send({status: false, msg: "Please enter the subcategory in right format...!" });
            filter.subcategory = subcategory
        }

        if (authorId != undefined) {
            if (!stringChecking(authorId))
                return res.status(400).send({status: false, msg: "Please enter the authorId in right format...!" });
            filter.authorId = authorId
        }


        filter.isDeleted = false
        filter.isPublished = true
        console.log(filter)

        let filterData = await blogModel.find(filter);

        if (filterData.length == 0) {
            return res.status(404).send({ status: false, msg: "Documents not found.." });
        }
        res.status(200).send({status: true, Data: filterData });
    }

    catch (error) {
        res.status(500).send({ status: false, msg: "Error", error: error.message });
    }
}



//API4

// ### PUT /blogs/:blogId
// - Updates a blog by changing the its title, body, adding tags, adding a subcategory. (Assuming tag and subcategory received in body is need to be added)
// - Updates a blog by changing its publish status i.e. adds publishedAt date and set published to true
// - Check if the blogId exists (must have isDeleted false). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure)
// - Return an HTTP status 200 if updated successfully with a body like [this](#successful-response-structure) 
// - Also make sure in the response you return the updated blog document.*/


const updateblog = async function (req, res) {
    try {
        const data = req.body;
    const blogId = req.params.blogId;
    const findBlogId = await blogModel.findById(blogId);

    if (findBlogId) {
      if (findBlogId.isDeleted === false) {
        if (findBlogId.isPublished === true) {
          const dataNeedToBeUpdated = await blogModel.findOneAndUpdate(
            { _id: blogId },
            { $set: { isPublished: true, publishedAt: Date.now() } }
          );
        }

        let updatedBlog = await blogModel.findOneAndUpdate(
          { _id: blogId },
          { ...data },
          { new: true }
        );

        return res.status(200).send({ UPDATEDBLOG: "blog updated successfully", updatedBlog });
      } else {
        return res.status(404).send({ ERROR: "blog not found" });
      }
    } else {
      return res.status(404).send({ ERROR: "blog id not found" });
    }
  }
    

    catch (error) {
        res.status(500).send({ status: false, msg: "Error", error: error.message })
    }
}

//API5
// DELETE /blogs/:blogId
// - Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure) 




const deleteBlogById = async function (req, res) {
    try {
        let blogId = req.params.blogId;
        let blog = await blogModel.findById(blogId);

        if (!blog) {
            return res.status(404).send({status: false,msg:"No such blog exists"});
        }

        if (blog.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "Blog not found, may be deleted" })
        }

        let authId = blog.authorId;
        let id = req.authorId;
        if (id != authId) {
            return res.status(403).send({ status: false, msg: "Not authorized..!" });
        }

        let deletedtedUser = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true ,deletedAt: Date.now()} }, { new: true });
        res.status(200).send({status: true, msg: "done", data: deletedtedUser });
    }
    catch (err) {
        res.status(500).send({status: false, msg: "Error", error: err.message })
    }
}


//API6

// ### DELETE /blogs?queryParams
// - Delete blog documents by category, authorid, tag name, subcategory name, unpublished    // author 1000 blog->tag->100 mobile
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure)

const deleteBlogByParams = async function (req, res) {
    try {
        const query1 = req.query

        let fetchdata = await blogModel.find(query1)


        if (fetchdata.length == 0) {
            return res.status(404).send({ status: false, msg: " Blog document doesn't exist " })
        }

        let deletedtedUser = await blogModel.updateMany(query1, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });

        res.status(200).send({status: true, msg: "done", data: deletedtedUser });
    
    }
    catch (err) {
        res.status(500).send({ status: false, msg: "Error", error: err.message })
    }
}


module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateblog = updateblog;
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByParams = deleteBlogByParams;