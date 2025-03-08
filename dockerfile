FROM redis 

EXPOSE 6379

# Stage 1: Setup Node.js Application

FROM node:slim 

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start Redis in the background, then run the Node.js app

CMD [ "npm" ,"run" ,"start:prod" ]