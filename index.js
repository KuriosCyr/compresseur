const express = require('express');
const cors = require('cors');
//const Jimp = require('jimp');
//const bodyParser = require('body-parser');
const { execFile } = require('child_process');
const morgan = require('morgan');
const _ = require('lodash');
const helpers = require('./helpers');
const helperss = require('./helperss');
const { loadImageFromPath } = require('./helperss');
const http = require('http');
const JSZip = require('jszip');
const util = require('util');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const multer = require('multer');
const FormData = require('form-data');
const app = express();
// const zipWeb = new JSZip();
// const zipcompany = new JSZip();
const path = require('path');
const sharp = require('sharp');
const archiver = require('archiver');
const ffmpeg = require('fluent-ffmpeg');
const axios = require("axios");
const gifsicle = require('gifsicle');
const tmp = require('tmp-promise');
const sizeOf = require('image-size');
const readdir = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Utilisez fsPromises pour des méthodes asynchrones.
async function someAsyncFunction() {
  const data = await fsPromises.readFile('somefile.txt');
  console.log(data);
}

// Middleware pour parser les requêtes JSON
// app.use(express.json());

const tempImagesDir = './temp_images';
app.use(express.static(path.join(__dirname, 'images')));

createDirIfNotExists('./uploads/details');
createDirIfNotExists('./uploads/small');
createDirIfNotExists('./uploads/large');




// zipWeb.file("web.html", fs.readFileSync("./animation/web.html"));

/* zipcompany.file("company.html", fs.readFileSync("./animation/company.html"));
zipcompany.folder("assets/fonts").file("fontawesome-webfont.eot", fs.readFileSync("./animation/assets/fonts/fontawesome-webfont.eot"));
zipcompany.folder("assets/fonts").file("fontawpesome-webfont.svg", fs.readFileSync("./animation/assets/fonts/fontawesome-webfont.svg"));
zipcompany.folder("assets/fonts").file("fontawesome-webfont.ttf", fs.readFileSync("./animation/assets/fonts/fontawesome-webfont.ttf"));
zipcompany.folder("assets/fonts").file("fontawesome-webfont.woff", fs.readFileSync("./animation/assets/fonts/fontawesome-webfont.woff"));
zipcompany.folder("assets/fonts").file("fontawesome-webfont.woff2", fs.readFileSync("./animation/assets/fonts/fontawesome-webfont.woff2"));
zipcompany.folder("assets/fonts").file("FontAwesome.otf", fs.readFileSync("./animation/assets/fonts/FontAwesome.otf"));
zipcompany.folder("assets/fonts").file("lg.svg", fs.readFileSync("./animation/assets/fonts/lg.svg"));
zipcompany.folder("assets/fonts").file("lg.ttf", fs.readFileSync("./animation/assets/fonts/lg.ttf"));
zipcompany.folder("assets/fonts").file("lg.woff", fs.readFileSync("./animation/assets/fonts/lg.woff"));

zipcompany.folder("assets/js").file("picturefill.min.js", fs.readFileSync("./animation/assets/js/picturefill.min.js"));
zipcompany.folder("assets/js").file("lightgallery/lightgallery.js", fs.readFileSync("./animation/assets/js/lightgallery/lightgallery.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-pager.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-pager.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-autoplay.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-autoplay.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-fullscreen.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-fullscreen.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-zoom.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-zoom.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-hash.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-hash.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-share.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-share.js"));
zipcompany.folder("assets/js").file("lightgallery/lg-rotate.js", fs.readFileSync("./animation/assets/js/lightgallery/lg-rotate.js"));

zipcompany.folder("assets").file("font-awesome.min.css", fs.readFileSync("./animation/assets/font-awesome.min.css"));
zipcompany.folder("assets").file("bootstrap.min.css", fs.readFileSync("./animation/assets/bootstrap.min.css"));
zipcompany.folder("assets").file("lightgallery.min.css", fs.readFileSync("./animation/assets/lightgallery.min.css"));
zipcompany.folder("assets").file("code.js", fs.readFileSync("./animation/assets/code.js")); */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// async function combineImages(images) {
//   const imageBuffers = images.map(image => Buffer.from(image.split(',')[1], 'base64'));

//   const sharpList = imageBuffers.map(buffer => sharp(buffer));

//   const { width, height } = await sharpList[0].metadata();

//   const combinedImage = await sharp({
//     create: {
//       width: width * sharpList.length,
//       height,
//       channels: 4,
//       background: { r: 0, g: 0, b: 0, alpha: 0 }
//     }
//   });

//   for (let i = 0; i < sharpList.length; i++) {
//     combinedImage.composite([{ input: await sharpList[i].toBuffer(), left: width * i, top: 0 }]);
//   }

//   return await combinedImage.png().toBuffer();
// }


const upload = multer({ storage: storage });

app.use(cors({
  origin: true
}));
//app.use(bodyParser.json({ limit: '100mb' }));
//app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(morgan('dev'));

// Augmenter la limite de taille des requêtes à 100 Mo
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


app.get('/api/hello', (req, res) => {
  console.log(' hello world ')
  res.send('Hello World!!!')
})
async function downloadAndSaveImages(images, outputDir) {
  await fsPromises.mkdir(outputDir, { recursive: true });

  const downloadPromises = images.map(async (imageDataUrl, index) => {
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const outputPath = `${outputDir}/${index}.jpg`;
    await fsPromises.writeFile(outputPath, buffer);
    return outputPath;
  });

  return Promise.all(downloadPromises);
}

// async function generateVideo(images, quality, frameTime, rotation, outputFilename) {
//     const firstImage = await loadImage(images[0]);
//     const originalAspectRatio = firstImage.width / firstImage.height;
//     let width, height;

//     const MaxWidth = 800;
//     const MaxHeight = 800;

//     if (originalAspectRatio === 1) {
//         width = MaxWidth;
//         height = MaxWidth;
//     } else if (originalAspectRatio < 1) {
//         width = MaxWidth;
//         height = Math.round(MaxWidth * originalAspectRatio);
//     } else {
//         height = MaxHeight;
//         width = Math.round(MaxHeight / originalAspectRatio);
//     }

//     const scaleFilter = `scale=${width}:${height}`;

//     // Créer un fichier de liste de concaténation
//     const concatFileContent = images.map((image) => `file '${image}'\nduration ${frameTime}`).join("\n");
//     fs.writeFileSync("concat.txt", concatFileContent + `\nfile '${images[images.length - 1]}'`);

//     return new Promise((resolve, reject) => {
//         ffmpeg()
//             .input("concat.txt")
//             .inputOptions("-f", "concat")
//             .inputOptions("-safe", "0")
//             .videoCodec("libx264")
//             .outputOptions("-vf", scaleFilter)
//             .outputOptions("-r", "15") // Définit le taux d'images à 15
//             .outputOptions("-pix_fmt", "yuv420p")
//             .outputOptions("-crf", "20")
//             .outputOptions("-preset", "medium")
//             .output(outputFilename)
//             .on("start", (commandLine) => {
//                 console.log("Command line: " + commandLine);
//             })
//             .on("progress", (progress) => {
//                 console.log("Processing: " + progress.percent + "%");
//             })
//             .on("error", (err) => {
//                 console.error("Error generating video:", err);
//                 reject(err);
//             })
//             .on("end", () => {
//                 console.log("Video generation complete");
//                 resolve();
//             })
//             .run();
//     });
// }
async function generateVideo(images, quality, frameTime, rotation, outputFilename) {
  try {
    // Load the first image to get its aspect ratio
    const firstImage = await loadImage(images[0]);
    const ratio = firstImage.height / firstImage.width;

    let newWidth, newHeight;

    if (ratio === 1) {
      newWidth = 800;
      newHeight = 800;
    } else if (ratio < 1) {
      newWidth = 800;
      newHeight = Math.round(800 * ratio);
    } else {
      newHeight = 800;
      newWidth = Math.round(800 / ratio);
    }

    // Ensure dimensions are even for YUV420p compatibility
    newWidth = newWidth % 2 === 0 ? newWidth : newWidth - 1;
    newHeight = newHeight % 2 === 0 ? newHeight : newHeight - 1;

    const scaleFilter = `scale=${newWidth}:${newHeight}`;

    // Create a concatenation list file
    const concatFileContent = images.map((image) => `file '${image}'\nduration ${frameTime}`).join("\n");
    fs.writeFileSync("concat.txt", concatFileContent + `\nfile '${images[images.length - 1]}'`);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input("concat.txt")
        .inputOptions("-f", "concat")
        .inputOptions("-safe", "0")
        .videoCodec("libx264")
        .outputOptions("-vf", scaleFilter)
        .outputOptions("-r", "15")
        .outputOptions("-pix_fmt", "yuv420p")
        .outputOptions("-crf", "20")
        .outputOptions("-preset", "medium")
        .outputOptions("-loglevel", "verbose")  // Add verbose logging
        .output(outputFilename)
        .on("start", (commandLine) => {
          console.log("Command line: " + commandLine);
        })
        .on("progress", (progress) => {
          console.log("Processing: " + progress.percent + "%");
        })
        .on("error", (err) => {
          console.error("Error generating video:", err);
          reject(err);
        })
        .on("end", () => {
          console.log("Video generation complete");
          resolve();
        })
        .run();
    });
  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
}

// async function generateVideo(images, quality, frameTime, rotation, outputFilename) {
//     try {
//         // Chargez la première image pour obtenir son rapport d'aspect
//         const firstImage = await loadImage(images[0]);
//         const ratio = firstImage.height / firstImage.width;

//         let newWidth, newHeight;

//         if (ratio === 1) {
//             newWidth = 800;
//             newHeight = 800;
//         } else if (ratio < 1) {
//             newWidth = 800;
//             newHeight = Math.round(800 * ratio);
//         } else {
//             newHeight = 800;
//             newWidth = Math.round(800 / ratio);
//         }

//         const scaleFilter = `scale=${newWidth}:${newHeight}`;

//         // Créer un fichier de liste de concaténation
//         const concatFileContent = images.map((image) => `file '${image}'\nduration ${frameTime}`).join("\n");
//         fs.writeFileSync("concat.txt", concatFileContent + `\nfile '${images[images.length - 1]}'`);

//         return new Promise((resolve, reject) => {
//             ffmpeg()
//                 .input("concat.txt")
//                 .inputOptions("-f", "concat")
//                 .inputOptions("-safe", "0")
//                 .videoCodec("libx264")
//                 .outputOptions("-vf", scaleFilter)
//                 .outputOptions("-r", "15")
//                 .outputOptions("-pix_fmt", "yuv420p")
//                 .outputOptions("-crf", "20")
//                 .outputOptions("-preset", "medium")
//                 .output(outputFilename)
//                 .on("start", (commandLine) => {
//                     console.log("Command line: " + commandLine);
//                 })
//                 .on("progress", (progress) => {
//                     console.log("Processing: " + progress.percent + "%");
//                 })
//                 .on("error", (err) => {
//                     console.error("Error generating video:", err);
//                     reject(err);
//                 })
//                 .on("end", () => {
//                     console.log("Video generation complete");
//                     resolve();
//                 })
//                 .run();
//         });
//     } catch (error) {
//         console.error("Error generating video:", error);
//         throw error;
//     }
// }


