Crafty.c('Explosion', {
  init: function() {;
    this.timeout(function() {
        this.destroy();
      }, 1000);
    return this;
  }
});