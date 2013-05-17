BenzingaHitCounter
==================
Part 1 contains code to watch for GET or POST requests and stores the data about them in a mongo database.
Part 2 contains code to pull information from the database and sends it to a webpage to be displayed.
Files marked OLD do not use Redis, while those without the marking usually do.


Main Files:
CounterServer.js watches for the requests and stores them into databases.
ServerSocket.js establishes the connection to the browser and sends it real-time information on hit counts.
total_view.html connects to ServerSocket and loads the information into the page.

Utility Files:
testing.js simulates webpage hits to 9 different url, 3 different websites. It takes command line arguements to tell it how many to send, the first tells it to what power of 10 while the second tells it what to multiply that number by((10^$1)*$2).
testing2.js simulates a large number of hits on a large number of websites, one hit per site.

Msc:
The variable REDIS_CACHE_SIZE in CounterServer.js controls how many sites are stored in redis before older ones need to be removed.
