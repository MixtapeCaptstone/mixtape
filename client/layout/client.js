Song = new Mongo.Collection('song');

Meteor.subscribe('song');

// METEOR THINGS
Template.user.helpers({
  song: function () {
    // console.log(Song.find({}).fetch());
    return Song.find({});
  },
});

Template.searches.helpers({
  results: function () {
    return Session.get('results');
  }
});

Template.user.events({
  "drop .userDis": function (event) {
    var x = Session.get('tempSave');
    var y = Session.get('results');
    // console.log(x);
    console.log(y);
    // if results.text === li#songID.title
    y.forEach(function(e) {
      if(e.id === x){
        console.log('working', e.text);
        Meteor.call('addSong', e);
      }
    });
  },
  // "click .saveForm": function () {
  //   event.preventDefault();
  //   $('.playListClass li').remove();
  // }
});

Template.songDiv.events({
  "drop .song": function (event) {
    console.log("songDiv event has been triggered", event);
    var x = Session.get('tempSave');
    var y = Session.get('results');
    // console.log(x);
    console.log('y:',y);
    console.log('x:',x);


    y.forEach(function(){

      $( "div", {
        "class": "player",
        text: "Click me!"
      }).appendTo('body');


    });
  }
});


Template.body.events({
  "submit .new-search": function (event) {
    // Prevent default browser form submit
    event.preventDefault();
    // Get value from form element
    var text = event.target.text.value;
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
    // Clear the form
    event.target.text.value = '';
  },
  "click .delete": function () {
    Song.remove(this._id);
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
    console.log("drop event");
    ev.dataTransfer.setData("text", ev.target.id);
    var x = ev.srcElement.id;
    Session.set('tempSave', x);
    console.log(Session.get('tempSave'));
  };

  // This event gets triggered when dropped. Puts the dragged item into the new div.
  drop = function (ev) {
    // console.log(ev.path);
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    // $(this).removeAttr('id');
    // $(this).appendTo('ul #saveMe');
    // console.log(data);
    // console.log(ev.target);
    // ev.target.appendChild(data);
    // ev.target.appendChild(document.getElementById(data));
  };
});
