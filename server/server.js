Song = new Mongo.Collection('song');

// Meteor.publish('song', function() {
//   return Song.find({});
// });

Meteor.methods( {
  checkYT : function (search) {
    var url = "https://www.googleapis.com/youtube/v3/search";
    var params = {
        key: apiKey,
        part: "snippet",
        q: search,
        type: "video",
        maxResults: 5
    };
    var res = Meteor.http.call('GET', url, {params: params});
    return res;
  },
  addSong: function (text) {
    // var name = Meteor.user().username;
    Song.insert({
      text: text.text,
      createdAt: new Date(),
      id: text.id,
      pic: text.pic,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      playlist: text.playlist
    });
  }
});
