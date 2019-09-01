import * as rp from 'request-promise'
import * as mongo from 'mongodb'
var ObjectID = mongo.ObjectID;
export default class Utility {

  static getSabreConfig(): any {

    const config = {
      gzip: true,
      client_id: `V1:eip386ot8wvyl3rs:DEVCENTER:EXT`,
      client_secret: `j9rVpK7Y`,
      uri: `https://api.test.sabre.com`
    }

    return config;
  }

  static getAmadeusConfig(): any {
    const config = {
      clientId: `Q2xHwQV1tYTQ7ieG3Z5iKFp5edAcA6mA`,
      clientSecret: `ZwC2BD7xnEnn37J4`
    }

    return config;
  }

  static getAmadeusKey(): any {
    return 'NextJourneyAmadeusSecretKey';
  }

  static unifyHotelAmadeus(d): any {
    let arrangePrice = (c, t) => {
      return parseFloat(t) - (parseFloat(t) * (c / 100));
    };
    let unified = [];
    d.forEach(function (v) {
      for (let item of v.offers) {
        unified.push(
          {
            _id:new ObjectID(),
            offerId: item.id,
            currency: item.price.currency,
            variations: item.price.variations,
            cancellations: item.policies.cancellations,
            asSharable: false,
            associated_agency: 'amadeus',
            status: 'active',
            onlineData: false,
            deleted: false,
            type: 'hotel-room',
            company: v.hotel.name,
            user: 'amadeus',
            soloPrice: parseFloat(item.price.total),
            soloPriceChild: parseFloat(item.price.total),
            bulkPrice: arrangePrice(item.commission ? item.commission.percentage : 0, item.price.total),
            quantity: 100,
            tax: 0,
            bulkPriceChild: arrangePrice(item.commission ? item.commission.percentage : 0, item.price.total),
            asSolo: true,
            asPackage: true,
            mode: 'accomodation',
            icon: 'hotel',
            deadline: {
              date: '2099-02-25 03:13:01.045',
              time: '00:00'
            },
            publishedDate: new Date(),
            updatedDate: new Date(),
            details: {
              "from": {
                "departure": {"date": "2019-04-15T16:00:00.000Z", "time": "00:00"},
                "arrival": {"date": "2019-04-16T16:00:00.000Z", "time": "00:00"},
                "class": "ECONOMY",
                "city": "add1"
              },
              "to": {
                "departure": {"date": "2019-03-17T11:28:39.355Z", "time": "00:00"},
                "arrival": {"date": "2019-03-17T11:28:39.355Z", "time": "00:00"},
                "class": "ECONOMY",
                "city": "add2"
              },
              "addons":[
                {
                  name: "Business Class",
                  availability: true,
                  icon: "airline_seat_legroom_extra",
                  type:'mat'
                },
                {
                  name: "Insurance",
                  availability: true,
                  icon: "beenhere",
                  type:'mat'
                },
                {
                  name: "Seat Pick",
                  availability: true,
                  icon: "event_seat",
                  type:'mat'
                },
                {
                  name: "Food",
                  availability: true,
                  icon: "fastfood",
                  type:'mat'
                }
              ],
              "roundTrip": false
            }

          })
      }
    })
    return unified;

  }
  static unifyAgodaHotels(d,from,to): any {
    let getImages = (c) => {
      let images=[];
      c.filter(function (item) {
        images.push(item.imageItemProps.url.replace('//',''))
      })
      return images
    };
    let unified = [];
    return new Promise((resolve,reject)=>{
      if(d.ResultList.length>0){
        d.ResultList.forEach((v,i)=>{
          if(v.PriceSummary.SellExclusive>0){
            unified.push(
              {
                _id:new ObjectID(),
                hotelID: v.HotelID,
                supplierId: v.SupplierId,
                hotelName:v.EnglishHotelName,
                currency:v.Currency=='$'?'USD':'PHP',
                image:v.MainPhotoUrl?v.MainPhotoUrl.replace('//',''):null,
                asSharable: false,
                associated_agency: 'agoda',
                status: 'active',
                onlineData: false,
                deleted: false,
                url:v.HotelUrl,
                type: 'hotel-room',
                company: 'agoda',
                user: 'agoda',
                soloPrice: parseFloat(v.PriceSummary.SellInclusive),
                soloPriceChild: parseFloat(v.PriceSummary.SellInclusive),
                bulkPrice:parseFloat(v.PriceSummary.SellExclusive) ,
                bulkPriceChild:parseFloat(v.PriceSummary.SellExclusive) ,
                quantity: 100,
                images:getImages(v.galleryContainerProps.mainImages),
                tax: 0,
                asSolo: true,
                asPackage: true,
                mode: 'accomodation',
                icon: 'hotel',
                deadline: {
                  date: '2099-02-25 03:13:01.045',
                  time: '00:00'
                },
                publishedDate: new Date(),
                updatedDate: new Date(),
                details: {
                  "from": {
                    "departure": {"date":from, "time": "00:00"},
                    "arrival": {"date": to, "time": "00:00"},
                    "class": "ECONOMY",
                    "city": v.CityName
                  },
                  "lat":v.Latitude,
                  "lng":v.Longitude,
                  addons:[
                    {
                      name: "Business Class",
                      availability: true,
                      icon: "airline_seat_legroom_extra",
                      type:'mat'
                    },
                    {
                      name: "Insurance",
                      availability: true,
                      icon: "beenhere",
                      type:'mat'
                    },
                    {
                      name: "Seat Pick",
                      availability: true,
                      icon: "event_seat",
                      type:'mat'
                    },
                    {
                      name: "Food",
                      availability: true,
                      icon: "fastfood",
                      type:'mat'
                    }
                  ],
                  "roundTrip": false
                }

              })
          }

          if(i===d.ResultList.length-1){
            resolve(unified)
          }
        })
      }else{
        resolve([])
      }


    })
  }
  static unifyAgodaCity(d): any {
    let unified = [];
    return new Promise((resolve,reject)=>{
      if(d.length>0){
        d.forEach((v,i)=>{
            unified.push({
              "CountryName": v.DisplayNames?v.DisplayNames.GeoHierarchyName:'',
              "CityName": v.Name,
            });

          if(i===d.length-1){
            resolve(unified)
          }
        })
      }else{
        resolve([])
      }


    })
  }

