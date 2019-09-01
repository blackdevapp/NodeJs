import * as Amadeus from 'amadeus';
import Utility from './utilityfunctions'
import AgenciesCtrl from "./agencies";
import Agencies from "../models/agencies";
import JWTctrl from "./authcontroller";

export default class AmadeusCtrl {
// const sabre = new SabreDevStudio(Utility.getSabreConfig());

  getAirportsList = (req, res) => {

    var amadeus = new Amadeus(Utility.getAmadeusConfig());

    let opt: any = {};
    let cb = (err, data) => {
      if (err) {
        res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
      } else {
        res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
      }
    };
    amadeus.referenceData.locations.get({
      subType: 'AIRPORT',
      keyword: req.params.city,
      'page[limit]': 10,
      'page[offset]': 0,
      sort: 'analytics.travelers.score',
      view: 'FULL'
    }).then(function (data) {
      let body = data.result.data;
      res.status(200).json({isSuccessful: true, result: body});
    }).catch(function (responseError) {
      res.status(500).json({isSuccessful: false, result: responseError});
    });
  }
  getFlightOffers = (req, res) => {
    // console.log(AgenciesCtrl.getAmadeusInfo('nj9AsGI11'));
    Agencies.findOne({agency_id: req.query.agency_id}).select('amadeus_api').exec(function (err, someValue) {
      if (err) return res.status(500).json({isSuccessful: false});
      if (someValue.amadeus_api) {
        someValue.decryptAmadeus(someValue.amadeus_api, (error, value) => {
          if (!value) {
            return res.sendStatus(403);
          }
          var amadeus = new Amadeus(value);
          console.log(value)

          let opt: any = {};
          let cb = (err, data) => {
            if (err) {
              res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
            } else {
              res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
            }
          };

          // Flight Low-fare Search
          amadeus.shopping.flightOffers.get({
            origin: req.body.origin,
            destination: req.body.destination,
            departureDate: req.body.departureDate,
            max: 10,
            // 'page[offset]':0,
            // sort:'pricePerAdult.total',
          }).then(function (data) {
            // let body = data.result.data;
            let body = Utility.unifyAirfareAmadeus(data.result.data, data.result.dictionaries.currencies);
            // let body =data
            res.status(200).json({isSuccessful: true, result: body});
          }).catch(function (responseError) {
            res.status(500).json({isSuccessful: false, result: responseError});
          });
        });

      } else {
        return res.status(200).json({isSuccessful: false});
      }
    });

  }
  getHotelOffers = (req, res, next) => {
    Agencies.findOne({agency_id: req.query.agency_id}).select('amadeus_api').exec(function (err, someValue) {
      if (err) return res.status(500).json({isSuccessful: false});
      if (someValue.amadeus_api) {
        someValue.decryptAmadeus(someValue.amadeus_api, (error, value) => {
          if (!value) {
            return res.sendStatus(403);
          }
          var amadeus = new Amadeus(value);

          let opt: any = {};
          let cb = (err, data) => {
            if (err) {
              res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
            } else {
              res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
            }
          };
          amadeus.shopping.hotelOffers.get({
            cityCode: req.params.cityCode,
            // sort:'price.total',
            max: 10,
            // 'page[offset]':0
          }).then(function (data) {
            // let body = data.result.data;
            // let body = data;
            let body = Utility.unifyHotelAmadeus(data.result.data);
            res.status(200).json({isSuccessful: true, result: body});
          }).catch(function (responseError) {
            res.status(500).json({isSuccessful: false, result: responseError});
          });
        });

      } else {
        return res.status(200).json({isSuccessful: false});
      }
    });

  }
  getCityInfo = (req, res) => {
    var amadeus = new Amadeus(Utility.getAmadeusConfig());
    amadeus.referenceData.locations.get({
      keyword: req.params.cityName,
      subType: req.query.type ? req.query.type : 'AIRPORT,CITY'
    }).then(function (data) {
      res.status(200).json(JSON.parse(data.body).data);
    }).catch(function (responseError) {
      res.status(500).json({isSuccessful: false, result: responseError});
    });
  }

}
// amadeus.referenceData.urls.checkinLinks.get({
//   airlineCode: 'BA'
// }).then(function(response){
//   console.log(response.data[0].href);
// }).catch(function(responseError){
//   console.log(responseError.code);
// });
