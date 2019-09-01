import {async} from "q";

const {book} = require("medici");
import * as mongoose from 'mongoose';
import Package from "../models/package";
import Component from "../models/component";
import BaseCtrl from "./base";
import * as moment from 'moment';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import Transaction from "../models/transaction";
import * as https from "https";
import {InquiryModel} from "../../client/app/shared/models/inquiry.model";
import Inquerie from "../models/inquerie";
import User from "../models/user";
import Agencies from "../models/agencies";

const request = require('request-promise');

const PDFDocument = require('pdfkit');
const fs = require('fs');
// const blobStream = require('blob-stream');

export default class Accounting extends BaseCtrl {

    transactionModel = mongoose.model("Medici_Transaction");

    journalModel = mongoose.model("Medici_Journal");
    model = mongoose.model("Medici_Transaction");
    options = {
        page: 1,
        limit: 10
    };

    insertAccounting = async (req, res) => {
        Package.findOne({"_id": req.body.packageId}, async (err, docs) => {
            if (err) {
                return console.error(err);
            }
            var packageName = docs.name;
            let i = 0;
            let sharePrice = 0;
            let sharePriceIncome = 0;
            if (docs.components.length > 0) {
                Component.find({"_id": {"$in": docs.components}, deleted: false}, (err, componentRes) => {
                    console.log(componentRes)
                    if (err) {
                        return console.error(err);
                    }
                    for (let item of componentRes) {
                        console.log('quantity', item.quantity)
                        if (item.quantity > 0) {
                            item.quantity -= 1
                            // const myBook = new book(req.body.packageId);
                            Component.findOneAndUpdate({_id: item._id}, item, async (err, docComponent) => {
                                if (err) {
                                    return console.error(err);
                                }
                                if (docComponent.asSharable && docComponent.associated_agency !== req.body.agencyId) {
                                    const myBook2 = new book(req.body.packageId);

                                    await myBook2.entry('Received payment')
                                        .debit('Assets:Cash', docComponent.bulkPrice, {client: req.body.userId})
                                        .credit('Income', docComponent.bulkPrice, {
                                            packageName: packageName,
                                            client: req.body.userId,
                                            agency: docComponent.associated_agency,
                                            from: req.body.agencyId,
                                            forComponentId: docComponent._id,
                                            package: req.body.packageId
                                        })
                                        .commit();
                                    sharePrice += docComponent.bulkPrice;
                                    sharePriceIncome += docComponent.soloPrice - docComponent.bulkPrice;

                                }
                                if (i == docs.components.length - 1) {
                                    const myBook = new book(req.body.packageId);
                                    await myBook.entry('Received payment')
                                        .debit('Assets:Cash', docs.totalPrice, {client: req.body.userId})
                                        .credit('Income', docs.totalPrice, {
                                            packageName: packageName,
                                            client: req.body.userId,
                                            agency: req.body.agencyId,
                                            package: req.body.packageId
                                        })
                                        .commit();
                                    if (sharePrice > 0) {
                                        const myBook3 = new book(req.body.packageId);
                                        await myBook3.entry('Received payment')
                                            .debit('Assets:Cash', 0, {client: req.body.userId})
                                            .credit('Income', 0, {
                                                packageName: packageName,
                                                client: req.body.userId,
                                                agency: req.body.agencyId,
                                                shared: sharePrice,
                                                package: req.body.packageId
                                            })
                                            .commit();
                                    }
                                    // next()
                                    return res.status(200).json({isSuccessful: true})
                                }
                                i++;
                            });
                        }
                    }
                });
            }
        });
        // return res.status(200).json({journal:journal})
    }
    getAllTransactions = async (req, res) => {
        let query = {}
        let data;
        if (req.params.params) {
            data = req.params.params.split('&');
            data.forEach((v, k) => {
                let key = v.split('=')[0],
                    value = v.split('=')[1];
                query[key] = value;
            })
        }
        query['accounts'] = 'Income';

        this.transactionModel.find(query, (err, docs) => {
            if (err) {
                return console.error(err);
            }
            let totalPrice = 0;
            docs.forEach(element => {
                totalPrice += element.credit - element.meta.shared;
            });
            res.status(200).json({isSuccessful: true, transactions: docs, total: docs.length});
        });
    }
    getAllTransactionsPagination = async (req, res) => {
        let query = {}
        let data;

        if (req.params.params) {
            data = req.params.params.split('&');
            data.forEach((v, k) => {
                let key = v.split('=')[0],
                    value = v.split('=')[1];
                query[key] = value;
            })
        }
        query['accounts'] = 'Income';
        if (req.params.page == 1) {
            this.transactionModel.find(query, (err, docs) => {
                if (err) {
                    return console.error(err);
                }
                let totalPrice = 0;
                let totalCredit = 0;
                let totalDebit = 0;
                docs.forEach(element => {
                    totalPrice += element.credit - element.meta.shared ? element.meta.shared : 0;
                    totalDebit += element.meta.shared ? element.meta.shared : 0;
                    totalCredit += element.credit;
                });
                this.options.page = parseInt(req.params.page);
                this.options.limit = parseInt(req.params.limit);
                this.transactionModel.find(query, {}, {
                    skip: (parseInt(req.params.page) - 1) * parseInt(req.params.limit),
                    limit: parseInt(req.params.limit)
                }, (err, docs1) => {
                    if (err) {
                        return console.error(err);
                    }
                    res.status(200).json({
                        isSuccessful: true,
                        transactions: docs1,
                        total: docs.length,
                        totalCredit: totalCredit,
                        totalDebit: totalDebit,
                        totalPrice: totalPrice
                    });
                });
            });
        } else {
            this.options.page = parseInt(req.params.page);
            this.options.limit = parseInt(req.params.limit);
            this.transactionModel.find(query, {}, {
                skip: (parseInt(req.params.page) - 1) * parseInt(req.params.limit),
                limit: parseInt(req.params.limit)
            }, (err, docs1) => {
                if (err) {
                    return console.error(err);
                }
                res.status(200).json({isSuccessful: true, transactions: docs1});
            });
        }

    }
    getAllJournals = async (req, res) => {
        this.journalModel.find({}, (err, docs) => {
            if (err) {
                return console.error(err);
            }
            res.status(200).json(docs);
        });
    }
    totalPrice = (req, res) => {
        let query = {}
        let data;
        if (req.params.params) {
            data = req.params.params.split('&');
            data.forEach((v, k) => {
                let key = v.split('=')[0],
                    value = v.split('=')[1];
                query[key] = value;
            })
        }
        query['accounts'] = 'Income';
        this.transactionModel.find(query, (err, docs) => {
            if (err) {
                return res.status(200).json({isSuccessful: false})
            }
            let totalPrice = 0;
            if (docs.length > 0) {
                docs.forEach((element, index) => {
                    if(req.query.type!='income'&&element.meta.type!=='manual'){
                        console.log(element.credit);
                        totalPrice += element.meta.shared ? element.credit - element.meta.shared : element.credit;
                    }else if(req.query.type==='income'){
                        totalPrice += element.meta.shared ? element.credit - element.meta.shared : element.credit;
                    }
                    if (index == docs.length - 1) {
                        res.status(200).json({isSuccessful: true, totalPrice: totalPrice,data:docs});

                    }
                });
            } else {
                return res.status(200).json({isSuccessful: false})
            }

        });
    }

