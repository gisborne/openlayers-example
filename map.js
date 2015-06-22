var learnSD = learnSD || {};
(function() {
  var iconLocations = []

  function addPin(attributes) {
    var coords = attributes["coords"]
    var lon = coords[0]
    var lat = coords[1]
    var pin = attributes["pin"] || '/images/red-ping.png'
    var popup = attributes["popup"] || function(){}
    var hover = attributes["hover"] || function(){}
    var click = attributes["click"] || function(){}


    var iconLocation = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857')
    iconLocations.push(iconLocation)
    popupLabel = address
    console.log("Lon/Lat: " + lon + ', ' + lat);

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
  }
  var vectorSource = new ol.source.Vector({
  });
  var vectorLayer = new ol.layer.Vector({
    source: vectorSource
  //      style: iconStyle
  });
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        title: "Example Map",
        source: new ol.source.MapQuest({layer: 'osm'})
      }), vectorLayer],
    view: new ol.View({
     center: iconLocations[0],
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
  //required to get popup to appear
  var element = $('.popup').first();

  var popup = new ol.Overlay({
    element: element,
    positioning: 'auto top',
    stopEvent: false
  });
  map.addOverlay(popup);

  var showing;

  map.on('pointermove', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
          return feature;
        });
    if (feature) {
      // showing is to avoid flicker
      if (! showing) {
        showing = true;
        var highlight = feature.highlight
        // Code to highlight the posting element in the posting table associate
        $('#' + highlight).addClass("highlightRow")
        var name = feature.get('name')
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();

        popup.setPosition(coord);

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
})()
