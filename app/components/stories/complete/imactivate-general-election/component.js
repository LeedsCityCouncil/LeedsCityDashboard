/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var generalElectionData;
var wardArray;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'General Election', // (Provide a story title)
        subTitle: 'Information on the 2015 general election in Leeds', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'Information on the 2015 general election in Leeds. You can find details of candidates, the parties they represent, and the number of votes they received.',
        license: 'Election results - general, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/election-results-general', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)
        color: 'blue', // (Set the story colour)
        width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)
        slider: true, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    loadGoogleAPIs: function () {
        // Load google api.
        google.setOnLoadCallback();
    }.observes('loaded'),

    // Executes when user selects a location from the select tag.
    selectedOptionChanged: function () {
        // Selected ward from dropdown
        var ward = (this.get('selectedOption')).toString();

        // Set the table headings
        document.getElementById('electionTable').innerHTML = "<tr><th class='electionTableElement'>Candidate</th><th class='electionTableElement'>Party</th><th class='electionTableElement'>Votes</th><th class='electionTableElement'>%</th></tr>";

        // Get the number of candidates
        var numberOfCandidates = generalElectionData[ward].length;

        // Get the number of voters
        var totalWardVoters = 0;
        for (var j = 0; j < numberOfCandidates; j++) {
            totalWardVoters = totalWardVoters + Number(generalElectionData[ward][j].Votes);

        }

        var partyColorArray = [];
        var graphArray = [['Candidate', 'Votes']];

        // Populate the table content
        for (var i = 0; i < numberOfCandidates; i++) {
            var candidateName = generalElectionData[ward][i].Forename + " " + generalElectionData[ward][i].Surname;
            var candidateParty = generalElectionData[ward][i].PartyShort;
            var candidatePartyColor = generalElectionData[ward][i].PartyColor;

            partyColorArray.push(candidatePartyColor);

            var candidateVotes = Number(generalElectionData[ward][i].Votes);
            graphArray.push([candidateName + " (" + candidateParty + ")", candidateVotes]);

            var candidatePercentage = ((candidateVotes / totalWardVoters) * 100).toFixed(1);

            var winnerCheck = generalElectionData[ward][i].Elected;

            if (winnerCheck == 'Elected') {
                candidateName = candidateName + "<span> <i class='fa fa-trophy'></i></span>"
            }

            document.getElementById('electionTable').innerHTML += '<tr><td class="electionTableElement">' + candidateName + '</td><td class="electionTableElement" style="background-color: ' + candidatePartyColor + ';">' + candidateParty + '</td><td class="electionTableElement">' + candidateVotes + '</td><td class="electionTableElement">' + candidatePercentage + '</td></tr>'

        }

        // Create table for graph
        var numRows = graphArray.length;
        var numCols = graphArray[0].length;

        var data = new google.visualization.DataTable();

        data.addColumn('string', graphArray[0][0]);
        data.addColumn('number', graphArray[0][1]);

        for (var k = 1; k < numRows; k++) {
            data.addRow(graphArray[k]);
        }

        var graphTitle = ward + " General election results 2015";

        // Set chart options
        var options = {
            title: graphTitle,
            colors: partyColorArray,
            backgroundColor: '#468ee5',
            legend: 'none',
            pieSliceText: 'label',
            width: 290,
            height: 100,
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out',
            },
            chartArea: {
                left: '15%',
                top: '20%',
                'width': '70%',
                'height': '70%'
            },
            titleTextStyle: {
                fontName: 'Arial',
                fontSize: '12',
                bold: true,
                color: 'white',
            },
            height: 200,

        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(document.getElementById('generalElectionChart'));
        chart.draw(data, options);

    }.observes('selectedOption'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse('http://tomforth.co.uk/widgetCSV/generalElection.csv', {
                download: true,
                complete: function (results) {
                    generalElectionData = create3DjsonWithNonUniqueFieldNames(results.data);
                    wardArray = Object.keys(generalElectionData);
                    setSelectContent();
                }
            });

            // Used to turn CSV into a JSON object
            function create3DjsonWithNonUniqueFieldNames(jsonData) {
                var threeDjsonArray = [];
                var headerRow = jsonData[0];
                threeDjsonArray = {};
                for (var row = 1; row < jsonData.length - 1; row++) {
                    var fieldName = jsonData[row][0];
                    var fieldElement = {};
                    for (var column = 1; column < jsonData[row].length; column++) {
                        var rowName = jsonData[0][column];
                        var fieldValue = jsonData[row][column];
                        fieldElement[rowName] = fieldValue;
                    }
                    // handle identical fieldnames by pushing to an array
                    if (typeof (threeDjsonArray[fieldName]) == 'undefined') {
                        var fieldElementsWrappedInArray = [];
                        fieldElementsWrappedInArray[0] = fieldElement;
                        var arrayOfFieldElements = fieldElementsWrappedInArray;
                    } else {
                        arrayOfFieldElements = threeDjsonArray[fieldName];
                        arrayOfFieldElements.push(fieldElement);
                    }
                    threeDjsonArray[fieldName] = arrayOfFieldElements;
                }
                return threeDjsonArray;
            }

            function setSelectContent() {
                for (var k = 0; k < wardArray.length; k++) {

                    var individualItem = {
                        id: wardArray[k],
                        title: wardArray[k],
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