# Controller for keeping track of user like, share actions on the media

Mme.controllers :media do

  post :like do
    content_type :json
    input_hash = JSON.parse(request.body.read)
    if is_authenticated?
      begin
      # makes a POST call to /media url
        Like.new({:user_id => get_loggedin_userid,
                   :object_id => input_hash["object_id"],
                   :object_type => "media",
                   :network_id => 0,
                   :reachability_count => 1
                  }).save
      add_liked_data("songs", input_hash["object_id"])
      rescue Exception => e
        logger.error "Media like din't go through, #{e.message}"
      end
    end
  end

  post :share do
    content_type :json
    input_hash = JSON.parse(request.body.read)
    if is_authenticated?
      begin             
        Share.new({:user_id => get_loggedin_userid,
                   :object_id => input_hash["object_id"],                 
                   :object_type => "user",
                   :network_id => input_hash["network_id"]                  
                  }).save
      rescue Exception => e
        logger.error "Media Share din't go through: #{e.message}"
      end
    end
  end

   post :play do
    content_type :json
    input_hash = JSON.parse(request.body.read)
    if is_authenticated?
      begin
        Play.new({:user_id => get_loggedin_userid,
                   :object_id => input_hash["object_id"],
                   :object_type => "media",
                   :network_id => 0,
                   :reachability_count => 1
                  }).save
      rescue Exception => e
          logger.error "Media Play couldn't be updated: #{e.message}"
      end
    end
  end

  # Getting the complete list of media
  get :list, :map => "/media/artist/:id" do
    Media.get(params[:id]).to_json
  end 

  get '/share' do   
    begin
      share_response = Share.new({:user_id => get_loggedin_userid,
                 :object_id => params[:object_id],
                 :object_type => if "audio" == params[:media] then "media" else "user" end,
                 :network_id => if params[:nw_type] == "twitter" then 1 else 2 end,
                 :reachability_count => get_friends_count(params[:nw_type] == "twitter" ? "twitter" : "facebook")
                }).save     
    rescue Exception => e
       logger.error "There was an error: #{e.message}"  
       logger.error "We are failing silently FIXME"
    end 
    data  = JSON.parse(share_response.body)
    nw_hash = {:facebook => "#{is_loggedin_to?('facebook')}", :twitter => "#{is_loggedin_to?('twitter')}"}      

    if "audio" == params[:media]
      render_partial "media/audio_share", :locals => {:object_id => params[:object_id], :artist_stats => data["artist_stats"].to_json,
                                                      :crowd_stats => data["crowd_stats"].to_json, :logged_in => get_loggedin_userid,
                                                      :nw_hash => nw_hash}
    else
      render_partial "media/media_share" , :locals => {:nwtype => params[:nw_type], :artist_stats => data["artist_stats"].to_json,
                                                       :crowd_stats => data["crowd_stats"].to_json
                                                      }
    end
  end

  post :add_to_playlist do
    content_type :json
    input_hash = JSON.parse(request.body.read)
    if is_authenticated?
      begin             
        Playlist.new({:userid => get_loggedin_userid,
                      :media_id => input_hash["media_id"]                 
                    }).save
      rescue Exception => e
        logger.error "Adding Media to User Playlist din't go through: #{e.message}"
      end
    end
  end

  delete :remove_from_playlist do
    playlist_media_id = "#{params[:media_id]}"
    logger.debug "Removing Media Id #{playlist_media_id} from playlist"  

    Playlist.new({:userid => get_loggedin_userid}).delete(playlist_media_id)
  end

  get :top_songs do
    content_type :json
    songs = Base.top_songs();

    songs.each{|song|
      if song["artist_info"]["avatar"].blank?
        song["artist_info"]["avatar"] = 'images/default_arist_image.jpg'
      else
        # code below to get the 125X100 size image from cloudinary, for faster load
        song["artist_info"]["avatar"] = song["artist_info"]["avatar"].split('/').insert(6, "w_100,h_75,c_fit")* "/"
      end   
    }

    songs.to_json
  end

end
