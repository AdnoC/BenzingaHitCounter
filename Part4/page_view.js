/**
 * This is the file to be added to the end of all webpages to implement
 * view-counting. It makes sure that constant refreshing do not add page views.
 * Note that the implemented method of refresh detection will not work if
 * multiple tabs with diferrent document.referrer values are used.
 * If a user is verified it also adds a view count display to the bottom of the
 * page.
 * Requires the following script tags.
 *     <script src='socket.io/socket.io.js'></script>
 *     <script src='http://code.jquery.com/jquery-1.9.1.js'></script>
 *     <script src='/jquery-cookie-master/jquery.cookie.js'></script>
 *   jquery-cookie can be found here: https://github.com/carhartl/jquery-cookie
 *   socket.io can also be included with the url: "http://<uri:port>/socket.io/socket.io.js"
 *
*/
var newView = false;
var ref = document.referrer; //If the user navigates to the page from a new tab,
//referrer will be undefined, so set it to a unique value for purposes of
//cookie checking.
if(!ref) {
    ref = 'NO REFERRER';
}
var cVal = $.cookie(document.location.href+'RefreshProtection');
console.log('Cookie[' + cVal + '] Ref[' + ref + ']');
if(!cVal || cVal != ref) { //If the cookie doesn't exist or they came from a different page
    newView = true;
    $.post('http://localhost:3000/von-count');  //Send to the counter server a message that this page got a hit.
}
//Set the cookie with where they came from as its contents. If they refresh,
//the value will be the same, so the check above will fail. The cookie expires
//after X minutesm but the timer is refreshed each time the page is visited.
var date = new Date();
var minutes = 30;
date.setTime(date.getTime() + (minutes * 60 * 1000));
$.cookie(document.location.href+'RefreshProtection', ref, {expires: date});
if(1==1) { //TODO Add verification. Currently always runs.
    console.log('Verified, loading page view count');
    var socket = io.connect('http://localhost:3002'); //Connect to the server

    var html = '<div>Page Views: <b></b></div>'; //Add a div to the end ofthe page
//whith which to display the view count.
    $('body').children().last().after(html);
    $('b:last').attr('id', 'page_view_display');

    var count = 0;
    socket.on('initial', function(data) { //Get the initial page counts and add them.
        count += parseInt(data);
        console.log('Init: data[' + data + '] count[' + count + ']');
        $('#page_view_display').html(count);
    });
    socket.on('update', function(data) { //When an update occurs, increment the count
        count++;
        console.log('Upd: data[' + data + '] count[' + count + ']');
        $('#page_view_display').html(count);
    });
    if(newView) { //Normally the view count would be one short, as it would not
//include THIS view in its count. This accounts for this view. It does not do 
//anything on refreshes, because Mongo might have been updated by
//then.
        count++;
    }
}
