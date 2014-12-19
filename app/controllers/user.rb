Bvip.controllers :user do
  # Flow for loggin in the user
  post :login do
    conn = Faraday.new
    input_hash = JSON.parse(request.body.read) 
    input_hash["device_token"] = "475E51BE-F055-47F7-BEC3-36FEAE150C86"
    conn.params  = input_hash
    conn.headers = {'Accept' => 'application/json', 'X-API-Key'=>'foobar'}
    res = conn.get 'https://app.beyondvip.com/api/v1/tokens.json'
    puts JSON.parse(res.body)
    resp = {}         
  end  
end
