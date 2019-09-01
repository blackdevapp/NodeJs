import * as mongoose from 'mongoose';

const twitterPostSchema = new mongoose.Schema({
  description:String,
  logo:String,
  title:String,
  images:[],
  hasHashtag: Boolean,
  tags:[],
  packageId:String,
  deleted:{
    type:Boolean,
    default:false
  },
  associated_agency: {
    type: String,
    default: ''
  },
  publishedDate: {
    type: Date,
    default: () => Date.now()
  },
});

const TwitterPost = mongoose.model('TwitterPost', twitterPostSchema);

export default TwitterPost;