  static unifyAirfareAmadeus(d, currency): any {
    let unified = [];
    d.forEach(function (v) {
      for (let item of v.offerItems) {
        unified.push({
          _id:new ObjectID(),
          currency: currency,
          asSharable: true,
          associated_agency: 'amadeus',
          status: 'active',
          onlineData: false,
          deleted: false,
          type: 'AIRPLANE',
          company: '',
          user: 'amadeus',
          segments: item.services[0].segments,
          soloPrice: item.pricePerAdult.total,
          soloPriceChild: item.price.total,
          bulkPrice: item.pricePerAdult.total,
          quantity: item.services[0].segments[0].pricingDetailPerAdult.availability,
          bulkPriceChild: item.price.total,
          tax: item.price.totalTaxes,
          asSolo: true,
          details:{
            addons:[
              {
                name: "Business Class",
                availability: true,
                icon: "airline_seat_legroom_extra",
                type:'mat'
              },
              {
                name: "Insurance",
                availability: true,
                icon: "beenhere",
                type:'mat'
              },
              {
                name: "Seat Pick",
                availability: true,
                icon: "event_seat",
                type:'mat'
              },
              {
                name: "Food",
                availability: true,
                icon: "fastfood",
                type:'mat'
              }
            ]
          },
          asPackage: true,
          mode: 'transport',
          icon: "airplanemode_active",
          deadline: {
            date: item.services[0].segments[0].flightSegment.departure.at,
            time: item.services[0].segments[0].flightSegment.departure.at.substring(11, 16)
          },
          publishedDate: new Date(),
          updatedDate: new Date()

        })
      }

    })
    return unified;
  }

  static unifyAirAsia(d,segment): any {
    let unified = {};
    let segments=[];
    segment.forEach(function (item) {
      segments.push({
        flightSegment:{
          departure:{
            at:item.STD.replace(' ','T')+':00+02:00',
            iataCode:item.DepartureStation
          },
          arrival: {
            iataCode: item.ArrivalStation,
            at: item.STA.replace(' ','T')+':00+02:00'
          },
        }
      })
    });
    // d.forEach(function (v) {
        unified={
          _id:new ObjectID(),
          currency:'PHP',
          asSharable: true,
          associated_agency: 'airasia',
          status: 'active',
          onlineData: false,
          deleted: false,
          type: 'AIRPLANE',
          company: '',
          user: 'airasia',
          segments:segments,
          soloPrice: d.BrandedFares.LowFare.TotalPrice,
          soloPriceChild: d.BrandedFares.LowFare.TotalPrice,
          bulkPrice: d.BrandedFares.LowFare.TotalPrice,
          quantity: d.BrandedFares.LowFare.AvailableCount?d.BrandedFares.LowFare.AvailableCount:0,
          bulkPriceChild: d.BrandedFares.LowFare.TotalPrice,
          tax: 0,
          asSolo: true,
          details:{
            addons:[
              {
                name: "Business Class",
                availability: true,
                icon: "airline_seat_legroom_extra",
                type:'mat'
              },
              {
                name: "Insurance",
                availability: true,
                icon: "beenhere",
                type:'mat'
              },
              {
                name: "Seat Pick",
                availability: true,
                icon: "event_seat",
                type:'mat'
              },
              {
                name: "Food",
                availability: true,
                icon: "fastfood",
                type:'mat'
              }
            ]
          },
          asPackage: true,
          mode: 'transport',
          icon: "airplanemode_active",
          deadline: {
            date: segments[0].flightSegment.departure.at,
            time: segments[0].flightSegment.departure.at.substring(11, 16)
          },
          publishedDate: new Date(),
          updatedDate: new Date()
      };

    // })
    return unified;
  }

  static returnSegmentsAirAsia(id:Array<any>){
    return new Promise((resolve,reject)=>{
      let segments=[];
      id.forEach(function (item, index) {
        const options = {
          method: 'GET',
          uri: `https://sch.apiairasia.com/inventory/${item}/file.json`,
          json: true
        }
        rp(options).then(response =>{
          segments.push(response);
          if(index===id.length-1){
            resolve(segments)
          }
        }).catch(err => {
          reject(err);
        })
      })
    })
  }

  static unifyFacebookPost(post,item){
    let postFb={
      _id:item._id,
      tags:item.tags,
      packageId:item.packageData,
      postId:item.postId,
      deleted:item.deleted,
      associated_agency: item.associated_agency,
      publishedDate: item.publishedDate,
      pageName:item.pageName,
      message:post.message,
      likes:post.likes,
      comments:post.comments,
      link:post.link
    };
    return postFb;
  }
}

