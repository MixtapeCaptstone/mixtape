SongClient = new Mongo.Collection(null);//Create collection only on the client.
ThisPlaylist = new Mongo.Collection(null); //current playlist only on client
Lists = new Mongo.Collection('lists');

// Flow Router
FlowRouter.route('/playlist/:Id', {
    action: function(params) {
      Session.set('listName', params.Id);
      Session.set('title', '');
      Session.set('trash', false);
      console.log("RENDERING!!!!!!!");
      BlazeLayout.render("home");
      YT.load();
    },
    subscriptions: function(params) {
    this.register('Lists', Meteor.subscribe('lists'));
  }
});

FlowRouter.route('/', {
    action: function(params) {
      Session.set('listName', "");
      Session.set('title', '');
      Session.set('trash', false);
      console.log("RENDERING!!!!!!!");
      BlazeLayout.render("home");
    },
    subscriptions: function(params) {
      this.register('Lists', Meteor.subscribe('lists'));
  }
});

FlowRouter.route('/mixes/:userName', {
    action: function(params) {
      console.log("RENDERING MIX!!!!!!!");
      BlazeLayout.render("test");
    },
    subscriptions: function(params) {
    this.register('Lists', Meteor.subscribe('lists'));
  }
});

FlowRouter.route('/new', {
    action: function(params) {
      BlazeLayout.render("searches");
      Session.set('trash', true);
      Session.set('showSearches', false);

      YT.load();
    },
    subscriptions: function(params) {
      this.register('Lists', Meteor.subscribe('lists'));
      this.register('ThisPlaylist', Meteor.subscribe('ThisPlaylist'));
  }
});

FlowRouter.route('/login', {
    action: function(params) {
      BlazeLayout.render("login");
      Session.set('trash', false);
      Session.set('showSearches', false);
    },
    subscriptions: function(params) {
      this.register('Lists', Meteor.subscribe('lists'));
      this.register('ThisPlaylist', Meteor.subscribe('ThisPlaylist'));
  }
});

