/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var noiseAbbatementData;
var noiseAbbatementMonths;
var noiseAbbatementWards;
var noiseAbbatementYearsArray = [];

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Noise abatement notices', // (Provide a story title)
        subTitle: 'Section 80 notices by Leeds ward', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'A story of Section 80 (noise abatement) notices issued by Leeds City Council by ward. An abatement notice can be served by the local authority if they are satisfied that a noise problem amounts to a statutory nuisance', // (Provide a longer description of the story)
        // license: '', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/noise-abatement-notices', // (Where did the data come from?)
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

        var monthsIndexArray = {
            "m01": 'Jan',
            "m02": 'Feb',
            "m03": 'Mar',
            "m04": 'Apr',
            "m05": 'May',
            "m06": 'June',
            "m07": 'July',
            "m08": 'Aug',
            "m09": 'Sept',
            "m10": 'Oct',
            "m11": 'Nov',
            "m12": 'Dec'
        };

        var graphDataArray = [];
        var graphTitles = ['Month'];

        for (var i = 0; i < noiseAbbatementYearsArray.length; i++) {
            graphTitles.push(noiseAbbatementYearsArray[i]);
        }

        graphDataArray.push(graphTitles);

        var monthID = Object.keys(monthsIndexArray);

        // Array used to populate chart rows.
        var graphRow;

        for (var i = 0; i < monthID.length; i++) {
            // Reset the rows
            graphRow = [];

            // Get the name of the month
            var monthName = monthsIndexArray[monthID[i]];
            var monthIDFormat = monthID[i].replace("m", "");

            graphRow.push(monthName);


            for (var j = 0; j < noiseAbbatementYearsArray.length; j++) {
                var monthEntry = noiseAbbatementYearsArray[j] + "-" + monthIDFormat;
                // Get the number of noise notices for this year an month
                var monthValue = Number(noiseAbbatementData[selectedWard][monthEntry]);
                // Add to the graph row.
                graphRow.push(monthValue);
            }

            // Add to the graph array:
            graphDataArray.push(graphRow);
        }

        var data = new google.visualization.arrayToDataTable(graphDataArray);

        // Set chart options
        var options = {
             colors: ['#49b0e6', '#7ed321'],
            title: '',
            titlePosition: 'none',
            legend: {
                position: 'bottom',
                textStyle: {
                    fontSize: '10',
                }
            },
            hAxis: {
                slantedText: true,
                slantedTextAngle: 45,
                textStyle: {
                    fontSize: '10'
                },
            },
            vAxis: {
                /*format: '0',*/
                textStyle: {
                    fontSize: '10'
                },
            },
            chartArea: {
                top: '5%',
                'width': '85%',
                'height': '65%'
            },
            height: 170,
            width: 290,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
        }

        var chart = new google.visualization.ColumnChart(
            document.getElementById('noiseAbbatementChart'));

        chart.draw(data, options);




    }.observes('selectedOption'),

    loadGoogleAPIs: function () {
        // Draw the chart when the APIs have loaded
        google.setOnLoadCallback(
            // Callback for loading charts
        );
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
            // parse the csv file.
            Papa.parse("http://tomforth.co.uk/widgetCSV/noiseAbbatement.csv", {
                download: true,
                complete: function (results) {
                    noiseAbbatementData = create3DjsonWithUniqueFieldNames(results.data);
                    noiseAbbatementWards = Object.keys(noiseAbbatementData);
                    noiseAbbatementMonths = Object.keys(noiseAbbatementData[noiseAbbatementWards[0]]);
                    getYears();
                    setSelectContent();
                }
            });


            // Returns the specific years where there are results.
            function getYears() {
                for (var i = 0; i < noiseAbbatementMonths.length; i++) {
                    var currentMonth = noiseAbbatementMonths[i];

                    // Split and get the year from the date component.
                    var currentYear = currentMonth.split("-")[0];

                    // If the year is not contained within the array, then push it.
                    if (noiseAbbatementYearsArray.indexOf(currentYear) == -1) {
                        noiseAbbatementYearsArray.push(currentYear);
                    }

                }

            }

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

            // Populate the dropdown.
            function setSelectContent() {
                var k;

                for (k = 0; k < noiseAbbatementWards.length; k++) {

                    var individualItem = {
                        id: noiseAbbatementWards[k],
                        title: noiseAbbatementWards[k],
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