# FRONTEND SERVER

Este proyecto requiere las siguientes caracteristas:

|   APP   | VERSION |
|:-------:|:-------:|
| NODE JS | 20.12.1 |
| ANGULAR | 17.3.4  |

Para correr este proyecto siga las siguientes instrucciones

1. Ejecutar el comando para descargar las dependecias del proyecto

```bash
npm ci
```

1. Configurar el enviroment que se encuentra en el path src/enviroment

```js
export const environment = {
  production: true,
  baseUrl: {
    api: 'http://localhost:3005/api', // Colocar la ruta del backend server
    socket: 'http://localhost:2005', // Colocar la ruta del socket server
    frontend: 'http://localhost:4200', // Colocar la ruta con la cual correra el frontend
  },
  url: {
    socket: '' // En caso de configurar un subdominio para el socket
  },
  siteKey: '6LfVg0wpAAAAAC6fNGwNCQ6ebgwxk5ruyRtejnh8', // Colocar la clave publica del recaptcha
  prefix: 'sisat' // Prefijo para el localstorage
};
```

1. Ejecutar el comando para correr la applicacion entorno local

```json
ng serve --port PUERTO
```

## PRODUCCION

1. Configurar en el package json

```json
"build:prod": "ng build --base-href /server/ && node prod.js && gzipper c --brotli ./dist/frontend-sisat-server/browser && gzipper c --gzip ./dist/frontend-sisat-server/browser",
```

1. Ejecutar el siguiente comando

```cmd
npm run build:prod
```
