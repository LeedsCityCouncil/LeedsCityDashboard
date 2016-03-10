/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var councilTaxBandsData;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Council Tax Bands', // (Provide a story title)
        subTitle: 'Breakdown of council tax bands by postcode area', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Breakdown of council tax bands by postcode area', // (Provide a longer description of the story)
        license: 'Council tax bands of all properties in Leeds, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/council-tax-bands-of-leeds-properties', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'white', // (Set the story colour)
        width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        scroll: false, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {
        var selectedPostcode = (this.get('selectedOption')).toString();
        var getValue = councilTaxBandsData[selectedPostcode];
        var graphLocation = councilTaxBandsData[selectedPostcode].Location;
        var graphTotalHouses = councilTaxBandsData[selectedPostcode].Total;
        var graphTitle = graphTotalHouses + " properties in " + graphLocation;

        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Tax Band');
        data.addColumn('number', 'Number');
        // Add data for each branch
        data.addRows([
        ['A', Number(getValue.A)],
        ['B', Number(getValue.B)],
        ['C', Number(getValue.C)],
        ['D', Number(getValue.D)],
        ['E', Number(getValue.E)],
        ['F', Number(getValue.F)],
        ['G', Number(getValue.G)],
        ['H', Number(getValue.H)]
      ]);

        // Set chart options
        var options = {
            title: graphTitle,
            legend: 'none',
            pieSliceText: 'label',
            width: 290,
            height: 200,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
            chartArea: {
                left: '15%',
                top: '10%',
                'width': '70%',
                'height': '70%'
            },
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '12',
                bold: true
            },
  

        };

        // Create and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('counciltaxChart'));
        chart.draw(data, options);

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
        var locationArray = [];
        var numberOfLocations;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse("http://tomforth.co.uk/widgetCSV/councilBandTotals.csv", {
                download: true,
                complete: function (results) {
                    // Create data array
                    councilTaxBandsData = create3DjsonWithUniqueFieldNames(results.data);
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

            // Get ward locations
            function populateLocationArray() {
                numberOfLocations = Object.keys(councilTaxBandsData).length;
                for (var j = 0; j < numberOfLocations; j++) {
                    var locationPostcode = Object.keys(councilTaxBandsData)[j];
                    var locationName = councilTaxBandsData[locationPostcode].Location;

                    locationArray.push(locationName + " (" + locationPostcode + ")");

                }
                setSelectContent();
            }

            // Set dropdown content
            function setSelectContent() {
                for (var k = 0; k < locationArray.length; k++) {

                    var individualItem = {
                        id: Object.keys(councilTaxBandsData)[k],
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