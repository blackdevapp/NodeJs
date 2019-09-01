import * as Amadeus from 'amadeus';
import Utility from './utilityfunctions'
// var NodeGeocoder = require('node-geocoder');
import * as NodeGeocoder from 'node-geocoder'
// import * as TeleportAutocomplete from 'teleport-autocomplete'

const options = {
    provider: 'teleport',
   
    // Optional depending on the providers
    // httpAdapter: 'https', // Default
    // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
    // formatter: null         // 'gpx', 'string', ...
  };
export default class CitiesCtrl {
// const sabre = new SabreDevStudio(Utility.getSabreConfig());
    
	getCity = (req, res) => {
        let geocoder = NodeGeocoder(options);
        // geocoder.geocode(req.params.cityName, function(err, res) {
        //     if(err) res.status(400).json(err);    

        //     res.status(200).json(res);    
        // });
        geocoder.geocode(req.params.cityName)
        .then((data) => {
            // console.log(res)
            res.status(200).json({ isSuccessful: true, result: data });
        })
        .catch((err) =>  {
            console.log(err)
            res.status(500).json(err);
        });
    }
    // getCitySuggestion(req,res){
    //     let list = new TeleportAutocomplete({ el: req.params.cityName, maxItems: 5 });
    //     res.status(200).json(list);
    // }

}
// amadeus.referenceData.urls.checkinLinks.get({
//   airlineCode: 'BA'
// }).then(function(response){
//   console.log(response.data[0].href);
// }).catch(function(responseError){
//   console.log(responseError.code);
// });
