/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Dog Fouling', // (Provide a story title)
        subTitle: 'Fixed Penalty Notices issued for dog fouling in Leeds', // (Provide a story subtitle)
        author: 'imactivate',

        description: 'Dataset showing Fixed Penalty Notices issued for dog fouling in Leeds', // (Provide a longer description of the story)
        license: 'Dog fouling fixed penalty notices, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/fixed-penalty-notices-for-dog-fouling-in-leeds', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'lighter-blue', // (Set the story colour)
        // width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        // slider: false, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },


    onInsertElement: function () {
        // Used to dispaly when the current values are from.
        var figureDateReadings = ["1/4/2013", "1/4/2014", "1/4/2015", "19/01/2016"];

        // Fines array
        var dogFoulingFines = {
            "2012/13": 13,
            "2013/14": 19,
            "2014/15": 31,
            "2015/16": 14,
        };
        
        // Set when the current dates are from
        var currentDate = moment(figureDateReadings[figureDateReadings.length - 1], 'DD/MM/YYYY').format('ddd, MMMM Do YYYY');
        var previousDate = moment(figureDateReadings[figureDateReadings.length - 2], 'DD/MM/YYYY').format('ddd, MMMM Do YYYY');
        document.getElementById('datesMessage').innerHTML = "Current figures are from " + previousDate + " to " + currentDate + ".";
        
        var yearsArray = Object.keys(dogFoulingFines);
        var currentYear = yearsArray[yearsArray.length - 1];

        // Set the main latest content.
        document.getElementById('currentYearHeading').innerHTML = currentYear;
        var currentYearFines = dogFoulingFines[currentYear];
        document.getElementById('currentYearNumber').innerHTML = currentYearFines;

        var i;

        for (i = yearsArray.length - 2; i > -1; i--) {

            var individualYearValue = dogFoulingFines[yearsArray[i]];

            // Get the percentage change from the latest year.
            var percentageDifference = (100 * ((currentYearFines - individualYearValue) / individualYearValue)).toFixed(0);

            // Set the text depending on whether the percentage goes up or down.
            if (percentageDifference < 0) {
                var percentageMessage = "<span style='color: green; padding-left: 0.4em;'>" + percentageDifference + "% <i class='fa fa-chevron-down'></i><span>";
            } else if (percentageDifference > 0) {
                var percentageMessage = "<span style='color: red; padding-left: 0.4em;'>" + percentageDifference + "% <i class='fa fa-chevron-up'></i><span>";
            } else {
                var percentageMessage = "";
            }

            // Populate the content from the previous years.
            document.getElementById('dogPastYears').innerHTML += "<div class='yearHolder'><div class='yearTitle'>" + yearsArray[i] + "</div><div class='yearNumber'>" + individualYearValue + "<span>" + percentageMessage + "</span></div></div>"

        }

    }.on('didInsertElement'),

});