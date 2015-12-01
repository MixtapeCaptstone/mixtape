// YouTube API will call onYouTubeIframeAPIReady() when API ready.
// Make sure it's a global variable.
onYouTubeIframeAPIReady = function () {

    player = new YT.Player("player", {
      height: '191',
      width: '291',
      playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0 },
      allowfullscreen: '0',
      videoId: 'FMBchZmPlXA',
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }

    });
};

YT.load();

function onPlayerReady(event) {
    var artist = player.getVideoData();
    $('#artistName').text(artist.author + " " + artist.title);


    $('.escolta').unbind("click");

    $('.escolta').on('click', function() {

        if(event.data === 1) {
            console.log('alert 1');
            player.pauseVideo();
        }
        else {
          console.log('alert 2');
          player.playVideo();
        }
        return false;
    });

    $('#forward').on('click', function(){
      player.nextVideo();
    });

    var minutes = Math.floor((player.getDuration()) / 60);
    var seconds = player.getDuration() % 60;
    $('.duration').text(minutes + ':' + seconds);
}

var scrubber;

function setTimer(event){
  var num = event.data;
  var currentTime = player.getCurrentTime();
  var time = currentTime;
  scrubber = setInterval(clock, 150);
  if (event.data != 1){
    clearInterval(scrubber);
  }
}

function clock(){
 var time = player.getCurrentTime();
 var duration = player.getDuration();
 $('.current').text(time);
 var percentage = 100 * time / duration; //in %
 $('.progress').css('width', percentage + '%');
}




var done = false;
function onPlayerStateChange(event) {


  //SET FOCUS
  $('.focus').attr('class', 'songClass'); //remove previous focus
  playIndex = event.target.A.playlistIndex;
  var thisDiv = $('div[name="' + playIndex + '"]');
  var child = $(thisDiv).children('div');
  $(child).attr("class","focus");
//---------------------------------
  $('.escolta').unbind("click");

  //Change the play button text
  if(event.data === 1) {
      $('.escolta').html('<svg class="icon-pause2"><use xlink:href="#icon-pause2"></use></svg>');
  }
  else {
    $('.escolta').html('<svg class="icon-play3"><use xlink:href="#icon-play3"></use>');
  }

  $('.escolta').on('click', function() {

    clearInterval(scrubber);
      if(event.data === 1) {
          console.log('alert 1');
          player.pauseVideo();
          // $('.escolta').text('play');
      }
      else {
        console.log('alert 2');
        player.playVideo();
        // $('.escolta').text('pause');
      }
      return false;
  });

  setTimer(event);
//
}


$(document).ready(function(){


//SCRUBBER

var timeDrag = false;   /* Drag status */
$('.progressParent').mousedown(function(e) {
    console.log('mousedown');
    timeDrag = true;
    updatebar(e.pageX);
});

$('.progressParent').mouseup(function(e) {
    console.log('mouseup');
    if(timeDrag) {
        timeDrag = false;
        updatebar(e.pageX);
    }
});
$('.progressParent').mousemove(function(e) {
  console.log('mouseMove');
    if(timeDrag) {
        updatebar(e.pageX);
    }
});

//update Progress Bar control
var updatebar = function(x) {
    var progress = $('.progressParent');
    var maxduration = player.getDuration(); //Video duraiton
    var position = x - progress.offset().left; //Click pos
    var percentage = 100 * position / progress.width();

    //Check within range
    if(percentage > 100) {
        percentage = 100;
    }
    if(percentage < 0) {
        percentage = 0;
    }

    //Update progress bar and video currenttime
    $('.progress').css('width', percentage + '%');
    player.seekTo(maxduration * percentage / 100);
};

//Volume DIVS
$('.volumeDiv').hover(
  function(){
    console.log('hover');
    $(this).animate({'margin-top': '2px'});
  },
  function(){
    $(this).animate({"margin-top": "5px"});
  }
);

$('.volumeDiv').click(
  function(){
    var counter = parseInt($(this).attr('id'));

    player.setVolume(counter);

    $('.volumeDiv').css('background-color', 'rgb(143, 143, 143)');
    console.log(counter);
    for(var i =0; i <= counter; i++){
      var divID = "#" + i;
      $(divID).css('background-color', "rgb(255, 255, 255)");
    }
  }
);

});
