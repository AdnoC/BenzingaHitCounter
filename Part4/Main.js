/**
 * This file does nothing but run other javascript files. It merely allows me
 * to run everything from a single command.
 */
require('./CounterServer.js')
//require('./ServerSocket.js').run(); //As this was already finished, no need
//to run it.
require('./soc.js');
require('./IndividualServer.js');

