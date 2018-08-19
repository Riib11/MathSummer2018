from K6_edges import edges
from K6_vertices import vertices

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
 
# print(get_targets([1,2,3,4,5]))
# [1, 2, 3, 8, 1], [1, 2, 6, 1, 5]

def get_face(head,starts):
    s1, s2 = starts[0], starts[1]

    # go three steps out from s1
    bs1 = [[s1]]
    for i in range(2):
        bs_new = []
        for b in bs1:
            v = b[-1]
            targets = get_targets(v)
            for t in targets:
                bs_new.append( b + [t] )
        bs1 = bs_new

    # check each step out from s2
    # until match with 2nd or 3rd step of s1
    bs2 = [[s2]]
    for i in range(2):
        bs_new = []
        for b in bs2:
            v = b[-1]
            targets = get_targets(v)
            for t in targets:
                bs_new.append( b + [t] )
        bs2 = bs_new

        for b1 in bs1:
            for b2 in bs2:
                if b2[-1] in b1:
                    i = b1.index(b2[-1])
                    b1 = b1[:i]
                    b2.reverse()
                    return b2 + [head] + b1


# for x in get_face(
#     [1,2,3,4,5],
#     [[1, 2, 3, 8, 1], [1, 2, 6, 1, 5]]):
#     print(x)


faces = []

def add_face(f):
    if f: faces.append(f)

for v in vertices:
    ts = get_targets(v)
    if len(ts) == 2:
        add_face(get_face( v, ts ))
    elif len(ts) == 3:
        add_face(get_face( v, ts[:-1] ))
        add_face(get_face( v, ts[1:] ))
        add_face(get_face( v, ts[::2] ))
    elif len(ts) == 4:
        add_face(get_face( v, [ ts[i] for i in [0,1] ] ))
        add_face(get_face( v, [ ts[i] for i in [0,2] ] ))
        add_face(get_face( v, [ ts[i] for i in [0,3] ] ))
        add_face(get_face( v, [ ts[i] for i in [1,2] ] ))
        add_face(get_face( v, [ ts[i] for i in [1,3] ] ))
        add_face(get_face( v, [ ts[i] for i in [2,3] ] ))

# for f in faces: print(f)

print(str(faces).replace("[","{").replace("]","}"))