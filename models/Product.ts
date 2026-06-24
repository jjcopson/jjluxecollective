import mongoose,{Schema,models} from "mongoose";
const ProductSchema=new Schema({name:{type:String,required:true},category:{type:String,required:true},gender:{type:String,required:true},price:{type:Number,required:true},oldPrice:{type:Number},description:{type:String,required:true},sizes:[{type:String}],colors:[{type:String}],image:{type:String,required:true},quantity:{type:Number,required:true},featured:{type:Boolean,default:false}},{timestamps:true});
export default models.Product||mongoose.model("Product",ProductSchema);
