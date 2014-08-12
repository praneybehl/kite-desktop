Template.dashboard_menu.events({
  'click .mac-close': function () {
    win.close();
  },
  'click .mac-minimize': function () {
    win.minimize();
  },
  'mouseover .mac-window-options': function () {
    $('.mac-close img').attr('src', '/mac/mac-close-hover.png');
    $('.mac-minimize img').attr('src', '/mac/mac-minimize-hover.png');
    $('.mac-maximize img').attr('src', '/mac/mac-maximize-hover.png');
  },
  'mouseleave .mac-window-options': function () {
    $('.mac-close img').attr('src', '/mac/mac-close.png');
    $('.mac-minimize img').attr('src', '/mac/mac-minimize.png');
    $('.mac-maximize img').attr('src', '/mac/mac-maximize.png');
  }
});

Template.dashboard_menu.rendered = function () {
  $('.nav a').attr('tabIndex', '-1');
  $('.nav a').attr('onfocus', 'this.blur()');
  $('.nav a').tooltip();
};
