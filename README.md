# log-streaming
View real-time file logs on web interface using SSE.

# Usage as command line tool
 - Install using `npm install realtime-logger -g`
 - Run `rt_log` from terminal
 - Access the UI at `localhost:3000`


# How to run the project
- Install node version manager (nvm)
- Then Run following commands:
1. > nvm install
2. > nvm use
3. > npm install
4. > npm start

- Copy `monitorList.template.json` to `monitorList.json` or any other name and export the path of that file under `LOGVIEWER_PATH` variable.
- To monitor the file changes, add their paths in `monitorList.json` file.
- Open up the browser at `http://localhost:3000` to check the UI.
- To change the port export `LOGVIEWER_PORT` env with proper port number.
