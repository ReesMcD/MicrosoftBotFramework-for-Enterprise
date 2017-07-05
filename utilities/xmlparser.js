var parseString = require('xml2js').parseString;

var parseXML = function (xml) {
    this.xml = xml
    this.parse = parseString(this.xml, function (err, result) {
        return result;
    });
} 

module.exports = parseXML;