FROM node:16

WORKDIR /usr/src/app

COPY . .

CMD DEBUG=playground:* npm run dev