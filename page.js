var learnSD = learnSD || {};

$(function() {
  var addrTemplate = $('.hidden .address')
  var addrDiv = $('#addresses')
  var addrForm = $('#address-form')
  var geo = learnSD.geocodeSerialized

  function displayMappedAddress(addr, coords) {
    var panel = addrTemplate.clone()
    $(panel).find('.panel-body').html(addr)
    addrDiv.append(panel)
  }

  function handleGeocodeError(jqxhr, msg, err) {
    alert(msg + err)
  }

  function handleGeoCoded(data) {
    var result = data[0]
    var name = result.display_name
    displayMappedAddress(name)
  }

  function mapAddress() {
    var addr = $('#address-form').serialize()
    var call = geo(addr)
    call.done(handleGeoCoded)
    call.fail(handleGeocodeError)
  }
  $('#map-address').click(mapAddress)
})
