FROM node:20-alpine AS build
ARG VITE_BASE_URL
ARG VITE_KOSIS_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
# RUN npm install --save-dev @types/sockjs-client @types/react-dom
COPY . .
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_KOSIS_KEY=$VITE_KOSIS_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
RUN npm run build -- --base=$VITE_BASE_URL
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]