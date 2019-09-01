import * as nodemailer from 'nodemailer'
import * as fs from 'fs'
import TestData from "../models/test";
import Agencies from "../models/agencies";

export default class MailCtrl {


    sendMail = (req, res) => {
        console.log('=========== sendMail ===========');

        let transporter = nodemailer.createTransport(process.env.EMAIL_CONFIG);
        let mailOptions = {
            from: `"Next Journey Inquiry - ${req.body.email}" <info@nextjourney.co>`,
            to: 'info@nextjourney.co',
            subject: 'Next Journey Inquiry',
            html:
                `<p>Hello <b>Saeid</b></p>` +
                `<p>Inquiry from :${req.body.name} with email ${req.body.email}` +
                `<br/>${req.body.inquiry}</p>`
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) { return console.log(err); }
            console.log('Message sent: ' + info.response);
            res.status(200).json({ isSuccessful: true, message: 'Email sent' });
        });
    };

     static sendEmailReq = (to,template) => {
      let transporter = nodemailer.createTransport(process.env.EMAIL_CONFIG);
        transporter.use('stream', require('nodemailer-dkim').signer({
            domainName: 'nextjourney.co',
            keySelector: '1549180432.nextjourney',
            privateKey: require('fs').readFileSync(__dirname+'/dkim.txt', {
                encoding: 'utf8'
            })
        }));
      console.log(to);
       let mailOptions = {
        help: 'hello@nextjourney.co?subject=help',
        unsubscribe: {
            url: `${process.env.BASE_URL_CLIENT}unsubscribe`,
            comment: ''
        },
        from: `"Next Journey Inquiry - ${to}" <noreply@nextjourney.co>`,
        to: `${to}`,
        // to: `kp.savadi@gmail.com`,
        subject: 'Next Journey',
        html:template

      };

      transporter.sendMail(mailOptions, function (err, info) {
        console.log('omad');
        if (err) { console.log(err); }
        else{
          console.log('Message sent: ' + info.response);
          return true
        }

      });
    }
  sendToAgency=(req,res)=>{
       Agencies.findOne({agency_id:req.query.agency_id}).select('email_address').exec(function (err, agency) {
         if(err){
           return console.error(err)
         }
         if(agency.email_address.length>0&&agency.email_address[0]!==''){
           let html=`<p>hello</p><br><b>message:${req.body.message}</b><br><p>from:${req.body.from}</p>`
           MailCtrl.sendEmailReq(agency.email_address[0],html)
           return res.status(200).json({isSuccessful:true})
         }else{
           return res.status(200).json({isSuccessful:false})
         }
       })
  }
}
