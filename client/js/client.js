SongClient = new Mongo.Collection(null);//Create collection only on the client.
ThisPlaylist = new Mongo.Collection(null); //current playlist only on client
Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');


//Player functions


function playSongFocus(){
  var currentFocus = getSongFocus();
  var list = ThisPlaylist.find().fetch();
  console.log("Running playSongFocus");
  var songId = list[0].listName[0].playlist[currentFocus].id;
  console.log("var Song:", songId);
}

function setSongFocus(index){
  console.log('Setting song focus');
  console.log('index:', index);

  // remove previous focus
  var currentFocus = getSongFocus();
  console.log("currentFocus", currentFocus);
  var removeModifier = { $set: {} };
  removeModifier.$set["listName.0.playlist." + currentFocus + ".focus"] = false;
  ThisPlaylist.update({name: 'current'}, removeModifier);

  //set new focus
  var setModifier = { $set: {} };
  setModifier.$set["listName.0.playlist." + index + ".focus"] = true;
  ThisPlaylist.update({name: 'current'}, setModifier);
  getSongFocus();
  // ThisPlaylist.update ({name: 'current'}, { '$set': {"listName.0.playlist.1.focus" : true} });
}

function getSongFocus(){
  var list = ThisPlaylist.find().fetch();
  console.log("Running getSongFocus");
  console.log("getSongFocus list is:", list);
  var playlist = list[0].listName[0].playlist;
  var indexValue;
  console.log("getSongFocus playlist is:", playlist);
  playlist.forEach(function(element, index, array){
    var thisFocus = element.focus;
    console.log("forEach loop:", thisFocus);
    if(thisFocus === true){
      console.log("returning index of true", index);
      indexValue = index;
    }
  });
  return indexValue;
}

// Iron Router
Router.route('/', function(){
    this.render('home');
});

Router.route('/test/:_id', {
  action: function () {
     // render all templates and regions for this route
     this.render('test');


   },
   onAfterAction: function () {
     var params = this.params; // { _id: "List Name" }
     var id = params._id; // "List Name"
     Session.set('listName', id);
     //find playlist object
     var findSong = function(){
      return this;
     };
     var reqList = Lists.find({ name: id }).fetch();
     console.log("reqlist", reqList);
     ThisPlaylist.update(
        { name: "current" },
        {
           name: "current",
           listName: reqList,
           findSong: findSong
        },
        { upsert: true }
     );
     ThisPlaylist.update ({name: 'current'}, { '$set': {"listName.0.playlist.0.focus" : true} });
   }


  // // Session.set('playa', false);
  // Session.set('YT', true);
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
    // console.log(Song.find({}).fetch());
    var y = Session.get('title');
    var x = y[0].text;
    var name = Meteor.user().username;
    var callback = [];
    var z = Song.find({});
    console.log(name, x, y);
    z.forEach(function(tune){
      if (tune.username === name)
        callback.push(tune);
    });
    console.log(callback);
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
  },
  'click .songHover': function (event) {
    $('#focus').removeAttr('id'); //remove previous focus
    event.target.id = "focus"; //set focus

    var songId = this.id;
    player.loadVideoById(songId);
  },
  'mouseenter .songName': function(event){
    thisDiv = event.target; //get "this"
    $(thisDiv).attr("class", "songHover" );//set hover class
  },
  'mouseleave .songHover': function(event){
    thisDiv = event.target; //get "this"
    $(thisDiv).attr("class", "songName" ); //remove hover class
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
    $('#focus').removeAttr('id'); //remove previous focus
    event.target.id = "focus"; //set focus
    var songIndex = this.name;
    var songId = this.id;
    player.playVideoAt(songIndex);
  },
  'mouseenter .songName': function(event){
    thisDiv = event.target; //get "this"
    $(thisDiv).attr("class", "songHover" );//set hover class
  },
  'mouseleave .songHover': function(event){
    thisDiv = event.target; //get "this"
    $(thisDiv).attr("class", "songName" ); //remove hover class
  },
  'click .songClass': function (event) {
    $('.focus').attr('class', 'songClass'); //remove previous focus
    var self = event.target;
    $(self).attr( 'class', 'focus');//set focus

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
    var newList = Lists.find({name: event.target.id}).fetch();//get playlist
    var listArray = [];
    //push individual sing id's into an empty array
    newList[0].playlist.forEach(function(element, index, array){
      listArray.push(element.id);
    });

    //set state
    // e.preventDefault();
    Session.set('playa', false);
    Session.set('YT', true);

    //show playerBox
    $('#playerBox').css('display', 'block');

    //set playlist
    Session.set("listName", event.target.id);
    player.loadPlaylist({
        'playlist': listArray,
        'listType': 'playlist',
        'index': 0,
        'startSeconds': 0,
        'suggestedQuality': 'small'
    });

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

Template.home.helpers({
  clickCreate: function () {
      return Session.get('clickCreate');
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
    console.log('escolta clicked');
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
    console.log('dropevent');
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
  };
  Accounts.ui.config({
    // require username rather then email
   passwordSignupFields: 'USERNAME_ONLY'
  });
});
