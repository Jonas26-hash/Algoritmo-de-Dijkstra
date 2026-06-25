# Algoritmo de Floyd‑Warshall

## ¿Qué es?

Floyd‑Warshall es un algoritmo de **programación dinámica** que encuentra las
**distancias más cortas entre todos los pares de nodos** de un grafo dirigido
con pesos (positivos o negativos). A diferencia de Dijkstra, que calcula desde
_un solo origen_, Floyd calcula **todos los orígenes simultáneamente**.

---

## ¿Cómo funciona?

Idea central: para ir del nodo **i** al nodo **j**, preguntarse si conviene
pasar por un nodo intermedio **k**.

La matriz de distancias se actualiza iterativamente:

```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

### Paso a paso

1. Inicializar `dist[i][j]`:
   - `0` si i == j
   - `peso` de la arista si existe i → j
   - `∞` si no hay arista directa

2. Para cada nodo `k` (como posible intermediario):
   - Para cada origen `i`:
     - Para cada destino `j`:
       - Si `dist[i][k] + dist[k][j] < dist[i][j]`, actualizar

3. Al terminar, `dist[i][j]` contiene la distancia mínima entre i y j

### Visual

```
                  k
                /   \
               /     \
              /       \
             i ────────→ j
          directo: 8
          vía k:   3 + 2 = 5  ← mejor
```

---

## Complejidad

| Aspecto | Valor |
|---------|-------|
| Tiempo | **O(V³)** — tres bucles anidados (V = cantidad de nodos) |
| Memoria | **O(V²)** — matriz de V×V |

Para grafos pequeños (o medianos) es práctico. Para grafos grandes no.

---

## Comparación con Dijkstra

| Característica | Dijkstra | Floyd‑Warshall |
|---|---|---|
| Origen | Uno solo | Todos los pares |
| Pesos negativos | ✗ No soporta | ✓ Soporta |
| Ciclos negativos | ✗ | ✗ Detecta (dist[i][i] < 0) |
| Paso a paso | ✓ Sí | ✗ No |
| Cambiar origen sin recalcular | ✗ | ✓ |
| Complejidad | O((V+E) log V) por origen | O(V³) total |
| Ideal para | Consultas de un solo origen | Consultas de múltiples orígenes |

---

## ¿Por qué elegir Floyd‑Warshall?

### 1. Pesos negativos

Dijkstra asume que una vez visitado un nodo, su distancia es definitiva. Con
pesos negativos esto se rompe. Floyd‑Warshall no tiene esa limitación.

**Ejemplo del simulador:**

```
A → B: 4
A → C: 2
B → C: -3   ← negativa
B → D: 2
C → D: 1
```

Desde A hasta D:

- **Dijkstra** da **3** (A → C → D) → **incorrecto**
- **Floyd‑Warshall** da **2** (A → B → C → D) → **correcto**

¿Por qué falla Dijkstra? Primero visita C con distancia 2 (es la menor).
Luego descubre que B → C = -3, que mejoraría C a 1, pero C ya está visitado
y no lo reconsidera.

### 2. Cambiar origen sin recalcular

Una vez ejecutado Floyd, se puede consultar la distancia entre _cualquier_
par de nodos sin volver a ejecutar el algoritmo. En el simulador, al cambiar
el nodo inicial los resultados se actualizan al instante.

### 3. Matriz completa

Floyd produce una matriz de V×V con todas las distancias. Es útil para:
- Visualizar la estructura completa del grafo
- Detectar componentes inconexas (∞)
- Encontrar el centro del grafo (nodo con menor excentricidad)

---

## Cuándo usar cada uno

| Situación | Algoritmo |
|---|---|
| Un solo origen, pesos ≥ 0 | Dijkstra |
| Todos los orígenes, pesos ≥ 0 | Cualquiera (Dijkstra V veces o Floyd) |
| Pesos negativos | Floyd‑Warshall |
| Grafos muy grandes (V > 1000) | Dijkstra (V³ no escala) |
| Paso a paso didáctico | Dijkstra |
| Demostración de matrices | Floyd‑Warshall |

---

## En este simulador

- **Dijkstra**: modo clásico con paso a paso. Seleccionás un nodo inicial y
  obtenés distancias y caminos hacia todos los demás. Botón "▶ Dijkstra".

- **Floyd‑Warshall**: seleccionás el método con el toggle azul. Ejecutás una
  vez y podés cambiar el nodo inicial sin recalcular. Muestra la matriz
  completa de distancias en el panel de resultados.

- **Comparar ambos**: ejecuta los dos algoritmos lado a lado y marca las
  diferencias. Con el preset de pesos negativos se ve claramente dónde
  difieren.

---

## Referencias

- Floyd, R. W. (1962). Algorithm 97: Shortest path.
  _Communications of the ACM_, 5(6), 345.
- Warshall, S. (1962). A theorem on Boolean matrices.
  _Journal of the ACM_, 9(1), 11–12.
- Cormen, T. H. et al. _Introduction to Algorithms_, 3rd ed.
  Capítulo 25: All-Pairs Shortest Paths.
