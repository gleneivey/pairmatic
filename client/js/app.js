function put_this_into_that(person, target) {
  var td_position = $(target).offset();
  person.style.top = td_position.top + 10;
  person.style.left = td_position.left + 15;
}

var socket = io.connect('/');
socket.on('drop', function (data) {
  put_this_into_that(
    $('#' + data.person).get(0),
    $('#' + data.target).get(0)    );
});

$(function() {
  var x = 10;
  var y = 80;
  $('.person').draggable().each(function() {
    this.style.left = x;
    this.style.top = y;
    x += 90;
    if (x >= 400) {
      y += 90;
      x = 10;
    }
  });

  $('td').droppable({
    drop: function(event, ui) {
      var person = ui.draggable.get(0);
      put_this_into_that(person, this);
      socket.emit('drop', {
	  person: person.id,
	  target: this.id
      });
    }
  });
});
