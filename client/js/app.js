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
  var html = '';
  var data = [
    [ "mark",      "Mark",      "mm",  "D"  ],
    [ "nick",      "Nick",      "nrs", "D"  ],
    [ "glen",      "Glen",      "gi",  null ],
    [ "lewis",     "Lewis",     "lh",  "D"  ],
    [ "chad",      "Chad",      "caw", null ],
    [ "alex",      "Alex",      "aj",  "D"  ],
    [ "matt",      "Matt",      "mh",  "D"  ],
    [ "thomas",    "Thomas",    "tb",  "SF" ],
    [ "david",     "David",     "ds",  "SF" ],
    [ "jordi",     "Jordi",     "jn",  "SF" ],
    [ "dan",       "Dan",       "dp",  null ],
    [ "chris",     "Chris",     "ct",  null ],
    [ "jo",        "Jo",        "jw",  null ],
    [ "christian", "Christian", "cn",  "SF" ],
    [ "johan",     "Johan",     "ji",  "SF" ]
  ];


  html += '<table>';
  var pairs = (data.length / 2) + 2;
  for (var i=0; i < pairs; i++) {
    html += '<tr><td id="pA' + i +'">&nbsp;</td>';
    html +=     '<td id="pB' + i +'">&nbsp;</td></tr>';
  }
  html += '</table>\n';

  for (var i=0; i < data.length; i++) {
    var id=data[i][0], name=data[i][1], location=data[i][3];
    html += '<div id="' + id + '" class="person">';

    if (location) {
      html += '<div class="where">' + location + '</div>';
    }

    html += name + '</div>';
  }

  $('body').html(html);


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
