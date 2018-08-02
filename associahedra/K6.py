from tree import *
from copy import deepcopy

#
# given a tree (representing a vertex),
# yields the adjacent edges (pairs of trees)
#
def generate_adjacent_edges(t):
    edges = []
    # traverse tree to find pivot points
    nodes = t.get_nodes()
    for i in range(len(nodes)):
        n = nodes[i]
        if not n.left.is_leaf:
            target = deepcopy(t)
            target.get_nodes()[i].rotate_right()
            edges += [(t , target)]
            edges += generate_adjacent_edges(target)
    return edges

#
# each edge is a pair of vertices
#
def generate_edges_K6():
    return generate_adjacent_edges(
        Tree.from_list([[[[[1,2],3],4],5],6]))

es = generate_edges_K6()
es_points = [ [t.get_point(6) for t in e] for e in es]

es_clean = []
def is_first(esp):
    for esc in es_clean:
        if esc[0] == esp[0] and esc[1] == esp[1]:
            return False
    return True

for esp in es_points:
    if is_first(esp): es_clean.append(esp)

print(str(es_clean))#.replace("[","{").replace("]","}"))