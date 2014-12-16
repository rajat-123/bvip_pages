(function($) {
  $.fn.slideshow = function(opts){
    var self = this;
    self.defaults = {};
    self.opts = $.extend(self.defaults, opts);
    self.$obj = $(self);
    self.$container = self.$obj.find(self.opts.container);
    self.$left = this.$obj.find(self.opts.left);
    self.$right = this.$obj.find(self.opts.right);
    self.counts = {left: 0, right: 0};
    //behavior
    //left
    self.$left.click(function(event){
      if(self.counts.left < self.opts.disableOn){
        event.preventDefault();
        self.counts.left += 1;
        self.counts.right -= 1;
        var slideWidth = parseInt(self.$container.css("margin-left"));
        if(isNaN(slideWidth)){
          slideWidth = 0;            
        }
        slideWidth -= self.opts.slideBy;
        self.$container.animate({marginLeft: slideWidth}, 'fast');   
      }else{
        self.$left.attr("disabled", "disabled").addClass(self.opts.disableClass);
      }
    });
    //right
    self.$right.click(function(event){
      if(self.counts.right < self.opts.disableOn && self.counts.left > self.counts.right){
        event.preventDefault();
        self.counts.right += 1;
        self.counts.left -= 1;
        var slideWidth = parseInt(self.$container.css("margin-left"));
        if(isNaN(slideWidth)){
          slideWidth = 0;            
        }
        slideWidth += self.opts.slideBy;
        self.$container.animate({marginLeft: slideWidth}, 'fast'); 
      }else{
        self.$right.attr("disabled", "disabled").addClass(self.opts.disableClass);
      }
    });
  }
})(jQuery);