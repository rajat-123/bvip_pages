Mme.controllers :artist do

  get :zxc, :map => "/base/:name" do
    # TODO: for now we are doing a lookup by Id
    logger.debug "#{params[:name]}"
    # @artist = Account.new(Account.get("?ids="+ params[:name])[0])   \

    if params[:name] == "Srinivas"


      @artist = {:artist_card_bg_image => "https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015329/b3ibdc2n2i311bnahjay.jpg", :avatar =>"https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015324/cuarinoqmsksr1l11umd.jpg", :bio => "Some people are born just to make software more beautiful, Srinivas Rao Chunduru is one among them. A QA by profession and a wrestler by hobby", :desc => "Srinivas Rao was not destined to become an QA. \u201cI grew up in a really little town in Belgium, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a ballerina. I danced from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young musician who ignores her fate, and pours her anxieties into her songs and her guitar. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into soul, funk and reggae melodies, trying hard to be worthy of her idols, Lauryn Hill, Erykah Badu and Bob Marley. She sings in local clubs on the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Srinivas",:id => 52,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Rao Chunduru",:phase_id =>1, :user_type =>1}

    elsif params[:name] == "Rajat"

      @artist = {:artist_card_bg_image => "http://res.cloudinary.com/dnocxteuc/image/upload/v1389006177/P1010237_z99i2f.jpg", :avatar =>"http://res.cloudinary.com/dnocxteuc/image/upload/v1389006189/P1010244_o0awz1.jpg", :bio => "Long before Rajat Chowdhary was born, it was known that he would code. And this turned out to be true", :desc => "Rajat Chowdhary was  destined to become a fundoo coder. \u201cI grew up in a really little town in Belgium, and none of my family was into software,\u201d reveals the twenty\u2010one year old, with refreshing sincerity. \u201cAs a kid, I wanted to be a ballerina. I danced from the age of six to twelve\u201d.<br/><br/>Even without romanticising it, her story is like a fairy tale. It\u2019s the story of a young musician who ignores her fate, and pours her anxieties into her songs and her guitar. \u201cI had all these worries and depressions that I wrote down, it was a way of structuring my thoughts\u201d. She turns her doubts into soul, funk and reggae melodies, trying hard to be worthy of her idols, Lauryn Hill, Erykah Badu and Bob Marley. She sings in local clubs on the weekend and attends high school during the week.<br/><br/>She records in home\u2010studios, at friends houses, and publishes drafts of her songs on Myspace, without a thought of making a career in music. What happens next seems almost unreal.", :first_name => "Rajat",:id => 53,:images => "{https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015863/gbmqpx1cpcbaiprvk0xt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015873/yvian0uk4hzentelpjzt.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015878/y0tofzecspx2yzhenoew.jpg,https://res.cloudinary.com/dywvbs9cv/image/upload/v1386015883/vzes06b9nko53f4vjkwj.jpg}", :last_name =>"Chowdhary",:phase_id =>2, :user_type =>1}

    end
      
    # Refactor, check if this is still needed.  
    
    @artist_id = "#{params[:name]}"
    @ng_app = "homeApp"
    @cloudinary_params = get_cloudinary_params
    @cloudinary_api = get_cloudinary_api
    # @bg_image = "#{@artist.bg_image}"
    render 'artist/index', :layout => false
  end

  get :funding do
    @ng_app ="homeApp"
    render 'artist/funding', :layout => false
  end

  get :social do
    @ng_app = "homeApp"
    render 'artist/social', :layout => false
  end    
end