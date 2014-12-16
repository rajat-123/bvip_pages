//pusher Chat directive
componentModule.directive('pusherChat', function($timeout, $sanitize) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      scope.messages = [];

      scope.initPusher = function(){
        $timeout(function(){
          var pusher = new Pusher('c3cd25bcc3b5f4182784');
          var channel = pusher.subscribe('artist');                     
          channel.bind('notification', function(data) {
            if(data.message_type == "image") {
              data.upload_time = new Date().getTime(); 
            }
            scope.messages.push(data);  
            scope.$apply(); 
            var elem = document.getElementById('chat_window');
            elem.scrollTop = elem.scrollHeight;     
          }); 
        }, 2000);
      }
      scope.initPusher();
    },
    templateUrl: '/js/angular/views/chat.html'
  };
});

//wrapper directive for OpenTok video chat
componentModule.directive('openTok', function($timeout) {
  return {
    restrict:'E',
    scope: {
        video_streams: '=videoStreams',
        max_publishers: '=maxPublishers',
        event_id: '=eventId',
        ticket_token: '=ticketToken'
    },
    template: '<div class="hangoutvideo" id="publisherContainer"></div>',
    link: function(scope, elm, attr){
      // Watches, to start loading the client libs

      scope.$parent.loadEvent(scope.event_id, scope.ticket_token);

      scope.$watch('video_streams', function () {
          if (angular.isDefined(scope.video_streams)){
            scope.initOpenTok();
          }          
      }, true); // true is for deep object equality checking

      scope.initOpenTok = function(){
        scope.session = TB.initSession(scope.video_streams.session_id);
        TB.setLogLevel(TB.DEBUG);

        scope.session.addEventListener('sessionConnected', scope.sessionConnectedHandler);
        scope.session.addEventListener('streamCreated', scope.streamCreatedHandler);
        scope.session.addEventListener('streamDestroyed', scope.streamDestroyedHandler);
        TB.addEventListener('exception', function(){
          console.log('Sorry... some exception occurred');
        }); 

        scope.session.connect(scope.video_streams.api_key, scope.video_streams.token);
      }

      scope.sessionConnectedHandler = function(event){
        //if (event.streams){
          //if(event.streams.length < scope.max_publishers)
          if(scope.video_streams.role == 'publisher') {
            scope.session.publish(TB.initPublisher(scope.video_streams.api_key, 'publisherContainer', {width: 630, height:473, rememberDeviceAccess: true, mirror: false}));
          }
          else if(event.streams && event.streams.length > 0)
          {
            //scope.subscribeToStreams(event.streams);
            scope.session.subscribe(event.streams[0], 'publisherContainer', {width: 630, height:473});
          }
        //}
      }

      scope.streamCreatedHandler = function(event){
        // Subscribe to the newly created streams
        //scope.subscribeToStreams(event.streams);
        if(scope.video_streams.role == 'subscriber')
          scope.session.subscribe(event.streams[0], 'publisherContainer', {width: 630, height:473});
      }

      scope.streamDestroyedHandler = function(event) {  
        // Get all destroyed streams    
        elm.find('publisherContainer').remove();
        /*for (var i = 0; i < event.streams.length; i++) {
          // For each stream get the subscriber to that stream
          var subscribers = scope.session.getSubscribersForStream(event.streams[i]);
          for (var j = 0; j < subscribers.length; j++) {
            // Then remove each stream
            elm.find('#'+subscribers[j].id).remove();
          }
        }*/
      }

      scope.subscribeToStreams = function(streams) {
        // For each stream
        for (var i = 0; i < streams.length; i++) {
          // Check if this is the stream that I am publishing, and if so do not subscribe.
          if (streams[i].connection.connectionId != scope.session.connection.connectionId) {
            
            // Make a unique div id for this stream
            var divId = 'stream_' + streams[i].streamId;

            var container = $("div").css('margin-right', '15px');
            container.append($("div").attr('id', divId));

            elm.find('#streamContainer').append(container);
            scope.session.subscribe(streams[i], divId, {width: 150, height:150, name:"i stream"});  
          }
        }
      }

    }
  }
});

//sets the current step of registration as active
componentModule.directive('subTab', function($location){
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, elm, attr){      
      scope.addActive = function(hashVal){        
        if (hashVal.indexOf(attr.subTab) >= 0){
          elm.parent().parent().parent().find('.active').removeClass('active');
          elm.addClass('active');
        }        
      }
      scope.$watch(function(){
        scope.addActive($location.path());
      })      
    }

  }
});

