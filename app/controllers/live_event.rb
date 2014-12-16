require 'tzinfo'
Mme.controllers :live do

  get '/get_calendar_events' do   
  	
  	logger.debug params[:timezone]
   	if !params[:timezone].nil?
	   tz = TZInfo::Timezone.get(params[:timezone])
	   timevar =  tz.local_to_utc(Time.parse(params[:start_time]))   
	   timevar = timevar.to_s.split

	   params[:start_time] = timevar[1].gsub!(":", "-") #Replacing : in time with - 
	   params[:start_date] = timevar[0]
	  
	   logger.debug params
	else 
	   params[:start_time] = ""
  	   params[:start_date] = ""	
	end
	live_event_data =  LiveEvent.get_supporterdetails(params[:start_date], params[:start_time], params[:nextprev])
	logger.debug " Live Event data is #{live_event_data}" 
	live_event_data.to_json
  end
end