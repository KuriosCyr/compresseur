const fs = require('fs');
const Path = require("path");
const fsExtra = require('fs-extra');
const sharp = require('sharp');
const sizeOf = require('image-size')
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');

  /**
   * 
   * HELPERS
   * 
   */
 
  async function getBuffer(fields, data){
    const dimensions = sizeOf(data)
    const [newWidth, newHeight] = calculateSize(data, Number(dimensions.width), Number(dimensions.height));
    const buffer = await sharp(data)
    .resize(newWidth, newHeight)
    .jpeg({quality: 100})
    .toBuffer()
    
    return buffer;
  }

function calculateSize(img, maxWidth, maxHeight) {
    const dimensions = sizeOf(img)
    let width = dimensions.width;
    let height = dimensions.height;

    // calculate the width and height, constraining the proportions
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [Math.round(width), Math.round(height)];
}


  // function calculateSize(img, maxWidth, maxHeight) {
  //   const dimensions = sizeOf(img)
  //   let width = dimensions.width;
  //   let height = dimensions.height;

  //   // calculate the width and height, constraining the proportions
  //   if (width > height) {
  //     if (width > maxWidth) {
  //       height = Math.round((height * maxWidth) / width);
  //       width = maxWidth;
  //     }
  //   } else {
  //     if (height > maxHeight) {
  //       width = Math.round((width * maxHeight) / height);
  //       height = maxHeight;
  //     }
  //   }
  //   return [Number(width), Number(height)];
  // }

  function createJSONFile(jsonPath, data){
    fs.writeFileSync(jsonPath, JSON.stringify(data));
  }

  function readJSONFile(jsonPath){
    const path = Path.join(__dirname, jsonPath)
    if(!fs.existsSync(path)) return {};

    let rawdata = fs.readFileSync(jsonPath);
    return JSON.parse(rawdata);
  }
  const emptyFolder = (folderPath) => {
    fsExtra.emptyDirSync(folderPath)
  }

  function generateGIF(imgList){
    const canvas = createCanvas(800, 800);
    const ctx = canvas.getContext('2d');

    const encoder = new GIFEncoder(800, 800);
    encoder.createReadStream().pipe(fs.createWriteStream('myanimated.gif'));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(1000);
    encoder.setQuality(10);

    imgList.forEach(async (f, i) => {
      const image = await loadImage(f);
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
      encoder.addFrame(ctx);
      if (i === imgList.length - 1) {
        encoder.finish();
      }
    });
  }
  module.exports = {
    createJSONFile,
    readJSONFile,
    emptyFolder,
    getBuffer,
    generateGIF
  }