require('dotenv').config();
require('express-group-routes');
var mongoose = require('mongoose');

var bodyParser = require('body-parser')

const express = require('express')
const cors = require('cors');
const app = express()
const HTTP_PORT = parseInt(process.env.HTTP_PORT);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT);
var path = require('path');

//----------------------------
const https = require('https');
const fs = require('fs');

var http = require('http').createServer(app).listen(HTTP_PORT);

if (process.env.ENV == "PROD") {
  const options1 = {
    key: fs.readFileSync(process.env.PRIVATE_KEY),
    cert: fs.readFileSync(process.env.CERT_KEY)
  };
  https.createServer(options1, app).listen(HTTPS_PORT)
}
//---------
app.use((req, res, next) => {
  res.locals.user = "";
  next()
})

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const cookieParser = require('cookie-parser')
app.use(cookieParser())

var engine = require('ejs-locals');
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cors());

app.set('views', './views');

app.use(express.json())

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const adminUserRouter = require('./routes/admin/user.route');
const adminStationRouter = require('./routes/admin/station.route');
const adminDomainRouter = require('./routes/admin/domain.route');
const adminPortfolioRouter = require('./routes/admin/portfolio.route');
const adminSiteRouter = require('./routes/admin/site.route');
const adminPlantRouter = require('./routes/admin/plant.route');
const adminDeviceRouter = require('./routes/admin/device.route');
const adminRoleRouter = require('./routes/admin/role.route');
const adminPermissionRouter = require('./routes/admin/permission.route');
const adminIotRouter = require('./routes/admin/iot.route');
const adminProtocolRouter = require('./routes/admin/protocol.route');
const adminInverterRouter = require('./routes/admin/inverter.route');
const adminPanelRouter = require('./routes/admin/panelType.route');
const adminStringRouter = require('./routes/admin/string.route');
const adminIotPlantConnectionRouter = require('./routes/admin/iotPlantConnection.route');
const adminAreaRouter = require('./routes/admin/area.route');
const adminIotConditionRouter = require('./routes/admin/iotCondition.route');
const adminIotPlantConditionRouter = require('./routes/admin/iotPlantConCondition.route');
const adminPortfolioConditionRouter = require('./routes/admin/portfolioCondition.route');
const adminSiteConditionRouter = require('./routes/admin/siteCondition.route');
const adminPlantConditionRouter = require('./routes/admin/plantCondition.route');
const adminDeviceConditionRouter = require('./routes/admin/deviceCondition.route');
const adminSupplierRouter = require('./routes/admin/supplier.route');
const adminCustomerRouter = require('./routes/admin/customer.route');
const adminBillingConfigRouter = require('./routes/admin/billingConfig.route');
const adminBillingScheduleRouter = require('./routes/admin/billingSchedule.route');
const adminBudgetRouter = require('./routes/admin/budget.route');

app.group("/admin", (router) => {
  router.use('/user', adminUserRouter);
  router.use('/station', adminStationRouter);
  router.use('/domain', adminDomainRouter);
  router.use('/portfolio', adminPortfolioRouter);
  router.use('/site', adminSiteRouter);
  router.use('/plant', adminPlantRouter);
  router.use('/device', adminDeviceRouter);
  router.use('/role', adminRoleRouter);
  router.use('/permission', adminPermissionRouter);
  router.use('/iot', adminIotRouter);
  router.use('/protocol', adminProtocolRouter);
  router.use('/inverter', adminInverterRouter);
  router.use('/panel', adminPanelRouter);
  router.use('/string', adminStringRouter);
  router.use('/iot-plant', adminIotPlantConnectionRouter);
  router.use('/area', adminAreaRouter);
  router.use('/iot-conditions', adminIotConditionRouter);
  router.use('/iot-plant-conditions', adminIotPlantConditionRouter);
  router.use('/portfolio-conditions', adminPortfolioConditionRouter);
  router.use('/site-conditions', adminSiteConditionRouter);
  router.use('/plant-conditions', adminPlantConditionRouter);
  router.use('/device-conditions', adminDeviceConditionRouter);
  router.use('/supplier', adminSupplierRouter);
  router.use('/customer', adminCustomerRouter);
  router.use('/billing-config', adminBillingConfigRouter);
  router.use('/billing-schedule', adminBillingScheduleRouter);
  router.use('/budget', adminBudgetRouter);
});

