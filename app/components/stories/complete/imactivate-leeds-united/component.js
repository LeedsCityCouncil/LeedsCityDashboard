/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

// Global arrays
var leedsUnitedData;
var matchArray = [];
var nextMatchDate;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Leeds United fixtures', // (Provide a story title)
        subTitle: 'Time and details of the next Leeds United fixture', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'See upcoming Leeds United fixtures for the 2015/16 season.', // (Provide a longer description of the story)
        license: 'Football fixures, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/fixtures-2014-15', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'lighter-blue', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    actions: {
        toggleMatch(status) {
            // Get the position of the current match in the array.
            var positionOfMatch = (matchArray.indexOf(nextMatchDate));

            // Variable used to stop movement at the start and end of the list    
            var blockMove;

            // Cycling back in time
            if (status == 'back') {
                // Only cycle if you don't have the first or last match selected.
                if (positionOfMatch != 0) {
                    // Move the date back by one
                    var toggleDate = matchArray[positionOfMatch - 1];
                    blockMove = false;
                }
                // First match of season, move is blocked
                else {
                    blockMove = true;
                }
            }

            // Moving forward in time.
            if (status == 'forward') {
                // Only allow movement forward if you are not at the end of the season.
                if (positionOfMatch != (matchArray.length - 1)) {
                    // move the date forward by one.
                    var toggleDate = matchArray[positionOfMatch + 1];
                    blockMove = false;
                } else {
                    blockMove = true;
                }
            }

            // Only cycle if you don't have the first or last match selected.
            if (blockMove == false) {
                // Update the match day
                nextMatchDate = toggleDate;

                // set the information
                document.getElementById('competition').innerHTML = leedsUnitedData[nextMatchDate].Competition;
                document.getElementById('homeTeam').innerHTML = leedsUnitedData[nextMatchDate].Home;
                document.getElementById('awayTeam').innerHTML = leedsUnitedData[nextMatchDate].Away;

                // Sets the game as either being home or away
                if (leedsUnitedData[nextMatchDate].Home == 'Leeds United') {
                    document.getElementById('homeAway').innerHTML = 'H';
                } else {
                    document.getElementById('homeAway').innerHTML = 'A';
                }

                // Format the match date
                var matchDayFormat = moment(nextMatchDate, "DD/MM/YYYY");
                var matchDayProcess = matchDayFormat.format("dddd, MMMM Do YYYY");

                // Set the content
                document.getElementById('matchDate').innerHTML = matchDayProcess + " <i class='fa fa-clock-o'></i> " +
                    leedsUnitedData[nextMatchDate].Time;

                document.getElementById('matchLocation').innerHTML = leedsUnitedData[nextMatchDate].Ground + ", " +
                    leedsUnitedData[nextMatchDate].Place + ", " + leedsUnitedData[nextMatchDate].Postcode;

                var groundName = leedsUnitedData[nextMatchDate].Ground;

                // Get the lat and lng of ground, create a marker.
                var groundLat = Number(leedsUnitedData[nextMatchDate].Latitude);
                var groundLng = Number(leedsUnitedData[nextMatchDate].Longitude);

                var markers = Ember.A([{
                    title: groundName,
                    lat: groundLat,
                    lng: groundLng,
                    body: ''
        }]);
                this.set('lat', groundLat);
                this.set('lng', groundLng);
                this.set('markers', markers);
                this.set('zoom', 12);

            }
        }
    },

    setup: function () {
        this.setProperties({
            lat: 53.801277,
            lng: -1.548567,
            zoom: 12,
            markers: Ember.A([]),
            selectedItem: null
        });
    }.on('init'),
    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];
        var numberOfGames;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            // Parse the CSV file
            Papa.parse("http://tomforth.co.uk/widgetCSV/leedsUnited.csv", {
                download: true,
                complete: function (results) {
                    // Create an array from the CSV file
                    leedsUnitedData = create3DjsonWithUniqueFieldNames(results.data);
                    populateMatchArray();
                }
            });

            function create3DjsonWithUniqueFieldNames(jsonData) {
                var threeDjsonArray = [];
                var headerRow = jsonData[0];
                var threeDjsonArray = {};
                for (var row = 1; row < jsonData.length - 1; row++) {
                    var fieldName = jsonData[row][0];
                    var fieldElement = {};
                    for (var column = 1; column < jsonData[row].length; column++) {
                        var rowName = jsonData[0][column];
                        var fieldValue = jsonData[row][column];
                        fieldElement[rowName] = fieldValue;
                    }
                    threeDjsonArray[fieldName] = fieldElement;
                }
                return threeDjsonArray;
            }

            // Create an array of all the match dates
            function populateMatchArray() {
                numberOfGames = Object.keys(leedsUnitedData).length;

                for (var j = 0; j < numberOfGames; j++) {
                    var matchDate = Object.keys(leedsUnitedData)[j];
                    matchArray.push(matchDate);
                }

                getNextMatch();
            }

            // Returns the next game
            function getNextMatch() {
                var currentDate = moment().format();

                // Loop through the match dates
                for (var k = 0; k < matchArray.length; k++) {
                    var gameDate = moment(matchArray[k], "DD/MM/YYYY");

                    // Once the game is in the future break out of the loop
                    if (gameDate.isAfter(currentDate) == true) {
                        nextMatchDate = gameDate.format("DD/MM/YYYY");
                        break;
                    }
                }

                setGameContent();
         }
            
            // Creates the content for the next match
            function setGameContent() {
                document.getElementById('competition').innerHTML = leedsUnitedData[nextMatchDate].Competition;
                document.getElementById('homeTeam').innerHTML = leedsUnitedData[nextMatchDate].Home;
                document.getElementById('awayTeam').innerHTML = leedsUnitedData[nextMatchDate].Away;

                if (leedsUnitedData[nextMatchDate].Home == 'Leeds United') {
                    document.getElementById('homeAway').innerHTML = 'H';
                } else {
                    document.getElementById('homeAway').innerHTML = 'A';
                }

                var matchDayFormat = moment(nextMatchDate, "DD/MM/YYYY");
                var matchDayProcess = matchDayFormat.format("dddd, MMMM Do YYYY");

                document.getElementById('matchDate').innerHTML = matchDayProcess + " <i class='fa fa-clock-o'></i> " +
                    leedsUnitedData[nextMatchDate].Time;

                document.getElementById('matchLocation').innerHTML = leedsUnitedData[nextMatchDate].Ground + ", " +
                    leedsUnitedData[nextMatchDate].Place + ", " + leedsUnitedData[nextMatchDate].Postcode;

                setGroundMap();
            }

            // Adds a marker to the map to show where the next match is
            function setGroundMap() {
                var groundName = leedsUnitedData[nextMatchDate].Ground;

                var groundLat = Number(leedsUnitedData[nextMatchDate].Latitude);
                var groundLng = Number(leedsUnitedData[nextMatchDate].Longitude);

                var markers = Ember.A([{
                    title: groundName,
                    lat: groundLat,
                    lng: groundLng,
                    body: ''
        }]);
                obj.set('lat', groundLat);
                obj.set('lng', groundLng);
                obj.set('markers', markers);
                obj.set('zoom', 12);

            }
        });

    }.on('didInsertElement'),
    
    
});