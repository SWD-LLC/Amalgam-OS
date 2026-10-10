FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --registry=https://registry.npmjs.org/ --no-audit --no-fund
COPY . .
RUN npm run typecheck && npm run test:backend && npm run build

FROM node:22-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend/server.cjs ./backend/server.cjs
RUN mkdir -p /app/backend/data && chown -R node:node /app/backend
USER node
EXPOSE 8787
CMD ["node", "backend/server.cjs"]
