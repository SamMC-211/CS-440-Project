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
    - SQLite(3)
- Additional Packages/Libraries
    - React Router
    - Bootstrap
    - Material UI
        - Fontsource roboto
        - MUI Icons-material
        - MUI X-Data-Grid
    - bcrypt Hashing
- Miscellaneous
    - Globals
        - Responsive meta tag
        - CssBaseline
    - Express-session (middleware)

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

## MUI Learning
- Figure out gutter bottom attribute\<Typography variant='h5' component='div' textAlign='center' gutterBottom>
- Figure out MUI color theme color='primary'

## Misc. To-Do
- Change Site icon
- Input checking on registration
- Create schema for whole project
- Decide pages to be split up
- Decide how to seperate users, service prov., admin in database


## Demo 1 To-Do
- Registration
    - Must be able to register as user or service provider
    - "role" columns should be either "user", "provider", "admin"
    - Include additional "service provider name" field for service provider registration
- Database 
    - Service provider users need a "service_provider_name" field
- Creating Appointments
    - Overlapping time slots are ok as long as the room number is different and the provider_id is different
    - When an appointment is created it MUST have a  
        - appointment_id
        - provider_id 
        - room_id
        - start/end time
    - Display current user's created appointments
    - Add provider_id as foreign key in addition to user_id
    - provider_id should not be null 
- Booking appointments
    - Check that appointment isn't status: "booked"
    - Check that user doesn't already have appointment booked during time slot
    - Display to users whether or not appointments have already been booked
    - Display current user's booked appointments (Use the user's cookies/session on server can be used to tell which user is logged in)
- Service provider Home Page
    - Menu to create appointment
    - Display their appointment along with
        - Status
        - Room number/id
        - Start/End time
- User Home Page
    - Display/menu to select appointments to book
    - display booked appointments to users
- Misc. 
    - Add logout button to user pages (Will destroy a users open session, allowing us to log in as other users again)

## Demo 1 To-Do
- Remove infinite loading from create appointment
- Error check time and date
- display booked and created appointments