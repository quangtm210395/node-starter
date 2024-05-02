FROM node:20.12.2-bookworm as builder

# Create work directory
WORKDIR /app

# Install runtime dependencies
# RUN npm install yarn -g
COPY package.json /app
COPY yarn.lock /app
RUN yarn install

FROM node:20.12.2-bookworm
# Create work directory
WORKDIR /app
# Copy app source to work directory
COPY --from=builder /app/ /app/
COPY . /app
# Build and run the app
RUN yarn build

# ENV NODE_ENV=production
CMD node dist/index
