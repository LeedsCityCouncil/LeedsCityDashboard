/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var libraryComputersData;
var libraryComputersLocations;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Library computer bookings', // (Provide a story title)
        subTitle: 'Number of computer sessions used in Leeds libraries', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Details of library computer use in libraries around Leeds', // (Provide a longer description of the story)
        license: 'Library computer bookings, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/library-computer-bookings', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org',
        color: 'white', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {
        // From dropdown list
        var selectedLibrary = (this.get('selectedOption')).toString();

        var getLibraryComputerValue = libraryComputersData[selectedLibrary];

        // Add the titles tto the array
        var libraryComputerGraphArray = [];

        var graphTitles = ['Year', selectedLibrary];

        libraryComputerGraphArray.push(graphTitles);

        // Create an array of years
        var yearValues = Object.keys(getLibraryComputerValue);

        // Add each years bookings to the graph array.
        for (var i = 0; i < yearValues.length; i++) {
            var individualYearResults = [yearValues[i], Number(getLibraryComputerValue[yearValues[i]])];
            libraryComputerGraphArray.push(individualYearResults);
        }

        // Create the data table.
        var data = new google.visualization.arrayToDataTable(libraryComputerGraphArray);

        // Set chart options
        var options = {
            legend: 'none',
            curveType: 'function',
            hAxis: {
                slantedText: true,
                slantedTextAngle: 45,

                textStyle: {
                    fontName: 'Arial',
                    fontSize: '8'
                },
            },
            vAxis: {
                slantedText: false,
                viewWindow: {
                    min: 0,
                },
                textStyle: {
                    fontName: 'Arial',
                    fontSize: '8'
                },
            },
            colors: ['#d0021b'],
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '11',
                bold: true,
            },
            chartArea: {
                top: '5%',
                'width': '80%',
                'height': '80%'
            },
            height: 170,
            width: 290,
        };

        // Initiate and draw our chart, passing in some options.
        var libraryComputerChart = new google.visualization.LineChart(document.getElementById('libraryComputersChart'));
        libraryComputerChart.draw(data, options);

    }.observes('selectedOption'),

    loadGoogleAPIs: function () {
        google.setOnLoadCallback();
    }.observes('loaded'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {

            Papa.parse("http://tomforth.co.uk/widgetCSV/libraryComputers.csv", {
                download: true,
                complete: function (results) {
                    libraryComputersData = create3DjsonWithUniqueFieldNames(results.data);
                    libraryComputersLocations = Object.keys(libraryComputersData);
                    setSelectContent();
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

            // Adds locations to the select tag.
            function setSelectContent() {
                for (var k = 0; k < libraryComputersLocations.length; k++) {
                    var individualItem = {
                        id: libraryComputersLocations[k],
                        title: libraryComputersLocations[k],
                    };
                    items.push(individualItem);
                };

                // Populates the selection list.
                obj.set('items', items);

                setTimeout(() => {
                    obj.set('loaded', true);
                });
            }
        });
    }.on('didInsertElement'),
});