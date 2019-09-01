import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

const transactionSchema = new mongoose.Schema({
        credit: Number,
        debit: Number,
        meta: Schema.Types.Mixed,
        datetime: Date,
        account_path: [String],
        accounts: String,
        book: String,
        memo: String,
        _journal: {
          type: Schema.Types.ObjectId,
          ref: "Medici_Journal"
        },
        timestamp: Date,
        voided: {
          type: Boolean,
          default: false
        },
        void_reason: String
      });

transactionSchema.plugin(mongoosePaginate);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
