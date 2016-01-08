SongClient = new Mongo.Collection(null);//Create collection only on the client.
ThisPlaylist = new Mongo.Collection(null); //current playlist only on client
Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');

//Set Initial Playlist
function setPlayList(params, id){    
  var findSong = function(){
      return this;
  };
  var reqList = Lists.find({ name: id }).fetch();
  ThisPlaylist.update(
    { name: "current" },
    {
       name: "current",
       listName: reqList,
       findSong: findSong
    },
    { upsert: true}
  );
  console.log('!!!!!!!!!!!');
  ThisPlaylist.update ({name: 'current'}, { '$set': {"listName.0.playlist.0.focus" : true} });
}

// Iron Router
Router.route('/', function(){
    this.render('test');
});

Router.route('/playlist/:_id', {
  action: function () {
     // render all templates and regions for this route
     this.render('test');
     var params = this.params; // { _id: "List Name" }
     var id = params._id; // "List Name"
     Session.set('listName', id);
     setPlayList(params, id);
     //find playlist object

    //Cue first video
   },
   onAfterAction: function () {

    // player.cueVideoById(currentSongId);
   }

});

Template.test.onRendered(function () {
  // Use the Packery jQuery plugin
  console.log('rendered');
  // Session.set('playa', false);
  // Session.set('YT', true);
});

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
    // CHANGED title = Session.get('title')
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
          focus: false
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

Template.listViewer.helpers({
  listTape: function(){
    var listTitle = Session.get("listName"); //get the name of the current playlist
    var list = Lists.find({name: listTitle}).fetch();
    var name = list[0];
    return list[0].playlist;
  },
  tapeName: function () {
    return [{text: Session.get('listName')}];
  }
});

Template.listViewer.events({
  'click .songHover': function (event) {
    //TODO is this redundant? Already in body event!
    // $('#focus').removeAttr('id'); //remove previous focus
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

    // $('.focus').attr('class', 'songClass'); //remove previous focus
    console.log("clicked song name");
    // $(self).attr( 'class', 'focus');//set focus

    var songIndex = $(event.currentTarget).attr("name"); //Get song index number
    setSongFocus(songIndex);
    playSongFocus();
    // player.playVideoAt(songIndex);//Play correct playlist song index
  }
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
    var id = event.target.id;
    var fullid = "/playlist/" + id;
    Router.go(fullid);

    // var newList = Lists.find({name: event.target.id}).fetch();//get playlist
    // var listArray = [];
    // //push individual sing id's into an empty array
    // newList[0].playlist.forEach(function(element, index, array){
    //   listArray.push(element.id);
    // });

    //set state
    // e.preventDefault();
    Session.set('playa', false);
    Session.set('YT', true);

    //show playerBox
    $('#playerBox').css('display', 'block');

    // //set playlist
    // Session.set("listName", event.target.id);
    // player.loadPlaylist({
    //     'playlist': listArray,
    //     'listType': 'playlist',
    //     'index': 0,
    //     'startSeconds': 0,
    //     'suggestedQuality': 'small'
    // });

    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
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
    var newList = Lists.find({name: event.target.id}).fetch();//get playlist
    var listArray = [];
    //push individual sing id's into an empty array
    newList[0].playlist.forEach(function(element, index, array){
      listArray.push(element.id);
    });
    //set playlist
    Session.set("listName", event.target.id);
    player.loadPlaylist({
        'playlist': listArray,
        'listType': 'playlist',
        'index': 0,
        'startSeconds': 0,
        'suggestedQuality': 'small'
    });

    Session.set('mix', false);
    Session.set('YT', true);

    //show player
    $('#playerBox').css('display', 'block');

    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  },
  "click .delete": function (event){
    console.log("༼ つ ◕_◕ ༽つ delete!");
    // if () {
      Meteor.call("deleteList", this._id);
    // }
    }
});

Template.upvote.helpers({
  upvotes: function(){
    var user = Meteor.user().username;
    var title = Session.get('listName');
    var thisList = Lists.find({name: title}).fetch();
    var thisId = thisList[0]._id;
    var upvoters = thisList[0].upvoters;
    for(var i = 0; i < upvoters.length; i++){
      if(upvoters[i] == user){
        return false;
      }
    }
    return true;
  },
  downvotes: function(){
    var user = Meteor.user().username;
    var title = Session.get('listName');
    var thisList = Lists.find({name: title}).fetch();
    var thisId = thisList[0]._id;
    var upvoters = thisList[0].upvoters;
    for(var i = 0; i < upvoters.length; i++){
      if(upvoters[i] == user){
        return true;
      }
    }
    return false;
  },
  number: function () {
    var title = Session.get('listName');
    var thisList = Lists.find({name: title}).fetch();
    var upvotes = thisList[0].upvotes;
    return [{text: upvotes}];
  }
});

