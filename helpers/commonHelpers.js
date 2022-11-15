//Get next code of site, plant, device,... for creaing new one
module.exports.getCodeOfNextElement = (newestCode) => {
    let getPart = newestCode.replace(/[^\d.]/g, '');
    let num = parseInt(getPart); 
    return newestCode.replace(new RegExp(num), num + 1);
}