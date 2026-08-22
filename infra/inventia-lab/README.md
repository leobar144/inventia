# INVENTIA Lab — guía de montaje

Plataforma de programación propia, basada en **Open Roberta Lab** (Fraunhofer
IAIS, licencia Apache 2.0).

Soporta los robots que INVENTIA usa o va a usar: **micro:bit v2**, **mBot2**,
**LEGO WeDo 2.0** y **SPIKE Prime**, además de Arduino, Calliope y otros.

---

## ⚠️ Antes que nada: el nombre

La licencia Apache 2.0 permite usar, modificar y alojar el código libremente.
**Pero la marca no está incluida.** Fraunhofer es explícito:

> Quien hace cambios al código fuente de Open Roberta no está autorizado a usar
> el término "Open Roberta Lab" ni el logo.

Esto tiene dos consecuencias prácticas:

- **Fase 1 (sin personalizar):** se puede alojar tal cual, pero hay que llamarlo
  por su nombre. No se puede presentar como "INVENTIA Lab" todavía.
- **Fase 2 (personalizado):** hay que quitar toda la marca de Fraunhofer. Ahí sí
  pasa a ser INVENTIA Lab, y es obligatorio hacerlo, no opcional.

---

## Fase 1 — Levantarlo funcionando

### 1. Contratar el servidor

Necesita un VPS con Docker. No sirve Vercel: es una aplicación Java con base de
datos y almacenamiento persistente, no una función sin estado.

| Requisito | Mínimo | Recomendado |
|---|---|---|
| RAM | 2 GB | 4 GB |
| Disco | 25 GB | 50 GB |
| Región | — | Este de EE.UU. (menor latencia a Colombia que Europa) |

Una opción concreta: **DigitalOcean, droplet de 2 GB en Nueva York**, alrededor
de US$12 al mes. Al crearlo, elegir la imagen **Docker** del Marketplace y así
viene todo instalado.

Java necesita memoria: con 1 GB el servidor se cae cuando varios niños compilan
al tiempo. No ahorrar ahí.

### 2. Apuntar el subdominio

En GoDaddy, donde está `inventiagroup.com`, crear un registro:

| Tipo | Nombre | Valor |
|---|---|---|
| A | `lab` | la IP del servidor |

Queda como `lab.inventiagroup.com`. La propagación tarda entre minutos y una
hora.

### 3. Subir estos archivos y levantar

```bash
# En el servidor
mkdir -p /opt/inventia-lab && cd /opt/inventia-lab
# copiar aquí docker-compose.yml y Caddyfile
docker compose up -d
```

Caddy pide el certificado HTTPS solo. En un par de minutos responde
`https://lab.inventiagroup.com`.

**HTTPS no es un lujo:** el navegador solo permite conectar el micro:bit por USB
en sitios seguros. Sin certificado, la plataforma no sirve para lo que se compró.

### 4. Probar con un robot real

Antes de mostrárselo a nadie:

1. Entrar a `lab.inventiagroup.com`
2. Elegir **micro:bit V2**
3. Hacer un programa mínimo (mostrar un corazón)
4. Conectar la placa por USB y enviarlo
5. **Confirmar que el corazón aparece en la placa**

Si eso funciona, la fase 1 está lista.

---

## Fase 2 — Convertirlo en INVENTIA Lab

Solo después de que la fase 1 funcione.

1. Bifurcar `github.com/OpenRoberta/openroberta-lab`
2. En `OpenRobertaWeb`: reemplazar logos, colores y todos los textos que digan
   "Open Roberta"
3. Recompilar (`npm install && npm run build`) y armar la imagen Docker propia
4. Cambiar la imagen en `docker-compose.yml` y volver a levantar

Los recursos de marca ya están en `public/marca/` del repositorio principal.

---

## Copias de seguridad

`./datos/db` contiene **todos los programas de los niños**. Si se pierde, se
pierde su trabajo — y para un niño de 9 años eso es peor que perder una clase.

Copia diaria a otro lado:

```bash
0 3 * * * tar czf /respaldos/lab-$(date +\%F).tgz /opt/inventia-lab/datos/db
```

Y bajar esos archivos fuera del servidor cada cierto tiempo: un respaldo que
vive en la misma máquina no protege de que la máquina se pierda.

---

## Actualizaciones

```bash
cd /opt/inventia-lab
docker compose pull && docker compose up -d
```

Hacerlo **fuera de horario de clase** y después de una copia de seguridad.
