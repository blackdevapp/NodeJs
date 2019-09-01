import * as moment from 'moment'
import TelegramPost from "../models/tel-post";
import BaseCtrl from "./base";
var fs = require("fs");
const Telegraf = require('telegraf')
const request = require('request-promise');
export default class TelegramCtrl extends BaseCtrl{
  model=TelegramPost;
  bot = new Telegraf(process.env.TELEGRAM_BOT);

  postInChannel = (req, res) => {
    req.body.remarks = 'New Trip Package has been added';
    this.bot.telegram.sendMessage(req.body.chatId, this.htmlBuilder(
      req.body.packageData,
      req.body.components,
      req.body.agencyId,req.body.data),
      {parse_mode: 'html'}).then((data) => {
      const obj = new TelegramPost(req.body.data);
      obj.associated_agency = req.body.agencyId;
      obj.save((err, item) => {
        if (err && err.code === 11000) {
          res.sendStatus(400);
        }
        if (err) {
          return console.error(err);
        }
        this.bot.launch();
        res.status(200).json({isSuccessful: true, post: item, telRes: data});
      });
      //
    }).catch(function (e) {
      res.status(400).json(e);
    });
    ;
  }
  generalPostInChannel = (req, res) => {
    req.body.remarks = 'New Trip Package has been added';
    let replaceInArray = function(str){
      return str.replace(/\s+/g, "\\_")
    }

    // this.bot.telegram.sendMessage(req.body.chatId, 'test').then((data) => {
    this.bot.telegram.sendMessage(req.body.chatId, 
      `[​​​​​​​​​​​](${req.body.data.images[0]}) ${req.body.data.description}


      #${req.body.data.tags.map(replaceInArray).join(' #')}


    `,{parse_mode: 'markdown'}).then((data) => {
      const obj = new TelegramPost(req.body.data);
      obj.associated_agency = req.body.agencyId;
      obj.save((err, item) => {
        if (err && err.code === 11000) {
          res.sendStatus(400);
        }
        if (err) {
          return console.error(err);
        }
        this.bot.launch();
        res.status(200).json({isSuccessful: true, post: item, telRes: data});
      });
      //
    }).catch(function (e) {
      res.status(400).json(e);
    });
    ;
  }
  htmlBuilder = (trip, components, agencyId,data) => {
    let listing = ' ',
      totalPrice = 0;
    // data.tags.forEach((v, k) => {
    //   v = v.replace(new RegExp(' ', 'g'), '_');
    //   listing = `${listing} #${v} `;
    // });
    // components.forEach(element => {
    //   totalPrice = totalPrice + element.soloPrice;
    //   listing = listing + `
		// 	 ${element.type} on <b>${moment(element.details.from.departure.date).format('DD MMM YYYY')}</b>
		// 	 <b>From: ${element.details.from.city} - To: ${element.details.to.city}</b>
		// 	 `
    // })
    let html = `
		${listing}
		For as low as ${totalPrice}
		<a href="https://nextjourney.co/public/${agencyId}/landingTour/${trip._id}">
		More Info ...
		</a>
		`;


    return html;
  }
  checkChannelName = (req, res) => {
    this.bot.telegram.getChat(req.params.chatId).then((data) => {
      res.status(200).json(data);
    }).catch(function (e) {
      res.status(400).json(e);
    });

  }
  checkIfAdmin = (req, res) => {
    console.log(req.params.chatId)
    this.bot.telegram.getChatMember(req.params.chatId, '785448884').then((data) => {
      res.status(200).json(data);
    }).catch(function (e) {
      res.status(400).json(e);
    });
  }
}
