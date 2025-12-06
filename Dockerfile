FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Puerto interno
EXPOSE 3800

# El socket de docker se montará en deploy
CMD ["npm", "start"]
