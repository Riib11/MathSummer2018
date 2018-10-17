# Realization of Associahedron

Define `Associahedron` to be the generalized associahedron.

    Associahedron : N -> Type

Define `forall x:N, [x] := {1,...,x}`.

## Imbedding the `Associahedron (n-1)` in `R^n`.

Axiom `n : N` for use in `K (n-1)`.

Define `P` to be the vertices of the regular polygon with `n + 2` vertices.

Define `cox` to be the Coxeter graph `A (n - 1)` (alternating group). It consists of the nodes `t 1, t 2, ..., t n` where `t i = (i, i + 1)` is a simple transposition on `[n + 1]`.

Define `ori` to be the following orientation on `cox`:

    t 1 -> t 2 -> ... -> t n

Define Up and Down: for `i in {2,...,n-1}`, `i` is Up if the edge `(t (i - 1), t i)` is directed as `t i -> t (i - 1)`, and Down otherwise. `1` and `n` are Down.

Define `U := { i in [n] | i is Up }`
Define `D := { i in [n] | i is Down }`

Define Labeling of `P`: Pick a vertex to be labeled `0`. Then take the adjacent node counter-clockwise and label it with the smallest Down element of `[n]` not already used. Repeat until there are no such Down element avaliable. If there is no such element, use label `n+1` and continue to label the next counter-clockwise element by the largest Up element of `[n]` that has not been used. Iterate.

Axiom `T : Triangulation P` to be our considered triangulation for the following.

Define `mu i j`, that measures distances between labels of `P`, to be

    mu : [n] -> {0,...,n+1} -> [n+2]
    mu i j
        | i >  j => number of edges on path i->j
                    only b labels <= i
        | i <= j => number of edges on path i->j
                    only between labels >= i

Define `L i` and `R i` to be

    L : [n] -> {0,...,i-1}
    L i = { a | 0 <= a < i and {a,i} in T }

    R : [n] -> {i+1,...,n+1}
    R i = { b | i < b <= n+1 and {b,i} in T }

Define `p_l i, p_r i` to be

    p_L : [n] -> [n+2]
    p_L i = max { mu i a | a in (L i) }

    p_R : [n] -> [n+2]
    p_R i = max { mu i b | b in (R i) }

Define `w i`, the weight a label, to be
    
    w : [n] -> N
    w i = (p_L i) * (p_R i)

Define `x i`, the scalar corresponding to a label, to be

    x : [n] -> R^(n+1)
    x i =
        | i in D => (w i)
        | i in U => n + 1 - (w i)