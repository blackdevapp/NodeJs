
export const REQUEST_TIMEOUT = 3600000

export const SABRE_APIS = {
    AIRLINE_LIST: '/v1/lists/utilities/airlines',
    LOW_PRICE_LOOKUP: '/v1/shop/flights/cheapest/fares/',
    GEO_AUTOCOMPELETE: '/v1/lists/utilities/geoservices/autocomplete'
    
}
export const AMADEUS_APIS = {
    AIRLINE_LIST: '/v2/reference-data/urls/checkin-links'   
}

export const SKYSCANNER_APIS={
  AIRLINE_LIST:'https://www.skyscanner.net/g/autosuggest-flights/IR/en-GB/'
}
export const PIXABAY_API={
  QUERY:'https://pixabay.com/api/?image_type=photo&'
}
export const AIRASIA_API={
  QUERY:'https://k.airasia.com/availabledates/api/v1/pricecalendar/0/1/',
  FLIGHT_OPTIONS: 'https://sch.apiairasia.com/schedule/',
  INVENTORY: 'https://sch.apiairasia.com/inventory/',
  PERDAY: 'https://k.airasia.com/shopprice-pwa/0/0/'
}