componentModule.directive('openRegWindow', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attr){      
      elm.click(function(e){        
        e.preventDefault();        
        window.open(elm.attr('href'),'Connect','toolbar=0,status=0,width=548,height=325');
      });
    }
  };
});

componentModule.directive('flipImageView', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      elm.hover(function(){
        elm.find('.hover').addClass('flip');
      },function(){
        elm.find('.hover').removeClass('flip');
      });
    },
    templateUrl: '/js/angular/views/artistImage.html'
  };
});


componentModule.directive('flipImagePreview', function() {
  return {
    restrict:'E',
    scope : {},
    link: function(scope, elm, attr){
      
      scope.showPreview = function() {
        scope.frontImage = $("form").scope().media.image['profile_image'];
        scope.backImage = $("form").scope().media.image['artist_card_bg_image'];

        elm.find('.imgPreview').show();
      }

      scope.closePreview = function() {
        elm.find('.imgPreview').hide();
      }

      elm.find('.hover').hover(function(){
        elm.find('.hover').addClass('flip');
      },function(){
        elm.find('.hover').removeClass('flip');
      });
    },
    templateUrl: '/js/angular/views/flipImagePreview.html'
  };
});

componentModule.directive('audioUpload', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr, ctrl){
      scope.audio_upload_in_progress = false; 
      scope.is_audio_entered = false;
      elm.find('.uploadForm').addClass(attr.baseClass);

      elm.find('.audio_button').click(function(e){
        elm.find('.audio_song').click();
      });


      $('.audio_song').fileupload({
        url: '/register/audio',
        dataType: 'json',
        done: function (e, data) {
          scope.audio_upload_in_progress = false; 
          scope.is_audio_entered = true;

          elm.find(".song_name").text(data.result.filename);
          
          // Setting s3 url to access audio
          $("form").scope().media.audio.meta_data = data.result.metadata;  
          $("form").scope().media.audio.url = data.result.s3_filename;              
          
          if(elm.find(".audio_title").val() == "") 
          {              
            elm.find(".audio_title").val(data.result.metadata.title);
            $("form").scope().media.audio.title  = data.result.metadata.title;
          }

          $(".audio_bar").css("width", "0%").parent().hide();             
        }
      });

      $('.audio_song').bind('fileuploadprogress', function (e, data) {        
        $(".audio_bar").css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();
        scope.audio_upload_in_progress = true; 
      });

      scope.isAudioFormInValid = function() {
        if(scope.audio_upload_in_progress || !scope.is_audio_entered)
          return true;
        return false;
      }  

      scope.resetAudioForm = function() {
        scope.media.audio.url = "";
        scope.media.audio.title = "";
        scope.media.audio.desc = "";
        elm.find(".song_name").text("");
        elm.find(".audio_title").val("");
        scope.showAudioUpload = false;
        scope.audio_upload_in_progress = false; 
        scope.is_audio_entered = false;
      }  
    },
    templateUrl: '/js/angular/views/audioUpload.html'
  };
});

componentModule.directive('videoUpload', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      elm.find('.uploadForm').addClass(attr.baseClass);

      scope.isVideoFormInValid = function() {
        if(elm.find('.videoUrl').val() == '')
          return true;
        return false;
      }  

      scope.resetVideoForm = function() {
        if(scope.media.video)
        {
          scope.media.video.url = "";
          scope.media.video.title = "";
          scope.media.video.desc = "";
        } 
        scope.showVideoUpload = false;
      } 
    },
    templateUrl: '/js/angular/views/videoUpload.html'
  };
});

componentModule.directive('imageUpload', function($timeout) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      scope.image_upload_in_progress = false; 
      elm.find('.preview_pic').click(function(e){
        elm.find('.pic_file').click();
      });

      scope.initCloudinary = function(){
        scope.formData = attr.formData;
        scope.imageWidth = parseInt(attr.imageWidth);
        scope.imageHeight = parseInt(attr.imageHeight);


        elm.find(".imageTitle").html(attr.imageTitle);
        $timeout(function(){
          elm.find("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
        }, 100);        
      }  

      elm.find('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) { 
        scope.image_upload_in_progress = true; 
        elm.find(".preview_pic").css("display","none");
        elm.find('.photo_bar').css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();        
      });

      elm.find('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) 
      { 
        scope.image_upload_in_progress = false; 
        elm.find('.photo_bar').parent().hide(); 
        elm.find(".preview_pic").css("display","block");

        if(data.result.width < scope.imageWidth || data.result.height < scope.imageHeight)
        {
          alert("Image is smaller than required dimensions!");
          return false;
        }
        
        elm.find(".preview_pic").html(
          $.cloudinary.image(data.result.public_id, {format: data.result.format, version: data.result.version, crop: 'scale', width: 100})
        );
        
        $("form").scope().media.image[attr.imageType] = data.result.secure_url
        return true;
      }); 



      scope.initCloudinary();
    },
    templateUrl: '/js/angular/views/imageUpload.html'
  };
});

