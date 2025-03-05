
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    about:{
        type : String,
        require:true
    },
    password : {
        type : String,
        required : true
    },
    profileimg : {
        type : String,
        default:""
    },
    creatDate : {
        type : Date,
    },
    lastLogin:{
        type : Date,
    },
    lastUpdate:{
        type : Date
    }

})

const User = mongoose.model('user', userSchema);

module.exports = User