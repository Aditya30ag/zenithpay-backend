const mongoose=require('mongoose');
const {Schema} =mongoose;

const Userschema=new Schema({
    aadharNumber:{
        type:String,
        required:true,
    },
    voterid:{
        type:Number,
        required:true,
    },
    isvoted:{
        type:Boolean,
        required:false,
        default:false
    },otp:{
        type:Number,
        required:false,
        default:123456
    }
})
const user=mongoose.model("User",Userschema);
module.exports=user