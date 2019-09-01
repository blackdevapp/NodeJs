import Airports from '../models/airports';
import BaseCtrl from './base';

export default class AirportsCtrl extends BaseCtrl {
  model = Airports;
  
  getByStrongFilter = (req, res) => {
    this.model.find(req.body, (err, docs) => {
      if (err) { return console.error(err); }
      res.status(200).json(docs);
    });
  }
}