componentModule.directive('photoUpload', function($timeout) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      elm.find('.uploadLnk').click(function(e){
        elm.find('.pic_file').click();
      });

      scope.initCloudinary = function(){
        scope.formData = attr.formData;
        scope.title = attr.title;

        scope.imageWidth = 0;
        scope.imageHeight = 0;

        if(attr.imageWidth && attr.imageHeight)
        {
          scope.imageWidth = parseInt(attr.imageWidth);
          scope.imageHeight = parseInt(attr.imageHeight);
        }

        elm.find('.uploadLnk').addClass(attr.baseClass);

        $timeout(function(){
          elm.find("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
        }, 100);        
      }  

      elm.find('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) {   
        elm.find('.photo_bar').css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();        
      });

      elm.find('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) 
      { 
        elm.find('.photo_bar').parent().hide();

        if(data.result.width < scope.imageWidth || data.result.height < scope.imageHeight)
        {
          alert("Image is smaller than required dimensions! Please upload atleast (" + scope.imageWidth + "X" + scope.imageHeight + ") image");
          return false;
        }
        scope.uploadPhoto(attr.imageType, data.result.secure_url);         
        return true;
      }); 

       scope.initCloudinary();
    },
    templateUrl: '/js/angular/views/photoUpload.html'
  };
});

componentModule.directive('hangoutImg', function($timeout) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      elm.find('.uploadLnk').click(function(e){
        elm.find('.pic_file').click();
      });

      scope.initCloudinary = function(){
        scope.formData = attr.formData;        
        elm.find('.uploadLnk').addClass(attr.baseClass);

        $timeout(function(){
          elm.find("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
        }, 100);        
      }  

      elm.find('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) {   
        elm.find('.photo_bar').css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();        
      });

      elm.find('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) 
      { 
        elm.find('.photo_bar').parent().hide();      
        scope.uploadPhoto(data.result.secure_url);         
        return true;
      }); 

       scope.initCloudinary();
    },
    templateUrl: 'user/hangout_image'
  };
});


componentModule.directive('imgUpload', function($timeout) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
      scope.image_upload_in_progress = false; 
      elm.find('.uploadLnk').click(function(e){
        if(scope.image_upload_in_progress)
          return; 
        elm.find('.pic_file').click();
      });

      scope.initCloudinary = function(){

        scope.title = attr.title; 

        $timeout(function(){
          elm.find("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
        }, 100);        
      }  

      elm.find('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) {   
        scope.image_upload_in_progress = true; 
        elm.find('.photo_bar').css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();        
      });

      elm.find('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) 
      { 
        scope.image_upload_in_progress = false; 
        elm.find('.photo_bar').parent().hide();      
        scope.event_image = data.result.secure_url;        
        scope.$apply();
        return true;
      }); 

       scope.initCloudinary();
    },
    templateUrl: 'user/img_upload'
  };
});



//pusher Chat directive
componentModule.directive('formTip', function() {
  return {
    restrict:'A',
    link: function(scope, elm, attr){
      elm.focus(function(){
        //adjust the position of tip
        $('<span>').text(attr.formTip).attr('id', 'ui_tip').addClass('form-tip')
                        .appendTo(elm.parent());
      });
      elm.blur(function(){
        $('#ui_tip').remove();
      });
    }
  }
});

componentModule.directive('validateConfirmPassword', function() {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {
      var firstPassword = '#' + attrs.validateConfirmPassword;
      elem.add(firstPassword).on('keyup', function () {
        scope.$apply(function () {
          var v = elem.val()===$(firstPassword).val();
          ctrl.$setValidity('pwmatch', v);
        });
      });
    }
  }
});

componentModule.directive('openSharePopup', function(media) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr){
      elm.click(function(e){                
        e.preventDefault();
        window.open(elm.attr('href'),'Connect','toolbar=0,status=0,width=548,height=325');
      });
    }
  };
});

