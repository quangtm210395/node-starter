FROM node:16.15-alpine as builder

# Create work directory
WORKDIR /app

# Install runtime dependencies
# RUN npm install yarn -g
COPY package.json /app
COPY yarn.lock /app
RUN yarn install

FROM node:16.15-alpine
# Create work directory
WORKDIR /app
# Copy app source to work directory
COPY --from=builder /app/ /app/
COPY . /app
# Build and run the app
RUN yarn build

# ENV NODE_ENV=production
CMD node dist/index