FlowRouter.route('/register', {
    action: function(params) {
      BlazeLayout.render("register");
      Session.set('trash', false);
      Session.set('showSearches', false);
    },
    subscriptions: function(params) {
      this.register('Lists', Meteor.subscribe('lists'));
      this.register('ThisPlaylist', Meteor.subscribe('ThisPlaylist'));
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
  var upvotes = list[0].listName[0].upvotes;

  //Set the playlist object constructor.
  tape = new Tape(reqList);
  setUpvoteDiv(upvotes, user);
  setTimeout(function(){
    console.log("setting timeout");
    player.cueVideoById(songCue);
  }, 1000); 
}

//Set playlist when initiating New list
function setNewList(params){   

  console.log("settingplaylist!!!!!!"); 
  var reqList = params;
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
  setTimeout(function(){
    console.log("setting timeout");
    player.cueVideoById(songCue);
  }, 1000); 
}

Template.userLog.events({
  "click #loginLink": function(){
    console.log('clicked loginlink');
    FlowRouter.go("/login");
  },
  "click #myMixes": function(){
    var userName = Meteor.user();
    var fullid = "/mixes/" + userName.username;

    FlowRouter.go(fullid);
  },
    "click #logout": function(){
    console.log("clicked logout");
    Meteor.logout();
  },
    "click #createNewMix": function(){
    console.log("clicked new");
    var userName = Meteor.user();
    var fullid = "/mixes/" + userName.username;
    console.log("clicked mixtape header", userName);
     var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', true);
    Session.set('songCreate', false);
    Session.set("listName", "");

    FlowRouter.go('/new');
  }
});

Template.login.events({
    'submit .login-form': function (event) {
        event.preventDefault();
        var email = event.target.email.value;
        var password = event.target.password.value;
        
        Meteor.loginWithPassword(email,password,function(err){
            if(!err) {
              FlowRouter.go('/');
            }
        });
    }
});

Template.register.events({
    'submit .register-form': function (event) {
        console.log("submiting register-form");
        event.preventDefault();
  
        var email = event.target.email.value;
        var password = event.target.password.value;
        var firstname = event.target.firstname.value;
        var lastname = event.target.lastname.value;
 
        var user = {'email':email,password:password,profile:{name:firstname +" "+lastname}};
 
        Accounts.createUser(user,function(err){
            if(!err) {
              FlowRouter.go('/');
            } else {
              console.log("Error!:", err);
            }
        });
    }
});


Template.headerNav.events({
  "click #logoCentered": function(){
    var userName = Meteor.user();
    var fullid = "/mixes/" + userName.username;
    console.log("clicked mixtape header", userName);

    FlowRouter.go(fullid);
  }
});

Template.headerNav.events({
  "click #registerLink": function(){
    FlowRouter.go("/register");
  }
});

Template.test.helpers({
  myLists: function(){
    return Lists.find({author: Meteor.user().username});
  }
});

Template.test.events({
  "click .playlistName": function(event){
    var id = event.target.id;
    var fullid = "/playlist/" + id;
    //show playerBox
    $('#playerBox').css('display', 'block');
    console.log("Test click");
    SongClient.remove({}); //Remove the client's temporary playlist
    // Session.set("title", ""); //Remove Session title
    // FlowRouter.go(fullid);
    FlowRouter.redirect(fullid);
  },
  "click .delete": function (event){
    console.log("༼ つ ◕_◕ ༽つ delete!");
    // if () {
      Meteor.call("deleteList", this._id);
    // }
  },
    "click #newMix": function(){
    console.log("clicked new");
    var userName = Meteor.user();
    var fullid = "/mixes/" + userName.username;
    console.log("clicked mixtape header", userName);
     var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', true);
    Session.set('songCreate', false);
    Session.set("listName", "");

    FlowRouter.go('/new');
  }
});

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
  title: function() {
    return Session.get('title');
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
  },
  showSearches: function(){
    return Session.get('showSearches');
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

      //Hide title form
      $('.savePlay').hide(); 

      // Clear the form
      e.target.q.value = '';
    } else {
      Session.set('noTitle', true);
    }
  },

  //Submits newly created playlist to server
  'click #submitPlaylist': function(){
    console.log("clicked submit");
    var title = Session.get('title')[0].text;
    var list = SongClient.find().fetch();
    // CHANGED 'myPlay' >> 'title'
    var playlist = {text: title, player: list};
    Meteor.call('setSong', list, title, function(error, result){
      if(error){
        console.log("Something went terribly wrong");
      }else{
         var fullid = "/playlist/" + title;
        // //show playerBox
        // $('#playerBox').css('display', 'block');
        SongClient.remove({}); //Remove the client's temporary playlist
        FlowRouter.redirect(fullid);

      }
    });//Add to MongoDB on the server
    Session.set("title", ""); //Remove Session title



  },
  'click #forwardNav': function(){
    console.log("clicked forwardNav");
    var textField = document.getElementById("vidSearchInput");
    console.log("textField", textField.value);
    var text = Session.get('title').textContent;
    var thisToken = Session.get('forwardNav');

    Meteor.call('checkYT', {record: textField.value, token: thisToken}, function(error, results) {
      console.log("YT RESULTS:", results, "parsed", yt);

      var yt = JSON.parse(results.content);
      Session.set('forwardNav', results.data.nextPageToken);//Set the next set of YouTube results to load
      Session.set('backwardNav', results.data.prevPageToken);
      var x = [];
      yt.items.forEach(function(e){
        x.push({text: e.snippet.title,
                id: e.id.videoId,
                pic: e.snippet.thumbnails.default.url
        });
      });
      console.log("results", x);
      Session.set('results', x);
    });  

    // Clear the form
    document.getElementById('vidSearchInput').value='';

    // Hide title form
    $('.savePlay').hide();
  
  },
    'click #backwardNav': function(){
    console.log("clicked backwardNav");
    var textField = document.getElementById("vidSearchInput");
    console.log("textField", textField.value);
    var text = Session.get('title').textContent;
    var thisToken = Session.get('backwardNav');

    Meteor.call('checkYT', {record: textField.value, token: thisToken}, function(error, results) {
      console.log("YT RESULTS:", results, "parsed", yt);

      var yt = JSON.parse(results.content);
      Session.set('forwardNav', results.data.nextPageToken);//Set the next set of YouTube results to load
      Session.set('backwardNav', results.data.prevPageToken);
      var x = [];
      yt.items.forEach(function(e){
        x.push({text: e.snippet.title,
                id: e.id.videoId,
                pic: e.snippet.thumbnails.default.url
        });
      });
      console.log("results", x);
      Session.set('results', x);
    });

    // Clear the form
    document.getElementById('vidSearchInput').value='';

    // Hide title form
    $('.savePlay').hide();  
  },
  'click .searchClass': function(ev){
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

    //Update the current playlist to include newly added songs
    var thisList = SongClient.find().fetch();
    var listObj = [{playlist: thisList}];
    console.log("listObj = ", listObj);

    ThisPlaylist.update(
      { name: "current" },
      {
         name: "current",
         listName: listObj,
      },
        { upsert: true}
    );

    setNewList(listObj);
  },

  'click #searchButton': function(){
    Session.set('showSearches', true);

    console.log("clicked youTubeSearch");
    var textField = document.getElementById("vidSearchInput");
    console.log("textField", textField.value);
    var text = Session.get('title').textContent;
    Meteor.call('checkYT', {record: textField.value, token: ''}, function(error, results) {
      var subNav = document.getElementsByClassName('subnavParent');
      console.log('subNav:', subNav);
      // subNav[0].innerHTML = '<div id="hey">HEY</div>';
      console.log("YT RESULTS:", results, "parsed", yt);

      var yt = JSON.parse(results.content);
      Session.set('forwardNav', results.data.nextPageToken);
      console.log(results.data.nextPageToken);
      var x = [];
      yt.items.forEach(function(e){
        x.push({text: e.snippet.title,
                id: e.id.videoId,
                pic: e.snippet.thumbnails.default.url
        });
      });
      console.log("results", x);
      Session.set('results', x);
    });

    // Clear the form
    document.getElementById('vidSearchInput').value='';

    // Hide title form
    $('.savePlay').hide();
  },
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
    'click .songClass': function (event) {
      var songIndex = $(event.currentTarget).attr("name"); //Get song index number
      
      tape.setFocus(songIndex);
      setDivFocus()
      playSongFocus();
  }
});

