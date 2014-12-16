Mme.controllers :hangout do

  get :index, :map => "/hngout/:event_id/:token" do
    @ng_app = "homeApp" 
    @cloudinary_params = get_cloudinary_params
    @cloudinary_api = get_cloudinary_api
    @eid = params[:event_id]
    @ticket_token = params[:token]
    
    render 'hangout', :layout => false
  end

end