    getLastTransactions = (req, res) => {

        var today = new Date();
        var last = new Date(today.getTime() - (req.query.dayCount * 24 * 60 * 60 * 1000));

        this.transactionModel.find({
            "datetime": {"$gte": last, "$lt": today},
            accounts: 'Income',
            "meta.agency": req.query.agency,
            "meta.type": { "$ne": 'manual' }
        }).sort({datetime: 'desc'}).exec(function (err, docs) {
            if (err) {
                return console.error(err);
            }
            let transactions = docs;
            let byday = {};

            function groupday(value, index, array) {
                var d: any;
                d = moment(value.datetime).format('MMM_DD')
                byday[d] = byday[d] || [];
                byday[d].push(value);
            }

            transactions.map(groupday)
            res.status(200).json({isSuccessful: true, transactions: byday});
        });
    }


    getByStrongFilterCustom = (req, res) => {
        let fields = req.body;
        let query = {};
        let agency_code;
        for (let item of fields) {
            if (item.type == 'string') {
                query[item.name] = item.value;
                if (item.name === 'meta.agency') {
                    agency_code = item.value;
                }
            } else if (item.type == 'array') {
                var regexp = new RegExp("\\b(?:" + item.value.join("|") + ")\\b", "i"); // "i" means case insensitive
                query[item.name] = regexp;
            } else if (item.type == 'dateRange') {
                let fromDate = item.value.split('-')[0];
                let toDate = item.value.split('-')[1];
                query[item.name] = {
                    "$gte": new Date(fromDate.split(' ')[2], fromDate.split(' ')[1] - 1, fromDate.split(' ')[0]),
                    "$lt": new Date(toDate.split(' ')[2], toDate.split(' ')[1] - 1, toDate.split(' ')[0])
                };

            }
        }
        // query['deleted'] = false;
        this.model.find(query, (err, docs) => {
            if (err) {
                return console.error(err);
            }


            Agencies.findOne({agency_id: agency_code}, (err, agency) => {
                if (err) {
                    return res.status(200).json(docs);
                }
                // Close PDF and write file.
                // create a document and pipe to a blob
                var doc = new PDFDocument();

                doc.image(agency.logo, 10, 50, {width: 40});

                doc.fontSize(18).text(agency.company_name, 50, 65);
                // doc.image('./world.png', 380, 50, {width: 15});

                doc.fontSize(14).text(agency.website, 400, 50);
                // doc.image('./telephone-symbol-button.png', 380, 70, {width: 15});
                doc.fontSize(14).text(agency.telephone_number.join(' , '), 400, 70);
                // doc.image('./envelope.png', 380, 90, {width: 15});
                doc.fontSize(14).text(agency.mobile_number.join(' , '), 400, 90);

                doc.fontSize(20).text('Bill to', 50, 170);
                doc.fontSize(14).text(agency.company_name, 50, 205);
                doc.fontSize(14).text(agency.email_address.join(' , '), 50, 225);
                doc.fontSize(34).text('INVOICE', 400, 170);
                doc.rect(400, 205, 200, 60)
                    .fill('#C0C1C3');

                doc.fillColor('#3C4858').fontSize(14)
                    .text('Next Journey', 410, 215);

                doc.fillColor('#3C4858').fontSize(14)
                    .text(agency.company_name, 410, 240);
                doc.lineCap('butt')
                    .moveTo(400, 205)
                    .lineTo(400, 265)
                    .stroke();
                doc.rect(0, 350, 610, 45)
                    .fill('#323234');
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text('ITEM DESCRIPTION', 20, 365);
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text('PRICE', 300, 365);
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text('QTY', 400, 365);
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text('TOTAL', 470, 365);
                doc.rect(0, 405, 610, 40)
                    .fill('white');
                let plusHeight = (docs.length - 1) * 30;
                let total = 0;
                docs.forEach(function (item, index) {
                    total += item.credit
                    doc.fillColor('#323234').fontSize(12)
                        .text(item.meta.packageName, 150, 420 + (index * 30));
                    doc.fillColor('#323234').fontSize(12)
                        .text(item.credit + 'PHP', 300, 420 + (index * 30));
                    doc.fillColor('#323234').fontSize(12)
                        .text('1', 400, 420 + (index * 30));
                    doc.fillColor('#323234').fontSize(12)
                        .text(item.credit + 'PHP', 470, 420 + (index * 30));
                });
                doc.fillColor('#323234').fontSize(12)
                    .text('Bank Account', 50, 450 + plusHeight);
                doc.rect(300, 470 + plusHeight, 315, 40)
                    .fill('#323234');
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text('GRAND TOTAL', 310, 485 + plusHeight);
                doc.fillColor('#F3E5F5').fontSize(12)
                    .text(total + ' PHP', 450, 485 + plusHeight);
                // doc.fillColor('#323234').fontSize(22)
                //   .text('THANK YOU FOR YOUR BUSINESS',50, 520+plusHeight);
                // doc.fillColor('#323234').fontSize(12)
                //   .text('Terms :',50, 525+plusHeight);
                // doc.fillColor('#323234').fontSize(12)
                //   .text('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.:',90, 525+plusHeight);

                doc.pipe(
                    fs.createWriteStream(agency_code + '.pdf')
                ).on('finish', function () {
                    res.status(200).json(docs);
                    // fs.readFile('file.pdf', function (err, contents) {
                    //   // res.status(200).json({result:docs,file:contents});
                    //
                    //   console.log(contents);
                    // })
                });
                doc.end();

            });


        });
    };
    downloadTransactionFile = (req, res) => {
        console.log(req.query.agency_id);
        var file = fs.createReadStream(req.query.agency_id + '.pdf');
        var stat = fs.statSync(req.query.agency_id + '.pdf');
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        file.pipe(res);
    }
    // generateInvoice = (req,res) =>{
    // 	let invoice = req.body.data,
    // 		filename = req.data.name;

