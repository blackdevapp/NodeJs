import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import JWTctrl from "../controllers/authcontroller";
import MailCtrl from "../controllers/mailcontroller";
var CryptoJS = require("crypto-js");

const agenciesSchema = new mongoose.Schema({
  admin: String,
  company_name: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  official_representative: {
    type: String,
    default: ''   
  },
  alternative_representative: {
    type: Array,
    default: []

  },
  telephone_number: {
    type: Array,
    default: []
  },
  mobile_number: {
    type: Array,
    default: []
  },
  fax_number: {
    type: Array,
    default: []
  },
  email_address: {
    type: Array,
    default: []
  },
  location: String,
  office_address: {
    type: Array,
    default: []
  },
  permissions: {
      type:{
          dashboard:{
              type: Boolean
          },
          itinerary:{
              type: Boolean
          },
          inquries:{
              type: Boolean
          },
          accounting:{
              type: Boolean
          },
          marketing:{
              type: Boolean
          },
          smartVisa:{
              type: Boolean
          },
          agencyConfig:{
              type: Boolean
          },
          agencyEmployees:{
              type: Boolean
          },
      },
      default:{
          dashboard:false,
          itinerary:false,
          inquries:false,
          accounting:false,
          marketing:false,
          smartVisa:false,
          agencyConfig:false,
          agencyEmployees:false,
      }

  },
  social_media: { // social media model for one account per social
    type: {
      linkedin: {
        type: Object

      },
      facebook: {
        token: {
          type: String,
          require: true
        },
        userID: {
          type: String,
          require: true,
          unique: true
        },
        pages: [
          {
            id: String,
            name: String,
            access_token: String
          }
        ]

      },
      instagram:{
        type: String
      },
      telegram:{
        type:String
      },
      twitter:{
        screen_name: String,
        secret: String,
        token: String
      },
      youtube:{
        access_token: String,
        expires_in: Number,
        refresh_token: String,
        scope: String,
        token_type: {
          type: String,
          enum: ['Bearer']
        },
        setupDate: Date,
        active: Boolean
      }

    },
    default: {
      linkedin: {},
      facebook: {},
      instagram: {},
      telegram: "",
      youtube: {}
    }

  },
  amadeus_api: {
    type: String,
    default: ''
  },
  taxIdentificationNo: {
    type: String,
    default: ''
  },
  bankAccounts: {
    type: Array,
    default: [
      {
        type: '',
        accountNo: ''
      }
    ]
  },
  website: {
    type: String,
    default: ''
  },
  services: String,
  deleted: {
    type: Boolean,
    default: false
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  agency_id: String,
  config: {
    currency: { type: String, default: 'PHP' },
    max_quantity: { type: Number, default: 50 }
  },
  members: [String],
  forms: {
    type: Object,
    default: []
  },


});

agenciesSchema.methods.decryptAmadeus = function (amadeus_key, callback) {
  var amadeusConfig=CryptoJS.AES.decrypt(amadeus_key,'NextJourneyAmadeusSecretKey');
  if(amadeusConfig){
    return callback(null, JSON.parse(amadeusConfig.toString(CryptoJS.enc.Utf8)));;

  }else{
    return callback(null);
  }
};


agenciesSchema.pre('findOneAndUpdate', function (next) {
  const agency = this;
  if (!agency._update.website) {
    return next();
  }
  if(agency._update.website.indexOf('https://')){
    agency._update.website=agency._update.website.replace('https://','')
  }if(agency._update.website.indexOf('http://')){
    agency._update.website=agency._update.website.replace('http://','')
  }
  next()
});


agenciesSchema.plugin(mongoosePaginate);

const Agencies = mongoose.model('Agencies', agenciesSchema);

export default Agencies;
