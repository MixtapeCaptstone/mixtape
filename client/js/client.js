SongClient = new Mongo.Collection(null);//Create collection only on the client.
Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');

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
    console.log("Drop event");
    var x = Session.get('tempSave');
    var y = Session.get('results');
    var z = Session.get('title')[0].text;
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        //Call addSong to save to server
        Meteor.call('addSong', e);
        // CHANGED 'e.playlist' >> 'z'
        //Save onto client
        SongClient.insert({
          text: e.text,
          createdAt: new Date(),
          id: e.id,
          pic: e.pic,
          owner: Meteor.userId(),
          username: Meteor.user().username,
          playlist: z
        });
      }
    });
  },
  'click .songHover': function (event) {
    console.log('click', event.target);
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

      Session.set('noTitle', false);

      // Clear the form
      e.target.q.value = '';
    } else {
      console.log('no title');
      Session.set('noTitle', true);
    }
  },
  //Submits newly created playlist to server
  'click #submitPlaylist': function(){
    console.log('submitting');
    // CHANGED title = Session.get('title')
    var title = Session.get('title')[0].text;
    console.log(title);
    var list = SongClient.find().fetch();
    // CHANGED 'myPlay' >> 'title'
    var playlist = {text: title, player: list};
    Meteor.call('setSong', list, title);//Add to MongoDB on the server
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  }
});

Template.playlistsBrowseCreate.events({
  "click .showCreate": function (e) {
    // Ensuring that the user creates a playlist first
    e.preventDefault();

    var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', true);
    Session.set("listName", "");
  },
  "click .myMixes": function (e) {
    e.preventDefault();
    Session.set('playa', false);
    Session.set('showLast', false);
    Session.set('clickCreate', false);
    Session.set('mix', true);
  },
  "click .playa": function (e) {
    e.preventDefault();
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', false);
    Session.set('playa', true);
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
    console.log('click', event.target);
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

Template.playlist.helpers({
  playa: function () {
    return Session.get('playa');
  },
  allLists: function(){
    return Lists.find({});
  }
});
Template.playlist.events({
  "click .playlistName": function(event){
    Session.set("listName", event.target.id);
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  },
  "click .delete": function (event){
    console.log("༼ つ ◕_◕ ༽つ delete!");
    // if () {
      Meteor.call("delete", this._id);
    // }
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
    Session.set("listName", event.target.id);
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  }
});

Template.body.helpers({
  clickCreate: function () {
      return Session.get('clickCreate');
    }
});

Template.body.events({
  "submit .search": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    var text = event.target.q.value;
    // Take "text" and use that to search YT
    Meteor.call('checkYT', text, function(error, results) {
      var yt = JSON.parse(results.content);
      var x = [];
      // console.log('JSON', yt.items);
      yt.items.forEach(function(e){
        x.push({text: e.snippet.title,
                id: e.id.videoId,
                pic: e.snippet.thumbnails.default.url
        });
      });
      // console.log('X',x);
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
  },
  'click .songClass': function () {
    console.log('click');
    var songId = this.id;
    player.loadVideoById(songId);
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
