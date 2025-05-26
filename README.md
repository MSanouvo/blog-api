# blog-api
A simple blog posting app to test out creating a backend api for a React frontend (project idea courtesy of The Odin Project)

The API provides functions that support GET, POST, PUT, and DELETE requests with a database that holds articles written by users as well as comment and likes for those articles.

Frontend for API can be found <a href='https://github.com/MSanouvo/blog-frontend'>here</a> 

Current Issues and Improvements
- Refine the like functions to not break the API server when a user likes a piece of content they already liked
- Add additional storage service to hold images for articles/comments
- polish the logic for updating like counts to properly display it on the frontend
- look into logic for checking whether user liked specific articles already