app.post('/api/upload-photos', upload.array('uploadedImages'), async (req, res) => {
  let count = 0;
  let lans = 0;
  const zip = new JSZip();
  // const renameImages = req.body.renameImages === "true";
  // const productName = req.body.productName || 'images';

  const renameImages = req.body.renameImages === "true";
  const zipName = req.body.productName || 'images'; // Le nom du fichier ZIP
  const customName = req.body.customProductName || 'Nom des photos'; // Nom de base pour les images renommées

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
        status: false,
        message: 'Aucun fichier téléchargé'
      });
    }
    const filesToRename = req.files.map((file, index) => {
      if (renameImages) {
        // Construisez le nouveau nom avec le préfixe et le nom personnalisé pour les images
        let newFilename = `${String(index + 1).padStart(3, '0')}_${customName}.jpg`;
        let originalPath = path.join(__dirname, 'uploads', file.originalname);
        let newPath = path.join(__dirname, 'uploads', newFilename);
        fs.renameSync(originalPath, newPath);
        file.originalname = newFilename; // Mettez à jour le nom original pour la cohérence
      }
      return file;
    });

    const fields = { ...req.body };
    const dataJson = helperss.readJSONFile("./data.json");
    lans = dataJson[fields.type] ? dataJson[fields.type].lans + 1 : lans;

    const sortedFiles = _.sortBy(req.files, 'originalname');
    const promises = sortedFiles.map(photo => {
      const originalPath = path.join(__dirname, 'uploads', photo.originalname);
      const resizedPath = path.join(__dirname, 'uploads', 'resized', photo.originalname);
      const resizedFolderPath = path.join(__dirname, 'uploads', 'resized');
      createDirIfNotExists(resizedFolderPath);

      return new Promise(async (resolve, reject) => {
        try {
          const ratio = Number(fields.height) / Number(fields.width);
          let newWidth, newHeight;
          const MaxWidth = Number(fields.width);
          const MaxHeight = Number(fields.height);

          if (ratio === 1) {
            newWidth = Math.round(MaxWidth);
            newHeight = Math.round(MaxWidth);
          } else if (ratio < 1) {
            newWidth = Math.round(MaxWidth);
            newHeight = Math.round(MaxWidth * ratio);
          } else {
            newHeight = Math.round(MaxHeight);
            newWidth = Math.round(MaxHeight / ratio);
          }

          await sharp(originalPath)
            .resize(newWidth, newHeight, { fit: 'inside' })
            .jpeg({ quality: Number(fields.quality) })
            .toFile(resizedPath);


          let imgLUrl, imgSUrl, imgDUrl;
          count++;

          if (fields.type === "PRODUCT") {
            const sm_size = newWidth / 2;
            imgLUrl = helperss.createAndSaveCanvas({ width: newWidth, height: newHeight }, resizedPath, count, 'L', lans, photo.originalname);
            imgSUrl = helperss.createAndSaveCanvas({ width: sm_size, height: sm_size }, resizedPath, count, 'S', lans, photo.originalname);
            resolve({ imgLUrl, imgSUrl });
          } else {
            imgDUrl = helperss.createAndSaveCanvas({ width: newWidth, height: newHeight }, resizedPath, count, 'D', lans, photo.originalname);
            resolve({ imgDUrl });
          }

          zip.file(photo.originalname, fs.readFileSync(resizedPath));

        } catch (error) {
          reject(error);
        }
      });
    });

    const results = await Promise.all(promises);

    const params = {
      ...dataJson,
      [fields.type]: {
        lans,
      },
    };
    helperss.createJSONFile("data.json", params);

    const zipContent = await zip.generateAsync({ type: "nodebuffer" });
    res.set("Content-Type", "application/zip");
    // Utilisez le nom du fichier ZIP pour le téléchargement
    res.set("Content-Disposition", `attachment; filename=${zipName}.zip`);
    return res.send(zipContent);

  } catch (err) {
    console.error("Erreur:", err);
    return res.status(500).send({
      status: false,
      message: 'Erreur serveur'
    });
  } finally {
    helperss.emptyFolder('./uploads');
  }
});

// app.post('/api/upload-photos', upload.array('uploadedImages'), async (req, res) => {
//     let count = 0;
//     let lans = 0;
//     const zip = new JSZip();
//     const renameImages = req.body.renameImages === "true";
//     const productName = req.body.productName || 'images'; // Seule déclaration de productName


//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).send({
//                 status: false,
//                 message: 'Aucun fichier téléchargé'
//             });
//         }
//         if (renameImages) {
//     for (let i = 0; i < req.files.length; i++) {
//         let originalPath = path.join(__dirname, 'uploads', req.files[i].originalname);
//         let newFilename = `${String(i+1).padStart(3, '0')}_${productName}.jpg`;
//         let newPath = path.join(__dirname, 'uploads', newFilename);
//         fs.renameSync(originalPath, newPath);
//         req.files[i].originalname = newFilename; // mise à jour du nom du fichier
//     }
// }


//         const fields = { ...req.body };
//         const dataJson = helperss.readJSONFile("./data.json");
//         lans = dataJson[fields.type] ? dataJson[fields.type].lans + 1 : lans;

//         const sortedFiles = _.sortBy(req.files, 'originalname');
//         const promises = sortedFiles.map(photo => {
//             const originalPath = path.join(__dirname, 'uploads', photo.originalname);
//             const resizedPath = path.join(__dirname, 'uploads', 'resized', photo.originalname);
//             const resizedFolderPath = path.join(__dirname, 'uploads', 'resized');
//             createDirIfNotExists(resizedFolderPath);

//             return new Promise(async (resolve, reject) => {
//     try {
//         const ratio = Number(fields.width) / Number(fields.height);

//         let newWidth, newHeight;

//         const MaxWidth = Number(fields.width);
//         const MaxHeight = Number(fields.height);

//         if (ratio === 1) {
//     newWidth = Math.round(MaxWidth); // Utilisation de Math.round
//     newHeight = Math.round(MaxWidth);
// } else if (ratio < 1) {
//     newWidth = Math.round(MaxWidth);
//     newHeight = Math.round(MaxWidth * ratio);
// } else {
//     newHeight = Math.round(MaxHeight);
//     newWidth = Math.round(MaxHeight / ratio);
// }


//         // Redimensionner l'image en utilisant sharp
//         await sharp(originalPath)
//             .resize(newWidth, newHeight, { fit: 'contain' })
//             .jpeg({ quality: Number(fields.quality) })
//             .toFile(resizedPath);

//         let imgLUrl, imgSUrl, imgDUrl;
//         count++;

//         if (fields.type === "PRODUCT") {
//             const sm_size = newWidth / 2;
//             imgLUrl = helperss.createAndSaveCanvas({ width: newWidth, height: newHeight }, resizedPath, count, 'L', lans, photo.originalname);
//             imgSUrl = helperss.createAndSaveCanvas({ width: sm_size, height: sm_size }, resizedPath, count, 'S', lans, photo.originalname);
//             resolve({ imgLUrl, imgSUrl });
//         } else {
//             imgDUrl = helperss.createAndSaveCanvas({ width: newWidth, height: newHeight }, resizedPath, count, 'D', lans, photo.originalname);
//             resolve({ imgDUrl });
//         }

//         // Ajoutez l'image redimensionnée à l'archive zip
//         zip.file(photo.originalname, fs.readFileSync(resizedPath));

//     } catch (error) {
//         reject(error);
//     }
// });

//             // return new Promise(async (resolve, reject) => {
//             //     try {
//             //         const { width, height, quality } = fields;

//             //         // Redimensionner l'image en utilisant sharp
//             //         await sharp(originalPath)
//             //             .resize(Number(width), Number(height), { fit: 'contain' })
//             //             .jpeg({ quality: Number(quality) })
//             //             .toFile(resizedPath);

//             //         let imgLUrl, imgSUrl, imgDUrl;
//             //         count++;

//             //         if (fields.type === "PRODUCT") {
//             //             const sm_size = Number(width) / 2;
//             //             imgLUrl = helperss.createAndSaveCanvas(fields, resizedPath, count, 'L', lans, photo.originalname);
//             //             imgSUrl = helperss.createAndSaveCanvas({ ...fields, width: sm_size, height: sm_size }, resizedPath, count, 'S', lans, photo.originalname);
//             //             resolve({ imgLUrl, imgSUrl });
//             //         } else {
//             //             imgDUrl = helperss.createAndSaveCanvas(fields, resizedPath, count, 'D', lans, photo.originalname);
//             //             resolve({ imgDUrl });
//             //         }

//             //         // Ajoutez l'image redimensionnée à l'archive zip
//             //         zip.file(photo.originalname, fs.readFileSync(resizedPath));

//             //     } catch (error) {
//             //         reject(error);
//             //     }
//             // });
//         });

//         const results = await Promise.all(promises);
//         const responseResults = {
//             large: results.filter(({ imgLUrl }) => imgLUrl).map(({ imgLUrl }) => imgLUrl),
//             small: results.filter(({ imgSUrl }) => imgSUrl).map(({ imgSUrl }) => imgSUrl),
//             detail: results.filter(({ imgDUrl }) => imgDUrl).map(({ imgDUrl }) => imgDUrl),
//         };

//         const params = {
//             ...dataJson,
//             [fields.type]: {
//                 lans,
//             },
//         };
//         helperss.createJSONFile("data.json", params);

//         // Générer l'archive zip et l'envoyer en réponse
//         const zipContent = await zip.generateAsync({ type: "nodebuffer" });
//         // const productName = req.body.productName || 'images'; // Par défaut, il sera appelé "images.zip" si productName n'est pas fourni
//         res.set("Content-Type", "application/zip");
//         res.set("Content-Disposition", `attachment; filename=${productName}.zip`);
//         return res.send(zipContent);

//     } catch (err) {
//         console.error("Erreur:", err);
//         return res.status(500).send({
//             status: false,
//             message: 'Erreur serveur'
//         });
//     } finally {
//         helperss.emptyFolder('./uploads');
//     }
// });





// app.post('/api/upload-photos', async (req, res) => {
// 	let count =0;
// 	let lans =0;
// 	try {
// 		if(!req.files) {
// 			res.send({
// 				status: false,
// 				message: 'No file uploaded'
// 			});
// 		} else {
// 			let data = []; 
// 			let promises=[];
// 			const fields = {...req.body};
// 			const dataJson = helperss.readJSONFile("./data.json");
// 			lans = dataJson[fields.type] ? dataJson[fields.type].lans + 1 : lans;
//             //loop all files
// 			const sortedFiles = req.files.uploadedImages.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
// 			_.forEach(_.keysIn(sortedFiles), (key) => {
// 				const photo = sortedFiles[key];
// 				let imgL,imgS, imgD;
//                 //move photo to upload directory
// 				const newPath = "./uploads/" + photo.name;
// 				const imgRes = new Promise((resolve, reject) => {
// 					photo.mv(newPath, (err) => {
// 						if (err) throw err;
// 						loadImage(newPath).then((data) => {
// 							const sm_size = Number(fields.width)/2;
// 							let imgLUrl=null, imgSUrl=null, imgDUrl=null;
// 							count++;
// 							if(fields.type == "PRODUCT"){
//                                 // Add image large & small
// 								imgLUrl = helperss.createAndSaveCanvas(fields,data, count, 'L', lans, photo.name);
// 								imgSUrl = helperss.createAndSaveCanvas({...fields, width:sm_size, height:sm_size},data, count, 'S', lans, photo.name);
// 								resolve({
// 									imgLUrl,
// 									imgSUrl,
// 								});
// 							}
// 							else{
//                                 // Add image detail
// 								imgDUrl = helperss.createAndSaveCanvas(fields,data, count, 'D', lans, photo.name);
// 								resolve({
// 									imgDUrl
// 								});
// 							}
// 						})
// 					});
// 				});    
// 				promises.push(imgRes);
// 				const params = {
// 					...dataJson,
// 					[fields.type]: {
// 						lans,
// 					},
// 				};
// 				helperss.createJSONFile("data.json", params);
// 			});

// 			const result = await Promise.all(promises);;

//             //return response
// 			res.send({
// 				status: true,
// 				message: 'Files are uploaded',
// 				result:{
// 					large: result.filter(({imgLUrl}) => imgLUrl).map(({imgLUrl}) => imgLUrl),
// 					small: result.filter(({imgSUrl}) => imgSUrl).map(({imgSUrl}) => imgSUrl),
// 					detail: result.filter(({imgDUrl}) => imgDUrl).map(({imgDUrl}) => imgDUrl),
// 				}
// 			});
// 		}
// 	} catch (err) {
// 		res.status(500).send(err);
// 	}
// 	finally{
//         //clear uploads directory
// 		helperss.emptyFolder('./uploads');
// 	}
// });
// async function generateMP4(images) {
//   return new Promise(async (resolve, reject) => {
//     const outputVideoPath = path.join(__dirname, 'temp', 'output.mp4');

