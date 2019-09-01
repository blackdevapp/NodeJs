import {SKYSCANNER_APIS} from "../constants";

const request = require('request-promise');

export default class SkyScanner {
  airplanes:Array<SkyScannerModel>=[];
  getSearchAirplaneResult=(req,res)=>{
    var option = {
      method: 'GET',
      uri: `${SKYSCANNER_APIS.AIRLINE_LIST}${req.query.city}?IsDestination=${req.query.destination}&enable_general_search_v2=true`,
      json:true
    };
    request(option).then(list => {
      this.airplanes=list;
      res.status(200).json({isSuccessful:true,result:list})
    }).catch(e => {
      res.status(500).json({isSuccessful:false,error:e})
    });
  }
}
export class SkyScannerModel {

}
