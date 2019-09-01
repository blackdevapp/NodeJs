import * as mongoose from 'mongoose';

const formPaternSchema = new mongoose.Schema({
  
			type: String,
			user: String,
			deleted: {
				type: Boolean,
				default: false
			},
			publishedDate: {
				type: Date,
				default: () => Date.now()
			},
			updatedDate: {
				type: Date,
				default: () => Date.now()
			},
			details: {
				resourceId: String,
				start: Date,
				end: Date,
				title: String

			}

		
	});

const FormPatern = mongoose.model('FormPatern', formPaternSchema);

export default FormPatern;
