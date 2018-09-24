$(function () {
  "use strict";

  // for better performance - to avoid searching in DOM
  var input = $('#input');
  var content = $('#content');
  var leftBar = $('#leftBar');
  var status = $('input:text');
  var rightBar = $('#rightBar');
  var typing = $('#typing');  

  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  // if browser doesn't support WebSocket, just show
  // some notification and exit
  if (!window.WebSocket) {
    content.html($('<p>',
      { text:'Sorry, but your browser doesn\'t support WebSocket.'}
    ));
    status.attr('placeholder','Sorry, but your browser doesn\'t support WebSocket.');
    input.hide();
    $('span').hide();
    return;
  }

  // open connection
  var url = prompt("url: ", "wss://ip:port");
  var connection = new WebSocket(url);

  connection.onopen = function () {
    // first we want users to enter their names
    alert("You need to login to use me OwO");
    var uname = prompt("Username: ", "Mik-chan");
    var pword = prompt("Password: ");
    connection.send(JSON.stringify({"type": "auth", "username": uname, "password": pword}));
    status.attr('placeholder','send message');
  };

  connection.onerror = function (error) {
    // just in there were some problems with connection...
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your connection or the server is down.'
    }));
    status.attr('placeholder','Sorry, but there\'s some problem with your connection or the server is down.');
  };

  // most important part - incoming messages
  connection.onmessage = function (message) {
    // I should be doing a try catch, but that borkes so /shrug
    var json = JSON.parse(message.data);

    // NOTE: if you're not sure about the JSON structure check the server source
    if (json.type == 'auth') {
      if (json.success == 'true') {
        addMessage("SERVER BROADCAST", ";; YOU LOGGED IN", "NULL", new Date());
      }
    }
    if (json.type == 'typing') {
        status.attr('typing', json.user+' is typing a message....');
    }
    if (json.type == 'message') {
        // addMessage(author, message, channel, dt)
        // input.removeAttr('disabled'); 
        addMessage(json.author, json.message, json.channel, new Date());
    }
    if (json.type == 'user_list') {
        addUsers(json.users);  // array
    }
    if (json.type == 'channel_list') {
        addChannel(json.channels); // array
    }
    if (json.type == 'join') {
        addUsers([json.username]); // 'cause addUser takes an array
    }
    if (json.type == 'quit') {
        $('#'+json.username).remove(); // can't be bothered with a seperate function m9999
    }
    else {
      console.log('Hmm..., I\'ve never seen JSON like this:', json);
    }
  };
    
  // connection.onclose = process.exit

  // Send message when user presses Enter key
    input.keydown(function(e) {
        if (e.keyCode === 13) {
          var msg = $(this).val();
          console.log(msg);
          //var msg = input.value();
          if (!msg) {
            return;
          }
          // send the message as an ordinary text
          connection.send(JSON.stringify({"type": "typing"}));
          connection.send(JSON.stringify({"type": "message", "message": msg}))
          $(this).val('');
        }
      });

  /**
   * Add message to the chat window
   */
  function addMessage(author, message, channel, dt) {
      content.append( '<p> << ' + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':' + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())+'<span>: ' + author + '</span>' + ' >> ' + message + '</p>');
  }    
    
  function addUsers(users) {
      for (var i=0; i<users.length; i++) {
          rightBar.append('<p id="' + users[i] + '"> ' + users[i] + '</p>');
          //console.log(users[i], users);
      }
  }
  
  function addChannel(channels) {
      for (var i=0; i<channels.length; i++) {
          leftBar.append('<p><a href="#' + channels[i] + '">' + channels[i] + '</a></p>');
      }
  }
});
