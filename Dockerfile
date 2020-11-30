FROM node:12.19.0 AS nodejs

WORKDIR /opt/react

COPY ./src ./src
COPY ./public ./public
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

ENV PATH="./node_modules/.bin:$PATH"

RUN npm run build

FROM nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=nodejs /opt/react/build /usr/share/nginx/html
