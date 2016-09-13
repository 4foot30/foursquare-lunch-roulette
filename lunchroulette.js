(function (global)
{

    var config = {
        'secrets' : {
            'clientId' : 'YOUR-CLIENT-ID-HERE',
            'clientSecret' : 'YOUR-CLIENT-SECRET-HERE',
            'redirectUrl' : 'http://www.whiteoctober.co.uk'
        }
    }

    global.config = config;

    var express = require('express'),
        bodyParser = require('body-parser'),
        Faye = require('faye'),
        http = require('http'),
        https = require('https'),
        rp = require('request-promise');

    var foursquare = require('node-foursquare')(config);

    var app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.static(__dirname + '/public'));

    var bayeux = new Faye.NodeAdapter({
        mount: '/faye',
        timeout: 45
    });

    var server = http.createServer(app);
    bayeux.attach(server);
    server.listen(4444);

    app.post('/explore', function(req, res)
    {

        var options = {
            uri: 'https://api.foursquare.com/v2/venues/explore',
            qs: {
                client_id: config.secrets.clientId,
                client_secret: config.secrets.clientSecret,
                v: '20130815',
                ll: '51.7476871,-1.2421237',
                query: req.body.command
            },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };

        rp(options)
            .then(function (response) {

                console.log(response);

                // Broadcast the POST request's command to public/js/wall.js
                bayeux.getClient()
                .publish('/apiResponse', {
                    response: response
                });

                // Send a response to public/admin - faye.post("UPDATE") ???
                //res.send(req.body.command);

            })
            .catch(function (err) {
                // API call failed...
                console.log(err);
            });




        // for (k in req) {
        //     console.log(k);
        // }

        // var proxyRequest = https.request({
        //     host: 'api.foursquare.com',
        //     method: 'GET',
        //     path: '/v2/venues/search?client_id=' + config.secrets.client_id + '&client_secret=' + config.secrets.client_secret + '&v=20130815&ll=40.7,-74&query=sushi'
        // },
        // function (proxyResponse) {
        //     proxyResponse.on('data', function (chunk) {
        //         console.log(chunk);
        //         response.send(chunk);
        //     });
        // });

        // proxyRequest.write(response.body);
        // proxyRequest.end();

        /*
        // Broadcast the POST request's command to public/js/wall.js
        bayeux.getClient()
        .publish('/commands', {
            command: req.body.command
        });

        // Send a response to public/admin - faye.post("UPDATE") ???
        res.send(req.body.command);
        */

    });

})(this);
