import * as mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type:String,
    details:{
        type:Object,
        default:{}
    },
    user_role:{type: String, enum: ['superadmin', 'admin', 'user', 'agent', 'encoder','van-driver','tour-guide','company'], default: 'user'},
    agency_id:String,
    user_id:String,
    seen:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    }

});
notificationSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
