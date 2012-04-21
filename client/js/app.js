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


var personData = null;
var pairingState = {};
var dragstartPosition = {};
var dragWatcher = null;
var lastDi = -1;
var standupBeforeDuringAfter = 'before';
var standupStartTime;
var standupEndTime;

var clockUpdater;
var toyHeightMap = {};

var ID_INDEX = 0;
var NAME_INDEX = 1;
var LOCATION_INDEX = 3;
var GROUP_INDEX = 4;
var GROUP_EMAIL = 5;

var STANDUP_TIME;
(function() {
  var time = new Date('1/1/2012 09:30 MST');
  var today = new Date();
  today.setHours(time.getHours());
  today.setMinutes(time.getMinutes());
  today.setSeconds(time.getSeconds());
  STANDUP_TIME = today;
})();
var STANDUP_WARNING = 12.5 *60*1000;
var STANDUP_LENGTH =  15   *60*1000;
var TIMER_ACTIVE_WINDOW = 60 *60*1000;
var TIMER_INACTIVE_TEXT = "-- - --";
var TIMER_INACTIVE_COLOR = "blue";
var TIMER_MEETING_COLOR = "green";
var TIMER_WARNING_COLOR = "yellow";
var TIMER_LATE_COLOR = "red";



function initialPageRender(data) {
  personData = data.personData;
  standupBeforeDuringAfter = data.standupBeforeDuringAfter || standupBeforeDuringAfter;
  standupStartTime = data.standupStartTime ? new Date(data.standupStartTime) : null;
  standupEndTime = data.standupStartTime ? new Date(data.standupStartTime) : null;

  var discussionItems = data.discussionItems;
  var html = '';

  html += '<div class="button shuffle-button" tabindex="1">Shuffle</div>';
  html += '<div class="button reset-button" tabindex="1">Reset</div>';
  html += '<div id="timer-button-container"><div class="button timer-button" tabindex="1">Start</div></div>';
  html += '<div id="clock">' + TIMER_INACTIVE_TEXT + '</div>';
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
  html += '<img id="pear" class="toy" src="/vendor/pear.png" />';
  html += '<img id="stilton" class="toy" src="/vendor/stilton.png" />';
  html += '<img id="teapot" class="toy" src="/vendor/teapot.png" />';
  html += '<img id="laphroaig" class="toy" src="/vendor/laphroaig.png" />';
  html += '<img id="t800" class="toy" src="/vendor/t800.png" />';

  toyHeightMap.pear = '70px';
  toyHeightMap.stilton = '64px';
  toyHeightMap.teapot = '100px';
  toyHeightMap.laphroaig = '110px';
  toyHeightMap.t800 = '100px';


  for (var i=0; i < personData.length; i++) {
    var
      id = personData[i][0],
      name = personData[i][1],
      location = personData[i][3],
      group = personData[i][4],
      email = personData[i][5];

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
  $('.shuffle-button').click(function() { doShuffle(); });
  $('.reset-button').click(function() { doReset(); });
  $('.timer-button').click(function() { changeTimer(); });

  $('body').droppable({
    drop: function(event, ui) {
      doUnpair(ui.draggable[0]);
    }
  });

  $('td.pair').droppable({
    drop: function(event, ui) {
      if (!ui.draggable.hasClass('person')){ return; }

      var person = ui.draggable.get(0);
      if (!doPair(person.id, this.id)) {
        person.style.top = dragstartPosition.top;
        person.style.left = dragstartPosition.left;
        doUnpair(person);
      }
    }
  });

  standupBeforeDuringAfter == 'after' ? changeToAfter() : updateTimer();
  clockUpdater = setInterval(updateTimer, 1000);
}


function zeroPaddedTime(minutes, seconds) {
  var time = ("0" + minutes).slice(-2);
  time += ":"
  time += ("0" + seconds).slice(-2);
  return time;
}

function updateTimer() {
  var now = new Date().getTime();
  var standup = STANDUP_TIME.getTime();
  var content;
  var color = TIMER_INACTIVE_COLOR;

  function updateContentWith(millis) {
    var seconds = Math.floor( Math.abs( millis / 1000 ) );
    var minutes = Math.floor( seconds / 60 );
    seconds = seconds % 60;
    content = zeroPaddedTime(minutes, seconds);
  }

  if ((now < (standup -    TIMER_ACTIVE_WINDOW )) ||
      (now > (standup + (2*TIMER_ACTIVE_WINDOW))) ) {
    standupBeforeDuringAfter = 'before';
    content = TIMER_INACTIVE_TEXT;
  } else if (standupBeforeDuringAfter == 'before') {
    updateContentWith(standup - now);
    color = (standup - now) > 0 ? TIMER_INACTIVE_COLOR : TIMER_LATE_COLOR;
  } else if (standupBeforeDuringAfter == 'during') {
    var millis = standup - now;
    updateContentWith(millis);

         if (millis < STANDUP_WARNING) { color = TIMER_MEETING_COLOR; }
    else if (millis < STANDUP_LENGTH)  { color = TIMER_WARNING_COLOR; }
    else {                               color = TIMER_LATE_COLOR;    }

    $('.timer-button').html('Finish');
  } else { // 'after'
    clearInterval(clockUpdater);
  }

  if (content) {
    $('#clock').css('color', color).html(content);
  }
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

function changeToDuring() {
  standupBeforeDuringAfter = 'during';
  standupStartTime = new Date();
  $('#clock').html('');
}

function changeToAfter() {
  standupBeforeDuringAfter = 'after';
  $('#timer-button-container').html('');
}

function changeTimer() {
       if (standupBeforeDuringAfter == 'before') { changeToDuring(); }
  else if (standupBeforeDuringAfter == 'during') { changeToAfter();  }

  socket.emit('timer', { standupBeforeDuringAfter: standupBeforeDuringAfter, standupStartTime: standupStartTime.getTime() });
}

function doReset() {
  standupBeforeDuringAfter = 'before';
  standupStartTime = null;

  resetData();
  resetPersonPositions();
  socket.emit('reset', {});
}

function doShuffle() {
  doReset();

  var tableIndex = 1;
  var cellIndex = 0;
  function pairIntoColumnAndIncrement(personId) {
    var targetId = 'p' + (cellIndex ? 'B' : 'A') + tableIndex;
    doPair(personId, targetId);
    if (++cellIndex > 1) {
      cellIndex = 0;
      tableIndex += 2;
    }
  }

  var rubyPeople = [];
  $.each(personData, function(i, personDatum) {
    if (personDatum[GROUP_INDEX] == 'iOS')
      pairIntoColumnAndIncrement(personDatum[ID_INDEX]);
    else if (personDatum[GROUP_INDEX] == 'Ruby')
      rubyPeople.push(personDatum);
  });

  var tableIndex = 0;
  var cellIndex = 0;
  while (rubyPeople.length > 0) {
    var i = Math.floor(Math.random() * rubyPeople.length);
    pairIntoColumnAndIncrement(rubyPeople[i][ID_INDEX]);
    rubyPeople.splice(i, 1);
  }
}

function resetData() {
  pairingState = {};
  dragstartPosition = {};
  setupNoteIcons();
}

function expandToy(event, ui) {
  event.currentTarget.style.height = toyHeightMap[event.currentTarget.id];
}
function toyDragStart(event, ui) {
  expandToy(event, ui);
  onDragStart(event, ui);
}
function resetPersonPositions() {
  var x = 0, y;
  $('.toy')
      .draggable({
	start: toyDragStart,
	stop: onDragStop
      })
      .each(function() {
	this.style.left = x;
	x += 30;
      })
      .click(expandToy);

  x = 0;
  y = 20;
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

  var tdPosition = $('#' + target).position();
  person = $('#' + person).get(0);
  person.style.top = tdPosition.top + 10;
  person.style.left = tdPosition.left + 15;

  return true;
}

function doUnpair(elemOrId) {
  var id = elemOrId.id ? elemOrId.id : elem;
  removeHashEntryByValue(pairingState, id);

  var elem = $('#' + id).get(0);
  socket.emit('unpair', {
      person: id,
      top: elem.style.top,
      left: elem.style.left
   });
}

function doPair(personId, boxId){
  var success = putThisIntoThat(personId, boxId);
  if (success) {
    socket.emit('pair', {
	person: personId,
	target: boxId
    });
  }

  return success;
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
socket.on('timer', function(data) {
  if (data.standupBeforeDuringAfter) {
    standupBeforeDuringAfter = data.standupBeforeDuringAfter;
	 if (standupBeforeDuringAfter == 'during') { changeToDuring(); }
    else if (standupBeforeDuringAfter == 'after') { changeToAfter();  }
  }
  standupStartTime = data.standupStartTime ? new Date(data.standupStartTime) : null;
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