    // 	var postData = JSON.stringify(invoice);
    //   var options = {
    //       hostname  : "invoice-generator.com",
    //       port      : 443,
    //       path      : "/",
    //       method    : "POST",
    //       headers   : {
    //           "Content-Type": "application/json",
    //           "Content-Length": Buffer.byteLength(postData)
    //       }
    //   };

    //   var file = fs.createWriteStream(filename);

    //   var request = https.request(options, function(response) {
    //       response.on('data', function(chunk) {
    //           file.write(chunk);
    //       })
    //       .on('end', function() {
    //           file.end();

    //           // if (typeof success === 'function') {
    //           //     success();
    //           // }
    //       });
    //   });
    //   req.write(postData);
    //   req.end();

    //   // if (typeof error === 'function') {
    //   //     req.on('error', error);
    //   // }
    // }


    calculateCurrency(from, to): any {
        return new Promise((resolve, reject) => {
            if (from === to) {
                resolve(1);
            } else {
                const req = {
                    method: 'GET',
                    uri: `https://free.currencyconverterapi.com/api/v6/convert?q=${from}_${to}&compact=ultra&apiKey=e3c621e128127f8e3a06`,
                    json: true
                };
                request(req).then(res => {
                    resolve(res[`${from}_${to}`])
                })
            }

        })

    }