//     // Créer un dossier temporaire pour les images
//     const tempImagesFolder = path.join(__dirname, 'temp', 'images');
//     if (!fs.existsSync(tempImagesFolder)) {
//       fs.mkdirSync(tempImagesFolder, { recursive: true });
//     }

//     // Enregistrer les images redimensionnées dans le dossier temporaire
//     images.forEach((image, index) => {
//       fs.writeFileSync(path.join(tempImagesFolder, `${index}.png`), image);
//     });

//     // Générer la vidéo à l'aide de fluent-ffmpeg
//     ffmpeg()
//       .addInput(path.join(tempImagesFolder, '%d.png'))
//       .inputFPS(1)
//       .outputFPS(25)
//       .videoCodec('libx264')
//       .output(outputVideoPath)
//       .on('end', () => {
//         // Supprimer les images temporaires
//         fs.readdirSync(tempImagesFolder).forEach((file) => {
//           fs.unlinkSync(path.join(tempImagesFolder, file));
//         });
//         fs.rmdirSync(tempImagesFolder);

//         resolve(outputVideoPath);
//       })
//       .on('error', (error) => {
//         reject(error);
//       })
//       .run();
//   });
// }
async function resizeImages(images, quality) {
  const resizeImages = [];
  try {
    for (const image of images) {
      const base64Image = image.split(';base64,').pop();
      const buffer = Buffer.from(base64Image, 'base64');
      const compressedBuffer = await sharp(buffer)
        .jpeg({
          quality: Math.round(quality * 100), // quality is expected to be between 0 and 100 in sharp
        })
        .toBuffer();
      resizeImages.push(`data:image/jpeg;base64,${compressedBuffer.toString('base64')}`);
    }
    return resizeImages;
  } catch (error) {
    console.error("Error compressing images:", error);
    throw error;
  }
}

async function resizeLargeImages(large, quality) {
  const resizedLargeImages = [];
  try {
    for (const largeImage of large) {
      const base64Image = largeImage.split(';base64,').pop();
      const buffer = Buffer.from(base64Image, 'base64');
      const compressedBuffer = await sharp(buffer)
        .jpeg({
          quality: Math.round(quality * 100), // quality is expected to be between 0 and 100 in sharp
        })
        .toBuffer();
      resizedLargeImages.push(`data:image/jpeg;base64,${compressedBuffer.toString('base64')}`);
    }
    return resizedLargeImages;
  } catch (error) {
    console.error("Error compressing large images:", error);
    throw error;
  }
}


// async function resizeImages(images, quality) {
//   const resizedImages = [];
//   try {
//     for (const image of images) {
//       const base64Image = image.split(';base64,').pop();
//       const buffer = Buffer.from(base64Image, 'base64');
//       const originalImage = await sharp(buffer).metadata();
//       const resizedBuffer = await sharp(buffer)
//         .resize({
//           width: Math.round(originalImage.width * quality),
//           height: Math.round(originalImage.height * quality),
//         })
//         .toBuffer();
//       resizedImages.push(`data:image/jpeg;base64,${resizedBuffer.toString('base64')}`);
//     }
//     return resizedImages;
//   } catch (error) {
//     console.error("Error resizing images:", error);
//     throw error;
//   }
// }

// async function resizeImages(images, quality) {
//   const resizedImages = [];
//   try {
//     for (const image of images) {
//       const base64Image = image.split(';base64,').pop();
//       const buffer = Buffer.from(base64Image, 'base64');
//       const originalImage = await sharp(buffer).metadata();
//       const resizedBuffer = await sharp(buffer)
//         .resize(800, 534, {
//             fit: sharp.fit.inside,
//             withoutEnlargement: true
//         })
//         .jpeg({
//             quality: quality * 100, // sharp accepte la qualité comme un entier de 1 à 100
//             force: false  // n'applique pas JPEG si l'image n'est pas JPEG
//         })
//         .toBuffer();
//       resizedImages.push(`data:image/jpeg;base64,${resizedBuffer.toString('base64')}`);
//     }
//     return resizedImages;
//   } catch (error) {
//     console.error("Error resizing images:", error);
//     throw error;
//   }
// }

// Route simple pour vérifier la mise à jour du code
// app.post('/api/verify-balance', async (req, res) => {
//   const customerId = req.body.customerId;

//   let logs = [];
//   logs.push(`Customer ID reçu: ${customerId}`);

//   if (!customerId) {
//     return res.status(400).json({ success: false, message: "Customer ID manquant", logs });
//   }

//   try {
//     let data = new FormData();
//     data.append('arguments', JSON.stringify({ customer_id: customerId }));

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://www.zohoapis.com/crm/v2/functions/serverless_fct_diminuer_credits/actions/execute?auth_type=apikey&zapikey=1003.4bcf457fb820847f25552a3906a80f53.5ff90f438d3682c8cf752a8cb0f3f1e3',
//       headers: {
//         ...data.getHeaders()
//       },
//       data: data
//     };

//     const zohoResponse = await axios.request(config);

//     logs.push(`Réponse complète de Zoho: ${JSON.stringify(zohoResponse.data)}`);

//     const output = zohoResponse.data.details.output;

//     if (output && output.includes('Erreur:')) {
//       logs.push(`Erreur de Zoho: ${output}`);
//       return res.status(500).json({ success: false, message: output, customerId, logs });
//     }

//     if (output && output.includes('Nouveau solde:')) {
//       const newBalance = parseInt(output.replace('Nouveau solde: ', ''), 10);
//       logs.push(`Nouveau solde: ${newBalance}`);

//       if (newBalance > 0) {
//         return res.json({ success: true, balance: newBalance, customerId, logs });
//       } else {
//         return res.json({ success: false, message: "Solde insuffisant", customerId, logs });
//       }
//     } else {
//       logs.push("Erreur dans la réponse de Zoho ou le format attendu n'est pas respecté.");
//       return res.status(500).json({ success: false, message: "Erreur dans la réponse de Zoho", customerId, logs });
//     }
//   } catch (error) {
//     logs.push(`Erreur lors de la communication avec l'API Zoho: ${error.message}`);
//     return res.status(500).json({ success: false, message: "Erreur de vérification du solde", customerId, logs });
//   }
// });

// app.post('/api/verify-balance', async (req, res) => {
//   const customerId = req.body.customerId;

//   let logs = [];
//   logs.push(`Customer ID reçu: ${customerId}`);

//   if (!customerId) {
//     return res.status(400).json({ success: false, message: "Customer ID manquant", logs });
//   }

//   try {
//     let data = new FormData();
//     data.append('arguments', JSON.stringify({ customer_id: customerId }));

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://www.zohoapis.com/crm/v2/functions/serverless_fct_diminuer_credits/actions/execute?auth_type=apikey&zapikey=1003.4bcf457fb820847f25552a3906a80f53.5ff90f438d3682c8cf752a8cb0f3f1e3',
//       headers: { 
//         ...data.getHeaders()
//       },
//       data: data
//     };

//     const zohoResponse = await axios.request(config);

//     logs.push(`Réponse complète de Zoho: ${JSON.stringify(zohoResponse.data)}`);

//     const output = zohoResponse.data.details.output;

//     // Vérifier si l'API Zoho a renvoyé une erreur
//     if (output && output.includes('Erreur:')) {
//       logs.push(`Erreur de Zoho: ${output}`);
//       return res.status(500).json({ success: false, message: output, customerId, logs });
//     }

//     if (output && output.includes('Nouveau solde:')) {
//       const newBalance = parseInt(output.replace('Nouveau solde: ', ''), 10);
//       logs.push(`Nouveau solde: ${newBalance}`);

//       if (newBalance > 0) {
//         return res.json({ success: true, balance: newBalance, customerId, logs });
//       } else {
//         return res.json({ success: false, message: "Solde insuffisant", customerId, logs });
//       }
//     } else {
//       logs.push("Erreur dans la réponse de Zoho ou le format attendu n'est pas respecté.");
//       return res.status(500).json({ success: false, message: "Erreur dans la réponse de Zoho", customerId, logs });
//     }
//   } catch (error) {
//     logs.push(`Erreur lors de la communication avec l'API Zoho: ${error.message}`);
//     return res.status(500).json({ success: false, message: "Erreur de vérification du solde", customerId, logs });
//   }
// });
// app.post('/api/generate-animation', async (req, res) => {
//   const currentFolder = req.body;
//   const customerId = req.body.customerId;

//   let logs = [];
//   logs.push(`Customer ID reçu: ${customerId}`);

//   // Vérification de l'ID client
//   if (!customerId) {
//     return res.status(400).json({ success: false, message: "Customer ID manquant", logs });
//   }

//   try {
//     // Vérification du solde via Zoho
//     let data = new FormData();
//     data.append('arguments', JSON.stringify({ customer_id: customerId }));

//     let config = {
//       method: 'post',
//       maxBodyLength: Infinity,
//       url: 'https://www.zohoapis.com/crm/v2/functions/serverless_fct_diminuer_credits/actions/execute?auth_type=apikey&zapikey=1003.4bcf457fb820847f25552a3906a80f53.5ff90f438d3682c8cf752a8cb0f3f1e3',
//       headers: {
//         ...data.getHeaders()
//       },
//       data: data
//     };

//     const zohoResponse = await axios.request(config);
//     logs.push(`Réponse complète de Zoho: ${JSON.stringify(zohoResponse.data)}`);

//     const output = zohoResponse.data.details.output;
//     let newBalance = null;

//     // Vérification si l'ID est incorrect
//     if (zohoResponse.data.details.output && zohoResponse.data.details.output.includes('Erreur: impossible de récupérer les informations du client.')) {
//       logs.push(`Erreur: ID client incorrect`);
//       return res.status(400).json({ success: false, message: "ID client incorrect", customerId, logs });
//     }

//     // Vérification du nouveau solde
//     if (output && output.includes('Nouveau solde:')) {
//       newBalance = parseInt(output.replace('Nouveau solde: ', ''), 10);
//       logs.push(`Nouveau solde: ${newBalance}`);

//       // Vérification du solde insuffisant
//       if (newBalance <= 0) {
//         return res.status(400).json({ success: false, message: "Solde insuffisant", customerId, logs });
//       }
//     } else {
//       logs.push("Erreur dans la réponse de Zoho ou le format attendu n'est pas respecté.");
//       return res.status(500).json({ success: false, message: "Erreur dans la réponse de Zoho", customerId, logs });
//     }

//     // Si nous arrivons ici, le solde est suffisant. Continuons avec la génération de l'animation.
//     const filename = currentFolder.filename;
//     const quality = parseFloat(currentFolder.quality);
//     let frameTime = req.body.frameTime || 1000;
//     frameTime = frameTime / 1000;
//     const rotation = req.body.rotation || 0;
//     const outputVideoFilename = `${filename}.mp4`;
//     const outputGifFilename = `${filename}.gif`;

//     console.log(`FrameTime: ${frameTime} secondes`);
//     console.log(`Quality: ${quality}`);
//     console.log(`Rotation: ${rotation}`);
//     console.log(`Output filenames: ${outputVideoFilename}, ${outputGifFilename}`);

//     const zip = new JSZip();

//     // Création et ajout du fichier solde_restant_informations_confidentielles.txt dans le zip
//     const balanceInfo = `ID du client : ${customerId}\nSolde restant : ${newBalance}`;
//     zip.file('solde_restant_informations_confidentielles.txt', balanceInfo);

//     // Vérification immédiate de l'ajout du fichier
//     const addedFile = zip.file('solde_restant_informations_confidentielles.txt');
//     if (!addedFile) {
//       throw new Error("Le fichier solde_restant_informations_confidentielles.txt n'a pas pu être ajouté au zip.");
//     }
//     console.log("Fichier solde_restant_informations_confidentielles.txt ajouté au zip avec succès.");

//     // Génération des vidéos et GIFs
//     res.set("Content-disposition", `attachment; filename=${filename}.zip`);

