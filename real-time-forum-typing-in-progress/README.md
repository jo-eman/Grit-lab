# Single Page Application

This is a single page application built using RESTful APIs and Gorilla WebSocket to enable real-time communication. The application allows users to register, login, create posts and comments, and direct message each other.

## Installation

To install the application, follow these steps:

1. Clone the repository to your local machine.
2. Install Go on your system.
3. Install the required dependencies using the following command:

go get github.com/gorilla/websocket

4. Start the server using the following command:

go run main.go

The server will start on http://localhost:8000.

## Usage

The following APIs are available in the application:

- `/api/users/register` - Allows users to register.
- `/api/users/login` - Allows users to login.
- `/api/users/list` - Returns a list of registered users.
- `/api/createpost` - Allows users to create a post.
- `/api/posts` - Returns a list of posts.
- `/api/createcomment` - Allows users to create a comment on a post.
- `/api/messages` - Returns a list of messages.
- `/` - Displays the home page.
- `/ws` - Enables WebSocket communication.

## Contributing

If you'd like to contribute to this project, please fork the repository and create a pull request. We welcome any contributions, including bug fixes, new features, and documentation improvements.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Creators

Joman & Vilburg @grit:lab
2023
