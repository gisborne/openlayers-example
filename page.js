var learnSD = learnSD || {};

$(function() {
  var addrTemplate = $('.hidden .address')
  var addrDiv = $('#addresses')
  var addrForm = $('#address-form')
  var geo = learnSD.geocodeSerialized
  var map = learnSD.initMap(document.getElementById('map'))
  learnSD.map = map

  function displayPin(addr, data, panel) {
    var coords = [Number(data.lon), Number(data.lat)]
    return map.addPin({
      coords: coords
    })
  }

  function displayMappedAddress(addr, data) {
    var panel = $(addrTemplate.clone())
    panel.find('.panel-body').html(addr)
    panel.data('data', data)
    addrDiv.append(panel)
    var pin = displayPin(addr, data, panel)
    addrDiv.find('.btn').click(function deletePin() {
      map.removePin(pin)
      panel.remove()
    })
  }

  function handleGeocodeError(jqxhr, msg, err) {
    alert(msg + err)
  }

  function prettify(addr) {
    var parts = addr.split(', ')
    var rest = parts.slice(1)
    rest[0] = parts[0] + ' ' + rest[0]
    return rest.join('<br>')
  }

  function handleGeoCoded(data) {
    var result = data[0]
    var addr = prettify(result.display_name)
    displayMappedAddress(addr, result)
  }

  function mapAddress() {
    var addr = $('#address-form').serialize()
    var call = geo(addr)
    call.done(handleGeoCoded)
    call.fail(handleGeocodeError)
  }
  $('#map-address').click(mapAddress)
})
