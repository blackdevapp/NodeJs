import * as mongoose from 'mongoose';

const telegramPostSchema = new mongoose.Schema({
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

const TelegramPost = mongoose.model('TelegramPost', telegramPostSchema);

export default TelegramPost;
