(function ()
{

    $(window).load(init);

    function init() {

        // Animate logo
        $('.triangle').each(function() {
            var startX = Math.random() * (window.innerWidth - 100),
                startY = Math.random() * (window.innerHeight - 100),
                delay = Math.random() * 3,
                alphaTime = (Math.random() * 2) + 0.5,
                posTime = (Math.random() * 2) + 0.5;
            TweenLite.from(this, alphaTime, {alpha: 0, delay: delay});
            TweenLite.from(this, posTime, {x: startX, delay: delay, ease: Back.easeOut});
            TweenLite.from(this, posTime, {y: startY, delay: delay, ease: Back.easeOut});
            TweenLite.from(this, posTime + 0.5, {rotation: 360 + (Math.random() * 360), delay: delay});
        });

        $('button').on('click', function(e) {

            e.preventDefault();

            if ($('input').val()) {
                post($('input').val());
            }

        });

        broadcastAPIResponse = new Faye.Client('/faye');
        broadcastAPIResponse.subscribe('/apiResponse', displayResponse);

    }

    function post(_command) {

        $.post( "/explore", {command: _command}, function(res) {

            // Track POST response here
            console.log(res);

        });

    }

    function displayResponse(_message) {

        var resultsDiv = $('.results').empty();
        var data = _message.response.response;
        var locations = data.groups[0].items;
        console.log(_message.response);

        if (data.totalResults >= 1) {
            randomCount = Math.floor(Math.random() * (data.totalResults - 1));
            if (locations[randomCount].venue.name) {
                resultsDiv.append('<h2>We are eating ' + data.query + ' at ' + locations[randomCount].venue.name + ', get your coats at 12.30! <i class="fa fa-clock-o"></i></h2>');
                if (data.totalResults > 1) {
                    resultsHeader = '<h3>But there are also ' + (data.totalResults - 1) + ' other ' + data.query + ' joints near us in ' + data.headerFullLocation + ':</h3>';
                    resultsDiv.append(resultsHeader);
                }

                resultsDiv.append('<p>');
                for (var location in locations) {
                    if (location != randomCount) {
                        resultsDiv.append(locations[location].venue.name + ', ');
                    }
                }
                if (locations.length > 1) {
                    resultsDiv.append('woop!</p>');
                }
            } else {
                resultsHeader = '<h1>Nada :(</h1>';
                resultsDiv.append(resultsHeader);
            }

        } else {
            resultsHeader = '<h1>Nada :(</h1>';
            resultsDiv.append(resultsHeader);
        }

    }

})();
