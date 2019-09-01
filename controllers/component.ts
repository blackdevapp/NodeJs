  import Component from '../models/component';
import BaseCtrl from './base';
  import * as moment from "./accounting";
  import User from "../models/user";

export default class ComponentCtrl extends BaseCtrl {
  model = Component;
  getByStrongFilter = (req, res) => {
    this.model.find(req.body, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
  getLiveData = (req,res) => {
  	res.status(200).text({test: 'test'})
  }
  getByRangeFilter = (req, res) => {
    let query = {},
      data = req.params.params.split('&');
    let fields=req.body;
    data.forEach((v, k) => {
      let key = v.split('=')[0],
        value = v.split('=')[1];
      query[key] = value;
    })
    query['deleted'] = false;
    for (let item of fields){
      if(item.type=='dateRange'&&item.value!=={}){
        query[item.name]=item.value;
      }
      if(item.type=='numberRange'&&item.value){
        query[item.name]={ $gte: item.value };

      }
    }
    let query2={};
    let query3={};
    query2=Object.assign({},query);
    query3=Object.assign({},query);
    if(!query2['type']||query2['type']==='van-driver'){
      query2['type']='van-driver';
      if(query2['details.from.departure.date']){
        delete query2['details.from.departure.date']
      }if(query2['details.to.city']){
        delete query2['details.to.city']
      }
    }
    if(!query3['type']||query2['type']==='hotel-room'){
      query3['type']='hotel-room';
      if(query3['details.from.city']){
        delete query3['details.from.city']
      }
    }


    if (query['count'] && query['count'] === "1") {

      delete query['count'];

      this.model.countDocuments(query, (err, docs) => {
        if (err) { return console.error(err); }
        res.status(200).json(docs);
      });
    }else{
      if(req.query.userId){
        let self=this;
        User.findOne({_id:req.query.userId}).select('markup').exec(function (err, user) {
          if(err){
            self.model.find({
              $or:[query,query2,query3]
            }).sort({bulkPrice: 'desc'}).limit(10).exec(function (err, docs) {
              if (err) {
                return console.error(err);
              }
              res.status(200).json(docs);
            });
          }
          if(user.markup && user.markup>0){
            self.model.find({
              $or:[query,query2,query3]
            }).sort({bulkPrice: 'desc'}).limit(10).exec(function (err, docs) {
              if (err) {
                return console.error(err);
              }
              for(let item of docs){
                item.soloPrice+=item.soloPrice*user.markup/100;
                item.soloPriceChild+=item.soloPrice*user.markup/100;
                item.bulkPrice+=item.bulkPrice*user.markup/100;
                item.bulkPriceChild+=item.bulkPriceChild*user.markup/100;
              }
              res.status(200).json(docs);
            });
          }else{
            self.model.find({
              $or:[query,query2,query3]
            }).sort({bulkPrice: 'desc'}).limit(10).exec(function (err, docs) {
              if (err) {
                return console.error(err);
              }
              res.status(200).json(docs);
            });
          }
        })

      }
      else{
        this.model.find({
          $or:[query,query2,query3]
        }).sort({bulkPrice: 'desc'}).limit(10).exec(function (err, docs) {
          if (err) {
            return console.error(err);
          }
          res.status(200).json(docs);
        });
      }

    }

  }

}
