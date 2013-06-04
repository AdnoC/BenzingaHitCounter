var config = {}; 

config.mongooseUrl = 'mongodb://localhost/benzinga';
config.redisHost   = '127.0.0.1';
config.residPort   = 6389;

config.sessionKeepAliveSeconds = 5;
config.viewCountSaveSeconds = 10;
//How many view counts stored in Redis before it removes old ones.
config.redisCacheSize = 10000;

//Details found here http://tools.ietf.org/html/rfc6454#section-7.1
config.crossOriginAllowed = ['benzinga.com', 'marketfy.com', 'livenakedarmadillos.com', 'http://localhost:3001'];

//The following  change whether bzcounter/CounterServer loads additional scripts
//that display different stats on specific pages. As they do add additional redis
//connections and create servers which use up resources, it is recommended to leave them
//off. A restart is needed every time one is changed before it is applied.
config.DISPLAY_PAGES_BEING_VIEWED = true;
config.DISPLAY_RECENT_VIEW_COUNTS = true;

//Turns on and off console.log
config.logDebug = false;

config.cookieSecret = 'Secrets are secret';

/*
 * NOTE:
 * As socket.io operates on the same port, when changing the port, 
 * change it in page_view.js as well.
 */
config.expressPort = 8082;
config.expressKey  = 'Snk423lLLl234nlsdfh24lj7s12AB2kl4j2';

module.exports = config;
