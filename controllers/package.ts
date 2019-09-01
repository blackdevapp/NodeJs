import Package from '../models/package';
import BaseCtrl from './base';
import { PIXABAY_API } from '../constants';
import Component from "../models/component";
import PaymentCtrl from "./payments";
import {Memory} from "../../client/app/base/memory";
const request = require('request-promise');
const download = require('image-downloader')

export default class PackageCtrl extends BaseCtrl {
  model = Package;
  pictures: Array<PixabayModel>=[];
  options = {
    page: 1,
    limit: 10
  };
  paymentCtrl=new PaymentCtrl();
  checkValidForBook=(req,res)=>{
    let obj={
      packageId:req.body.packageId,
      adultCount:req.body.adultCount?req.body.adultCount:0,
      childCount:req.body.childCount?req.body.childCount:0,
      infantCount:req.body.infantCount?req.body.infantCount:0,
      agency_id:req.body.agencyId,
    };



    let totalCount=obj.adultCount+obj.childCount+obj.infantCount;
    Package.findOne({ "_id": obj.packageId }, async (err, docs) => {
      if (err) { return console.error(err); }
      if (docs.components.length > 0) {
        Component.find({ "_id": { "$in": docs.components }, deleted: false }, (err, componentRes) => {
          if (err) { return console.error(err); }
          for (let item of componentRes) {
            if(!(item.quantity>0&&item.quantity>=totalCount)){
              return res.status(200).json({isSuccessful:false});
            }
          }
          this.paymentCtrl.paypal(req,res).then(url=>{
            console.log(url);
            return res.status(200).json({isSuccessful:true,result:url});
          });
        })
      }else if(docs.externalResources.length>0){
        this.paymentCtrl.paypal(req,res).then(url=>{
          console.log(url);
          return res.status(200).json({isSuccessful:true,result:url});
        });
      }else{
        return res.status(200).json({isSuccessful:false});
      }
    })
  }
  checkValidForCustomBook=(req,res)=>{
    let obj={
      details:req.body.details,
      inqueryId:req.body.id,
      userId: req.body.userId,
      redirectRoute: req.body.redirectRoute,
      packageId:req.body.packageId,
      agency_id:req.body.agency_id,
    };
    // let totalCount=obj.adultCount+obj.childCount+obj.infantCount;
    Package.findOne({ "_id": obj.packageId }, async (err, docs) => {
      if (err) { return console.error(err); }
      if (docs.components.length > 0) {
        Component.find({ "_id": { "$in": docs.components }, deleted: false }, (err, componentRes) => {
          if (err) { return console.error(err); }
          for (let item of componentRes) {
            let detail=obj.details[item._id];
            let totalCount=detail.count.adult+detail.count.children+detail.count.infant;
            if(!(item.quantity>0&&item.quantity>=totalCount)){
              return res.status(200).json({isSuccessful:false});
            }
          }
          this.paymentCtrl.paypalCustom(req,res).then(url=>{
            return res.status(200).json({isSuccessful:true,result:url});
          });
        })
      }else if(docs.externalResources){
        this.paymentCtrl.paypalCustom(req,res).then(url=>{
          return res.status(200).json({isSuccessful:true,result:url});
        });
      }else{
        return res.status(200).json({isSuccessful:false});
      }
    })
  }
  getByStrongFilter = (req, res) => {
    this.model.find(req.body, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
  getBestSellers=(req,res)=>{
    this.model.find({associated_agency:req.query.agency_id,hasExternal:false,deleted:false}).sort({bought: -1}).limit(3).exec(
      function(err, packages) {
        return res.status(200).json({isSuccessful:true,results:packages})
      }
    );
  };
  getByFilterPagination = (req, res) => {
    this.options.page = parseInt(req.params.page);
    this.options.limit = parseInt(req.params.limit);
    let query = {},
      data = req.params.params.split('&');

    data.forEach((v, k) => {
      let key = v.split('=')[0],
        value = v.split('=')[1];
      query[key] = value;
    })
    query['deleted'] = false;
    if (query['count'] && query['count'] === "1") {

      delete query['count'];

      this.model.countDocuments(query, (err, docs) => {
        if (err) { return console.error(err); }
        res.status(200).json(docs);
      });
    }else{
      this.model.find(query,{},{ skip: (parseInt(req.params.page)-1)*parseInt(req.params.limit), limit: parseInt(req.params.limit) }).sort({publishedDate: 'desc'}).exec(
        function(err, packages) {
          return res.status(200).json({isSuccessful:true,results:packages})
        }
      );



      // , (err, docs) => {
      //   if (err) { return console.error(err); }
      //   res.status(200).json(docs);
      // });
    }

  }
  getImageSuggestion = (req,res) =>{
    console.log(PIXABAY_API.QUERY)
    let total = `&per_page=5&page=1`
    if(req.params.query.split('&')[1].split('=')[1] === 'true'){
      total = ''
    }
  	var option = {

      method: 'GET',
      uri: `${PIXABAY_API.QUERY}key=${process.env.PIXABAY_KEY}&q=${req.params.query}${total}`,
      json:true

    };
    request(option).then(list => {
      this.pictures=list;
      console.log(this.pictures);
      res.status(200).json({isSuccessful:true,result:list})
    }).catch(e => {
      res.status(500).json({isSuccessful:false,error:e})
    });
  }
  insertPackage=(req,res)=>{
    console.log('omad')
    let packages=req.body;
    let images=[];
    let removedIndex=[]
    console.log(12321323213,packages);
    if(packages.images){
      packages.images.forEach((image,index)=>{
        console.log(image.indexOf('pixabay.com')>-1)
        if(image.indexOf('pixabay.com')>-1){
          let fileName=image.split('/')[image.split('/').length-1];
          fileName=fileName.substring(fileName.indexOf('.'));
          let options = {
            url: image,
            dest: '../tmp'
          }
          download.image(options)
            .then(({filename, image}) => {
              console.log('File saved to', filename)
              images.push(filename);
              removedIndex.push(index)
              if(index===packages.images.length-1){
                for (let i = removedIndex.length -1; i >= 0; i--)
                  packages.images.splice(removedIndex[i],1);
                packages.images=packages.images.concat(images)
                const obj = new this.model(packages);
                obj.save((err, item) => {
                  // 11000 is the code for duplicate key error
                  if (err && err.code === 11000) {
                    res.sendStatus(400);
                  }
                  if (err) {
                    return console.error(err);
                  }
                  res.status(200).json(item);
                });
              }
            })
            .catch((err) => {
              console.error(err)
            })
        }else{
          if(index===packages.images.length-1) {
            for (let i = removedIndex.length - 1; i >= 0; i--)
              packages.images.splice(removedIndex[i], 1);
            packages.images = packages.images.concat(images)
            const obj = new this.model(packages);
            obj.save((err, item) => {
              // 11000 is the code for duplicate key error
              if (err && err.code === 11000) {
                res.sendStatus(400);
              }
              if (err) {
                return console.error(err);
              }
              res.status(200).json(item);
            });
          }
        }
      })
    }else{
      const obj = new this.model(req.body);
      obj.save((err, item) => {
        // 11000 is the code for duplicate key error
        if (err && err.code === 11000) {
          res.sendStatus(400);
        }
        if (err) {
          return console.error(err);
        }
        res.status(200).json(item);
      });
    }

  }
}
export class PixabayModel {

}
