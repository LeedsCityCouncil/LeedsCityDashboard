/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var councilHousingData;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Council Houses', // (Provide a story title)
        subTitle: 'Breakdown of council house numbers and bedrooms', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'This story uses data on council housing stock to show the types of property in the Leeds regions.', // (Provide a longer description of the story)
        license: 'Council housing stock, (c) Leeds City Council, 2015, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/council-housing-stock', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        // color: 'white', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    loadGoogleAPIs: function () {
        google.setOnLoadCallback();
    }.observes('loaded'),

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {
        // Chosen area
        var selectedPostcode = (this.get('selectedOption')).toString();
        var getHouseValue = councilHousingData[selectedPostcode];
        var graphLocation = getHouseValue.Location;
        var graphTotalHouses = getHouseValue.Total;
        var graphTitle = graphTotalHouses + " council houses in " + graphLocation;

        // Create the data table. Gets the total of different sized houses.
        var data = new google.visualization.arrayToDataTable([
        ['Bedrooms', 'Total'],
        ['1', Number(getHouseValue.One)],
        ['1/2', Number(getHouseValue.OneTwo)],
        ['2', Number(getHouseValue.Two)],
        ['3', Number(getHouseValue.Three)],
        ['4', Number(getHouseValue.Four)],
        ['5+', Number(getHouseValue.FivePlus)],

      ]);

        // Set chart options
        var options = {
            title: graphTitle,
            legend: 'none',
            hAxis: {
                title: 'Number of beds',
            },
            colors: ['#49b0e6'],
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '11',
                bold: true,
            },
            chartArea: {
                top: '15%',
                'width': '70%',
                'height': '65%'
            },
            height: 170,
            width: 290,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
        };

        // Create and draw our chart, passing in some options.
        var housingChart = new google.visualization.ColumnChart(document.getElementById('councilHouseChart'));
        housingChart.draw(data, options);

    }.observes('selectedOption'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];
        var locationArray = [];
        var numberOfLocations;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse("http://tomforth.co.uk/widgetCSV/councilHousing.csv", {
                download: true,
                complete: function (results) {
                    councilHousingData = create3DjsonWithUniqueFieldNames(results.data);
                    populateLocationArray();
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

            // Create an array of all locations
            function populateLocationArray() {
                numberOfLocations = Object.keys(councilHousingData).length;
                for (var j = 0; j < numberOfLocations; j++) {
                    var locationPostcode = Object.keys(councilHousingData)[j];
                    var locationName = councilHousingData[locationPostcode].Location;
                    locationArray.push(locationName + " (" + locationPostcode + ")");
                }
                setSelectContent();
            }

            // set the dropdown menu
            function setSelectContent() {
                var k;
                for (k = 0; k < locationArray.length; k++) {
                    var individualItem = {
                        id: Object.keys(councilHousingData)[k],
                        title: locationArray[k],
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