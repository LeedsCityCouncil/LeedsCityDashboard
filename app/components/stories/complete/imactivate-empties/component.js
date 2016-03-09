/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

// Global variable to hold empties data
var emptiesNumbers3D;

export
default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Empty Homes', // (Provide a story title)
        subTitle: 'Long term empty properties in Leeds wards', // (Provide a story subtitle)
        author: 'imactivate', //(Provide the author of the story)
        description: 'This story uses data on long term empty properties (6 months+) in the private sector.', // (Provide a longer description of the story)
        license: 'Private Sector Long Term Empty Properties by Ward, (c) Leeds City Council, 2015, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/private-sector-long-term-empty-properties-by-ward', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)
        color: 'white', // (Set the story colour)
        width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    tagName: 'div',
    loaded: false,
    selectedOption: null,

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {

        var wardname = (this.get('selectedOption')).toString();

        var emptiesData = emptiesNumbers3D;

        var emptiesChartData = new google.visualization.DataTable();
        emptiesChartData.addColumn('date', "Month");
        emptiesChartData.addColumn('number', "Number of Empty Homes");

        var voidArray = emptiesData[wardname.replace(/_/g, " ")];

        // smoothed charts and trends
        // calculate empties moving average
        var last12dates = [];
        var last12voidCounts = [];

        for (var i = 0; i < voidArray.length; i++) {
            last12dates.push(new Date(Object.keys(voidArray[i])));
            last12voidCounts.push(parseInt(voidArray[i][Object.keys(voidArray[i])]));
            if (last12dates.length == 12) {
                var sum = 0;
                for (var x = 0; x < 12; x++) {
                    sum += last12voidCounts[x];
                }

                emptiesChartData.addRow([last12dates[6], parseInt(sum / 12)]);
                last12dates.shift();
                last12voidCounts.shift();
            }
        }

        // calculate empties trend
        var emptiesTrendPointCounter = 0;
        var emptiesTrendArray = [];
        for (var i = 0; i < voidArray.length; i++) {
            var dateOfEmptiesCount = new Date(Object.keys(voidArray[i]));
            var emptiesCount = parseInt(voidArray[i][Object.keys(voidArray[i])]);
            var trendArrayElement = [];
            trendArrayElement[0] = emptiesTrendPointCounter;
            trendArrayElement[1] = emptiesCount;
            emptiesTrendArray.push(trendArrayElement);
            emptiesTrendPointCounter++;
        }

        var trendResult = regression('linear', emptiesTrendArray);

        // Google chart style
        var freeScaleOptions = {
            title: "",
            colors: ['#87c540'],
            height: 160,
            width: 290,
            curveType: 'function',
            legend: 'none',
            fontName: 'Arial',
            lineWidth: 2,
            vAxis: {
                viewWindowMode: 'explicit',
                viewWindow: {
                    min: 0,
                },
                textStyle: {
                    fontSize: '10'
                },
                hAxis: {
                    gridlines: {
                        color: '#1E4D6B'
                    }
                },
            },
            hAxis: {
                slantedText: true,
                slantedTextAngle: 45,
                viewWindowMode: 'pretty',
                viewWindow: {},
                textStyle: {
                    fontSize: '9'
                }
            },
            chartArea: {
                left: '10%',
                top: '4%',
                'width': '84%',
                'height': '80%'
            },
            backgroundColor: {
                fill: 'transparent'
            }
        }

        // Draw chart
        var emptiesChart = new google.visualization.LineChart(document.getElementById('curve_chart'));
        emptiesChart.draw(emptiesChartData, freeScaleOptions);

    }.observes('selectedOption'),

    loadGoogleAPIs: function () {
        google.setOnLoadCallback();
    }.observes('loaded'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });
        this.set('title', 'Empty Homes');
        this.set('subTitle', 'Long term empty properties in Leeds wards');

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {

            var emptiesNumbers;

            // Load the CSV file
            Papa.parse("http://tomforth.co.uk/widgetCSV/EmptyNumbers.csv", {
                download: true,
                complete: function (results) {
                    emptiesNumbers = results;
                    emptiesNumbers3D = create3Djson(emptiesNumbers.data);
                }
            });


            function create3Djson(jsonData) {
                var threeDjsonArray = [];
                var headerRow = jsonData[0];
                var threeDjsonArray = {};
                for (var row = 1; row < jsonData.length; row++) {
                    var fieldName = jsonData[row][0];
                    var fieldElements = [];
                    for (var column = 1; column < jsonData[row].length; column++) {
                        var rowName = jsonData[0][column];
                        var fieldValue = jsonData[row][column];
                        var fieldElement = {};
                        fieldElement[rowName] = fieldValue;
                        fieldElements.push(fieldElement);
                    }
                    threeDjsonArray[fieldName] = fieldElements;
                }
                return threeDjsonArray;
            }

            var wardArray = ["GUISELEY_AND_RAWDON", "OTLEY_AND_YEADON", "ADEL_AND_WHARFEDALE", "ALWOODLEY", "HAREWOOD", "WETHERBY", "HORSFORTH", "WEETWOOD", "MOORTOWN", "ROUNDHAY", "CALVERLEY_AND_FARSLEY", "BRAMLEY_AND_STANNINGLEY", "KIRKSTALL", "HEADINGLEY", "CHAPEL_ALLERTON", "GIPTON_AND_HAREHILLS", "KILLINGBECK_AND_SEACROFT", "CROSS_GATES_AND_WHINMOOR", "PUDSEY", "FARNLEY_AND_WORTLEY", "ARMLEY", "HYDE_PARK_AND_WOODHOUSE", "CITY_AND_HUNSLET", "BURMANTOFTS_AND_RICHMOND_HILL", "TEMPLE_NEWSAM", "MORLEY_NORTH", "BEESTON_AND_HOLBECK", "MIDDLETON_PARK", "GARFORTH_AND_SWILLINGTON", "MORLEY_SOUTH", "ARDSLEY_AND_ROBIN_HOOD", "ROTHWELL", "KIPPAX_AND_METHLEY", "LEEDS"];

            // Create array of wards
            for (var j = 0; j < wardArray.length; j++) {
                var wardName = wardArray[j];

                var individualItem = {
                    id: wardName,
                    title: wardName.replace(/_/g, " "),
                };
                items.push(individualItem);
            };

            // Populates the selection list.
            obj.set('items', items);

            setTimeout(() => {
                obj.set('loaded', true);
            });

        });
    }.on('didInsertElement'),

});