componentModule.directive('loadVideo', function($timeout) {
  return {
    restrict:'A',
    link: function(scope, elm, attr){
      $timeout(function(){
        ae = new AutoEmbed();
        ae.parseUrl(attr.loadVideo);
        elm.html(ae.getEmbedCode);
        elm.iframeTracker({
          blurCallback: function(){
            scope.playVideo();  //TODO check integration with API.          
          }
        });
      }, 100);

      scope.showAddToPlaylist = function(){ 
        if(scope.video.in_playlist)
          return false;
        return true;
      }
    }
  }
});


componentModule.directive('playAudio2', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){  
      scope.is_playing = false;    
      scope.like = function(){
        elm.find('.like').addClass('active');
        scope.likeAudio();
      }

      scope.convert =  function(){
        if(!_.isNull(scope.audio.meta_data) && !_.isEmpty(scope.audio.meta_data)) {
          parse_data = JSON.parse(scope.audio.meta_data);  
          scope.audio.meta_data = parse_data;
          if(!_.isNull(scope.audio.meta_data.length)) {          
            length = scope.audio.meta_data.length / 60;
            scope.audio.meta_data.length = length.toFixed(2);
          } else {
            scope.audio.meta_data.length = "NA";
          }        
        }
      }

      scope.share = function(){   
        if(global_var.logged_user_id == -1 || global_var.logged_with_fb) {          
          window.open('/auth/facebook?from=share&media=audio&object_id='+scope.audio.id,'Connect','toolbar=0,status=0,width=548,height=325');
        } else {          
          window.open('/media/share?media=audio&nw_type=fb&object_id='+scope.audio.id,'Connect','toolbar=0,status=0,width=548,height=325');
        }
        
      }

      scope.isInPlaylist = function(){ 
        if(scope.audio.in_playlist)
          return true;
        return false;
      }

      scope.isAlreadyLiked = function(){ 
        if(scope.audio.already_liked)
          return true;
        return false;
      }

      scope.play = function(){
        if(!($('#mediaPlayer')[0].paused))
          $('#mediaPlayer')[0].pause(); // Pausing song in the footer.      

        if (scope.is_playing){
          scope.pause();
        } 
        else 
        {
          // pause other playing audio
          _.each(elm.parent().parent().find('audio'), function(obj){
            angular.element(obj).scope().pause();
          });

          elm.find('.play').addClass('active');
          elm.find('audio')[0].play();
          //record the play event with API
          scope.playAudio();
          scope.is_playing = true;          
        }
      }

      scope.pause = function() {        
        elm.find('.play').removeClass('active');
        elm.find('audio')[0].pause();
        scope.is_playing = false; 
      }

      scope.convert()
    },
    templateUrl: '/js/angular/views/artistAudio.html'
  };
});


componentModule.directive('playlistItem', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){  
      scope.is_playing = false;    

      scope.convert =  function(){
        if(!_.isNull(scope.media.meta_data) && !_.isEmpty(scope.media.meta_data)) {
          parse_data = JSON.parse(scope.media.meta_data);  
          scope.media.meta_data = parse_data;
          if(!_.isNull(scope.media.meta_data.length)) {          
            length = scope.media.meta_data.length / 60;
            scope.media.meta_data.length = length.toFixed(2);
          } else {
            scope.media.meta_data.length = "NA";
          }        
        }
      }
      
      scope.play = function(){
        if(!($('#mediaPlayer')[0].paused))
          $('#mediaPlayer')[0].pause(); // Pausing song in the footer.
       
        if(scope.media.is_media_trashed)
        {
          alert('Song deleted by Artist, cannot be played');
        }
        if (scope.is_playing){
          scope.pause();
        } 
        else 
        {
          // pause other playing audio
          _.each(elm.parent().parent().find('audio'), function(obj){
            angular.element(obj).scope().pause();
          });

          //elm.find('.play').addClass('active');
          elm.find('audio')[0].play();
          //record the play event with API
          scope.playMedia();
          scope.getArtistInfo();
          scope.is_playing = true;          
        }
      }

      scope.pause = function() {
        //elm.find('.play').removeClass('active');
        elm.find('audio')[0].pause();
        scope.is_playing = false; 
      }

      scope.delete = function() {
        if (scope.is_playing){
          scope.pause();
        } 
        scope.removeMediaFromPlaylist();

      }

      scope.convert()
    },
    templateUrl: '/js/angular/views/playlistItem.html'
  };
});

