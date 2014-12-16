function like(ref){
  $(ref).addClass('active');
  $(ref).find('span').text('26');
  $("#ui_like_thanks").show();
}

function share(ref){
  $("#ui_share_thanks").show();
  shareFB(ref);
}

function selectTabs(ref, ref2){
  $(".ui-tabs").hide();
  $(ref).show();
  $(ref2).parent().parent().find('.active').removeClass('active');
  $(ref2).addClass('active');
}

function play(ref){
  if ($(ref).hasClass('active')){
    document.getElementById("ui_song").pause();  
  } else {
    document.getElementById("ui_song").play();
  }
  $(".ui-play").removeClass('active');
  $(ref).addClass('active');
}

function shareFB(ref){
  var previewImg = 'http://sphotos-c.ak.fbcdn.net/hphotos-ak-ash3/528871_342189772561899_1938329114_n.jpg';
  var content = "&p[url]="+escape('http://mme.herokuapp.com/Band_Home.html')+"&p[title]="+escape('Selah Sue on My Music Empire')+"&p[summary]="+escape('Some women choose to follow men, and some women choose to follow their dreams. If you are wondering which way to go..')+"&p[images][0]="+escape(previewImg)+"&";
  window.open('http://www.facebook.com/sharer/sharer.php?s=100'+content,'FBShare','toolbar=0,status=0,width=548,height=325,top=100,left=50');
}

function youtubeShare(ref){
  $('#ui_youtube_video').hide();
  $('#ui_youtube_share').show();
}

$(document).ready(function(e) {
$('.top-head h2 a').on('click',function(){
	$('.crowd-doer-overlay').addClass('visible');	
	$('body').addClass('noScroll');
});
$('.crowd-doer-overlay').on('click',function(e){
		if(e.target.nodeName== 'TD'){return false;}
		$('.crowd-doer-overlay').removeClass('visible');
		$('body').removeClass('noScroll');	
	});
	
$('.supportBtn').on('click',function(){
	$('.cardModal').show();	
});  
$('.black_overlay').on('click',function(e){
	if(e.target.nodeName== 'TD'){return false;}
	$('.cardModal').hide();	
});  
});
