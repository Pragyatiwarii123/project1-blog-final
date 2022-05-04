const blogModel = require("../models/blogModel");
const authorModel = require("../models/authorModel");
const { default: mongoose } = require("mongoose");


const stringChecking = function (data) {
    if (typeof data === 'undefined' || data===null) return false;
    if (typeof data === 'string' && data.trim().length == 0) return false;
    return true;
}

const isValidRequestBody = function(requestBody){
    return Object.keys(requestBody).length>0
}

const isValidObjectId = function(objectId){
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
        const requestBody = req.body;

        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status:false, msg:"Please provide blog details"})
        }

        //extract params
        const { title, body, authorId,tags, category, subcategory, isPublished } = requestBody;

        
        if (!stringChecking(title)) {
            return res.status(400).send({status: false, msg: "Blog title is required...!" });
        }

        if (!stringChecking(body)) {
            return res.status(400).send({status: false, msg: "Blog body is required...!" });
        }

        if (!stringChecking(category)) {
            return res.status(400).send({status: false, msg: "Blog category is required...!" });
        }

        if (!stringChecking(authorId)) {
            return res.status(400).send({status: false, msg: "Author Id is required...!" });
        }

        if(!isValidObjectId(authorId)){
            return res.status(400).send({status:false,msg:`${author} is not a valid author Id`})
        }
        
        const author = await authorModel.findById(authorId)
        if(!author){ 
            return res.status(400).send({status: false, Msg: "Author does not exist...!" });
        }//validation ends

        const blogData = {
            title,body,authorId,category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if(tags){
            if(Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if(Object.prototype.toString.call(tags) === "[object String]"){    // "[]"   "{}"
                blogData['tags'] = [tags]
            }
        }

        if(subcategory){
            if(Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if(Object.prototype.toString.call(subcategory) === "[object String]"){
                blogData['subcategory'] = [subcategory]
            }
        }

        const newBlog = await blogModel.create(blogData);
            res.status(201).send({ status: true, message:"New blog created successfully", data: newBlog });
        
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
        const filterQuery = {isDeleted: false, deletedAt: null, isPublished: true} 
        const queryParams = req.query
        
        if(isValidRequestBody(queryParams)) {
            const {authorId, category, tags, subcategory} = queryParams
        

        if (!stringChecking(authorId) && isValidObjectId(authorId)){
            filterQuery['authorId'] = authorId
        }

        if(stringChecking(category)){
            filterQuery['category'] = category.trim()
        }

        if(stringChecking(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim())
            filterQuery['tags'] = {$all: tagsArr}
        }
        
    
        if(stringChecking(subcategory)){
           const subcatArr = subcategory.trim().split(',').map(tag => tag.trim())
           filterQuery['subcategory'] = {$all: subcatArr}
        }
    }
    
    const blogs = await blogModel.find(filterQuery)

    if(Array.isArray(blogs) && blogs.length === 0){
        return res.status(404).send({status:false,msg: "No blogs found"})
    }

    res.status(200).send({status:true, message:"Blogs list",data: blogs})
}
                
    catch (error) {
        res.status(500).send({status: false, msg: "Error", error: error.message });
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
        const requestBody = req.body;
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId
        console.log(authorIdFromToken);
        
//validation starts
            if (!isValidObjectId(blogId)){ 
                return res.status(400).send({status: false, msg: `${blogId} is not a valid blog Id`});
        }

        if (!isValidObjectId(authorIdFromToken)){ 
            return res.status(400).send({status: false, msg: `${authorIdFromToken} is not a valid token Id`});
    }

    const blog = await blogModel.findOne({_id:blogId, isDeleted: false, deletedAt: null})

        if (!blog)return res.status(400).send({status: false, msg: "Blog not found...!" });
        
        if(blog.authorId.toString() !== authorIdFromToken){
            return res.status(401).send({status:false, msg:'Unauthorised access! owner info does not match'})
        }

        if(!isValidRequestBody(requestBody)){
            res.status(200).send({status:true , msg: 'No parameters passed.Blog unmodified',data:blog})
        }

        //extract params
        const {title, body, tags, category, subcategory, isPublished} = requestBody

        const updateBlogData = {}

        if(stringChecking(title)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, `$set`)) updateBlogData['$set'] = {}
            updateBlogData['$set']['title'] = title
        }

        if(stringChecking(body)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, `$set`)) updateBlogData['$set'] = {}
            updateBlogData['$set']['body'] = body
        }

        if(stringChecking(category)) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, `$set`)) updateBlogData['$set'] = {}
            updateBlogData['$set']['category'] = category
        }

        if(isPublished !== undefined){
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, '$set')) updateBlogData['$set'] = {}

            updateBlogData['$set']['isPublished'] = isPublished
            updateBlogData['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if (tags) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, `$addToSet`)) updateBlogData['$addToSet'] = {}

            if(Array.isArray(tags)) {
                updateBlogData['$addToSet']['tags'] = { $each: [...tags]}
            }
            if(typeof tags === "string") {
                updateBlogData['$addToSet']['tags'] = tags            
            }
        }

        if (subcategory) {
            if(!Object.prototype.hasOwnProperty.call(updateBlogData, `$addToSet`)) updateBlogData['$addToSet'] = {}

            if(Array.isArray(subcategory)) {
                updateBlogData['$addToSet']['tags'] = { $each: [...subcategory]}
            }
            if(typeof subcategory === "string") {
                updateBlogData['$addToSet']['tags'] = subcategory            
            }
        }

        const updatedBlog = await blogModel.findOneAndUpdate({_id: blogId},updateBlogData,{new: true})
        return res.status(200).send({status:true,message:"Blog updated successfully", data: updatedBlog})
    }
    catch (error) {
        res.status(500).send({status: false, msg: "Error", error: error.message })
    }
}


