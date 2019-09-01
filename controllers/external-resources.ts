import * as Amadeus from 'amadeus';
import Utility from './utilityfunctions'
import Agencies from "../models/test";
import {AIRASIA_API, SABRE_APIS, SKYSCANNER_APIS} from '../constants';

const rp = require('request-promise');
import * as SabreDevStudio from 'sabre-dev-studio'
import {request} from 'http';
import User from "../models/user";

export default class ExternalResourcesCtrl {
  agSample = {
    "SearchMessageID": "2ab78414-f918-46eb-96bc-0dc5c3321cc",
    "IsPollDmc": false,
    "SearchType": 1,
    "ObjectID": 0,
    "HashId": null,
    "Filters": {
      "HotelName": "",
      "PriceRange": {"Min": 0, "Max": 0, "IsHavePriceFilterQueryParamter": false, "Value": 0},
      "PriceRanges": null,
      "ReviewScoreMin": 0,
      "StarRating": [],
      "Facilities": null,
      "AccomodationType": null,
      "ProductType": null,
      "NumberOfBedrooms": null,
      "Areas": null,
      "Landmarks": null,
      "Benefits": null,
      "ReviewScores": [],
      "Transportations": null,
      "TransportLandmarks": null,
      "Beachs": null,
      "PaymentOptions": null,
      "TopGuestRatedArea": null,
      "LocationScoreMin": 0,
      "LocationScore": null,
      "RoomOffers": null,
      "RoomAmenities": null,
      "Cities": null,
      "AffordableCategories": [],
      "TravellerChoiceAward": null,
      "Deals": null,
      "BrandsAndChains": null,
      "ReviewLocationScores": null,
      "AllGuestStaffRating": null,
      "AllGuestValueRating": null,
      "AllGuestComfortRating": null,
      "AllGuestLocationRating": null,
      "AllGuestFacilitiesRating": null,
      "AllGuestCleanlinessRating": null,
      "LocationHighlights": null,
      "Size": 0
    },
    "SelectedColumnTypes": {"ProductType": [-1]},
    "RateplanIDs": null,
    "TotalHotels": 269,
    "PlatformID": 1001,
    "CurrentDate": "2019-05-13T13:09:34.6343659+07:00",
    "SearchID": 991110513130934700,
    "CityId": 15903,
    "Latitude": 0,
    "Longitude": 0,
    "Radius": 0,
    "RectangleSearchParams": null,
    "PageNumber": 1,
    "PageSize": 25,
    "SortOrder": 1,
    "SortField": 0,
    "PointsMaxProgramId": 0,
    "PollTimes": 0,
    "SearchResultCacheKey": "afc6e686-5a2f-4999-bce2-0e3f26f53fd",
    "RequestedDataStatus": 2,
    "MaxPollTimes": 4,
    "CityName": "Boracay Island",
    "ObjectName": "Boracay Island",
    "AddressName": null,
    "CountryName": "Philippines",
    "CountryId": 70,
    "IsAllowYesterdaySearch": false,
    "CultureInfo": "en-US",
    "CurrencyCode": "PHP",
    "UnavailableHotelId": 0,
    "IsEnableAPS": false,
    "SelectedHotelId": 0,
    "IsComparisonMode": false,
    "HasFilter": false,
    "LandingParameters": {
      "HeaderBannerUrl": null,
      "FooterBannerUrl": null,
      "SelectedHotelId": 0,
      "LandingCityId": 15903
    },
    "NewSSRSearchType": 0,
    "IsWysiwyp": false,
    "RequestPriceView": null,
    "FinalPriceView": 1,
    "MapType": 1,
    "IsShowMobileAppPrice": false,
    "IsApsPeek": false,
    "IsRetina": false,
    "IsCriteriaDatesChanged": false,
    "ShouldAddSearchHistory": false,
    "TotalHotelsFormatted": "269",
    "PreviewRoomFinalPrice": null,
    "ReferrerUrl": null,
    "CountryEnglishName": "Philippines",
    "CityEnglishName": "Boracay Island",
    "Cid": -218,
    "Tag": null,
    "ProductType": -1,
    "NumberOfBedrooms": [],
    "ShouldHideSoldOutProperty": false,
    "FamilyMode": false,
    "isAgMse": false,
    "ccallout": false,
    "defdate": false,
    "BankCid": null,
    "BankClpId": null,
    "Adults": 2,
    "Children": 0,
    "Rooms": 1,
    "CheckIn": "2019-05-23T00:00:00",
    "LengthOfStay": 1,
    "ChildAges": [],
    "DefaultChildAge": 8,
    "ChildAgesStr": null,
    "CheckOut": "2019-05-24T00:00:00",
    "Text": "Boracay Island",
    "IsDateless": false,
    "CheckboxType": 0,
    "TravellerType": 1
  }
//amadeus
  getAirportsList = (req, res) => {

    var amadeus = new Amadeus(Utility.getAmadeusConfig());

    let opt: any = {};
    let cb = (err, data) => {
      if (err) {
        res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
      } else {
        res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
      }
    };
    amadeus.referenceData.locations.get({
      subType: 'AIRPORT',
      keyword: req.params.city,
      'page[limit]': 10,
      'page[offset]': 0,
      sort: 'analytics.travelers.score',
      view: 'FULL'
    }).then(function (data) {
      let body = data.result.data;
      res.status(200).json({isSuccessful: true, result: body});
    }).catch(function (responseError) {
      res.status(500).json({isSuccessful: false, result: responseError});
    });
  }
  getFlightOffers = (req, res) => {
    // console.log(AgenciesCtrl.getAmadeusInfo('nj9AsGI11'));
    Agencies.findOne({agency_id: req.query.agency_id}).select('amadeus_api').exec(function (err, someValue) {
      if (err) return res.status(500).json({isSuccessful: false});
      if (someValue) {
        someValue.decryptAmadeus(someValue.amadeus_api, (error, value) => {
          if (!value) {
            return res.sendStatus(403);
          }
          var amadeus = new Amadeus(value);
          console.log(value)

          let opt: any = {};
          let cb = (err, data) => {
            if (err) {
              res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
            } else {
              res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
            }
          };

          // Flight Low-fare Search
          amadeus.shopping.flightOffers.get({
            origin: req.body.origin,
            destination: req.body.destination,
            departureDate: req.body.departureDate,
            max: 10,
            // 'page[offset]':0,
            // sort:'pricePerAdult.total',
          }).then(function (data) {
            User.findOne({_id: req.query.userId}).select('markup').exec(function (err, user) {
              if (user.markup && user.markup > 0) {
                let body = Utility.unifyAirfareAmadeus(data.result.data, data.result.dictionaries.currencies);
                for (let item of body) {
                  item.soloPrice += item.soloPrice * user.markup / 100;
                  item.soloPriceChild += item.soloPrice * user.markup / 100;
                  item.bulkPrice += item.bulkPrice * user.markup / 100;
                  item.bulkPriceChild += item.bulkPriceChild * user.markup / 100;
                }
                res.status(200).json({isSuccessful: true, result: body});

              } else {
                let body = Utility.unifyAirfareAmadeus(data.result.data, data.result.dictionaries.currencies);
                res.status(200).json({isSuccessful: true, result: body});

              }
            })
            // let body =data
          }).catch(function (responseError) {
            res.status(500).json({isSuccessful: false, result: responseError});
          });
        });

      } else {
        return res.status(200).json({isSuccessful: false});
      }
    });

  }
  getHotelOffers = (req, res, next) => {
    Agencies.findOne({agency_id: req.query.agency_id}).select('amadeus_api').exec(function (err, someValue) {
      if (err) return res.status(500).json({isSuccessful: false});
      if (someValue) {
        someValue.decryptAmadeus(someValue.amadeus_api, (error, value) => {
          if (!value) {
            return res.sendStatus(403);
          }
          var amadeus = new Amadeus(value);

          let opt: any = {};
          let cb = (err, data) => {
            if (err) {
              res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
            } else {
              res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
            }
          };
          amadeus.shopping.hotelOffers.get({
            cityCode: req.params.cityCode,
            // sort:'price.total',
            max: 10,
            // 'page[offset]':0
          }).then(function (data) {
            User.findOne({_id: req.query.userId}).select('markup').exec(function (err, user) {
              if (user.markup && user.markup > 0) {
                let body = Utility.unifyHotelAmadeus(data.result.data);
                for (let item of body) {
                  item.soloPrice += item.soloPrice * user.markup / 100;
                  item.soloPriceChild += item.soloPrice * user.markup / 100;
                  item.bulkPrice += item.bulkPrice * user.markup / 100;
                  item.bulkPriceChild += item.bulkPriceChild * user.markup / 100;
                }
                res.status(200).json({isSuccessful: true, result: body});
              } else {
                let body = Utility.unifyHotelAmadeus(data.result.data);
                res.status(200).json({isSuccessful: true, result: body});
              }
            })
            // let body = data.result.data;
            // let body = data;

          }).catch(function (responseError) {
            res.status(500).json({isSuccessful: false, result: responseError});
          });
        });

      } else {
        return res.status(200).json({isSuccessful: false});
      }
    });

  }
  getCityInfo = (req, res) => {
    var amadeus = new Amadeus(Utility.getAmadeusConfig());
    amadeus.referenceData.locations.get({
      keyword: req.params.cityName,
      subType: req.query.type ? req.query.type : 'AIRPORT,CITY'
    }).then(function (data) {
      res.status(200).json(JSON.parse(data.body).data);
    }).catch(function (responseError) {
      res.status(500).json({isSuccessful: false, result: responseError});
    });
  }


//airasia
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
    rp(options).then(response => {
      const flightsOptions = {
        method: 'GET',
        uri: `${AIRASIA_API.FLIGHT_OPTIONS}${from.toLowerCase()}/${to.toLowerCase()}/${date}/file.json`,
        json: true

      }
      console.log(flightsOptions)
      let lowPrice = response[`${to}${from}|${currency}`][date];
      rp(flightsOptions).then(flightsResponse => {
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
    let result = [];
    rp(options).then(response => {
      if (response && response.GetAvailability.length > 0) {
        response.GetAvailability[0].FaresInfo.forEach(function (item, index) {
          let id = item.InventoryLegs.split('|');
          Utility.returnSegmentsAirAsia(id).then(segments => {
            result.push(Utility.unifyAirAsia(item, segments));
            if (index === response.GetAvailability[0].FaresInfo.length - 1) {
              User.findOne({_id: req.query.userId}).select('markup').exec(function (err, user) {
                if (user.markup && user.markup > 0) {
                  for (let item of result) {
                    item.soloPrice += item.soloPrice * user.markup / 100;
                    item.soloPriceChild += item.soloPrice * user.markup / 100;
                    item.bulkPrice += item.bulkPrice * user.markup / 100;
                    item.bulkPriceChild += item.bulkPriceChild * user.markup / 100;
                  }
                  return res.status(200).json({isSuccessful: true, result: result})

                } else {
                  return res.status(200).json({isSuccessful: true, result: result})

                }
              })

            }
          }).catch(err => {
            return res.status(400).json(err)
          })
        })


      }
      // Utility.unifyAirAsia()
    }).catch(err => {
      return res.status(400).json(err)
    })
  }

//sabre

  getAirlineList = (req, res) => {
    const sabre = new SabreDevStudio(Utility.getSabreConfig());

    let opt: any = {};
    let cb = (err, data) => {
      if (err) {
        res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
      } else {
        res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
      }
    };
    sabre.get(SABRE_APIS.AIRLINE_LIST, opt, cb);
  }
  getLowPriceFares = (req, res) => {
    const sabre = new SabreDevStudio(Utility.getSabreConfig());

    let opt: any = {};
    let cb = (err, data) => {
      if (err) {
        res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
      } else {
        res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
      }
    };
    console.log(req.params.city)
    sabre.get(`${SABRE_APIS.LOW_PRICE_LOOKUP}/${req.params.city}`, opt, cb);
  }
  getGeoLocation = (req, res) => {
    const sabre = new SabreDevStudio(Utility.getSabreConfig());

    let opt: any = {};
    let cb = (err, data) => {
      if (err) {
        res.status(500).json({isSuccessful: false, message: 'Service Unavailable: ' + err});
      } else {
        res.status(200).json({isSuccessful: true, result: JSON.parse(data)});
      }
    };
    sabre.get(`${SABRE_APIS.GEO_AUTOCOMPELETE}?query=${req.params.city}&limit=5`, opt, cb);

  }
// Cebu
  getCebuFlights = (req, res) => {
    const options = {
      method: 'GET',
      uri: `https://book.cebupacificair.com/Flight/InternalSelect?s=true&o1=MNL&d1=CEB&dd1=2019-05-17&dd2=2019-05-18&r=true&mon=true&dj1=0&dj2=1`,


    }
    rp(options).then(response => {
      res.status(200).json(response)
    })
    //https://book.cebupacificair.com/Flight/InternalSelect?s=true&o1=MNL&d1=CEB&dd1=2019-05-17&dd2=2019-05-18&r=true&mon=true&dj1=0&dj2=1
  }

  getAgodaCityCode = (req, res) => {
    const options = {
      method: 'GET',
      uri: `https://www.agoda.com/Search/Search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${req.params.q}`,
      json: true
    }
    rp(options).then(response => {
      res.status(200).json(response);

    })
  }

  tomorrowCheckIn(date) {
    var currentDate = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000);
    return currentDate
  }

  getCompanyList = (req, res) => {
    const options = {
      method: 'POST',
      form: {
        _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchTxt: req.query.company_name,
        _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnsFormCategory: '',
        _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchCategory: '',
        _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchSorting: '',
        bnResetBtn: '',
        _PBR_BNSearch_WAR_PBR_BNSearchportlet_bnSearchAscDesc: 'bnSortAsc'
      },
      uri: `https://bnrs.dti.gov.ph/web/pbr/search?p_p_id=PBR_BNSearch_WAR_PBR_BNSearchportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=bnsViewList&p_p_cacheability=cacheLevelPage&p_p_col_id=column-2&p_p_col_count=2`,
      json: true
    }
    rp(options).then(response => {
      res.status(200).json({isSuccessful: response.success, result: response.dataList})
    })
  }

  getAgodaListing = (req, res) => {
    this.agSample.CheckIn = req.body.CheckIn ? req.body.CheckIn : this.agSample.CheckIn;
    this.agSample.CheckOut = req.body.CheckOut ? req.body.CheckOut : this.tomorrowCheckIn(this.agSample.CheckIn);
    this.agSample.CityId = req.body.cityId;
    const options = {
      method: 'POST',
      body: this.agSample,
      uri: `https://www.agoda.com/api/en-us/Main/GetSearchResultList`,
      json: true
    }
    rp(options).then(response => {
      // console.log(response)
      let self = this;
      User.findOne({_id: req.query.userId}).select('markup').exec(function (err, user) {
        if (user.markup && user.markup > 0) {
          Utility.unifyAgodaHotels(response, self.agSample.CheckIn, self.agSample.CheckOut).then(res1 => {
            for (let item of res1) {
              item.soloPrice += item.soloPrice * user.markup / 100;
              item.soloPriceChild += item.soloPrice * user.markup / 100;
              item.bulkPrice += item.bulkPrice * user.markup / 100;
              item.bulkPriceChild += item.bulkPriceChild * user.markup / 100;
            }
            res.status(200).json({result: res1, isSuccessful: true,response:response});
          })
        } else {
          Utility.unifyAgodaHotels(response, self.agSample.CheckIn, self.agSample.CheckOut).then(res1 => {
            res.status(200).json({result: res1, isSuccessful: true});
          })
        }
      })

      // res.status(200).json(response)

    })
  }

  getSearchAirplaneResult = (req, res) => {
    var option = {
      method: 'GET',
      uri: `${SKYSCANNER_APIS.AIRLINE_LIST}${req.query.city}?IsDestination=false&enable_general_search_v2=true`,
      json: true
    };
    rp(option).then(list => {
      let result = [];
      if (req.query.type === 'city') {
        list.forEach(function (item) {
          if (!item.AirportInformation || item.PlaceId.length === 4) {
            result.push(item);
          }
        })
      }
      if (req.query.type === 'airport') {
        list.forEach(function (item) {
          if (item.AirportInformation || item.PlaceId.length === 3) {
            result.push(item);
          }
        })
      }
      const options = {
        method: 'GET',
        uri: `https://www.agoda.com/Search/Search/GetUnifiedSuggestResult/3/1/1/0/en-us/?searchText=${req.query.city}`,
        json: true
      };
      rp(options).then(response => {
        Utility.unifyAgodaCity(response.ViewModelList).then(list => {
          result = result.concat(list);
          result=this.getUnique(result,'CityName');
          result=result.filter((item)=>item.CityName.length>0)
          result=result.filter((item)=>item.CountryName.length>0)
          res.status(200).json({isSuccessful: true, result: result});

        })

      })
    }).catch(e => {
      res.status(500).json({isSuccessful: false, error: e})
    });
  }
  getUnique(arr, comp) {
    const unique = arr
      .map(e => e[comp])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter(e => arr[e])
      .map(e => arr[e]);
    return unique;
  }
}

