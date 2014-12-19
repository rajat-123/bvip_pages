Bvip.helpers do
  def is_authenticated?
    !session[:user].nil?
  end

  def username
    session[:user].email
  end  

  def get_loggedin_user
    return session[:user] if is_authenticated?
  end  

  def get_loggedin_userid
    loggedin_userid = session[:user][:id] if is_authenticated?
    loggedin_userid ||= -1
    return loggedin_userid
  end 

  def get_loggedin_username
    loggedin_username = session[:user][:first_name] if is_authenticated?
    loggedin_username ||= "Anonymous"
    return loggedin_username
  end 

  def get_loggedin_lastname
    loggedin_username = session[:user][:last_name] if is_authenticated?
    loggedin_username ||= "Anonymous"
  end

  def is_own_profile?(artist)
    artist.id == get_loggedin_userid
  end

  def set_user_loggedin (user)
    user_info = user["user_info"]
    session[:user] = {:auth_token => user["token"], :id => user_info["id"], :first_name => user_info["first_name"], :last_name => user_info["last_name"]}
  end

  def set_user_network (nw_type)
    session[:user][nw_type.to_sym] = {}
    session[:user][nw_type.to_sym]["is_logged"] = true    
  end

  def set_friends_count(nw_type, count)
    session[:user][nw_type.to_sym]["friends_count"] = count
  end 

  def get_friends_count(nw_type)    
    if session[:user].key?(nw_type.to_sym)  
      if !session[:user][nw_type.to_sym]["friends_count"].nil?        
        session[:user][nw_type.to_sym]["friends_count"]
      end
    else
      return false
    end
  end

  def set_liked_data(liked_data)
    session[:user][:liked_data] = liked_data
  end

  def add_liked_data(obj, id)    
    if "songs" == obj
      session[:user][:liked_data]["songs"].push(id)
    else
      session[:user][:liked_data]["artists"].push(id)
    end      
  end

  def get_liked_data
    if !session[:user][:liked_data].nil?      
      session[:user][:liked_data]
    else
      return false
    end
  end

  def is_loggedin_to?(nw_type)
    is_loggedin = true
    is_loggedin = !session[:user].nil?
    is_loggedin = is_loggedin && !session[:user][nw_type.to_sym].nil?
    is_loggedin && !session[:user][nw_type.to_sym]["is_logged"].nil?
  end

  def get_cloudinary_params
    @timestamp = Time.now.to_i
    { :api_key => "929627956167343",      
      :signature => Digest::SHA1.hexdigest( "timestamp=" + "#{@timestamp}" + "3KyQEWFz22sXOSYdnbZWD_ZHBRI"),
      :timestamp=> @timestamp 
    }.to_json
  end

  def get_cloudinary_api
   {:api_key => "929627956167343", :cloud_name => "dywvbs9cv"}.to_json
  end

end