componentModule.directive('mediaPlayer', function($timeout) {
  return {
    restrict:'E',
    link: function(scope, elm, attr){  
      scope.is_playing = true;  
      scope.currentTrack = -1;

      scope.change = function(){        
       if(scope.getCookie("disableAutoPlay") == null) {          
           scope.setCookie(true);         
       } else {
          var toggle = scope.getCookie("disableAutoPlay") === 'true'? true : false; 
          scope.setCookie(!toggle);           
       }
      }

      scope.getCookie = function(key){        
        var cookie_string = "" + document . cookie;
        var cookie_array = cookie_string.split ("; ");
        for (var i = 0; i < cookie_array.length; ++ i)
        {
          var single_cookie = cookie_array [i] . split ("=");
          if (single_cookie . length != 2)
            continue;
          var name  = unescape (single_cookie [0]);
          var value = unescape (single_cookie [1]);
          // Return cookie if found:
          if (key == name)
            return value;
        }
        return null;
      }

      scope.setCookie = function(value){
        var expiration_date = new Date();
        var cookie_string = '';
        expiration_date.setFullYear(expiration_date.getFullYear() + 1);        
        cookie_string = "disableAutoPlay=" + value + "; path=/; expires=" + expiration_date.toGMTString();        
        document.cookie = cookie_string;
      }

      scope.initMediaPlayer = function(){
        scope.disable_autoplay = scope.getCookie("disableAutoPlay") === 'true'? true : false;        
        if(scope.systemPlaylist)
        {
          scope.nowPlayingMedia = scope.systemPlaylist[0];
          scope.currentTrack = 0;
          $timeout(function(){
            if(scope.disable_autoplay) {
               $('#mediaPlayer')[0].pause();
            } else {
               $('#mediaPlayer')[0].play();
            } 
          }, 100);                  
        }
      }

      $('#mediaPlayer').bind('ended', function(data) {   
         scope.playNext();      
      });

      scope.mediaPlay = function(track){
        if (scope.is_playing){
          scope.pause();
        } 
        scope.currentTrack = track;
        $('#mediaPlayer')[scope.currentTrack].play();
        scope.is_playing = true; 
      }

      scope.playNext = function(track){
        if (scope.is_playing){
          scope.pause();
        } 
        if(scope.currentTrack < scope.systemPlaylist.length)
          scope.currentTrack = scope.currentTrack + 1;
        else
          scope.currentTrack = 0;        
        
        scope.nowPlayingMedia = scope.systemPlaylist[scope.currentTrack];       

        $('#mediaPlayer')[0].play();
        scope.is_playing = true;
        scope.$apply();
      }

      scope.pause = function() {
        $('#mediaPlayer')[0].pause();
        //$('#mediaPlayer')[0].abort();
        scope.is_playing = false; 
      }
    },
    templateUrl: '/js/angular/views/mediaPlayer.html'
  };
});

componentModule.directive('opentokHangout', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){  
      
    },
    templateUrl: '/js/angular/views/hangout.html'
  };
});

