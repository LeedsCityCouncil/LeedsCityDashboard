/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var libraryVisitData;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Library Visits', // (Provide a story title)
        subTitle: 'Annual visitor numbers for libraries around Leeds', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Annual visitor numbers for libraries around Leeds', // (Provide a longer description of the story)
        license: 'Library visits, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/library-visits', // (Where did the data come from?)
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
        // Chosen library
        var selectedLibrary = (this.get('selectedOption')).toString();
        var getLibraryValue = libraryVisitData[selectedLibrary];
        
        // Create the data table.
        var data = new google.visualization.arrayToDataTable([

        ['Year', 'Total'],
        ['2011/12', Number(getLibraryValue['2011/12'])],
        ['2012/13', Number(getLibraryValue['2012/13'])],
        ['2013/14', Number(getLibraryValue['2013/14'])],
        ['2014/15', Number(getLibraryValue['2014/15'])],
      ]);

        // Set chart options
        var options = {
            title: "",
            legend: 'none',
            hAxis: {},
            vAxis: {
                minValue: 0,
            },
            colors: ['#49b0e6'],
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '11',
                bold: true,
            },
            chartArea: {
                top: '5%',
                'width': '70%',
                'height': '80%'
            },
            height: 150,
            width: 290,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
        };

        // Initiate and draw chart, passing in some options.
        var libraryChart = new google.visualization.ColumnChart(document.getElementById('libraryVisitsChart'));
        libraryChart.draw(data, options);

        // Work out changes in viewer numbers
        var visitorChange = Number(getLibraryValue.Change);

        // Visistors have gone up
        if (visitorChange > 0) {
            var libraryVisitorContent = "<span style='color:#7ed321;'><strong>+" + visitorChange + "%</strong></span>";
        } 
        // Visitors have gone down.
        else {
            var libraryVisitorContent = "<span style='color:#d0021b;'><strong>" + visitorChange + "%</strong></span>";
        }

        document.getElementById('libraryVisitStatus').style.borderTop = "dotted 1px black";
        document.getElementById('libraryVisitStatus').innerHTML = "Change over four years: " + libraryVisitorContent;

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
        var libraryArray = [];
        var numberOfLibraries;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {

            Papa.parse("http://tomforth.co.uk/widgetCSV/libraryVisits.csv", {
                download: true,
                complete: function (results) {
                    // Load the csv file
                    libraryVisitData = create3DjsonWithUniqueFieldNames(results.data);
                    populatelibraryArray();
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

            function populatelibraryArray() {
                numberOfLibraries = Object.keys(libraryVisitData).length;
                for (var j = 0; j < numberOfLibraries; j++) {
                    var libraryName = Object.keys(libraryVisitData)[j];

                    libraryArray.push(libraryName);
                }

                setSelectContent();
            }

            // Set the dropdown content
            function setSelectContent() {
                for (var k = 0; k < libraryArray.length; k++) {

                    var individualItem = {
                        id: libraryArray[k],
                        title: libraryArray[k],
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