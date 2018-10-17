#
# Utils
#

import itertools as it
from copy import deepcopy

from mathematica import *
from tree import *

# set of {a,a+b,...,b}
def span(a,b): return range(a,b+1) 

def safemax(xs): return max(xs) if len(xs) > 0 else 1

# flattens 2nd to last level - up
def flatten_up(xs, its=1):
    if its <= 0: return xs
    t = nestedlist_to_tree(xs)
    depth = t.get_depth()
    
    if depth <= 2: return xs

    def helper(t,d):
        if d == depth-3:
            ys = []
            for x in t.children:
                ys += x.children
            return ys
        else:
            f = lambda t: helper(t,d+1)
            return list(map(f,t.children))

    return helper(t,0)

# flattens top-down
def flatten(xs, its=1):
    if its <= 0: return xs
    ys = []
    for x in xs: ys += x
    return ys

def remove_duplicates(xs):
    ys = []
    for x in xs: ys.append(x) if not x in ys else None
    return ys

#
# Polygon
#
class Polygon:
    def __init__(self, vertices_count):
        self.vertices = [ None for _ in range(vertices_count) ]

    def tostring(self): return str(self.vertices)
    __str__ = tostring; __repr__ = tostring
    def __getitem__(self, i): return self.vertices[i]
    def __setitem__(self, i, v): self.vertices[i] = v

#
# Coxeter Graph
#
class Coxeter:
    def __init__(self, n):
        self.n = n
        # yields the most simple orientation
        self.edges = [ (i,i+1) for i in span(1,n-1) ]
        # set of Ups and Downs
        self.U = [ i for i in span(1,n) if self.is_Up(i) ]
        self.D = [ i for i in span(1,n) if self.is_Down(i) ]

    def is_Up(self, i):
        return not self.is_Down(i)

    def is_Down(self, i):
        if 1 == i or self.n == i: return True
        return any([ (i-1,i) == e for e in self.edges ])

#
# Traingulations of Polygon
#
class Triangulations:
    def __init__(self, vertices_count):
        self.vc = vertices_count

    def vertex_distance(self, x):
        x = sorted(x)
        dist1 = x[1] - x[0]
        dist2 = x[0]+self.vc - x[1]
        return min(dist1, dist2)

    def vertex_between(self, v1, v2):
        for i in range(self.vc):
            if (1 == self.vertex_distance([i,v1]) and
                1 == self.vertex_distance([i,v2])
            ):
                return i


    def is_adjacent(self, x):
        return 1 == self.vertex_distance(x)

    def get_divided_sides(self, x):
        a,b = x[0], x[1]
        
        side1 = [a,b]
        i = a+1
        while i != b:
            side1.append(i)
            i = (i+1) % (self.vc)

        side2 = [a,b]
        i = b+1
        while i != a:
            side2.append(i)
            i = (i+1) % (self.vc)

        return side1, side2

    def is_valid(self, x1, x2):
        side1, side2 = self.get_divided_sides(x1)
        return (
            # side-segregated (not intersecting)
            ((x2[0] in side1) and (x2[1] in side1) or
             (x2[0] in side2) and (x2[1] in side2))
            # not same
            and (not (x1[0] in x2 and x1[1] in x2))
        )

    def is_valid_face(self, ds):
        return all([ self.is_valid(x1,x2)
            for x1,x2 in it.combinations(ds,2) ])

    def standardize_face(self, ds):
        return sorted([ sorted(d) for d in ds ], key=lambda x:sum(x))

    def face_equal(self, ds1, ds2):
        return all([ d in ds2 for d in ds1 ])

    # find valid faces for given dimensionality
    def get_faces(self, dim):
        # possible divides (non-adjacents)
        divides = [ d
            for d in it.combinations(range(self.vc),2)
            if not self.is_adjacent(d) ]

        faces = [ [d] for d in divides ]
        for i in range( self.vc - dim - 4 ):
            faces_new = []
            for f in faces:
                for d in divides:
                    f_new = f[:] + [d]
                    if self.is_valid_face(f_new):
                        faces_new.append(f_new)
            faces = faces_new

        # remove duplicates
        faces_new = []
        for f in faces:
            if not any([ self.face_equal(f,fi) for fi in faces_new ]):
                faces_new.append(f)
        faces = faces_new

        #
        return faces

    def get_nested_faces(self, dim, order=False):
        if dim == 0: return self.get_faces(0)

        vs = self.get_faces(dim-1)
        vs_nested = self.get_nested_faces(dim-1)
        es = self.get_faces(dim)

        # print(f"d={dim}, vs:",vs)
        # print()
        # print(f"d={dim}, vs_nested:",vs_nested)
        # print()
        # print(f"d={dim}, es:",es)
        # print()

        # note: each vertex has 1 more component than each edge.

        def eq_tri(x1,x2):
            return set(x1) == set(x2)

        def in_tri(x,xs):
            return any([ eq_tri(x,xi) for xi in xs ])

        # is A a superset of B
        def is_superset_tri(A,B):
            return all([ in_tri(b,A) for b in B ])

        edges_inds = [ 
            [ i for i in range(len(vs))
                if is_superset_tri(vs[i],e) ]
            for e in es ]

        edges = [ 
            [ v for v in vs
                if is_superset_tri(v,e) ]
            for e in es ]

        def order_edges_inds(edges):
            edges_copy = deepcopy(edges)
            edges_new = []
            edges_inds_new = []
            
            # choose start (arbitrary)
            e = edges_copy[0]
            edges_new.append(e)
            edges_copy.remove(e)
            edges_inds_new.append(edges.index(e))

            # iterate through rest of edge
            while len(edges_copy) > 0:
                # find edge that connects with e
                # print("-"*20)
                # print("*",len(edges_new))
                # print("*",e)
                for e1 in edges_copy:
                    # print("  > ",e1)
                    if (e1[0] in e) or (e1[1] in e):
                        e = e1
                        edges_new.append(e)
                        edges_inds_new.append(edges.index(e))
                        edges_copy.remove(e)
                        break

            edges_inds = edges_inds_new
            return edges_inds

        # if order:
        #     edges_inds = [ order_edges_inds(e) for e in edges ]
        #     print(edges_inds)

        edges = [ remove_duplicates(
            [ vs_nested[i] for i in range(len(vs))
                if is_superset_tri(vs[i],e) ])
            for e in es ]

        return edges

