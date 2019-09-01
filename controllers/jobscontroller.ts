import Agencies from '../models/agencies';
import BaseCtrl from './base';

export default class TestJobsCtrl extends BaseCtrl {
  model = Agencies;

  generateAgencyId = (req, res) => {

    // this.testData.findOneAndUpdate({ _id: '5c0bec69b66b6d15bc49045c' }, { agency_id: 'nj9AsGI111' }, (err) => {
    //   if (err) { return console.error(err); }
    //   res.sendStatus(200);
    // });

    this.model.find(req.body, (err, docs) => {
      if (err) { return console.error(err); }
      // let agency = docs[0]
      // console.log(agency)
      // this.testData.findOneAndUpdate({ _id: agency.id }, agency, (err) => {
      //   if (err) { return console.error(err); }
      //   res.sendStatus(200);
      // });

      // docs.forEach(agency => {
      //   agency.agency_id = `nj${randomstring.generate(7)}`
      //   this.model.findOneAndUpdate({ _id: agency.id }, agency, (err) => {
      //     if (err) { return console.error(err); }
      //     // res.sendStatus(200);
      //   });

      //   // delete agency['_id'];
      //   // const obj = new this.testData(
      //   //   {
      //   //     company_name: agency.company_name,
      //   //     city: agency.city,
      //   //     logo: agency.logo,
      //   //     official_representative: agency.official_representative,
      //   //     alternative_representative: agency.alternative_representative,
      //   //     telephone_number: agency.telephone_number,
      //   //     mobile_number: agency.mobile_number,
      //   //     fax_number: agency.fax_number,
      //   //     email_address: agency.email_address,
      //   //     location: agency.location,
      //   //     office_address: agency.office_address,
      //   //     website: agency.website,
      //   //     services: agency.services
      //   //   }
      //   // );

      //   // obj.save((err, item) => {
      //   //   if (err && err.code === 11000) { res.sendStatus(400);  }
      //   //   if (err) {  return console.error(err);  }
      //   //   // res.status(200).json(item);
      //   // });

      // });

      res.status(200).json(docs);
    });
  }

}
