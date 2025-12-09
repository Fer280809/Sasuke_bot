# 🖼️ Guía del Logo de Sasuke Bot

## 📍 Ubicación del Logo

El logo del bot **SIEMPRE** debe estar en:

```
Sasuke_bot/lib/menu.jpg
```

## ⚡ ¿Por qué es Importante?

El sistema está configurado para usar **automáticamente** la imagen ubicada en `lib/menu.jpg` en:

- ✅ Menús de ayuda
- ✅ Mensajes de bienvenida
- ✅ Respuestas de comandos
- ✅ Catálogos
- ✅ Y más...

## 🔧 Cómo Funciona

En `settings.js` encontrarás:

```javascript
// ⚡ LOGO CENTRALIZADO - Siempre usa lib/menu.jpg ⚡
global.logo = fs.readFileSync('./lib/menu.jpg')
global.banner = "https://files.catbox.moe/lajq7h.jpg"
global.icono = "https://files.catbox.moe/lajq7h.jpg"
global.catalogo = global.logo
```

Esto significa que:
- `global.logo` → Lee directamente `lib/menu.jpg`
- `global.catalogo` → Usa el mismo logo
- Los plugins acceden al logo mediante `global.logo`

## 📝 Cómo Cambiar el Logo

### Paso 1: Prepara tu Imagen

**Recomendaciones:**
- **Formato:** JPG, JPEG o PNG
- **Tamaño:** 500x500px hasta 1024x1024px
- **Peso:** Menos de 1MB (para mejor rendimiento)
- **Tema:** Sasuke, Sharingan, o temática Uchiha

### Paso 2: Renombra tu Imagen

Renombra tu imagen exactamente como:
```
menu.jpg
```

### Paso 3: Colócala en la Carpeta lib/

**En Termux:**
```bash
cd ~/Sasuke_bot/lib
# Coloca tu imagen aquí usando cualquier método:
# - Descargar desde URL
# - Transferir desde tu galería
# - Copiar desde otra ubicación
```

**En Windows/Linux/Mac:**
```bash
cd Sasuke_bot/lib
# Arrastra tu archivo menu.jpg aquí
```

### Paso 4: Verifica

```bash
# Verifica que el archivo existe
ls lib/menu.jpg

# Debería mostrar: lib/menu.jpg
```

## 🚀 Reinicia el Bot

Una vez que hayas cambiado el logo:

```bash
# Detén el bot (Ctrl + C)
# Inicia nuevamente
npm start
```

El bot cargará automáticamente el nuevo logo.

## 💡 Consejos para el Logo

### Para una Mejor Experiencia:

1. **Imagen Clara** - Usa una imagen nítida y reconocible
2. **Sin Texto Pequeño** - El texto pequeño puede verse borroso en WhatsApp
3. **Colores Vibrantes** - Los colores llamativos destacan mejor
4. **Tema Consistente** - Mantén el tema de Sasuke/Sharingan

### Ejemplos de Buenos Logos:

✅ Logo de Sasuke con Sharingan  
✅ Símbolo del clan Uchiha  
✅ Mangekyou Sharingan  
✅ Arte de Sasuke en estilo anime  

### Evita:

❌ Imágenes de baja calidad  
❌ Logos con mucho texto  
❌ Archivos muy pesados (más de 2MB)  
❌ Formatos no soportados (.gif, .webp)  

## 🔄 Actualizar el Logo en Vivo

Si quieres cambiar el logo sin reiniciar:

```javascript
// En cualquier plugin, puedes forzar recarga:
global.logo = fs.readFileSync('./lib/menu.jpg')
```

Pero **es mejor reiniciar el bot** para asegurar que todos los componentes usen el nuevo logo.

## 🛠️ Solución de Problemas

### Error: "ENOENT: no such file or directory, open './lib/menu.jpg'"

**Causa:** No existe el archivo `menu.jpg` en la carpeta `lib/`

**Solución:**
```bash
# Verifica la ruta
pwd  # Asegúrate de estar en Sasuke_bot/
ls lib/  # Verifica que menu.jpg esté ahí

# Si no existe, créalo:
cd lib
# Coloca tu imagen aquí con el nombre menu.jpg
```

### El Logo No se Actualiza

**Solución:**
1. Verifica que el archivo se llame **exactamente** `menu.jpg`
2. Reinicia el bot completamente
3. Borra la caché: `rm -rf node_modules/.cache`

### Logo se ve Borroso en WhatsApp

**Causa:** WhatsApp comprime las imágenes

**Solución:**
- Usa una imagen de mayor resolución (1024x1024px)
- Asegúrate de que sea JPG con buena calidad
- Evita imágenes con detalles muy pequeños

## 📂 Estructura Completa

```
Sasuke_bot/
├── lib/
│   ├── menu.jpg          ← 🔥 TU LOGO AQUÍ 🔥
│   ├── simple.js
│   ├── store.js
│   ├── print.js
│   └── catalogo.jpg      ← (Opcional, para catálogos)
├── settings.js           ← Configuración del logo
└── ...
```

## 🎨 Personalización Avanzada

Si quieres usar diferentes imágenes para diferentes contextos:

```javascript
// En settings.js puedes agregar:
global.logoMenu = fs.readFileSync('./lib/menu.jpg')
global.logoBienvenida = fs.readFileSync('./lib/welcome.jpg')
global.logoAdios = fs.readFileSync('./lib/goodbye.jpg')
```

Luego en tus plugins:
```javascript
// Usa el logo específico
await conn.sendFile(m.chat, global.logoBienvenida, 'welcome.jpg', texto, m)
```

## 📚 Recursos

**Imágenes de Sasuke/Uchiha:**
- [Pinterest - Sasuke](https://pinterest.com/search/pins/?q=sasuke%20uchiha)
- [DeviantArt - Uchiha Clan](https://www.deviantart.com/search?q=uchiha+clan)
- [Wallpaper Flare](https://www.wallpaperflare.com/search?wallpaper=sasuke)

**Herramientas para Editar:**
- [Photopea](https://www.photopea.com/) - Photoshop online gratis
- [Canva](https://www.canva.com/) - Editor sencillo
- [Remove.bg](https://remove.bg/) - Quitar fondo

## ✅ Checklist Final

Antes de iniciar tu bot, verifica:

- [ ] El archivo `menu.jpg` existe en `lib/`
- [ ] El archivo tiene el nombre correcto (menu.jpg)
- [ ] El tamaño es adecuado (500x500px - 1024x1024px)
- [ ] El formato es JPG o PNG
- [ ] El peso es menor a 1MB
- [ ] La imagen se ve bien en tu dispositivo

---

## 🔥 Listo para Activar el Sharingan 🔥

Con tu logo configurado correctamente, **Sasuke Bot** estará listo para dominar WhatsApp.

¡Disfruta de tu bot personalizado!

---

**¿Necesitas ayuda?**  
Consulta el [README.md](README.md) o únete al [Grupo de Soporte](https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9)