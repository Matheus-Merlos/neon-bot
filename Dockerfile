FROM node

WORKDIR /bot

COPY package*.json /bot/

RUN npm install

COPY . /bot/

CMD ["npm", "run", "start"]