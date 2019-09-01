import * as express from 'express';
import * as multer from 'multer';

import ComponentCtrl from './controllers/component';
import CountriesCtrl from './controllers/countries';
import PassportsCtrl from './controllers/passports';
import PackageCtrl from './controllers/package';
import RoomCtrl from './controllers/room';
import UserCtrl from './controllers/user';
import EventCtrl from './controllers/event';
import NewsletterCtrl from './controllers/newsletter';
import AirportsCtrl from './controllers/airports';
import AgenciesCtrl from './controllers/agencies';
import MailCtrl from './controllers/mailcontroller';
import SabreCtrl from './controllers/sabrecontroller';
import AmadeusCtrl from './controllers/amadeus';
import AirAsiaCtrl from './controllers/airasia';
import CitiesCtrl from './controllers/cities';
import AccountingCtrl from './controllers/accounting';
import SkyScanner from './controllers/skyScanner';
import SheetCtrl from './controllers/sheet';
import JobsCtrl from './controllers/jobscontroller';
import UploadCtrl from './controllers/fileupload';
import InquerieCtrl from './controllers/inqueriecontroller';
import SocialCtrl from "./controllers/social";
import TelegramCtrl from "./controllers/telegram";
import PaymentCtrl from "./controllers/payments"
import ExternalResourcesCtrl from "./controllers/external-resources";
import FacebookPostCtrl from "./controllers/fb-post";
import TwitterPostCtrl from "./controllers/tt-post";
import LinkedinPostCtrl from "./controllers/ln-post";
import ConvertCtrl from "./controllers/convert";
import NotificationCtrl from "./controllers/notification";
import Test from './models/test'

const storage = multer.memoryStorage();
const upload = multer({ storage }); // multer configuration

