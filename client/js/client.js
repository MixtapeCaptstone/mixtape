SongClient = new Mongo.Collection(null);//Create collection only on the client.
ThisPlaylist = new Mongo.Collection(null); //current playlist only on client
Lists = new Mongo.Collection('lists');



// Flow Router

FlowRouter.route('/playlist/:Id', {
    action: function(params) {
      Session.set('listName', params.Id);
      console.log("RENDERING!!!!!!!");
      BlazeLayout.render("home");
    },
    subscriptions: function(params) {
    this.register('Lists', Meteor.subscribe('lists'));
  }
});

FlowRouter.route('/', {
    action: function(params) {
      Session.set('listName', "");
      console.log("RENDERING!!!!!!!");
      BlazeLayout.render("home");
    },
    subscriptions: function(params) {
      this.register('Lists', Meteor.subscribe('lists'));
  }
});

//Set the initial playlist
function setPlayList(params){   

  console.log("settingplaylist!!!!!!"); 
  var reqList = Lists.find({ name: params }).fetch();
  console.log('reqList:', reqList);
  //Set Mongo Playlist Object
  ThisPlaylist.update(
    { name: "current" },
    {
       name: "current",
       listName: reqList,
    },
    { upsert: true}
  );

  var firstSong = reqList[0].playlist.id;
  var user = Meteor.user();
  var list = ThisPlaylist.find().fetch();
  var playlist = list[0].listName[0].playlist;
  var songCue = list[0].listName[0].playlist[0].id;
  var upvotes = list[0].listName[0].upvotes + 1;

  //Set the playlist object constructor.
  tape = new Tape(reqList);
  setUpvoteDiv(upvotes, user);
  setTimeout(function(){
    console.log("setting timeout");
    player.cueVideoById(songCue);
  }, 1000); 
}

// METEOR THINGS
Template.user.helpers({
  // This is how to call the database and pass things
  song: function () {
    var y = Session.get('title');
    var x = y[0].text;
    var name = Meteor.user().username;
    var callback = [];
    var z = Song.find({});
    z.forEach(function(tune){
      if (tune.username === name)
        callback.push(tune);
    });
    return callback;
  },
  songClient: function(){
    return SongClient.find({});
  },
  title: function() {
    return Session.get('title');
  }
});

Template.user.events({
  "drop .userDis": function (event) {
    var x = Session.get('tempSave');
    var y = Session.get('results');
    var z = Session.get('title')[0].text;
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        //Call addSong to save to server
        Meteor.call('addSong', e);
        songNum = SongClient.find().fetch().length;
        // CHANGED 'e.playlist' >> 'z'
        //Save onto client
        SongClient.insert({
          text: e.text,
          createdAt: new Date(),
          id: e.id,
          pic: e.pic,
          owner: Meteor.userId(),
          username: Meteor.user().username,
          playlist: z,
          index: songNum
        });
      }
    });
  }
  
});

Template.searches.helpers({
  results: function () {
    return Session.get('results');
  },
  clickCreate: function () {
    //Ensures user enters a title first.
      return Session.get('clickCreate');
  },
  songCreate: function () {
      return Session.get('songCreate');
  },
  showLast: function () {
    // Displays the search bar
    return Session.get('showLast');
  },
  noTitle: function () {
    return Session.get('noTitle');
  }
});

Template.searches.events ({
  'submit .savePlay': function (e) {
    // Create a new Playlist
    // Prevent default on submit
    e.preventDefault();

    // Capture the entered title
    var title = [{text: e.target.q.value}];
    var z = Lists.find().fetch();
    // Comparing entered title against EXISTING titles
    var exist = z.map(function(e) { return e.name; }).indexOf(e.target.q.value);
    // Making sure there is text entered and entry doesn't already exist. '.trim()' takes away whitespace.
    if(e.target.q.value.trim() !== '' && exist  < 0) {
      //Triggers display of the search bar
      Session.set('showLast', true);

      Session.set("title", title);

      //Hide the input field
      Session.set('clickCreate', false);
      Session.set('songCreate', true);
      Session.set('noTitle', false);

      // Clear the form
      e.target.q.value = '';
    } else {
      Session.set('noTitle', true);
    }
  },
  //Submits newly created playlist to server
  'click #submitPlaylist': function(){
    var title = Session.get('title')[0].text;
    var list = SongClient.find().fetch();
    // CHANGED 'myPlay' >> 'title'
    var playlist = {text: title, player: list};
    Meteor.call('setSong', list, title);//Add to MongoDB on the server
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  },

  'click .songClass': function(ev){
    var x = ev.target.id;
    var y = Session.get('results');
    var z = Session.get('title')[0].text;
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        //Call addSong to save to server
        Meteor.call('addSong', e);
        songNum = SongClient.find().fetch().length;
        trackNum = songNum + 1;
        // CHANGED 'e.playlist' >> 'z'
        //Save onto client
        SongClient.insert({
          text: e.text,
          createdAt: new Date(),
          id: e.id,
          pic: e.pic,
          owner: Meteor.userId(),
          username: Meteor.user().username,
          playlist: z,
          index: songNum,
          focus: false,
          track: trackNum
        });
      }
    });
  }
});

