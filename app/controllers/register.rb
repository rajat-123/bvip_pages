require 'fql'
require 'oauth'

def get_twitter_followers_count(oauth_token, oauth_token_secret, uid)  
  consumer = OAuth::Consumer.new(TWITTER_APP_ID, TWITTER_APP_SECRET,
    { :site => "http://api.twitter.com",
      :scheme => :header
    })
  token_hash = {:oauth_token => oauth_token,
                :oauth_token_secret => oauth_token_secret
               }
  access_token = OAuth::AccessToken.from_hash(consumer, token_hash)
  response = access_token.request(:get, "https://api.twitter.com/1.1/users/show.json?user_id=#{uid}")  
  recd_data = JSON.parse(response.body) 
  logger.debug recd_data
  return recd_data["followers_count"]
end

Mme.controllers :register do
  get '/' do
    @ng_app = "homeApp"
    render 'register/index', :layout => false
  end

  get '/login' do
    @ng_app = "homeApp"
    render 'register/login', :layout => false
  end

  get '/step1' do
    render 'register/step1', :layout => false
  end

  get '/step2' do
    @cloudinary_params = get_cloudinary_params
    @cloudinary_api = get_cloudinary_api
    render 'register/step2', :layout => false
  end

  post '/audio' do   
    @metadata = {}    
    begin
      Mp3Info.open( params['file'][:tempfile] ) do |m|          
        if Cloudinary.config.api_key.blank?
          #TODO fix the below path        
          require './././config/initializers/cloudinary.rb'           
        end
        @metadata['title'] = m.tag.title
        @metadata['artist'] = m.tag.artist
        @metadata['album'] = m.tag.album
        @metadata['length'] = m.length 
        pictures = m.tag2.pictures
        begin
          if !pictures.to_a.empty?
            # pictures.each do |description, data|
            File.binwrite(pictures.first[0], pictures.first[1]) # description ends with (.jpg / .png) for easy writing to file     
            a = Cloudinary::Uploader.upload(pictures.first[0])
            @metadata['cldy_url'] = a['secure_url']        
          end
        rescue Exception => e
          logger.error "Audio Albumart couldn't be read: #{e.message}"
        end           
        logger.debug "Final Metadata #{@metadata}"   
      end
    rescue Exception => e
      logger.error "FIXME Audio metadata was unread, MP3Info failed"
    end
    filename = "#{Time.now.to_i}." + params['file'][:filename]
    s3_data = AwsWrapper.write_to_s3(filename, params['file'][:tempfile].read, "/songs", {:access => :public_read, :expires => Time.mktime(2038, 1, 18).to_i, :use_s3_base => true})
    content_type :json
    {:audio_title => @metadata['title'],:metadata => @metadata, :filename => params['file'][:filename], :s3_filename => s3_data[:s3_filename]}.to_json    
  end

  get :auth, :map =>'/auth/:provider/callback' do   
    
    auth_hash = request.env['omniauth.auth']      
    logger.info "Registering or Login or Update == #{auth_hash}"

    if is_authenticated?    #User is logged in, send PUT call to update n/w data.    
      network_data = {:id => get_loggedin_userid, :access => {:network_id => auth_hash['uid'], 
                               :network_type => if auth_hash['provider'] == "twitter" then 1 else 2 end,
                               :access_token => auth_hash['credentials']['token'],  
                               :screen_name => if auth_hash['extra']['raw_info']['screen_name'] then auth_hash['extra']['raw_info']['screen_name'] else auth_hash['extra']['raw_info']['username'] end,
                               :secret =>  if auth_hash['credentials']['secret'] then auth_hash['credentials']['secret'] end
                     }}            
      begin
        Account.new(network_data, true).save()
      rescue Exception => e
        logger.error "FIXME: network data din't get updated, #{e.message}" 
      end
      set_user_network (auth_hash['provider']) #Setting Nwtype in session.
    else
      # logger.debug auth_hash['extra']['raw_info'] 
      rand_password = (0...8).map{(65+rand(26)).chr}.join  
      if auth_hash['provider'] == "twitter"         
       name_array = auth_hash['info']['name'].split
       auth_hash['info']['first_name'] =  name_array[0]
       auth_hash['info']['last_name'] =  name_array[1]
       auth_hash['info']['email'] = auth_hash['info']['nickname'] + "@twitter.com"
      end

      user_data = {:first_name => auth_hash['info']['first_name'],
                   :last_name => auth_hash['info']['last_name'],
                   :email => auth_hash['info']['email'],
                   :phone_number => "0912345999",
                   :password => rand_password, 
                   :password_confirmation => rand_password,
                   :user_type => 0,
                   :avatar => if auth_hash['info']['profile_image_url'] then auth_hash['info']['profile_image_url'] else auth_hash['info']['image'] end, 
                   :access => {:network_id => auth_hash['uid'], 
                               :network_type => if auth_hash['provider'] == "twitter" then 1 else 2 end,
                               :access_token => auth_hash['credentials']['token'],  
                               :screen_name => if auth_hash['extra']['raw_info']['screen_name'] then auth_hash['extra']['raw_info']['screen_name'] else auth_hash['extra']['raw_info']['username'] end,
                               :secret =>  if auth_hash['credentials']['secret'] then auth_hash['credentials']['secret'] end
                              }                                      
      }                 
      crowd_user = Account.new(user_data)                 
      # TODO: right now this hash is not going back to UI, fix merge
      resp = {}
      begin          
        crowd_user.save()          
        set_user_loggedin(crowd_user)        
      rescue Exception => e
        logger.error "FIXME user din't get logged: #{e.message}"            
      end
      set_user_network (auth_hash['provider'])  #Adding network type to session
    end     

    if(!get_friends_count(auth_hash['provider']))
      if(auth_hash['provider'] == "twitter")
        followers_count = get_twitter_followers_count(OAUTH_TOKEN, OAUTH_TOKEN_SECRET, auth_hash['uid'])
        set_friends_count(auth_hash['provider'], followers_count)
        logger.debug "Setting twitter followers_count to #{followers_count}"
      else
        options = { :access_token => auth_hash['credentials']['token'] }
        data = Fql.execute({"query1" => "SELECT friend_count FROM user WHERE uid = #{auth_hash['uid']}"    
        })  
        logger.debug "friends count is #{data}"                                                     
        set_friends_count(auth_hash['provider'], data[0]["friend_count"])        
      end
    end
    logger.debug session[:user]

    if "share" == env["omniauth.params"]["from"] #IF redirected here through share, sending share call.   
      logger.debug "sending reachability_count to API"
      logger.error get_friends_count(auth_hash['provider'])   
      begin        
        share_response = Share.new({:user_id => get_loggedin_userid,
                   :object_id => env["omniauth.params"]["object_id"],
                   :object_type => if "audio" == env["omniauth.params"]["media"] then "media" else "user" end,
                   :network_id => if auth_hash['provider'] == "twitter" then 1 else 2 end,
                   :reachability_count => get_friends_count(auth_hash['provider'])
                  }).save
       share_resp_data  = JSON.parse(share_response.body)
      rescue Exception => e
        logger.error "FIXME share data dint get updated, #{e.message}"      
      end
    end

    if "like" == env["omniauth.params"]["from"] #IF redirected here through like, sending like call.
      begin
       like_response =  Like.new({:user_id => get_loggedin_userid,
                   :object_id => env["omniauth.params"]["object_id"],
                   :object_type => if "media" == env["omniauth.params"]["object"] then "media" else "user" end,
                   :network_id => 0,
                   :reachability_count => 1 #Value given by API.  
                  }).save  
        like_response_data  = JSON.parse(like_response.body)      
      rescue Exception => e
        logger.error "FIXME like data dint get updated, #{e.message}"
      end
    end

    if "ticket" == env["omniauth.params"]["buy"]
      begin
        event = Event.new({:id => get_loggedin_userid, :event_id => "#{env["omniauth.params"]["object_id"]}"}).save
      rescue Exception => e
        logger.error "FIXME, tickets din't get bought"             
      end   
    end

    nw_hash = {:facebook => "#{is_loggedin_to?('facebook')}", :twitter => "#{is_loggedin_to?('twitter')}"}      

    #TODO add call for buying tickets.     
    if "audio" == env["omniauth.params"]["media"]        
      render_partial "media/audio_share", :locals => {:nwtype => auth_hash['provider'],
                                          :object_id => env["omniauth.params"]["object_id"],
                                          :network => params[:provider],
                                          :artist_stats => share_resp_data["artist_stats"].to_json,
                                          :crowd_stats => share_resp_data["crowd_stats"].to_json,
                                          :logged_in => get_loggedin_userid,
                                          :nw_hash => nw_hash.to_json
                                        }   

    elsif "true" == env["omniauth.params"]["payment"]
      supporter_dtls = Account.get_supporterdetails(env["omniauth.params"]["artist_id"], get_loggedin_userid)
      render_partial "payment/payment_popup", :locals => {:artist_stats => supporter_dtls["artist_stats"].to_json,
                                                          :crowd_stats =>  supporter_dtls["crowd_stats"].to_json,
                                                          :logged_in => get_loggedin_userid,
                                                          :nw_hash => nw_hash.to_json
                                                         }

    elsif "like" == env["omniauth.params"]["from"]
      render_partial "media/like", :locals => {:object => env["omniauth.params"]["object"] ,
                                               :object_id => env["omniauth.params"]["object_id"],
                                               :artist_stats => like_response_data["artist_stats"].to_json,
                                               :crowd_stats => like_response_data["crowd_stats"].to_json
                                               }

    elsif "hangout" == env["omniauth.params"]["from"]
      render_partial "register/login"

    elsif  "share" == env["omniauth.params"]["from"]
      render_partial "register/oauth_settings", :locals => {:nwtype => auth_hash['provider'],
                                                            :share => env["omniauth.params"]["from"],
                                                            :network => params[:provider],
                                                            :artist_stats => share_resp_data["artist_stats"].to_json,
                                                            :crowd_stats => share_resp_data["crowd_stats"].to_json,
                                                            :nw_hash => nw_hash.to_json,
                                                            :logged_in => get_loggedin_userid,
                                                           } 
      
    else
      render_partial "register/oauth_settings", :locals => {:nwtype => auth_hash['provider'], :share => env["omniauth.params"]["from"], :network => params[:provider]} 
    end    
  end  
  
end