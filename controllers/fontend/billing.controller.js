const Plant = require('../../models/Plant.model')
const PlantPrice = require('../../models/Price3Plant.model')
const PlantInvoice = require('../../models/Invoice.model')
const error = require('../../common/err')
const to_vietnamese = require('../../common/convert/numtovietnamese');
const moment = require('moment')


const calculatePrice = (priceData) => {

    let kwhValueBT = priceData.map(value => value.kwh_bt).reduce((prev, next) => prev + next, 0)  // sum function
    let kwhValueCD = priceData.map(value => value.kwh_cd).reduce((prev, next) => prev + next, 0)  // sum function
    let kwhValueTD = priceData.map(value => value.kwh_td).reduce((prev, next) => prev + next, 0)  // sum function

    let totalkwhValue = kwhValueBT + kwhValueCD + kwhValueTD

    let unitPriceBT = priceData.length ? priceData[0]?.unit_price_bt : 0
    let unitPriceCD = priceData.length ? priceData[0]?.unit_price_cd : 0
    let unitPriceTD = priceData.length ? priceData[0]?.unit_price_td : 0

    let discountRatio = priceData.length ? priceData[0]?.discount : 0

    let vatRatio = priceData.length ? priceData[0]?.vat : 0

    const constantBT = 1
    const constantCD = 1
    const constantTD = 1

    //console.log(kwhValueBT + "-" + kwhValueCD + "-" + kwhValueTD)

    const priceBT = kwhValueBT * unitPriceBT
    const priceCD = kwhValueCD * unitPriceCD
    const priceTD = kwhValueBT * unitPriceTD

    const totalPrice = priceBT + priceCD + priceTD

    let priceDiscount = parseInt(discountRatio * totalPrice / 100)

    let totalPriceNoVAT = totalPrice - priceDiscount

    const vatPrice = parseInt(totalPriceNoVAT * vatRatio / 100)

    const totalPricePayment = totalPriceNoVAT + vatPrice

    return {

        kwhValueBT: kwhValueBT,
        kwhValueCD: kwhValueCD,
        kwhValueTD: kwhValueTD,

        totalkwhValue: totalkwhValue,

        unitPriceBT: unitPriceBT,
        unitPriceCD: unitPriceCD,
        unitPriceTD: unitPriceTD,

        discountRatio: discountRatio,
        vatRatio: vatRatio,

        constantBT: constantBT,
        constantCD: constantCD,
        constantTD: constantTD,

        priceBT: priceBT,
        priceCD: priceCD,
        priceTD: priceTD,

        totalPrice: totalPrice,

        priceDiscount: priceDiscount,
        totalPriceNoVAT: totalPriceNoVAT,
        vatPrice: vatPrice,
        totalPricePayment: totalPricePayment
    }
}

const formatCash = (value, currency = 'VNĐ') => {
    value = value.toString();
    return value.split('').reverse().reduce((prev, next, index) => {
        return ((index % 3) ? next : (next + ',')) + prev
    })
}
const formatNum = (value) => {
    value = value.toString();
    return value.split('').reverse().reduce((prev, next, index) => {
        return ((index % 3) ? next : (next + ',')) + prev
    })
}

function jsUcfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.getBilling = async (req, res) => {
    try {
        const plantId = req.params.id

        const startOfMonth = parseInt(moment(moment().startOf('month')).unix())
        const priceData = await PlantPrice.find({
            timestamp_unix: {
                $gte: startOfMonth
            },
            plant: plantId
        })
        const lastUpdate = priceData.length ? moment(priceData[priceData.length - 1].updated_at).format("DD-MM-YYYY HH:mm:ss") : moment().format("DD-MM-YYYY HH:mm:ss")

        const { kwhValueBT, kwhValueCD, kwhValueTD, totalkwhValue, unitPriceBT, discountRatio, vatRatio, unitPriceCD, unitPriceTD, constantBT, constantCD, constantTD, priceBT, priceCD, priceTD, totalPrice, priceDiscount, totalPriceNoVAT, vatPrice, totalPricePayment } = calculatePrice(priceData)

        let unitPriceBTFormat = formatCash(unitPriceBT)
        let unitPriceCDFormat = formatCash(unitPriceCD)
        let unitPriceTDFormat = formatCash(unitPriceTD)

        const priceBTFormat = formatCash(priceBT)
        const priceCDFormat = formatCash(priceCD)
        const priceTDFormat = formatCash(priceTD)

        const totalPriceFormat = formatCash(totalPrice)
        let priceDiscountFormat = "-" + formatCash(priceDiscount)
        const totalPriceFormatNoVAT = formatCash(totalPriceNoVAT)
        const vatPriceFormat = formatCash(vatPrice)
        const totalPricePaymentFormat = formatCash(totalPricePayment)

        //const inforDetail = priceData.length ? priceData[0].infors
        const dataSend = {
            "code": 200,
            "message": "OK",
            "data": {
                "from": moment(1657910500 * 1000).format('DD-MM-YYYY'),
                "to": moment().format('DD-MM-YYYY'),
                "lastUpdate": lastUpdate,
                "listTimeSlotData": [
                    {
                        "name": "Khung giờ bình thường",
                        "unitPrice": unitPriceBTFormat,
                        "constant": constantBT,
                        "oldKWhNumber": formatNum(60706),
                        "newKWhNumber": formatNum(91416),
                        "consumption": kwhValueBT,
                        "price": priceBTFormat
                    },
                    {
                        "name": "Khung giờ cao điểm",
                        "unitPrice": unitPriceCDFormat,
                        "constant": constantCD,
                        "oldKWhNumber": formatNum(25302),
                        "newKWhNumber": formatNum(35409),
                        "consumption": kwhValueCD,
                        "price": priceCDFormat,
                    },
                    {
                        "name": "Khung giờ thấp điểm",
                        "unitPrice": unitPriceTDFormat,
                        "constant": constantTD,
                        "oldKWhNumber": 0,
                        "newKWhNumber": 0,
                        "consumption": kwhValueTD,
                        "price": priceTDFormat,
                    }
                ],
                "discount": discountRatio,
                "vat": vatRatio,
                "totalConsumption": totalkwhValue,
                "totalPriceNoVAT": totalPriceFormat,
                "priceDiscount": priceDiscountFormat,
                "totalPricePaymentNoVAT": totalPriceFormatNoVAT,
                "priceVAT": vatPriceFormat,
                "totalPricePayment": totalPricePaymentFormat
            }
        }
        res.status(200).send(dataSend)
    } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}
module.exports.ConstTrend = async (req, res) => {
    try {
        const plantId = req.params.id
        const { from, to } = req.query
        let deltaMonth = (moment(to)).diff((moment(from)), 'months') + 1
        let startOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
        let tempMonth = from
        let rangeMonth = []
        for (let i = 0; i < deltaMonth + 1; i++) {
            rangeMonth.push(parseInt(moment(moment(tempMonth).startOf('month')).unix()))
            tempMonth = moment(tempMonth).add(1, 'month')
        }

        const priceData = await PlantPrice.find({
            timestamp_unix: {
                $gte: startOfMonth
            },
            plant: plantId
        })

        let listDataPriceByMonth = []
        for (let i = 0; i < rangeMonth.length - 1; i++) {
            let priceDataByMonth = priceData.filter(value => value.timestamp_unix >= rangeMonth[i] && value.timestamp_unix < rangeMonth[i + 1])
            const { totalPricePayment, priceDiscount } = calculatePrice(priceDataByMonth)
            const pricePaymentByMonth = parseFloat(parseFloat(totalPricePayment / 1000000).toFixed(2))
            const priceDiscountByMonth = parseFloat(parseFloat(priceDiscount / 1000000).toFixed(2))
            listDataPriceByMonth.push({ pricePayment: pricePaymentByMonth, priceDiscount: priceDiscountByMonth, timestamp: rangeMonth[i] })
        }
        let listDataPointPricePayment = []
        let listDataPointPriceDiscount = []

        for (let i = 0; i < listDataPriceByMonth.length; i++) {
            listDataPointPricePayment.push([((listDataPriceByMonth[i].timestamp) + 7 * 60 * 60) * 1000, listDataPriceByMonth[i].pricePayment])
            listDataPointPriceDiscount.push([((listDataPriceByMonth[i].timestamp) + 7 * 60 * 60) * 1000, listDataPriceByMonth[i].priceDiscount])
        }

        const dataSend = {
            "code": 200,
            "message": "OK",
            "data": {
                "from": from,
                "to": to,
                "series": [
                    {
                        "name": "Tiền thanh toán (Triệu VND)",
                        "unit": "Triệu VND",
                        "type": "column",
                        "data": listDataPointPricePayment
                    },
                    {
                        "name": "Giảm trừ chiết khấu (Triệu VND)",
                        "unit": "Triệu VND",
                        "type": "column",
                        "data": listDataPointPriceDiscount
                    }
                ]
            }
        }
        res.status(200).send(dataSend)
    } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}
