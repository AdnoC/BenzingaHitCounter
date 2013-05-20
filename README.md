BenzingaHitCounter
==================
Part 1 contains code to watch for GET or POST requests and stores the data about them in a mongo database.
Part 2 contains code to pull information from the database and sends it to a webpage to be displayed.
Part 3 contains code from both part 1 and 2. It also handles single-page
counts.
Files marked OLD do not use Redis, while those without the marking usually do.

Part 1 & 2:
    Main Files:
    CounterServer.js watches for the requests and stores them into databases.
    ServerSocket.js establishes the connection to the browser and sends it real-time information on hit counts.
    total_view.html connects to ServerSocket and loads the information into the page.

    Utility Files:
    testing.js simulates webpage hits to 9 different url, 3 different websites. It takes command line arguements to tell it how many to send, the first tells it to what power of 10 while the second tells it what to multiply that number by((10^$1)*$2).
    testing2.js simulates a large number of hits on a large number of websites, one hit per site.

    Msc:
    The variable REDIS_CACHE_SIZE in CounterServer.js controls how many sites are stored in redis before older ones need to be removed.

Part 3:
    IndividualServer.js handles marking pages that have their count viewed in
    memory. It also sends page counts to pages that have their count viewed.
    page_view.js (I'm not sure why I changed my naming conventions) is
    a javascript file to be loaded at the end of a html file. It posts to the
    counter server. If verified, it also displays real-time page view count.
    Main.js runs all neccesary files.
    package.json was added when experimenting with Heroku, but is nice in that
    it allows for easy installation of required node.js packages.