export default function setRoutes(app) {


  //define passport
  var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy,
    LinkedInStrategy = require('passport-linkedin-oauth2').Strategy,
    PinterestStrategy = require('passport-pinterest').Strategy,
    OAuth2Strategy = require('passport-oauth2').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    YoutubeStrategy = require('passport-youtube').Strategy,
    FlickrStrategy = require('passport-flickr').Strategy;
  // passport-flickr
  passport.use(new YoutubeStrategy({
    clientID: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    callbackURL: `${process.env.URL}/public/social/youtube`
  },
    function (accessToken, refreshToken, profile, done) {
      console.log('profile', profile);
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
    }
  ));
 

  passport.use(new TwitterStrategy({
    consumerKey:process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: process.env.URL+'/panel/marketing'
    // callbackURL: 'http://localhost:4200/panel/marketing'
  },
    function (token, tokenSecret, profile, done) {
      console.log('profile', profile);
      console.log('accessToken', token);
      console.log('refreshToken', tokenSecret);
      console.log('done', done);
    }
  ));

  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret:process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `${process.env.URL}/api/auth/linkedin/callback`,
    profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline'],
    scope: ['r_emailaddress', 'r_basicprofile','w_share','rw_company_admin'],
    state: true,
    session: false
  },
    function (token, tokenSecret, profile, done) {
       process.nextTick(function () {
          // To keep the example simple, the user's LinkedIn profile is returned to
          // represent the logged-in user. In a typical application, you would want
          // to associate the LinkedIn account with a user record in your database,
          // and return that user instead.
          return done(null, profile);
        });
    }
  ));


  passport.use(new PinterestStrategy({
    clientID: process.env.PINTEREST_CLIENT_ID,
    clientSecret: process.env.PINTEREST_CLIENT_SECRET,
    callbackURL: process.env.URL+"/public/social/pinterest",
    state: true
  },
    function (accessToken, refreshToken, profile, done) {
      console.log('profile', profile);
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('done', done);
    }
  ));
  passport.use(new FlickrStrategy({
    consumerKey: process.env.FILICKR_CONSUMER_KEY,
    consumerSecret: process.env.FILICKR_CONSUMER_SECRET,
    callbackURL: process.env.URL+"/public/social/flickr"
  },
    function (accessToken, refreshToken, profile, done) {
      console.log('profile', profile);
      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('done', done);
    }
  )); 
  


  const router = express.Router();

  const componentCtrl = new ComponentCtrl();
  const countriesCtrl = new CountriesCtrl();
  const passportsCtrl = new PassportsCtrl();
  const packageCtrl = new PackageCtrl();
  const userCtrl = new UserCtrl();
  const socialCtrl = new SocialCtrl();
  const newsletterCtrl = new NewsletterCtrl();

  const roomCtrl = new RoomCtrl();
  const eventCtrl = new EventCtrl();
  const airportsCtrl = new AirportsCtrl();
  const agenciesCtrl = new AgenciesCtrl();
  const mailCtrl = new MailCtrl();
  const sabreCtrl = new SabreCtrl();
  const amadeusCtrl = new AmadeusCtrl();
  const extCtrl = new ExternalResourcesCtrl();
  const airasiaCtrl = new AirAsiaCtrl();

  const citiesCtrl = new CitiesCtrl();
  const accountingCtrl = new AccountingCtrl();
  const jobsCtrl = new JobsCtrl();
  const fbPost = new FacebookPostCtrl();
  const ttPost = new TwitterPostCtrl();
  const lnPost = new LinkedinPostCtrl();
  const notificationCtrl = new NotificationCtrl();
  const sheet = new SheetCtrl();
  const uploadCtrl = new UploadCtrl();
  const inquerieCtrl = new InquerieCtrl();
  const telegramCtrl = new TelegramCtrl();
  const paymentCtrl = new PaymentCtrl()
  const convertCtrl = new ConvertCtrl()

  // Components
  router.route('/component').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) },
    componentCtrl.getAll);
  router.route('/component/user/:id').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.getByUser);
  router.route('/component/count').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.count);
  router.route('/component/:id').get(componentCtrl.get);
  router.route('/component/filter/:params').get(componentCtrl.getByFilter);
  router.route('/component/filter/strong/:params').post(componentCtrl.getByRangeFilter);
  router.route('/component/filter').post(componentCtrl.getByStrongFilter);
  router.route('/component').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.insert);
  router.route('/component/:id').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.update);
  router.route('/component/:id').delete(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.delete);//getMultiple
  router.route('/component/multiple').post(componentCtrl.getMultiple);
  router.route('/component/live').get(componentCtrl.getLiveData);
  router.route('/component/multiple').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, componentCtrl.updateAll);
               

  // Packages
  router.route('/package').get(packageCtrl.getAll);
  router.route('/package/check/valid').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.checkValidForBook);
  router.route('/package/check/custom/valid').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.checkValidForCustomBook);
  router.route('/package/user/:id').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.getByUser);
  router.route('/package/count').get(packageCtrl.count);
  router.route('/package/:id').get(userCtrl.jwtTokenValidation, packageCtrl.get);
  router.route('/package/filter/:params').get(packageCtrl.getByFilter);
  router.route('/package/filter').post(packageCtrl.getByStrongFilter);
  router.route('/package/filter/:params/:page/:limit').get(packageCtrl.getByFilterPagination);
  router.route('/package').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.insert);
  router.route('/package/:id').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.update);
  router.route('/package/:id').delete(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.delete);
  router.route('/package/sell/bestSellers').get(packageCtrl.getBestSellers);
  router.route('/package/image/:query').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, packageCtrl.getImageSuggestion);

  // Users
  router.route('/login').post(userCtrl.login);
  router.route('/refreshToken').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.refreshToken);
  router.route('/generateCode').post(userCtrl.encryptObject);
  router.route('/change-password').post(userCtrl.changePassword);
  router.route('/users').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.getAll);
  router.route('/user/check').get(userCtrl.checkUserExist);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user').post(userCtrl.register);
  router.route('/company').post(userCtrl.registerCompany);
  router.route('/van').post(userCtrl.registerVan);
  router.route('/user/:id').get(userCtrl.get);
  router.route('/payment').get(paymentCtrl.paypalVisaProcess);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/search/:q').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.autoSuggestion);
  router.route('/user/multiple').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.updateAll);
  router.route('/user/company/name').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.setCompanyName);
  router.route('/user/multiple').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, userCtrl.jwtTokenValidation, userCtrl.getMulti);
  router.route('/user/server/logs/:endpoint').get(userCtrl.serverLogs);
  // serverLogs


  router.route('/test').get((req,res,next)=>{
    

    Test.find({agency_id:'nj9AsGI11'},(err,row)=>{
      
      res.send(row)
    })


    // Test.findOneAndUpdate({agency_id:'nj9AsGI11'},{
    //   social_media:{
    //     facebook:{pages:[]},
    //     linkedin:'',
    //     instagram:'',
    //     telegram:'',
    //     twitter:{
    //       screen_name:'',
    //       secret:'',
    //       token:''
    //     }
    //   }},(err,row)=>{
    //   console.log(err)
    //   res.send(row)
    // })
  })
  //social Route , change by masoud
  router.route('/auth/facebook').get(function (req, res, next) {

    console.log('call get')
    let agencyId = req.query.agency_id
    socialCtrl.getSocialMedial( agencyId).then((social) => {
      res.send(social)
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })
  })
  router.route('/auth/facebook').post(function (req, res, next) {
    // passport.authenticate(
    //   'facebook',
    //   {
    //     callbackURL: 'http://localhost:4200/public/social/facebook',
    //     scope: ['manage_pages', 'email', 'public_profile', 'publish_pages', 'publish_to_groups']
    //   }
    //   , process.nextTick(function (err, user, info) {
    //       if (err)
    //         console.log(err);
    //       console.log(user);
    //       console.log(info)
    //     }
    //   ))(req, res, next);
    let agencyId = req.query.agency_id
    let facebookAccount = req.body

    socialCtrl.setFacebookAccount(facebookAccount, agencyId).then(() => {
      res.send({ isSuccesfull: true })
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })


   

  });   
  router.route('/auth/facebook/pages').put(function (req, res, next) {
    
    let agencyId = req.query.agency_id
    let pages = req.body

    socialCtrl.updateFacebookPages(pages, agencyId).then(() => {
      res.send({ isSuccesfull: true })
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })


   

  });   
  router.route('/auth/facebook').delete(function (req, res, next) {
    // passport.authenticate(
    //   'facebook',
    //   {
    //     callbackURL: 'http://localhost:4200/public/social/facebook',
    //     scope: ['manage_pages', 'email', 'public_profile', 'publish_pages', 'publish_to_groups']
    //   }
    //   , process.nextTick(function (err, user, info) {
    //       if (err)
    //         console.log(err);
    //       console.log(user);
    //       console.log(info)
    //     }
    //   ))(req, res, next);
    let agencyId = req.query.agency_id
    
    socialCtrl.logoutFacebookAccount(agencyId).then(() => {
      res.send({ isSuccesfull: true })
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })




  });
  router.route('/auth/twitter').delete(function (req, res, next) {
   
    let agencyId = req.query.agency_id
    
    socialCtrl.logoutTwitterAccount(agencyId).then(() => {
      res.send({ isSuccesfull: true })
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })

  });
  router.route('/auth/telegram').delete(function (req, res, next) {
   
    let agencyId = req.query.agency_id
    
    socialCtrl.logoutTelegramAccount(agencyId).then(() => {
    
      res.send({ isSuccesfull: true })
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })

  });
  router.route('/auth/facebook/register').get(function (req, res, next) {
    passport.authenticate(
      'facebook',
      {
        callbackURL: process.env.URL+'/public/social/facebook?mode=register',
        scope: ['manage_pages', 'email', 'public_profile', 'publish_pages', 'publish_to_groups']
      }
      , process.nextTick(function (err, user, info) {
        if (err)
          console.log(err);
        console.log(user);
        console.log(info)
      }
      ))(req, res, next);
  });


  router.route('/auth/twitter/register').get(function (req, res, next) {
    passport.authenticate(
      'twitter',
      {
        callbackURL: process.env.URL+'/public/social/twitter?mode=register',
        scope: ['manage_pages', 'email', 'public_profile', 'publish_pages', 'publish_to_groups']
      }
      , process.nextTick(function (err, user, info) {
        if (err)
          console.log(err);
        console.log(user);
        console.log(info)
      }
      ))(req, res, next);
  });
  router.route('/auth/facebook/callback').get(socialCtrl.setFacebookAccess);
  router.route('/auth/facebook/callback/register').get(userCtrl.fbRegisterCallback);
  router.route('/auth/twitter/callback/register').get(userCtrl.ttRegisterCallback);
  router.route('/social/facebook/posts').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, fbPost.getAllFacebookPost);
  router.route('/social/twitter/posts/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, ttPost.getByFilter);
  router.route('/social/linkedin/posts/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, lnPost.getByFilter);
  router.route('/social/telegram/posts/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, telegramCtrl.getByFilter);



  router.route('/auth/twitter').get(function (req, res, next) {
  
    passport.authenticate('twitter',
      {
        callbackURL: `${process.env.URL}/api/auth/twitter/callback?agency_id=${req.query.agency_id}`,
        // callbackURL: 'http://localhost:3000/api/auth/twitter/callback',
        session: true 
      })(req, res, next);
  });
  router.route('/auth/google').get(function (req, res, next) {

    passport.authenticate('google',
      {
        callbackURL: `${process.env.URL}/api/auth/google/callback?agency_id=${req.query.agency_id}`,
        // callbackURL: 'http://localhost:3000/api/auth/twitter/callback',
        session: true
      })(req, res, next);
  });

  router.route('/auth/twitter/callback').get(socialCtrl.setTwitterAccess);
  router.route('/auth/google/callback').get(socialCtrl.setTwitterAccess);
  router.route('/auth/linkdin/callback').get(socialCtrl.setLinkedinAccess);
  router.route('/auth/youtube').get(function (req, res, next) {
    passport.authenticate('youtube',
      {
        callbackURL: `${process.env.URL}/api/auth/youtube/callback`,
        session: true,
        state: `${req.query.agency_id}`,
        scope: ['https://www.googleapis.com/auth/youtube.upload']
      })(req, res, next);
  });
  router.route('/auth/youtube/callback').get(socialCtrl.setYoutubeAccess);

  // setLinkedinAccess
  router.route('/auth/linkedin').get(function (req, res, next) {
    passport.authenticate('linkedin',
      {
        // callbackURL: `${process.env.URL}/public/social/linkedin`,
        callbackURL: `${process.env.URL}/api/auth/linkedin/callback?agency_id=${req.query.agency_id}`,
        scope: ['r_emailaddress', 'r_liteprofile','w_member_social']
      })(req, res, next);
  });
  router.route('/auth/linkedin/callback').get(socialCtrl.setLinkedinAccess);


  router.route('/auth/pinterest').get(function (req, res, next) {
    passport.authenticate('pinterest',
      {
        callbackURL: 'https://nextjourney.co/public/social/pinterest',
        scope: ['read_public', 'read_relationships', 'write_public', 'write_relationships']
      })(req, res, next);
  });
  router.route('/auth/pinterest/callback').get(socialCtrl.setPinterestAccess);

  router.route('/auth/flickr').get(function (req, res, next) {
    passport.authenticate('flickr',
      {
        callbackURL: 'https://nextjourney.co/public/social/flickr',
        scope: ['delete']
      })(req, res, next);
  });
  router.route('/auth/flickr/callback').get(socialCtrl.setFlickrAccess);

  router.route('/auth/telegram').get(function (req, res, next) {

    
    let agencyId = req.query.agency_id
    let account = req.query.account
    socialCtrl.setTelegramAccount( agencyId,account).then((social) => {
      res.send(social)
    }).catch(err => {
      console.log(err)
      res.status(500).send(err)
    })
  })


  // Visa process
  router.route('/visa/countries/search/:q').get(countriesCtrl.autoSuggestion);
  router.route('/visa/passports/filter/:params').get(passportsCtrl.getByFilter);

  // Airports
  router.route('/airports').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.getAll);
  router.route('/airports/count').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.count);
  router.route('/airports').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.insert);
  router.route('/airports/:id').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.get);
  router.route('/airports/:id').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.update);
  router.route('/airports/filter').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, airportsCtrl.getByStrongFilter);

  // Agencies
  router.route('/agencies').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.getAll);
  router.route('/agency/config').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.getAgencyConfig);
  router.route('/agencies').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.insertAgency);
  router.route('/agencies/filter/search/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.getByFilter);
  router.route('/agencies/find').get(agenciesCtrl.getAgencyByFilterQuery);
  // router.route('/agencies/agency-code/:website').get(agenciesCtrl.getAgancyCodeByWebsite);
  router.route('/agencies/agency-code/url').get(agenciesCtrl.getAgancyCodeByWebsite);
  router.route('/agencies/amadeus-api').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.updateAmadeusApiInfo);
  router.route('/agencies/find/:page/:limit').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.getByStrongFilterPagination);
  router.route('/agencies/filter/form').get(agenciesCtrl.getFormByAgency);
  router.route('/agencies/filter/form/all').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.getAllFormByAgency);
  router.route('/agencies/form').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.insertFormByAgency);
  router.route('/agencies/form').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, agenciesCtrl.editFormByAgency);
  router.route('/agencies/:id').get(agenciesCtrl.get);
  router.route('/agencies/:id').put(agenciesCtrl.update);




  // Inquerie
  router.route('/agencies/inquerie/:agencyId/:page/:limit').get(inquerieCtrl.getAllWithId);
  router.route('/agencies/inquerie/count').get(inquerieCtrl.count);
  router.route('/agencies/inquerie/last/filter').get(inquerieCtrl.getLastInquery);
  router.route('/agencies/inquerie/:id').get(inquerieCtrl.get);
  router.route('/agencies/inquerie').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, inquerieCtrl.insert);
  router.route('/agencies/inquerie/:id').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, inquerieCtrl.update);
  router.route('/agencies/inquerie/:id').delete(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, inquerieCtrl.delete);
  router.route('/agencies/inquerie/multiple').put(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, inquerieCtrl.updateAll);
  router.route('/agencies/inquerie/filter/:params').get(inquerieCtrl.getByFilter);
  router.route('/agencies/inquerie/filter-checkout/:params').get(inquerieCtrl.getByFilterCheckout);
  router.route('/agencies/inquerie/filter/:params/:page/:limit').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, inquerieCtrl.getAllInqueryByFilter);

  // Social Medias
  router.route('/social/telegram').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, telegramCtrl.generalPostInChannel);
  router.route('/social/facebook').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.postInFbPage);
  router.route('/social/facebook/pages').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.getFacebookPages);
  router.route('/social/linkedin').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.postInLinkedinPage);
  router.route('/social/pinterest').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.postInPinterest);
  router.route('/social/youtube').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.postInYoutubePage);
  router.route('/social/twitter').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) },socialCtrl.uploadMediaTwitter, socialCtrl.postInTwitter);
  router.route('/social/twitter/media').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.uploadMediaTwitter);
  router.route('/social/telegram/channels/:chatId').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, telegramCtrl.checkChannelName);
  router.route('/social/telegram/status/:chatId').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, telegramCtrl.checkIfAdmin);
  router.route('/social/tag-generator').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, socialCtrl.tagGenerator);


  router.route('/agencies/contact-us').post(mailCtrl.sendToAgency);




  router.route('/payments/pp/pay').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, paymentCtrl.paypal);
  router.route('/payments/pp/callback').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, paymentCtrl.paypalCallback);
  router.route('/payments/accounting/callback').get(accountingCtrl.bookingProcess);
  router.route('/payments/accounting/callback/manual').get(accountingCtrl.bookingProcessManual);
  router.route('/payments/accounting/callback/custom').get(accountingCtrl.bookingProcessCustom);


  router.route('/room/:paramsData').get(roomCtrl.getAll);
  router.route('/room/count').get(roomCtrl.count);
  router.route('/room/:id').get(roomCtrl.get);
  router.route('/room/filter/:params').get(roomCtrl.getByFilter);
  router.route('/room').post(roomCtrl.insert);
  router.route('/room/:id').put(roomCtrl.update);
  router.route('/room/multiple').post(roomCtrl.getMultiple);



  router.route('/notification/filter/:params').get(notificationCtrl.getByFilterCustom);

  router.route('/reservation').get(eventCtrl.getAll);
  router.route('/accounting/transaction/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.getAllTransactions);
  router.route('/accounting/lastTransactions').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.getLastTransactions);
  router.route('/accounting/transaction/:params/:page/:limit').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.getAllTransactionsPagination);
  router.route('/accounting/transaction/totapayments/accounting/callbacklPrice/:params').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.totalPrice);
  router.route('/accounting/journals').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.getAllTransactions);
  router.route('/accounting/insert').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.insertAccounting);
  router.route('/accounting/transaction/find').post(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, accountingCtrl.getByStrongFilterCustom);
  router.route('/accounting/transaction/pdf').get(accountingCtrl.downloadTransactionFile);
  router.route('/room/reservation').post(eventCtrl.insert);

  router.route('/package/check/visa').post(paymentCtrl.payVisaProcess);
  router.route('/package/check/pay').post(paymentCtrl.payProcess);



  // Email Sending
  router.route('/email').post(mailCtrl.sendMail);



  router.route('/sheet').get(sheet.makeSheet);

  router.route('/external/cities/:cityName').get(function (req, res, next) { userCtrl.jwtTokenValidation(req, res, next, ['superadmin', 'admin', 'user', 'agent', 'encoder', 'van-driver', 'tour-guide', 'company']) }, citiesCtrl.getCity);





  router.route('/external/am/airports/:city').get(extCtrl.getAirportsList);
  router.route('/external/am/flights/').post(extCtrl.getFlightOffers);
  router.route('/external/am/hotels/:cityCode').get(extCtrl.getHotelOffers);
  router.route('/external/am/cities/:cityName').get(extCtrl.getCityInfo);
  router.route('/external/ak/flights/').post(extCtrl.getCheapFlightStartsFrom);
  router.route('/external/ak/flights/perday/').post(extCtrl.getFlightsDetailsPerDay);
  router.route('/external/cb/flights/perday/').post(extCtrl.getCebuFlights);
  router.route('/external/sb/airline').get(extCtrl.getAirlineList);
  router.route('/external/ag/city/:q').get(extCtrl.getAgodaCityCode);
  router.route('/external/ag/listing').post(extCtrl.getAgodaListing);
  router.route('/external/sb/lowpriced/:city').get(extCtrl.getLowPriceFares);
  router.route('/external/sb/geo/:city').get(extCtrl.getGeoLocation);
  router.route('/external/ss/search').get(extCtrl.getSearchAirplaneResult);
  router.route('/external/cc/search').get(extCtrl.getCompanyList);
  // router.route('/external/cities/suggestion/:cityName').get(citiesCtrl.getCitySuggestion);
  // getCitySuggestion



  // test accounting
  // router.route('/accounting').get(accountingCtrl.test);  
  // Test Jobs
  // router.route('/generateagencyid').get(jobsCtrl.generateAgencyId);

  // File Upload

  router.route('/upload/:userId').post(uploadCtrl.upload);

  router.route('/convert').get(convertCtrl.convertAganciesData)
  //newsletter
  router.route('/newsletter/subscribe').post(newsletterCtrl.insertNewsletter);




  // Apply the routes to application with the prefix /api
  app.use('/api', router);

}
