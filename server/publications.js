Meteor.publish("all-songs", function(){
  return Song.find();
});

Meteor.publish('lists', function(){
  return Lists.find();
});
