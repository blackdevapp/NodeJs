import * as mongoose from 'mongoose';

const airportsSchema = new mongoose.Schema({
			id: Number,
			airportName: String,
			city: String,
			country: String,
			iata: String,
			icao: String,
			lat: Number,
			long: Number,
			elevation: Number,
			utc: String,
			dst: String,
			from: String,
			type: String,
			source: String,

		
	});

const Airports = mongoose.model('Airports', airportsSchema);

export default Airports;
