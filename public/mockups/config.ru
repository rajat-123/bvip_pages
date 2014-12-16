require 'sinatra/base'
require 'haml'
require 'net/https'
require 'uri'
require 'json'

class SinatraStaticServer < Sinatra::Base

  def protected!
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="Restricted Area")
      throw(:halt, [401, "Oops... we need your login name & password\n"])
    end
  end
  
  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.credentials && @auth.credentials == ['admin', 'allowMME']
  end
  
  get(/.+/) do
    protected!
    send_sinatra_file(request.path) {404}
  end

  def send_sinatra_file(path, &missing_file_block)
    file_path = File.join(File.dirname(__FILE__), path)
    file_path = File.join(file_path, 'index.html') unless file_path =~ /\.[a-z]+$/i   
    File.exist?(file_path) ? send_file(file_path) : missing_file_block.call
  end
end
run SinatraStaticServer