//     const tempImagesDir = path.join(__dirname, 'temp_images');
//     const downloadedImages = await downloadAndSaveImages(currentFolder.images, tempImagesDir);

//     if (currentFolder.animationGifVideo) {
//       await generateVideo(downloadedImages, quality, frameTime, rotation, outputVideoFilename);
//       await generateGif(downloadedImages, frameTime, quality, outputGifFilename);

//       zip.file(`${filename}.mp4`, fs.readFileSync(outputVideoFilename));
//       zip.file(`${filename}.gif`, fs.readFileSync(outputGifFilename));

//       fs.unlinkSync(outputVideoFilename);
//       fs.unlinkSync(outputGifFilename);
//     }

//     const resizedImages = await resizeImages(currentFolder.images, quality);
//     const resizedLargeImages = await resizeLargeImages(currentFolder.large, quality);

//     currentFolder.images = resizedImages;
//     currentFolder.large = resizedLargeImages;

//     const companyHtmlPath = path.join(__dirname, 'animation', 'company.html');
//     const webHtmlPath = path.join(__dirname, 'animation', 'web.html');

//     if (currentFolder.type === "WEB") {
//       let webHtmlContent = fs.readFileSync(webHtmlPath, 'utf8');
//       webHtmlContent = webHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, webHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const readmeWebPath = path.join(__dirname, 'readme_web.txt');
//       if (fs.existsSync(readmeWebPath)) {
//         zip.file('readme_web.txt', fs.readFileSync(readmeWebPath));
//       }
//     } else if (currentFolder.type === "COMPANY") {
//       let companyHtmlContent = fs.readFileSync(companyHtmlPath, 'utf8');
//       companyHtmlContent = companyHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, companyHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const assetsFolder = zip.folder('assets');
//       const assetsPath = path.join(__dirname, 'animation', 'assets');
//       await addFolderToZip(zip, assetsPath, 'assets');

//       const readmeCompanyPath = path.join(__dirname, 'readme_autonome.txt');
//       if (fs.existsSync(readmeCompanyPath)) {
//         zip.file('readme_autonome.txt', fs.readFileSync(readmeCompanyPath));
//       }
//     }

//     // Vérification finale avant la génération du zip
//     const finalCheck = zip.file('solde_restant_informations_confidentielles.txt');
//     if (!finalCheck) {
//       throw new Error("Le fichier solde_restant_informations_confidentielles.txt a été perdu pendant le traitement.");
//     }
//     console.log("Vérification finale : solde_restant_informations_confidentielles.txt est toujours présent dans le zip.");

//     // Génération du fichier ZIP et réponse
//     zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//       .pipe(res)
//       .on('finish', function () {
//         console.log(`${filename}.zip généré avec succès, incluant solde_restant_informations_confidentielles.txt`);
//         res.json({ 
//           success: true, 
//           message: `${filename}.zip créé avec succès, incluant le fichier solde_restant_informations_confidentielles.txt`, 
//           balance: newBalance 
//         });
//       });

//   } catch (error) {
//     console.error("Erreur lors de la génération de l'animation:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la génération de l'animation", logs: [error.message] });
//   }
// });
app.post('/api/generate-animation', async (req, res) => {
  const currentFolder = req.body;
  const customerId = req.body.customerId;

  let logs = [];
  logs.push(`Customer ID reçu: ${customerId}`);

  // Vérification de l'ID client
  if (!customerId) {
    return res.status(400).json({ success: false, message: "Customer ID manquant", logs });
  }

  try {
    // Vérification du solde via Zoho
    let data = new FormData();
    data.append('arguments', JSON.stringify({ customer_id: customerId }));

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.zohoapis.com/crm/v2/functions/serverless_fct_diminuer_credits/actions/execute?auth_type=apikey&zapikey=1003.4bcf457fb820847f25552a3906a80f53.5ff90f438d3682c8cf752a8cb0f3f1e3',
      headers: {
        ...data.getHeaders()
      },
      data: data
    };

    const zohoResponse = await axios.request(config);
    logs.push(`Réponse complète de Zoho: ${JSON.stringify(zohoResponse.data)}`);

    const output = zohoResponse.data.details.output;
    let newBalance = null;

    // Vérification si l'ID est incorrect
    if (zohoResponse.data.details.output && zohoResponse.data.details.output.includes('Erreur: impossible de récupérer les informations du client.')) {
      logs.push(`Erreur: ID client incorrect`);
      return res.status(400).json({ success: false, message: "ID client incorrect", customerId, logs });
    }

    // Vérification du nouveau solde
    if (output && output.includes('Nouveau solde:')) {
      newBalance = parseInt(output.replace('Nouveau solde: ', ''), 10);
      logs.push(`Nouveau solde: ${newBalance}`);

      // Vérification du solde insuffisant
      if (newBalance <= 0) {
        return res.status(400).json({ success: false, message: "Solde insuffisant", customerId, logs });
      }
    } else {
      logs.push("Erreur dans la réponse de Zoho ou le format attendu n'est pas respecté.");
      return res.status(500).json({ success: false, message: "Erreur dans la réponse de Zoho", customerId, logs });
    }

    // Si nous arrivons ici, le solde est suffisant. Continuons avec la génération de l'animation.
    const filename = currentFolder.filename;
    const quality = parseFloat(currentFolder.quality);
    let frameTime = req.body.frameTime || 1000;
    frameTime = frameTime / 1000;
    const rotation = req.body.rotation || 0;
    const outputVideoFilename = `${filename}.mp4`;
    const outputGifFilename = `${filename}.gif`;

    console.log(`FrameTime: ${frameTime} secondes`);
    console.log(`Quality: ${quality}`);
    console.log(`Rotation: ${rotation}`);
    console.log(`Output filenames: ${outputVideoFilename}, ${outputGifFilename}`);

    const zip = new JSZip();

    // Création et ajout du fichier solde_restant_informations_confidentielles.txt dans le zip
    const balanceInfo = `ID du client : ${customerId}\nSolde restant : ${newBalance}`;
    zip.file('solde_restant_informations_confidentielles.txt', balanceInfo);

    // Vérification immédiate de l'ajout du fichier
    const addedFile = zip.file('solde_restant_informations_confidentielles.txt');
    if (!addedFile) {
      throw new Error("Le fichier solde_restant_informations_confidentielles.txt n'a pas pu être ajouté au zip.");
    }
    console.log("Fichier solde_restant_informations_confidentielles.txt ajouté au zip avec succès.");

    // Génération des vidéos et GIFs
    const tempImagesDir = path.join(__dirname, 'temp_images');
    const downloadedImages = await downloadAndSaveImages(currentFolder.images, tempImagesDir);

    if (currentFolder.animationGifVideo) {
      await generateVideo(downloadedImages, quality, frameTime, rotation, outputVideoFilename);
      await generateGif(downloadedImages, frameTime, quality, outputGifFilename);

      zip.file(`${filename}.mp4`, fs.readFileSync(outputVideoFilename));
      zip.file(`${filename}.gif`, fs.readFileSync(outputGifFilename));

      fs.unlinkSync(outputVideoFilename);
      fs.unlinkSync(outputGifFilename);
    }

    const resizedImages = await resizeImages(currentFolder.images, quality);
    const resizedLargeImages = await resizeLargeImages(currentFolder.large, quality);

    currentFolder.images = resizedImages;
    currentFolder.large = resizedLargeImages;

    const companyHtmlPath = path.join(__dirname, 'animation', 'company.html');
    const webHtmlPath = path.join(__dirname, 'animation', 'web.html');

    if (currentFolder.type === "WEB") {
      let webHtmlContent = fs.readFileSync(webHtmlPath, 'utf8');
      webHtmlContent = webHtmlContent.replace(
        '<script type="text/javascript" src="./config.js"></script>',
        `<script type="text/javascript" src="./${filename}.js"></script>`
      );
      zip.file(`${filename}.html`, webHtmlContent);
      currentFolder.initialRotations = req.body.initialRotations;
      zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

      const readmeWebPath = path.join(__dirname, 'animation', 'readme_web.txt');
      if (fs.existsSync(readmeWebPath)) {
        zip.file('readme_web.txt', fs.readFileSync(readmeWebPath));
      }
    } else if (currentFolder.type === "COMPANY") {
      let companyHtmlContent = fs.readFileSync(companyHtmlPath, 'utf8');
      companyHtmlContent = companyHtmlContent.replace(
        '<script type="text/javascript" src="./config.js"></script>',
        `<script type="text/javascript" src="./${filename}.js"></script>`
      );
      zip.file(`${filename}.html`, companyHtmlContent);
      currentFolder.initialRotations = req.body.initialRotations;
      zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

      const assetsFolder = zip.folder('assets');
      const assetsPath = path.join(__dirname, 'animation', 'assets');
      await addFolderToZip(zip, assetsPath, 'assets');

      const readmeCompanyPath = path.join(__dirname, 'animation', 'readme_autonome.txt');
      if (fs.existsSync(readmeCompanyPath)) {
        zip.file('readme_autonome.txt', fs.readFileSync(readmeCompanyPath));
      }
    }

    // Vérification finale avant la génération du zip
    const finalCheck = zip.file('solde_restant_informations_confidentielles.txt');
    if (!finalCheck) {
      throw new Error("Le fichier solde_restant_informations_confidentielles.txt a été perdu pendant le traitement.");
    }
    console.log("Vérification finale : solde_restant_informations_confidentielles.txt est toujours présent dans le zip.");

    // Génération du fichier ZIP et réponse
    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res)
      .on('finish', function () {
        console.log(`${filename}.zip généré avec succès, incluant solde_restant_informations_confidentielles.txt`);
      })
      .on('error', function (error) {
        console.error("Erreur lors de la génération du fichier ZIP :", error);
        res.status(500).json({ success: false, message: "Erreur lors de la génération de l'animation", logs: [error.message] });
      });

  } catch (error) {
    console.error("Erreur lors de la génération de l'animation:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la génération de l'animation", logs: [error.message] });
  }
});




// app.post('/api/generate-animation', async (req, res) => {
//   const currentFolder = req.body;
//   const customerId = req.body.customerId;

//   try {
//     // Vérification du solde
//     const verifyBalanceResponse = await axios.post('https://dev-photo.revolutionnez.ca/api/verify-balance', { customerId });

//     if (!verifyBalanceResponse.data.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Erreur lors de la vérification du solde ou ID incorrect. Téléchargement annulé.",
//         logs: verifyBalanceResponse.data.logs
//       });
//     }

//     const remainingBalance = verifyBalanceResponse.data.balance;

//     const filename = currentFolder.filename;
//     const quality = parseFloat(currentFolder.quality);
//     let frameTime = req.body.frameTime || 1000; // frameTime en millisecondes ou 1000ms par défaut
//     frameTime = frameTime / 1000; // convertir en secondes
//     const rotation = req.body.rotation || 0;
//     const outputVideoFilename = `${filename}.mp4`;
//     const outputGifFilename = `${filename}.gif`;

//     console.log(`FrameTime: ${frameTime} secondes`);
//     console.log(`Quality: ${quality}`);
//     console.log(`Rotation: ${rotation}`);
//     console.log(`Output filenames: ${outputVideoFilename}, ${outputGifFilename}`);

//     const zip = new JSZip();

//     // Création et ajout du fichier solde_restant_informations_confidentielles.txt dans le zip
//     const balanceInfo = `ID du client : ${customerId}\nSolde restant : ${remainingBalance}`;
//     zip.file('solde_restant_informations_confidentielles.txt', balanceInfo);

//     // Vérification immédiate de l'ajout du fichier
//     const addedFile = zip.file('solde_restant_informations_confidentielles.txt');
//     if (!addedFile) {
//       throw new Error("Le fichier solde_restant_informations_confidentielles.txt n'a pas pu être ajouté au zip.");
//     }
//     console.log("Fichier solde_restant_informations_confidentielles.txt ajouté au zip avec succès.");

//     res.set("Content-disposition", `attachment; filename=${filename}.zip`);

