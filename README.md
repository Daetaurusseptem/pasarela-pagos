# Pasarela de Pagos

Aplicación ligera de ejemplo para recibir pagos en línea a través de Stripe. Permite registrar los datos del cliente y el importe a pagar. Al completar el pago, se almacena la operación en MongoDB y se genera un comprobante en PDF que puede descargarse. Incluye un pequeño panel con el historial de pagos y ahora las páginas se renderizan con **EJS** desde el backend.

Esta versión requiere **Node.js 22** o superior y usa la biblioteca `bcrypt` para el cifrado de contraseñas.


## Uso

1. Asegúrate de tener instalado **Node.js 22**.

2. Configura las variables de entorno en un archivo `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   MONGO_URI=mongodb://localhost/pagos
   JWT_SECRET=secreto

   PORT=3000
   ```
3. Instala las dependencias y compila:
   ```
   npm install
   npm run build   # o npm run dev durante desarrollo
   ```
4. Ejecuta el servidor:
   ```
   npm start
   ```
5. Regístrate y accede:
   - `http://localhost:3000/register`
   - `http://localhost:3000/login`
6. Abre `http://localhost:3000/` en tu navegador para realizar un pago una vez autenticado y consulta el historial en `http://localhost:3000/history`.

La aplicación utiliza una única clave secreta de Stripe y la cadena de conexión de Mongo definidas en el archivo `.env`. Después de compilar puedes ejecutar el servidor con:
   ```
   node dist/index.js
   ```

Este proyecto es únicamente demostrativo y no debe usarse en producción sin las medidas de seguridad adecuadas.
