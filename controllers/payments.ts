import * as paypal from 'paypal-rest-sdk'
import Package from "../models/package";
import Component from "../models/component";
import {forEach} from "@angular/router/src/utils/collection";
import {Memory} from "../../client/app/base/memory";
import Agencies from "../models/agencies";
import {reject} from "q";
import User from "../models/user";

const request = require('request-promise');

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AciYbW9hXtp04qZp5cMfSvob1igKyrhrGA8JPA8evJ3mRI1kfnwRCexe7VBjJRa81IYV5Qph2sG4-2C2',
    'client_secret': 'EJdPQc0CqH4j-kijqLuoO9sLqqAeZKtwMO91NVVXfEHEYqLkeSq7OnK4HEoX3Ebt7R4GADM1K6maZ9Ll'
});

export default class PaymentCtrl {
    payVisaProcess = (req, res) => {
        let domain = req.query.domain;
        let self = this;
        const agency_id = req.body['agencyId'],
            formName = req.body['form'],
            userId = req.body['userId'];
        // console.log(agency_id)
        Agencies.findOne({agency_id: agency_id}).select('config').exec(function (err, agency1) {
            Agencies.aggregate([
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
                    let form = agency[0].list[0];
                    console.log(agency[0].list[0]);
                    let payPrice = self.exchangePrice(form.price, form.currency, agency1.config ? agency1.config.currency : 'USD');
                    req.body.price = payPrice;
                    req.body.userId = userId;
                    req.body.currency = form.currency;
                    req.origin = domain;
                    self.paypalVisaProcess(req, res).then(url => {
                        res.status(200).json({isSuccessful: true, result: url})
                    });
                });
        })

    }
    payProcess = (req, res) => {
        let self = this;
        const agency_id = req.body['agencyId'],
            amount = req.body['amount'];
        if(amount&&amount>0){
            self.paypalProcess(req, res).then(url => {
                return res.status(200).json({isSuccessful: true, result: url})
            });
        }else{
            return res.status(200).json({isSuccessful: false})
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

    calculateCurrency(from, to): any {
        return new Promise((resolve, reject) => {
            const req = {
                method: 'GET',
                uri: `https://free.currencyconverterapi.com/api/v6/convert?q=${from}_${to}&compact=ultra&apiKey=e3c621e128127f8e3a06`,
                json: true
            };
            request(req).then(res => {
                resolve(res[`${from}_${to}`])
            })
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


    calculatePackagePrice(packageId, childCount, adultCount, agency_id): any {
        let self = this;
        return new Promise((resolve, reject) => {
            Agencies.findOne({agency_id: agency_id}).select('config').exec(function (err, agency) {
                if (err) console.log(err);
                Package.findOne({"_id": packageId}, async (err, docs) => {
                    if (err) {
                        return console.error(err);
                    }
                    let totalPrice = 0;
                    if (docs.components.length > 0) {
                        Component.find({"_id": {"$in": docs.components}, deleted: false}, (err, componentRes) => {
                            if (err) {
                                return console.error(err);
                            }
                            componentRes.forEach(async (item, index) => {
                                console.log(await self.exchange(item, 'soloPrice', agency.config ? agency.config.currency : 'USD'))
                                self.exchange(item, 'soloPrice', agency.config ? agency.config.currency : 'USD').then((solo: number) => {
                                    totalPrice += solo * adultCount;
                                    self.exchange(item, 'soloPriceChild', agency.config ? agency.config.currency : 'USD').then((child: number) => {
                                        totalPrice += child * childCount
                                        if (index === componentRes.length - 1) {
                                            console.log(docs.externalResources)
                                            if (docs.externalResources.length > 0) {
                                                docs.externalResources.forEach((sub, count) => {
                                                    totalPrice += solo * adultCount;
                                                    self.exchange(sub, 'soloPrice', agency.config ? agency.config.currency : 'USD').then((external: number) => {
                                                        totalPrice += external * (adultCount + childCount)
                                                        if (count === docs.externalResources.length - 1) {
                                                            totalPrice -= totalPrice * docs.discount / 100;
                                                            resolve({
                                                                total: totalPrice,
                                                                currency: agency.config ? agency.config.currency : 'USD'
                                                            })
                                                        }
                                                    })
                                                })
                                            } else {
                                                totalPrice -= totalPrice * docs.discount / 100;

                                                resolve({
                                                    total: totalPrice,
                                                    currency: agency.config ? agency.config.currency : 'USD'
                                                })
                                            }
                                        }
                                    })
                                })

                            })
                        });
                    } else {
                        totalPrice -= totalPrice * docs.discount / 100;

                        resolve({total: totalPrice, currency: agency.config ? agency.config.currency : 'USD'})
                    }
                });

            })
        })
    }

    calculatePackagePriceCustom(packageId, detail, agency_id): any {
        console.log('omad');
        let self = this;
        return new Promise((resolve, reject) => {
            Agencies.findOne({agency_id: agency_id}).select('config').exec(function (err, agency) {
                if (err) console.log(err);
                Package.findOne({"_id": packageId}, async (err, docs) => {
                    if (err) {
                        return console.error(err);
                    }
                    let totalPrice = 0;
                    console.log(docs.components);
                    if (docs.components.length > 0) {
                        Component.find({"_id": {"$in": docs.components}, deleted: false}, (err, componentRes) => {
                            if (err) {
                                return console.error(err);
                            }
                            if (componentRes.length > 0) {
                                componentRes.forEach(async (item, index) => {
                                    let componentDetail = detail[item._id];
                                    self.exchange(item, 'soloPrice', agency.config ? agency.config.currency : 'USD').then((solo: number) => {
                                        console.log(1, 'solo', solo);

                                        totalPrice += solo * componentDetail.adult * (item.type === 'van-driver' || item.type === 'hotel-room' ? componentDetail.duration : 1);
                                        self.exchange(item, 'soloPriceChild', agency.config ? agency.config.currency : 'USD').then((child: number) => {
                                            console.log(1, 'child', child);

                                            totalPrice += child * (componentDetail.count.children + componentDetail.count.infant) * (item.type === 'van-driver' || item.type === 'hotel-room' ? componentDetail.duration : 1);
                                            if (index === componentRes.length - 1) {
                                                console.log(1);

                                                if (docs.externalResources.length > 0) {
                                                    docs.externalResources.forEach((sub, count) => {
                                                        // totalPrice +=solo*componentDetail.count.adult;
                                                        console.log(1);
                                                        self.exchange(sub, 'soloPrice', agency.config ? agency.config.currency : 'USD').then((external: number) => {
                                                            totalPrice += external * (componentDetail.count.adult + componentDetail.count.children + componentDetail.count.infant) * (item.type === 'van-driver' || item.type === 'hotel-room' ? componentDetail.duration : 1);
                                                            ;
                                                            if (count === docs.externalResources.length - 1) {
                                                                totalPrice -= totalPrice * docs.discount / 100;
                                                                resolve({
                                                                    total: totalPrice,
                                                                    currency: agency.config ? agency.config.currency : 'USD'
                                                                })
                                                            }
                                                        })
                                                    })
                                                } else {
                                                    totalPrice -= totalPrice * (docs.discount ? docs.discount : 0) / 100;
                                                    console.log(1);
                                                    resolve({
                                                        total: totalPrice,
                                                        currency: agency.config ? agency.config.currency : 'USD'
                                                    })
                                                }
                                            }
                                        })
                                    })

                                })
                            } else {
                                console.log('ommmmmmmmmmmmmmmmmmmmmmad');
                                if (docs.externalResources.length > 0) {

                                    docs.externalResources.forEach((sub, count) => {
                                        let componentDetail = detail[sub._id];
                                        self.exchange(sub, 'soloPrice', agency.config ? agency.config.currency : 'USD').then((external: number) => {
                                            console.log(external * (componentDetail.count.adult + componentDetail.count.children + componentDetail.count.infant) * (sub.type === 'van-driver' || sub.type === 'hotel-room' ? componentDetail.duration : 1))
                                            totalPrice += external * (componentDetail.count.adult + componentDetail.count.children + componentDetail.count.infant) * (sub.type === 'van-driver' || sub.type === 'hotel-room' ? componentDetail.duration : 1);
                                            if (count === docs.externalResources.length - 1) {
                                                totalPrice -= totalPrice * (docs.discount ? docs.discount : 0) / 100;
                                                resolve({
                                                    total: totalPrice,
                                                    currency: agency.config ? agency.config.currency : 'USD'
                                                })
                                            }
                                        })
                                    })
                                }

                            }
                        });
                    } else {
                        totalPrice -= totalPrice * docs.discount / 100;

                        resolve({total: totalPrice, currency: agency.config ? agency.config.currency : 'USD'})
                    }
                });

            })
        })
    }

    paypal = (req, res) => {
        return new Promise((resolve, reject) => {
            let obj = {
                packageId: req.body.packageId,
                userId: req.body.userId,
                agencyId: req.body.agencyId,
                adultCount: req.body.adultCount ? req.body.adultCount : 0,
                childCount: req.body.childCount ? req.body.childCount : 0,
                infantCount: req.body.infantCount ? req.body.infantCount : 0,
            };

            let redirectRoute = req.body.redirectRoute;
            let query = `?packageId=${obj.packageId}&userId=${obj.userId}&agencyId=${obj.agencyId}&adultCount=${obj.adultCount}&childCount=${obj.childCount}&infantCount=${obj.infantCount}&redirect=${redirectRoute}`;
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${process.env.URL}/api/payments/accounting/callback${query}`,
                    "cancel_url": `${process.env.URL}${redirectRoute}`
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": "1.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description."
                }]
            };
            this.calculatePackagePrice(obj.packageId, obj.childCount + obj.infantCount, obj.adultCount, obj.agencyId).then(price => {
                console.log(price);
                // create_payment_json.transactions[0].amount=price;
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        console.log('paypal', error);
                    } else {
                        console.log("Create Payment Response", payment);
                        let url = payment.links[1].href;
                        // res.redirect(url)
                        resolve(url);
                        // res.redirect(payment.links[1].href)
                    }
                });
            })

        })

    }
    paypalCustom = (req, res) => {
        return new Promise((resolve, reject) => {
            let obj = {
                details: req.body.details,
                inqueryId: req.body.id,
                userId: req.body.userId,
                redirectRoute: req.body.redirectRoute,
                packageId: req.body.packageId,
                agency_id: req.body.agencyId,
            };
            let query = `?packageId=${obj.packageId}&userId=${obj.userId}&agencyId=${obj.agency_id}&inqueryId=${obj.inqueryId}&redirect=${obj.redirectRoute}`;
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${process.env.URL}/api/payments/accounting/callback/custom${query}`,
                    "cancel_url": `${process.env.URL}${obj.redirectRoute}`
                },

                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": "1.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description."
                }]

            };
            let markup = 0;
            let self = this;
            User.findOne({_id: obj.userId}).select('markup').exec(function (err, user) {
                if (err) {
                    markup = 0;
                }
                if (user.markup && user.markup >= 0) {
                    markup = user.markup
                }
                self.calculatePackagePriceCustom(obj.packageId, obj.details, obj.agency_id).then(price => {
                    // create_payment_json.transactions[0].amount=price;

                    console.log('__________Package Price__________', price + (price * markup / 100), price);
                    paypal.payment.create(create_payment_json, function (error, payment) {
                        if (error) {
                            console.log('paypal', error);
                        } else {
                            console.log("Create Payment Response", payment);
                            let url = payment.links[1].href;
                            // res.redirect(url)
                            resolve(url);
                            // res.redirect(payment.links[1].href)
                        }
                    });
                })
            })


        })

    }
    paypalVisaProcess = (req, res) => {
        var origin = req.origin;

        return new Promise((resolve, reject) => {
            let obj = {
                form: req.body.form,
                userId: req.body.userId,
                agencyId: req.body.agencyId,
                price: req.body.price,
                currency: req.body.currency
            };
            console.log(obj);

            let redirectRoute = req.body.redirectRoute;
            let query = `?type=visa&userId=${obj.userId}&agencyId=${obj.agencyId}&price=${obj.price}&currency=${obj.currency}`;
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${origin.indexOf('localhost') > -1 ? 'localhost:4200' : process.env.URL}/api/payments/accounting/callback${query}`,
                    "cancel_url": `${origin.indexOf('localhost') > -1 ? 'localhost:4200' : process.env.URL}${redirectRoute}`
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": "1.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description.for visa process form"
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    console.log('paypal', error);
                } else {
                    console.log("Create Payment Response", payment);
                    let url = payment.links[1].href;
                    resolve(url);
                    // res.redirect(payment.links[1].href)
                }
            });
        })

    }
    paypalProcess = (req, res) => {

        return new Promise((resolve, reject) => {
            let obj = {
                userId: req.body.userId,
                agencyId: req.body.agencyId,
                price: req.body.amount,
                currency: req.body.currency
            };
            let query = `?type=visa&userId=${obj.userId}&agencyId=${obj.agencyId}&price=${obj.price}&currency=${obj.currency}`;
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `${process.env.URL}/api/payments/accounting/callback/manual${query}`,
                    "cancel_url": `${process.env.URL}`
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": "1.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "1.00"
                    },
                    "description": "This is the payment description.for visa process form"
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    console.log('paypal', error);
                } else {
                    console.log("Create Payment Response", payment);
                    let url = payment.links[1].href;
                    resolve(url);
                    // res.redirect(payment.links[1].href)
                }
            });
        })

    }
    paypalCallback = (req, res) => {

        res.status(200).json(req.params);
    };
}