#
# (n-1)-Associahedron
#
class K:
    def __init__(self, n):
        self.n = n
        self.polygon = Polygon(n+2)
        self.coxeter = Coxeter(n)
        self.triangulations = Triangulations(self.n+2)

        # label polygon from coxeter
        i = 0
        self.polygon[i] = 0
        for x in sorted(self.coxeter.D):
            i += 1; self.polygon[i] = x
        i += 1; self.polygon[i] = n+1
        for x in reversed(sorted(self.coxeter.U)):
            i += 1; self.polygon[i] = x


    def mu(self, i, j):
        if   i >  j: return i - j
        elif i <= j: return j - i

    def get_imbedded_point(self, T):

        def in_T(i,j): return ((i,j) in T) or ((j,i) in T)

        L = lambda i: [ a for a in span(0,i-1) if in_T(a,i) ]
        R = lambda i: [ b for b in span(i+1,self.n+1) if in_T(b,i) ]

        p_l = lambda i: safemax([ self.mu(i,a) for a in L(i) ])
        p_r = lambda i: safemax([ self.mu(i,b) for b in R(i) ])     

        w = lambda i: p_l(i) * p_r(i)

        def x(i):
            if   i in self.coxeter.D: return w(i)
            elif i in self.coxeter.U: return self.n+1 - w(i)

        return [ x(i) for i in span(1,self.n) ]

    def get_imbedded_vertices(self):
        Ts = self.triangulations.get_faces(0)
        ps = [ self.get_imbedded_point(T) for T in Ts ]
        return ps

    def get_imbedded_faces(self, dim, flatten_its=0):
        Ts = self.triangulations.get_faces(dim)

        Ts = flatten_up(
            self.triangulations.get_nested_faces(dim, dim==2),
            flatten_its)

        # specifically for 2D faces
        if dim == 2:
            # Ts : [[edge]] = [[[vertex]]]
            # each edge is a [vertex].
            # want to make each [edge] into a face.
            # so, collapse [edge]=[[vertex]] into just [vertex],
            # remove duplicates, and TODO put in order
            
            # [print(x) for x in Ts]
            Ts = list(map(remove_duplicates, Ts))
            # print("="*100)
            # [print(x) for x in Ts]

        # [ print([ len(i) for i in x ]) for x in Ts ]
        # print()

        Ts_tree = nestedlist_to_tree(Ts)

        def helper(tree):
            if isinstance(tree.children[0], TreeNode):
                return remove_duplicates(list(map(helper, tree.children)))
            else:
                # print(tree.children,self.get_imbedded_point(tree.children))
                return self.get_imbedded_point(tree.children)
        
        return helper(Ts_tree)
        
#
#
#

k = K(5)

# print(to_table(k.get_imbedded_faces(1)))
# print()
# print(to_table(k.get_imbedded_faces(2,1)))
print(to_table(k.get_imbedded_faces(2,1)))