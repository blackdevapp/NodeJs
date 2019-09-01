import * as mongoose from 'mongoose';

const facebookPostSchema = new mongoose.Schema({
  tags:[],
  packageId:String,
  postId:String,
  pageName:String,
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
  }
});

const FacebookPost = mongoose.model('FacebookPost', facebookPostSchema);

export default FacebookPost;
