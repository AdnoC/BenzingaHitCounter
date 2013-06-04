var socket = io.connect('http://localhost:3004');
socket.on('connect', function(){console.log('Connected');});
var ids = [];
var nextID = 0;
var docs = [];
var currentOrder = 5;
var changed = false;
//0 is natural(order recieved), 1 is site, 2 is hash, 3 is nid, 4 is day, 5 is count, - is increasing, + is decreasing


socket.on('data', recieveUpdate);
socket.on('update', recieveUpdate);
//Get either a new entry, or an update for one.
function recieveUpdate(data) {
  console.log('update', data);
  var index = indexOf(docs, data);
  console.log('index ' + index);
  changed = true;
  if(index > -1){ //If already knows of the input and the data sent is just an update, not a new occurence
    console.log('Update at ' + index);
    docs[index]['count'] += data['count'];
    updateCount(index);
  } else {  //If new
    console.log('New');
    data['_id'] = nextID;
    ids.push(nextID);
    docs.push(data);
    console.log('docs' + docs);
    createNewEntry(ids.length-1);
    nextID++;
  }
}

socket.on('delete', function(data) {
  console.log('delete', data);
  var index = indexOf(docs, data);
  deleteEntry(index);
  docs.splice(index, 1);
  ids.splice(index, 1);
});

function indexOf(arr, obj) {
  for(var i = 0; i < arr.length; i++) {
    var ea = arr[i];
    if(ea['url'] == obj['url']){
      return i;
    }
  }
  return -1;
}

setInterval(function() {
  if(changed && Math.abs(currentOrder) == 5) {
    changeOrder(0);
    changed = false;
  }
}, 1000*3);



//Returns an array of docs in order specified.
function getOrder() {
  if(currentOrder == 0) {
    return [];
  }
  var index = Math.abs(currentOrder) - 1;
  var temp = docs.slice(0);
  temp = quicksort(temp, index);
  if(currentOrder < 0) {
    return temp.reverse();
  } else {
    return temp;
  }
}


function quicksort(arr, ind) {
  if(arr.length <= 1) {
    return arr;
  }
  var keys = ['url', 'count'];
  var pivot = Math.floor(Math.random() * arr.length);
  var low = [], high = [];
  for(var i = 0; i < arr.length; i++) {
    if(i == pivot) {
      continue;
    }
    if(arr[i][keys[ind]] <= arr[pivot][keys[ind]]) {
      low.push(arr[i]);
    } else {
      high.push(arr[i]);
    }
  }
  var l = quicksort(low, ind);
  var h = quicksort(high, ind);
  l.push(arr[pivot]);
  l.push.apply(l, h);
  return l;
}

//The following code provides an abstraction of the method of displaying the
//data
var MOUNT_POINT_ID = 'hot_pages'; //Where 
var MOUNT_POINT = $('#'+MOUNT_POINT_ID);
var table;
function createDisplay(){
  MOUNT_POINT.append('<table><tbody></tbody></table>');
  table = MOUNT_POINT.children('table').children('tbody');
}

function updateCount(index) {
  console.log('ind ' + index);
  console.log('id+docs ' + ids[index] + ' ' + docs[index]);
  console.log('doc-count ' + docs[index]['count']);
  table.children('#'+ids[index]).children(':last-child').html(docs[index]['count']);
}
function createNewEntry(index) {
  var tabl = table.append(entryToHTML(docs[index]));
  table.children("tr").last().attr('id', ids[index]);
}
function deleteEntry(index){
  table.children('#'+ids[index]).remove();
}

function entryToHTML(ob) {
  var ret = [];
  ret.push('<tr><td><a href="');
  ret.push(ob['url']);
  ret.push('">');
  ret.push(ob['url']);
  ret.push('</a></td><td>');
  ret.push(ob['count']);
  ret.push('</td></tr>');
  return ret.join("");
}

function changeOrder(no) {
  console.log('Changing Order');
  if(no == currentOrder) {
    currentOrder = -no;
  } else if(no != 0){
    currentOrder = no;
  }
  var o = getOrder();
  console.log('------------------------------------');
  console.log(o[0]);
  for(var i = 1; i < o.length; i++) {
    console.log(o[i]);
    table.children('tr:nth-child('+(1+i)+')').after(table.children("#"+o[i]['_id']));
  }
}
createDisplay();