module.exports.InvoiceList = async (req, res) => {
    try {
        const plantId = req.params.id
        const { from, to } = req.query
        let startOfMonth = parseInt(moment(moment(from).startOf('month')).unix())
        let timeToUnix = parseInt(moment(to).unix())
        const invoices = await PlantInvoice.find({
            timestamp_unix: {
                $gte: startOfMonth,
                $lte: timeToUnix
            },
            plant: plantId
        })
        console.log(invoices)
        let listDataInvoice = invoices.map(invoice => {
            let paymentPeriod = invoice.name
            let endDateOfPeriod = invoice.end_date
            let exportDate = moment(endDateOfPeriod).add(1, 'day').format("DD-MM-YYYY")
            //console.log(nowMonth + "-" + paymentPeriod)
            let invoiceId = invoice._id
            let priceDiscount = parseInt(invoice.total_price * invoice.discount / 100)
            let priceDiscountFormat = formatCash(priceDiscount)
            let pricePayment = parseInt(invoice.price_after_vat)
            let pricePaymentFormat = formatCash(pricePayment)
            return {
                active: 1,
                id: invoiceId,
                pricePayment: pricePaymentFormat,
                priceDiscount: priceDiscountFormat,
                paymentPeriod: paymentPeriod,
                dateExport: exportDate
            }
        })
        listDataInvoice = listDataInvoice.reverse()
        const dataSend = {
            "code": 200,
            "message": "OK",
            "data": {
                "from": from,
                "to": to,
                "listInvoice": listDataInvoice
            }
        }
        res.status(200).send(dataSend)
    } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}

