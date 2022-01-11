# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /usr/src/app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install app dependencies
COPY package*.json ./

# RUN mkdir /app/node_modules
# RUN chown node:node /app/node_modules

RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent

# add app
COPY . .
# RUN chown -R node /app/node_modules
