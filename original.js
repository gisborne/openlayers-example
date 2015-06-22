
  // Addresses:
  // Red pin: Rental item locations
  // -------------------------------------------
  // 4625 Texas St., San Diego, CA. 92116     || coords: -117.138475,32.761480
  // 2267 Boundary St., San Diego, CA. 92104  || coords: -117.116083,32.729552
  // 4711 Kansas St., San Diego, CA. 92116    || coords: -117.131207,32.763225
  // 3200 6th Ave., San Diego, CA. 92103      || coords: -117.159727,32.739113
  // 1642 7th Ave., San Diego, CA. 92104      || coords: -117.159063,32.722439

  // Green pin: Renter's location
  //-------------------------------------------
  // 3803 Ray Street, San Diego, CA. 92104    || coords: -117.129137,32.747502

  // mapAttributesPlus = {'/images/red-pin.png': [
  //  ["4625 Texas St.,<br>San Diego, CA. 92116",
  //  [-117.138475,32.761480]],
  //  ["2267 Boundary St.,<br>San Diego, CA. 92104",
  //  [-117.116083,32.729552]],
  //  ["4711 Kansas St.,<br>San Diego, CA. 92116",
  //  [-117.131207,32.763225]],
  //  ["3200 6th Ave.,<br>San Diego, CA. 92103",
  //  [-117.159727,32.739113]],
  //  ["1642 7th Ave.,<br>San Diego, CA. 92104",
  //  [-117.159063,32.722439]]],
  //   '/images/green-pin.png': [
  //  ["3803 Ray Street,<br>San Diego, CA. 92104",
  //  [-117.129137,32.747502]]] }
  //
  //   mapAttributes = {'/images/red-pin.png': [[-117.138475,32.761480], [-117.116083,32.729552],[-117.131207,32.763225],[-117.159727,32.739113], [-117.159063,32.722439]],
  //     '/images/green-pin.png': [[-117.129137,32.747502]]}

window.RentMyThing = window.RentMyThing || {}
window.RentMyThing.drawMap = function drawMap (mapAttributesPlus) {
    var popuplabel = '';
    var iconLocations = [];
    var vectorSource = new ol.source.Vector({
     //create empty vector -- not sure if this is needed??????
    });
    $('.map').html('');
    // Outer Loop to retrieve each pin type
    Object.keys(mapAttributesPlus).forEach(function(pinType) {


      // Inner Loop to retrieve all coordinates associated with each pin type
        mapAttributesPlus[pinType].forEach(function(attributes) {

          address = attributes["address"]
          coords = attributes["coords"]
          highlight = attributes["highlight"]


        var iconLocation = ol.proj.transform([coords[0], coords[1]], 'EPSG:4326', 'EPSG:3857')
        iconLocations.push(iconLocation)
        popupLabel = address
        console.log("Address: " + address + "Lon/Lat: " + coords[0] + ', ' + coords[1]);

        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(iconLocation),
          // Added line for popup
          name: popupLabel
        })

        iconFeature.highlight = highlight;

        // // $('#' + highlight).data('icon', iconFeature);
        // $('#' + highlight).hover(function(evt) {
        //   highlight_icon(iconFeature);
        // },
        //   function(evt) {
        //     unhighlight_icon(iconFeature)
        // })
        //$(this).data('ci')
        // Create Pin styling
        iconFeature.setStyle(
          new ol.style.Style({
            image: new ol.style.Icon({
              anchor: [0.2, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              opacity: 0.75,
              src: pinType  // Set pin type
            })
          })
        )
        vectorSource.addFeature(iconFeature);
      }) // End of inner loop - coords
    }); // End of outer loop - pinType

    // *************Create Vector Layer with Markers and Build Map ***************************
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
//      style: iconStyle
    });

    var map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          title: "Rental Proximity Map",
          source: new ol.source.MapQuest({layer: 'osm'})
        }), vectorLayer],
      view: new ol.View({
       center: iconLocations[0],          // ??? Do i need a centering point at this point.
        zoom: 12
      }),
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }}).extend([
          new ol.control.ScaleLine()
        ])
    });

    // Bound the map if multiple points

    var view = map.getView()
    var extent = ol.extent.boundingExtent(iconLocations)
    var size = map.getSize()
    view.fitExtent(extent, size)
    // If only one coordinate then binding map on that one point will produce
    // a map that is zoomed in so close it will appear that no map is  displayed
    // so we want to prevent the map zoom from going to high hence "if statement below"
    if (view.getZoom() > 16) {
      view.setZoom(16);
    }

    Window.map = map;
    // ***********************************************
    //  Popup logic
    // http://openlayers.org/en/v3.0.0/examples/icon.js
    // ***********************************************

    // The line below is required to get popup to appear
    var element = $('.popup').first();

    var popup = new ol.Overlay({
      element: element,
      positioning: 'auto top',
      stopEvent: false
    });
    map.addOverlay(popup);

    var showing;
    // display popup on click
    map.on('pointermove', function(evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });
      if (feature) {
        // Showing flag was added to remove popover from flickering when the mouse is hovered over the
        // icon/marker and there is incidental/minor movement in the mouse. Setting the show flag ensures
        // that you don't attempt to redraw the popup over and over (and get flickering) with minor mouse
        // movements
        if (! showing) {
          showing = true;
         var highlight = feature.highlight
         // Code to highlight the posting element in the posting table associate
         $('#' + highlight).addClass("highlightRow")
          var name = feature.get('name')
          var geometry = feature.getGeometry();
          var coord = geometry.getCoordinates();

          // Next line Added for testing
          // var element = $('.popup').this
          popup.setPosition(coord);

          // The line below fixed the scenario where clicking on one marker (e.g., 'renter')
          // and then immediately clicking on another marker (e.g, 'rental')  caused the wrong popup
          // content to appear on the newly clicked marker (e.g., popup displayed 'renter' rather than
          // rental). The line below uses jQuery method .attr to put the value of the newly clicked
          // marker value (i.e., name) into the HTML in the location that bootstrap pull the
          // the popup value (i.e., 'data-content')
          $(element).attr('data-content', name)

          $(element).popover({
            'trigger': 'hover click',
            'placement': 'auto top',
            'html': true,
            'content': name,
            // Had to add container to make "auto" placement work properly
            container: $('.map').first()
          });
          $(element).popover('show');
        }
      } else {
        showing = false;
       $("tr.whitelink").removeClass("highlightRow")
        $(element).popover('destroy');
      }
    });

    // change mouse cursor when over marker
    // map.on('pointermove', function(e) {
    map.onmousemove = function(e) {
      if (e.dragging) {
        $(element).popover('destroy');
        return;
      }
      var pixel = map.getEventPixel(e.originalEvent);
      var hit = map.hasFeatureAtPixel(pixel);
      var target = document.getElementById(map.getTarget());
      target.style.cursor = hit ? 'pointer' : '';
    };
  } // End of drawmap function