//     // Traitement des images et génération des fichiers
//     const tempImagesDir = path.join(__dirname, 'temp_images');
//     const downloadedImages = await downloadAndSaveImages(currentFolder.images, tempImagesDir);

//     if (currentFolder.animationGifVideo) {
//       await generateVideo(downloadedImages, quality, frameTime, rotation, outputVideoFilename);
//       await generateGif(downloadedImages, frameTime, quality, outputGifFilename);

//       zip.file(`${filename}.mp4`, fs.readFileSync(outputVideoFilename));
//       zip.file(`${filename}.gif`, fs.readFileSync(outputGifFilename));

//       fs.unlinkSync(outputVideoFilename);
//       fs.unlinkSync(outputGifFilename);
//     }

//     const resizedImages = await resizeImages(currentFolder.images, quality);
//     const resizedLargeImages = await resizeLargeImages(currentFolder.large, quality);

//     currentFolder.images = resizedImages;
//     currentFolder.large = resizedLargeImages;

//     const companyHtmlPath = path.join(__dirname, 'animation', 'company.html');
//     const webHtmlPath = path.join(__dirname, 'animation', 'web.html');

//     if (currentFolder.type === "WEB") {
//       let webHtmlContent = fs.readFileSync(webHtmlPath, 'utf8');
//       webHtmlContent = webHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, webHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const readmeWebPath = path.join(__dirname, 'readme_web.txt');
//       if (fs.existsSync(readmeWebPath)) {
//         zip.file('readme_web.txt', fs.readFileSync(readmeWebPath));
//       }
//     } else if (currentFolder.type === "COMPANY") {
//       let companyHtmlContent = fs.readFileSync(companyHtmlPath, 'utf8');
//       companyHtmlContent = companyHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, companyHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const assetsFolder = zip.folder('assets');
//       const assetsPath = path.join(__dirname, 'animation', 'assets');
//       await addFolderToZip(zip, assetsPath, 'assets');

//       const readmeCompanyPath = path.join(__dirname, 'readme_autonome.txt');
//       if (fs.existsSync(readmeCompanyPath)) {
//         zip.file('readme_autonome.txt', fs.readFileSync(readmeCompanyPath));
//       }
//     }

//     // Vérification finale avant la génération du zip
//     const finalCheck = zip.file('solde_restant_informations_confidentielles.txt');
//     if (!finalCheck) {
//       throw new Error("Le fichier solde_restant_informations_confidentielles.txt a été perdu pendant le traitement.");
//     }
//     console.log("Vérification finale : solde_restant_informations_confidentielles.txt est toujours présent dans le zip.");

//     // Génération du fichier ZIP et réponse
//     zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//       .pipe(res)
//       .on('finish', function () {
//         console.log(`${filename}.zip généré avec succès, incluant solde_restant_informations_confidentielles.txt`);
//         res.json({ 
//           success: true, 
//           message: `${filename}.zip créé avec succès, incluant le fichier solde_restant_informations_confidentielles.txt`, 
//           balance: remainingBalance 
//         });
//       });

//   } catch (error) {
//     console.error("Erreur lors de la génération de l'animation:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la génération de l'animation", logs: [error.message] });
//   }
// });
// app.post('/api/generate-animation', async (req, res) => {
//   const currentFolder = req.body;
//   const customerId = req.body.customerId;

//   // Appel pour vérifier le solde avant de générer l'animation
//   try {
//     const verifyBalanceResponse = await axios.post('/api/verify-balance', { customerId });

//     if (!verifyBalanceResponse.data.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Erreur lors de la vérification du solde ou ID incorrect. Téléchargement annulé.",
//         logs: verifyBalanceResponse.data.logs
//       });
//     }

//     const remainingBalance = verifyBalanceResponse.data.balance; // Récupérer le solde restant

//     const filename = currentFolder.filename;
//     const quality = parseFloat(currentFolder.quality);
//     let frameTime = req.body.frameTime || 1000; // frameTime en millisecondes ou 1000ms par défaut
//     frameTime = frameTime / 1000; // convertir en secondes
//     const rotation = req.body.rotation || 0;
//     const outputVideoFilename = `${filename}.mp4`;
//     const outputGifFilename = `${filename}.gif`;

//     console.log(`FrameTime: ${frameTime} secondes`);
//     console.log(`Quality: ${quality}`);
//     console.log(`Rotation: ${rotation}`);
//     console.log(`Output filenames: ${outputVideoFilename}, ${outputGifFilename}`);

//     const zip = new JSZip();

//     // Ajouter le fichier solde_restant_informations_confidentielles.txt avant toute autre opération
//     const balanceInfo = `ID du client : ${customerId}\nSolde restant : ${remainingBalance}`;
//     zip.file('solde_restant_informations_confidentielles.txt', balanceInfo);

//     res.set("Content-disposition", `attachment; filename=${filename}.zip`);

//     // Traitement des images et génération des fichiers
//     const downloadedImages = await downloadAndSaveImages(currentFolder.images, tempImagesDir);

//     if (currentFolder.animationGifVideo) {
//       await generateVideo(downloadedImages, quality, frameTime, rotation, outputVideoFilename);
//       await generateGif(downloadedImages, frameTime, quality, outputGifFilename);

//       zip.file(`${filename}.mp4`, fs.readFileSync(outputVideoFilename));
//       zip.file(`${filename}.gif`, fs.readFileSync(outputGifFilename));

//       fs.unlinkSync(outputVideoFilename);
//       fs.unlinkSync(outputGifFilename);
//     }

//     const resizedImages = await resizeImages(currentFolder.images, quality);
//     const resizedLargeImages = await resizeLargeImages(currentFolder.large, quality);

//     currentFolder.images = resizedImages;
//     currentFolder.large = resizedLargeImages;

//     const companyHtmlPath = path.join(__dirname, 'animation', 'company.html');
//     const webHtmlPath = path.join(__dirname, 'animation', 'web.html');

//     if (currentFolder.type === "WEB") {
//       let webHtmlContent = fs.readFileSync(webHtmlPath, 'utf8');
//       webHtmlContent = webHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, webHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const readmeWebPath = path.join(__dirname, 'readme_web.txt');
//       if (fs.existsSync(readmeWebPath)) {
//         zip.file('readme_web.txt', fs.readFileSync(readmeWebPath));
//       }
//     } else if (currentFolder.type === "COMPANY") {
//       let companyHtmlContent = fs.readFileSync(companyHtmlPath, 'utf8');
//       companyHtmlContent = companyHtmlContent.replace(
//         '<script type="text/javascript" src="./config.js"></script>',
//         `<script type="text/javascript" src="./${filename}.js"></script>`
//       );
//       zip.file(`${filename}.html`, companyHtmlContent);
//       currentFolder.initialRotations = req.body.initialRotations;
//       zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

//       const assetsFolder = zip.folder('assets');
//       const assetsPath = path.join(__dirname, 'animation', 'assets');
//       await addFolderToZip(zip, assetsPath, 'assets');

//       const readmeCompanyPath = path.join(__dirname, 'readme_autonome.txt');
//       if (fs.existsSync(readmeCompanyPath)) {
//         zip.file('readme_autonome.txt', fs.readFileSync(readmeCompanyPath));
//       }
//     }

//     // Génération du fichier ZIP et réponse
//     zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
//       .pipe(res)
//       .on('finish', function () {
//         console.log(`${filename}.zip written.`);
//         res.json({ success: true, message: `${filename}.zip written`, balance: remainingBalance });
//       });

//   } catch (error) {
//     console.error("Erreur lors de la génération de l'animation:", error);
//     res.status(500).json({ success: false, message: "Erreur lors de la génération de l'animation", logs: [error.message] });
//   }
// });




app.post("/api/generate-video", async (req, res) => {
  const { images } = req.body;
  const quality = req.body.quality || 800;
  let frameTime = req.body.frameTime || 1000; // frameTime en millisecondes ou 1000ms par défaut
  frameTime = frameTime / 1000; // convertir en secondes
  console.log("Frame : ", frameTime);
  const rotation = req.body.rotation || 0;
  const outputFilename = "output.mp4";
  const tempImagesDir = "temp_images";

  console.log(`Received params: quality=${quality}, frameTime=${frameTime}, rotation=${rotation}`);

  try {
    const downloadedImages = await downloadAndSaveImages(images, tempImagesDir);
    await generateVideo(downloadedImages, quality, frameTime, rotation, outputFilename);
    res.download(outputFilename, (err) => {
      if (err) {
        console.log("Error sending video:", err);
        res.status(500).send("Error sending video");
      } else {
        console.log("Video sent successfully");
      }
    });
  } catch (error) {
    console.error("Error generating video:", error);
    res.status(500).send("Error generating video");
  }
});

async function addFilesToZip(zip, sourcePath, zipPath) {
  const files = await readdir(sourcePath);
  console.log("Source path:", sourcePath);
  console.log("Files:", files);

  for (const file of files) {
    const fullPath = path.join(sourcePath, file);
    const fileStats = fs.statSync(fullPath);
    const relativePath = path.join(zipPath, file);

    if (fileStats.isDirectory()) {
      console.log("Adding folder:", file);
      const subfolderZipPath = path.join(zipPath, file);
      await addFilesToZip(zip, fullPath, subfolderZipPath);
    } else {
      console.log("Adding file:", file);
      const data = fs.readFileSync(fullPath);
      zip.file(relativePath, data);
    }
  }
}
async function addSpecificFileToZip(zip, filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    zip.file(filePath, data);
  } else {
    console.error(`File not found: ${filePath}`);
  }
}


// async function downloadAndSaveImagesDemo(images) {
//   const tempImagesDir = await tmp.dir({ unsafeCleanup: true });
//   const imagePaths = [];

//   for (let i = 0; i < images.length; i++) {
//     const imageUrl = images[i];
//     const filename = path.basename(imageUrl);
//     const outputPath = path.join(tempImagesDir.path, filename);

//     const response = await axios({
//       method: 'GET',
//       url: imageUrl,
//       responseType: 'stream',
//     });

//     const writer = fs.createWriteStream(outputPath);

//     response.data.pipe(writer);

//     await new Promise((resolve, reject) => {
//       writer.on('finish', resolve);
//       writer.on('error', reject);
//     });

//     // Vérifiez que le fichier existe et est de type supporté
//     if (fs.existsSync(outputPath)) {
//       const extension = path.extname(outputPath).toLowerCase();
//       if (['.png', '.jpg', '.jpeg', '.bmp'].includes(extension)) {
//         imagePaths.push(outputPath);
//       } else {
//         console.error(`Unsupported image type: ${extension}`);
//       }
//     } else {
//       console.error(`Image does not exist: ${outputPath}`);
//     }
//   }

//   return { tempImagesDir, imagePaths };
// }
async function getImagesFrimagesomServer(images) {
  const validImagePaths = [];

  for (let i = 0; i < images.length; i++) {
    const imagePath = images[i];
    const outputPath = path.join(__dirname, imagePath);

    // Vérifiez que le fichier existe et est de type supporté
    if (fs.existsSync(outputPath)) {
      const extension = path.extname(outputPath).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.bmp'].includes(extension)) {
        validImagePaths.push(outputPath);
      } else {
        console.error(`Unsupported image type: ${extension}`);
      }
    } else {
      console.error(`Image does not exist: ${outputPath}`);
    }
  }

  return { validImagePaths };
}

// async function imageToBase64(imagePath) {
//   try {
//     const imageBuffer = await readFileAsync(imagePath);
//     const base64String = imageBuffer.toString('base64');
//     console.log(`Converted ${imagePath} to base64: ${base64String.substring(0, 100)}...`);  // Affiche les 100 premiers caractères
//     return base64String;
//   } catch (err) {
//     console.error("Error reading file", err);
//   }
// }
async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fsPromises.readFile(imagePath);
    const base64Image = `data:image/jpg;base64,${imageBuffer.toString('base64')}`;
    return base64Image;
  } catch (error) {
    console.error(`Error converting image to base64: ${error}`);
    return null;
  }
}


