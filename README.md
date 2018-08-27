### Homework assignment 2 - NODE JS MASTERCLASS

### Run app with command: node index.js

### 1. Create a user

Create a user with a POST req to localhost:3000/users with this body:

````{
	"email": "youremail@gmail.com",
	"password": "123",
	"shopping_list": ['chicken', 'vegetables'],
	"firstName": "Stefan",
	"lastName": "Löfven",
	"adress": "Lövensgatan 9"
}```
````

### 2. Create a token for the user

Create a token for the user by doing a POST request to localhost:3000/tokens with email and password as body

Example: {
"email": "youremail@gmail.com",
"password": "123"
}

### 3. See all menu items

See all menu items by doing a GET request to localhost:3000/menu_items?email=youremail@gmail.com
and specify token in header

Example of header parameter: token 2h2szrezuxd5p1mxnmk0

### 4. Update a user (For example if you would like to add more menu items or change password)

Add menu items by doing a PUT request to localhost:3000/users with valid token in header.

To add menu items simply: {"shopping_list": ['chicken', 'vegetables', 'beef']}

### 5. Logout

To logout do a DELETE request to localhost:3000/tokens?id=tokenId

### 6. Delete a user

To delete a user to a DELETE request to localhost:3000/users?id=tokenId
Also add valid token in header

### 7. Get your own user information

To get your user info do a GET request to localhost:3000/users?email=youremail@gmail.com
Also add valid token in header

### 8. Create an order

To create an order do a POST request to localhost:3000/orders with valid token in header and body with your email
{
"email": "youremail@gmail.com"
}
