FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./* /usr/src/app/
RUN npm install --no-optional

# Bundle app source
COPY . /usr/src/app

EXPOSE 8888 8889
CMD [ "npm", "run", "serve" ]
