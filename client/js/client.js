SongClient = new Mongo.Collection(null);//Create collection only on the client.
Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');
//
// Meteor.subscribe('song');//TODO I don't think we need this.

// METEOR THINGS
Template.user.helpers({
  // This is how to call the database and pass things
  song: function () {
    // console.log(Song.find({}).fetch());
    return Song.find({});
  },
  // playlist: function () {
  //   // TODO display title as title!
  //
  //   var x = Session.get('title');
  //   console.log(x);
  //   return x
  // }
  //same as song helper, only for client
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
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        //Call addSong to save to server
        Meteor.call('addSong', e);
        //Save onto client
        SongClient.insert({
          text: e.text,
          createdAt: new Date(),
          id: e.id,
          pic: e.pic,
          owner: Meteor.userId(),
          username: Meteor.user().username,
          playlist: e.playlist
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
  }
});

Template.searches.events ({
  // "click .showIt": function (e) {
  //   // Ensuring that the user creates a playlist first
  //   event.preventDefault();
  //
  //   var playlist = ({playlist: name});
  //
  //   Session.set('clickCreate', true);
  //
  // },
  'submit .savePlay': function (e) {
    // Create a new Playlist
    // Prevent default on submit
    e.preventDefault();

    // Capture the entered title
    var title = {text: e.target.q.value};

    //Triggers display of the search bar
    Session.set('showLast', true);

    Session.set("title", title);
    console.log(Session.get('title'));

    //Hide the input field
    Session.set('clickCreate', false);

    // Clear the form
    e.target.q.value = '';
  },
  //Submits newly created playlist to server
  'click #submitPlaylist': function(){
    var title = Session.get('title');
    var list = SongClient.find().fetch();
    var playlist = {title: 'myPlay', player: list};
    Meteor.call('setSong', list, title);//Add to MongoDB on the server
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  }
});

Template.nav.events({
  "click .showCreate": function (e) {
    // Ensuring that the user creates a playlist first
    e.preventDefault();

    var playlist = ({playlist: name});
    Session.set('playa', false);
    Session.set('mix', false);
    Session.set('showLast', false);
    Session.set('clickCreate', true);
  },
  "click .myMixes": function (e) {
    e.preventDefault();
    console.log("my mix");
    Session.set('playa', false);
    Session.set('clickCreate', false);
    Session.set('mix', true);
  },
  "click .playa": function (e) {
    e.preventDefault();
    console.log("playa");
    Session.set('mix', false);
    Session.set('clickCreate', false);
    Session.set('playa', true);
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
  "click .playlistName": function(){
    console.log("test");
    SongClient.remove({}); //Remove the client's temporary playlist
    Session.set("title", ""); //Remove Session title
  }
});

Template.mix.helpers({
  mix: function () {
    return Session.get('mix');
  }
});

Template.body.helpers({
  clickCreate: function () {
    // TODO make user give playlist title
      return Session.get('clickCreate');
    }
});

Template.body.events({

  // CHANGED .new-search >> .search
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
  // Allows the element to be dropped into a different div
  allowDrop = function (ev) {
    ev.preventDefault();
    // $("#search li").draggable ({
    //   drag: drag,
    //   drop: drop
    // });
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
    // $(this).removeAttr('id');
    // $(this).appendTo('ul #saveMe');
    // console.log(data);
    // console.log(ev.target);
    // ev.target.appendChild(data);
    // ev.target.appendChild(document.getElementById(data));
  };
  Accounts.ui.config({
    // require username rather then email
   passwordSignupFields: 'USERNAME_ONLY'
  });
});