Template.playlistsBrowseCreate.events({
  "click .YTplayer": function (e) {
    // Ensuring that the user creates a playlist first
    e.preventDefault();

    //show playerBox
    $('#playerBox').css('display', 'block');

    var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', false);
    Session.set('songCreate', false);
  },
  "click .showCreate": function (e) {
    // Ensuring that the user creates a playlist first
    e.preventDefault();
    player.pauseVideo();

    //show playerBox
    $('#playerBox').css('display', 'block');

    var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', true);
    Session.set('songCreate', false);
    Session.set("listName", "");
  },
  "click .myMixes": function (e) {
    e.preventDefault();
    Session.set('playa', false);
    Session.set('showLast', false);
    Session.set('clickCreate', false);
    Session.set('songCreate', false);
    Session.set('mix', true);
    $('#playerBox').css('display', 'none');
  },
  "click .playa": function (e) {
    e.preventDefault();
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', false);
    Session.set('songCreate', false);
    Session.set('playa', true);
    $('#playerBox').css('display', 'none');
  }
});

Template.listViewer.onRendered(function () {
  var listName = Session.get('listName');
  setPlayList(listName);
});


Template.listViewer.helpers({
  listTape: function(){
    var listName = Session.get('listName');
    var list = Lists.find({name: listName}).fetch();
    var playlist = list[0].playlist;
    return playlist;
  },
  tapeName: function () {
    return [{text: Session.get('listName')}];
  },
  getFocus: function(focus){
    return focus;
  }
});

Template.listViewer.events({
  'click .songHover': function (event) {
    event.target.id = "focus"; //set focus
    var songIndex = this.name;
    var songId = this.id;
  },
  'mouseenter .songName': function(event){
    thisDiv = event.target; //get "this"
    // $(thisDiv).attr("class", "songHover" );//set hover class
  },
  'mouseleave .songHover': function(event){
    thisDiv = event.target; //get "this"
    // $(thisDiv).attr("class", "songName" ); //remove hover class
  },
  'click .songClass': function (event) {
    var title = Session.get('listName');

    var songIndex = $(event.currentTarget).attr("name"); //Get song index number
    
    tape.setFocus(songIndex);
    setDivFocus()
    playSongFocus();
  },
  'click #upvoteDiv': function(event){
    console.log("clicked upvoteDiv");

    var title = Session.get('listName');
    Meteor.call('upvote', title);
    var upvoteDiv = document.getElementsByClassName("upvoteDiv");


    //REGEX
    var upvoteNumber = upvoteDiv[0].innerHTML;
    var numberPattern = /\d+/g;

    var regExObject = upvoteNumber.match( numberPattern );
    var num = parseInt(regExObject, 10) + 1;

    upvoteDiv[0].innerHTML = num + "<div class=heart id=downvoteDiv> ♡ </div>";
   },
  'click #downvoteDiv': function(){
    console.log("clicked downvoteDiv");

    var title = Session.get('listName');
    Meteor.call('downvote', title);
    var upvoteDiv = document.getElementsByClassName("upvoteDiv");

    //REGEX
    var upvoteNumber = upvoteDiv[0].innerHTML;
    var numberPattern = /\d+/g;

    var regExObject = upvoteNumber.match( numberPattern );
    var num = parseInt(regExObject, 10) - 1;

    upvoteDiv[0].innerHTML = num + "<div class=heart id=upvoteDiv> ♡ </div>";  }
});

Template.playlist.helpers({
  playa: function () {
    return Session.get('playa');
  },
  allLists: function(){
    return Lists.find({}, {sort: {upvotes: -1}});
  }
});

