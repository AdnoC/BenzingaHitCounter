var cVal = $.cookie(document.location.href+'RefreshProtection');
if(!cVal || cVal != document.referrer) { //If the cookie doesn't exist or they came from a different page
    $.post('http://localhost:3000/von-count');  //Send to the counter server a message that this page got a hit.
}
//Set the cookie with where they came from as its contents. If they refresh,
//the value will be the same, so the check above will fail. The cookie expires
//after X minutesm but the timer is refreshed each time the page is visited.
var date = new Date();
var minutes = 30;
date.setTime(date.getTime() + (minutes * 60 * 1000));
$.cookie(document.location.href+'RefreshProtection', document.referrer, {expires: date});
if(1==1) { //TODO Add verification. Currently always runs.
    console.log('Verified, loading page view count');
    var socket = io.connect('http://localhost:3002');

    var html = '<div>Page Views: <b></b></div>';
    $('body').children().last().after(html);
    $('b:last').attr('id', 'page_view_display');

    var count = 0;
    socket.on('initial', function(data) {
        count += parseInt(data);
        console.log('Init: data[' + data + '] count[' + count + ']');
        $('#page_view_display').html(count);
    });
    socket.on('update', function(data) {
        count++;
        console.log('Upd: data[' + data + '] count[' + count + ']');
        $('#page_view_display').html(count);
    });
}
