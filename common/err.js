const moment = require('moment');

const chart = {};

module.exports = {
  E40001 : {code: 40001, message: 'System code. Please contact with your admin'},
  E40002 : {error: 40002, message: 'Role is incorrect systax. Please use [SA, AD, US, MA, EN]'},
  E40010 : {code: 40010, message: 'Basetime or type is incorrect. [day - power, month/year - energy]'},
  E40011 : {code: 40011, message: 'Username or passwork is incorrect'},
  E40012 : {code: 40012, message: 'There are no data in device data'},
  E40013 : {code: 40013, message: 'Device id is incorrect'},
  E40014 : {code: 40014, message: 'Can not find user. Maybe user id is incorrect'},
  E40015 : {code: 40015, message: 'Param \'access\' is incorrect. Please use in [true or false]'},
  E40016 : {code: 40016, message: 'There are no sites assigned for your user. Please contact with your admin'},
  E40017 : {code: 40017, message: 'Some fields is duplicated. Please change other fields. '},
  E40018 : {code: 40018, message: 'Password is must at list 3 characters'},
  E40019 : {code: 40019, message: 'Not authorized to access this resource. Please login again'},


  E40020 : {code: 40020, message: 'Email is incorrect'},
  E40021 : {code: 40021, message: 'Password is incorrect'},
  E40022 : {code: 40022, message: 'Unauthorized'},

  E40023 : {code: 40023, message: 'Invalid MongoDB ID'},


  // Domain
  E42000 : {code: 42000, message: 'The domain name is exist in database'},

  // Portfolio
  E43000 : {code: 43000, message: 'The portfolio name is exist in database'},
  E43001 : {code: 43001, message: 'No file uploaded. Please upload a file'},
  E43002 : {code: 43002, message: 'File too large. Please upload file with maximum size = 2MB'},
  E43003 : {code: 43003, message: 'Invalid file type. Please upload img file only'},
  E43004 : {code: 43004, message: 'Avatar Name Required'},

  // Site
  
  E40100 : {code: 40100, message: 'The site name is exist in database'},
  E40101 : {code: 40101, message: 'The site name is required'},
  E40102 : {code: 40102, message: 'The price is required'},
  E40103 : {code: 40103, message: 'The currency is required'},
  E40104 : {code: 40104, message: 'The status is incorrect'},

  E40200 : {code: 40200, message: 'The iot name is exist in database'},
  E40201 : {code: 40201, message: 'The iot name is required'},
  E40202 : {code: 40202, message: 'The iot code is required'},
  E40203 : {code: 40203, message: 'The site_id is required'},
  E40204 : {code: 40204, message: 'IOT Code is incorrect'},

  // Plant
  
  E44000 : {code: 44000, message: 'The plant name is exist in database'},


  //Device
  E40300 : {code: 40300, message: 'The device name is exist in database'},
  E40301 : {code: 40301, message: 'Device type is required'},

  E40305 : {code: 40305, message: 'Basetime is incorrect. [month or year]'},


  E40400 : {code: 40400, message: 'Can not find user'},


  E40500 : {code: 40500, message: 'Can not find device'},

  E40600 : {code: 40600, message: 'Can not find site'},

  E40700 : {code: 40700, message: 'Status event is incorrect'},
  E40701 : {code: 40701, message: 'Event type is incorrect'},

  // add
  E40800 : {code: 40800, message: 'Device is not active or dont have data'},

  //Report
  E41000 : {code: 41000, message: 'The distance between start date and end date is too far. Select data in 2 months range'},
  E41001 : {code: 41001, message: 'Too many requests from this IP, please try again after 10s'},
  E41002 : {code: 41002, message: '"Range" value is incorrect. Refer value [1, 7, 14, 30]'},

  //Admin_page
  E42001 : {code: 42001, message: 'Role is incorrect syntax. Please use others'},
  E42002 : {code: 42002, message: 'Can not find user | role | permission'},
  E42003 : {code: 42003, message: 'Role duplicated!'},
  E42004 : {code: 42004, message: 'Route name duplicated! Please choose other route!'},
  E42005 : {code: 42005, message: 'Portfolios do not contain all chosen sites'},
  E42006 : {code: 42006, message: 'Name or Code duplicated!'},
  E42007 : {code: 42007, message: 'Can not find Portfolio | Site | Plant | Device'},
  E42008 : {code: 42008, message: 'Derived Areas are already assigned!'},
  E42009 : {code: 42009, message: 'Derived Areas Existed! Cannot delete'},
  E42010 : {code: 42010, message: 'Cannot find IOT Gateway'},
  E42011 : {code: 42011, message: 'Protocol is used in some Device Models! Cannot delete'},
  E42012 : {code: 42012, message: 'Cannot find protocol'},
  E42013 : {code: 42013, message: 'Cannot find Inverter | Solar Panel'},
  E42014 : {code: 42014, message: 'IOT Devices is already assigned in this plant'},
  E42015 : {code: 42015, message: 'Devices is already assigned in other IOT device in this plant'},
  E42016 : {code: 42016, message: 'Config for each duplicated device is required'},
  E42017 : {code: 42017, message: 'Function support Inverter type only'},
  E42018 : {code: 42018, message: 'Cannot find Iot - Plant connection'},
  E42019 : {code: 42019, message: 'Cannot find String'},
  E42020 : {code: 42020, message: 'Device Model is in used in some Devices! Cannot delete'},
  E42021 : {code: 42021, message: 'Solar Panel is in used in some Strings! Cannot delete'},
  E42022 : {code: 42022, message: 'IOT gateway is in used in some Iot-Plant connection! Cannot delete'},
  E42023 : {code: 42023, message: 'Can not find Supplier(s) | Customer(s)'},
  E42024 : {code: 42024, message: 'Supplier | Customer is in used in some Plant! Cannot delete'},
  E42025 : {code: 42025, message: 'Can not find Billing Configuration'},
  E42026 : {code: 42026, message: 'Can not find Billing Schedule'},
  E42027 : {code: 42027, message: 'Can not find Budget'},
  E42028 : {code: 42028, message: 'Invalid Date Type'},

  //Rule monitoring
  E43001 : {code: 43001, message: 'Can not find Rule'},
  E43002 : {code: 43002, message: 'Can not find Plant'},
  E43003 : {code: 43003, message: 'Rule name duplicated'},
  E43004 : {code: 43004, message: 'Choose at least 1 device'},
  E43005 : {code: 43005, message: 'Plant Rule requires no device'},
  E43006 : {code: 43006, message: 'Can not find Field'},
  E43007 : {code: 43007, message: 'Can not find Operator'},
  E43008 : {code: 43008, message: 'Invalid MongoDB ID'},
  E43009 : {code: 43009, message: 'Invalid Values'},
  E43010 : {code: 43010, message: 'Can not verify all Devices'},
  E43011 : {code: 43011, message: 'Can not verify all Recipients'},

}

