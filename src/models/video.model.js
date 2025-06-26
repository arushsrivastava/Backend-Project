import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new mongoose.Schema({
    title :{
        type : String,
        required : true,
        trim : true,
        index : true
    },
    description :{
        type : String,
        required : true,
        trim : true,
    },
    duration :{
        type : Number,
        required : true,
    },
    views :{
        type : Number,
        defualt : 0,
    },
    videoFile :{
        type : String, //cloudinary_url
        required : true,
    },
    isPublished :{
        type : Boolean,
        default : true,
    },
    owner :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    }
},{timestamps : true})

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model('Video',videoSchema);