import BaseCtrl from './base';
import Newsletter from '../models/newsletter';

export default class NewsletterCtrl extends BaseCtrl {
  model = Newsletter;
  insertNewsletter=(req,res)=>{
    this.model.findOne({email:req.body.email}, (err, letter) => {
      const resp = { isSuccessful: true, message: 'Successfully Added to Newsletter'}
      if(letter){
        resp.isSuccessful=false;
        resp.message='Email was existed'
        return res.status(400).json(resp)
      }
      const obj = new this.model(req.body);
      obj.save((err, item) => {
        if (err && err.code === 11000) {
          res.sendStatus(400);
        }
        if (err) {
          return console.error(err);
        }
        return res.status(200).json(item);
      })

    })
  }
}