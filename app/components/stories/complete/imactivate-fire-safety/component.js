/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var fireSafetyData;
var fireSafetyWards;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Fire safety checks', // (Provide a story title)
        subTitle: 'Number of home fire safety checks by ward', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Number of home fire safety checks conducted by WYFR broken down by ward area.', // (Provide a longer description of the story)
        license: 'Home fire safety checks, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/home-fire-safety-checks', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        // color: 'white', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {

        var selectedWard = (this.get('selectedOption')).toString();

        var getWardValue = fireSafetyData[selectedWard];
        
        // Get the average value.
        var getAverageValue = fireSafetyData[fireSafetyWards[fireSafetyWards.length - 1]];

        // Add the titles to the array
        var fireSafetyGraphArray = [];

        // Add the titles to the first column on the graph.
        var graphTitles = ['Year', selectedWard, fireSafetyWards[fireSafetyWards.length - 1]];
        fireSafetyGraphArray.push(graphTitles);

        // Create an array of years
        var yearValues = Object.keys(fireSafetyData[selectedWard]);

        // Set the individual values for each year.
        for (var i = 0; i < yearValues.length; i++) {
            var individualYearResults = [yearValues[i], Number(getWardValue[yearValues[i]]), Number(getAverageValue[yearValues[i]])];
            fireSafetyGraphArray.push(individualYearResults);
        }

        // Create the data table.
        var data = new google.visualization.arrayToDataTable(fireSafetyGraphArray);

        // Set chart options
        var options = {

            legend: {
                position: 'bottom',
                textStyle: {
                    fontName: 'Arial',
                    fontSize: '10',
                },

            },
            hAxis: {
                slantedText: false,

                textStyle: {
                    fontName: 'Arial',
                    fontSize: '8'
                },
            },
            vAxis: {
                slantedText: false,

                textStyle: {
                    fontName: 'Arial',
                    fontSize: '8'
                },
            },
            colors: ['#49b0e6', '#7ed321'],
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '11',
                bold: true,
            },
            chartArea: {
                top: '5%',
                'width': '80%',
                'height': '70%'
            },
            height: 170,
            width: 290,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
        };

        // Initiate and draw our chart, passing in some options.
        var fireSafetyChart = new google.visualization.ColumnChart(document.getElementById('fireSafetyChart'));
        fireSafetyChart.draw(data, options);

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

            Papa.parse("http://tomforth.co.uk/widgetCSV/fireSafety.csv", {
                download: true,
                complete: function (results) {
                    fireSafetyData = create3DjsonWithUniqueFieldNames(results.data);
                    fireSafetyWards = Object.keys(fireSafetyData);
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

            function setSelectContent() {
                var k;

                // Ignore the average values from the content
                var numberOfWards = fireSafetyWards.length - 1;

                for (k = 0; k < numberOfWards; k++) {

                    var individualItem = {
                        id: fireSafetyWards[k],
                        title: fireSafetyWards[k],
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