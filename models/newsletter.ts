import * as mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
		email: String,
	});

const Newsletter = mongoose.model('newsletter', newsletterSchema);

export default Newsletter;