componentModule.directive("clickToEdit", function() {
    var editorTemplate = '<div class="click-to-edit">' +
        '<div>' +
            '<p class="normalView" ng-bind-html="view.editableValue"></p>' +
            '<a href="javascript:void(0)" ng-click="enableEditor()" class="editbtn"> Edit Section</a>' +
        '</div>' +
        '<div class="popedits" ng-show="view.editorEnabled">' +
            '<div class="tt_arrow"></div>' +
            '<div class="title"><textarea class="editableField"  ng-model="view.editableValue"></textarea><div class="ctr f12 disgrey maxChars"></div></div>' +
            '<a href="javascript:void(0)" class="savebtn" ng-click="save()">Save Changes</a>' +
            '<a href="javascript:void(0)" class="f12" ng-click="reset()">Cancel</a>' +
        '</div>' +
    '</div>';

    var regex = /<br\s*[\/]?>/gi;
    return {
        restrict: "A",
        replace: true,
        template: editorTemplate,
        scope: {},
        controller: function($scope, $element, $attrs, $timeout) {
          $element.find('.normalView').addClass($attrs.baseClass);
          if($attrs.editLabel)
            $element.find('.editbtn').html($attrs.editLabel)
          $scope.view = {};
          $scope.value = "";
          
          $scope.$parent.$watch($attrs.clickToEdit, function(){
              $scope.view.editableValue = $scope.$parent.$eval($attrs.clickToEdit);
              $scope.value = $scope.$parent.$eval($attrs.clickToEdit);
          }, true);

          _.extend($scope.view, {editorEnabled: false});
          
          $scope.enableEditor = function() {
              $scope.view.editorEnabled = true;
              $scope.view.editableValue = $scope.value.replace(regex, "\n");

              $element.find('.editableField').css("height","100px");
              $element.find('.editbtn').addClass("alpha");
              $element.find('.maxChars').html($attrs.maxChars - $scope.view.editableValue.length);
              $(".editableField").attr('maxLength',$attrs.maxChars);

              $(".editableField").keyup(function() {
                var remainingChar = $attrs.maxChars - $scope.view.editableValue.length; 
                $element.find('.maxChars').html(remainingChar);
                if(remainingChar <= 0) {
                  $element.find('.maxChars').addClass('red'); 
                } else {
                  $element.find('.maxChars').removeClass('red');
                }
              })
          };

          $scope.disableEditor = function() {
            $scope.view.editorEnabled = false;
            $element.find('.editbtn').removeClass("alpha");
          };

          $scope.save = function() {
            var txt = $scope.view.editableValue;
            txt = txt.replace(/\n/g, "<br/>");

            var tokens = $attrs.clickToEdit.split('.');
            $scope.$parent.artist[tokens[1]] = $scope.view.editableValue;

            $scope.$parent.updateText($attrs.fieldName,txt);
            $scope.disableEditor();
          };

          $scope.reset = function() {
            $scope.view.editableValue = $scope.value;
            $scope.disableEditor();
          };
        }
    };
});


componentModule.directive('stateHelper', function(){
  return{
    restrict: 'A',
    controller: function($scope){
      // $scope.setLastpotrait = function(){
        $scope.last = {};
        $scope.last.first = false;
        $scope.menuState = {last: false, general: false, profile: false, display: $scope.display};

      // }
      // $scope.setLastpotrait();
      $scope.set = function(value){
        $scope.menuState['last'] = value;
        // console.log('value setted to ' + $scope.last.first)
      }
      $scope.get = function() {
        console.log('value to be returned is' + $scope.last.first)
        return $scope.menuState['last']; 
      }
    }
  }
});


componentModule.directive('cloudinaryUrl', function() {
  return {
    restrict: "A",
    replace: true,
    scope: {
        value: "=cloudinaryUrl",
        itemindex: "=itemindex",
        last: '=',
        photosLength: "=photosLength",        
    },

    link: function(scope, elm, attr, menuCtrl){      
      var splitResult = scope.value.split("/");

      var imgWidth = '';

      if(scope.itemindex % 5 == 0) 
        imgWidth = 340; 
      else {
        if( scope.photosLength - (scope.itemindex + 1) > 0) {
          imgWidth = 170;
          scope.$parent.toggle();
        } else if(scope.$parent.getState() ) {
          imgWidth = 170;
          scope.$parent.toggle();
        } else {
          imgWidth = 340;
        }
      }
      splitResult.splice(6, 0, "c_fill,h_180,w_" + imgWidth);
      scope.thumbnail = splitResult.join("/");
    },
    template: '<a href="{{value}}" class="ui_ispotraitslide"><img ng-src="{{thumbnail}}" alt="{{value.title}}"></a>'
  };
});

componentModule.directive('hangoutMedia', function() {
  return {
    restrict: "A",
    replace: true,
    scope: {
        value: "=hangoutMedia",
    },
    link: function(scope, elm, attr){
      var splitResult = scope.value.url.split("/");
      splitResult.splice(6, 0, "c_scale,w_" + attr.imgWidth);
      scope.thumbnail = splitResult.join("/");
    },
    template: '<a href="javascript:void(0)"><img ng-src="{{thumbnail}}" alt="img"></a>'
  };
});

componentModule.directive('lightBox', function($timeout) {
  return {
    restrict:'C',
    link: function(scope, elm, attr){
      $timeout(function(){
        elm.find('a.ui_slide').lightBox();
      }, 1000);      
    }
  };
});

