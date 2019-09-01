import * as SabreDevStudio from 'sabre-dev-studio'
import Utility from './utilityfunctions'
import { SABRE_APIS } from '../constants';

export default class SabreCtrl {

    getAirlineList = (req, res) => {
        const sabre = new SabreDevStudio(Utility.getSabreConfig());

        let opt: any = {};
        let cb = (err, data) => {
            if (err) {
                res.status(500).json({ isSuccessful: false, message: 'Service Unavailable: ' + err });
            } else {
                res.status(200).json({ isSuccessful: true, result: JSON.parse(data) });
            }
        };
        sabre.get(SABRE_APIS.AIRLINE_LIST, opt, cb);
    }
    getLowPriceFares = (req, res) => {
        const sabre = new SabreDevStudio(Utility.getSabreConfig());

        let opt: any = {};
        let cb = (err, data) => {
            if (err) {
                res.status(500).json({ isSuccessful: false, message: 'Service Unavailable: ' + err });
            } else {
                res.status(200).json({ isSuccessful: true, result: JSON.parse(data) });
            }
        };
        console.log(req.params.city)
        sabre.get(`${SABRE_APIS.LOW_PRICE_LOOKUP}/${req.params.city}`, opt, cb);
    }
    getGeoLocation = (req,res) =>{
        const sabre = new SabreDevStudio(Utility.getSabreConfig());

        let opt: any = {};
        let cb = (err, data) => {
            if (err) {
                res.status(500).json({ isSuccessful: false, message: 'Service Unavailable: ' + err });
            } else {
                res.status(200).json({ isSuccessful: true, result: JSON.parse(data) });
            }
        };
        sabre.get(`${SABRE_APIS.GEO_AUTOCOMPELETE}?query=${req.params.city}&limit=5`, opt, cb);
        
    }


}


