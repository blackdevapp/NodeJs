import BaseCtrl from './base';
import Notification from "../models/notification";

export default class NotificationCtrl extends BaseCtrl {
    model = Notification;
    getByFilterCustom = (req, res) => {
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
            var inquery_populator = [
                {path: 'user_id', model: 'User',select:'mobileNo email _id'},
            ];
            this.model.find(query).populate(inquery_populator).exec((err, docs) => {
                if (err) { return console.error(err); }
                let self=this;
                if(docs.length>0){
                    docs.forEach(function (item, index) {
                        self.model.findByIdAndUpdate(item._id,{"$set":{seen:true}}).exec((err,data)=>{
                            if(index===docs.length-1){
                                return res.status(200).json(docs);
                            }
                        });
                    })
                }else{
                    return res.status(200).json([]);

                }
            });
        }
    };
}
