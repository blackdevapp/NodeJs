import * as mongoose from 'mongoose';

const youtubePostSchema = new mongoose.Schema({
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
  youtubeRes:String,
  associated_agency: {
    type: String,
    default: ''
  },
  publishedDate: {
    type: Date,
    default: () => Date.now()
  },
});

const YoutubePost = mongoose.model('YoutubePost', youtubePostSchema);

export default YoutubePost;
