class RestConfig < ActiveResource::Base
  def self.headers
    {"Accept" => "application/vnd.mme-v1+json"}
  end

  if PADRINO_ENV == "production"
    RestConfig.site = ENV['REST_ENDPOINT_BASE']
  elsif PADRINO_ENV == "test"
    RestConfig.site = "https://app.beyondvip.com/api/v1/"
  else
    RestConfig.site = "https://localhost:3000/api/v1" 
    #"http://192.168.1.34:3000/api/"
    #RestConfig.site = "http://localhost:3000/api/"
  end
end