    exchangePrice(price, currentCurrency, selectedCurrency) {
        if (currentCurrency === selectedCurrency) {
            return parseFloat(price);
        } else if (currentCurrency != selectedCurrency) {
            this.calculateCurrency(currentCurrency, selectedCurrency).then(price => {
                return parseFloat(price) * price;
            })
        }
    }

    exchange(component, type, currency) {
        return new Promise((resolve, reject) => {
            if (component.currency === currency) {
                resolve(parseFloat(component[type]));
            } else if (component.currency != currency) {
                this.calculateCurrency(component.currency, currency).then(price => {
                    resolve(parseFloat(component[type]) * price);
                })
            }
        })
    }

    bookingProcess = async (req, res) => {
        if (req.query.type && req.query.type === 'visa') {
            let obj = {
                userId: req.query.userId,
                agencyId: req.query.agencyId,
                price: req.query.price,
                currency: req.query.currency
            };
            let extra = {
                paymentId: req.query.paymentId,
                token: req.query.token,
                PayerID: req.query.PayerID
            };
            const myBook = new book(obj.agencyId);
            let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
            await myBook.entry('Received payment')
                .debit('Assets:Cash', obj.price, {client: obj.userId})
                .credit('Income', obj.price, {
                    invoiceNo: invoiceNo,
                    extra: extra,
                    type: 'visa',
                    client: obj.userId,
                    agency: obj.agencyId,
                    mode: 'visa',
                    currency: obj.currency
                })
                .commit();
            return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')
        } else {
            let obj = {
                packageId: req.query.packageId,
                userId: req.query.userId,
                agencyId: req.query.agencyId,
                adultCount: req.query.adultCount ? req.query.adultCount : 0,
                childCount: req.query.childCount ? req.query.childCount : 0,
                infantCount: req.query.infantCount ? req.query.infantCount : 0,
            };
            let extra = {
                paymentId: req.query.paymentId,
                token: req.query.token,
                PayerID: req.query.PayerID
            };
            let self = this;
            Agencies.findOne({agency_id: obj.agencyId}).select('config').exec(function (err, agency) {
                let currency = agency.config ? agency.config.currency : 'USD'
                if (req.query.redirect && req.query.redirect.indexOf('/inqueries') > -1) {
                    let inId = req.query.redirect.substring(req.query.redirect.indexOf('=') + 1, req.query.redirect.length)
                    Inquerie.findOneAndUpdate({_id: inId}, {is_paid: true}).exec(function (err, resultsIn) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }
                let totalCount = parseInt(obj.adultCount) + parseInt(obj.childCount) + parseInt(obj.infantCount);
                Package.findOne({"_id": obj.packageId}, async (err, docs) => {
                    if (err) {
                        return console.error(err);
                    }
                    var packageName = docs.name;
                    let i = 0;
                    let sharePrice = 0;
                    let sharePriceIncome = 0;
                    let totalPrice = 0;
                    let totalPriceOrg = 0;
                    if (docs.components.length > 0) {
                        Component.find({"_id": {"$in": docs.components}, deleted: false}, async (err, componentRes) => {
                            if (err) {
                                return console.error(err);
                            }
                            for (let item of componentRes) {
                                if (item.quantity > 0 && item.quantity >= totalCount) {
                                    let currencyConvert = 1;
                                    self.calculateCurrency(item.currency, currency).then(c => {
                                        currencyConvert = c;
                                        totalPrice += (item.soloPrice * obj.adultCount + item.soloPriceChild * (obj.childCount + obj.infantCount)) * currencyConvert;
                                        totalPriceOrg += (item.originalPriceAdult * obj.adultCount + item.originalPriceChild * obj.childCount + item.originalPriceInfant * obj.infantCount) * currencyConvert;
                                        item.quantity -= totalCount;
                                        Component.findOneAndUpdate({_id: item._id}, item, async (err, docComponent) => {
                                            if (err) {
                                                return console.error(err);
                                            }
                                            if (docComponent.asSharable && docComponent.associated_agency !== obj.agencyId) {
                                                let sharePriceAcc = (docComponent.bulkPrice * obj.adultCount + docComponent.bulkPriceChild * (obj.childCount + obj.infantCount)) * currencyConvert;
                                                const myBook2 = new book(obj.packageId);
                                                let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                await myBook2.entry('Received payment')
                                                    .debit('Assets:Cash', sharePriceAcc, {client: obj.userId})
                                                    .credit('Income', sharePriceAcc, {
                                                        invoiceNo: invoiceNo,
                                                        extra: extra,
                                                        currency: currency,
                                                        packageName: packageName,
                                                        client: obj.userId,
                                                        agency: docComponent.associated_agency,
                                                        from: obj.agencyId,
                                                        forComponentId: docComponent._id,
                                                        package: obj.packageId
                                                    })
                                                    .commit();
                                                sharePrice += docComponent.bulkPrice * currencyConvert;
                                                sharePriceIncome += (docComponent.soloPrice - docComponent.bulkPrice) ** currencyConvert;
                                            }
                                            if (i == docs.components.length - 1) {
                                                const myBook = new book(obj.packageId);
                                                let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))

                                                await myBook.entry('Received payment')
                                                    .debit('Assets:Cash', totalPrice, {client: obj.userId})
                                                    .credit('Income', totalPrice, {
                                                        originalPrice: totalPriceOrg,
                                                        invoiceNo: invoiceNo,
                                                        extra: extra,
                                                        currency: currency,
                                                        packageName: packageName,
                                                        client: obj.userId,
                                                        agency: obj.agencyId,
                                                        package: obj.packageId
                                                    })
                                                    .commit();
                                                if (sharePrice > 0) {
                                                    const myBook3 = new book(obj.packageId);
                                                    let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                    await myBook3.entry('Received payment')
                                                        .debit('Assets:Cash', 0, {client: obj.userId})
                                                        .credit('Income', 0, {
                                                            invoiceNo: invoiceNo,
                                                            extra: extra,
                                                            currency: currency,
                                                            packageName: packageName,
                                                            client: obj.userId,
                                                            agency: obj.agencyId,
                                                            shared: sharePrice,
                                                            package: obj.packageId
                                                        })
                                                        .commit();
                                                }
                                                if (docs.externalResources) {
                                                    let totalPrice1 = 0;
                                                    let j = 0
                                                    for (let item of docs.externalResources) {
                                                        self.calculateCurrency(item.currency, currency).then(async currencyres => {
                                                            if (item.quantity > 0) {
                                                                totalPrice1 += item.soloPrice * currencyres;
                                                            }
                                                            if (j == docs.externalResources.length - 1) {
                                                                const myBook = new book(obj.packageId);
                                                                let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                                await myBook.entry('Received payment')
                                                                    .debit('Assets:Cash', totalPrice1, {client: obj.userId})
                                                                    .credit('Income', totalPrice1, {
                                                                        invoiceNo: invoiceNo,
                                                                        extra: extra,
                                                                        currency: currency,
                                                                        packageName: packageName,
                                                                        client: obj.userId,
                                                                        agency: obj.agencyId,
                                                                        package: obj.packageId,
                                                                        mode: 'external'
                                                                    })
                                                                    .commit();
                                                                return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')
                                                            }
                                                            j++;

                                                        })

                                                    }

                                                }
                                            }
                                            i++;
                                        });
                                    });

                                }
                            }
                        });
                    } else if (docs.externalResources) {
                        let totalPrice1 = 0;
                        let j = 0;
                        for (let item of docs.externalResources) {
                            self.calculateCurrency(item.currency, currency).then(async currencyres => {
                                if (item.quantity > 0) {
                                    totalPrice1 += item.soloPrice * currencyres;
                                }
                                if (j == docs.externalResources.length - 1) {
                                    const myBook = new book(obj.packageId);
                                    let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                    await myBook.entry('Received payment')
                                        .debit('Assets:Cash', totalPrice1, {client: obj.userId})
                                        .credit('Income', totalPrice1, {
                                            invoiceNo: invoiceNo,
                                            extra: extra,
                                            currency: currency,
                                            packageName: packageName,
                                            client: obj.userId,
                                            agency: obj.agencyId,
                                            package: obj.packageId,
                                            mode: 'external'
                                        })
                                        .commit();
                                    return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')
                                }
                                j++;

                            })

                        }

                    }

                });

            })

        }

    }
    bookingProcessManual = async (req, res) => {
        let obj = {
            userId: req.query.userId,
            agencyId: req.query.agencyId,
            price: req.query.price,
            currency: req.query.currency
        };
        let extra = {
            paymentId: req.query.paymentId,
            token: req.query.token,
            PayerID: req.query.PayerID
        };
        const myBook = new book(obj.agencyId);
        let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
        await myBook.entry('Received payment')
            .debit('Assets:Cash', obj.price, {client: obj.userId})
            .credit('Income', obj.price, {
                invoiceNo: invoiceNo,
                extra: extra,
                type: 'manual',
                client: obj.userId,
                agency: obj.agencyId,
                mode: 'manual',
                currency: obj.currency
            })
            .commit();
        return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')


    }

    bookingProcessCustom = async (req, res) => {
        let obj = {
            inqueryId: req.query.inqueryId,
            userId: req.query.userId,
            redirectRoute: req.query.redirectRoute,
            packageId: req.query.packageId,
            agency_id: req.query.agencyId,
        };
        let extra = {
            paymentId: req.query.paymentId,
            token: req.query.token,
            PayerID: req.query.PayerID
        };
        if (obj.inqueryId) {
            let markup = 0;
            let self = this;
            Agencies.findOne({agency_id: obj.agency_id}).select('config').exec(function (err, agency) {
                let currency = agency.config ? agency.config.currency : 'USD'
                User.findOne({_id: obj.userId}).select('markup').exec(function (err, user) {
                    if (err) {
                        markup = 0;
                    }
                    if (user.markup && user.markup >= 0) {
                        markup = user.markup
                    }
                    Inquerie.findOneAndUpdate({_id: obj.inqueryId}, {is_paid: true}).exec(function (err, resultsIn) {
                        if (err) {
                            console.log(err);
                        }
                        let details = resultsIn.details.componentDetails;
                        // let totalCount=parseInt(obj.adultCount)+parseInt(obj.childCount)+parseInt(obj.infantCount);
                        Package.findOne({"_id": obj.packageId}, async (err, docs) => {
                            if (err) {
                                return console.error(err);
                            }
                            var packageName = docs.name;
                            let i = 0;
                            let sharePrice = 0;
                            let sharePriceIncome = 0;
                            let totalPrice = 0;
                            let totalPriceOrg = 0;
                            if (docs.components.length > 0) {
                                Component.find({
                                    "_id": {"$in": docs.components},
                                    deleted: false
                                }, async (err, componentRes) => {
                                    if (err) {
                                        return console.error(err);
                                    }
                                    for (let item of componentRes) {
                                        let currencyConvert = 1;
                                        self.calculateCurrency(item.currency, currency).then(c => {
                                            currencyConvert = c;
                                            let componentDetail = details[item._id];
                                            let totalCount = componentDetail.count.adult + componentDetail.count.children + componentDetail.count.infant;
                                            if (item.quantity > 0 && item.quantity >= totalCount) {
                                                totalPrice += currencyConvert * (item.soloPrice * componentDetail.count.adult + item.soloPriceChild * (componentDetail.count.children + componentDetail.count.infant)) * (componentDetail.duration ? componentDetail.duration : 1);
                                                totalPriceOrg += currencyConvert * (item.originalPriceAdult * componentDetail.count.adult + item.originalPriceChild * componentDetail.count.children + item.originalPriceInfant * componentDetail.count.infant);
                                                item.quantity -= totalCount;
                                                Component.findOneAndUpdate({_id: item._id}, item, async (err, docComponent) => {
                                                    if (err) {
                                                        return console.error(err);
                                                    }
                                                    if (docComponent.asSharable && docComponent.associated_agency !== obj.agency_id) {
                                                        let sharePriceAcc = currencyConvert * (docComponent.bulkPrice * componentDetail.count.adult + docComponent.bulkPriceChild * (componentDetail.count.children + componentDetail.count.infant));
                                                        sharePriceAcc = sharePriceAcc * (componentDetail.duration ? componentDetail.duration : 1)
                                                        sharePriceAcc += (sharePriceAcc * markup / 100)
                                                        const myBook2 = new book(obj.packageId);
                                                        let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                        await myBook2.entry('Received payment')
                                                            .debit('Assets:Cash', sharePriceAcc, {client: obj.userId})
                                                            .credit('Income', sharePriceAcc, {
                                                                invoiceNo: invoiceNo,
                                                                extra: extra,
                                                                currency: currency,
                                                                packageName: packageName,
                                                                client: obj.userId,
                                                                agency: docComponent.associated_agency,
                                                                from: obj.agency_id,
                                                                forComponentId: docComponent._id,
                                                                package: obj.packageId
                                                            })
                                                            .commit();
                                                        sharePrice += sharePriceAcc;
                                                        sharePriceIncome += currencyConvert * (item.soloPrice * componentDetail.count.adult + item.soloPriceChild * (componentDetail.count.children + componentDetail.count.infant)) * (componentDetail.duration ? componentDetail.duration : 1) - sharePriceAcc;
                                                    }
                                                    if (i == docs.components.length - 1) {
                                                        const myBook = new book(obj.packageId);
                                                        let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                        totalPrice += (totalPrice * markup / 100)

                                                        await myBook.entry('Received payment')
                                                            .debit('Assets:Cash', totalPrice, {client: obj.userId})
                                                            .credit('Income', totalPrice, {
                                                                originalPrice: totalPriceOrg,
                                                                invoiceNo: invoiceNo,
                                                                extra: extra,
                                                                currency: currency,
                                                                packageName: packageName,
                                                                client: obj.userId,
                                                                agency: obj.agency_id,
                                                                package: obj.packageId
                                                            })
                                                            .commit();
                                                        if (sharePrice > 0) {
                                                            const myBook3 = new book(obj.packageId);
                                                            let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                            await myBook3.entry('Received payment')
                                                                .debit('Assets:Cash', 0, {client: obj.userId})
                                                                .credit('Income', 0, {
                                                                    invoiceNo: invoiceNo,
                                                                    extra: extra,
                                                                    currency: currency,
                                                                    packageName: packageName,
                                                                    client: obj.userId,
                                                                    agency: obj.agency_id,
                                                                    shared: sharePrice,
                                                                    package: obj.packageId
                                                                })
                                                                .commit();
                                                        }
                                                        if (docs.externalResources) {
                                                            let totalPrice1 = 0;

                                                            for (let item of docs.externalResources) {
                                                                let componentDetailext = details[item._id];
                                                                if (item.quantity > 0) {
                                                                    totalPrice1 += (item.soloPrice * (componentDetailext.count.adult + componentDetailext.count.children + componentDetailext.count.infant));
                                                                }
                                                            }
                                                            const myBook = new book(obj.packageId);
                                                            totalPrice1 += (totalPrice1 * markup / 100)

                                                            let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                                            await myBook.entry('Received payment')
                                                                .debit('Assets:Cash', totalPrice1, {client: obj.userId})
                                                                .credit('Income', totalPrice1, {
                                                                    invoiceNo: invoiceNo,
                                                                    extra: extra,
                                                                    currency: currency,
                                                                    packageName: packageName,
                                                                    client: obj.userId,
                                                                    agency: obj.agency_id,
                                                                    package: obj.packageId,
                                                                    mode: 'external'
                                                                })
                                                                .commit();
                                                        }
                                                        return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')
                                                    }
                                                    i++;
                                                });
                                            }
                                        })

                                    }
                                });
                            } else if (docs.externalResources) {
                                let totalPrice1 = 0;

                                for (let item of docs.externalResources) {
                                    let componentDetailext = details[item._id];
                                    if (item.quantity > 0) {
                                        totalPrice1 += (item.soloPrice * (componentDetailext.count.adult + componentDetailext.count.children + componentDetailext.count.infant));
                                    }
                                }
                                const myBook = new book(obj.packageId);
                                totalPrice1 += (totalPrice1 * markup / 100)

                                let invoiceNo = 'nj-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1)) + '-' + (Math.round((Math.pow(36, 3 + 1) - Math.random() * Math.pow(36, 3))).toString(36).slice(1))
                                await myBook.entry('Received payment')
                                    .debit('Assets:Cash', totalPrice1, {client: obj.userId})
                                    .credit('Income', totalPrice1, {
                                        invoiceNo: invoiceNo,
                                        extra: extra,
                                        currency: currency,
                                        packageName: packageName,
                                        client: obj.userId,
                                        agency: obj.agency_id,
                                        package: obj.packageId,
                                        mode: 'external'
                                    })
                                    .commit();
                                return res.redirect(307, process.env.BASE_URL_CLIENT + 'login')

                            }
                        });
                    })

                })

            })

        }


    }
}
