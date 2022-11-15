const express = require('express')
const controller = require('../../controllers/fontend/portfolio.controller')
const router = express()
const multer = require('multer');
// SET STORAGE
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if(!file){
//       res.status(400).send(err.E43001)
//       return
//     }
//     cb(null, 'public/uploads')
//   },
//   filename: function (req, file, cb) {
//     let extArray = file.mimetype.split("/");
//     let extension = extArray[extArray.length - 1];

//     cb(null, file.fieldname + '-' + Date.now() + "." + extension )
//   }
// })
   
// var upload = multer({ storage: storage })

router.get('/:id', controller.getPortfolioImage) //A0081
router.post('/:id', controller.postPortfolioImage) //A0082

module.exports = router