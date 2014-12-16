# Defines our constants
PADRINO_ENV  = ENV["PADRINO_ENV"] ||= ENV["RACK_ENV"] ||= "development"  unless defined?(PADRINO_ENV)
PADRINO_ROOT = File.expand_path('../..', __FILE__) unless defined?(PADRINO_ROOT)

# Load our dependencies
require 'rubygems' unless defined?(Gem)
require 'bundler/setup'
Bundler.require(:default, PADRINO_ENV)

##
# Enable devel logging
#
Padrino::Logger::Config[:development][:log_level]  = :debug
Padrino::Logger::Config[:development][:log_static] = true
Padrino::Logger::Config[:production][:stream] = :stdout
Padrino::Logger::Config[:production][:log_level]  = :debug
#

##
# Add your before load hooks here
#
Padrino.before_load do
end

##
# Add your after load hooks here
#
Padrino.after_load do
end

TWITTER_APP_ID = "HJ0CqcVELohv4ObqhmAi3Q"
TWITTER_APP_SECRET = "9BmFSukX0eZ8robOfrH74I9Qd0SnnjftNxWHhnkuac"
OAUTH_TOKEN = "416031234-aMCmEZ1MFi037Q9K6viKVUBKfZPKPgTVXyzlEPTL"
OAUTH_TOKEN_SECRET = "6gsE7i8LEoBMJgckqwnMAOKk6YPsFdXjBq8BTB5wT2z7t"

FACEBOOK_APP_ID = "497435066965743"
FACEBOOK_APP_SECRET = "2f5b043154254ed9ef2b456727613718"


Padrino.load!
