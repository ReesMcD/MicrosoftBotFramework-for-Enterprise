var xml2js = require('xml2js');

var XMLParser = function(xml) {
    this.xml = xml;
    this.parser = new xml2js.Parser();
    this.stringParser = this.parser.parseString(this.xml, function(err, result) {
        return result;
    });
};

module.exports = XMLParser;