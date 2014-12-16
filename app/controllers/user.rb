require 'tzinfo'

Mme.controllers :user do
  # Flow for loggin in the user -- TODO: remove get_by_id with email
  post :login do
    content_type :json
    input_hash = JSON.parse(request.body.read)    
    resp = {}
    begin
      if !input_hash["id"].nil?                
       user =  Account.find(:all, :from => "/api/users?ids=#{input_hash["id"]}")[0]
       set_user_loggedin(user)       
      else
        user = User.new(:email => "#{input_hash["email"]}", :password => "#{input_hash["password"]}")
        user.save        
        set_user_loggedin(user)        
      end  
      # TODO: review, if the user object need to be sent back
      resp = resp.merge({:success => true, :id => user.id})      
    rescue Exception => e      
      status 400
      p "We are in exception"
      if e.response.code == "401"
        resp = resp.merge({:success => false, :err_code => $resp_err_codes[:validation], :err_message => "Email/Password do not match"})
      else
        resp = resp.merge({:success => false, :err_code => $resp_err_codes[:unknown], :err_message => "Unknown error occurred, please try later"})
      end
    end
    resp.to_json    
  end

  # registering a user account into the system -- we might have other actions like
  # artist, for an artist signup
  post :register do
    content_type :json
    new_account = JSON.parse(request.body.read)
    logger.debug "Input #{new_account.to_json}"
    
    # TODO: add the code to make API call
    $cache.set "user_#{new_account['email']}", new_account
    session[:user] = new_account
    # we need to make the API call
    resp = {};
    begin
      user = Account.create(new_account)
      set_user_loggedin(user)

      # TODO: review, if the user object need to be sent back
      resp = resp.merge({:success => true, :id => user.id})
    rescue Exception => e
      status 400
      if e.response.code == "423"
        resp = resp.merge({:success => false, :err_code => $resp_err_codes[:validation], :err_message => "Email already taken"})
      else
        resp = resp.merge({:success => false, :err_code => $resp_err_codes[:unknown], :err_message => "Unknown error occurred, please try later"})
      end      
    end
    resp.to_json
  end

  # method for sending a chat/photo message
  post :chat_send, :map => '/user/hangout_message' do
    Pusher.app_id = 37686
    Pusher.key = 'c3cd25bcc3b5f4182784'
    Pusher.secret = '85b0ba826604ae69f023'

    new_message = JSON.parse(request.body.read)
    new_message["first_name"] =  get_loggedin_username
    new_message["last_name"] = get_loggedin_lastname

    logger.debug new_message    
    Account.post("#{get_loggedin_userid}/events/#{new_message["event_id"]}/hangout_messages", nil, new_message.to_json)    
    channel = 'artist'
    
    # event = 
     
    Pusher[channel].trigger('notification', new_message)
  end

  #invoked from step2 of registration
  put :update_artist do
    input_hash = JSON.parse(request.body.read)

    ac_hash = {:id => get_loggedin_user[:id]}
    user_info = {}
    #only process the hash of media, if it's being posted
    if input_hash.include?("media")

      if input_hash.include?("user_info")
        user_info = input_hash["user_info"]
      end
        
      logger.debug user_info
      #TO-DO - change this logic of handling avatar,bg image - need to be moved to a common method
      # to be accessed by multiple controllers
      if (input_hash["media"]["image"].include?("profile_image"))
        user_info["avatar"] = input_hash["media"]["image"]["profile_image"]
      end
        
      if (input_hash["media"]["image"].include?("background_image"))
        user_info["bg_image"] = input_hash["media"]["image"]["background_image"]
      end

      if (input_hash["media"]["image"].include?("artist_card_bg_image"))
        user_info["artist_card_bg_image"] = input_hash["media"]["image"]["artist_card_bg_image"]
      end

      ac_hash = ac_hash.merge(user_info)
      #ac_hash = ac_hash.merge({:media => media_arr, :user_info => user_info})
    end
    logger.debug "Final json #{ac_hash.to_json}"
    Account.new(ac_hash, true).save()
  end

  #invoked from step2 of registration
  put :update_artist_media do
    input_hash = JSON.parse(request.body.read)
    media_hash = {:id => get_loggedin_user[:id]}

    media_arr = []
    user_info = {}

    if (input_hash["media"]["image"].include?("profile_image"))
      user_info["avatar"] = input_hash["media"]["image"]["profile_image"]
    end
      
    if (input_hash["media"]["image"].include?("background_image"))
      user_info["bg_image"] = input_hash["media"]["image"]["background_image"]
    end

    if (input_hash["media"]["image"].include?("image"))
      media_arr.push({:url => input_hash["media"]["image"]["image"], :media_type => $media_types[:image], :title => "picture", :desc => "picture"})
    end

    #if the data for audio exists -- then call media APIs
    if input_hash["media"].include?("audio") && input_hash["media"]["audio"].include?("url")
      media_arr.push(input_hash["media"]["audio"].merge(:media_type => $media_types[:audio]))
    end

    #if the data for video exists -- then call media APIs
    if input_hash["media"].include?("video")
      media_arr.push(input_hash["media"]["video"].merge(:media_type => $media_types[:video]))
    end

    # update account object if avatar or bg image is changed
    if (user_info.include?("avatar") || user_info.include?("bg_image"))
      ac_hash = media_hash.merge(user_info)
      logger.debug "Updating Avatar/Bg image #{ac_hash.to_json}"
      Account.new(ac_hash, true).save()
    end  

    media_hash = media_hash.merge({:medias => media_arr})
    logger.debug "Final media json #{media_hash.to_json}"

    #invoke user media update
    Account.save_media(get_loggedin_user[:id], media_hash)
  end


  #invoked from account of dashbaord
  put :update_account do 
    input_hash = JSON.parse(request.body.read)
    ac_hash = {:id => get_loggedin_user[:id]}.merge(input_hash)

    #invoke user update    
    Account.new(ac_hash, true).save()
  end

  # getting the list of artists for display on the home page
  get :top_artists do
    content_type :json
    # artist_arr = Account.all()\

    artist_arr = [{:artist_card_bg_image => "https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015329/b3ibdc2n2i311bnahjay.jpg", :avatar =>"https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015324/cuarinoqmsksr1l11umd.jpg", :bio => "Some people are born just to make software more beautiful, Srinivas Rao Chunduru is one among them. A QA by profession and a wrestler by hobby", :desc => "Srinivas Rao was not destined to become an QA. \u201cI grew up in a really little town in Belgium, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a ballerina. I danced from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young musician who ignores her fate, and pours her anxieties into her songs and her guitar. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into soul, funk and reggae melodies, trying hard to be worthy of her idols, Lauryn Hill, Erykah Badu and Bob Marley. She sings in local clubs on the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Srinivas",:id => 52,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Rao Chunduru",:phase_id =>1, :user_type =>1},

                  {:artist_card_bg_image => "http://res.cloudinary.com/dnocxteuc/image/upload/v1389006177/P1010237_z99i2f.jpg", :avatar =>"http://res.cloudinary.com/dnocxteuc/image/upload/v1389006189/P1010244_o0awz1.jpg", :bio => "Long before Rajat Chowdhary was born, it was known that he would code. And this turned out to be true", :desc => "Rajat Chowdhary was  destined to become a fundoo coder. \u201cI grew up in a really little town in Belgium, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a ballerina. I danced from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young musician who ignores her fate, and pours her anxieties into her songs and her guitar. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into code, funk and reggae melodies, trying hard to be worthy of her idols, Rupesh Bajaj. She codes during the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Rajat",:id => 53,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Chowdhary",:phase_id =>2, :user_type =>1}]


    logger.error artist_arr
    

    artist_arr.to_json
  end

  get :user_details do
    content_type :json
    user_dtls = Account.find(:all, :from => "/api/users?ids=#{params[:user_id]}")

    user_dtls.to_json
  end

  # getting the user details for logged in user
  get :loggedin_user_details do
    content_type :json
    user_dtls = Account.find(:all, :from => "/api/users?ids=#{get_loggedin_userid}")

    user_dtls.to_json
  end

  # getting the user media details for logged in user
  get :user_media do    
    user_media_dtls =  Account.find(:all, :from => "/api/users/#{params[:user_id]}/medias")
    logger.debug "User Details #{user_media_dtls}"  
    user_media_dtls.to_json
  end

  get :user_playlist do    
    user_playlist_dtls =  Account.find(:all, :from => "/api/users/#{params[:user_id]}/playlists")
    # logger.debug "User Playlist #{user_playlist_dtls}"  
    user_playlist_dtls.to_json
  end

  get :liked_items do      
    if(get_liked_data)
      logger.debug "getting from session"
      liked_data = get_liked_data
      logger.debug liked_data
      liked_data.to_json
    else 
      liked_items_dtls =  Account.get("#{get_loggedin_userid}/liked_items")
      logger.debug "Liked Items #{liked_items_dtls}"  
      set_liked_data(liked_items_dtls)
      logger.debug "making a call"
      liked_items_dtls.to_json      
    end            
  end

  #Getting all the contest details for an artist
  get :all_contests do    
    contest_dtls = Account.find(:all, :from => "/api/users/#{params[:user_id]}/events")    
    logger.debug "Contest Details #{contest_dtls}" 
    contest_dtls.to_json
  end

  get :ot_session do
    content_type :json
    if is_authenticated?
      begin             
        hangout_dtls = Hangout.find(:one, :from => "/api/users/#{get_loggedin_userid}/events/#{params["event_id"]}/join/#{params["ticket_token"]}")
        logger.debug "Hangout Details #{hangout_dtls}" 
        hangout_dtls.to_json
      rescue Exception => e        
        resp = {}
        status 400        
        error_body = JSON.parse(e.response.body)
        if e.response.code ==  "422"
          resp = resp.merge({:success => false, :err_code => $resp_err_codes[:validation], :err_message => "#{error_body["error"]}"})
        else
          resp = resp.merge({:success => false, :err_code => $resp_err_codes[:unknown], :err_message => "Unknown error occurred, please try later"})
        end
        logger.error "Joining Hangout din't go through: #{e.message}"
        resp.to_json
      end      
    end
  end

  get :hangout_image do
    @cloudinary_params = get_cloudinary_params
    @cloudinary_api = get_cloudinary_api
    render 'hangout_image', :layout => false
  end 

  get :artist_basic_dtls do 
    content_type :json
    # artist_basic_dtls = Account.get("?ids="+ params[:user_id])


    logger.error params
    if params[:user_id] == "Srinivas"


      artist_basic_dtls = [{:artist_card_bg_image => "https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015329/b3ibdc2n2i311bnahjay.jpg", :avatar =>"https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015324/cuarinoqmsksr1l11umd.jpg", :bio => "Some people are born just to make software more beautiful, Srinivas Rao Chunduru is one among them. A QA by profession and a wrestler by hobby", :desc => "Srinivas Rao was not destined to become an QA. \u201cI grew up in a really little town in Belgium, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a ballerina. I danced from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young musician who ignores her fate, and pours her anxieties into her songs and her guitar. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into soul, funk and reggae melodies, trying hard to be worthy of her idols, Lauryn Hill, Erykah Badu and Bob Marley. She sings in local clubs on the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Srinivas",:id => 52,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Rao Chunduru",:phase_id =>1, :user_type =>1}]

    elsif params[:user_id] == "Rajat"
      logger.debug params[:user_id]

      artist_basic_dtls = [{:artist_card_bg_image => "https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015329/b3ibdc2n2i311bnahjay.jpg", :avatar =>"https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015324/cuarinoqmsksr1l11umd.jpg", :bio => "Long before Rajat Chowdhary was born, it was known that he would code. And this turned out to be true", :desc => "Rajat Chowdhary was  destined to become a fundoo coder. \u201cHe grew up in a really little town in Brajrajnagar, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a architect. I played badminton from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young coder who ignores her fate, and pours her anxieties into her code and her software. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into soul, funk and reggae melodies, trying hard to be worthy of her idols, Lauryn Hill, Erykah Badu and Bob Marley. She sings in local clubs on the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Rajat ",:id => 53,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Chowdhary",:phase_id =>2, :user_type =>1}]
    else 
      p "do nothing"
    end





    # goal_dtls =  Account.get_goaldetails(params[:user_id])        
    logger.debug "Artist Basic dtls #{artist_basic_dtls}" 
    # logger.error goal_dtls.class 
    
    artist_basic_dtls.to_json

  end

  post :buy_tickets do
    if is_authenticated?
      input_hash =  JSON.parse(request.body.read)
      event = Event.new({:id => get_loggedin_userid, :event_id => "#{input_hash["event_id"]}"}).save            
    end
  end

  # getting the user details for logged in user
  delete :remove_user_media do    
    media_id = "#{params[:media_id]}"
    logger.debug "Deleting Media Id #{media_id}"  

    Media.new({:userid => get_loggedin_user[:id]}).delete(media_id)
  end

  # Flow for recording the artist's like action
  post :like do
    content_type :json
    input_hash = JSON.parse(request.body.read)
    logger.debug "Input  #{input_hash}"
    if is_authenticated?
      # makes a POST call to /media url
      Like.new({:user_id => get_loggedin_userid,
                 :object_id => input_hash["object_id"],
                 :object_type => "user",
                 :network_id => 0
                }).save
      add_liked_data("artists", input_hash["object_id"])
    end
  end

  post :create_event do

   input_hash = JSON.parse(request.body.read)
   tz = TZInfo::Timezone.get(input_hash["timezone"])
   logger.debug input_hash   
   input_hash["start_time"] =  tz.local_to_utc(Time.parse("#{input_hash["date"]}" + " " + "#{input_hash["time"]}" + ":00"))   
   input_hash["end_time"] = "2015-08-11 13:12"
   input_hash["user_id"] = get_loggedin_userid
   input_hash["event_type"] = "sample event"
   input_hash["total_seats"] = 100
   input_hash["price_per_seat"] = 100
   logger.debug input_hash
    Account.create_event(get_loggedin_userid, input_hash)
  end

  post :pledge_fund do    
    input_hash = JSON.parse request.body.read
    input_hash["payment_reason"] = "pledge"
    logger.debug input_hash
    resp = {}
    if is_authenticated?
      begin
        Account.pledge_fund(get_loggedin_userid, input_hash)
      rescue Exception => e      
        error_body = JSON.parse(e.response.body)
        if (e.response.code == "422") || (e.response.code == "423")
          status 400
          resp = resp.merge({:success => false, :err_code => $resp_err_codes[:unknown], :err_message => "#{error_body["error"]}"})          
          resp.to_json
        end
      end       
    end    
  end

  post :create_goal do      
    input_hash = JSON.parse(request.body.read)              
    send_data = {"goal_amount" => params[:goal_amount], "rewards" => input_hash}
    logger.debug send_data
    if is_authenticated?
      Account.create_goal(get_loggedin_userid, send_data)
    end
  end

  get :goal_details do
    content_type :json
    goal_dtls =  Account.get_goaldetails(params[:user_id])        
    logger.debug "Artist Goal & Rewards #{goal_dtls}" 
    # logger.error goal_dtls.class 
    if !goal_dtls.has_key?("rewards")
      goal_dtls["rewards"] = []
    end
    goal_dtls.to_json
  end

  get :supporter_details do
    supporter_dtls = Account.get_supporterdetails(params[:user_id], get_loggedin_userid)
    logger.debug "#{supporter_dtls}"
    supporter_dtls.to_json
  end

  get :booked_events do
    content_type :json
    booked_event_dtls = Account.get_bookedevents(params[:user_id])
    logger.debug "#{booked_event_dtls}"
    booked_event_dtls.to_json
  end

  get :supporter_levels do
    content_type :json
    supporter_levels = Account.get("#{get_loggedin_userid}/supporter_levels")
    logger.debug "#{supporter_levels}"
    supporter_levels.to_json
  end

  #invoked from account of dashbaord
  put :update_supporter_levels do 
    input_hash = JSON.parse(request.body.read)
    ac_hash = {:selected_levels => input_hash}

    #invoke user update    
    Account.update_supporter_levels(get_loggedin_user[:id], ac_hash)
  end

  get :img_upload do
    @cloudinary_params = get_cloudinary_params
    @cloudinary_api = get_cloudinary_api
    render 'image_upload', :layout => false
  end 
end
