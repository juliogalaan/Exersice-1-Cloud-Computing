# Paso 1: Usar una imagen base ligera de Node.js
FROM node:16-alpine

# Paso 2: Establecer el directorio de trabajo dentro del contenedor
WORKDIR /home/node

# Paso 3: Copiar package.json y package-lock.json primero para aprovechar cache de Docker
COPY --chown=node:node package.json package-lock.json ./

# Paso 4: Instalar dependencias
RUN npm install

# Paso 5: Copiar el resto de archivos (incluyendo src) con permisos correctos
COPY --chown=node:node . .

# Paso 6: Cambiar a usuario 'node' por seguridad (debe hacerse después de copiar archivos para evitar problemas de permisos)
USER node

# Paso 7: Comando para iniciar la app con delay para esperar MongoDB
CMD ["sh", "-c", "sleep 10 && node src/index.js"]
