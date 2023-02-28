# Use an official Node.js runtime as a parent image
FROM node:17

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json /app

# Install the necessary dependencies
RUN npm install

COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the app.js file when the container launches
CMD ["node", "server.js"]