app.post('/api/generate-animation-demo', async (req, res) => {
  // 	console.log("Received request:", req.body);
  // 	console.log("Received images:", req.body.images);
  // test cors sonny
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // test end

  const currentFolder = req.body;
  const filename = currentFolder.filename;
  const quality = parseFloat(currentFolder.quality);
  let frameTime = req.body.frameTime || 1000; // frameTime en millisecondes ou 1000ms par défaut
  frameTime = frameTime / 1000; // convertir en secondes
  const rotation = req.body.rotation || 0;
  const outputGifFilename = `${filename}.gif`;
  const outputVideoFilename = `${filename}.mp4`;

  console.log(`FrameTime: ${frameTime} secondes`);

  res.set("Content-disposition", `attachment; filename=${filename}.zip`);

  const companyHtmlPath = path.join(__dirname, 'animation', 'company_demo.html');
  const webHtmlPath = path.join(__dirname, 'animation', 'web_demo.html');
  const initialRotations = req.body.initialRotations;
  console.log('Data stop:', initialRotations);

  const zip = new JSZip();

  let tempImagesDir;
  let tempDir;

  try {
    // Convertir les images en base64
    const base64Images = await Promise.all(currentFolder.images.map(imageToBase64));
    const base64Large = await Promise.all(currentFolder.large.map(imageToBase64));
    const base64Details = await Promise.all(currentFolder.details.map(imageToBase64));

    const validImages = await downloadImagesFromUrls(currentFolder.images);

    tempDir = await tmp.dir({ unsafeCleanup: true });
    const tempGifFilePath = path.join(tempDir.path, outputGifFilename);
    const tempVideoFilePath = path.join(tempDir.path, outputVideoFilename);

    //   	await generateGifDemo(validImages, frameTime, quality, tempGifFilePath);
    //   	await generateVideoDemo(validImages, frameTime, tempVideoFilePath);

    // Remarque que je suis en train d'utiliser base64Large ici.
    await generateGifDemo(base64Images, frameTime, quality, tempGifFilePath);
    await generateVideoDemo(base64Images, frameTime, tempVideoFilePath);



    zip.file(`${filename}.gif`, fs.readFileSync(tempGifFilePath));
    zip.file(`${filename}.mp4`, fs.readFileSync(tempVideoFilePath));

    if (currentFolder.type === "WEB") {
      console.log("Generating WEB animation");

      let webHtmlContent = fs.readFileSync(webHtmlPath, 'utf8');
      webHtmlContent = webHtmlContent.replace(
        '<script type="text/javascript" src="./config.js"></script>',
        `<script type="text/javascript" src="./${filename}.js"></script>`
      );
      zip.file(`${filename}.html`, webHtmlContent);
      // Création du fichier de configuration JavaScript
      const config = {
        ...currentFolder,
        images: base64Images, // images en base64
        large: base64Large,   // images 'large' en base64
        details: base64Details // images 'details' en base64
      };

      zip.file(`${filename}.js`, `var config = ${JSON.stringify(config)}`);

      //   zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);
      // Utiliser le contenu du fichier JavaScript pour obtenir les chemins des images
      const imagesToInclude = currentFolder.images.map(imagePath => {
        // Supprimer le préfixe "./" du chemin de l'image
        return imagePath.replace(/^\.\//, '');
      });

      //   // Ajouter les images au zip
      //   for (const image of currentFolder.images) {
      //     await addSpecificFileToZip(zip, image);
      // }
      // for (const largeImage of currentFolder.large) {
      //     await addSpecificFileToZip(zip, largeImage);
      // }
      // for (const detailImage of currentFolder.details) {
      //     await addSpecificFileToZip(zip, detailImage);
      // }
      // Ajouter readme_web.txt au zip pour le type "WEB"
      const readmeWebPath = path.join(__dirname, 'readme_web.txt');
      if (fs.existsSync(readmeWebPath)) {
        zip.file('readme_web.txt', fs.readFileSync(readmeWebPath));
      }
    } else if (currentFolder.type === "COMPANY") {
      console.log("Generating COMPANY animation");

      let companyHtmlContent = fs.readFileSync(companyHtmlPath, 'utf8');
      companyHtmlContent = companyHtmlContent.replace(
        '<script type="text/javascript" src="./config.js"></script>',
        `<script type="text/javascript" src="./${filename}.js"></script>`
      );
      zip.file(`${filename}.html`, companyHtmlContent);
      currentFolder.initialRotations = initialRotations;
      // Création du fichier de configuration JavaScript
      const config = {
        ...currentFolder,
        images: base64Images, // images en base64
        large: base64Large,   // images 'large' en base64
        details: base64Details // images 'details' en base64
      };

      zip.file(`${filename}.js`, `var config = ${JSON.stringify(config)}`);
      //   zip.file(`${filename}.js`, `var config = ${JSON.stringify(currentFolder)}`);

      // Include the 'assets' folder only if type is company
      const assetsFolder = zip.folder('assets');
      const assetsPath = path.join(__dirname, 'animation', 'assets');
      await addFolderToZip(assetsFolder, assetsPath);

      //   for (const image of currentFolder.images) {
      //     await addSpecificFileToZip(zip, image);
      // }
      // for (const largeImage of currentFolder.large) {
      //     await addSpecificFileToZip(zip, largeImage);
      // }
      // for (const detailImage of currentFolder.details) {
      //     await addSpecificFileToZip(zip, detailImage);
      // }
      // Ajouter readme_autonome.txt au zip pour le type "COMPANY"
      const readmeCompanyPath = path.join(__dirname, 'readme_autonome.txt');
      if (fs.existsSync(readmeCompanyPath)) {
        zip.file('readme_autonome.txt', fs.readFileSync(readmeCompanyPath));
      }
    }

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res)
      .on('finish', function () {
        console.log(`${filename}.zip written.`);
      });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while generating the zip file.");
  } finally {
    // Assurez-vous que le répertoire temporaire est supprimé, même en cas d'erreur.
    if (tempDir) {
      tempDir.cleanup();
    }
    if (tempImagesDir) {
      fs.rmdir(tempImagesDir, { recursive: true }, (err) => {
        if (err) {
          console.error("Error removing temporary directory:", err);
        }
      });
    }
  }
});
async function generateGifDemo(images, frameTime, quality, outputFilename) {
  try {
    frameTime = frameTime || 1000;
    quality = quality || 1;

    if (!images || images.length === 0) {
      throw new Error("No images provided");
    }

    // Load the first image to determine canvas size
    const firstImage = await loadImage(images[0]);
    const canvasWidth = firstImage.width;
    const canvasHeight = firstImage.height;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    const encoder = new GIFEncoder(canvasWidth, canvasHeight);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(frameTime);

    const gifQuality = 100 - Math.round(quality * 90);
    encoder.setQuality(gifQuality);

    const gifStream = encoder.createReadStream();
    const writeStream = fs.createWriteStream(outputFilename);
    gifStream.pipe(writeStream);

    for (let imgSrc of images) {
      const image = await loadImage(imgSrc);
      const ratio = image.height / image.width;
      let newWidth, newHeight;

      if (image.width > canvasWidth) {
        newWidth = canvasWidth;
        newHeight = newWidth * ratio;
      } else if (image.height > canvasHeight) {
        newHeight = canvasHeight;
        newWidth = newHeight / ratio;
      } else {
        newWidth = image.width;
        newHeight = image.height;
      }

      const offsetX = (canvasWidth - newWidth) / 2;
      const offsetY = (canvasHeight - newHeight) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, newWidth, newHeight);
      encoder.addFrame(ctx);
    }

    encoder.finish();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

  } catch (error) {
    console.error("Error generating GIF:", error);
    throw error;
  }
}

// Créer une nouvelle fonction pour générer un GIF à partir des images dans le dossier 'images'
// async function generateGifDemo(images, frameTime, quality, outputFilename) {
// 	try {
// 		frameTime = frameTime || 1000;
// 		quality = quality || 1;
//     // console.log(images); // voir ce que contient "images"
//     if (!images || images.length === 0) {
//     	throw new Error("No images provided");
//     }

//     // Load the first image to get its width
//     const firstImage = await loadImage(images[0]);
//     const width = firstImage.width;
//     const height = Math.round(width * 0.666); // Calculate the height based on the width

//     const canvas = createCanvas(width, height);
//     const ctx = canvas.getContext("2d");

//     const encoder = new GIFEncoder(width, height);
//     encoder.start();
//     encoder.setRepeat(0);
//     encoder.setDelay(frameTime);

//     const gifQuality = 100 - Math.round(quality * 90);
//     encoder.setQuality(gifQuality);

//     const gifStream = encoder.createReadStream();
//     const writeStream = fs.createWriteStream(outputFilename);
//     gifStream.pipe(writeStream);

//     // Draw the first image
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(firstImage, 0, 0, firstImage.width, firstImage.height, 0, 0, canvas.width, canvas.height);
//     encoder.addFrame(ctx);

//     // Draw the rest of the images
//     for (let i = 1; i < images.length; i++) {
//     	const image = await loadImage(images[i]);
//     	ctx.clearRect(0, 0, canvas.width, canvas.height);
//     	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
//     	encoder.addFrame(ctx);
//     }

//     encoder.finish();

//     return new Promise((resolve, reject) => {
//     	writeStream.on('finish', resolve);
//     	writeStream.on('error', reject);
//     });

// } catch (error) {
// 	console.error("Error generating GIF:", error);
// 	throw error;
// }
// }
app.post("/api/generate-gif-demo", async (req, res) => {
  let tempDir;
  try {
    const images = req.body.images;
    if (!images || images.length === 0) {
      res.status(400).send("No images provided");
      return;
    }
    const frameTime = req.body.frameTime || 1000;
    const quality = parseFloat(req.body.quality) || 1;
    const outputGifFilename = req.body.filename + '.gif';
    const validImages = await downloadImagesFromUrls(images);
    tempDir = await tmp.dir({ unsafeCleanup: true });
    const tempGifFilePath = path.join(tempDir.path, outputGifFilename);
    await generateGifDemo(validImages, frameTime, quality, tempGifFilePath);

    // Compress the generated GIF using gifsicle
    const compressedFilename = path.join(tempDir.path, 'compressed_' + outputGifFilename);
    execFile(gifsicle, ['-O6', '--lossy', '-o', compressedFilename, tempGifFilePath], err => {
      if (err) {
        console.error("Error compressing the GIF:", err);
        res.status(500).send("Error compressing the GIF");
        return;
      }

      // Send the compressed GIF file to the client
      res.download(compressedFilename, (err) => {
        if (err) throw err;
        fs.unlink(compressedFilename, (err) => {
          if (err) console.error("Error deleting the compressed GIF file:", err);
        });
        fs.unlink(tempGifFilePath, (err) => {
          if (err) console.error("Error deleting the original GIF file:", err);
        });
      });
    });
  } catch (error) {
    console.error("Error in POST /generate-gif-demo:", error);
    res.status(500).send("Error in POST /generate-gif-demo");
  } finally {
    if (tempDir) {
      tempDir.cleanup();
    }
  }
});
// Créer une nouvelle route POST pour générer un GIF à partir du dossier 'images'
// app.post("/api/generate-gif-demo", async (req, res) => {
// 	let tempDir;
// 	try {
//     const images = req.body.images;  // <--- Get images array from request body
//     if (!images || images.length === 0) {
//     	res.status(400).send("No images provided");
//     	return;
//     }

//     const frameTime = req.body.frameTime || 1000; 
//     const quality = parseFloat(req.body.quality) || 1;
//     const outputGifFilename = req.body.filename + '.gif';  // <--- Get filename from request body

//     // Replace getImagesFromServer function with one that downloads images from URLs
//     const validImages = await downloadImagesFromUrls(images);

//     tempDir = await tmp.dir({ unsafeCleanup: true });
//     const tempGifFilePath = path.join(tempDir.path, outputGifFilename);

//     await generateGifDemo(validImages, frameTime, quality, tempGifFilePath);

//     res.download(tempGifFilePath, (err) => {
//     	if (err) throw err;

