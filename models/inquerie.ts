import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

mongoose.Promise = global.Promise;
import MailCtrl from '../controllers/mailcontroller'
import User from "./user";
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import Package from './package';
import Component from './component';
import Notification from "./notification";

const {book} = require("medici");

function wait(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time)
    })
}

const inquerieSchema = new mongoose.Schema({
    type: {type: String, enum: ['VISAPROCESS', 'BOOK','CHECKOUT'], default: 'BOOK'},
    inquirer: String,
    special_inst: String,
    deleted: {
        type: Boolean,
        default: false
    }, is_paid: {
        type: Boolean,
        default: false
    },
    publishedDate: {
        type: Date,
        default: () => Date.now()
    },
    updatedDate: {
        type: Date,
        default: () => Date.now()
    },
    details: Object,
    to: String,
    seen: {
        type: Boolean,
        default: false
    },
    mode: String,
    request: {
        type: String,
        default: '5c0e527404e046000406a1b7'
    },
    status: {type: String}

});
inquerieSchema.virtual('user', {
    ref: 'User',
    localField: 'inquirer',
    foreignField: '_id',
    justOne: true
});
inquerieSchema.post('save', function (doc, next) {

    const query = User.findOne({_id: doc.inquirer, deleted: false}).select('email firstName lastName');

    query.exec(async function (err, item) {
        if (err) {
            return console.error(err);
        }
        const content = new Content();
        const template = new Template();
        MailCtrl.sendEmailReq(item.email, template.template1(content.inqueryInsert(item.firstName, item.lastName, doc.type, doc.request)));
        if (doc.type == 'BOOK') {
            let details = {};
            details['details'] = doc.details;
            details['status'] = doc.status;
            details['inquery_id'] = doc._id;
            let notification = {
                type: 'BOOK',
                details: details,
                user_role: 'admin',
                agency_id: doc.to,
                user_id:doc.inquirer,
                seen: false
            }
            notification.details['packageId'] = doc.request;
            const obj = new Notification(notification);
            obj.save((err, item) => {
                next()
            });

        }else if(doc.type==='CHECKOUT'){
            const myBook2 = new book(doc.request);
            let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
            await myBook2.entry('Received payment')
                .debit('Assets:Cash', -parseFloat(doc.special_inst.split(' ')[0]), {client: doc.inquirer})
                .credit('Income', -parseFloat(doc.special_inst.split(' ')[0]), {
                    invoiceNo: invoiceNo,
                    client: doc.inquirer,
                    agency: doc.to,
                    type:'manual',
                    currency: doc.special_inst.split(' ')[1]
                })
                .commit();
            next()
        } else {
            const myBook2 = new book(doc.request);
            let form = JSON.parse(doc.special_inst).form;
            console.log(form);
            let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
            await myBook2.entry('Received payment')
                .debit('Assets:Cash', parseFloat(form.price), {client: doc.inquirer})
                .credit('Income', parseFloat(form.price), {
                    invoiceNo: invoiceNo,
                    client: doc.inquirer,
                    agency: doc.to,
                    from: doc.to,
                    form: form,
                    type: 'VISA_PROCCESS',
                    currency: form.currency
                })
                .commit();
            let details = {};
            details['details'] = doc.special_inst;
            details['status'] = doc.status;
            details['inquery_id'] = doc._id;
            let notification = {
                type: 'VISA',
                details: details,
                user_role: 'admin',
                user_id:doc.inquirer,
                agency_id: doc.to,
                seen: false
            }
            const obj = new Notification(notification);
            obj.save((err, item) => {
                next()
            });
        }
        // next()
    });
});


inquerieSchema.post('findOneAndUpdate', function (doc, next) {

    const query = User.findOne({_id: doc.inquirer, deleted: false}).select('email firstName lastName');

    query.exec(async function (err, item) {

        if (err) {
            return console.error(err);
        }
        const content = new Content();
        const template = new Template();
        if (doc.deleted) {
            MailCtrl.sendEmailReq(item.email, template.template1(content.deleteInquery(item.firstName, item.lastName, doc.type, doc.request)));
            next();
        } else {
            if(doc.type==='CHECKOUT'){
                // 'APPROVED', 'REJECTED'
                if(doc.status==='APPROVED'){
                    MailCtrl.sendEmailReq(item.email, template.template1(content.updateInquery(item.firstName, item.lastName, doc.type, doc.request, doc.status)));
                    next()
                }else if(doc.status==='REJECTED'){
                    MailCtrl.sendEmailReq(item.email, template.template1(content.updateInquery(item.firstName, item.lastName, doc.type, doc.request, doc.status)));
                    const myBook2 = new book(doc.request);
                    let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                    await myBook2.entry('Received payment')
                        .debit('Assets:Cash', parseFloat(doc.special_inst.split(' ')[0]), {client: doc.inquirer})
                        .credit('Income', parseFloat(doc.special_inst.split(' ')[0]), {
                            invoiceNo: invoiceNo,
                            client: doc.inquirer,
                            agency: doc.to,
                            type:'manual',
                            currency: doc.special_inst.split(' ')[1]
                        })
                        .commit();
                    next()
                }
            }else{
                MailCtrl.sendEmailReq(item.email, template.template1(content.updateInquery(item.firstName, item.lastName, doc.type, doc.request, doc.status)));
                next()
            }
        }
        var notification;
        if(doc.type!=='CHECKOUT'){

            if (doc.type == 'BOOK') {
                let details = {};
                details['details'] = doc.details;
                details['status'] = doc.status;
                notification = {
                    type: 'BOOK',
                    details: details,
                    user_role: 'admin',
                    agency_id: doc.to,
                    user_id:doc.inquirer,
                    seen: false
                };
                notification.details['packageId'] = doc.request;
            } else {
                let details = {};
                details['details'] = doc.special_inst;
                details['status'] = doc.status;
                notification = {
                    type: 'VISA',
                    details: details,
                    user_role: 'admin',
                    agency_id: doc.to,
                    user_id:doc.inquirer,
                    seen: false
                };

            }
            let notifFinder = {};
            notifFinder['details.inquery_id'] = doc._id;
            Notification.findOneAndUpdate(notifFinder, notification, (err, doc) => {
                if (err) {
                    next();
                    return console.error(err);
                }
                if (doc) {
                    next();
                }
            });
        }else{
            next()
        }



    });
});


inquerieSchema.plugin(mongoosePaginate);

const Inquerie = mongoose.model('Inquerie', inquerieSchema);

export default Inquerie;
