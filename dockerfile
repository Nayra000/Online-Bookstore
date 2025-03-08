# Stage 1: Setup Node.js Application

FROM node:slim 

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start Redis in the background, then run the Node.js app
# CMD ["sh", "-c", "redis-server --daemonize yes && npm run start:prod"]

CMD [ "npm" ,"run" ,"start:prod" ]