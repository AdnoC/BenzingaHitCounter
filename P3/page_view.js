
$.post('http://localhost:3000/von-count');  //Send to the counter server a message that this page got a hit.
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
