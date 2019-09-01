// var fs = require("fs");
// var path = require("path");
import * as fs from 'fs'
import * as path from 'path'
var Throttle = require("stream-throttle").Throttle;

export default class UploadCtrl {
  upload = (req, res) => {

    const { userId } = req.params;
    const fileName = `nj_${userId}_${Date.now()}.jpg`;
    try {
        // process.env.IMAGE_UPLOAD_DIR

      const out = path.join(__dirname,process.env.IMAGE_UPLOAD_DIR, fileName)

      // throttle write speed to 4MB/s
      return new Promise((resolve, reject) => {

        req.pipe(new Throttle({ rate: 1024 * 4096 }))
          .pipe(fs.createWriteStream(out, { flags: 'w', encoding: null, fd: null, mode: 0o666 }))
          .on('finish', () => { 
            console.log(req.files);
            fs.writeFile(out, req.files.image.data, function (err) {
              if (err) {
                console.log(err)
              }
            });
          })
          .on('close', () => { 
            resolve(out) 
          })
      }).then(path => {
        return res.json({ isSuccessful: true, result: { path: process.env.IMAGE_UPLOAD_CALLBACK+fileName } })
      });
    } catch (err) {
      return res.json({ isSuccessful: false, err: err })
    }
  }

}