Template.playlist.events({
  "click .playlistName": function(event){
    player.stopVideo();
    var id = event.target.id;
    var fullid = "/playlist/" + id;
    FlowRouter.go(fullid);

    Session.set('playa', false);
    Session.set('YT', true);

    //show playerBox
    $('#playerBox').css('display', 'block');

    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", "id"); //Reset Session title
    setPlayList(id);
    player.cueVideoById(tape.playlist[0].id);
  }
});

Template.mix.helpers({
  mix: function () {
    return Session.get('mix');
  },
  myLists: function(){
    return Lists.find({author: Meteor.user().username});
  }
});

Template.mix.events({
  "click .playlistName": function(event){
    player.stopVideo();
    var id = event.target.id;
    var fullid = "/playlist/" + id;
    // console.log("fullid:", fullid);
    Session.set('mix', false);
    Session.set('YT', true);

    //show playerBox
    $('#playerBox').css('display', 'block');

    SongClient.remove({}); //Remove the client's temporary playlist
    // Session.set("title", ""); //Remove Session title
    FlowRouter.go(fullid);
    setPlayList(id);
    player.cueVideoById(tape.playlist[0].id);
  },
  "click .delete": function (event){
    console.log("༼ つ ◕_◕ ༽つ delete!");
    // if () {
      Meteor.call("deleteList", this._id);
    // }
    }
});

Template.home.helpers({
  clickCreate: function () {
      return Session.get('clickCreate');
    },
  isReady: function(sub) {
    if(sub) {
      return FlowRouter.subsReady(sub);
    } else {
      return FlowRouter.subsReady();
    }
  }
});

Template.home.events({
  "submit .search": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    var text = event.target.q.value;
    // Take "text" and use that to search YT
    Meteor.call('checkYT', text, function(error, results) {
      var yt = JSON.parse(results.content);
      var x = [];
      yt.items.forEach(function(e){
        x.push({text: e.snippet.title,
                id: e.id.videoId,
                pic: e.snippet.thumbnails.default.url
        });
      });
      Session.set('results', x);
    });
    // Display the search results drop-down
    $('.subnav').css('visibility', 'visible');
    // Clear the form
    event.target.q.value = '';
  },
  "click .delete": function () {
    SongClient.remove(this._id);
  },
  "click": function (e) {
    if ( $(e.target).closest('.search-con').length ) {
        $(".subnav").show();
    }else if ( ! $(e.target).closest('.subnav').length ) {
        $('.subnav').hide();
    }
  }
});

Template.player.events({
  "click #escolta": function(){
  }

});

Template.player.helpers({
  isReady: function(sub) {
    if(sub) {
      console.log("is ready ", sub);
      return FlowRouter.subsReady(sub);
    } else {
      return FlowRouter.subsReady();
    }
  }
});


// JQUERY things
Meteor.startup(function () {
  // Allows the element to be dropped into a different div, and prevents default drop.
  allowDrop = function (ev) {
    ev.preventDefault();
  };

  // Allows the 'id' text to be dragged
  drag = function (ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var x = ev.target.id; //ev.srcElement doesn't work in Firefox
    Session.set('tempSave', x);
  };

  // This event gets triggered when dropped. Puts the dragged item into the new div.
  drop = function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
  };
  Accounts.ui.config({
    // require username rather then email
   passwordSignupFields: 'USERNAME_ONLY'
  });
});

//YOUTUBE THINGS

function playNextSong(){
  tape.setNextFocus();
  var currentId = tape.currentSongId();
  player.loadVideoById(currentId);
  setDivFocus();
  console.log("Tape!!!!:", tape);
  console.log("Chirp:", tape.chirp());
}

function playSongFocus(){
  var songFocus = tape.currentSongId();
  player.loadVideoById(songFocus);
  player.playVideo();
}

function setDivFocus(){
  var currentFocus = tape.getFocus();
  var x = document.getElementsByClassName("songName");
  var songIndex;
  var songText;
  var smallPlayer = '<div id="smallPlayer"><svg class="icon-play4"><use xlink:href="#icon-play4"></use></svg></div>'     

  //Remove Current Focus
  for(var i = 0; i < x.length; i++){
    songIndex = tape.playlist[i].index + 1;
    songText = tape.playlist[i].text;
    x[i].id = 'noFocus'; 
    if(currentFocus == i){
      x[i].innerHTML = smallPlayer + " " + songText;
    } else {
      x[i].innerHTML = songIndex + ". " + songText;
    }  
  }
  x[currentFocus].id = 'focus';
}

