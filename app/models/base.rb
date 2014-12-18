class User < RestConfig
  self.include_format_in_path = false
    def self.login(input_hash)
    	self.post("sign_in", nil, input_hash)
  	end
end