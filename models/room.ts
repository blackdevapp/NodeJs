import * as mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  
			type: String,
			user: String,
			asSolo: Boolean,
			asPackage: Boolean,
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
			company: {
				type: String
			},
			soloPrice: {
				type: Number
			},
			bulkPrice:  {
				type: Number
			},
			deadline:  {
				type: Object
			},
			details: {
				title: String,
				children: Array,

			}

		
	});

const Room = mongoose.model('Room', roomSchema);

export default Room;
