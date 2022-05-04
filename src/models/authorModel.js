const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
    fname : {type :String , required : true,trim:true},
    lname : {type :String , required : true,trim:true},
    title : {type :String , enum : ["Mr","Mrs","Miss"], required : true},
    email : {type :String , required : true ,lowercase:true, unique : true,trim:true, validate:{
     validator:function(email){
         return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
     }, msg: "Please fill a valid email address", isAsync: false   
     }
},
    password : {type :String , required :true, trim :true}
},{timestamps : true});


module.exports  = mongoose.model("Author",authorSchema,"authors");