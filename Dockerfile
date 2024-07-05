FROM node

WORKDIR /bot

COPY package*.json /bot/

RUN npm install

COPY . /bot/

RUN npm run build
RUN rm -rf /bot/src/

CMD ["npm", "run", "start"]