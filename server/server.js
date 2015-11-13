Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');

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
  },//TODO Do we need the addSong method anymore?
  addSong: function (text) {
    // console.log("added song", text);
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
  },

  setSong: function (list, title) {
    console.log("list:", list);
    console.log("title:", title);
    Lists.insert({name: title, author: Meteor.user().username, playlist: list});
  },
  deleteList: function (id) {
    console.log('deleted', id);
    Lists.remove(id);
  }
});
