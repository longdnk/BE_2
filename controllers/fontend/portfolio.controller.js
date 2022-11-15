const Portfolio = require('../../models/Portfolio.model')
const Site = require('../../models/Site.model')
const Plant = require('../../models/Plant.model')
const err = require('../../common/err')
var fs = require('fs');
var path = require('path');

const multer = require('multer');
const { isNull } = require('util');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(!file){
      res.status(400).send(err.E43001)
      return
    }
    if(!fs.existsSync(process.env.IMAGE_PATH)){
      fs.mkdirSync(process.env.IMAGE_PATH,{recursive: true},err=>{console.log(err)})
    }
    cb(null, process.env.IMAGE_PATH)
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now() + "." + extension )
  },
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2097152 }, //2MB
  fileFilter: function(req, file, cb){
    checkFileType(req,file, cb);
  },
}).single('logo')

function checkFileType(req,file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/g;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb({message: 'Images Only!'});
  }
}

//A0081 
module.exports.getPortfolioImage = async (req, res) => {
  try {
    let portfolio_id = req.params.id
    let portfolio = await Portfolio.findById(portfolio_id);
    const data = {
      "code": 200,
      "message": "OK",
      "data": {
          "id": portfolio_id,
          "name": portfolio.name,
          "logoUrl": portfolio.avata_path
      }
    }
    res.status(200).send(data)      
  } catch (error) {
      res.status(400).send({...err.E40001,...{description: error.message} })
  }

}     
//A0082 
module.exports.postPortfolioImage = async (req, res) => {
  upload(req, res, async function (err1) {
    if (err1 instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).send({...err.E43002});
    } else if (err1) {
      return res.status(400).send({...err.E43003});
    }

    // Everything went fine.
    //
    try {
      let name = req.body.name
      let portfolio_id = req.params.id
      if(!name){return res.status(400).send({...err.E43004})}
      let portfolio = await Portfolio.findById(portfolio_id);
      if(req.file && !err1){
        //Full option - action update
        if(fs.existsSync(process.env.IMAGE_PATH + '/' + portfolio.avata_file )){
          fs.unlinkSync(process.env.IMAGE_PATH +  '/' + portfolio.avata_file);
        }
        const file = req.file
        update = {
          name: name,
          avata_path: process.env.IMAGE_HOST + ':' + process.env.IMAGE_PORT + '/' + process.env.IMAGE_URL + '/' + file.filename,
          avata_file: file.filename
        }
      }else{
        if(Object.keys(req.body).length < 2 && !req.file){
          // Only name
          name = name!==undefined ? name : null;
          update = {
            name: name,
            //avata_path: file.path,
            //avata_file: file.filename
          }
        }else{
          // Logo = null. Action: Delete logo
          let portfolio = await Portfolio.findById(portfolio_id);
          //var dir = path.join(__dirname, 'public');
          if(fs.existsSync(process.env.IMAGE_PATH + '/'  + portfolio.avata_file)){
            fs.unlinkSync(process.env.IMAGE_PATH + '/'  + portfolio.avata_file);
          }
          update = {
            //avata_name: null,
            avata_path: null,
            avata_file: null
          }
        }
      }
        
        let query = {'_id': portfolio_id};
        let result = await Portfolio.findOneAndUpdate(query, update, {upsert: false, returnDocument: 'after'})  
        let test = await Portfolio.find(query);
        
        const data = {
            "code": 200,
            "message": "OK",
            "data": {
              "id": portfolio_id,
              "name": result.name,
              "logoUrl": result.avata_path,
            },
        }
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send({...err.E40001,...{description: error.message} })
    }
  }) 
}


