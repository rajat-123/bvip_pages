require 'rack/session/dalli'
require 'rack/no-www'
require 'digest/sha1'

ActiveResource::Base.include_root_in_json = false
ActiveResource::Base.logger = Logger.new(STDERR)

class Mme < Padrino::Application
  # Forward www.xxx.yyy to xxx.yyy
  if PADRINO_ENV == "production"
    use Rack::NoWWW
  end

  use Rack::Prerender, prerender_service_url: 'http://fast-badlands-7211.herokuapp.com/'



  register Padrino::Rendering
  register Padrino::Mailer
  register Padrino::Helpers

  enable :sessions

  # definition of all constants
  $resp_err_codes = {:validation => 100, :unknown => 101}
  $media_types = {:profile_image => "profile_image", :background_image => "background_image", :image => 0, :audio => 1, :video => 2}
  # end of definition of all constants

  #enable :sessions
  

  

  if(PADRINO_ENV == "production")
    $cache = Dalli::Client.new(ENV['MEMCACHIER_SERVERS'], {:username => ENV['MEMCACHIER_USERNAME'], :password => ENV['MEMCACHIER_PASSWORD'], :keepalive => true, :socket_timeout => 3, :namespace => "ui-mme"})
  else
    use Rack::Session::Dalli, :memcache_server => '127.0.0.1', :expire_after => 3600, :namespace => "ui-mme"
    $cache = Dalli::Client.new('127.0.0.1',:namespace => "ui-mme")
  end

  # This block of code can move to boot.rb if required
  # to make it available in multi app within the project
  use OmniAuth::Builder do
    # provider :twitter,  'consumer_key', 'consumer_secret'
    # Configure provider values
    if PADRINO_ENV == "production"
      # For production deployment these below keys should be set as environment variable.
      OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE
      provider :facebook, ENV['FB_APP_ID'], ENV['FB_APP_SECRET'], :scope => 'email,user_birthday'
      provider :twitter, ENV['TW_APP_ID'], ENV['TW_APP_SECRET']
    else
      OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE
      provider :facebook, '497435066965743', '2f5b043154254ed9ef2b456727613718', :scope => 'email,user_birthday', :client_options => {:ssl => {:ca_path => "/etc/ssl/certs"}}
      provider :twitter, 'CP45o56ucRDa3kR0F0m0vg', 'PlxmItA4XfTqmXpXL6MNa4Ma2MUhqwgVebuxj17hdGM'
    end
  end

  get '/' do    
    redirect '/admin'
  end  

  get '/admin' do
    render 'home'
  end

  get '/home' do
    @ng_app = "homeApp" 
    render 'home'
  end

  # TODO: move this to appropriate controller later
  get '/logout' do
    session[:user] = nil
    redirect '/'
  end

  get '/dashboard' do
    protected!
    redirect '/register' unless is_authenticated?
 
    @ng_app = "homeApp" 
    @timestamp = Time.now.to_i
    @cloudinary_params = {
      :api_key => "929627956167343",      
      :signature => Digest::SHA1.hexdigest( "timestamp=" + "#{@timestamp}" + "3KyQEWFz22sXOSYdnbZWD_ZHBRI"),
     :timestamp=> @timestamp 
     }.to_json
    @cloudinary_api = {:api_key => "929627956167343", :cloud_name => "dywvbs9cv"}.to_json 
    render 'dashboard', :layout => false
  end
end

