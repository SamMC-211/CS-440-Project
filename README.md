# CS-440-Project

## Current Tech Stack

- Javascript Runtime Environment
    - Node.JS
    - Comes with npm (Node Package Manager)
- Frontend Language
    - TypeScript (Version of JavaScript that adds types)
- Package Manager
    - NPM
- Code Bundler / Development Server
    - Vite
- Frontend Framework
    - React
- Backend Framework
    - Express.js
- Database
    - MySQL
- Additional Packages/Libraries
    - React Router
    - Bootstrap

## Steps for getting started on your machine

1. Clone the repository to your computer
2. Install Node.js for your computer https://nodejs.org/en/download I would reccomend downloading with the windows installer instead of using Docker, otherwise you will need to have a docker container running to use node commands. Docker is cool but I wouldn't bother messing with it right now at least.
3. Navigate into the **"frontend"** directory within a command prompt and run this command to install the dependencies for the project "npm install" all of the dependencies that are going to be installed are listed in the **"package.json"** file within the **"frontend"** directory
4. While still within the **"frontend"** directory if you run "npm run dev" this will locally host the react app (all the code within the "src" directory), if you click the link you will be able to open it within the browser. This will also live update so if you make any changes to the react app they will immediately be reflected in the browser. 
5. To initialize the backend navigate into the **"backend"** folder and run "npm install" to install those dependencies.
6. From here you should be good to go. If additional packages/libraries are installed over the course of the project and changes to the "package.json" file are pushed to main, you're going to make sure you run "npm install" in the respective frontend or backend directories to download any new packages.

## Steps for starting off this project (If you want to recreate what I did)

1. Installed Node.js version v24.7.0 (latest at time of writing this) instructions here https://nodejs.org/en/download
2. In the root directory of your project you're probably going to want to create a "frontend" and "backend" folder to keep things neat
3. Within the "frontend" folder install Vite Build tool using "npm create vite@latest" insturctions here https://vite.dev/guide/

**Selected Prompts for vite install**
- Project name: CS-440-Project
- Package name: cs-440-project
- Framework: React
- Variation: TypeScript

4. Following the instructions at the end of the Vite install run "npm install" and "npm run dev" (From within the project directory)
5. Similarly to creating the frontend you're going to navigate into the "backend" directory and run "npm install express" to install Express.js 