var https = require("https");
var request = require('request');
var http = require('http');
var express = require('express');




var authentication = 'AAXLguru:12345';

var headers = {
  'SoapAction':'CUCM:DB ver=11.5',
  'Authorization': 'Basic ' + new Buffer(authentication).toString('base64'),
  'Content-Type': 'text/xml; charset=utf-8'
};


var options = {
  url: 'https://192.168.10.80/axl/',
  //host: '192.168.10.80',        // The IP Address of the Communications Manager Server
  //port: 443,                  // Clearly port 443 for SSL -- I think it's the default so could be removed
  //path: '/axl/',              // This is the URL for accessing axl on the server
  method: 'POST',             // AXL Requires POST messages
  headers: headers,           // using the headers we specified earlier
  rejectUnauthorized: false   // required to accept self-signed certificate
};

// noch statsiche Definition cgpn - device
var devices = {
  300: 'SEPDCEB94BD21B2',
  41150: 'SEPDCEB94BD21F5',
};


// express

var app = express();
var port = process.env.PORT || 3000;

// default page, hello :)
app.get('/', function(req, res) {
    var body = 'Hello World';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);

});

// hglog page
app.get('/hglog', function(req, res) {
    var query = require('url').parse(req.url,true).query;
    var cdpn = query.cdpn;
    var cgpn = query.cgpn;
    //var bodyast = 'was geben wir zurueck';
    //res.setHeader('Content-Type', 'text/plain');
    //res.setHeader('Content-Length', Buffer.byteLength(bodyast));
    //res.end(bodyast);
    //debug:
    //console.log(cgpn,cdpn)





var command, bodyast = null
// log device on or off
if (cdpn == '*88*') {
  command = "Off";
  bodyast = 'your device has been logged off.';
}
else if (cdpn == '*77*') {
  command = "On";
  bodyast = 'your device has been logged on.';
}
// Bedingung nicht nötig, wird von Asterisk abgefangen
//else {
//  console.log("Usage: hglog <state>\nstate: off -> *88*, on -> *77*")
//  process.exit(0)
//}


// list devices message
var listdev = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/11.5">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
   ' <axl:listPhone sequence="">' +
         '<searchCriteria>' +
               '<name>' + devices[cgpn] + '</name>' +
          '</searchCriteria>' +
          '<returnedTags>' +
               '<name/>' +
               '<model/>' +
               '<hlogStatus/>' +
      '</returnedTags>' +
      '</axl:listPhone>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>';

// huntgroup logon/logoff message
var hglog = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/11.5">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
      '<axl:updatePhone sequence="">' +
        '<name>' + devices[cgpn] + '</name>' +
          '<hlogStatus>' + command + '</hlogStatus>' +
        '</axl:updatePhone>' +
   '</soapenv:Body>' +
   '</soapenv:Envelope>';


// reset message
var reset = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:axl="http://www.cisco.com/AXL/API/11.5">' +
   '<soapenv:Header/>' +
   '<soapenv:Body>' +
      '<axl:doDeviceReset sequence="">' +
        '<deviceName>' + devices[cgpn] + '</deviceName>' +
          '<isHardReset>false</isHardReset>' +
        '</axl:doDeviceReset>' +
   '</soapenv:Body>' +
'</soapenv:Envelope>';

listDevices = function(callback) {
  options.body = listdev;
  request(options, callback);
}

resetPhone = function(callback) {
  options.body = reset; // note, this is ugly just overwriting the body of the same option object as used before... but it will work :)
  request(options, callback);
}

setStatus = function(callback) {
  options.body = hglog;
  request(options, callback);
}


listDevices(function(err, response, body) {
  if (err) {
    console.log("failed listDevices", err)
  } else if (new RegExp(command).test(body) == true) {
 bodyast = 'your device state is already set.';
 res.setHeader('Content-Type', 'text/plain');
 res.setHeader('Content-Length', Buffer.byteLength(bodyast));
 res.end(bodyast);
 } else {

setStatus(function(err, response, body) {
  if (err) {
    console.log("failed setStatus", err)
  } else {
    //console.log("setStatus", response, body)
    resetPhone(function(err, response, body) {
      if (err) {
        console.log("failed resetPhone", err)
      } else {
        //console.log("resetPhone", response, body)
        //mal versuchen ob der body hier geschickt wird
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', Buffer.byteLength(bodyast));
        res.end(bodyast);
      }
    })
  }
})
// end listDevices
}
})

/*

listDevices(function(err, response, body) {
  if (err) {
    console.log("failed listDevices", err)
  } else {
    //console.log("listDevices", response, body)
    console.log(body)

    // check if string "On" is returned in XML
    //kann vereinfacht werden: console.log(/On/.test(body))
    //var hlogStatus = /On/
    //var hlogStatus = '/' + command + '/'; //warum funktioniert das nicht...
    var hlogStatus = new RegExp(command);
    //var hlogStatus = new RegExp('/On/');
    console.log(hlogStatus)
    //console.log(command.test(body))
    console.log(new RegExp(command).test(body))


      test can only be called on a RegExp object
      match can only be called on a String object



    var match = body.match(command)
    if(match) {
        console.log("on matched :)")
    }

  }
})
*/

//close app.get
});


app.listen(port);
console.log("Server lauscht auf http://localhost:" + port);

// end express

//testcomment
