/**
 * This is the file to be added to the end of all webpages to implement
 * view-counting. It makes sure that constant refreshing do not add page views.
 * Note that the implemented method of refresh detection will not work if
 * multiple tabs with diferrent document.referrer values are used.
 * If a user is verified it also adds a view count display to the bottom of the
 * page.
 * Requires the following script tags.
 *   <script src='socket.io/socket.io.js'></script>
 *   <script src='http://code.jquery.com/jquery-1.9.1.js'></script>
 *   jquery-cookie can be found here: https://github.com/carhartl/jquery-cookie
 *   socket.io can also be included with the url: "http://<uri:port>/socket.io/socket.io.js"
 *
*/
var logDebug = false;
// Document Referrer
//var ref = document.referrer;

$.ajax({
  url: 'http://localhost:8082/von-count',
  xhrFields: {
    // Allow us to pass sessions/cookies
    withCredentials: true
  }
});

$(function() {
  var displays = $('.bzcount');
  if(displays.length) {
    var socket = io.connect('http://localhost:8082');

    //Change all the elements without a 'rel' attribute to one with the
    //attribure. This makes the next step a lot easier.
    displays.filter(':not([rel])').attr('rel', document.location.href);
    var jq = $();
    $('.bzcount').each(function(ind, el){
    var filterStr;
    var relVal = $(this).attr('rel');
    filterStr = '[rel="'+relVal+'"]';
    if(!jq.is(filterStr)) {
      jq = jq.add($(this));
      socket.emit('verified', relVal);
    }
    });

    //Get the initial page counts and add them.
    socket.on('initial', function(data) {
    //console.log('init', data);
    var jqo = $('.bzcount[rel="' + data['hash'] + '"]');
    var count = parseInt(jqo.html()) || 0;
    count += parseInt(data['count']);
    jqo.html(count);
    });

    //When an update occurs, increment the count
    socket.on('update', function(data) {
    //console.log('update', data);
    var jqo = $('.bzcount[rel="' + data['hash'] + '"]');
    var count = parseInt(jqo.html()) || 0;
    count ++;
    jqo.html(count);
    });
  }
});
