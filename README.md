# log-streaming
View file logs on web interface


# How to run the project
- Install node version manager (nvm)
- Then Run following commands:
1. > nvm install
2. > nvm use
3. > npm install
4. > npm start

- Copy `monitorList.template.json` to `monitorList.json` or any other name and exprot the path of that file under `LOGVIEWER_PATH` variable.
- To monitor the file changes, add their paths in `monitorList.json` file.
- Open up the browser at `http://localhost:3000` to check the UI.

