## How to Run the Server

### Prerequisites

To run this server, you need to have the following installed on your machine:

- [Node.js](https://nodejs.org/): Ensure you have Node.js installed. You can download it from the official website.
- [MongoDB](https://www.mongodb.com/): Make sure MongoDB is installed and running on your local machine or a remote server.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the server dependencies using pnpm:
   ```bash
   pnpm install
   ```

### Running the Server

1. Start the MongoDB server if it's not already running. You can do this by executing:
   ```bash
   mongod
   ```

2. Start the server in development mode:
   ```bash
   pnpm run dev
   ```

This will start the server on port 5050. You should see `Server running on port 5050` in the console if everything is set up correctly.

### Additional Configuration

- Ensure that your MongoDB server is accessible at the URL specified in `mongoose.connect()` inside the `server.js` file. You may need to adjust this to fit your MongoDB configuration.

