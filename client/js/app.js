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
var dragWatcher = null;
var lastDi = -1;



function initialPageRender(data) {
  var personData = data.personData;
  var discussionItems = data.discussionItems;
  var html = '';

  html += '<div class="reset-button" tabindex="1">Reset</div>';
  html += '<table>';
  var rows = (personData.length / 4) + 1;
  for (var i=0; i < rows; i++) {
    var col = i*2;
    html += '<tr>';
    html +=   '<td id="notes' + col + '" class="notes left"></td>'
    html +=   '<td id="pA' + col +'" class="pair">&nbsp;</td>';
    html +=   '<td id="pB' + col +'" class="pair">&nbsp;</td>';

    col++;
    html +=   '<td class="pair-filler">&nbsp;</td>'

    html +=   '<td id="pA' + col +'" class="pair">&nbsp;</td>';
    html +=   '<td id="pB' + col +'" class="pair">&nbsp;</td>';
    html +=   '<td id="notes' + col + '" class="notes right"></td>'
    html += '</tr>';
  }
  html += '</table>\n';
  html += '<img id="pear" class="food" src="/vendor/pear.png" />';
  html += '<img id="stilton" class="food" src="/vendor/stilton.png" />';

  for (var i=0; i < personData.length; i++) {
    var
      id=personData[i][0],
      name=personData[i][1],
      location=personData[i][3],
      email=personData[i][4];

    html += '<div id="' + id + '" class="person">';

    if (email) {
      var h = /@/.test(email) ? hex_md5(email) : email;
      html+= '<img src="http://www.gravatar.com/avatar/' + h + '?s=66"/>';
    }

    if (location) {
      html += '<div class="where">' + location + '</div>';
    }

    html += '<span>' + name + '</span></div>';
  }


  html += '<div id="discussion-items">';
  html +=   '<h2>Items to Discuss</h2>';

  var i=0;
  $.each(discussionItems, function(k, value) {
    html += discussionItemTemplate(
      '<textarea id="di' + i + '" class="di">' + value
    );

    i++;
  });

  for (var j=0; j < 3; j++,i++){
    html += discussionItemTemplate(
      '<textarea id="di' + i + '" class="di"></textarea>'
    );
  }
  html += '</div>';
  lastDi = i - 1;

  $('#content').html(html);


  var endingY = resetPersonPositions();
  $('#discussion-items').get(0).style.top = endingY;

  $(document).
    on('change', '.di', handleDiUpdate).
    on('keyup', '.di', handleDiUpdate).
    on('click', '.item-clear', doDiClear);

  $('.di').each(function() {
    $element = $(this);
    if ($element.val() && $element.val() != '') {
      $element.parent().find('img').get(0).style.opacity = 100;
    }
  });

  setupNoteIcons();
  $('.reset-button').click(function() {
    resetData();
    resetPersonPositions();
    socket.emit('reset', {});
  });

  $('body').droppable({
    drop: function(event, ui) {
      doUnpair(ui.draggable[0]);
    }
  });

  $('td.pair').droppable({
    drop: function(event, ui) {
      if (!ui.draggable.hasClass('person')){ return; }

      var person = ui.draggable.get(0);
      if (putThisIntoThat(person.id, this.id)) {
	socket.emit('pair', {
	    person: person.id,
	    target: this.id
	});
      } else {
        person.style.top = dragstartPosition.top;
        person.style.left = dragstartPosition.left;
        doUnpair(person);
      }
    }
  });
}

function discussionItemTemplate(textAreaTag) {
  return '<div>' +
	   '<img class="item-clear" src="/vendor/not-icon.png">' +
	   textAreaTag +
	   '</textarea>' +
	 '</div>';
}

function setupNoteIcons() {
  $('.notes').html('<img src="/vendor/notes.png">');
  $('.notes img').click(function() {
    var td = $(this).parent();
    td.html('<textarea rows="4" />');
    var textarea = $('textarea', td);
    textarea.focus().change(sendNoteUpdate).keyup(sendNoteUpdate);
  });
}

