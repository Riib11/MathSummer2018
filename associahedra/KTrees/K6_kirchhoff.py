from mathematica import *
from K6_edges import edges
from K6_vertices import vertices

vertices_named = {}
i = 0
for v in vertices:
    vertices_named[str(v)] = i
    i += 1

len_vs = len(vertices)

kirchoff_matrix = [
    [0 for _ in range(len_vs)]
    for _ in range(len_vs)]

for e in edges:
    i1 = vertices_named[str(e[0])]
    i2 = vertices_named[str(e[1])]
    kirchoff_matrix[i1][i2] = 1

# print(to_list(kirchoff_matrix))

es_forward = {}
for e in edges:
    source = str(e[0])
    target = e[1]
    if not source in es_forward:
        es_forward[source] = []
    es_forward[source].append(target)

es_backward = {}
for e in edges:
    source = e[0]
    target = str(e[1])
    if not target in es_backward:
        es_backward[target] = []
    es_backward[target].append(source)

def get_targets(v): return es_forward[str(v)] if str(v) in es_forward else []
def get_sources(v): return es_backward[str(v)] if str(v) in es_backward else []

degree_matrix = [
    [0 for _ in range(len_vs)]
    for _ in range(len_vs)]

for v in vertices:
    i = vertices_named[str(v)]
    d = len(get_targets(v)) + len(get_sources(v))
    degree_matrix[i][i] = d

# print(to_list(degree_matrix))