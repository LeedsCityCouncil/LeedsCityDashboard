/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var libraryCheckBooksData;
var libraryCheckBooksLocations;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Library loans (Books only)', // (Provide a story title)
        subTitle: 'Book loans made across libraries in Leeds', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Loans of books made across libraries in Leeds since the 2000/01 financial year. The figures do not include loans of any of media items (for example, loans of CDs, DVDs, talking books etc). ', // (Provide a longer description of the story)
        license: 'Library loans (books only), (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/library-loans-books-only', // (Where did the data come from?)
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
        // Chosen library from select
        var selectedLibrary = (this.get('selectedOption')).toString();

        var getLibraryValue = libraryCheckBooksData[selectedLibrary];

        // Add the titles to the array
        var libraryBooksGraphArray = [];

        var graphTitles = ['Year', selectedLibrary];

        libraryBooksGraphArray.push(graphTitles);

        // Create an array of years
        var yearValues = Object.keys(getLibraryValue);
        // Add the individual results to 
        for (var i = 0; i < yearValues.length; i++) {
            var individualYearResults = [yearValues[i], Number(getLibraryValue[yearValues[i]])];
            libraryBooksGraphArray.push(individualYearResults);
        }

        // Create the data table.
        var data = new google.visualization.arrayToDataTable(libraryBooksGraphArray);

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
            colors: ['#7ed321'],
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
        var libraryIssueBooksChart = new google.visualization.LineChart(document.getElementById('libraryCheckBooksChart'));
        libraryIssueBooksChart.draw(data, options);

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

            Papa.parse("http://tomforth.co.uk/widgetCSV/libraryIssuesBooks.csv", {
                download: true,
                complete: function (results) {
                    libraryCheckBooksData = create3DjsonWithUniqueFieldNames(results.data);
                    libraryCheckBooksLocations = Object.keys(libraryCheckBooksData);
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

            // set the dropdown menu content
            function setSelectContent() {

                for (var k = 0; k < libraryCheckBooksLocations.length; k++) {

                    var individualItem = {
                        id: libraryCheckBooksLocations[k],
                        title: libraryCheckBooksLocations[k],
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