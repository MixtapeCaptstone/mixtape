Song = new Mongo.Collection('song');
Lists = new Mongo.Collection('lists');

Meteor.methods( {
  checkYT : function (search) {
    console.log(search);
    var url = "https://www.googleapis.com/youtube/v3/search";
    var params = {
        key: apiKey,
        part: "snippet",
        q: search.record,
        type: "video",
        videoEmbeddable: true,
        maxResults: 10,
        pageToken: search.token
    };
    var res = Meteor.http.call('GET', url, {params: params});
    return res;
  },
  //TODO Do we need the addSong method anymore?
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
      playlist: text.playlist,
    });
  },

  setSong: function (list, title) {
    if(list.length > 0){
      Lists.insert({name: title, author: Meteor.user().username, upvotes: 0, upvoters: ['jim'], playlist: list});
    }
  },
  deleteList: function (id) {
    console.log('deleted', id);
    Lists.remove(id);
  },
  upvote: function(title){
    var user = Meteor.user().username;
    var thisList = Lists.find({name: title}).fetch();
    var thisId = thisList[0]._id;
    var upvoters = thisList[0].upvoters;
    var contains;
    for(var i = 0; i < upvoters.length; i++){
      if(upvoters[i] == user){
        contains = true;
      }
    }
    if(contains !== true){
      Lists.update(thisId, {$addToSet: {upvoters: user}, $inc: {upvotes: 1}}, {reactive: false});
    }
    console.log(upvoters);
  },
  downvote: function(title){
    var user = Meteor.user().username;
    var thisList = Lists.find({name: title}).fetch();
    var thisId = thisList[0]._id;
    var upvoters = thisList[0].upvoters;
    var contains;
    for(var i = 0; i < upvoters.length; i++){
      if(upvoters[i] == user){
        contains = true;
      }
    }
    if(contains === true){
      Lists.update(thisId, {$pull: {upvoters: user}, $inc: {upvotes: -1} });
    }
  }
});
