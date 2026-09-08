# ---- build ------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# O CRA embute as REACT_APP_* no bundle em tempo de build, então a URL da API
# precisa entrar aqui e não no runtime. Sem valor, o src/settings.ts cai no
# default /api — que é exatamente o que a topologia com proxy reverso usa.
ARG REACT_APP_API_URL

# Manifests em camada própria: o `npm ci` só roda de novo quando as
# dependências mudam. O package-lock.json é lockfileVersion 3 (npm 7+).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ----------------------------------------------------------------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
