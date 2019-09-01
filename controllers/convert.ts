import Agencies from "../models/agencies";
import User from "../models/user";
const fs = require('fs');


export default class ConvertCtrl{
    convertAganciesData=(req,res)=>{
        // let rawdata = fs.readFileSync('agency-data.json');
        // let agencies = JSON.parse(rawdata);
        // Agencies.find().exec(function (agencies, err) {
        //     console.log(err,agencies);
            let agencies=[];
            let users=[];
            let agency=[];
            agencies.forEach(function (item, index) {
                item.telephone_number = item.telephone_number.replace(/ /g, "");
                item.mobile_number = item.mobile_number.replace(/ /g, "");
                item.email_address = item.email_address.replace(/ /g, "").toLowerCase();
                item.company_name = item.company_name.toLowerCase();
                item.official_representative = item.email_address.toLowerCase();
                item.website = item.website.toLowerCase();
                let emails=[];
                if(item.email_address.indexOf(';')>-1){
                    emails=item.email_address.split(';')
                }else if(item.email_address.indexOf(';')>-1){
                    emails=item.email_address.split(',')
                }


                let temp={
                    admin: '',
                    company_name: item.company_name,
                    city: item.city,
                    logo: item.logo,
                    official_representative: item.official_representative,
                    alternative_representative: [item.alternate_representative?item.alternate_representative:''],
                    telephone_number: item.telephone_number.split(';'),
                    mobile_number: item.mobile_number.split(';'),
                    fax_number: [item.fax_number?item.fax_number:''],
                    email_address: emails,
                    location: item.location,
                    office_address: [item.office_address],
                    social_media:{},
                    amadeus_api:'',
                    taxIdentificationNo: '',
                    bankAccounts: {},
                    website:  item.website,
                    services: item.services,
                    deleted: false,
                    onboarded:false,
                    agency_id: item.agency_id,
                    config:{},
                    members: [],
                    forms: [],
                }
                for(let email of emails){
                    let user={
                        username:email,
                        firstName: '',
                        lastName: '',
                        title:  'Mr.',
                        address: item.location,
                        state: '',
                        city: item.city,
                        company_name: item.company_name,
                        age: 20,
                        purposeOfVisit: 'others',
                        mobileNo: '',
                        email: email,
                        password:'$2a$10$lwwRwkTvolooe4aVorivYO5Kf5MRsD8Mz46CSXcB1F8hLl9vIO76a',
                        deleted: false,
                        role: 'admin',
                        associated_agency:item.agency_id,
                        markup:0,
                        agency_id:item.agency_id ,
                    }
                    users.push(user);

                }

                agency.push(temp);

                if(index===agencies.length-1){
                    return res.status(200).json({users:users})
                }
            })
        // })
    }
    createMultiUsers=(req,res)=>{
        let create = (body) => {
            return new Promise((resolve, reject) => {
                User.save( body, (err,item) => {
                    if (err) { return console.error(err); }
                    resolve(item._id);
                });
            })
        }
        req.body.users.forEach(function (user, index) {
            create(user).then(result=>{
                if(result){
                    if(index===req.body.users.length-1){
                        return res.status(200).json({success:true})
                    }
                }
            })
        })
    }
}
