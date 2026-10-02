HI TIRIAN, here is the info on how to run this (though I am sure you prob already know how :>)

BEFORE RUNNING:
Make sure you have the following installed
  -Node.js
  -npm
  -a WEB browser

INSTALLATION:
  1. Clone the REPO (git clone https://github.com/mtm574/LoanScope.git)
  2. Open the project folder (cd LoanScope)
  3. Install project dependencies (npm install)

RUNNING LOANSCOPE:
LoanScope requires both the front and backend to be running in order for it to function :>
  1. Start the backend
        -open terminal and run "node server/server.js" (Should start at https://localhost:3001 with a message in terminal saying it is running)
  2. Start the frontend
        -With a second terminal, run "npm run dev" OR "npm.cmd run dev" if powershell gives you an issue.
        -Vite will provide a URL (Something like https://localhost:5173), you can paste that in the browser

*If everything functioned correctly, you should be able to see the webpage in yoru browser. 

POSSIBLE ERROR:
  -If you are given the message "Could nawt connect to backend <_<"
      -Go back to the first terminal, where you ran "node server/server.js" and ensure that it still shows "LoanScope is running on http://localhost:3001"
       if it does not, enter "node server/server.js" again. Do not exit/quit the process.
