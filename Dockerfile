# Paso 1: Usar una imagen base ligera de Node.js
FROM node:16-alpine

# Paso 2: Cambiar al usuario 'node' por razones de seguridad
USER node

# Paso 3: Establecer el directorio de trabajo dentro del contenedor
WORKDIR /home/node

# Paso 4: Copiar package.json y package-lock.json y dar permisos al usuario node
COPY --chown=node:node ./package.json ./package.json
COPY --chown=node:node ./package-lock.json ./package-lock.json

# Paso 5: Ejecutar npm install para instalar las dependencias

RUN npm install

# Paso 6: Copiar el resto de los archivos del proyecto al contenedor
COPY --chown=node:node . .

# Paso 7: Especificar el comando que se ejecutará al iniciar el contenedor
CMD ["node", "src/index.js"]
