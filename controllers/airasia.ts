import * as Amadeus from 'amadeus';
import Utility from './utilityfunctions'
import AgenciesCtrl from "./agencies";
import TestData from "../models/test";
import JWTctrl from "./authcontroller";
import { AIRASIA_API } from '../constants';
const rp = require('request-promise');

export default class AirAsiaCtrl {


	getCheapFlightStartsFrom = (req, res) => {
    let date = req.body.date,
        from = req.body.from,
        to = req.body.to,
        currency = req.body.currency
    const options = {
      method: 'GET',
      uri: `${AIRASIA_API.QUERY}${currency}/${to}/${from}/${date}/2/16`,
      json: true

    }
    rp(options).then(response =>{
      const flightsOptions = {
        method: 'GET',
        uri: `${AIRASIA_API.FLIGHT_OPTIONS}${from.toLowerCase()}/${to.toLowerCase()}/${date}/file.json`,
        json: true

      }
      console.log(flightsOptions)
      let lowPrice = response[`${to}${from}|${currency}`][date];
      rp(flightsOptions).then(flightsResponse =>{
        let data = {
          price: lowPrice,
          details: flightsResponse
        }
        return res.status(200).json(data)
      }).catch(err => {
        console.log('Im in err area')
        return res.status(400).json(err)
      })

    }).catch(err => {
      console.log('Im in err area')
      return res.status(400).json(err)
    })
  }
  getFlightsDetailsPerDay = (req, res) => {
    let date = req.body.date,
        from = req.body.from,
        to = req.body.to;
    const options = {
      method: 'GET',
      uri: `${AIRASIA_API.PERDAY}${from}/${to}/${date}/1/0/0`,
      headers: {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBMXoyUWloUEtXSWdtYlJ3a0ExWXpHcjNobFZKN1hJMiIsImlhdCI6MTU0NDQzODIwOCwiZXhwIjoxNjA3NTk2NjA4LCJhdWQiOiJQV0EgRGV2Iiwic3ViIjoicHJhZGVlcGt1bWFyckBhaXJhc2lhLmNvbSJ9.QJPYvJvzx8IZFP6mYTAKwva7eQ_DVT_4JRwk75Uhhd8'
      },
      json: true

    }
    rp(options).then(response =>{
      return res.status(200).json(response)
    }).catch(err => {
      return res.status(400).json(err)
    })
  }
  // https://sch.apiairasia.com/schedule/mnl/pps/2019-04-19/file.json


}