//     	fs.unlink(tempGifFilePath, (err) => {
//     		if (err) console.error("Error deleting the GIF file:", err);
//     	});
//     });

// } catch (error) {
// 	console.error("Error in POST /generate-gif-demo:", error);
// 	res.status(500).send("Error in POST /generate-gif-demo");
// } finally {
// 	if (tempDir) {
// 		tempDir.cleanup();
// 	}
// }
// });

// This function checks local image paths and returns them.
// Note: This is a simplified version and might not work in all cases. You might need to adjust it based on your specific needs.
async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fsPromises.readFile(imagePath);
    const base64Image = `data:image/jpg;base64,${imageBuffer.toString('base64')}`;
    return base64Image;
  } catch (error) {
    console.error(`Error converting image to base64: ${error}`);
    return null;
  }
}

async function downloadImagesFromUrls(imageUrls) {
  const base64Images = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const localPath = path.join(__dirname, imageUrl);
    const base64Image = await imageToBase64(localPath);
    if (base64Image) {
      base64Images.push(base64Image);
    }
  }

  return base64Images;
}

// async function downloadImagesFromUrls(imageUrls) {
// 	const localPaths = [];

// 	for (let i = 0; i < imageUrls.length; i++) {
// 		const imageUrl = imageUrls[i];
// 		const localPath = path.join(__dirname, imageUrl);
// 		localPaths.push(localPath);
// 	}

// 	return localPaths;
// }


// This function downloads an image from a URL to a local file.
// Note: This is a simplified version and might not work in all cases. You might need to adjust it based on your specific needs.
async function downloadImage(imageUrl, localPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    http.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(localPath);
      reject(err);
    });
  });
}
app.post("/api/generate-video-demo", async (req, res) => {
  let tempDir;
  try {
    const images = req.body.images;
    if (!images || images.length === 0) {
      res.status(400).send("No images provided");
      return;
    }

    const frameTime = req.body.frameTime || 1000;
    const outputVideoFilename = req.body.filename + '.mp4';

    // 		const validImages = await downloadImagesFromUrls(images);
    const validBase64Images = await downloadImagesFromUrls(images);


    tempDir = await tmp.dir({ unsafeCleanup: true });
    const tempVideoFilePath = path.join(tempDir.path, outputVideoFilename);

    // 		await generateVideoDemo(validImages, frameTime, tempVideoFilePath);
    await generateVideoDemo(validBase64Images, frameTime / 1000, tempVideoFilePath);


    res.download(tempVideoFilePath, (err) => {
      if (err) throw err;

      fs.unlink(tempVideoFilePath, (err) => {
        if (err) console.error("Error deleting the video file:", err);
      });
    });

  } catch (error) {
    console.error("Error in POST /generate-video-demo:", error);
    res.status(500).send("Error in POST /generate-video-demo");
  } finally {
    if (tempDir) {
      tempDir.cleanup();
    }
  }
});
async function generateVideoDemo(base64Images, frameTime, outputFilePath) {
  const tempImages = [];

  // Créer un dossier temporaire pour stocker les images
  const tempFolder = await tmp.dir({ unsafeCleanup: true });

  // Sauvegarder les images en base64 en fichiers temporaires
  for (let i = 0; i < base64Images.length; i++) {
    const imgBuffer = Buffer.from(base64Images[i].split(',')[1], 'base64'); // En supposant que vous ayez "data:image/jpg;base64," comme préfixe
    const imgPath = path.join(tempFolder.path, `image${i}.jpg`);
    fs.writeFileSync(imgPath, imgBuffer);
    tempImages.push(imgPath);
    // console.log(`Image sauvegardée : image${i}.jpg`); // Log pour le suivi
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tempFolder.path, 'image%d.jpg'))
      .inputFPS(1 / frameTime)
      .output(outputFilePath)
      .outputOptions([
        '-vf scale=-1:trunc(ih/2)*2' // Assure que la hauteur soit divisible par 2
      ])
      .outputOptions("-r", "15")  // Définit le taux d'images à 15
      .on('end', () => {
        // Supprimer le dossier temporaire
        tempFolder.cleanup();
        resolve();
      })
      .on('error', (err) => {
        // Supprimer le dossier temporaire
        tempFolder.cleanup();
        // console.log(`Erreur lors du traitement des images suivantes: ${tempImages.join(', ')}`); // Log pour le suivi
        reject(err);
      })
      .on('stderr', (stderrLine) => {
        // console.log('Stderr output:', stderrLine);
      })
      .run();
  });
}
// async function generateVideoDemo(base64Images, frameTime, outputFilePath) {
//   const tempImages = [];

//   // Créer un dossier temporaire pour stocker les images
//   const tempFolder = await tmp.dir({ unsafeCleanup: true });

//   // Sauvegarder les images en base64 en fichiers temporaires
//   for (let i = 0; i < base64Images.length; i++) {
//     const imgBuffer = Buffer.from(base64Images[i].split(',')[1], 'base64'); // En supposant que vous ayez "data:image/jpg;base64," comme préfixe
//     const imgPath = path.join(tempFolder.path, `image${i}.jpg`);
//     fs.writeFileSync(imgPath, imgBuffer);
//     tempImages.push(imgPath);
//     console.log(`Image sauvegardée : image${i}.jpg`); // Log pour le suivi
//   }

//   return new Promise((resolve, reject) => {
//     ffmpeg()
//       .input(path.join(tempFolder.path, 'image%d.jpg'))
//       .inputFPS(1 / frameTime)
//       .output(outputFilePath)
//       .on('end', () => {
//         // Supprimer le dossier temporaire
//         tempFolder.cleanup();
//         resolve();
//       })
//       .on('error', (err) => {
//         // Supprimer le dossier temporaire
//         tempFolder.cleanup();
//         console.log(`Erreur lors du traitement des images suivantes: ${tempImages.join(', ')}`); // Log pour le suivi
//         reject(err);
//       })
//       .on('stderr', (stderrLine) => {
//     console.log('Stderr output:', stderrLine);
//   })
//       .run();
//   });
// }

// async function generateVideoDemo(imagePaths, frameTime, outputVideoPath) {
// 	return new Promise((resolve, reject) => {
// 		const command = ffmpeg();

// 		imagePaths.forEach(imagePath => {
// 			command.input(imagePath);
// 		});

// 		command
//   .inputFPS(100)  // Convert frameTime from ms to s and calculate fps
//   .output(outputVideoPath)
//   .outputOptions('-pix_fmt yuv420p')  // Necessary to ensure compatibility with all players
//   .on('end', () => {
//     console.log("FFmpeg process finished successfully");
//     resolve();
//   })
//   .on('error', (err) => {
//     console.error("Error occurred in FFmpeg:", err);
//     reject(err);
//   })
//   .on('stderr', (stderrLine) => {
//     console.log('Stderr output:', stderrLine);
//   })
//   .run();


//   });
// }


// app.post("/api/generate-video-demo", async (req, res) => {
//   const { images } = req.body;
//   const quality = req.body.quality || 800;
//   const frameTime = req.body.frameTime || 1;
//   const rotation = req.body.rotation || 0;
//   const outputFilename = "output.mp4";
//   const tempImagesDir = "temp_images";

//   console.log(`Received params: quality=${quality}, frameTime=${frameTime}, rotation=${rotation}`);

//   try {
//     const downloadedImages = await downloadAndSaveImages(images, tempImagesDir);
//     await generateVideo(downloadedImages, quality, frameTime, rotation, outputFilename);
//     res.download(outputFilename, (err) => {
//       if (err) {
//         console.log("Error sending video:", err);
//         res.status(500).send("Error sending video");
//     } else {
//         console.log("Video sent successfully");
//     }
// });
// } catch (error) {
//     console.error("Error generating video:", error);
//     res.status(500).send("Error generating video");
// }
// });


async function addFolderToZip(zip, folderPath, folderName) {
  const folder = zip.folder(folderName);

  const files = await fs.promises.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fileStat = await fs.promises.stat(filePath);
    if (fileStat.isFile()) {
      const fileContent = await fs.promises.readFile(filePath);
      folder.file(file, fileContent);
    } else if (fileStat.isDirectory()) {
      await addFolderToZip(folder, filePath, file);
    }
  }
}

async function generateGif(images, frameTime, quality, outputFilename) {
  try {
    frameTime = frameTime || 1000;
    quality = quality || 1;

    // Obtenez la largeur et la hauteur maximales parmi toutes les images
    let maxWidth = 0;
    let maxHeight = 0;
    for (let imgSrc of images) {
      const { width, height } = sizeOf(imgSrc);
      maxWidth = Math.max(maxWidth, width);
      maxHeight = Math.max(maxHeight, height);
    }

    const canvas = createCanvas(maxWidth, maxHeight);
    const ctx = canvas.getContext("2d");
    const encoder = new GIFEncoder(maxWidth, maxHeight);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(frameTime);
    const gifQuality = 100 - Math.round(quality * 90);
    encoder.setQuality(gifQuality);
    const gifStream = encoder.createReadStream();
    const writeStream = fs.createWriteStream(outputFilename);
    gifStream.pipe(writeStream);

    // Pour chaque image
    for (let i = 0; i < images.length; i++) {
      const image = await loadImage(images[i]);
      const ratio = image.height / image.width;
      let newWidth, newHeight;
      if (image.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth * ratio;
      } else if (image.height > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight / ratio;
      } else {
        newWidth = image.width;
        newHeight = image.height;
      }

      // Centrez l'image sur le canvas
      const offsetX = (canvas.width - newWidth) / 2;
      const offsetY = (canvas.height - newHeight) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, newWidth, newHeight);
      encoder.addFrame(ctx);
    }

    encoder.finish();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        // Compress the generated GIF using gifsicle
        const compressedFilename = `compressed_${outputFilename}`;
        execFile(gifsicle, ['-O3', '-o', compressedFilename, outputFilename], err => {
          if (err) {
            console.error("Error compressing the GIF:", err);
            reject(err);
            return;
          }
          // Rename the compressed file to the original output filename
          fs.renameSync(compressedFilename, outputFilename);
          resolve();
        });
      });
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error generating GIF:", error);
    throw error;
  }
}
// async function generateGif(images, frameTime, quality, outputFilename) {
//     try {
//         frameTime = frameTime || 1000;
//         quality = quality || 1;

//         const MaxWidth = 800;
//         const MaxHeight = 800;
//         const canvas = createCanvas(MaxWidth, MaxHeight);
//         const ctx = canvas.getContext("2d");

//         const encoder = new GIFEncoder(MaxWidth, MaxHeight);
//         encoder.start();
//         encoder.setRepeat(0);
//         encoder.setDelay(frameTime);

//         const gifQuality = 100 - Math.round(quality * 90);
//         encoder.setQuality(gifQuality);

//         const gifStream = encoder.createReadStream();
//         const writeStream = fs.createWriteStream(outputFilename);
//         gifStream.pipe(writeStream);

//         for (let i = 0; i < images.length; i++) {
//             const image = await loadImage(images[i]);

//             const currentAspectRatio = image.width / image.height;
//             let width, height;

//             if (currentAspectRatio === 1) {
//                 width = MaxWidth;
//                 height = MaxWidth;
//             } else if (currentAspectRatio < 1) {
//                 width = MaxWidth;
//                 height = Math.round(MaxWidth * currentAspectRatio);
//             } else {
//                 height = MaxHeight;
//                 width = Math.round(MaxHeight / currentAspectRatio);
//             }

//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
//             encoder.addFrame(ctx);
//         }

//         encoder.finish();

//         return new Promise((resolve, reject) => {
//             writeStream.on('finish', resolve);
//             writeStream.on('error', reject);
//         });

//     } catch (error) {
//         console.error("Error generating GIF:", error);
//         throw error;
//     }
// }
// async function generateGif(images, frameTime, quality, outputFilename) {
//     try {
//         frameTime = frameTime || 1000;
//         quality = quality || 1;