Template.upvote.events({
  'click .upvoteDiv': function(){
    var title = Session.get('listName');
    Meteor.call('upvote', title);
  },
  'click .downvoteDiv': function(){
    var title = Session.get('listName');
    Meteor.call('downvote', title);
  }
});

Template.test.helpers({
  clickCreate: function () {
      return Session.get('clickCreate');
    }
});

Template.test.events({
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
  var indexValue = getSongFocus();
   var list = ThisPlaylist.find().fetch();
  var playlist = list[0].listName[0].playlist;

  console.log('indexValue:', indexValue, " Playlist.length:", playlist.length);

  if(parseInt(indexValue, 10) >= playlist.length - 1){
    setSongFocus(0);
    var songId = list[0].listName[0].playlist[0].id;
    player.loadVideoById(songId);
    player.playVideo();
  } else {
    var nextFocus = parseInt(indexValue, 10) + 1;
    console.log('indexValue:', indexValue, ", nextFocus:", nextFocus);
    var thisId = list[0].listName[0].playlist[nextFocus].id;
    player.loadVideoById(thisId);
    player.playVideo();
    setSongFocus(nextFocus);
  }
  console.log("list after change:", playlist);
}

function playSongFocus(){
  var currentFocus = getSongFocus();
  var list = ThisPlaylist.find().fetch();
  var songId = list[0].listName[0].playlist[currentFocus].id;
  player.loadVideoById(songId);
  player.playVideo();
}

function getCurrentSongId(){
  var list = ThisPlaylist.find().fetch();
  var playlist = list[0].listName[0].playlist;
  var indexValue;
  playlist.forEach(function(element, index, array){
    var thisFocus = element.focus;
    if(thisFocus === true){
      indexValue = index;
    }
  });
  return list[0].listName[0].playlist[indexValue].id;
}

function setSongFocus(index){
  console.log('setSongFocus', index);
  var list = ThisPlaylist.find().fetch();
  var playlist = list[0].listName[0].playlist;
  console.log('current playlist', playlist);

  // remove previous focus
  var currentFocus = getSongFocus();
  console.log('current focus:', currentFocus);
  var removeModifier = { $set: {} };
  removeModifier.$set["listName.0.playlist." + currentFocus + ".focus"] = false;
  ThisPlaylist.update({name: 'current'}, removeModifier);
  // ThisPlaylist.update({name: 'current'}, {"listName.0.playlist.0.focus": false});


  //set new focus
  var setModifier = { $set: {} };
  setModifier.$set["listName.0.playlist." + index + ".focus"] = true;
  ThisPlaylist.update({name: 'current'}, setModifier);

  setDivFocus();

  var updatedlist = ThisPlaylist.find().fetch();
  var updatedplaylist = updatedlist[0].listName[0].playlist;
  console.log('updated playlist:', updatedplaylist);
  // ThisPlaylist.update ({name: 'current'}, { '$set': {"listName.0.playlist.1.focus" : true} });
}

function getSongFocus(){
  var list = ThisPlaylist.find().fetch();
  var playlist = list[0].listName[0].playlist;
  var indexValue;
  playlist.forEach(function(element, index, array){
    console.log('getSongFocus index:', index, "element.focus", element.focus);
    var thisFocus = element.focus;
    if(thisFocus === true){
      indexValue = index;
    }
  });
  return indexValue;
}

function setDivFocus(){
  var currentFocus = getSongFocus();
  var x = document.getElementsByClassName("songName");

  //Remove Current Focus
  for(var i = 0; i < x.length; i++){
    x[i].id = 'noFocus';    
  }

  x[currentFocus].id = 'focus';
}

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

YT.load();

function onPlayerReady(event) {

    var artist = player.getVideoData();
    $('#artistName').text(artist.author + " " + artist.title);


    $('.escolta').unbind("click");

    $('.escolta').on('click', function() {

        if(event.data === 1) {
            player.pauseVideo();
        }
        else {
          setSongFocus();
          player.playVideo();
          setDivFocus()
        }
        return false;
    });

    $('#forward').on('click', function(){
      playNextSong();
      // var songIndex = getSongFocus() + 1;
      // console.log("songIdex for #forward:", songIndex);
      // setSongFocus(songIndex);
      // playSongFocus();  
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

    // var currentSongId = getCurrentSongId();
    // player.cueVideoById(currentSongId);
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
          player.pauseVideo();
      }
      else {
        player.playVideo();
        getSongFocus();
        setDivFocus()
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

