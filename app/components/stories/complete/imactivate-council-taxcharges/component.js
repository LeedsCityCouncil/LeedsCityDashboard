/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var councilTaxChargesArray;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Council tax charges', // (Provide a story title)
        subTitle: 'Yearly council tax charges by property band', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Council tax charges information by property band', // (Provide a longer description of the story)
        license: 'Council tax charges, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/council-tax-charges', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        // color: 'white', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },

    // Executes when user selects a location from the select tag.f
    selectedOptionChanged: function () { 
        // Selected location.
        var taxLocation = (this.get('selectedOption')).toString();
        // Tax bands array
        var taxCodesArray = ["A (5/9)", "A", "B", "C", "D", "E", "F", "G", "H"];

        // Reset the table content
        document.getElementById('councilTaxChargesTable1').innerHTML = '<tr><th class="councilChargeCell">Tax Band</th><th class="councilChargeCell">Cost (£)</th></tr>';
        document.getElementById('councilTaxChargesTable2').innerHTML = '<tr><th class="councilChargeCell">Tax Band</th><th class="councilChargeCell">Cost (£)</th></tr>';

        // Add the first half of the tax bands into table 1.
        for (var j = 0; j < 5; j++) {
            var bandCostOne = (councilTaxChargesArray[taxLocation][taxCodesArray[j]]);
            document.getElementById('councilTaxChargesTable1').innerHTML += '<tr><td class="councilChargeCell">' + taxCodesArray[j] + '</td><td class="councilChargeCell">' + bandCostOne + '</td></tr>';
        }
        
        // Fill in the remaining tax bands into table 2. 
        for (var j = 5; j < taxCodesArray.length; j++) {
            var bandCostTwo = (councilTaxChargesArray[taxLocation][taxCodesArray[j]]);

            document.getElementById('councilTaxChargesTable2').innerHTML += '<tr><td class="councilChargeCell">' + taxCodesArray[j] + '</td><td class="councilChargeCell">' + bandCostTwo + '</td></tr>';
        }

        // Set the taxbase number
        var taxBaseVariable = councilTaxChargesArray[taxLocation].Taxbase;
        if (taxBaseVariable.length > 0) {
            document.getElementById('taxbase').style.display = "block";
            document.getElementById('taxbase').innerHTML = taxLocation + " taxbase number: " + taxBaseVariable;
        }
        // Hide the element if there is no entry
        else {
           document.getElementById('taxbase').style.display = "none"; 
        }

    }.observes('selectedOption'),


    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];
        var taxLocation;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse('http://tomforth.co.uk/widgetCSV/councilTaxCharges.csv', {
                download: true,
                complete: function (results) {
                    councilTaxChargesArray = create3DjsonWithUniqueFieldNames(results.data);
                    taxLocation = Object.keys(councilTaxChargesArray);
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
                for (var k = 0; k < taxLocation.length; k++) {

                    var individualItem = {
                        id: taxLocation[k],
                        title: taxLocation[k],
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