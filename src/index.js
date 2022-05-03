const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("../src/route/route");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


mongoose.connect("mongodb+srv://pragya_user1:tfr9Y2SlmidKsL1L@cluster0.e7bog.mongodb.net/Project1-db1?retryWrites=true&w=majority",{
    useNewUrlParser : true
})
.then(() => console.log("MongoDB is connected..!"))
.catch(err => console.log(err))

app.use('/',route);


app.listen(process.env.PORT || 3000 , function(){
    console.log("Express app is running on port : ",(process.env.PORT || 3000))
});