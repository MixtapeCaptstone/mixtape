Song = new Mongo.Collection('song');

Meteor.subscribe('song');

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
});

Template.user.events({
  "drop .userDis": function (event) {
    console.log("Drop event");
    var x = Session.get('tempSave');
    var y = Session.get('results');
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        // console.log('working', e.text);
        Meteor.call('addSong', e);
      }
    });
  },
  'click #playListSong': function () {
    console.log('click');
    var songId = this.id;
    player.loadVideoById(songId);
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
      return Session.get('clickCreate')
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
    Song.remove(this._id);
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
    var x = ev.srcElement.id;
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