//         // Obtenez la largeur et la hauteur maximales parmi toutes les images
//         let maxWidth = 0;
//         let maxHeight = 0;
//         for (let imgSrc of images) {
//             const { width, height } = sizeOf(imgSrc);
//             maxWidth = Math.max(maxWidth, width);
//             maxHeight = Math.max(maxHeight, height);
//         }

//         const canvas = createCanvas(maxWidth, maxHeight);
//         const ctx = canvas.getContext("2d");

//         const encoder = new GIFEncoder(maxWidth, maxHeight);
//         encoder.start();
//         encoder.setRepeat(0);
//         encoder.setDelay(frameTime);

//         const gifQuality = 100 - Math.round(quality * 90);
//         encoder.setQuality(gifQuality);

//         const gifStream = encoder.createReadStream();
//         const writeStream = fs.createWriteStream(outputFilename);
//         gifStream.pipe(writeStream);

//         // Pour chaque image
//         for (let i = 0; i < images.length; i++) {
//             const image = await loadImage(images[i]);
//             const ratio = image.height / image.width;
//             let newWidth, newHeight;

//             if (image.width > maxWidth) {
//                 newWidth = maxWidth;
//                 newHeight = newWidth * ratio;
//             } else if (image.height > maxHeight) {
//                 newHeight = maxHeight;
//                 newWidth = newHeight / ratio;
//             } else {
//                 newWidth = image.width;
//                 newHeight = image.height;
//             }

//             // Centrez l'image sur le canvas
//             const offsetX = (canvas.width - newWidth) / 2;
//             const offsetY = (canvas.height - newHeight) / 2;

//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(image, 0, 0, image.width, image.height, offsetX, offsetY, newWidth, newHeight);
//             encoder.addFrame(ctx);
//         }

//         encoder.finish();

//         return new Promise((resolve, reject) => {
//             writeStream.on('finish', resolve);
//             writeStream.on('error', reject);
//         });

//     } catch (error) {
//         console.error("Error generating GIF:", error);
//         throw error;
//     }
// }


app.post("/api/generate-gif", async (req, res) => {
  try {
    const { images, frameTime, quality } = req.body;
    const outputFilename = "myanimated.gif";
    const compressedFilename = "myanimated_compressed.gif";

    await generateGif(images, frameTime, quality, outputFilename);

    // Compress the GIF using gifsicle
    execFile(gifsicle, ['-O3', '-o', compressedFilename, outputFilename], err => {
      if (err) {
        console.error("Error compressing the GIF:", err);
        throw err;
      }

      // Then send the compressed GIF to the client
      res.download(compressedFilename, (err) => {
        if (err) throw err;

        // Optionally delete the files after sending it to client
        fs.unlink(outputFilename, (err) => {
          if (err) console.error("Error deleting the original file:", err);
        });
        fs.unlink(compressedFilename, (err) => {
          if (err) console.error("Error deleting the compressed file:", err);
        });
      });
    });

  } catch (error) {
    console.error("Error in POST /generate-gif:", error);
    res.status(500).send("Error in POST /generate-gif");
  }
});


// app.post("/api/generate-gif", async (req, res) => {
//   try {
//     const { images } = req.body;
//     let { frameTime, quality } = req.body;

//     // Définir les valeurs par défaut pour frameTime et quality
//     frameTime = frameTime || 1000; // Valeur par défaut : 1000 ms (1 seconde)
//     quality = quality || 1; // Valeur par défaut : 100%

//     const canvas = createCanvas(800, 800);
//     const ctx = canvas.getContext("2d");

//     const encoder = new GIFEncoder(800, 800);
//     encoder.start();
//     encoder.setRepeat(0);
//     encoder.setDelay(frameTime);
//     console.log("Frame time:", frameTime, "ms");

//     // Appliquer la formule corrigée pour gifQuality
//     const gifQuality = 100 - Math.round(quality * 90);
//     encoder.setQuality(gifQuality);
//     console.log("GIF Quality:", gifQuality);

//     res.set("Content-disposition", "attachment; filename=myanimated.gif");
//     encoder.createReadStream().pipe(res);

//     for (const f of images) {
//       const image = await loadImage(f);
//       ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
//       encoder.addFrame(ctx);
//     }

//     encoder.finish();
//     console.log("animated.gif written.");
//   } catch (error) {
//     console.error("Error generating GIF:", error);
//     res.status(500).send("Error generating GIF");
//   }
// });






// app.post("/api/generate-gif", async (req, res) => {
//   const images = req.body.images;

//   const canvas = createCanvas(800, 800);
//   const ctx = canvas.getContext("2d");

//   const encoder = new GIFEncoder(800, 800);
//   encoder.start();
//   encoder.setRepeat(0);
//   encoder.setDelay(1000);
//   encoder.setQuality(10);

//   res.set("Content-disposition", "attachment; filename=myanimated.gif");
//   encoder.createReadStream().pipe(res);

//   for (const f of images) {
//     const image = await loadImage(f);
//     ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
//     encoder.addFrame(ctx);
//   }

//   encoder.finish();
//   console.log("animated.gif written.");
// });

// app.post('/api/test', upload.array('uploadedImages'), async (req, res) => {
//   console.log('Files received:', req.files);
//   try {
//     const fields = { ...req.body };
//     console.log('Fields type:', fields.type);
//     const files = Array.isArray(req.files) ? req.files : [req.files];
//     let largePromises = [];
//     let smallPromises = [];
//     let detailPromises = [];

//     for (let file of files) {
//       try {
//         let imageBuffer = fs.readFileSync(file.path);

//         // Calculate the height based on aspect ratio
//         let dimensions = sizeOf(imageBuffer);
//         let aspectRatio = dimensions.height / dimensions.width;

//         // Remove black background
//         const processedBuffer = await removeBlackBackground(file.path);

//         // For "PRODUCT" type, create large and small images
//         if (fields.type == "PRODUCT") {
//           let largeHeight = Math.round(1600 * aspectRatio);
//           console.log(`Large image dimensions: 1600 x ${largeHeight}`);
//           largePromises.push(sharp(processedBuffer).resize(1600, largeHeight).jpeg({ quality: 100 }).toBuffer());

//           let smallHeight = Math.round(800 * aspectRatio);
//           console.log(`Small image dimensions: 800 x ${smallHeight}`);
//           smallPromises.push(sharp(processedBuffer).resize(800, smallHeight).jpeg({ quality: 100 }).toBuffer());
//         }

//         // Create detail images for all types
//         let detailHeight = Math.round(800 * aspectRatio);
//         console.log(`Detail image dimensions: 800 x ${detailHeight}`);
//         detailPromises.push(sharp(processedBuffer).resize(800, detailHeight).jpeg({ quality: 100 }).toBuffer());

//       } catch (err) {
//         console.error(`Error processing file ${file.originalname}:`, err);
//       }
//     }

//     let largeResults = await Promise.all(largePromises);
//     let smallResults = await Promise.all(smallPromises);
//     let detailResults = await Promise.all(detailPromises);

//     res.status(200).send({
//       status: true,
//       message: 'Files are uploaded',
//       result: {
//         large: largeResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
//         small: smallResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
//         details: detailResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
//       },
//     });

//   } catch (err) {
//     console.error("Error in /test:", err);
//     res.status(500).send(err);
//   } finally {
//     // Clear uploads directory
//     helpers.emptyFolder('./uploads');
//   }
// });

// // Function to remove black background
// async function removeBlackBackground(imagePath) {
//   try {
//     const image = await Jimp.read(imagePath);

//     // Iterate over each pixel
//     image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
//       const red = this.bitmap.data[idx + 0];
//       const green = this.bitmap.data[idx + 1];
//       const blue = this.bitmap.data[idx + 2];

//       // If the pixel is black, make it transparent
//       if (red === 0 && green === 0 && blue === 0) {
//         this.bitmap.data[idx + 3] = 0; // Set alpha channel to 0
//       }
//     });

//     // Save to a buffer
//     const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
//     return buffer;
//   } catch (error) {
//     console.error('Error removing black background:', error);
//     throw error;
//   }
// }

app.post('/api/test', upload.array('uploadedImages'), async (req, res) => {
	console.log('Files received:', req.files);
	try {
		const fields = { ...req.body };
		console.log('Fields type:', fields.type);
		const files = Array.isArray(req.files) ? req.files : [req.files];
		let largePromises = [];
		let smallPromises = [];
		let detailPromises = [];

		for(let file of files) {
			try {
				let imageBuffer = fs.readFileSync(file.path);

        // Calculate the height based on aspect ratio
				let dimensions = sizeOf(imageBuffer);
				let aspectRatio = dimensions.height / dimensions.width;

        // For "PRODUCT" type, create large and small images
				if(fields.type == "PRODUCT") {
					let largeHeight = Math.round(1600 * aspectRatio);
					console.log(`Large image dimensions: 1600 x ${largeHeight}`);
					largePromises.push(sharp(imageBuffer).resize(1600, largeHeight).jpeg({quality: 100}).toBuffer());

					let smallHeight = Math.round(800 * aspectRatio);
					console.log(`Small image dimensions: 800 x ${smallHeight}`);
					smallPromises.push(sharp(imageBuffer).resize(800, smallHeight).jpeg({quality: 100}).toBuffer());
				}

        // Create detail images for all types
				let detailHeight = Math.round(800 * aspectRatio);
				console.log(`Detail image dimensions: 800 x ${detailHeight}`);
				detailPromises.push(sharp(imageBuffer).resize(800, detailHeight).jpeg({quality: 100}).toBuffer());

			} catch (err) {
				console.error(`Error processing file ${file.originalname}:`, err);
			}
		}


		let largeResults = await Promise.all(largePromises);
		let smallResults = await Promise.all(smallPromises);
		let detailResults = await Promise.all(detailPromises);

		res.status(200).send({
			status: true,
			message: 'Files are uploaded',
			result: {
				large: largeResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
				small: smallResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
				details: detailResults.map(buffer => `data:image/jpg;base64,${buffer.toString('base64')}`),
			},
		});

	} catch (err) {
		console.error("Error in /test:", err);
		res.status(500).send(err);
	} finally {
        // clear uploads directory
		helpers.emptyFolder('./uploads');
	}
});



// app.post('/api/test', upload.array('uploadedImages'), async (req, res) => {
//     console.log('Files received:', req.files);
//     try {
//         const fields = { ...req.body };
//         const sm_size = Number(fields.width) / 2;
//         const promises = [];
//         const promises_s = [];
//         const files = Array.isArray(req.files) ? req.files : [req.files];
//         _.forEach(_.keysIn(files), (key) => {
//             const photo = files[key];
//             // Le fichier est déjà dans le dossier 'uploads/', on utilise donc 'photo.path'
//             const newPath = photo.path;

//             const result = helpers.getBuffer(fields, newPath);
//             const result_s = helpers.getBuffer({ ...fields, width: sm_size, height: sm_size }, newPath);

//             promises.push(result);
//             promises_s.push(result_s);
//         });
//         const result = await Promise.all(promises);
//         const result_s = fields.type == "PRODUCT" ? await Promise.all(promises_s) : [];

//         res.status(200).send({
//             status: true,
//             message: 'Files are uploaded',
//             result: {
//                 large: fields.type == "PRODUCT" ? result.map((imgLUrl) => `data:image/jpg;base64,${imgLUrl.toString('base64')}`) : [],
//                 small: fields.type == "PRODUCT" ? result_s.map((imgSUrl) => `data:image/jpg;base64,${imgSUrl.toString('base64')}`) : [],
//                 details: fields.type != "PRODUCT" ? result.map((imgDUrl) => `data:image/jpg;base64,${imgDUrl.toString('base64')}`) : [],
//             },
//         });
//     } catch (err) {
//         res.status(500).send(err);
//     } finally {
//         // clear uploads directory
//         helpers.emptyFolder('./uploads');
//     }
// });



//make uploads directory static
app.use(express.static(__dirname + '/public'));

//start app 
// http.createServer(app).listen(5000)
// Définir le port
app.set('port', process.env.PORT || 3333);

// Démarrer l'application
http.createServer(app).listen(app.get('port'), () => {
  console.log('Server is running on port', app.get('port'));
});

