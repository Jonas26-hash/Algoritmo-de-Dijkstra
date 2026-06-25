# Algoritmo de Dijkstra — Simulador Interactivo

Simulador visual del algoritmo de Dijkstra para encontrar la ruta más corta en grafos dirigidos con pesos. Construido con React + TypeScript + Canvas.

## 🚀 Demo

[https://algoritmo-de-dijkstra.vercel.app](https://algoritmo-de-dijkstra.vercel.app)

## 📖 Cómo usar

### 1. Crear un grafo

Usá las herramientas de la barra lateral:

| Herramienta | Icono | Qué hace |
|-------------|-------|----------|
| **Nodo** | ⬤ | Hacé clic en el canvas para agregar un nodo |
| **Arco** | → | Hacé clic en un nodo origen, luego en el destino. Se te pedirá el peso |
| **Mover** | ✥ | Arrastrá un nodo para moverlo. Arrastrá el espacio vacío para mover todo el grafo (pan) |
| **Borrar** | ✕ | Hacé clic en un nodo o arco para eliminarlo |

### 2. Grafo predefinido

Seleccioná un preset del menú desplegable y presioná **📐 Generar grafo** para cargar ejemplos listos para usar:

- Guía original (7 nodos)
- Árbol (6 nodos)
- Completo (4 nodos)
- Red extendida (5 nodos)
- Dos componentes (6 nodos)
- Camino largo (8 nodos)
- Pesos altos (5 nodos)

### 3. Ejecutar Dijkstra

1. Seleccioná un **Nodo Inicial** del menú desplegable
2. (Opcional) Seleccioná un **Nodo Destino** para ver todos los caminos posibles hacia ese nodo
3. Presioná **▶ Dijkstra**

#### Si seleccionaste un destino:
- **Alcanzable**: se muestran **todos los caminos simples** desde inicio hasta destino, ordenados por peso total (del más corto al más largo). En el canvas, cada camino se pinta de un color distinto para identificarlos visualmente. Los arcos compartidos entre varios caminos se muestran en blanco.
- **Inalcanzable**: aparece un cartel rojo en el centro de la pantalla indicando que no hay camino. Se listan todos los resultados del algoritmo normalmente.

#### Si no seleccionaste destino:
Se muestran los caminos más cortos desde el nodo inicial hacia **todos** los demás nodos del grafo.

### 4. Paso a paso

Activá **⏭ Paso a paso** y presioná **▶ Dijkstra** para ejecutar el algoritmo paso a paso, viendo cómo se visitan los nodos y se actualizan las distancias en cada iteración.

### 5. Matriz de adyacencia

Presioná **⊡ Ver matriz** para mostrar la matriz de adyacencia del grafo.

### 6. Limpiar

Usá **🗑 Limpiar todo** para borrar el grafo y empezar de nuevo.

## ✨ Funcionalidades

- **7 presets** de grafos dirigidos con pesos
- **Todos los caminos simples**: al seleccionar un destino, explora todas las rutas posibles (no solo la más corta)
- **Visualización multicolor**: cada camino se pinta con un color distinto en el canvas
- **Paso a paso**: ejecutá el algoritmo iteración por iteración con explicaciones
- **Matriz de adyacencia** interactiva
- **Modo oscuro / claro**
- **Arcos paralelos**: las aristas bidireccionales se separan automáticamente para visualizarse correctamente
- **Pan**: arrastrá el espacio vacío del canvas para mover todo el grafo

## 🛠️ Tecnologías

- **React 19** + **TypeScript**
- **Vite** para el build
- **Canvas API** para el renderizado del grafo
- **Algoritmo Dijkstra** clásico con cola de prioridad (búsqueda lineal)
- **DFS** para enumeración de todos los caminos simples

## 🏗️ Desarrollo local

```bash
# Clonar
git clone https://github.com/Jonas26-hash/Algoritmo-de-Dijkstra.git
cd Algoritmo-de-Dijkstra

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

## 📁 Estructura del proyecto

```
src/
├── algorithm/
│   ├── dijkstra.ts      # Algoritmo de Dijkstra (clásico + paso a paso)
│   └── paths.ts          # Búsqueda de todos los caminos simples (DFS)
├── components/
│   ├── GraphCanvas.tsx   # Canvas interactivo con renderizado del grafo
│   ├── Toolbar.tsx       # Barra lateral con herramientas y controles
│   ├── ResultsPanel.tsx  # Panel de resultados de caminos
│   ├── WeightDialog.tsx  # Diálogo para ingresar peso de arco
│   └── AdjacencyMatrix.tsx
├── types/
│   └── graph.ts          # Tipos de datos
├── App.tsx               # Componente principal
└── App.css               # Estilos
```

## 📝 Licencia

MIT
