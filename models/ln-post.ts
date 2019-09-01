import * as mongoose from 'mongoose';

const linkedinPostSchema = new mongoose.Schema({
  description:String,
  logo:String,
  title:String,
  images:[],
  hasHashtag: Boolean,
  packageId:String,
  tags:[],
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

const LinkedinPost = mongoose.model('LinkedinPost', linkedinPostSchema);

export default LinkedinPost;
