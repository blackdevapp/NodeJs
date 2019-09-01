import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';
import MailCtrl from "../controllers/mailcontroller";
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import JWTctrl from '../controllers/authcontroller'
import Agencies from './agencies';

const userSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  middleName: String,
  lastName: String,
  title: {type: String, enum: ['Dr.', 'Mr.', 'Ms.', 'Attny'], default: 'Mr.'},
  address: String,
  state: String,
  official_address: String,
  landLine: String,
  birthDate:Date,
  city: String,
  company_name: String,
  age: Number,
  purposeOfVisit: {type: String, enum: ['tourist', 'traveller', 'citizen', 'others'], default: 'others'},
  mobileNo: {type: String},
  email: {type: String, unique: true, lowercase: true, trim: true, required: true},
  password: {type: String, required: true, default: '123456'},
  deleted: {type: Boolean, required: true, default: false},
  role: {type: String, enum: ['superadmin', 'admin', 'user', 'agent', 'encoder','van-driver','tour-guide','company'], default: 'user'},
  associated_agency: {type: String, default: null},
  markup:{type:Number,default:0},
  agency_id: String,
});

// Before saving the user, hash the password
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }
    console.log(user.password);
    bcrypt.hash(user.password, salt, function (error, hash) {
      if (error) {
        return next(error);
      }
      console.log(hash);
      user.password = hash;
      next();
    });
  });
});

userSchema.pre('findOneAndUpdate', function (next) {
  const user = this;
  if (!user._update.password) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user._update.password, salt, function (error, hash) {
      if (error) {
        return next(error);
      }
      user._update.password = hash;
      const content=new Content();
      const template=new Template();
      MailCtrl.sendEmailReq(user._update.email, template.template1(content.successChangePass(user._update.email)));


      next();
    });
  });
});



userSchema.post('save', function (doc, next) {
  const content=new Content();
  const template=new Template();
  const token = JWTctrl.create({ user: doc });

  if (doc.role === 'agent' || doc.role === 'encoder') {
    const token = JWTctrl.create({ user: doc });
    const agency = Agencies.findOne({ agency_id: doc.associated_agency, deleted: false }).select('company_name');


    MailCtrl.sendEmailReq(doc.email, template.template1(content.agencyRegistration(agency.company_name,doc.role,process.env.BASE_URL_CLIENT+'login?token='+token)));
    next()
  } else if(doc.role=='user'){
    MailCtrl.sendEmailReq(doc.email, template.template1(content.userRegistration(doc.email,doc.associated_agency,process.env.BASE_URL_CLIENT+'login?token='+token)));
    next()
  }else if(doc.role=='admin'){
    next()
  }else if(doc.role=='van-driver'){
    MailCtrl.sendEmailReq(doc.email, template.template1(content.userRegistration(doc.email,doc.associated_agency,process.env.BASE_URL_CLIENT+'login?token='+token)));

    next()
  }else if(doc.role=='company'){
    MailCtrl.sendEmailReq(doc.email, template.template1(content.userRegistration(doc.email,doc.associated_agency,process.env.BASE_URL_CLIENT+'login?token='+token)));

    next()
  }

});
userSchema.post('findOneAndUpdate', function (doc, next) {
  const content=new Content();
  const template=new Template();
  if (doc.role === 'agent' || doc.role === 'encoder') {
    const token = JWTctrl.create({ user: doc });
    const agency = Agencies.findOne({ agency_id: doc.associated_agency, deleted: false }).select('company_name');

    MailCtrl.sendEmailReq(doc.email, template.template1(content.agencyRegistration(agency.company_name,doc.role,process.env.BASE_URL_CLIENT+'login?token='+token)));
    next()
  } else{
    next()
  }

});


userSchema.methods.comparePassword = function (candidatePassword, callback) {
  console.log(candidatePassword, this.password)
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
};

// Omit the password when returning a user
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;
