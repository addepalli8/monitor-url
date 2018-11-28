const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const Urlschema=new Schema({
name:String,
link:String
});
const Urldata=mongoose.model("urlschema",Urlschema);

module.exports=Urldata;