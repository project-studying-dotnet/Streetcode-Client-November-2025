FROM node:19.5.0-alpine AS build
WORKDIR /app

RUN apk add --no-cache git

COPY package*.json /app/
RUN npm install
RUN npm install --global serve
COPY ./ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 3000
ENTRYPOINT ["nginx", "-g", "daemon off;"]
