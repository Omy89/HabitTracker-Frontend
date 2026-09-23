# Habit Tracker — Frontend

Interfaz del proyecto **Habit Tracker** (Proyecto Final de Desarrollo Web):
una aplicación para crear hábitos, marcarlos como completados y ver el
progreso con rachas, porcentajes y gráficas.

Backend: https://github.com/Omy89/HabitTracker-Backend

## Tecnologías

- **Next.js 14** (App Router) + **TypeScript**
- **Material UI 6** (tema personalizado, iconos Material, `DateCalendar` de MUI X)
- **Recharts** para las gráficas
- **Zod** para la validación de formularios
- **dayjs** como adaptador de fechas del calendario

## Instalación

Requisitos: Node.js 20+ y el backend corriendo (por defecto en `http://localhost:3001`).

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Abre http://localhost:3000. Si no hay sesión te lleva a `/login`; si ya
iniciaste sesión, al `/dashboard`.

```bash
npm run build   # build de producción
npm run start   # servir el build
```

## Arquitectura

La app es el cliente de una arquitectura cliente-servidor: toda la
información viene de la API REST de NestJS (no hay datos simulados). La
sesión es un JWT en una cookie `httpOnly` que el navegador envía
automáticamente (`credentials: 'include'`).

```
app/
  login/, register/          Inicio de sesión y registro
  (app)/layout.tsx           Layout protegido: Sidebar + Navbar + guard de sesión
  (app)/dashboard/           Tarjetas, % de hoy, gráfica semanal y mensual, check-in
  (app)/habits/              Lista de hábitos, crear/editar, historial, eliminar
  (app)/statistics/          Estadísticas con filtro por rango de fechas
  (app)/profile/             Datos de la cuenta, cambio de contraseña, resumen
components/
  Sidebar, Topbar            Navegación
  HabitFormDialog            Formulario crear/editar hábito (diálogo)
  HabitHistoryDialog         Historial del hábito en calendario
  ConfirmDialog              Confirmación de acciones críticas
  PasswordStrength           Requisitos y seguridad de la contraseña
  StatCard, EmptyState, CompletionBar, AuthLayout
context/
  AuthContext                Sesión del usuario
  HabitsContext              Estado de los hábitos (CRUD, activar, progreso)
lib/
  api.ts                     Llamadas a la API REST
  schemas.ts                 Validaciones con Zod
  password.ts                Política de contraseñas (igual que el backend)
  dates.ts, format.ts        Fechas locales y formato de rachas
  errors.ts                  Mensajes de error para el usuario
  theme.ts                   Tema de Material UI
```

## Funcionalidades

- Registro, inicio y cierre de sesión, perfil (nombre, correo, contraseña).
- Hábitos: crear, editar, eliminar (con confirmación), activar/desactivar,
  frecuencia diaria, semanal o personalizada (días de la semana), categoría,
  prioridad (ordena la lista), fecha de inicio y fin opcional.
- Seguimiento: marcar como completado, progreso diario, semanal y mensual por
  hábito, historial en calendario.
- Dashboard: hábitos activos, completados hoy, racha actual, mejor racha,
  porcentaje de cumplimiento, gráfica semanal y mensual.
- Estadísticas: total, activos, finalizados, días consecutivos, progreso
  mensual, tendencia de cumplimiento, desglose por categoría y por hábito.
- UX: estados de carga (skeletons), estados vacíos, mensajes de éxito/error
  (snackbar y alerts), validación en tiempo real y diseño responsive.

## Sistema de diseño

Tomado del Avance 1: fondo casi blanco, azul `#2563EB` como color principal,
azul oscuro en hover, grises para texto secundario y verde/rojo/ámbar para
estados. Tipografía Roboto, iconos Material Icons y componentes con bordes
redondeados y sombras suaves.
