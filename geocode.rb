require 'net/http'
require 'json'

module RentMyThing
  def geocode address
    l = Logger.new 'geocode.log'

    l.debug "***** geocode #{address}"
    uri = URI 'http://nominatim.openstreetmap.org/search'
    uri.query = URI.encode_www_form format: 'json', q: address

    res = Net::HTTP.get_response uri
    if res.is_a? Net::HTTPSuccess
      result = JSON.parse res.body
      l.debug res.body
      yield result[0]['lon'], result[0]['lat']
    else
      l = Logger.new 'geocode.log'
      l.error "Failed request for #{address}: res.inspect"
    end
  end

  module_function :geocode
end
