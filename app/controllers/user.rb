Bvip.controllers :user do
  # Flow for loggin in the user
  post :login do
    content_type :json
    input_hash = JSON.parse(request.body.read)    
    puts input_hash
    resp = {}   
    begin
      resp = User.post("sign_in", nil, input_hash)
      resp = resp.merge({:success => true})      
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
end