function sendNoteUpdate(event, ui) {
  socket.emit('note', {
    target: $(this).parent().get(0).id,
    note: $(this).val()
  });
}

function setNote(target, note) {
  var td = $('#' + target);
  td.html('<textarea rows="4">' + note + '</textarea>');
}


function diActivated(element) {
  var $parent = $(element).parent();
  $parent.find('img').get(0).style.opacity = 100;
  var matched = /di([0-9]+)/.exec(element.id);
  var diIndex = parseInt(matched[1]);
  if (diIndex == lastDi) {
    lastDi++;
    var html = discussionItemTemplate(
      '<textarea id="di' + lastDi + '" class="di"></textarea>'
    );
    $parent.append(html);
  }
}

function handleDiUpdate(event, ui) {
  var item = $(this).val();
  if (item && item != '') {
    diActivated(this);
  }
  socket.emit('di', {
    target: this.id,
    item: item
  });
}

function setDi(target, item) {
  $elem = $('#' + target);
  $elem.val(item);
  if (item && item != '') {
    diActivated($elem.get(0));
  } else {
    $elem.parent().find('img').get(0).style.opacity = 0;
  }
}

function doDiClear(event, ui) {
  var $img = $(this);
  var $textarea = $img.parent().find('textarea');
  $textarea.val('');
  $textarea.trigger('change');
  $img.get(0).style.opacity = 0;
}


function onDragStart(event, ui) {
  dragstartPosition = {
    top: ui.originalPosition.top,
    left: ui.originalPosition.left
  };

  var person = event.target;
  dragWatcher = setInterval(
      function() {
	socket.emit('move', {
	    person: person.id,
	    top: person.style.top,
	    left: person.style.left
	 });
      }, 70
  );
}

function onDragStop(event, ui) {
  clearInterval(dragWatcher);
  dragWatcher = null;
}

function resetData() {
  pairingState = {};
  dragstartPosition = {};
  setupNoteIcons();
  $('.di').each(function() {
    var $element = $(this);
    $element.val('');
    $element.parent().find('img').get(0).style.opacity = 0;
  });
}

function resetPersonPositions() {
  $('.food').draggable({
    start: onDragStart,
    stop: onDragStop
  });

  var x = 0;
  var y = 0;
  $('.person').draggable({
    start: onDragStart,
    stop: onDragStop
  }).each(function() {
    this.style.left = x;
    this.style.top = y;
    x += 90;
    if (x >= 300) {
      y += 90;
      x = 0;
    }
  });

  return y + 90;
}

function removeHashEntryByValue(h, v){
  for (var k in h) {
    if (h[k] == v) {
      delete h[k];
    }
  }
}

function putThisIntoThat(person, target) {
  if (pairingState[target]) {
    return false;
  }

  removeHashEntryByValue(pairingState, person);
  pairingState[target] = person;

  var td_position = $('#' + target).position();
  person = $('#' + person).get(0);
  person.style.top = td_position.top + 10;
  person.style.left = td_position.left + 15;

  return true;
}

function doUnpair(elem) {
  var id = elem.id;
  removeHashEntryByValue(pairingState, id);
  socket.emit('unpair', {
      person: id,
      top: elem.style.top,
      left: elem.style.left
   });
}

function doMove(data) {
  person = $('#' + data.person).get(0);
  person.style.top = data.top;
  person.style.left = data.left;
}

var socket = io.connect('/');
socket.on('init', function(data) {
  console.log(JSON.stringify(data));
  initialPageRender(data);
  $.each(data['notes'], function(target, note) {
    setNote(target, note);
  });
  $.each(data['state'], function(target, person) {
    putThisIntoThat(person, target);
  });
});
socket.on('reset', function() {
  resetData();
  resetPersonPositions();
});
socket.on('pair', function(data) {
  putThisIntoThat(data.person, data.target);
});
socket.on('unpair', function(data) {
  removeHashEntryByValue(pairingState, data.person);
  doMove(data);
});
socket.on('move', function(data) {
  doMove(data);
});
socket.on('note', function(data) {
  setNote(data.target, data.note);
});
socket.on('di', function(data) {
  setDi(data.target, data.item);
});
