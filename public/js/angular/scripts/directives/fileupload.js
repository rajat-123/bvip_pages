/*  jqueryFileUpload-Plugin - https://github.com/blueimp/jQuery-File-Upload */
componentModule.directive('uploadfile', function($timeout){
    return{
        restrict:'E',
        transclude: true,
        templateUrl: '/js/angular/views/file_upload.html',
        scope : {},
        link:function(scope, elm, attr){
            
            scope.flipcard = {};
            scope.jcropApi = null;
            scope.SIZE_LIMIT_IN_MB = 5;
            scope.cropEnabled = false;
            scope.isFileUploaded = false;

            scope.startUpload = function(){
                elm.find('.add_files').click();
            }

            scope.toggleCrop = function(){
                if(scope.jcropApi == null) initJcrop();
                if(!scope.cropEnabled){
                    scope.cropEnabled = true;
                    scope.jcropApi.enable();
                    scope.jcropApi.setSelect([ 50, 50, 200, 200 ]);
                }else{
                    scope.jcropApi.release();
                    scope.jcropApi.disable();
                }
            }

            var initJcrop = function(imgRef){
                elm.find('.crop_preview').Jcrop({
                    bgFade: true,
                    bgOpacity: .3,
                    setSelect: [ 50, 50, 200, 200 ],
                    onChange: updateCropDimensions,
                    onSelect: updateCropDimensions,
                    onRelease: handleRelease,
                    boxWidth: 145,
                    boxHeight: 'auto'
                },function(){
                    // Use the API to get the real image size
                    scope.jcropApi = this;
                    scope.jcropApi.release();
                    scope.jcropApi.disable();
                });
            };

            scope.crop = function(){

                if( scope.flipcard.dimension.w < parseInt(attr.imageWidth))
                {
                    alert('Cropped width is too less, crop a bigger area or upload new image!');
                    return false;
                }
                
                var croppedImgUrl = $.cloudinary.url(scope.flipcard.publicId,{format: scope.flipcard.format, transformation: 
                        { width: scope.flipcard.dimension.w, height: scope.flipcard.dimension.h, x: scope.flipcard.dimension.x, y: scope.flipcard.dimension.y, crop: 'crop' }});
                
                $("form").scope().media.image[attr.imageType] = croppedImgUrl;
                elm.find(".preview").hide();
                elm.find('.croppedImg').attr('src', croppedImgUrl).css({display:'block'});
                scope.jcropApi.destroy();
                scope.cropEnabled = false;
                elm.find('.crop.show').hide();
                elm.find('.crop_preview').removeAttr('style').css('display: none;');
            }

            scope.resetCrop = function(){
                elm.find('.croppedImg').hide();
                elm.find('.preview').show();
                elm.find('.preview').children().show();
                elm.find('.crop_preview').hide();
            }

            function updateCropDimensions(c){
                if(!scope.flipcard.dimension)
                    scope.flipcard.dimension = {};
                var self = this;
                if(self.tellSelect){
                    _.extend(scope.flipcard.dimension, {
                        "w": Math.round(self.tellSelect().w),
                        "h": Math.round(self.tellSelect().h),
                        "x": Math.round(self.tellSelect().x),
                        "y": Math.round(self.tellSelect().y)
                    });
                }
            };

            function handleRelease(){
                scope.cropEnabled = false;
            }

            scope.showCrop = function(){
                if(!scope.isFileUploaded)
                    return false;
                if(scope.cropEnabled || scope.uploadInProgress)
                    return false;
                return true;
            }

            scope.isCropEnabled = function(){
                return scope.cropEnabled;
            }

            scope.isUploadInProgress = function(){
                return scope.uploadInProgress ? true : false;
            }

            scope.initFileUploadPlugin = function(){

                scope.formData = attr.formData;
                elm.find(".imageTitle").html(attr.imageTitle);
                $timeout(function(){
                  elm.find("input.cloudinary-fileupload[type=file]").cloudinary_fileupload();
                }, 100);   

                elm.find('.cloudinary-fileupload').bind('cloudinarydone', function(e, data) 
                { 
                    scope.cropEnabled = false;
                    scope.isFileUploaded = true;

                    scope.destroyJcrop(true);
                    var imgObj = elm.find('.preview').find('img');
                    imgObj.attr('src', data.result.secure_url);

                    $(imgObj).load(function() {
                        elm.find('.photo_bar').parent().hide(); 
                        scope.uploadInProgress = false; 
                    });


                    elm.find('.preview').show();
                    elm.find('.preview').children().show();
                    elm.find('.crop.show').show();
                    elm.find('.crop_preview').hide();
                    
                    initJcrop();

                    scope.flipcard.publicId = data.result.public_id;
                    scope.flipcard.format = data.result.format
                    $("form").scope().media.image[attr.imageType] = data.result.secure_url
                    
                    return true;
                  }); 

        		elm.find('.cloudinary-fileupload').bind('fileuploadprogress', function(e, data) 
                { 
                    scope.uploadInProgress = true; 
                    elm.find('.photo_bar').css("width", parseInt(data.loaded / data.total * 100, 10) + "%").parent().show();          
                });
            }

            scope.destroyJcrop = function(){
                scope.cropEnabled = false;
                elm.find('.preview').hide();
                elm.find('.croppedImg').hide();
                if(scope.jcropApi) scope.jcropApi.destroy();
                elm.find('.crop_preview').removeAttr('style').css('display: none;');
            }
            
            scope.initFileUploadPlugin();

        }
    }
});