module.exports.InvoiceDetail = async (req, res) => {
    try {
        const plantId = req.params.id
        const invoiceId = req.params.invoiceId

        const invoiceDetail = await PlantInvoice.findById({
            _id: invoiceId
        })

        let customerName = invoiceDetail.customer_name
        let customerId = invoiceDetail.customer_code
        let customerAddress = invoiceDetail.customer_address
        let customerEmail = invoiceDetail.customer_email
        let customerPhone = invoiceDetail.customer_phone
        let customerTax = invoiceDetail.customer_tax_number
        let addressUseElectric = invoiceDetail.customer_address_use
        let purpose = invoiceDetail.customer_purpose.split('\n')
        let electricType = invoiceDetail.customer_type

        let supplierName = invoiceDetail.supplier_name
        let supplierContact = invoiceDetail.supplier_contact
        let supplierGroup = invoiceDetail.supplier_group
        let supplierAddress = invoiceDetail.supplier_address
        let supplierTax = invoiceDetail.supplier_tax_number

        let startDateOfPeriod = invoiceDetail.start_date
        let endDateOfPeriod = invoiceDetail.end_date

        let startDateOfPeriodStr = moment(startDateOfPeriod).format("DD/MM/YYYY")
        let endDateOfPeriodStr = moment(endDateOfPeriod).format("DD/MM/YYYY")

        let numberDateOfPeriod = (moment(endDateOfPeriod)).diff((moment(startDateOfPeriod)), 'day') + 1
        //let periodInvoice = " Kỳ 3 - 2/2022 (8 ngày từ 16/02/2022 đến 23/02/2022 )"
        let periodInvoice = `${invoiceDetail.name} (${numberDateOfPeriod} ngày từ ${startDateOfPeriodStr} đến ${endDateOfPeriodStr})`

        let exportDate = moment(endDateOfPeriod).add(1, 'day').format("DD-MM-YYYY")
        let dateExpire = moment(endDateOfPeriod).add(5, 'day').format("DD-MM-YYYY")

        let totalConsumption = invoiceDetail.kwh_bt + invoiceDetail.kwh_cd + invoiceDetail.kwh_td
        totalConsumption = formatNum(totalConsumption)

        let priceBT = invoiceDetail.kwh_bt * invoiceDetail.unit_price_bt
        let priceCD = invoiceDetail.kwh_cd * invoiceDetail.unit_price_cd
        let priceTD = invoiceDetail.kwh_td * invoiceDetail.unit_price_td

        let discountRatio = invoiceDetail.discount

        let totalPrice = invoiceDetail.total_price

        let priceAfterDiscount = parseInt(invoiceDetail.price_after_discount)

        let priceDiscount = parseInt(totalPrice * discountRatio / 100)
        let taxVATRatio = invoiceDetail.vat
        let taxVATPrice = parseInt(invoiceDetail.price_after_discount * taxVATRatio / 100)

        let totalPayment = parseInt(invoiceDetail.price_after_vat)

        let totalPaymentByText = jsUcfirst(to_vietnamese(totalPayment.toString(), 'đồng'))

        let listDataConsumptionByTimeSlot = [
            {
                "name": "Khung giờ bình thường",
                "constant": 1,
                "oldKWhNumber": formatNum(60706),
                "newKWhNumber": formatNum(91416),
                "consumption": formatNum(invoiceDetail.kwh_bt),
            },
            {
                "name": "Khung giờ cao điểm",
                "constant": 1,
                "oldKWhNumber": formatNum(25302),
                "newKWhNumber": formatNum(35409),
                "consumption": formatNum(invoiceDetail.kwh_cd),
            },
            {
                "name": "Khung giờ thấp điểm",
                "constant": 1,
                "oldKWhNumber": 0,
                "newKWhNumber": 0,
                "consumption": formatNum(invoiceDetail.kwh_td),
            }
        ]

        let listDataPriceByTimeSlot = [
            {
                "name": "Khung giờ bình thường",
                "unitPrice": formatCash(invoiceDetail.unit_price_bt),
                "consumption": formatNum(invoiceDetail.kwh_bt),
                "price": formatCash(priceBT)
            },
            {
                "name": "Khung giờ cao điểm",
                "unitPrice": formatCash(invoiceDetail.unit_price_cd),
                "consumption": formatNum(invoiceDetail.kwh_cd),
                "price": formatCash(priceCD)
            },
            {
                "name": "Khung giờ thấp điểm",
                "unitPrice": formatCash(invoiceDetail.unit_price_td),
                "consumption": formatNum(invoiceDetail.kwh_td),
                "price": formatCash(priceTD)
            }
        ]
        //
        let dataSend = {
            "code": 200,
            "message": "OK",
            "data": {
                supplier: {
                    name: supplierName,
                    contact: supplierContact,
                    group: supplierGroup,
                    address: supplierAddress,
                    tax: supplierTax,
                },
                customer: {
                    name: customerName,
                    id: customerId,
                    address: customerAddress,
                    email: customerEmail,
                    phone: customerPhone,
                    tax: customerTax,
                    addressUseElectric: addressUseElectric,
                    purpose: purpose,
                    electricType: electricType,
                },
                expireDate: dateExpire,
                invoicePeriod: periodInvoice,
                exportDate: exportDate,
                consumptionByTimeSlots: listDataConsumptionByTimeSlot,
                totalConsumption: totalConsumption,
                priceByTimeSlots: listDataPriceByTimeSlot,
                totalPriceByConsumption: formatCash(totalPrice),
                discountRatio: discountRatio + "%",
                discountPrice: formatCash(priceDiscount),
                totalPriceNotInTax: formatCash(priceAfterDiscount),
                taxRatio: taxVATRatio + "%",
                taxPrice: formatCash(taxVATPrice),
                totalPrice: formatCash(totalPayment),
                totalPriceByText: totalPaymentByText
            }
        }
        res.status(200).send(dataSend)

    } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}
