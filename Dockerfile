# Use the official Node.js image as a base image
FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080

ARG DB_USER
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ENV DB_USER = ${DB_USER}
ENV DB_HOST = ${DB_HOST}
ENV DB_NAME = ${DB_NAME}
ENV DB_PASSWORD = ${DB_PASSWORD}
# Command to run your application
CMD ["node", "app/app.js"]
