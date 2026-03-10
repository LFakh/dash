FROM node:25-alpine AS builder

WORKDIR /app

# Install your dependencies
COPY package*.json ./
RUN npm install

# Download CWE XML
ADD https://cwe.mitre.org/data/xml/cwec_latest.xml.zip .

# Install unzip tool
RUN apk add --no-cache unzip

# Unzip the downloaded file
RUN unzip cwec_latest.xml.zip && rm cwec_latest.xml.zip

# Copy the XML-to-JSON script
COPY scripts/cwe-xml-to-json.mjs .

# Convert XML to JSON
RUN node cwe-xml-to-json.mjs

# Copy the rest of your app and build
COPY . .

RUN npm run build

FROM node:25-alpine as production

WORKDIR /app

# Copy node_modules and build from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/static/cwe-mitigations.json ./static/cwe-mitigations.json

RUN mkdir -p /var/log/dash && chown node:node /var/log/dash

USER node
EXPOSE 3000
CMD ["node", "build/index.js"]
