var parseString = require('xml2js').parseString;

var XMLParser = function(xml) {
    this.xml = xml;
    this.StringParser = parseString(this.xml, function (err, result) {
        return result;
    });
} 

module.exports = XMLParser;