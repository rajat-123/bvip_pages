Bvip.controllers :user do
  # Flow for loggin in the user
  post :login do
    conn = Faraday.new
    input_hash = JSON.parse(request.body.read) 
    input_hash["device_token"] = "475E51BE-F055-47F7-BEC3-36FEAE150C86"
    conn.params  = input_hash
    conn.headers = {'Accept' => 'application/json', 'X-API-Key'=>'foobar'}
    response = conn.post 'https://app.beyondvip.com/api/v1/tokens.json'
    resp = {}         
    if response.status == 200
      user = JSON.parse(response.body)
      set_user_loggedin(user)   
      resp = resp.merge({:user => true})  
    else
      resp = resp.merge({:error => 'error'})
    end
    resp.to_json
  end  
end