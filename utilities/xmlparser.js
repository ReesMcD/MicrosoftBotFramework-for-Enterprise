var xml2js = require('xml2js'),
    fs = require('fs');

var XMLParser = function(xml = null, filename = null) {
    this.xml = xml;
    this.xml_file = filename;

    this.StringParser = xml2js.parseString(this.xml, function (err, result) {
        return result;
    });

    this.FileParser = function() {
        var parser = new xml2js.Parser();
        if (this.xml_file != null) {
            fs.readFile(this.xml_file, function (err, data) {
                parser.parseString(data, function (err, result) {
                    return JSON.stringify(result);
                });
            });
        } else {
            return null;
        }
    }
} 

module.exports = XMLParser;