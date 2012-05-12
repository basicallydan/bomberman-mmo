Crafty.c('OtherBomber', {
  init: function() {
      //setup animations
      this.requires("SpriteAnimation")
      .animate("walk_left", 6, 3, 8)
      .animate("walk_right", 9, 3, 11)
      .animate("walk_up", 3, 3, 5)
      .animate("walk_down", 0, 3, 2);
    return this;
  },
  moveBomber : function(to) {
    if(this.x < to.x) this.stop().animate("walk_right", 10, -1);
    else if(this.x > to.x) this.stop().animate("walk_left", 10, -1);
    else if(this.y < to.y) this.stop().animate("walk_down", 10, -1);
    else if(this.y > to.y) this.stop().animate("walk_up", 10, -1);
    this.x = to.x;
    this.y = to.y;
  },
  getGridPosition : function() {
    return [Math.floor(this.x / 16), Math.floor(this.y /16)];
  }
});