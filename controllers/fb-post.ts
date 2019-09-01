import BaseCtrl from './base';
import FacebookPost from "../models/fb-post";
import TestData from "../models/test";
import Utility from "./utilityfunctions";
const request = require('request-promise');

export default class FacebookPostCtrl extends BaseCtrl {
  model = FacebookPost;


  getAllFacebookPost=(req,res)=>{
    TestData.findOne({agency_id:req.query.agency_id},(err,agency)=>{
      if (err) { return console.error(err); }
      this.model.find({ deleted: false,associated_agency: req.query.agency_id}, (err, docs) => {
        if (err) { return console.error(err); }
        let result=[];
        if(docs.length>0){
          docs.forEach(function (item,index) {
            if(item.postId){
              const post = {
                method: 'GET',
                uri: `https://graph.facebook.com/v2.6/${item.postId}?access_token=${agency.social_media.facebook.token}&fields=shares,message,likes.summary(true),comments.summary(true),link,created_time,name,caption`,
                json: true
              };
              request(post).then(res1=>{
                result.push(Utility.unifyFacebookPost(res1,item))
                if(index===docs.length-1){
                  return res.status(200).json({isSuccessful:true,result:result})
                }
              }).catch(err=>{
                console.error(err)
              })
            }
          })

        }else{
          return res.status(200).json({isSuccessful:true,result:[]})
        }
      });
    });

  }
}