//API5


// DELETE /blogs/:blogId
// - Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure) 

const deleteBlogById = async function (req, res) {
    try {
        const params = req.params
        const blogId = params.blogId
        const authorIdFromToken = req.authorId

        if(!isValidObjectId(blogId)) {
            res.status(400).send({status:false, msg: `${blogId} is not a valid Blog Id`})
        }

        if(!isValidObjectId(authorIdFromToken)) {
            res.status(400).send({status:false, msg: `${authorIdFromToken} is not a valid token Id`})
        }

        let blog = await blogModel.findOne({_id: blogId, isDeleted: false, deletedAt: null});

        if (!blog) {
            return res.status(404).send({status: false,msg:"Blog not found"});
        }

        if (blog.authorId.toString() !== authorIdFromToken) {
            return res.status(401).send({ status: false, msg: "Unauthorised access! Owner info does not match"})
        }

        await blogModel.findOneAndUpdate({_id:blogId},{$set:{isDeleted:true, deletedAt:new Date()}})
        return res.status(200).send({status:true,message:"Blog deleted successfully"})
    }
        
    catch (error) {
        res.status(500).send({status: false, msg: "Error", error: error.message })
    }
}


//API6


// ### DELETE /blogs?queryParams
// - Delete blog documents by category, authorid, tag name, subcategory name, unpublished    // author 1000 blog->tag->100 mobile
// - If the blog document doesn't exist then return an HTTP status of 404 with a body like [this](#error-response-structure)

const deleteBlogByParams = async function (req, res) {
    try {
        const filterQuery = {isDeleted:false, deletedAt:null}
        const queryParams = req.query
        const authorIdFromToken = req.authorId

        if(!isValidObjectId(authorIdFromToken)){
            return res.status(400).send({status:false, msg:'No query param received,aborting delete operation'})
        }

        const {authorId, category, tags, subcategory, isPublished} = queryParams

        if (stringChecking(authorId) && isValidObjectId(authorId)) {
           filterQuery['authorId'] = authorId
        }

        if (stringChecking(category)) {
            filterQuery['category'] = category
         }

         if (stringChecking(isPublished)) {
            filterQuery['isPublished'] = isPublished
         } 

         if (stringChecking(tags)) {
             const tagsArr = tags.trim().split('.').map(tag => tag.trim())
            filterQuery['tags'] = {$all: tagsArr}
         }

         if (stringChecking(subcategory)) {
            const subcatArr = subcategory.trim().split('.').map(subcat => subcat.trim())
           filterQuery['subcategory'] = {$all: subcatArr}
        }

        const blog = await blogModel.find(filterQuery)

        if(Array.isArray(blog) && blog.length === 0) {
            return res.status(404).send({staus: false,msg:"No matching blogs found"})
        }

        const idOfBlogsToDelete = blog.map(blog =>{
            if(blog.authorId.toString() === authorIdFromToken) return blog._id
        })

        if(idOfBlogsToDelete.length === 0) {
            return res.status(404).send({status:false,msg: "No blogs found"})
        }

        await blogModel.updateMany({_id: {$in: idOfBlogsToDelete}},{$set:{isDeleted:true,deletedAt: new Date()}})
        return res.status(200).send({status:true,message:"Blog(s) deleted successfully"})
    }
    catch (err) {
        res.status(500).send({status: false, msg: "Error", error: err.message })
    }
}


module.exports.createBlog = createBlog;
module.exports.getBlogs = getBlogs;
module.exports.updateblog = updateblog;
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByParams = deleteBlogByParams;