module.exports.BillingConfig = async (req, res) => {
    try {
        const billingSchemeTimeOffset = [
            {
                "id": 1,
                "label": "Monday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 2,
                "label": "Tuesday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 3,
                "label": "Wednesday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 4,
                "label": "Thursday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 5,
                "label": "Friday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 6,
                "label": "Saturday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
            {
                "id": 7,
                "label": "Sunday",
                "0": [10, 10],
                "1": [10, 10],
                "2": [10, 10],
                "3": [10, 10],
                "4": [20, 20],
                "5": [20, 20],
                "6": [20, 20],
                "7": [20, 20],
                "8": [20, 20],
                "9": [20, 30],
                "10": [30, 30],
                "11": [30, 20],
                "12": [20, 20],
                "13": [20, 20],
                "14": [20, 20],
                "15": [20, 20],
                "16": [20, 20],
                "17": [30, 30],
                "18": [30, 30],
                "19": [30, 30],
                "20": [20, 20],
                "21": [20, 20],
                "22": [10, 10],
                "23": [10, 10],
            },
        ]
        const tariff = [
            {
                "name": "Khung giờ cao điểm",
                "price": formatCash(2871),
                "level": 30,
                "information": "VAT: 8%",
            },
            {
                "name": "Khung giờ bình thường",
                "price": formatCash(1555),
                "level": 20,
                "information": "Billing Release Day: 01/01/2022",
            },
            {
                "name": "Khung giờ thấp điểm",
                "price": formatCash(1007),
                "level": 10,
                "information": "Billing Cycles: 2",
            },
        ]
        const dataSend = {
            "code": 200,
            "message": "OK",
            "data": {
                "id": "62af048ebe762e35fdee7922",
                "from" : "01/01/2022",
                "to": null,
                "nextId": null,
                "prevId": "62af2695e53e8d3c0e766396",
                "billingSchemeTimeOffset": billingSchemeTimeOffset,
                "tariff": tariff
            }

        }
        res.status(200).send(dataSend)
    } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}
module.exports.BillingConfigById  = async  (req, res) => {
    try {
        const { billingSchemeId } = req.params
        if (billingSchemeId === '62af2695e53e8d3c0e766396') {

            const billingSchemeTimeOffset = [
                {
                    "id": 1,
                    "label": "Monday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 2,
                    "label": "Tuesday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 3,
                    "label": "Wednesday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 4,
                    "label": "Thursday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 5,
                    "label": "Friday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 6,
                    "label": "Saturday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 7,
                    "label": "Sunday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 20],
                    "10": [20, 20],
                    "11": [20, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [20, 20],
                    "18": [20, 20],
                    "19": [20, 20],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
            ]
            const tariff = [
                {
                    "name": "Khung giờ cao điểm",
                    "price": formatCash(3000),
                    "level": 30,
                    "information": "VAT: 10%",
                },
                {
                    "name": "Khung giờ bình thường",
                    "price": formatCash(1500),
                    "level": 20,
                    "information": "Billing Release Day: 01/01/2021",
                },
                {
                    "name": "Khung giờ thấp điểm",
                    "price": formatCash(1000),
                    "level": 10,
                    "information": "Billing Cycles: 2",
                },
            ]
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "id": "62af2695e53e8d3c0e766396",
                    "from": "01/01/2021",
                    "to": "31/12/2021",
                    "nextId": "62af048ebe762e35fdee7922",
                    "prevId": null,
                    "billingSchemeTimeOffset": billingSchemeTimeOffset,
                    "tariff": tariff
                }

            }
            return res.status(200).send(dataSend)
        }
        if (billingSchemeId === '62af048ebe762e35fdee7922') {
            const billingSchemeTimeOffset = [
                {
                    "id": 1,
                    "label": "Monday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 2,
                    "label": "Tuesday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 3,
                    "label": "Wednesday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 4,
                    "label": "Thursday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 5,
                    "label": "Friday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 6,
                    "label": "Saturday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
                {
                    "id": 7,
                    "label": "Sunday",
                    "0": [10, 10],
                    "1": [10, 10],
                    "2": [10, 10],
                    "3": [10, 10],
                    "4": [20, 20],
                    "5": [20, 20],
                    "6": [20, 20],
                    "7": [20, 20],
                    "8": [20, 20],
                    "9": [20, 30],
                    "10": [30, 30],
                    "11": [30, 20],
                    "12": [20, 20],
                    "13": [20, 20],
                    "14": [20, 20],
                    "15": [20, 20],
                    "16": [20, 20],
                    "17": [30, 30],
                    "18": [30, 30],
                    "19": [30, 30],
                    "20": [20, 20],
                    "21": [20, 20],
                    "22": [10, 10],
                    "23": [10, 10],
                },
            ]
            const tariff = [
                {
                    "name": "Khung giờ cao điểm",
                    "price": formatCash(3000),
                    "level": 30,
                    "information": "VAT: 8%",
                },
                {
                    "name": "Khung giờ bình thường",
                    "price": formatCash(2000),
                    "level": 20,
                    "information": "Billing Release Day: 01/01/2022",
                },
                {
                    "name": "Khung giờ thấp điểm",
                    "price": formatCash(1000),
                    "level": 10,
                    "information": "Billing Cycles: 2",
                },
            ]
            const dataSend = {
                "code": 200,
                "message": "OK",
                "data": {
                    "id": "62af048ebe762e35fdee7922",
                    "from" : "01/01/2022",
                    "to": null,
                    "nextId": null,
                    "prevId": "62af2695e53e8d3c0e766396",
                    "billingSchemeTimeOffset": billingSchemeTimeOffset,
                    "tariff": tariff
                }

            }
            return res.status(200).send(dataSend)
        }
        } catch (err) {
        console.log(err)
        res.status(400).send(error.E40001)
    }
}