//===================================================
const fontendUserRouter = require('./routes/fontend/user.route');
const fontendOverviewRouter = require('./routes/fontend/overview.route');
const fontendEventRouter = require('./routes/fontend/event.route');
const fontendSiteRouter = require('./routes/fontend/site.route');
const fontendPlantRouter = require('./routes/fontend/plant.route');
const fontendAnalysisRouter = require('./routes/fontend/analysis.route');
const fontendPortfolioRouter = require('./routes/fontend/portfolio.route');
const fontendBillingRouter = require('./routes/fontend/billing.route');
const fontendRuleRouter = require('./routes/fontend/rule.route');
const fontendRuleConditionRouter = require('./routes/fontend/ruleCondition.route');
const fontendRuleDeviceRouter = require('./routes/fontend/ruleDevice.route');

app.group("/fontend", (router) => {
  router.use('/user', fontendUserRouter);
  router.use('/overview', fontendOverviewRouter);
  router.use('/events', fontendEventRouter);
  router.use('/sites', fontendSiteRouter);
  router.use('/plants', fontendPlantRouter);
  router.use('/analysis', fontendAnalysisRouter);
  router.use('/portfolio', fontendPortfolioRouter);
  router.use('/billing', fontendBillingRouter);
  router.use('/rules', fontendRuleRouter);
  router.use('/rule-conditions', fontendRuleConditionRouter);
  router.use('/devices', fontendRuleDeviceRouter);
});

// cache
const cache = require('./service/cache/cacheServices');
cache.connectRedis()
// const caches = async () => {
//   cache.setWithTime('key', {name: 'bao4', sn: 1999}, 10)
//   const cacheData = await cache.getBykey('key')
//   console.log(cacheData)
// }
// caches()
// SocketIO
const appSocket = express()
const ServerSocket = require('http').createServer(appSocket)
const SOCKET_PORT = parseInt(process.env.SOCKET_PORT);
ServerSocket.listen(SOCKET_PORT)
var io = require('socket.io')(ServerSocket, {
  cors: {
    origin: "*",
    methods: '*'
  }
})
io.on('connection', (socket) => {
  console.log(`A new Client connect with server: ${socket.id}`)
  let count = 0
  setInterval(() => {
    count ++
    socket.emit('AUTO_REFRESH_DATA', {
      data: count,
    });
    console.log("emit " + count)
  }, 1000 * 60);
});


//-----------------------------
// Phuc add server static run port 5002
// HTTP_IMG_PORT = 5002
//------------------------------
// var dir = path.join(__dirname, 'public');
// var static_http = require('http');

// var mime = {
//   html: 'text/html',
//   txt: 'text/plain',
//   css: 'text/css',
//   gif: 'image/gif',
//   jpg: 'image/jpeg',
//   png: 'image/png',
// };

// var static_server = static_http.createServer(function (req, res) {
//   var reqpath = req.url.toString().split('?')[0];
//   if (req.method !== 'GET') {
//     res.statusCode = 501;
//     res.setHeader('Content-Type', 'text/plain');
//     return res.end('Method not implemented');
//   }
//   var file = path.join(dir, reqpath.replace(/\/$/, '/index.html'));
//   if (file.indexOf(dir + path.sep) !== 0) {
//     res.statusCode = 403;
//     res.setHeader('Content-Type', 'text/plain');
//     return res.end('Forbidden');
//   }
//   var type = mime[path.extname(file).slice(1)] || 'text/plain';
//   var s = fs.createReadStream(file);
//   s.on('open', function () {
//     res.setHeader('Content-Type', type);
//     s.pipe(res);
//   });
//   s.on('error', function () {
//     res.setHeader('Content-Type', 'text/plain');
//     res.statusCode = 404;
//     res.end('Not found');
//   });
// });

// static_server.listen(process.env.HTTP_IMG_PORT, function () {
//   //console.log('Listening on port ' + process.env.HTTP_IMG_PORT);
// });



