const Plant = require('../../models/Plant.model')
const Device = require('../../models/Device.model')
const Site = require('../../models/Site.model')
const DeviceRawData = require('../../models/DeviceRawData.model')
const KwhDevice3 = require('../../models/KwhDevice3.model')
const SensorIrradiance = require('../../models/SensorDate.model')
const err = require('../../common/err')
const cache = require('../../service/cache/cacheServices')
const moment = require('moment')

module.exports.getPlantDetail = async (req, res) => {
    try {
        const plantId = req.params.id
        const plant = await Plant.findById({ _id: plantId })

        const data = {
            "code": 200,
            "message": "OK",
            "data": {
                "id": plant._id,
                "name": plant.name,
                "powerValue": plant.capacity,
                "powerUnit": "kWp",
                "coordinates": {
                    "lat": plant.lat,
                    "lng": plant.lng
                },
                "commissioningOn": "Jun 15 2022",
                "siteId": plant.site,
            },
        }
        res.status(200).send(data)
    } catch (error) {
        res.status(400).send(err.E40001)
    }
}
module.exports.ChartDetail = async (req, res) => {
    try {
        const plantId = req.params.id
        const plant = (await Plant.findOne({ _id: plantId }))
        plantCode = plant.code
        plantPerformanceRatioBudget = plant.performanceRatioBudget
        plantPArray = plant.pArray
        let plantBudgetSpecificYield = plant.budgetSpecificYield

        const { from, to, groupBy, dataType } = req.query
        let deltaMonth = (moment(to)).diff((moment(from)), 'months') + 1
        let deltaDay = (moment(to)).diff((moment(from)), 'day') + 1
        let timeFrom = Math.floor((new Date(from)).getTime() / 1000)
        let timeTo = Math.floor((new Date(to)).getTime() / 1000)
        const handleMockData = (data, group) => {
            let listDataProduction = []
            let listDataIrradiation = []
            for (let i = 0; i < data.length; i++) {
                let pointValueProduction = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].acturalProduction]
                let pointValueIrradiation = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].acturalIrradiation]
                listDataProduction.push(pointValueProduction)
                listDataIrradiation.push(pointValueIrradiation)
            }
            return {
                production: listDataProduction,
                irradiation: listDataIrradiation,
                productionUnit: (group === "hour") ? "KW" : "KWh",
                irradiationUnit: (group === "hour") ? "W/m2" : "Wh/m2",
                typeChart: (group === "hour") ? "areaspline" : "column",
                group: group
            }
        }
       
        const actual_production_and_irradiation = async (type) => {
            let data = []
            let dataDailyIrradtn = []
            switch (type) {
                case 'hour':
                    data = await DeviceRawData.find({
                        'timestamp_unix': {
                            $gte: timeFrom,
                            $lte: timeTo
                        },
                        type: 'inverter',
                        'plant': plantCode
                    }).sort({ timestamp_unix: -1 })
                    dataDailyIrradtn = await DeviceRawData.find({
                        'timestamp_unix': {
                            $gte: timeFrom,
                            $lte: timeTo
                        },
                        type: 'smp3',
                        'plant': plantCode
                    }).sort({ timestamp_unix: -1 })
                    let latestTime = data.length ? data[0].timestamp_unix : timeTo
                    let oldestTime = data.length ? data[data.length - 1].timestamp_unix : timeFrom
                    let tempTime = latestTime
                    let listTime = []

                    while (tempTime > oldestTime) {
                        let tempTimeTo = tempTime
                        let tempTimeFrom = tempTime - 900
                        listTime.push({
                            tempTimeFrom: tempTimeFrom,
                            tempTimeTo: tempTimeTo
                        })
                        tempTime = tempTime - 900
                    }
                    listTime = listTime.sort((a, b) => a.tempTimeFrom - b.tempTimeFrom);
                    let listDataByHours = []
                    //console.log(data)
                    for (let i = 0; i < listTime.length; i++) {
                        //console.log(listTime[i].tamFrom + "---------->" + listTime[i].tamTo)
                        let dataByMinuteofSite = data.filter(value => (value.timestamp_unix > listTime[i].tempTimeFrom && value.timestamp_unix <= listTime[i].tempTimeTo))
                        let dataIrradiatnByMinuteofSite = dataDailyIrradtn.filter(value => (value.timestamp_unix > listTime[i].tempTimeFrom && value.timestamp_unix <= listTime[i].tempTimeTo))
                        let totalKw = 0
                        let totalIrradce = 0
                        for (let j = 0; j < dataByMinuteofSite.length; j++) {
                            let kwValue = dataByMinuteofSite[j].paras.find(value => Object.keys(value)[0] === 'KiloWatts')?.KiloWatts
                            totalKw = totalKw + kwValue
                        }
                        for (let j = 0; j < dataIrradiatnByMinuteofSite.length; j++) {

                            let iIrradceValue = dataIrradiatnByMinuteofSite[j].paras.find(value => Object.keys(value)[0] === 'totalIrradce')?.totalIrradce
                            let iIrradceValueW = iIrradceValue
                            totalIrradce = totalIrradce + iIrradceValueW
                        }
                        listDataByHours.push({
                            timestamp: listTime[i].tempTimeTo,
                            acturalProduction: parseFloat(parseFloat(totalKw).toFixed(2)),
                            acturalIrradiation: totalIrradce,
                        })
                    }
                    return handleMockData(listDataByHours, 'hour')
                case 'date':
                    let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
                    let tempDay = from
                    let rangeDay = []
                    for (let i = 0; i < deltaDay; i++) {
                        rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                        tempDay = moment(tempDay).add(1, 'day')
                    }
                    //console.log(rangeDay)
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    dataDailyIrradtn = await SensorIrradiance.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    let listDataInverterbyDay = []
                    for (let i = 0; i < rangeDay.length; i++) {
                        const filterDataInverterbyDay = data.filter(value => value.timestamp_unix === rangeDay[i])
                        const irradiationData = (dataDailyIrradtn.filter(value => value.timestamp_unix === rangeDay[i]))
                        const irradiationDataByDayWh = irradiationData.length ? parseFloat(parseFloat(irradiationData[0]?.daily_irradtn * 1000).toFixed(0)) : 0
                        let productionByDay = filterDataInverterbyDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        listDataInverterbyDay.push({ acturalProduction: productionByDay, acturalIrradiation: irradiationDataByDayWh, timestamp: rangeDay[i] })
                    }
                    //console.log(listDataInverterbyDay)
                    return handleMockData(listDataInverterbyDay, 'date')
                case 'month':
                    let firstTimeOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
                    let tempMonth = from
                    let rangeMonth = []
                    for (let i = 0; i < deltaMonth + 1; i++) {
                        rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
                        tempMonth = moment(tempMonth).add(1, 'month')
                    }
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    dataDailyIrradtn = await SensorIrradiance.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    let listDataInverterbyMonth = []
                    for (let i = 0; i < rangeMonth.length - 1; i++) {
                        const filterDataInverterbyMonth = data.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
                        const irradiationData = dataDailyIrradtn.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
                        let irradiationDataByMonthWh = irradiationData.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0) * 1000 // sum function
                        irradiationDataByMonthWh = parseFloat(parseFloat(irradiationDataByMonthWh).toFixed(0))
                        let productionByMonth = filterDataInverterbyMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function

                        listDataInverterbyMonth.push({ acturalProduction: productionByMonth, acturalIrradiation: irradiationDataByMonthWh, timestamp: rangeMonth[i] })
                    }
                    return handleMockData(listDataInverterbyMonth, 'month')
                default:
                    break;
            }
        }
        const handleMockDataPlantPR = (data, group) => {
            let listDataPlantPR = []
            let listDataPlantPRbudget = []
            let listDataWeatherCorrected = []
            for (let i = 0; i < data.length; i++) {
                let pointValuePR = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].plantPR]
                let pointValuePRBudget = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].plantPRBudget]
                let pointValueWeatherCorrected = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].weatherCorrected]

                listDataPlantPR.push(pointValuePR)
                listDataPlantPRbudget.push(pointValuePRBudget)
                listDataWeatherCorrected.push(pointValueWeatherCorrected)

            }
            return {
                performanceRatio: listDataPlantPR,
                performanceRatioBudget: listDataPlantPRbudget,
                weatherCorrected: listDataWeatherCorrected,
                unit: '%',
                typeChart: 'line',
                group: group
            }
        }
        const handleMockDataSpecificYield = (data, group) => {
            let listSpecificYield = []
            let listBudgetSpecificYield = []

            for (let i = 0; i < data.length; i++) {
                let pointValueSpecificYield = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].plantSpecificYield]
                let pointValueBudgetSpecificYield = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].plantBudgetSpecificYield]

                listSpecificYield.push(pointValueSpecificYield)
                listBudgetSpecificYield.push(pointValueBudgetSpecificYield)
            }
            return {
                specificYield: listSpecificYield,
                budgetSpecificYield: listBudgetSpecificYield,
                unit: 'kWh/kWp',
                typeChart: 'line',
                group: group
            }
        }
        const performance_ratio_tracking = async (type) => {
            let data = []
            let dataDailyIrradtn = []
            let listDataPR = []
            switch (type) {
                case 'date':
                    let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
                    let tempDay = from
                    let rangeDay = []
                    for (let i = 0; i < deltaDay; i++) {
                        rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                        tempDay = moment(tempDay).add(1, 'day')
                    }
                    //console.log(rangeDay)
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    dataDailyIrradtn = await SensorIrradiance.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })

                    for (let i = 0; i < rangeDay.length; i++) {
                        const filterDataInverterbyDay = data.filter(value => value.timestamp_unix === rangeDay[i])
                        const irradiationData = (dataDailyIrradtn.filter(value => value.timestamp_unix === rangeDay[i]))
                        const irradiationDataByDayWh = irradiationData.length ? irradiationData[0]?.daily_irradtn * 1000 : 0
                        let productionByDay = filterDataInverterbyDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        let plantPR = ((1000 * productionByDay) / (irradiationDataByDayWh * plantPArray)) * 100
                        plantPR = plantPR ? parseFloat(parseFloat(plantPR).toFixed(2)) : 0
                        let weatherCorrected = plantPR ? parseFloat(parseFloat(plantPR + 1).toFixed(2)) : 0
                        listDataPR.push({ plantPR: plantPR, plantPRBudget: plantPerformanceRatioBudget, weatherCorrected: weatherCorrected, timestamp: rangeDay[i] })
                    }
                    return handleMockDataPlantPR(listDataPR, 'date')
                case 'month':
                    let firstTimeOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
                    let tempMonth = from
                    let rangeMonth = []
                    for (let i = 0; i < deltaMonth + 1; i++) {
                        rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
                        tempMonth = moment(tempMonth).add(1, 'month')
                    }

                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    dataDailyIrradtn = await SensorIrradiance.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    for (let i = 0; i < rangeMonth.length - 1; i++) {
                        const filterDataInverterbyMonth = data.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
                        const irradiationData = dataDailyIrradtn.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
                        const irradiationDataByMonthWh = irradiationData.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0) * 1000 // sum function

                        let productionByMonth = filterDataInverterbyMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        let plantPR = ((1000 * productionByMonth) / (irradiationDataByMonthWh * plantPArray)) * 100
                        plantPR = plantPR ? parseFloat(parseFloat(plantPR).toFixed(2)) : 0
                        listDataPR.push({ plantPR: plantPR, plantPRBudget: plantPerformanceRatioBudget, timestamp: rangeMonth[i] })
                    }
                    //console.log(listDataPR)
                    return handleMockDataPlantPR(listDataPR, 'month')
                default:
                    break;
            }
        }
        const specific_yield = async (type) => {
            let data = []
            let listDataSpecificYield = []
            switch (type) {
                case 'date':
                    let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
                    let tempDay = from
                    let rangeDay = []
                    for (let i = 0; i < deltaDay; i++) {
                        rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                        tempDay = moment(tempDay).add(1, 'day')
                    }
                    //console.log(rangeDay)
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })

                    for (let i = 0; i < rangeDay.length; i++) {
                        const filterDataInverterbyDay = data.filter(value => value.timestamp_unix === rangeDay[i])

                        let productionByDay = filterDataInverterbyDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        let actualSpecificYield = parseFloat(parseFloat(productionByDay / plantPArray).toFixed(2))
                        listDataSpecificYield.push({ plantSpecificYield: actualSpecificYield, plantBudgetSpecificYield: plantBudgetSpecificYield, timestamp: rangeDay[i] })
                    }
                    return handleMockDataSpecificYield(listDataSpecificYield, 'date')
                case 'month':
                    let firstTimeOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
                    let tempMonth = from
                    let rangeMonth = []
                    for (let i = 0; i < deltaMonth + 1; i++) {
                        rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
                        tempMonth = moment(tempMonth).add(1, 'month')
                    }
                    //console.log(rangeMonth)
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })

                    for (let i = 0; i < rangeMonth.length - 1; i++) {
                        const filterDataInverterbyMonth = data.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])

                        let countDay = Array.from(new Set(filterDataInverterbyMonth.map(item => item.timestamp_unix))).length

                        let productionByMonth = filterDataInverterbyMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function

                        let actualSpecificYield = productionByMonth ? parseFloat(parseFloat((productionByMonth / countDay) / plantPArray).toFixed(2)) : 0

                        listDataSpecificYield.push({ plantSpecificYield: actualSpecificYield, plantBudgetSpecificYield: plantBudgetSpecificYield, timestamp: rangeMonth[i] })
                    }
                    return handleMockDataSpecificYield(listDataSpecificYield, 'month')
                default:
                    break;
            }
        }

        if (dataType === 'actual_production_and_irradiation') {
            const { production, irradiation, productionUnit, irradiationUnit, typeChart, group } = await actual_production_and_irradiation(groupBy)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "actual_production_and_irradiation",
                    "from": from,
                    "to": to,
                    "groupBy": group,
                    "series": [
                        {
                            "unit": irradiationUnit,
                            "type": "spline",
                            "data": irradiation
                        },
                        {
                            "unit": productionUnit,
                            "type": typeChart,
                            "data": production
                        }
                    ]
                }
            }
            res.status(200).send(dataSend)
        }

        if (dataType === 'inverter_performance') {
            const devices = (await Device.find({ plant: plantId, type: 'inverter' }))
            const devicesIrradiationSensorList = (await Device.find({ plant: plantId, type: 'smp3' }))
            const deviceCodeArray = devices.map(device => device.code)
            const deviceCodeIrradiationArray = devicesIrradiationSensorList.map(device => device.code)

            const nowTime = parseInt(moment(moment().startOf('day')).unix())

            let firstDayOfNowYear = moment().startOf('year').format('YYYY-MM-DD HH:mm:ss')
            let firstDayOfNowMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let firstTimeOfday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
            //let yesterday = moment(firstTimeOfday).add(-1, 'day')
            let firstDayOfNowYearhUnixTimeStamp = moment(firstDayOfNowYear).unix()
            let firstDayOfNowMonthUnixTimeStamp = moment(firstDayOfNowMonth).unix()

            const devicesData = await DeviceRawData.find({ device: { $in: deviceCodeArray } }).sort({ timestamp_unix: -1 }).sort({ device: 1 }).limit(50)
            const devicesInverterDataByDay = await KwhDevice3.find({ device_code: { $in: deviceCodeArray }, timestamp_unix: nowTime }).sort({ device_code: 1 })

            const inverterDevicesDataByYear = await KwhDevice3.find({
                timestamp_unix: {
                    $gte: firstDayOfNowYearhUnixTimeStamp,
                },
                device_code: { $in: deviceCodeArray }
            })

            const irradiationSensorDevicesDataByYear = await SensorIrradiance.find({
                device_code: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: firstDayOfNowYearhUnixTimeStamp,
                }
            })

            const inverterDevicesDataByMonth = await KwhDevice3.find({
                timestamp_unix: {
                    $gte: firstDayOfNowMonthUnixTimeStamp,
                },
                device_code: { $in: deviceCodeArray },
            })

            const irradiationSensorDevicesDataByMonth = await SensorIrradiance.find({
                device_code: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: firstDayOfNowMonthUnixTimeStamp,
                }
            })

            const deviceSensorIrradtnbyDay = await SensorIrradiance.find({ timestamp_unix: nowTime, plant: plantId })
            const irradiationDataByDay = deviceSensorIrradtnbyDay[0]?.daily_irradtn
            let inverterList = []
            let totalKw = 0
            for (let i = 0; i < deviceCodeArray.length; i++) {
                let pStringsOfInverter = (devices.find(value => value.code === deviceCodeArray[i])).pStrings
                let deviceObject = devicesData.find(data => data.device === deviceCodeArray[i])
                let FilterDataInverterbyDeviceByDay = devicesInverterDataByDay.filter(data => data.device_code === deviceCodeArray[i])
                let FilterDataInverterbyDeviceByMonth = inverterDevicesDataByMonth.filter(data => data.device_code === deviceCodeArray[i])
                let FilterDataInverterbyDeviceByYear = inverterDevicesDataByYear.filter(data => data.device_code === deviceCodeArray[i])

                let todayProductionOfInverter = FilterDataInverterbyDeviceByDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                let MonthToDateProductionOfInverter = FilterDataInverterbyDeviceByMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                let YearToDateProductionOfInverter = FilterDataInverterbyDeviceByYear.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function

                let irradiationDataByMonth = irradiationSensorDevicesDataByMonth.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0)  // sum function
                let irradiationDataByYear = irradiationSensorDevicesDataByYear.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0)  // sum function

                let toDayPerformanceRatio = irradiationDataByDay ? parseFloat(((1000 * todayProductionOfInverter) / (1000 * irradiationDataByDay * pStringsOfInverter)) * 100).toFixed(2) : parseFloat(0.00).toFixed(2)
                let monthToDatePerformanceRatio = irradiationDataByMonth ? parseFloat(((1000 * MonthToDateProductionOfInverter) / (1000 * irradiationDataByMonth * pStringsOfInverter)) * 100).toFixed(2) : parseFloat(0.00).toFixed(2)
                let yearToDatePerformanceRatio = irradiationDataByYear ? parseFloat(((1000 * YearToDateProductionOfInverter) / (1000 * irradiationDataByYear * pStringsOfInverter)) * 100).toFixed(2) : parseFloat(0.00).toFixed(2)

                let countDayOfMonth = Array.from(new Set(FilterDataInverterbyDeviceByMonth.map(item => item.timestamp_unix))).length
                let countDayOfYear = Array.from(new Set(FilterDataInverterbyDeviceByYear.map(item => item.timestamp_unix))).length
                let toDaySpecificYield = parseFloat(todayProductionOfInverter / pStringsOfInverter).toFixed(2)
                let monthToDateSpecificYield = parseFloat((MonthToDateProductionOfInverter / countDayOfMonth) / pStringsOfInverter).toFixed(2)
                let yearToDateSpecificYield = parseFloat((YearToDateProductionOfInverter / countDayOfYear) / pStringsOfInverter).toFixed(2)

                //toFix(2)
                todayProductionOfInverter = parseFloat(todayProductionOfInverter).toFixed(2)
                MonthToDateProductionOfInverter = parseFloat(MonthToDateProductionOfInverter).toFixed(2)
                YearToDateProductionOfInverter = parseFloat(YearToDateProductionOfInverter).toFixed(2)

                let deviceJson = {
                    id: deviceObject?.device,
                    status: deviceObject ? devices[i].status : 20,
                    name: devices[i].name,

                    toDayProduction: todayProductionOfInverter,
                    monthToDateProduction: MonthToDateProductionOfInverter,
                    yearToDateProduction: YearToDateProductionOfInverter,

                    toDayPerformanceRatio: toDayPerformanceRatio,
                    monthToDatePerformanceRatio: monthToDatePerformanceRatio,
                    yearToDatePerformanceRatio: yearToDatePerformanceRatio,

                    toDaySpecificYield: toDaySpecificYield,
                    monthToDateSpecificYield: monthToDateSpecificYield,
                    yearToDateSpecificYield: yearToDateSpecificYield,
                }
                inverterList.push(deviceJson)
            }
            totalKw = parseFloat(totalKw).toFixed(2)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "inverter_performance",
                    "total": devices.length,
                    "inverters": inverterList
                }
            }
            res.status(200).send(dataSend)
        }
        // API Inverter Monitoring
        if (dataType === 'inverter_monitoring') {
            const devices = (await Device.find({ plant: plantId, type: 'inverter' }))
            const deviceCodeArray = devices.map(device => device.code)
            const nowTime = parseInt(moment(moment().startOf('day')).unix())
            const devicesData = await DeviceRawData.find({ device: { $in: deviceCodeArray } }).sort({ timestamp_unix: -1 }).sort({ device: 1 }).limit(50)
            const devicesDataDay = await KwhDevice3.find({ device_code: { $in: deviceCodeArray }, timestamp_unix: nowTime }).sort({ device_code: 1 })
            const deviceSensorIrradtnbyDay = await SensorIrradiance.find({ timestamp_unix: nowTime, plant: plantId })
            const dailyIrradtnValue = deviceSensorIrradtnbyDay[0]?.daily_irradtn * 1000
            let inverterList = []
            let totalKw = 0
            let lastTime = ''
            for (let i = 0; i < deviceCodeArray.length; i++) {
                let deviceObject = devicesData.find(data => data.device === deviceCodeArray[i])
                let FilterDataInverterbyDevice = devicesDataDay.filter(data => data.device_code === deviceCodeArray[i])
                let todayProduction = FilterDataInverterbyDevice.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                todayProduction = parseFloat(todayProduction).toFixed(2)
                let pStringsOfInverter = (devices.find(value => value.code === deviceCodeArray[i]))?.pStrings
                lastTime = deviceObject ? moment(deviceObject?.timestamp_unix * 1000).format("HH:mm:ss") : "-"
                let totalProduction = deviceObject?.paras.find(value => Object.keys(value)[0] === 'kWH')?.kWH
                let totalProductionMW = parseFloat(totalProduction / 1000).toFixed(3)
                let kwValue = deviceObject?.paras.find(value => Object.keys(value)[0] === 'KiloWatts')?.KiloWatts
                kwValue = parseFloat(kwValue).toFixed(2)
                let tempValue = deviceObject?.paras.find(value => Object.keys(value)[0] === 'tmpCab')?.tmpCab
                tempValue = (tempValue) ? parseFloat(tempValue).toFixed(1) : "-"
                let continuousPower = pStringsOfInverter
                let energyYield = parseFloat(todayProduction / continuousPower).toFixed(2)
                let kwhValueOfInverterbyDay = parseFloat(todayProduction)
                let performanceRatio = dailyIrradtnValue ? parseFloat(((1000 * kwhValueOfInverterbyDay) / (dailyIrradtnValue * pStringsOfInverter)) * 100).toFixed(2) : parseFloat(0.00).toFixed(2)
                let plantLoadFactor = parseFloat(0.00).toFixed(2)
                let capacityUtilisationFactor = parseFloat(0.00).toFixed(2)
                totalKw = totalKw + parseFloat(kwValue)
                let deviceJson = {
                    id: deviceObject?.device,
                    status: deviceObject ? devices[i].status : 20,
                    name: devices[i].name,
                    currentPower: deviceObject ? kwValue : "0.00",
                    continuousPower: continuousPower,
                    todayProduction: deviceObject ? todayProduction : 0,
                    totalProduction: deviceObject ? totalProductionMW : "0.000",
                    performanceRatio: deviceObject ? performanceRatio : "0.00",
                    plantLoadFactor: deviceObject ? plantLoadFactor : "0.00",
                    capacityUtilisationFactor: deviceObject ? capacityUtilisationFactor : "0.00",
                    energyYield: deviceObject ? energyYield : "0.00",
                    temperature: deviceObject ? tempValue : "-",
                }
                inverterList.push(deviceJson)
            }
            totalKw = totalKw ? parseFloat(totalKw).toFixed(2) : 0
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "inverter_monitoring",
                    "total": devices.length,
                    "totalPower": totalKw ? totalKw : 0,
                    "unit": 'kW',
                    "lastTime": lastTime,
                    "inverters": inverterList
                }
            }
            res.status(200).send(dataSend)
        }
        if (dataType === 'specific_yield') {
            const { specificYield, budgetSpecificYield, unit, typeChart, group } = await specific_yield(groupBy)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "specific_yield",
                    "from": from,
                    "to": to,
                    "groupBy": group,
                    "series": [
                        {
                            "unit": unit,
                            "type": typeChart,
                            "data": specificYield
                        },
                        {
                            "unit": unit,
                            "type": typeChart,
                            "data": budgetSpecificYield
                        }
                    ]
                }
            }
            res.status(200).send(dataSend)
        }
        if (dataType === 'performance_ratio_tracking') {
            const { performanceRatio, performanceRatioBudget, weatherCorrected, unit, typeChart, group } = await performance_ratio_tracking(groupBy)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "performance_ratio_tracking",
                    "from": from,
                    "to": to,
                    "groupBy": group,
                    "series": [
                        {
                            "unit": unit,
                            "type": typeChart,
                            "data": performanceRatio
                        },
                        {
                            "unit": unit,
                            "type": typeChart,
                            "data": weatherCorrected
                        },
                        {
                            "unit": unit,
                            "type": typeChart,
                            "data": performanceRatioBudget
                        }
                    ]
                }
            }
            res.status(200).send(dataSend)
        }
        if (dataType === 'gauges_monitoring') {
            // new  code
            let firstDayOfNowMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let firstTimeOfday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
            let firstDayOfNowMonthUnixTimeStamp = moment(firstDayOfNowMonth).unix()
            let firstTimeOfdayUnixTimeStamp = moment(firstTimeOfday).unix()
            const dataOfMonth = await KwhDevice3.find({
                'timestamp_unix': {
                    $gte: firstDayOfNowMonthUnixTimeStamp,
                },
                'plant': plantId
            })
            const dataOfDay = await KwhDevice3.find({
                'timestamp_unix': {
                    $gte: firstTimeOfdayUnixTimeStamp,
                },
                'plant': plantId
            })
            let productionOfNowMonth = dataOfMonth?.map(value => value?.kwh).reduce((prev, next) => prev + next, 0); // sum function
            let productionOfNowDay = dataOfDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
            productionOfNowDay = parseFloat(parseFloat(productionOfNowDay).toFixed(2));
            productionOfNowMonth = parseFloat(productionOfNowMonth / 1000).toFixed(3) // don vi MWh
            //console.log(productionOfNowMonth)
            //console.log(productionOfNowDay)

            const devices = (await Device.find({ plant: plantId, type: 'inverter' }))
            const deviceCodeArray = devices.map(device => device.code)
            const nowTime = parseInt(moment(moment().startOf('day')).unix())
            const devicesData = await DeviceRawData.find({ device: { $in: deviceCodeArray } }).sort({ timestamp_unix: -1 }).sort({ device: 1 }).limit(50)
            const devicesDataDay = await KwhDevice3.find({ device_code: { $in: deviceCodeArray }, timestamp_unix: nowTime }).sort({ device_code: 1 })

            let totalKw = 0
            let totalKVar = 0
            let totalProduction = 0
            let lastTime = ''

            for (let i = 0; i < deviceCodeArray.length; i++) {
                let deviceObject = devicesData.find(data => data.device === deviceCodeArray[i])
                if (deviceObject) {
                    let FilterDataInverterbyDevice = devicesDataDay.filter(data => data.device_code === deviceCodeArray[i])
                    let todayProduction = FilterDataInverterbyDevice.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                    todayProduction = parseFloat(todayProduction).toFixed(2)
                    lastTime = deviceObject ? moment(deviceObject?.timestamp_unix * 1000).format("HH:mm:ss") : "-"
                    let totalProductionOfDevice = deviceObject?.paras.find(value => Object.keys(value)[0] === 'kWH')?.kWH
                    let kwValue = deviceObject?.paras.find(value => Object.keys(value)[0] === 'KiloWatts')?.KiloWatts
                    let kVarValue = deviceObject?.paras.find(value => Object.keys(value)[0] === 'kVAr')?.kVAr
                    console.log(kwValue)
                    console.log(deviceCodeArray[i])
                    console.log(deviceObject)
                    kwValue = parseFloat(kwValue).toFixed(1)
                    kVarValue = parseFloat(kVarValue).toFixed(1)
                    totalKw = totalKw + parseFloat(kwValue)
                    totalKVar = totalKVar + parseFloat(kVarValue)
                    totalProduction = totalProduction + parseFloat(totalProductionOfDevice)
                }
            }
            totalProduction = parseFloat(parseFloat(totalProduction / 1000000).toFixed(3))
            let totalPowerFactor = (totalKw / (Math.sqrt(totalKw * totalKw + totalKVar * totalKVar))) ? (totalKw / (Math.sqrt(totalKw * totalKw + totalKVar * totalKVar))) : 0
            totalPowerFactor = parseFloat(totalPowerFactor).toFixed(2)
            const installedCapacity = plantPArray
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "gauges_monitoring",
                    "lastTime": lastTime,
                    "currentPower": devicesData.length ? parseFloat(totalKw).toFixed(1) : "0.0",
                    "reactivePower": devicesData.length ? parseFloat(totalKVar).toFixed(1) : "0.0",
                    "totalPowerFactor": devicesData.length ? totalPowerFactor : "0.00",
                    "installedCapacity": installedCapacity,
                    "todayProduction": devicesData.length ? parseFloat(productionOfNowDay).toFixed(1) : 0.0,
                    "currentMonthProduction": devicesData.length ? productionOfNowMonth : "0.000",
                    "totalProduction": devicesData.length ? totalProduction : "0.000",
                }
            }
            res.status(200).send(dataSend)
        }
        if (dataType === "gauges_performance") {

            const key = `${plantCode}_gauges_performance`
            const dataOfKey = await cache.getByKey(key)
            if (dataOfKey) return res.status(200).send(dataOfKey)

            const devices = (await Device.find({ plant: plantId }))
            const devicesInverterList = devices.filter(value => value.type === 'inverter')
            const devicesIrradiationSensorList = devices.filter(value => value.type === 'smp3')
            const deviceCodeInverterArray = devicesInverterList.map(device => device.code)
            const deviceCodeIrradiationArray = devicesIrradiationSensorList.map(device => device.code)

            let firstDayOfNowYear = moment().startOf('year').format('YYYY-MM-DD HH:mm:ss')
            let firstDayOfNowMonth = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss')
            let firstTimeOfday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
            let yesterday = moment(firstTimeOfday).add(-1, 'day')
            let firstDayOfNowYearhUnixTimeStamp = moment(firstDayOfNowYear).unix()
            let firstDayOfNowMonthUnixTimeStamp = moment(firstDayOfNowMonth).unix()
            let firstTimeOfdayUnixTimeStamp = moment(firstTimeOfday).unix()
            let yesterdayUnixTimeStamp = moment(yesterday).unix()

            const inverterDevicesDataByDay = await DeviceRawData.find({
                device: { $in: deviceCodeInverterArray },
                timestamp_unix: {
                    $gte: firstTimeOfdayUnixTimeStamp,
                }
            })
            let totalkwValueOfInverterByDay = 0
            for (let i = 0; i < deviceCodeInverterArray.length; i++) {
                let filterInverterbyCode = inverterDevicesDataByDay.filter(value => value.device === deviceCodeInverterArray[i])
                let kwValueOfInverter = filterInverterbyCode.length ? filterInverterbyCode[filterInverterbyCode.length - 1]?.paras.find(value => Object.keys(value)[0] === 'kWH')?.kWH - filterInverterbyCode[0]?.paras.find(value => Object.keys(value)[0] === 'kWH')?.kWH : 0
                totalkwValueOfInverterByDay = totalkwValueOfInverterByDay + kwValueOfInverter
            }

            let lastTime = inverterDevicesDataByDay[inverterDevicesDataByDay.length - 1]?.timestamp_unix

            const irradiationSensorDevicesDataByDay = await DeviceRawData.find({
                device: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: firstTimeOfdayUnixTimeStamp,
                }
            })

            const inverterDevicesDataByYear = await KwhDevice3.find({
                timestamp_unix: {
                    $gte: firstDayOfNowYearhUnixTimeStamp,
                },
                plant: plantId
            })

            const irradiationSensorDevicesDataByYear = await SensorIrradiance.find({
                device_code: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: firstDayOfNowYearhUnixTimeStamp,
                }
            })

            const inverterDevicesDataByMonth = await KwhDevice3.find({
                timestamp_unix: {
                    $gte: firstDayOfNowMonthUnixTimeStamp,
                },
                plant: plantId
            })

            const irradiationSensorDevicesDataByMonth = await SensorIrradiance.find({
                device_code: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: firstDayOfNowMonthUnixTimeStamp,
                }
            })

            const inverterDevicesDataByYesterDay = await KwhDevice3.find({
                timestamp_unix: {
                    $gte: yesterdayUnixTimeStamp,
                    $lte: moment(moment(yesterdayUnixTimeStamp * 1000).endOf('day').format('YYYY-MM-DD HH:mm:ss')).unix()
                },
                plant: plantId
            })

            const irradiationSensorDevicesDataByYesterday = await DeviceRawData.find({
                device: { $in: deviceCodeIrradiationArray },
                timestamp_unix: {
                    $gte: yesterdayUnixTimeStamp,
                    $lte: moment(moment(yesterdayUnixTimeStamp * 1000).endOf('day').format('YYYY-MM-DD HH:mm:ss')).unix()
                }
            })


            let productionOfNowYear = inverterDevicesDataByYear.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
            let countDayOfYear = Array.from(new Set(inverterDevicesDataByYear.map(item => item.timestamp_unix))).length
            let irradiationDataByYear = irradiationSensorDevicesDataByYear.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0)  // sum function
            let specificYieldYearToDate = parseFloat((productionOfNowYear / countDayOfYear) / plantPArray).toFixed(2)
            let performanceRatioYearToDate = ((1000 * productionOfNowYear) / (1000 * irradiationDataByYear * plantPArray)) * 100
            performanceRatioYearToDate = parseFloat(performanceRatioYearToDate).toFixed(2)

            let productionOfNowMonth = inverterDevicesDataByMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
            let countDayOfMonth = Array.from(new Set(inverterDevicesDataByMonth.map(item => item.timestamp_unix))).length
            let irradiationDataByMonth = irradiationSensorDevicesDataByMonth.map(value => value.daily_irradtn).reduce((prev, next) => prev + next, 0)  // sum function
            let specificYieldMonthToDate = parseFloat((productionOfNowMonth / countDayOfMonth) / plantPArray).toFixed(2)
            let performanceRatioMonthToDate = ((1000 * productionOfNowMonth) / (1000 * irradiationDataByMonth * plantPArray)) * 100
            performanceRatioMonthToDate = parseFloat(performanceRatioMonthToDate).toFixed(2)

            let productionOfYesterday = inverterDevicesDataByYesterDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
            let irradtnValueByYesterday = irradiationSensorDevicesDataByYesterday[irradiationSensorDevicesDataByYesterday.length - 1]?.paras.find(value => Object.keys(value)[0] === 'dailyIrradtn')?.dailyIrradtn
            let specificYieldYesterday = parseFloat(productionOfYesterday / plantPArray).toFixed(2)
            let performanceRatioYesterday = irradtnValueByYesterday ? ((1000 * productionOfYesterday) / (1000 * irradtnValueByYesterday * plantPArray)) * 100 : 0
            performanceRatioYesterday = parseFloat(performanceRatioYesterday).toFixed(2)

            // console.log(productionOfYesterday)
            // console.log(irradtnValueByYesterday)
            // console.log(plantPArray)
            // console.log(performanceRatioYesterday)

            const productionOfNowDay = totalkwValueOfInverterByDay
            let irradtnValueByDay = irradiationSensorDevicesDataByDay.length ? irradiationSensorDevicesDataByDay[irradiationSensorDevicesDataByDay.length - 1]?.paras.find(value => Object.keys(value)[0] === 'dailyIrradtn')?.dailyIrradtn : 0
            let specificYieldToday = parseFloat(productionOfNowDay / plantPArray).toFixed(2)
            let performanceRatioToday = irradtnValueByDay ? ((1000 * productionOfNowDay) / (1000 * irradtnValueByDay * plantPArray)) * 100 : 0
            performanceRatioToday = parseFloat(performanceRatioToday).toFixed(2)

            // const testdb = await KwhDevice3.find({timestamp_unix: 1660496400 ,  "plant" : ("6294ed3c876f1480e8dac40a")})
            // console.log(testdb.map(value => value.kwh).reduce((prev, next) => prev + next, 0))


            let dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "gauges_performance",
                    "lastTime": moment(lastTime * 1000).format("HH:mm:ss"),
                    "specificYieldToday": specificYieldToday,
                    "specificYieldYesterday": specificYieldYesterday,
                    "specificYieldMonthToDate": specificYieldMonthToDate,
                    "specificYieldYearToDate": specificYieldYearToDate,
                    "performanceRatioToday": performanceRatioToday,
                    "performanceRatioYesterday": performanceRatioYesterday,
                    "performanceRatioMonthToDate": performanceRatioMonthToDate,
                    "performanceRatioYearToDate": performanceRatioYearToDate
                }
            }
            cache.setWithTime(key, dataSend, 60)
            res.status(200).send(dataSend)
        }
        // dailyIO
        if (dataType === 'daily_io_diagram') {
            let type
            console.log(deltaMonth)
            switch (true) {
                case deltaDay <= 31:
                    type = 'last_30day'
                    break;
                case deltaDay > 31 && deltaMonth < 12:
                    type = 'this_year'
                    break;
                case deltaMonth == 12:
                    type = 'last_12month'
                    break;
                default:
                    break;
            }
            console.log(type)
            const key = `${plantCode}_daily_io_diagram_${type}`
            const dataOfKey = await cache.getByKey(key)
            if (dataOfKey) return res.status(200).send(dataOfKey)

            const devices = (await Device.find({ plant: plantId, type: 'inverter' }))
            const devicesIrradiationSensorList = (await Device.find({ plant: plantId, type: 'smp3' }))
            const deviceCodeArray = devices.map(device => device.code)
            const deviceCodeIrradiationArray = devicesIrradiationSensorList.map(device => device.code)
            let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
            let tempDay = from
            let rangeDay = []
            for (let i = 0; i < deltaDay; i++) {
                rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                tempDay = moment(tempDay).add(1, 'day')
            }
            const devicesInverterDataByDay = await KwhDevice3.find({
                device_code: { $in: deviceCodeArray },
                timestamp_unix: {
                    $gte: firstTimeOfDay,
                    $lte: timeTo
                }
            }).sort({ device_code: 1 })
            const deviceSensorIrradtnbyDay = await SensorIrradiance.find({
                timestamp_unix: {
                    $gte: firstTimeOfDay,
                    $lte: timeTo
                },
                plant: plantId
            })

            let seriesChartListinverter = []

            for (let i = 0; i < deviceCodeArray.length; i++) {

                let pointValueOfInverter = []
                let tooltip = []
                for (let j = 0; j < rangeDay.length; j++) {

                    let FilterDataInverterbyDeviceByDay = devicesInverterDataByDay.filter(data => data.device_code === deviceCodeArray[i] && data.timestamp_unix === rangeDay[j])

                    let todayProductionOfInverter = FilterDataInverterbyDeviceByDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function

                    let findirradiationDataByDay = deviceSensorIrradtnbyDay.filter(data => data.timestamp_unix === rangeDay[j])

                    let irradiationDataByDay = findirradiationDataByDay.length ? findirradiationDataByDay[0]?.daily_irradtn : 0

                    pointValueOfInverter.push([irradiationDataByDay, todayProductionOfInverter])
                    let dateString = moment(rangeDay[j] * 1000).format("YYYY/MM/DD")
                    tooltip.push(dateString)
                }
                let deviceListWithPoint = {
                    id: devices[i].code,
                    name: devices[i].name,
                    tooltip: tooltip,
                    data: pointValueOfInverter
                }
                seriesChartListinverter.push(deviceListWithPoint)
            }
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "daily_io_diagram",
                    "from": from,
                    "to": to,
                    "series": seriesChartListinverter
                }
            }
            cache.setWithTime(key, dataSend, 60)
            res.status(200).send(dataSend)
        }
        if (dataType === 'string_monitoring') {
            const stingNum = 20
            const devices = (await Device.find({ plant: plantId, type: 'inverter' }))
            const devicesName = devices.map(device => device.name)
            const deviceCodeArray = devices.map(device => device.code)
            const inverterData = await DeviceRawData.find({ device: { $in: deviceCodeArray } }).sort({ timestamp_unix: -1 }).sort({ device: 1 }).limit(devices.length + 10)
            let point = []
            for (let i = 0; i < deviceCodeArray.length; i++) {
                let parasDataOfInverter = (inverterData[i]?.paras !== undefined) ? inverterData[i]?.paras : []
                //console.log(parasDataOfInverter)
                let stringAmpeData = parasDataOfInverter.filter(value => Object.keys(value)[0].indexOf("PVampe") !== -1)
                stringAmpeData = stringAmpeData.sort((a, b) => parseInt(Object.keys(a)[0].replace('PVampe', '')) - parseInt(Object.keys(b)[0].replace('PVampe', '')));
                for (let j = 0; j < stringAmpeData.length; j++) {
                    let stringName = stringAmpeData[j]
                    let stringIndex = parseInt(Object.keys(stringAmpeData[j])[0].replace('PVampe', '')) - 1
                    let stringAmpeValue = Object.values(stringName)[0]
                    point.push([stringIndex, i, stringAmpeValue])
                    // console.log(stringName)
                    // console.log(stringIndex)
                    // console.log(stringAmpeValue)          
                }

            }
            console.log(point)
            let stringNameArray = []
            for (let i = 0; i < stingNum; i++) {
                stringNameArray.push(`STR#${i + 1}`)
            }
            let points = []
            for (let inv = 0; inv < 10; inv++) {
                for (let string = 0; string < 12; string++) {
                    let ampe = parseFloat(parseFloat((Math.random() * (8.81 - 8.41)) + 8.41).toFixed((2)))
                    let point = [string, inv, ampe]
                    points.push(point)
                }
            }
            points[3] = [
                3,
                0,
                4.55
            ]
            points[13] = [
                1,
                1,
                6.67
            ]
            points[24] = [
                0,
                2,
                10.23
            ]
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "string_monitoring",
                    "groupBy": null,
                    "xAxis": {
                        "categories": stringNameArray
                    },
                    "yAxis": {
                        "categories": devicesName
                    },
                    "unixLegend": "A",
                    "series": [
                        {
                            "unit": "A",
                            "type": null,
                            "data": point
                        }]
                }
            }
            res.status(200).send(dataSend)
        }
        const actual_production_vs_budget_production = async (type) => {
            let data = []
            switch (type) {
                case 'date':
                    let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
                    let tempDay = from
                    let rangeDay = []
                    for (let i = 0; i < deltaDay; i++) {
                        rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                        tempDay = moment(tempDay).add(1, 'day')
                    }
                    //console.log(rangeDay)
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfDay,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    let listDataInverterbyDay = []
                    for (let i = 0; i < rangeDay.length; i++) {
                        const filterDataInverterbyDay = data.filter(value => value.timestamp_unix === rangeDay[i])
                        let productionByDay = filterDataInverterbyDay.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        let budgetProductionByDay = 3500
                        listDataInverterbyDay.push({ acturalProduction: productionByDay, budgetProduction: budgetProductionByDay, timestamp: rangeDay[i] })
                    }
                    return handleMockDataActualVsBudgetProduction(listDataInverterbyDay, 'date')
                case 'month':
                    let firstTimeOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
                    let tempMonth = from
                    let rangeMonth = []
                    for (let i = 0; i < deltaMonth + 1; i++) {
                        rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
                        tempMonth = moment(tempMonth).add(1, 'month')
                    }
                    data = await KwhDevice3.find({
                        'timestamp_unix': {
                            $gte: firstTimeOfMonth,
                            $lte: timeTo
                        },
                        'plant': plantId
                    })
                    let listDataInverterbyMonth = []
                    for (let i = 0; i < rangeMonth.length - 1; i++) {
                        const filterDataInverterbyMonth = data.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
                        let productionByMonth = filterDataInverterbyMonth.map(value => value.kwh).reduce((prev, next) => prev + next, 0); // sum function
                        let budgetProductionByMonth = parseFloat(parseFloat((Math.random() * (60640 - 60400)) + 60400).toFixed((0)))
                        listDataInverterbyMonth.push({ acturalProduction: productionByMonth, budgetProduction: budgetProductionByMonth, timestamp: rangeMonth[i] })
                    }

                    return handleMockDataActualVsBudgetProduction(listDataInverterbyMonth, 'month')
                default:
                    break;
            }
        }
        const handleMockDataActualVsBudgetProduction = (data, group) => {
            let listDataProduction = []
            let listDataBudgetProduction = []
            for (let i = 0; i < data.length; i++) {
                let pointValueProduction = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].acturalProduction]
                let pointBudgetProduction = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].budgetProduction]
                listDataProduction.push(pointValueProduction)
                listDataBudgetProduction.push(pointBudgetProduction)
            }
            return {
                production: listDataProduction,
                budgetProduction: listDataBudgetProduction,
                unit: 'KWh',
                group: group
            }
        }
        if (dataType === 'actual_production_vs_budget_production') {
            const { production, budgetProduction, unit, group } = await actual_production_vs_budget_production(groupBy)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "actual_production_vs_budget_production",
                    "from": from,
                    "to": to,
                    "groupBy": group,
                    "series": [
                        {
                            "name": 'AC Energy (Kwh)',
                            "unit": unit,
                            "type": "column",
                            "data": production
                        },
                        {
                            "name": 'Budget Production (Kwh)',
                            "unit": unit,
                            "type": 'spline',
                            "data": budgetProduction
                        }
                    ]
                }
            }
            res.status(200).send(dataSend)
        }
        if (dataType === 'carbon_offset') {
            const carbon_offset = async (type) => {
                switch (type) {
                    case 'date':
                        let firstTimeOfDay = parseInt(moment(moment(from).startOf('day')).unix())
                        let tempDay = from
                        let rangeDay = []
                        for (let i = 0; i < deltaDay; i++) {
                            rangeDay.push(parseInt(moment(moment(tempDay).startOf('day')).unix()))
                            tempDay = moment(tempDay).add(1, 'day')
                        }
                        let listCarbonByDay = []
                        for (let i = 0; i < rangeDay.length; i++) {
                            if (rangeDay[i] >= 1655312400) {
                                let carbonByDay = parseFloat(parseFloat((Math.random() * (550 - 200)) + 200).toFixed((0)))
                                listCarbonByDay.push({ carbon: carbonByDay, timestamp: rangeDay[i] })
                            } else {
                                listCarbonByDay.push({ carbon: 0, timestamp: rangeDay[i] })
                            }
                        }
                        return handleMockDataCarbon(listCarbonByDay, 'date')
                    case 'month':
                        let firstTimeOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
                        let tempMonth = from
                        let rangeMonth = []
                        for (let i = 0; i < deltaMonth + 1; i++) {
                            rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
                            tempMonth = moment(tempMonth).add(1, 'month')
                        }
                        let listCarbonByMonth = []
                        for (let i = 0; i < rangeMonth.length - 1; i++) {
                            let carbonByMonth = parseFloat(parseFloat((Math.random() * (13642 - 8932)) + 8932).toFixed((0)))
                            if (rangeMonth[i] >= 1654016400) {
                                listCarbonByMonth.push({ carbon: carbonByMonth, timestamp: rangeMonth[i] })
                            } else {
                                listCarbonByMonth.push({ carbon: 0, timestamp: rangeMonth[i] })
                            }
                        }
                        return handleMockDataCarbon(listCarbonByMonth, 'month')
                    default:
                        break;
                }
            }
            const handleMockDataCarbon = (data, group) => {
                let listDataCarbon = []
                for (let i = 0; i < data.length; i++) {
                    let pointValueCarbon = [((data[i].timestamp) + 7 * 60 * 60) * 1000, data[i].carbon]
                    listDataCarbon.push(pointValueCarbon)
                }
                return {
                    carbon: listDataCarbon,
                    unit: 'Kg',
                    group: group
                }
            }
            const { carbon, unit, group } = await carbon_offset(groupBy)
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "dataType": "carbon_offset",
                    "from": from,
                    "to": to,
                    "groupBy": group,
                    "series": [
                        {
                            "name": 'Carbon offset (Kg)',
                            "unit": unit,
                            "type": "column",
                            "data": carbon
                        }
                    ]
                }
            }
            res.status(200).send(dataSend)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(err.E40001)
    }
}
