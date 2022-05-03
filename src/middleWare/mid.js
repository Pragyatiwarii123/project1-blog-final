const jwt = require("jsonwebtoken");
const blogModel = require("../models/blogModel");

const authentication = function ( req, res, next) {
    try{
        let token = (req.headers["x-api-key"]); 

        if(!token){
            return res.status(400).send({error : "Token must be present...!"});
        }

        let decodedToken = jwt.verify(token, "functionup-uranium");

        if (!decodedToken){
            return res.status(400).send({ status: false, msg: "Token is invalid"});
        }
          
        let userLoggedIn = decodedToken.authorId;
        req["authorId"] = userLoggedIn;
        next();
    }
    catch(err){
        res.status(500).send({ msg: "Error", error: err.message});
    }
}


const authorization1 = async function(req,res,next){
    try{
        let bId = req.params.blogId;
        let id = req.authorId;
        let blog = await blogModel.findById(bId);

        if(id != blog.authorId){
            return res.status(403).send({status: false , msg : "Not authorized..!" });
        }
        next();
    }
    catch(err){
        res.status(500).send({ msg: "Error", error: err.message});
    }
}

const authorization2 = async function(req,res,next){
    try{
        let createId = req.body.authorId;
        let id = req.authorId;

        if(id != createId){
            return res.status(403).send({status: false , msg : "Not authorized..!" });
        }
        next();
    }
    catch(err){
        res.status(500).send({ msg: "Error", error: err.message});
    }
}

const authorization3 = async function(req,res,next){
    try{
        let createId = req.query.authorId;
        let id = req.authorId;

        if(id != createId){
            return res.status(403).send({status: false , msg : "Not authorized..!" });
        }
        next();
    }
    catch(err){
        res.status(500).send({ msg: "Error", error: err.message});
    }
}


module.exports.authentication = authentication;
module.exports.authorization1 = authorization1;
module.exports.authorization2 = authorization2;
module.exports.authorization3 = authorization3;