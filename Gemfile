source 'https://rubygems.org'

# Server requirements (defaults to WEBrick)
gem 'thin'
# gem 'mongrel'

# Project requirements
gem 'rake'
gem 'sinatra-flash', :require => 'sinatra/flash'

gem 'activeresource', :require => 'active_resource'

# Component requirements
gem 'haml'
gem 'pusher'

# Test requirements
gem 'rspec', :group => "test"
gem 'rack-test', :require => "rack/test", :group => "test"

# Padrino Stable Gem
gem 'padrino', '0.12.4'

platforms :jruby do
  gem 'jruby-openssl'
  gem 'json-jruby'
end

gem 'omniauth'
gem 'omniauth-facebook', '1.3.0'
gem 'omniauth-twitter'

#testing mp3 metadata
gem 'ruby-mp3info'
gem 'cloudinary'

#Timezone gem
gem 'tzinfo'
gem 'tzinfo-data'


#Gem to get count of friends
gem 'fql'
gem 'oauth'

#gem 'memcache-client'
gem 'dalli'
group :production do
  gem 'rack-no-www'
end

gem 'prerender_rails'