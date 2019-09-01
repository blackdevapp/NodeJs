import Countries from '../models/countries';
import BaseCtrl from './base';

export default class CountriesCtrl extends BaseCtrl {
  model = Countries;

  autoSuggestion = (req, res) => {
    var regex = new RegExp(req.params.q, 'i');
    console.log(regex);
    var query = this.model.find({ "official_name_en": regex }, {
      'official_name_en': 1,
      'ISO3166-1-Alpha-3': 1
    }).limit(20);
    // var query = User.find({fullname: regex}, { 'fullname': 1 }).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    console.log(query);
    // Execute query in a callback and return users list
    query.exec(function (err, users) {
      if (!err) {
        // Method to construct the json result set
        // var result = buildResultSet(users); 
        res.status(200).json(users);
      } else {
        res.send(JSON.stringify(err), {
          'Content-Type': 'application/json'
        }, 404);
      }
    });
  }
}
 