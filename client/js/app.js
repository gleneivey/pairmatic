// PairMatic - a real-time remote pair coordinating web app
// Copyright (C) 2012 - Glen E. Ivey
// https://github.com/gleneivey/pairmatic
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version
// 3 as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program in the file COPYING and/or LICENSE. If not,
// see <http://www.gnu.org/licenses/>.


var pairingState = {};
var dragstartPosition = {};

function storeDragstartPosition(event, ui) {
  dragstartPosition = {
    top: ui.originalPosition.top,
    left: ui.originalPosition.left
  };
}

function resetPersonPositions() {
  pairingState = {};

  var x = 10;
  var y = 80;
  $('.person').draggable({
    start: storeDragstartPosition
  }).each(function() {
    this.style.left = x;
    this.style.top = y;
    x += 90;
    if (x >= 400) {
      y += 90;
      x = 10;
    }
  });
}

function putThisIntoThat(person, target) {
  if (pairingState[target]) {
    return false;
  }
  pairingState[target] = person;

  var td_position = $('#' + target).position();
  person = $('#' + person).get(0);
  person.style.top = td_position.top + 10;
  person.style.left = td_position.left + 15;

  return true;
}



var socket = io.connect('/');
socket.on('drop', function (data) {
  putThisIntoThat(data.person, data.target);
});
socket.on('init', function (data) {
  $.each(data['state'], function(target, person) {
    putThisIntoThat(person, target);
  });
});
socket.on('reset', function () {
  resetPersonPositions();
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


  html += '<div class="reset-button" tabindex="1">Reset</div>';
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

  $('#content').html(html);
  resetPersonPositions();
  $('.reset-button').click(function() {
    resetPersonPositions();
    socket.emit('reset', {});
  });


  $('td').droppable({
    drop: function(event, ui) {
      var person = ui.draggable.get(0);
      if (putThisIntoThat(person.id, this.id)) {
	socket.emit('drop', {
	    person: person.id,
	    target: this.id
	});
      } else {
        person.style.top = dragstartPosition.top;
        person.style.left = dragstartPosition.left;
      }
    }
  });
});
