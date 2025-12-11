# dev-laoz-api-manager

API orquestadora para gestionar contenedores Docker y repositorios locales del ecosistema WebTools.

## Características
- Listado y gestión de contenedores vía Docker socket
- Operaciones básicas: listar, iniciar, detener contenedores
- Acceso a repos locales para tareas de mantenimiento

## Requisitos
- Node.js 18+
- Acceso a Docker (`/var/run/docker.sock` montado en contenedor)

## Configuración
Variables de entorno recomendadas:
- `PORT`: Puerto del servicio (por defecto 3800)
- `REPO_BASE_PATH`: Ruta donde están los repos locales (p.ej. `/app/repos`)

## Ejecutar en desarrollo
```bash
npm install
npm run dev
```

## Endpoints
- `GET /health`: estado del servicio
- `GET /manager/containers`: lista contenedores

## Seguridad
Este servicio puede tener alto nivel de privilegios al acceder al Docker daemon. Úsalo solo en entornos controlados.

## Docker
Se integra vía `docker-compose.yml` del proyecto `dev-laoz-server-dev-web-tools` con el socket de Docker montado.

## Licencia
MIT
