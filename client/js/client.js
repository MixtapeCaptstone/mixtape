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
    // TODO make user give playlist title
      return Session.get('clickCreate');
  }
});

Template.searches.events ({
  "click .showIt": function (e) {
    event.preventDefault();

    var playlist = ({playlist: name});

    Session.set('clickCreate', true);

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
  },
  'submit .savePlay': function (e) {
    // Create a new Playlist
    // Prevent default on submit
    e.preventDefault();

    // Capture the entered title
    var title = {text: e.target.q.value};

    Session.set("title", title);
    console.log(Session.get('title'));

    // Clear the form
    e.target.q.value = '';
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
