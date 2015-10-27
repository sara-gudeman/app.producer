var request = require('request');
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};


module.exports = {
  getEventsList: function(req, res, next) {
    request({
      method: 'GET',
      uri: process.env.CHOREOGRAPHER_URL + '/metronome/events',
      headers: headers
    }, function(error, response, body) {
      var parsedData = JSON.parse(body);
      var text = parsedData;

      //Temporary hack
      //TODO: deprecate
      var abbreviations = {
        M:'Monday',
        T:'Tuesday',
        W:'Wednesday',
        R:'Thursday',
        F:'Friday',
        S:'Saturday',
        break: 'break'
      };
      text = abbreviations;
      // endhack

      var events = parsedData.rhythms.map(function(rhythm) {
        return {
          "abbreviation": rhythm[0],
          "title": text[rhythm[0]] || rhythm[0],
          "url": rhythm[1],
          "cron": rhythm[2]
        };
      });
      res.send(events);
    });
  },
  createEvent: function(req, res, next) {
    var event = req.body;
    event.trigger = process.env.CHOREOGRAPHER_URL + '/signal/:' + event.title;;
    event.interval = event.cron;
    stringifiedEvent = JSON.stringify(event);
    request({
      method: 'POST',
      uri: process.env.CHOREOGRAPHER_URL +  '/metronome/events/:' + event.title,
      headers: headers,
      data: stringifiedEvent
    }, function(error, response, body) {
      if (error) {
        console.log("Error: ", error);
        res.send(400);
      } else {
        res.send(200);
      }
    });
  }

};