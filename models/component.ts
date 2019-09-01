import * as mongoose from 'mongoose';
import User from "./user";
import Content from "../mail-template/content";
import Template from "../mail-template/template";
import MailCtrl from "../controllers/mailcontroller";
import JWTctrl from "../controllers/authcontroller";
import Agencies from "./agencies";
import Package from "./package";

const componentSchema = new mongoose.Schema({

    type: String,
    name: String,
    user: String,
    currency: String,
    asSolo: Boolean,
    asPackage: Boolean,
    asSharable: {
        type: Boolean,
        default: false
    },
    images: [String],
    mode: String,
    componentName: String,
    icon: String,
    associated_agency: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'DRAFT'
    },
    onlineData: {
        type: Boolean,
        default: false
    },
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
    bulkPrice: {
        type: Number
    },
    soloPriceChild: {
        type: Number
    },
    originalPriceChild: {
        type: Number
    },
    originalPriceAdult: {
        type: Number
    },
    originalPriceInfant: {
        type: Number
    },
    bulkPriceChild: {
        type: Number
    },
    quantity: {
        type: Number
    },
    tax: {
        type: Number
    },
    deadline: {
        type: Object
    },
    details: {
        type: Object
    }
    // {
    // 	roundTrip: {
    // 		type: Boolean
    // 	},
    // 	addons: Array,
    // 	from: {
    // 		city: {
    // 			type: String
    // 		},
    // 		airport: {
    // 			type: String
    // 		},
    // 		departure: {
    // 			date: {
    // 				type: Date
    // 			},
    // 			time: {
    // 				type: Object
    // 			},
    // 		},
    // 		arrival: {
    // 			date: {
    // 				type: Date
    // 			},
    // 			time: {
    // 				type: Object
    // 			},
    // 		},
    // 		class: {
    // 			type: String
    // 		},
    // 	},
    // 	to: {
    // 		city: {
    // 			type: String
    // 		},
    // 		airport: {
    // 			type: String
    // 		},
    // 		departure: {
    // 			date: {
    // 				type: Date
    // 			},
    // 			time: {
    // 				type: Object
    // 			},
    // 		},
    // 		arrival: {
    // 			date: {
    // 				type: Date
    // 			},
    // 			time: {
    // 				type: Object
    // 			},
    // 		},
    // 		class: {
    // 			type: String
    // 		},
    // 	}
    // }


});
componentSchema.pre('findOneAndUpdate', function (next) {
    const component = this;
    // component._update.updatedDate = new Date(Date.now());
    next()
});
componentSchema.post('save', function (doc, next) {
    if (doc.asSolo) {
        var newPackage = {
            components: [doc._id],
            images: [],
            remarks: '<p>New package with solo component</p>',
            name: doc.name,
            status: 'PUBLISHED',
            deleted: false,
            publishedDate: doc.publishedDate,
            updatedDate: Date.now(),
            tripDeadline: doc.deadline,
            favorited: 0,
            totalPrice: 0,
            discount: 0,
            isFeatured: false,
            bought: 0,
            associated_agency: doc.associated_agency,
            creator: doc.user,
        };
        const obj = new Package(newPackage);
        obj.save((err, item) => {
            // 11000 is the code for duplicate key error
            if (err && err.code === 11000) {
                next()
            }
            if (err) {
                return console.error(err);
            }
            next()
        });
    } else {
        next()
    }

});
const Component = mongoose.model('Component', componentSchema);

export default Component;
