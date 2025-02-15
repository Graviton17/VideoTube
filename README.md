npm init
npm i -D nodemon prettier
.gitignore (https://www.toptal.com/developers/gitignore)
.prettierrc (https://michelelarson.com/prettier-config/)
.prettierignore
type: modules and script

Folder src
controllers db middlewares models routes utils
app.js index.js constants.js .env .env.sample
readme.md

Folder db
index.js 

Folder models from ER Diagram 
Example:
comment.models.js like.models.js playlist.models.js subscription.models.js tweet.models.js user.models.js video.models.js

npm i express mongoose 

npm i -D winston morgan 
Logger setup (https://docs.chaicode.com/advance-node-logger/)

PORT
npm i dotenv

npm i cors (for limit of acess)

then database connection throws ORM

add some standard response format of API and other :) (GOOD PRACTICE)

add a health check API through the controllers and routes

add models through the schema of the ER Diagram 

npm i mongoose-aggregate-paginate-v2

Password encryption 
npm i bcrypt
add a method to the schema of add encryption and compare

Token
npm i jwt-decode
add methods to the schema of access and refresh token

Express can't handle cookies directly
npm i cookie-parser

Also, Express can't handle local storage directly
npm i multer
and middleware folder make a function for storage mention path to save in local storage

For cloud Storage Cloudinary
npm i Cloudinary
in the utility folder add a file for config Cloudinary and uploadOnCloudinary function

User Registration
controller and route for API of register 
and route upload files locally in public/temp folder
controller uploads files to Cloudniary and makes an account on db

User Generate Access and Refresh token function

User login function with access and refresh token new creation

User refreshAccessToken for a refresh access token with the creation of a new token and set refresh token in the database and both in user cookies.

User logout uses middleware for user._id and makes database refresh undefined and clear cookies

Auth middleware for adding user._id to user

user Watch History and user channel Profile using aggregation pipeline

Implement the rest of controllers and route 

Create proper postman
