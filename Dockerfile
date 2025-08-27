FROM node

WORKDIR /app

RUN apt-get update && apt-get install -y \
    fish \
    protobuf-compiler 

RUN chsh -s $(which fish)

RUN npm i -g typescript

COPY . .