Template.listViewer.onRendered(function () {
  var listName = Session.get('listName');
  setPlayList(listName);
});


Template.listViewer.helpers({
  listTape: function(){
    var trash = Session.get('trash');
    // console.log("tape.playlist:", tape.playlist);
    if(trash === true){
      console.log('SONGCLIENT!!!!!!');
      return SongClient.find({});
    } else {
      console.log('THIS Playlist!!!!!!!');
    //Returning mongo Client instead of server client
    var thisList = ThisPlaylist.find().fetch();
    var thisPlaylist = thisList[0].listName[0].playlist;
    console.log("listViewer helper", thisPlaylist);

    return thisPlaylist;
  }
  },
  tapeName: function () {
    return [{text: Session.get('listName')}];
  },
  getFocus: function(focus){
    return focus;
  },
  container: function(){
    var trash = Session.get('trash');
    if(trash === true){
      return false;
    } else {
      return true;
    }
  },
  trash: function(){
    return Session.get('trash');
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

    upvoteDiv[0].innerHTML = num + "<div class=heart id=upvoteDiv> ♡ </div>";
  },
  "click .delete": function(){
    SongClient.remove(this._id);

    var thisList = SongClient.find().fetch();
    //Update the track number
    for(var i = 0; i < thisList.length; i++){
      var thisID = thisList[i].id;

      SongClient.update(
        {id: thisID},
        {$set:{index: i, track: i+1}}
      );
    } 
    var newList = SongClient.find().fetch();
    tape.playlist = newList;
    console.log('NEWLIST!!!!!;', newList);
    setDivFocus();
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
  console.log("TAPE:", tape);
  var currentFocus = tape.getFocus();
  var x = document.getElementsByClassName("songClass");
  var songIndex;
  var songText;
  var smallPlayer = '<div id="smallPlayer"><svg class="icon-play4"><use xlink:href="#icon-play4"></use></svg></div>'     
  var trash = Session.get('trash');
  //Reset Current Focus

  if(trash === false){
    for(var i = 0; i < x.length; i++){
      songIndex = tape.playlist[i].index + 1;
      songText = tape.playlist[i].text;
      var thumbPic = tape.playlist[i].pic;
      x[i].id = 'noFocus'; 
      if(currentFocus == i){
        x[i].innerHTML = smallPlayer + '<img class="searchImage" src="' + thumbPic + '"/>' + '<div class="songName">' + songText + '</div>';
      } else {
        x[i].innerHTML = '<div class="songIndex">' + songIndex + ". " + '</div>' + '<img class="searchImage" src="' + thumbPic + '"/>' + '<div class="songName">' + songText + '</div>';
      }  
    }
    x[currentFocus].id = 'focus';
   } else {
    for(var i = 0; i < x.length; i++){
      songIndex = i + 1;
      songText = tape.playlist[i].text;
      var thisId = tape.playlist[i]._id;
      var thumbPic = tape.playlist[i].pic;
      console.log("this.id is:", thisId);
      x[i].id = 'noFocus'; 
      if(currentFocus == i){
        x[i].innerHTML = smallPlayer + '<img class="searchImage" src="' + thumbPic + '"/>' + '<div class="songName">' + songText + '</div>' + '<a href="#" id="nope" class="delete"><i class="fa fa-trash-o"></i></a>';
      } else {
        x[i].innerHTML = '<div class="songIndex">' + songIndex + ". " + '</div>' + '<img class="searchImage" src="' + thumbPic + '"/>' + '<div class="songName" id="' + thisId + '">' + songText + '</div>' + '<a href="#" id="nope" class="delete"><i class="fa fa-trash-o"></i></a>';
      }  
    }
   } 
}

//Set number of upvotes
function setUpvoteDiv(num, user){
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

//YouTube API
// YouTube API will call onYouTubeIframeAPIReady() when API ready.
// Make sure it's a global variable.
onYouTubeIframeAPIReady = function () {

  player = new YT.Player("player", {
    height: '234',
    width: '415',
    // videoId: 'M7lc1UVf-VE',
    playerVars: { 'autoplay': 0, 'controls': 0, 'showinfo': 0 },
    allowfullscreen: '0',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
  });
};


function onPlayerReady(event) {
    console.log('playeris ready');

    var artist = player.getVideoData();
    // $('#artistName').text(artist.author + " " + artist.title);

    $('#forward').unbind("click");

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

//Initialize Volume
var drag = false;   /* Drag status */

  $('.volumeBarParent').mousedown(function(e) {
      console.log("mousedown");
      drag = true;
      updateVol(e.pageX);
  });

  $('.volumeBarParent').mouseup(function(e) {
      if(drag) {
          console.log("drag");
          drag = false;
          updateVol(e.pageX);
      }
  });
  $('.volumeBarParent').mousemove(function(e) {
      if(drag) {
          updateVol(e.pageX);
      }
  });

  //update Progress Bar control
  var updateVol = function(x) {
      var prog = $('.volumeBarParent');
      var maxdur = player.getVolume(); //Video duraiton
      console.log("player volume:", maxdur);
      var pos = x - prog.offset().left; //Click pos
      var percent = 100 * pos / prog.width();
      console.log("percentage clicked", percent);

      //Check within range
      if(percent > 100) {
          percent = 100;
      }
      if(percent < 0) {
          percent = 0;
      }

      //Update progress bar and video currenttime
      $('.volumeBar').css('width', percent + '%');
      player.setVolume(percent);
  };

    // console.log("Tapeid", tape.playlist[0].id);
    // var songCue = tape.playlist[0].id;
    // player.cueVideoById(songCue);
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
    console.log('Moseeee');
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
  // $('.volumeDiv').hover(
  //   function(){
  //     $(this).animate({'margin-top': '2px'});
  //   },
  //   function(){
  //     $(this).animate({"margin-top": "5px"});
  //   }
  // );

  // $('.volumeDiv').click(
  //   function(){
  //     var counter = parseInt($(this).attr('id'));

  //     player.setVolume(counter);

  //     $('.volumeDiv').css('background-color', 'rgb(143, 143, 143)');
  //     for(var i =0; i <= counter; i++){
  //       var divID = "#" + i;
  //       $(divID).css('background-color', "rgb(255, 255, 255)");
  //     }
  //   }
  // );

//Initialize Volume
var drag = false;   /* Drag status */

  $('.volumeBarParent').mousedown(function(e) {
      console.log("mousedown");
      drag = true;
      updateVol(e.pageX);
  });

  $('.volumeBarParent').mouseup(function(e) {
      if(drag) {
          console.log("drag");
          drag = false;
          updateVol(e.pageX);
      }
  });
  $('.volumeBarParent').mousemove(function(e) {
      if(drag) {
          updateVol(e.pageX);
      }
  });

  //update Progress Bar control
  var updateVol = function(x) {
      var prog = $('.volumeBarParent');
      var maxdur = player.getDuration(); //Video duraiton
      var pos = x - prog.offset().left; //Click pos
      var percentage = 100 * pos / prog.width();

      //Check within range
      if(percentage > 100) {
          percentage = 100;
      }
      if(percentage < 0) {
          percentage = 0;
      }

      //Update progress bar and video currenttime
      $('.volumeBar').css('width', percentage + '%');
      player.seekTo(maxdur * percentage / 100);
  };
});








