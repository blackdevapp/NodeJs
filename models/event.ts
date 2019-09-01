import * as mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  
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

const Event = mongoose.model('event', eventSchema);

export default Event;
