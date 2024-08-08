# BookStudioApp
HOW TO SET UP AND RUN THE APPLICATION IN YOUR LOCAL MACHINE (LAPTOP/DESKTOP):

1. Install postgresql and pgAdmin.
Setup pgAdmin and create a new database
2. Clone room booking repo from GitHub to your local device(laptop or desktop). In which there
are two folder frontend and backend
[if you don't have code this step require]
3. Open room booking folder with vs code. In which there are two folder frontend and backend
4. Create .env file in backend folder and add environment variables in this file
5. Open vs code terminal and type command cd ./backend/
Now type command node server
It will start backend server
(for eg. http://localhost:5000)
6. Open login.html, signup.html, app.js and admin.js and change base url with your backend
localhost url
(for eg. http://localhost:5000)
7. Open index.html file from frontend folder in same vs code. Now if you have live server vs
code extension installed then click on "go live".
If this live server not installed then install it first. It will create a localhost server for frontend



API DOCUMENTATIONS: 

Users
1. Signup user
POST to "http://localhost:5000/users/signup"
Requested data in body
Name Value
username Any string value in lowercase
password Any string or numeric value
Responded Data
● User signup data is added in json format.
2. Login user
POST to "http://localhost:5000/users/login"
Requested data in body
Name Value
username Any string value in lowercase
password Any string or numeric value
Responded Data
● User login data is added in json format.
3. List all user
GET to "http://localhost:5000/users"
Responded Data
● It will show all users details in json format.
Bookings
1. List all bookings of login user
GET to "http://localhost:5000/bookings/id"
Requested data in url params
Name Value
id Login user’s id
Responded Data
● It will show all bookings of login user in json format.
2. Add booking
POST to "http://localhost:5000/bookings"
Requested data in body
Name Value
userId Login user’s id
endTime Future time in ISO format
startTime Future time in ISO format
room room name in string format
Responded Data
● Added booking data will show in json format.
3.Delete bookings of login user
DELETE to "http://localhost:5000/bookings/id"
Requested data in url params
Name Value
id Booking’s id
Responded Data
● It will delete a particular booking from the database and give a response in json format.
4. Edit booking
PUT to "http://localhost:5000/bookings/id"
Requested data in url params
Name Value
id Booking’s id
Requested data in body
Name Value
endTime Future time in ISO format
startTime Future time in ISO format
room room name in string format
Responded Data
● Updated booking data will show in json format.
Shared Bookings
1. List all shared bookings of login user
GET to "http://localhost:5000/shared-bookings/id"
Requested data in url params
Name Value
id Login user’s id
Responded Data
● It will show all shared bookings of login user in json format.
4. Booking share with other user
POST to "http://localhost:5000/bookings/id/share"
Requested data in url params
Name Value
id Booking’s id
Requested data in body
Name Value
receiverUserId Receiver User’s Id
senderUserId Login ussr’s id
Responded Data
● Shared booking data will show in json format.
4. Delete Booking share with other user
POST to "http://localhost:5000/shared-bookings/booking_id/receiver_user_id"
Requested data in url params
Name Value
booking_id Booking’s id
receiver_user_id Receiver User’s Id
Responded Data
● It will delete a particular booking from the database and give a response in json format.
Admin
1. List all user‘s booking list
POST to "http://localhost:5000/users/admin"
Requested data in body
Name Value
role admin
Responded Data
● It will show all user’s booking lists in json format.

FOLDER STUCTURE: (view in code mode)

PWABOOKSTUDIOAPP
                -backend
                        -config
                            -db.js
                        - models
                            - bookings.js
                            - sharedBookings.js
                            - user.js
                        - routes
                            - bookings.js
                            - sharedBookings.js
                            - users.js
                        - node modules
                    - .env
                    - middleware.js
                    - server.js
                    - README.md
                    - package-lock.json
                    - package.json
                - frontend
                    - css
                       - admin.css
                       - app.css
                       - common.css
                       - login.css
                       - mediaQuery.css
                    - js
                       - admin.js
                       - app.js
                       - lang_module.js
                    - admin.html
                    - index.html
                    - login.html
                    - signup.html  






    passwords will be securely hashed*
    role-based accounts*
    authentication sheme*
    offline support*
    live-hosted*
    Html5 responsive*
    Json*
    Database Postgre*
