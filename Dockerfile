#FROM node:18-alpine
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#RUN npm install bcrypt --build-from-source
##COPY . .
##EXPOSE 3030
#CMD ["npm", "run", "start:dev"]

FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3030
CMD ["node", "dist/main"]