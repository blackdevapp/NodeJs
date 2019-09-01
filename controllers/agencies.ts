// import Agencies from '../models/agencies';
import * as bcrypt from 'bcryptjs';

import BaseCtrl from './base';
import UserModel from '../models/user';
import MailCtrl from "./mailcontroller";
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import Utility from "./utilityfunctions";
import Agencies from "../models/agencies";
import EmailValidation from "./emailValidation";

var CryptoJS = require("crypto-js");

export default class AgenciesCtrl extends BaseCtrl {
    // model = Agencies;
    model = Agencies;
    adminModel = UserModel;
    // testData = TestData;

    options = {
        page: 1,
        limit: 10
    };
    getAgencyByFilter = (req, res) => {
        const agency_id = req.headers['associated_agency'];
        console.log(agency_id)
        this.model.findOne({agency_id: agency_id}, (err, agency) => {
            if (err) {
                return console.error(err);
            }
            return res.status(200).json({isSuccessful: true, result: agency});
        });
    };
    getAgencyConfig = (req, res) => {
        this.model.findOne({agency_id: req.query.agency_id}).select('config').exec(function (err, agency) {
            if (agency) {
                res.status(200).json({isSuccessful: true, agency: agency})
            } else {
                res.status(200).json({isSuccessful: false,})
            }
        })
    };
    getAgencyByFilterQuery = (req, res) => {
        const agency_id = req.query.agency_id;
        this.model.findOne({agency_id: agency_id}, (err, agency) => {
            if (err) {
                return console.error(err);
            }
            return res.status(200).json({isSuccessful: true, result: agency});
        });
    }
    getAgancyCodeByWebsite = (req, res) => {
        let agancy_finder = {website: req.query.url}
        this.model.findOne(agancy_finder).select('agency_id').exec(function (err, agancy) {
            if (agancy.agency_id) {
                return res.status(200).json({isSuccessful: true, code: agancy.agency_id})
            } else {
                // return res.status(200).json({isSuccessful:false})
                res.redirect('https://nextjourney.co')


            }
        })
    }
    getFormByAgency = (req, res) => {
        const agency_id = req.query['associated_agency'],
            formName = req.query['form'];
        // console.log(agency_id)
        this.model.aggregate([
                // {
                {$match: {agency_id: agency_id, forms: {$elemMatch: {name: formName}}}},
                {
                    $project: {
                        list: {
                            $filter: {
                                input: '$forms',
                                as: 'form',
                                cond: {$eq: ['$$form.name', formName]}
                            }
                        }
                    }
                }
            ],
            (err, agency) => {
                if (err) {
                    return console.error(err);
                }
                return res.status(200).json({isSuccessful: true, result: agency});
            });
    }
    getAllFormByAgency = (req, res) => {
        // const agency_id = req.headers['associated_agency'];
        const agency_id = req.query['associated_agency'];
        // console.log(agency_id)
        this.model.aggregate([
                // {
                {$match: {agency_id: agency_id}},
                {
                    $project: {
                        forms: 1
                    }
                },
            ],
            (err, agency) => {
                if (err) {
                    return console.error(err);
                }
                return res.status(200).json({isSuccessful: true, result: agency});
            });
    }
    insertFormByAgency = (req, res) => {
        const resp = {isSuccessful: true, message: 'Successfully Created a form'}
        this.model.findOneAndUpdate({agency_id: req.body.agency_id}, {$push: {forms: req.body.form}}, (err) => {
            if (err) {
                resp.message = err
                return res.json(resp);
            }
            resp.isSuccessful = true
            return res.json(resp);
        });
    }
    editFormByAgency = (req, res) => {
        const resp = {isSuccessful: true, message: 'Successfully Update a form'}
        this.model.findOneAndUpdate({agency_id: req.body.agency_id}, {$set: {"forms": req.body.form}}, (err) => {
            if (err) {
                resp.message = err
                return res.json(resp);
            }
            resp.isSuccessful = true
            return res.json(resp);
        });
    }
    // Insert
    insertAgency = (req, res) => {
        const adminObj = new this.adminModel(req.body),
            agencyObj = new this.model();

        let referralCode = '',
            adminId = '',
            agency_id = 'nj' + (Math.round((Math.pow(36, 7 + 1) - Math.random() * Math.pow(36, 7))).toString(36).slice(1));
        adminObj.password = '123456';
        adminObj.associated_agency = agency_id;
        agencyObj.agency_id = adminObj.associated_agency;
        const emailValidation = new EmailValidation()

        emailValidation.chackEmail(req.body.email).then(mail => {
            if (mail === 200) {
                adminObj.save((err, admin) => {

                    if (err && err.code === 11000) {
                        return res.status(400).json({isSuccessful: false, message: 'Duplicate key error'});
                    } else {

                        adminId = adminObj._id;
                    }
                    if (err) {
                        return res.json({isSuccessful: false, message: err});
                    }

                    agencyObj.admin = admin._id;
                    agencyObj.onboarded = false;
                    agencyObj.permissions = req.body.permissions;
                    agencyObj.save((err, agency) => {

                        // 11000 is the code for duplicate key error
                        if (err && err.code === 11000) {
                            res.sendStatus(400);
                        } else {
                            const content = new Content();
                            const template = new Template();
                            MailCtrl.sendEmailReq(req.body.email, template.template1(content.agencyInsert(agency.agency_id)));
                            referralCode = agency.agency_id;
                            res.status(200).json({
                                referralCode: referralCode,
                                admin: adminId
                            })
                        }

                    })
                })
            } else {
                return res.json({isSuccessful: false, message: 'Email is invalid'});

            }
        })

    }
    getAllWithId = (req, res) => {
        this.options.page = parseInt(req.params.page);
        this.options.limit = parseInt(req.params.limit);
        this.model.paginate({deleted: false}, this.options, (err, docs) => {
            if (err) {
                return console.error(err);
            }
            res.status(200).json(docs);
        });
    };
    updateAmadeusApiInfo = (req, res) => {
        this.model.findOneAndUpdate({agency_id: req.body.agency_id}, {amadeus_api: req.body.amadeus_api}, (err) => {
            if (err) {
                return res.status(200).json({isSuccessful: false});
            }
            return res.status(200).json({isSuccessful: true});
        });
    }

    static getAmadeusInfo(agency_id): any {
        Agencies.findOne({agency_id: agency_id}).select('amadeus_api').exec(function (err, someValue) {
            if (err) return false;
            var amadeusConfig = CryptoJS.AES.decrypt(someValue.amadeus_api, 'NextJourneyAmadeusSecretKey');
            return JSON.parse(amadeusConfig.toString(CryptoJS.enc.Utf8));
        });
    }
}
