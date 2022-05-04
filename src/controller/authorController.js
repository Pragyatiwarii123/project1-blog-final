const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");

const typeChecking = function(value){
    if(typeof value === 'undefined' || value===null)return false;
    if(typeof value === 'string' && value.trim().length == 0)return false;
    return true;
    }

    const isValidTitle = function(title){
        return ["Mr","Mrs","Miss"].indexOf(title) !== -1
    }

    const isValidRequestBody = function(requestBody){
        return Object.keys(requestBody).length > 0
    }

    const registerAuthor = async function(req,res){
    
    try {
        const requestBody = req.body
        if(!isValidRequestBody(requestBody)){
            return res.status(400).send({status:false,msg:"Please provide author details"})
        }
        //extract params
        const {fname , lname , title , email , password} = requestBody;//object destructuring

        //validation starts here
        if(!typeChecking(fname)){
            return res.status(400).send({status: false,msg: "First name is required...!"});
        }
        
        if(!typeChecking(lname)){
            return res.status(400).send({status: false,msg: "Last name is required....!"});
        }

        if(!typeChecking(title)){
            return res.status(400).send({status: false,msg: "Title is required....!"});
        }
        
        if(!isValidTitle(title)){
            return res.status(400).send({status: false,msg: "Title should only have Mr,Mrs,Miss!"});
        }
        
        if(!typeChecking(email)){
            return res.status(400).send({status: false,msg: "Email is required...!"});
        }

        if(!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))){
            return res.status(400).send({status:false,msg:"Email shoul be a valid email address"})
        }
        
        if(!typeChecking(password)){
            return res.status(400).send({status: false,msg: "Password is required...!"});
        }

        const isEmailAlreadyUsed = await authorModel.findOne({email})

        if(isEmailAlreadyUsed){
            return res.status(400).send({status:false , msg:`${email} email address is already registered`})
        }
        //validation ends
        const authorData = {fname,lname,title,email,password}
        console.log(authorData);
        console.log(requestBody);
        let createData = await authorModel.create(authorData);
        res.status(201).send({status: true, data: createData });
    }
    catch (error) {
        res.status(500).send({status: false, msg: "Error", error: error.message });
    }
}


const login = async function (req, res) {
    try {
        const requestBody = req.body

        if (!isValidRequestBody) {
            return res.status(400).send({status: false, msg: "Please provide login details...!" });
        }

        //extract params
        const {email,password} = requestBody

        //validation starts
        if(!typeChecking(email)) {
            return res.status(400).send({status:false,msg:"Email is required...!"})
        }

        if(!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))){
            return res.status(400).send({status:false,msg:"Email should be a valid email address"})
        }

        if(!typeChecking(password)) {
            return res.status(400).send({status:false,msg:"Password is required...!"})
        }
        //validation ends

        const author = await authorModel.findOne({email,password})

        if(!author){
            return res.status(401).send({status:false,msg:"Invalid login credential"})
        }

        let token = jwt.sign(
            {
                authorId: author._id,
                iat:Math.floor(Date.now()/1000),
                exp:Math.floor(Date.now()/1000) + 10*60*60

            },
            "functionup-uranium"
        );

        res.header("x-api-key" , token)

        res.status(200).send({ status: true,msg:"Author login successfull" ,data: token });
    }
    catch (error) {
        res.status(500).send({status: false, msg: "Error", error: error.message });
    }
};


module.exports.registerAuthor = registerAuthor;
module.exports.login = login;