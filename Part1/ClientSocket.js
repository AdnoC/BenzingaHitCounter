<script src='/socket.io/socket.io.js' />
<script type='text/javascript'>
var socket = io.connect('http://localhost:3001');
socket.on('data', function(data) {
    console.log(data);
  });
</script>
