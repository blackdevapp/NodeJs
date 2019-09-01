import * as mongoose from 'mongoose';

const passportsSchema = new mongoose.Schema({
		holder: String,
		data: Object,
		deleted: {
			type: Boolean,
			default: false
		}
	});

const Passports = mongoose.model('Passports', passportsSchema);

export default Passports;
