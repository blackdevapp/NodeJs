import Inquerie from '../models/inquerie';
import BaseCtrl from './base';
import MailCtrl from "./mailcontroller";
import * as moment from "./accounting";

export default class InquerieCtrl extends BaseCtrl {
  model = Inquerie;

  // getAllWithId
  // getAllWithId = (req, res) => {
  //   this.model.find({deleted: false, to :req.params.agencyId}, (err, docs) => {
  //     if (err) { return console.error(err); }
  //     res.status(200).json(docs);
  //   });
  // }
  options = {
    page: 1,
    limit: 10
  };

  // getAllWithId
  getAllWithId = (req, res) => {
  	this.options.page = parseInt(req.params.page);
  	this.options.limit = parseInt(req.params.limit);
    this.model.paginate({deleted: false, to :req.params.agencyId},this.options, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
  getLastInquery=(req,res)=>{
    this.model.find({to:req.query.agency_id},{},{ skip: 0, limit: parseInt(req.query.count) }).sort({publishedDate: 'desc'}).exec(function (err, docs) {
      if (err) {
        return console.error(err);
      }
      res.status(200).json({isSuccessful: true, result: docs});
    });
  }

  getAllInqueryByFilter=(req,res)=>{
    let query = {},
      data = req.params.params.split('&');

    let userFinder={};
    data.forEach((v, k) => {
      let key = v.split('=')[0],
        value = v.split('=')[1];
      if(key=='mobile'){
        userFinder['mobileNo']=value
      }else if(key =='email'){
        userFinder[key]=value
      }else{
        query[key] = value;

      }
    });
    if(!query['deleted']){
      query['deleted'] = false;
    }if(!query['type']){
      query['type'] = { "$ne": 'CHECKOUT' };
    }
    var inquery_populator = [
      {path: 'inquirer', model: 'User', match: userFinder,select:'mobileNo email _id'},
    ];

  // ,{},{
  //     skip: (parseInt(req.params.page) - 1) * parseInt(req.params.limit),
  //       limit: parseInt(req.params.limit)
  //   }
    this.model.find(query).populate(inquery_populator).exec(function (err,result) {
      if(err)
        return res.status(200).json({isSuccessful:false,result:result})
      result=result.filter(function (item) {
        if(item.inquirer){
          return item;
        }
      })
      return res.status(200).json({isSuccessful:true,result:result})
    })


  }



  getNotification = (req, res) => {
    let query = {},
        data = req.params.params.split('&');

    let userFinder={};
    data.forEach((v, k) => {
      let key = v.split('=')[0],
          value = v.split('=')[1];
        query[key] = value;
    });
    if(!query['deleted']){
      query['deleted'] = false;
    }
    var inquery_populator = [
      {path: 'inquirer', model: 'User', match: userFinder,select:'mobileNo email _id'},
    ];
    this.model.find(query).populate(inquery_populator).exec(function (err,result) {
      if(err)
        return res.status(200).json({isSuccessful:false,result:result})
      result=result.filter(function (item) {
        if(item.inquirer){
          return item;
        }

      });
      return res.status(200).json({isSuccessful:true,result:result})
    })
  }
  getByFilterCheckout=(req,res)=>{
    let query = {},
        data = req.params.params.split('&');

    data.forEach((v, k) => {
      let key = v.split('=')[0],
          value = v.split('=')[1];
      query[key] = value;
    });
    if(!query['deleted']){
      query['deleted'] = false;
    }
    if (query['count'] && query['count'] === "1") {
      delete query['count'];
      this.model.countDocuments(query, (err, docs) => {
        if (err) { return console.error(err); }
        res.status(200).json(docs);
      });
    }else{
      let userFinder={};

      var inquery_populator = [
        {path: 'inquirer', model: 'User', match: userFinder,select:'mobileNo email _id'},
      ];
      this.model.find(query).populate(inquery_populator).exec(function (err,result) {
        if(err)
          return res.status(200).json({isSuccessful:false,result:result})
        result=result.filter(function (item) {
          if(item.inquirer){
            return item;
          }

        });
        return res.status(200).json({isSuccessful:true,result:result})
      })
    }
  }
}