componentModule.directive('positionImage', function() {
  return {
    restrict:'A',
    link: function(scope, elm, attr){

      var urlIsJSON = isJSON(attr.positionImage);
      var parentHeight = $('#artistTopDiv')[0].clientHeight;
      var parentWidth = $('#artistTopDiv')[0].clientWidth;
      var imgSrc = ""

      if(urlIsJSON && attr.positionImage != "")
      {
        var urlObj = jQuery.parseJSON( attr.positionImage ); 
        $('#actualImgView').offset({ top: urlObj.topPos, left: urlObj.leftPos });
        imgSrc = urlObj.url;
      }
      else
      {
        imgSrc = attr.positionImage;
      } 

      $("<img/>") // Make in memory copy of image to avoid css issues
        .attr("src", imgSrc)
        .load(function() {
           if(parentWidth < this.width)
            parentWidth = this.width;

          if(parentHeight < this.height)
            parentHeight = this.height;     

          $('#actualImgView,#movableImgView').css('height', parentHeight);
          $('#actualImgView,#movableImgView').css('width', parentWidth);
      });

      $('#actualImgView').css('background-image', "url("+imgSrc+")");
    }
  }
});

componentModule.directive('movableImage', function($timeout) {
  return {
    restrict:'C',
    link: function($scope, $element, $attrs){
      $timeout(function(){
        $element.draggable({
          drag: function( event, ui ) {
            $('#actualImgView').offset({ top: ui.position.top, left: ui.position.left });
          },
          stop: function( event, ui ) {
            $scope.topPos = ui.position.top;
            $scope.leftPos = ui.position.left;
            $scope.saveBackgroundPos();
          }
        });
      }, 100);      
    },

    controller: function($scope, $element, $attrs) {
      $scope.saveBackgroundPos = function() {
        var imgUrl = $('#actualImgView').css('background-image');
        //strip out url()
        imgUrl = imgUrl.replace(/"/g,"").replace(/url\(|\)$/ig, "");
        $scope.updateBackgroundPos(imgUrl,$scope.topPos,$scope.leftPos);
      };
    }
  };
});

componentModule.directive('contest', function() {
  return {
    restrict:'E',
    link: function(scope, elm, attr){
           
      scope.buy = function(){
        if(global_var.logged_user_id == -1) {
          scope.contest.available_seats -= 1;           
          window.open('/auth/facebook?buy=ticket&object_id='+scope.contest.id,'Connect','toolbar=0,status=0,width=548,height=325');
        } else {
          scope.buyTickets();
        }     
      }
    },
    templateUrl: '/js/angular/views/contestDetails.html'
  };
});

componentModule.directive('datePicker', function() {
  return {
    restrict:'A',
    require: '?ngModel',
    link: function(scope, elm, attr, ngModel){
       $(function(){
          elm.datepicker({
            dateFormat:'yy-mm-dd',
            onSelect:function (date) {
              ngModel.$setViewValue(date);
              scope.$apply();
            }
          });
       });
    },
  };
});

componentModule.directive('timeZone', function(){
    return {
        restrict: 'E',
        link: function(scope, elem, attr, ctrl) {
            var timezone = jstz.determine();
            scope.timezone = timezone.name();            
        }
    };
});

componentModule.directive('checkEvent', function($location){
    return {
        restrict: 'E',
        link: function(scope, elem, attr, ctrl) {                
          if(!_.isArray(scope.date)) {                            
              scope.noOfEvents = 0;
          }
          else if(_.isArray(scope.date) && scope.date.length > 1) {                        
            scope.noOfEvents = 2;
          }
          else {              
           time = new Date(scope.date[0].utc_starttime);
           var hours = time.getHours();
           var minutes = time.getMinutes();
           var ampm = hours >= 12 ? 'P' : 'A';
           hours = hours % 12;
           hours = hours ? hours : 12; 
           minutes = minutes < 10 ? '0'+minutes : minutes;
           scope.utc_starttime = hours + ":" + minutes + " " +  ampm;            
           scope.noOfEvents = 1;             
          }
          scope.calClick = function(){
            $location.path('/a/' + scope.date[0].user_id + '/contest');
          }
        },
        templateUrl: '/js/angular/views/live_concerts.html'
    };
});

componentModule.directive('multiEvents', function($location){
    return {
        restrict: 'E',
        link: function(scope, elem, attr, ctrl) {          
           time = new Date(scope.multievents.utc_starttime);
           var hours = time.getHours();
           var minutes = time.getMinutes();
           var ampm = hours >= 12 ? 'P' : 'A';
           hours = hours % 12;
           hours = hours ? hours : 12; 
           minutes = minutes < 10 ? '0'+minutes : minutes;
           scope.utc_starttime = hours + ":" + minutes + " " +  ampm;
           scope.calClick = function(){
            $location.path('/a/' + scope.multievents.user_id + '/contest')
            }          
        },
        templateUrl: '/js/angular/views/multi_events.html'
    };
});

componentModule.directive('initScroll', function(){
    return {
        restrict: 'E',
        link: function(scope, elem, attr) {
        var slideshowParameters = {
          disableOn: 11,
          disableClass: "link-disabled",
          slideBy: 100,
          container: ".ui-slide-container", 
          left: ".ui-right", 
          right: ".ui-left"
        };
        $("#slide_show_container").slideshow(slideshowParameters);       
        }
    };
});

componentModule.directive('onEnter',function(){

  var linkFn = function(scope,element,attrs) {
    element.bind("keypress", function(event) {
      if(event.which === 13 && scope.chat.msg) {
        scope.$apply(function() {
          scope.$eval(attrs.onEnter);
        });
        event.preventDefault();
      }
    });
  };

  return {
    link:linkFn
  };
});

componentModule.directive('scrollMe', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {          
            elem.bind("scroll",function() {              
              $(".detect").each(function() {                
                var image_set = _.filter(scope.messages, function(item){
                  return item.message_type == "image";
                });
                var latest_pic =  _.max(image_set, function(item){
                  return item.upload_time; 
                });
                var itemOffset = Math.abs($("#" + latest_pic.upload_time).offset().top)
                 - Math.abs($('#chat_window').offset().top ); 
                var is_pinned = Math.abs($("#" + latest_pic.upload_time).offset().top) - (Math.abs($('#pinnedDiv').offset().top) + $('#pinnedDiv').height() );
                if (itemOffset <= 10 || is_pinned <= 10) {                     
                     $("#pinnedDiv").show();
                     $(".hideMe").removeClass("hideMe");
                     scope.pinned_img = $("#" + latest_pic.upload_time).prop('src');                     
                     $("#" + latest_pic.upload_time).parent().addClass("hideMe");
                     scope.$apply();                     
                }
                var is_hidden = elem.find(".hideMe");                              
                if(is_hidden.length > 0 && $(".hideMe").offset().top - $("#chat_window").offset().top > $(".hideMe").height() ) {
                    $(".hideMe").removeClass("hideMe");
                    scope.pinned_img = '';
                    $("#pinnedDiv").hide();                    
                    scope.$apply();
                }
                //TODO optimize Code. 
              });              
            });           
        }
    };
});

