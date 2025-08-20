const fs = require('fs');
const { createCanvas } = require('canvas');
const Path = require("path");
const fsExtra = require('fs-extra');

const { loadImage } = require('canvas');

async function loadImageFromPath(path) {
  try {
    return await loadImage(path);
  } catch (err) {
    console.error('Error loading image:', err);
    throw err;
  }
}


  /**
   * 
   * HELPERS
   * 
   */

   const folder ={
    L: "large",
    S: "small",
    D: "detail"
  }

  // START
  async function createAndSaveCanvas(fields,imagePath, i, size, lans, name){
    const folderName = `images/${folder[size]}/`;
    // const folderName = `images/${folder[size]}/`;
    const data = await loadImageFromPath(imagePath);
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    const [newWidth, newHeight] = calculateSize(data, fields.width, fields.height);
    const canvas = createCanvas(newWidth, newHeight)
    const context = canvas.getContext('2d')
    context.drawImage(data, 0, 0, newWidth, newHeight)
    const imgdata = canvas.toDataURL("image/jpeg",Number(fields.quality));
    const imgBuffer = canvas.toBuffer("image/jpeg",{quality: Number(fields.quality)});
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const path = `${folderName}/${name}`;

    //fs.writeFileSync(path, base64Data,  {encoding: 'base64'});
    fs.writeFileSync(path, imgBuffer);
    return imgdata;
  }

  function calculateSize(img, maxWidth, maxHeight) {
    let width = img.width;
    let height = img.height;

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
    return [Number(width), Number(height)];
  }

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
  module.exports = {
    createAndSaveCanvas,
    createJSONFile,
    readJSONFile,
    emptyFolder,
    loadImageFromPath
  }
