var apiKey;
var sessionId;

var token;
var session;
var maxParticipants;

function connectToSession(videoStreams, noOfParticipants) {
  apiKey = videoStreams.api_key;
  sessionId = videoStreams.session_id;

  token = videoStreams.token;
  session = TB.initSession(sessionId);

  maxParticipants = noOfParticipants;

  TB.setLogLevel(TB.DEBUG);

  session.addEventListener('sessionConnected', sessionConnectedHandler);
  session.addEventListener('streamCreated', streamCreatedHandler);
  session.addEventListener('streamDestroyed', streamDestroyedHandler);
  TB.addEventListener("exception", exceptionHandler); 

  session.connect(apiKey, token);
}

function exceptionHandler(event) {
 console.log("Exception occured");
 console.log(event);
}

function sessionConnectedHandler(event) {
  if(event.streams)
  {
    if(event.streams.length < maxParticipants)
    {
      var divProps = {width: 495, height:300, rememberDeviceAccess: true};
      var publisher = TB.initPublisher(apiKey, 'publisherContainer',divProps);
      session.publish(publisher);
    }
    subscribeToStreams(event.streams)
  }
}

function streamCreatedHandler(event) {
  // Subscribe to the newly created streams
  subscribeToStreams(event.streams);
}

function streamDestroyedHandler(event) {  
  // Get all destroyed streams    
  for (var i = 0; i < event.streams.length; i++) {
    // For each stream get the subscriber to that stream
    var subscribers = session.getSubscribersForStream(event.streams[i]);
    for (var j = 0; j < subscribers.length; j++) {
      // Then remove each stream
      
      var obj = document.getElementById(subscribers[j].id);
      var container = obj.parentNode;
      container.parentNode.removeChild(container);
    }
  }
}

function subscribeToStreams(streams) {
// For each stream
  for (var i = 0; i < streams.length; i++) {
    // Check if this is the stream that I am publishing, and if so do not subscribe.
    if (streams[i].connection.connectionId != session.connection.connectionId) {
      
      // Make a unique div id for this stream
      var divId = 'stream_' + streams[i].streamId;

      var container = document.createElement("div");
      var div = document.createElement("div");
      div.setAttribute('id', divId);
      
      container.appendChild(div);
      container.style.float = 'left';
      container.style.marginRight = '15px';

      var subscriberBox = document.getElementById('streamContainer');
      subscriberBox.appendChild(container);
      subscriberBox.style.display = 'inline-block';

      var divProps = {width: 150, height:150, name:"i stream"};
      session.subscribe(streams[i], divId, divProps);       
    }
  }
}