componentModule.directive('displayShare', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
          $(".share-popup").hide();
          elem.click(function(e){
            $(".share-popup").hide();
            elem.parent().find(".share-popup").show();
            e.stopPropagation();
          });
          $('html').click(function(e){
             if (e.target.className == "share-popup" || e.target.parentElement.className == "share-popup") {
                e.stopPropagation();
                if(e.target.parentElement.className == "share-popup") {
                  window.open(e.target.children.href);
                }
             }              
            else {
                $(".share-popup").hide();
            }            
          });
        }
    };
});

componentModule.directive('showCrowdDoer', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
          elem.click(function(e){
            $('.crowd-doer-overlay').addClass('visible'); 
            $('body').addClass('noScroll');
          });
          $('.crowd-doer-overlay').on('click',function(e){
            if(e.target.nodeName== 'TD'){return false;}
            $('.crowd-doer-overlay').removeClass('visible');
            $('body').removeClass('noScroll');  
          });
        }
    };
});

componentModule.directive('bgimage', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
          
          elem.mouseenter(function(){
            $(".bg-placeholder").css('background-image', 'url(' + attrs.url + ')');
            $(".bgparent").css('display', 'block');
            $(".firsttext").text(attrs.firsttext);
            $(".secondtext").text(attrs.secondtext);
            $(".thirdtext").text(attrs.thirdtext);
            var position = elem.offset();
            if(attrs.thirdtext == null) {
              $(".thirdtext").css('display', 'none');
            } else {
               $(".thirdtext").css('display', 'inherit');
            }
            $(".bgparent").css('left', position.left - 50);
          });
          elem.mouseleave(function(){
            $(".bgparent").css('display', 'none');
          });
        }
    };
});

componentModule.directive('buyTickets', function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
          elem.click(function(e){
            alert("You bought a ticket!!");
            e.stopPropagation();
          });
          
        }
    };
});

componentModule.directive('bg', function ($timeout) {
    return {
        link: function(scope, element, attrs) {
          // if(attrs.bg){
          $timeout(function() {
            element.css("background-image","url("+attrs.urlpath+")");
          }, 100);
            
          // } else {
            // element.addClass("bg-default");             
          // }
        }
    }
});