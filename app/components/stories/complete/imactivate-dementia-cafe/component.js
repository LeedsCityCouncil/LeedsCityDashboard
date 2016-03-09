/* global Ember, hebeutils, _ */
import DefaultStory from 'hebe-dash/components/stories/story-types/default-story/component';

var dementiaCafesData;

export default DefaultStory.extend({
    // Story settings (including default values)
    // Uncomment any setting you need to change, delete any you don't need
    storyConfig: {
        title: 'Dementia Cafes', // (Provide a story title)
        subTitle: 'Details of dementia cafes in Leeds', // (Provide a story subtitle)
        author: 'imactivate',
        description: 'A list and details of all dementia cafes in Leeds', // (Provide a longer description of the story)
        license: 'Dementia cafes in Leeds, (c) Leeds City Council, 2016, This information is licensed under the terms of the Open Government Licence.', // (Define which license applies to usage of the story)
        dataSourceUrl: 'http://leedsdatamill.org/dataset/dementia-cafes-in-leeds', // (Where did the data come from?)
        feedbackEmail: 'info@leedsdatamill.org', // (Provide an email users can contact about this story)

        color: 'blue', // (Set the story colour)
        width: '2', // (Set the width of the story. If your story contains a slider, you must define the width, even if it is the same as the default.)
        // height: '2', // (Set the height of the story)
        // headerImage: '', // (Provide an image to show in the story header instead of the title and subtitle)

        slider: true, // (Add a horizontal slider to the story)
        // scroll: true, // (Should the story vertically scroll its content?)
    },
    // Executes when user selects a location from the select tag.f
    selectedOptionChanged: function () {

        var cafe = (this.get('selectedOption')).toString();
        var dementiaCafeDetails = document.getElementById('dementiaCafeDetails');
        
        // Reset the previous content
        dementiaCafeDetails.innerHTML = "";
        dementiaCafeDetails.style.display = "block";

        document.getElementById('dementiaCafeTitle').innerHTML = '<strong>' + cafe + '</strong>';

        var selector = dementiaCafesData[cafe];

        // Main front page details. Add as rows in a table
        var dementiaCafeAddress = "<tr><td class='dementiaCafeCell'><i class='cafeDetail fa fa-fw fa-map-marker'></i></td><td class='dementiaCafeCell'>" + selector.Address1 + ", " + selector.Address2 + ", " + selector.Address3 + ", " + selector.Postcode + "</td></tr>";
        var dementiaCafeDay = "<tr><td class='dementiaCafeCell'><i class='cafeDetail fa fa-fw fa-calendar'></i></td><td class='dementiaCafeCell'>" + selector.Day + "</td></tr>";
        var dementiaCafeContact = "<tr><td class='dementiaCafeCell'><i class='cafeDetail fa fa-fw fa-phone'></i></td><td class='dementiaCafeCell'>" + selector.Contact + "</td></tr>";
        var dementiaCafeTime = "<tr><td class='dementiaCafeCell'><i class='cafeDetail fa fa-fw fa-clock-o'></i></td><td class='dementiaCafeCell'>" + selector.Time + "</td></tr>";
        if (selector.Entrance.length > 1) {
            var dementiaCafeEntrance = "<tr><td class='dementiaCafeCell'><i class='cafeDetail fa fa-fw fa-cutlery'></i></td><td class='dementiaCafeCell'>" + selector.Entrance + "</td></tr>";
        } else {
            var dementiaCafeEntrance = "";
        }

        dementiaCafeDetails.innerHTML = dementiaCafeAddress + dementiaCafeDay + dementiaCafeTime + dementiaCafeEntrance;

        // Add a new marker in
        var dementiaCafeLat = Number(selector.Lat);
        var dementiaCafeLng = Number(selector.Lng);

        var markersArray = Ember.A([{
            title: cafe,
            body: 'Here is some test',
            lat: dementiaCafeLat,
            lng: dementiaCafeLng,
    }, ]);

        this.set('lat', dementiaCafeLat);
        this.set('lng', dementiaCafeLng);
        this.set('markers', markersArray);
        this.set('zoom', 16);

    }.observes('selectedOption'),

    setup: function () {
        this.setProperties({
            lat: 53.801277,
            lng: -1.548567,
            zoom: 12,
            markers: Ember.A([]),
            selectedItem: null
        });
    }.on('init'),

    onInsertElement: function () {
        var obj = this;

        setTimeout(function () {
            obj.set('loaded', true);
        });

        // Array to contain list of wards. This content is then shown in the selection box.
        var items = [];
        var dementiaCafesLocation;

        // Load the papa parse script
        $.getScript("http://www.imactivate.com/datadashboardfiles/PapaParse-4.1.0/papaparse.js", function () {
            Papa.parse('http://tomforth.co.uk/widgetCSV/dementiaCafes.csv', {
                download: true,
                complete: function (results) {
                    dementiaCafesData = create3DjsonWithUniqueFieldNames(results.data);
                    dementiaCafesLocation = Object.keys(dementiaCafesData);
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

                for (k = 0; k < dementiaCafesLocation.length; k++) {

                    var individualItem = {
                        id: dementiaCafesLocation[k],
                        title: dementiaCafesLocation[k],
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
    
    mapStyles: [{
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#0c0b0b"
    }]
  }, {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [{
            "color": "#f2f2f2"
    }]
  }, {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "road",
        "elementType": "all",
        "stylers": [{
            "saturation": -100
    }, {
            "lightness": 45
    }]
  }, {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#090909"
    }]
  }, {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [{
            "visibility": "simplified"
    }]
  }, {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [{
            "visibility": "off"
    }]
  }, {
        "featureType": "water",
        "elementType": "all",
        "stylers": [{
            "color": "#d4e4eb"
    }, {
            "visibility": "on"
    }]
  }, {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{
            "visibility": "on"
    }, {
            "color": "#fef7f7"
    }]
  }, {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{
            "color": "#9b7f7f"
    }]
  }, {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [{
            "color": "#fef7f7"
    }]
  }]

});