window.onload = function() {
  $(".songClass").click(function(){
    console.log("clicked songClass");
    var songId = this.id;
    player.loadVideoById(songId);
  });
};