//Set number of upvotes
function setUpvoteDiv(num, user){
  event.preventDefault();
  console.log("setting upvote divs");
  var upvoteDiv = document.getElementsByClassName("upvoteDiv");

  for(var i = 0; i < tape.upvoters.length; i++){
    if(tape.upvoters[i] === user.username){
      upvoteDiv[0].innerHTML = num + "<div class=heart id=downvoteDiv> ♡ </div>";
      return true;
    } else {
      upvoteDiv[0].innerHTML = num + "<div class=heart id=upvoteDiv> ♡ </div>";
    }
  }
}

//Set Initial Playlist Constructor 

function Tape(mongoObject){
  this.name = mongoObject[0].name;
  this.playlist = mongoObject[0].playlist;
  this.upvoters = mongoObject[0].upvoters;
  this.mongoObject = mongoObject;
  this.focus = 0;
  this.getFocus = function(){
    return this.focus
  };
  this.setFocus = function(newFocus){
    this.focus = newFocus;
    //remove playlist focus
    for (var i = 0; i < this.playlist.length; i++) {
      this.playlist[i].focus = false;
    };
    this.playlist[newFocus].focus = true;
  };
  this.chirp = function(){
    console.log(mongoObject);
  };
  this.currentSongId = function(){
    var thisFocus = this.getFocus();
    return this.playlist[thisFocus].id;
  };
  this.setNextFocus = function(){
    var focus = parseInt(this.getFocus(), 10);
    if( focus >= this.playlist.length - 1){
      this.setFocus(0);
    } else {
      this.setFocus(focus + 1);
    }
    return this.focus;
  };
}

//Global tape object
var tape;

//YOUTUBE API

console.log("YT rendering");
YT.load();

//YouTube API
// YouTube API will call onYouTubeIframeAPIReady() when API ready.
// Make sure it's a global variable.
onYouTubeIframeAPIReady = function () {

  player = new YT.Player("player", {
    height: '191',
    width: '291',
    videoId: 'M7lc1UVf-VE',
    playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0 },
    allowfullscreen: '0',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
  });

};


function onPlayerReady(event) {

    var artist = player.getVideoData();
    $('#artistName').text(artist.author + " " + artist.title);


    $('.escolta').unbind("click");

    $('.escolta').on('click', function() {

        if(event.data === 1) {
            player.pauseVideo();
        }
        else {
          setDivFocus()
          playSongFocus();
        }
        return false;
    });

    $('#forward').on('click', function(){
      playNextSong();
    });

    var minutes = Math.floor((player.getDuration()) / 60);
    var seconds = player.getDuration() % 60;
    $('.duration').text(minutes + ':' + seconds);

//SCRUBBER

    var timeDrag = false;   /* Drag status */
    $('.progressParent').mousedown(function(e) {
        timeDrag = true;
        updatebar(e.pageX);
    });

    $('.progressParent').mouseup(function(e) {
        if(timeDrag) {
            timeDrag = false;
            updatebar(e.pageX);
        }
    });
    $('.progressParent').mousemove(function(e) {
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
        for(var i =0; i <= counter; i++){
          var divID = "#" + i;
          $(divID).css('background-color', "rgb(255, 255, 255)");
        }
      }
    );
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
    setDivFocus();
    $('.escolta').html('<svg class="icon-pause2"><use xlink:href="#icon-pause2"></use></svg>');
  } else if(event.data === 0){
    playNextSong();
  } else {
    $('.escolta').html('<svg class="icon-play3"><use xlink:href="#icon-play3"></use>');
  }

  $('.escolta').on('click', function() {

    clearInterval(scrubber);
      if(event.data === 1) {
          player.pauseVideo();
      }
      else {
        player.playVideo();
        setDivFocus()
      }
      return false;
  });

  setTimer(event);
//
}


$(document).ready(function(){

//Initialize Scrubber
var timeDrag = false;   /* Drag status */

  $('.progressParent').mousedown(function(e) {
      timeDrag = true;
      updatebar(e.pageX);
  });

  $('.progressParent').mouseup(function(e) {
      if(timeDrag) {
          timeDrag = false;
          updatebar(e.pageX);
      }
  });
  $('.progressParent').mousemove(function(e) {
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
      for(var i =0; i <= counter; i++){
        var divID = "#" + i;
        $(divID).css('background-color', "rgb(255, 255, 255)");
      }
    }
  );
});








