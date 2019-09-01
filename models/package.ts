import * as mongoose from 'mongoose';
import Component from './component';

var videoshow = require('videoshow')
import * as mongoosePaginate from 'mongoose-paginate-v2';
import {request} from "http";
import * as path from "path";

const download = require('image-downloader')


const packageSchema = new mongoose.Schema({
    components: [String],
    images: Array,
    logo: String,
    remarks: String,
    details:Object,
    name: String,
    currency: String,
    hasExternal: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'DRAFT'
    },
    componentDetails: {
        type: Object,
        default: {}
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
    tripDeadline: {
        date: {
            type: Date
        },
        time: {
            type: Object
        }
    },
    favorited: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    bought: {
        type: Number,
        default: 0
    },
    associated_agency: {
        type: String,
        default: ''
    },
    creator: {
        type: String,
        default: ''
    },
    externalResources: []
});
packageSchema.pre('findOneAndUpdate', function (next) {
    const packages = this;
    packages._update.updatedDate = new Date(Date.now());
    next()
});
packageSchema.post('save', function (doc, next) {
    // const packages = this;
    console.log(doc.images)
    let images = [];
    let removedIndex = [];
    if (doc.images.length > 0) {
        let index=0;
        for(let image of doc.images){
            if (image.indexOf('pixabay.com') > -1) {
                let options = {
                    url: image,
                    dest: process.env.IMAGE_UPLOAD_DIR
                };

                download.image(options)
                    .then(({filename, image}) => {
                        images.push(process.env.IMAGE_UPLOAD_CALLBACK+filename);
                        removedIndex.push(index)
                        index++;

                        if (index === doc.images.length - 1) {
                            for (let i = removedIndex.length - 1; i >= 0; i--)
                                doc.images.splice(removedIndex[i], 1);
                            doc.images = doc.images.concat(images)
                            console.log(doc.images);
                            next()
                        }
                    })
                    .catch((err) => {
                        removedIndex.push(index);
                        index++

                        if (index === doc.images.length - 1) {
                            for (let i = removedIndex.length - 1; i >= 0; i--)
                                doc.images.splice(removedIndex[i], 1);
                            doc.images = doc.images.concat(images)
                            next()
                        }
                    })
            }
            else {
                index++;
                if (index === doc.images.length - 1) {
                    for (let i = removedIndex.length - 1; i >= 0; i--)
                        doc.images.splice(removedIndex[i], 1);
                    doc.images = doc.images.concat(images)
                    next()
                }
            }
        }

    } else {
        next()
    }

    // let i=0;
    // if(packages.components.length>0){
    //   for (let item of packages.components) {
    //     Component.find({ "_id": item }, (err, component) => {
    //       if (err) { return console.error(err); }
    //       // packages.totalPrice=packages.totalPrice+component[0].soloPrice
    //       if(i==packages.components.length-1){
    //         next()
    //       }
    //       i++;
    //
    //     });
    //   }
    // }else{
    //   next()
    // }

});

packageSchema.plugin(mongoosePaginate);

const Package = mongoose.model('Package', packageSchema);

export default Package;
