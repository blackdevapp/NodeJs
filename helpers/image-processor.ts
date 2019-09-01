import * as  download from'image-downloader';

export default class ImageProcessor {
  

  static imageDownloader(liveImages):any {
  	var images = [];
    let counter = 0;
    if (liveImages.length > 0) {
      liveImages.forEach((item, k) => {
        let options = {
          url: item,
          dest: '../tmp'
        }
        return download.image(options)
          .then(({ filename, image }) => {
            console.log('File saved to', filename)
            images.push({ path: filename, loop: 4, caption: 'caption' })
            counter++
            if (counter === liveImages.length) {
              // let tmp = images[0];
              // images = []
              // images.push(tmp);

              return images;
            }

          })
          .catch((err) => {
            console.error(err)
          })

      })
    }
  }
  imageResizer(){
  	
  }
}
 