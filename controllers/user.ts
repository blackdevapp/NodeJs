import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as Autocomplete from 'mongoose-in-memory-autocomplete'
import * as path from 'path'
import * as fs from 'fs'

import {ResponseFormat} from '../models/response.model'
import User from '../models/user';
import Agencies from '../models/agencies';
import BaseCtrl from './base';
import JWTctrl from './authcontroller'
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import MailCtrl from "./mailcontroller";
import EmailValidation from "./emailValidation";

var CryptoJS = require("crypto-js");

const request = require('request-promise');
export default class UserCtrl extends BaseCtrl {
  model = User;
  agencies = Agencies; //Agencies;

  register = (req, res) => {
    this.model.findOne({email: req.body.email}, (err, user) => {
      const resp = {isSuccessful: true, message: 'Successfully Created a user', role: '', result: '', agency_id: '',id:''}
      // check if user exist with defined email
      if (user) {
        resp.result = user._id;
        resp.message = 'User already Exist'
        resp.role = user.role;
        resp.agency_id = user.associated_agency;
        return res.json(resp);
      }

      // continue with creation
      const emailValidation=new EmailValidation()

      emailValidation.chackEmail(req.body.email).then(mail=>{
        if(mail===200){
          const obj = new this.model(req.body);
          obj.save((err, user) => {
            if (err && err.code === 11000) {
              return res.status(400).json({isSuccessful: false, message: 'Duplicate key error'});
            }
            if (err) {
              return res.json({isSuccessful: false, message: err});
            }

            // associated_agency is unique and secret, so initially can allow user insert without validation, by default is admin
            let agency_id = req.body.associated_agency
            let role = req.body.role

            if (agency_id) {
              this.agencies.findOne({agency_id: agency_id}, (err, agency) => {
                if (!agency) {
                  this.rollbackUser(user.id);
                  resp.message = 'Invalid agency id'
                  return res.json(resp);
                } else {
                  this.agencies.findOneAndUpdate({agency_id: agency_id}, {$push: {members: user.id}}, (err) => {
                    resp.isSuccessful = true;
                    resp.id=user.id;
                    const content = new Content();
                    const template = new Template();
                    if (req.query.returnUrl) {
                      this.model.findOne({email: req.body.email}, (err, user) => {
                        if (!user) {
                          return res.sendStatus(403);
                        }
                        const token = JWTctrl.create({user: user});
                        MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithReturnUrl(req.body.email, req.query.returnUrl, token)));
                      });
                    } else {
                      this.model.findOne({email: req.body.email}, (err, user) => {
                        if (!user) {
                          return res.sendStatus(403);
                        }
                        const token = JWTctrl.create({user: user});
                        // MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithoutReturnUrl(req.body.email, token)));
                      });

                    }
                    // TODO : Maybe updating user again for adding role
                    return res.json(resp);
                  });
                }
              });
            } else {
              // decrypt the agency_id from the header and check in agency table
              const verifiedToken = JWTctrl.verify(req.headers["authorization"])
              // agency_id = verifiedToken.agency_id //'nj9AsGI11' // test agency id
              agency_id = verifiedToken.associated_agency; //'nj9AsGI11' // test agency id

              // validate if user has capability to add employee, ex. if admin
              if (agency_id) { // if (role == 'admin') {
                this.agencies.findOneAndUpdate({agency_id: agency_id}, {$push: {members: user.id}}, (err) => {
                  if (err) {
                    this.rollbackUser(user.id)
                    resp.message = err
                    return res.json(resp);
                  }
                  resp.isSuccessful = true
                  return res.json(resp);
                });
              } else if (role == 'user') {
                const content = new Content();
                const template = new Template();
                if (req.query.returnUrl) {
                  this.model.findOne({email: req.body.email}, (err, user) => {
                    if (!user) {
                      return res.sendStatus(403);
                    }
                    const token = JWTctrl.create({user: user});
                    MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithReturnUrl(req.body.email, req.query.returnUrl, token)));
                  });
                } else {
                  this.model.findOne({email: req.body.email}, (err, user) => {
                    if (!user) {
                      return res.sendStatus(403);
                    }
                    const token = JWTctrl.create({user: user});
                    MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithoutReturnUrl(req.body.email, token)));
                  });

                }
                return res.json(resp);
              } else {
                resp.id=user.id;
                this.rollbackUser(user.id)
                resp.message = 'User has limited priviledge'
                return res.json(resp);
              }
            }
          });
        }else{
          resp.isSuccessful =false;
          resp.message = 'Email is invalid'

          return res.json(resp);

        }
      })

    });
  }
  registerCompany = (req, res) => {
    this.model.findOne({email: req.body.email}, (err, user) => {
      const resp = {
        isSuccessful: true,
        message: 'Successfully Created a user',
        role: '',
        result: '',
        agency_id: '',
        token: '',
        user_id: ''
      }
      // check if user exist with defined email
      if (user) {
        resp.result = user._id;
        resp.message = 'User already Exist'
        resp.role = user.role;
        resp.isSuccessful = false;
        resp.agency_id = user.associated_agency;
        return res.json(resp);
      }
      let temp = req.body;
      // continue with creation
      let company = {
        username: temp.email,
        title: 'Mr.',
        company_name: temp.companyName,
        purposeOfVisit: 'others',
        mobileNo: temp.mobile,
        email: temp.email,
        password: temp.mobile,
        deleted: false,
        role: 'company',
        associated_agency: 'nj9AsGI11',
        markup: 5,
        agency_id: 'nj9AsGI11'
      };
      const emailValidation=new EmailValidation()

      emailValidation.chackEmail(req.body.email).then(mail=>{
        if(mail===200){
          const obj = new this.model(company);
          obj.save((err, user) => {
            if (err && err.code === 11000) {
              return res.status(400).json({isSuccessful: false, message: 'Duplicate key error'});
            }
            if (err) {
              return res.json({isSuccessful: false, message: err});
            }
            if (user) {
              const content = new Content();
              const template = new Template();

              this.model.findOne({email: req.body.email}, (err, user) => {
                if (!user) {
                  return res.sendStatus(403);
                }
                this.agencies.findOneAndUpdate({agency_id: company.agency_id}, {$push: {members: user._id}}, (err) => {
                  const token = JWTctrl.create({user: user});
                  // MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithoutReturnUrl(req.body.email, token)));
                  // const options = {
                  //   method: 'POST',
                  //   form: {
                  //     _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchTxt: company.company_name,
                  //     _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnsFormCategory: '',
                  //     _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchCategory: '',
                  //     _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchSorting: '',
                  //     bnResetBtn: '',
                  //     _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchAscDesc: 'bnSortAsc'
                  //   },
                  //   uri: `https://bnrs.dti.gov.ph/web/pbr/search?p_p_id=PBR_BNSearch_WAR_PBR_BNSearchportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=bnsViewList&p_p_cacheability=cacheLevelPage&p_p_col_id=column-2&p_p_col_count=2`,
                  //   json: true
                  // }
                  // request(options).then(response => {
                    this.agencies.findOne({agency_id: company.associated_agency}).select('config').exec(function (err, agency) {
                      if(agency){
                        res.status(200).json({
                          isSuccessful: true,
                          token: token,
                          user_id: user._id,
                          // isSuccessfulList: response.success,
                          // result: response.dataList,
                          agency:agency
                        })
                      }else{
                        res.status(200).json({
                          isSuccessful: true,
                          token: token,
                          user_id: user._id,
                          // isSuccessfulList: response.success,
                          // result: response.dataList,
                          agency:agency
                        })
                      }
                    })

                  // })
                });
              });
            }
          });
        }else{
          resp.isSuccessful =false;
          resp.message = 'Email is invalid'

          return res.json(resp);

        }
      })

    });
  }
  registerVan = (req, res) => {
    this.model.findOne({email: req.body.email}, (err, user) => {
      const resp = {
        isSuccessful: true,
        message: 'Successfully Created a user',
        role: '',
        result: '',
        agency_id: '',
        token: '',
        user_id: ''
      }
      if (user) {
        resp.result = user._id;
        resp.message = 'User already Exist'
        resp.role = user.role;
        resp.isSuccessful = false;
        resp.agency_id = user.associated_agency;
        return res.json(resp);
      }
      let temp = req.body;
      // continue with creation
      let van = {
        username: temp.email,
        title: temp.title,
        age: temp.age,
        city: temp.city,
        state: temp.state,
        address: temp.address,
        purposeOfVisit: 'others',
        mobileNo: temp.mobileNo,
        email: temp.email,
        password: temp.mobileNo,
        deleted: false,
        role: 'van-driver',
        associated_agency: 'nj9AsGI11',
        agency_id: 'nj9AsGI11'
      };
      const emailValidation=new EmailValidation()

      emailValidation.chackEmail(req.body.email).then(mail=>{
        if(mail===200){
          const obj = new this.model(van);
          obj.save((err, user) => {
            if (err && err.code === 11000) {
              return res.status(400).json({isSuccessful: false, message: 'Duplicate key error'});
            }
            if (err) {
              return res.json({isSuccessful: false, message: err});
            }
            if (user) {
              const content = new Content();
              const template = new Template();

              this.model.findOne({email: req.body.email}, (err, user) => {
                if (!user) {
                  return res.sendStatus(403);
                }
                this.agencies.findOneAndUpdate({agency_id: van.agency_id}, {$push: {members: user._id}}, (err) => {
                  const token = JWTctrl.create({user: user});
                  resp.isSuccessful = true;
                  resp.token = token;
                  resp.user_id = user._id;
                  MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithoutReturnUrl(req.body.email, token)));
                  return res.json(resp);
                });
              });
            }
          });
        }else{
          resp.isSuccessful =false;
          resp.message = 'Email is invalid'

          return res.json(resp);

        }
      })

    });
  }

  setCompanyName = (req, res) => {
    this.model.findOne({_id: req.body.user_id}, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }

        this.model.findOneAndUpdate({_id: req.body.user_id}, {

            company_name: req.body.company_name,
            password: req.body.password

        }, (err) => {
          return res.json({isSuccessful: true});
        });
    });
  }

  rollbackUser = (user_id: string) => {
    this.model.findOneAndRemove({_id: user_id}, (err) => {
    });
  }

  login = (req, res) => {
    if (req.query.mode === 'cipher') {
      var bytes = CryptoJS.AES.decrypt(req.body.cipherText, 'NextJourneySecretKey');
      var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      this.model.findOne({email: decryptedData.email}, (err, user) => {
        if (!user) {
          return res.sendStatus(403);
        }
        user.comparePassword(decryptedData.password, (error, isMatch) => {
          if (!isMatch) {
            return res.sendStatus(403);
          }
          let selectOperation=user.role==='admin'?'config permissions':'config';
          this.agencies.findOne({agency_id: user.associated_agency}).select(selectOperation).exec(function (err, agency) {
            const token = JWTctrl.create({user: user});
            if (agency) {
              res.status(200).json({token: token, user_id: user._id, agency: agency});
            } else {
              res.status(200).json({token: token, user_id: user._id});
            }
          })
          // const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        });
      });
    } else {
      this.model.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
          return res.sendStatus(403);
        }
        let selectOperation=user.role==='admin'?'config permissions':'config';
        console.log(selectOperation)
        this.agencies.findOne({agency_id: user.associated_agency}).select(selectOperation).exec(function (err, agency) {
          user.comparePassword(req.body.password, (error, isMatch) => {
            if (!isMatch) {
              return res.sendStatus(403);
            }
            // const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
            const token = JWTctrl.create({user: user})
            if (agency) {
              res.status(200).json({token: token, user_id: user._id, agency: agency});
            } else {
              res.status(200).json({token: token, user_id: user._id});
            }
          });
        })


      });
    }

  }
  checkUserExist = (req, res) => {
    this.model.findOne({email: req.query.email}, (err, user) => {
      if (!user) {
        return res.status(200).json({isSuccessful: false})
      }
      return res.status(200).json({isSuccessful: true, user: user})
    })
  }
  refreshToken = (req, res) => {
    this.model.findOne({email: req.payload.user.email}, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }
      const token = JWTctrl.create({user: user})
      res.status(200).json({isSuccessful: true, token: token, user_id: user._id});
    });
  };
  changePassword = (req, res) => {
    this.model.findOne({email: req.body.email}, (err, user) => {
      if (!user) {
        return res.sendStatus(403);
      }
      const content = new Content();
      const template = new Template();
      const token = JWTctrl.create({user: user});
      if (req.query.returnUrl) {

        MailCtrl.sendEmailReq(req.body.email, template.template1(content.changePass(user, token, req.query.returnUrl)));
      } else {

        MailCtrl.sendEmailReq(req.body.email, template.template1(content.changePass(user, token, 'login')));
      }

      res.status(200).json({isSuccessful: true});
    });
  };

  jwtTokenValidation = (req, res, next, roll) => {
    try {
      // console.log(req.get("Authorization"));
      const authToken = req.get("Authorization")
      if (!authToken) return res.status(401).json({isSuccessful: false, message: 'No authorization detected'})
      const token = authToken.replace('Bearer ', '')
      const verifiedToken = JWTctrl.verify(token)
      if (verifiedToken.name == "JwtParseError") return res.status(401).json({
        isSuccessful: false,
        message: verifiedToken.message
      })
      if (roll.indexOf(verifiedToken.user.role) === -1) return res.status(401).json({
        isSuccessful: false,
        message: 'No authorization detected'
      })
      res.locals.accessToken = verifiedToken.token || null;
      res.locals.encryptToken = verifiedToken.encrypt_token || null;
      req.payload = verifiedToken;
      return next()
    } catch (error) {
      return res.status(500).json(error)
    }
  }
  authSuperAdmin = (req, res, next) => {
    try {
      console.log('jwtTokenValidation inside')
      const authToken = req.get("Authorization")
      if (!authToken) return res.status(400).json({isSuccessful: false, message: 'No authorization detected'})
      const token = authToken.replace('Bearer ', '')
      const verifiedToken = JWTctrl.verify(token)
      if (verifiedToken.name == "JwtParseError") return res.status(400).json({
        isSuccessful: false,
        message: verifiedToken.message
      })
      if (verifiedToken.user.role !== "superadmin") return res.status(400).json({
        isSuccessful: false,
        message: 'No authorization detected'
      })
      res.locals.accessToken = verifiedToken.token || null
      res.locals.encryptToken = verifiedToken.encrypt_token || null

      return next()
    } catch (error) {
      return res.status(500).json(error)
    }
  }
  authAdmin = (req, res, next) => {
    try {
      console.log('jwtTokenValidation inside')
      const authToken = req.get("Authorization")
      if (!authToken) return res.status(400).json({isSuccessful: false, message: 'No authorization detected'})
      const token = authToken.replace('Bearer ', '')
      const verifiedToken = JWTctrl.verify(token)
      if (verifiedToken.name == "JwtParseError") return res.status(400).json({
        isSuccessful: false,
        message: verifiedToken.message
      })
      if (verifiedToken.user.role !== "admin") return res.status(400).json({
        isSuccessful: false,
        message: 'No authorization detected'
      })
      res.locals.accessToken = verifiedToken.token || null
      res.locals.encryptToken = verifiedToken.encrypt_token || null

      return next()
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  profile = (req, res) => {
    res.status(200).json({})
  }

  autoSuggestion = (req, res) => {
    var regex = new RegExp(req.params.q, 'i');
    console.log(regex);
    var query = this.model.find({firstName: regex}, {
      'firstName': 1,
      'lastName': 1,
      'title': 1,
      'img': 1,
      'mobileNo': 1,
      'email': 1,
    }).limit(20);
    // var query = User.find({fullname: regex}, { 'fullname': 1 }).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    console.log(query);

    // Execute query in a callback and return users list
    query.exec(function (err, users) {
      if (!err) {
        // Method to construct the json result set
        // var result = buildResultSet(users); 
        res.status(200).json(users);
      } else {
        res.send(JSON.stringify(err), {
          'Content-Type': 'application/json'
        }, 404);
      }
    });
  }

  encryptObject = (req, res) => {
    let user = req.body;
    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(user), 'NextJourneySecretKey');
    console.log(ciphertext)
    res.status(200).json({cipherObject: ciphertext.toString()})

  }


  fbRegister = (req, res) => {
    var passport = require('passport')
      , FacebookStrategy = require('passport-facebook').Strategy;
    passport.use(new FacebookStrategy({
        clientID: '1820096874767617',
        clientSecret: '745193ce07ef0815936063f03c2e29ed',
        enableProof: true,
        profileFields: ['id', 'displayName', 'link', 'email'],
        callbackURL: `https://nextjourney.co/public/social/facebook?mode=register`,

      }
      ,
      function (accessToken, refreshToken, profile, done) {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);
        console.log('done', done);
        // res.status(400).json({ accessToken: accessToken, profile: profile,isSuccessful:done })
      }
    ));
    passport.authenticate('facebook', {
      callbackURL: 'https://nextjourney.co/public/social/facebook?mode=register',
      scope: ['manage_pages', 'email', 'public_profile', 'publish_pages', 'publish_to_groups']
    })
  }
  fbRegisterCallback = (req, res, next) => {
    const options = {
      method: 'GET',
      uri: `https://graph.facebook.com/oauth/access_token`,
      qs: {
        redirect_uri: 'https://nextjourney.co/public/social/facebook?mode=register',
        client_secret: '745193ce07ef0815936063f03c2e29ed',
        code: req.query.code,
        client_id: '1820096874767617'
      },
      json: true
    };
    request(options)
      .then(fbRes => {
        const userInfo = {
          method: 'GET',
          uri: `https://graph.facebook.com/v3.2/me?fields=id,name,email&access_token=${fbRes.access_token}`,
          json: true
        };
        request(userInfo).then(response => {
          this.model.findOne({email: response.email}, (err, user) => {
            if (!user) {
              let userCreate = new User()
              userCreate.username = response.email
              userCreate.role = 'user'
              userCreate.email = response.email
              userCreate.password = '123456'
              userCreate.save((err, item) => {
                // 11000 is the code for duplicate key error
                if (err && err.code === 11000) {
                  res.sendStatus(400);
                }
                if (err) {
                  return console.error(err);
                }
                const content = new Content();
                const template = new Template();


                const token = JWTctrl.create({user: item})
                MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithFacebook(item.email, item.password, token, 'auth/login')));

                res.status(200).json({token: token, user_id: item._id});
              });
            } else {
              const token = JWTctrl.create({user: user})
              res.status(200).json({token: token, user_id: user._id});
            }
          });
        }).catch(err => {
          // console.log('err=================>',err);
          return res.status(500).json({isSuccessful: false, message: 'Duplicate key error'});
          //
        })
      });
  }
  ttRegisterCallback = (req, res, next) => {
    const options = {
      method: 'POST',
      uri: `https://api.twitter.com/oauth/access_token`,
      qs: {
        redirect_uri: process.env.BASE_URL_CLIENT+'public/social/twitter',
        oauth_verifier: req.query.oauth_verifier,
        oauth_token: req.query.oauth_token,
      },
      json: true
    };
    request(options).then(response => {
      let data: any = {};
      /*
        oauth_token
        oauth_token_secret
        user_id
        screen_name
      */
      response.split('&').forEach((v, k) => {
        var tmpValue = v.split('=');
        data[tmpValue[0]] = tmpValue[1]
      })
      console.log(data,process.env.TWITTER_CONSUMER_KEY)

      var parameters1 = {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        token: data.oauth_token,
        token_secret: data.oauth_token_secret,
        include_email:true,
        include_entities:false,
        skip_status:true
      };
      const optionEmail={
        method:'GET',
        headers: {
          'Authorization': 'OAuth ' + parameters1,
        },
        oauth: parameters1,
        qs: parameters1,
        uri:'https://api.twitter.com/1.1/account/verify_credentials.json?screen_name='+data.screen_name,
        json:true
      }
      request(optionEmail).then(info=>{
        this.model.findOne({email: info.email}, (err, user) => {
          if (!user) {
            let userCreate = new User()
            userCreate.username = info.email
            userCreate.role = 'user'
            userCreate.email = info.email
            userCreate.password = '123456'
            userCreate.save((err, item) => {
              // 11000 is the code for duplicate key error
              if (err && err.code === 11000) {
                res.sendStatus(400);
              }
              if (err) {
                return console.error(err);
              }
              const content = new Content();
              const template = new Template();


              const token = JWTctrl.create({user: item})
              MailCtrl.sendEmailReq(req.body.email, template.template1(content.registerWithFacebook(item.email, item.password, token, 'auth/login')));

              res.status(200).json({token: token, user_id: item._id});
            });
          } else {
            const token = JWTctrl.create({user: user})
            res.status(200).json({token: token, user_id: user._id});
          }
        });
      }).catch(err => {
        // console.log('err=================>',err);
        return res.status(500).json({isSuccessful: false, message: 'Duplicate key error'});
        //
      })

    })

  }
  serverLogs = (req, res, next) =>{
    const options = {
      method: 'GET',
      uri: `http://img.nextjourney.co/logs/${req.params.endpoint}.json`,
      json: true
    };
    request(options)
      .then(response => {
          return res.status(200).json({isSuccessful: true, logs: JSON.parse('['+response.slice(0, -1).slice(0, -1) + ']').reverse().slice(0, 50)});
      });
  }


}



