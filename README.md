# metar-app

This is the codebase for Metar application
## Getting started

In order to work with the code, you need to perform a few steps:
- Pull the latest code from the repo
- Install latest versions for Node and NPM.

Go to the root of the application and execute below command to install all the dependencies for the project.

    npm install

The project will require to connect to a redis server.
If you do not have a redis server then you can install it using docker with the beolw command which will start a redis container with the default host and port.

    docker run --name redis-container -d redis

Update the configuration in the file below for REDIS_HOST and REDIS_PORT and skip if redis is running on the same host.

config/index.js

    module.exports = {
        PORT: 3000,
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: 6379,
        METAR_INFO_URL: "https://tgftp.nws.noaa.gov/data/observations/metar/stations/"
    };

Start the application using the command which will start an application server and listen on port 3000. You can configure the port in the previous step

    npm start

Hit the URL in browser for http://localhost:3000/ and you will see a message 
Metar API Services

Check with the below curl request or on the browser.

    curl --location --request GET 'http://localhost:3000/metar/info?scode=ksgs&nocache=1'
    
Here the nocache argument is optional and if set to 1 then the live data is pulled from the metar server stations, else for concurrent request for the same station the data is returned from the local redis cache for 5 minutes
