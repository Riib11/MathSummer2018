import math
import itertools as it
from mathematica import *

#####
####
### Structures
##
#

#
### Polygon
#
class Polygon:
    def __init__(self, N, coxeter_graph):
        self.N = N
        self.V = N + 2

        # label vertices according to
        # Coxeter graph
        self.coxeter_graph = coxeter_graph
        self.vertices = []
        self.vertices.append(0)
        for x in self.coxeter_graph.D:
            self.vertices.append(x)
        self.vertices.append(self.N + 1)
        for x in reversed(self.coxeter_graph.U):
            self.vertices.append(x)

    # the minimum number of vertices, 
    # along the permimeter of the polygon,
    # between two vertices
    def get_perimeter_distance(self, d):
        assert ( isinstance(d, Divide) )

        dist1 = abs(d.v1 - d.v2) % self.V
        dist2 = abs(d.v1 - d.v2 + self.V) % self.V
        dist = min(dist1, dist2)

        assert ( dist >= 0 )
        return dist

    def get_vertex_between(self, v1, v2): pass

    # is this divide just a part of
    # the polygon's perimeter?
    # note: each side includes the divide's vertices
    def is_on_perimeter(self, d):
        assert ( isinstance(d, Divide) )

        return self.get_perimeter_distance(d) == 1

    # partition the polygon's vertices
    # into two sets, divided along
    # the given divide
    # note: the divide's vertices are
    #       in each set
    def get_partitioned_vertices(self, d):
        assert ( isinstance(d, Divide) )

        side1 = [d.v1, d.v2]
        v = d.v1 + 1
        while v != d.v2:
            side1.append(v)
            v = (v + 1) % self.V

        side2 = [d.v1, d.v2]
        v = d.v1 - 1
        while v != d.v2:
            side1.append(v)
            v = (v - 1) % self.V

        return side1, side2

    # will the addition of the new
    # divide `d_new` be valid given the
    # existent divide `d`?
    def is_valid_new_divide(self, d, d_new):
        assert ( isinstance(d, Divide)
            and isinstance(d_new, Divide) )

        side1, side2 = self.get_partitioned_vertices(d)
        non_intersecting = (d_new.is_contained_in_vertices(side1)
            or d_new.is_contained_in_vertices(side2))
        distinct = d != d_new

        return non_intersecting and distinct


    # does this collection of divides
    # yield a valid triangulation?
    def is_valid_triangulation(self, ds):
        assert ( all([isinstance(d, Divide) for d in ds]) )

        return all([ self.is_valid_new_divide(d1, d2)
            for d1, d2 in it.combinations(ds, 2)])

    # generate all the triangulations that
    # use `self.N - dim` divides
    def get_all_triangulations(self, dim):
        divides_count = self.N - dim

        all_divides = [ Divide(d1, d2)
            for d1, d2 in it.combinations(inrange(0, self.V - 1), 2)
            if not self.is_on_perimeter(Divide(d1, d2)) ]

        print("all_divides:", all_divides)

        # proto-triangulations
        prototris = [ [d] for d in all_divides ]
        for i in range(divides_count):
            prototris_new = []
            for tri in prototris:
                for d in all_divides:
                    tri_new = tri[:] + [d]
                    if self.is_valid_triangulation(tri_new):
                        prototris_new.append(tri_new)
            prototris = prototris_new

        print("prototris:",prototris)

        # convert to Triangulation type
        # and remove duplicates
        triangulations = []
        for ds in prototris:
            tri = Triangulation(self.N, ds, self, self.coxeter_graph)
            if tri not in triangulations: # uses custom equality
                triangulations.append(tri)

        return triangulations

#
### Divide
#
class Divide:
    def __init__(self, v1, v2):
        # sort vertices
        [self.v1, self.v2] = sorted([v1, v2])

    # is this divide's vertices contained in
    # a set of vertices?
    def is_contained_in_vertices(self, vs):
        return self.v1 in vs and self.v2 in vs

    def __eq__(self, other):
        return [self.v1, self.v2] == [other.v1, other.v2]

    # TODO
    def tostring(): pass

    __str__ = tostring
    __repr__ = tostring

#
### Triangulation
#
class Triangulation:
    def __init__(self, N, ds, polygon, coxeter_graph):
        assert ( polygon.is_valid_triangulation(ds) )

        self.N = N
        self.ds = ds
        self.polygon = polygon
        self.coxeter_graph = coxeter_graph

    def mu(self, i, j):
        assert ( 1 <= i <= self.N )
        assert ( 0 <= j <= self.N + 1 )

        # path i -> j only along labels <= i
        x = i - 1
        count = 1
        while i <= x:
            if x == j: return count
            count += 1
            x = (x - 1) % self.N
        # path i -> j only along labels >= i
        x = i + 1
        count = 1
        while i >= x:
            if x == j: return count
            count += 1
            x = (x + 1) % self.N

    def L(self, i):
        assert ( 1 <= i <= self.N )

        return [ a for (a, i) in self.ds
            if 0 <= a and a < i]

    def R(self, i):
        assert ( 1 <= i <= self.N )

        return [ b for (b, i) in self.ds
            if i < b <= self.N + 1]

    def p_L(self, i):
        assert ( 1 <= i <= self.N )

        x = max([ self.mu(i, a) for a in self.L(i) ])

        assert ( 1 <= x <= self.N + 2)
        return 

    def p_R(self, i):
        assert ( 1 <= i <= self.N )

        return max([ self.mu(i, b) for b in self.R(i) ])

    def w(self, i):
        assert ( 1 <= i <= self.N )

        return self.p_L(i) * self.p_R(i)

    def x(self, i):
        assert ( 1 <= i <= self.N )

        if self.coxeter_graph.is_Down(i):
            return self.w(i)
        else:
            return self.N + 1 - self.w(i)

    def issubset(self, other):
        assert ( isinstance(other, Triangulation) )

        return [ d in other.ds for d in self.ds ]

    def __eq__(self, other):
        assert ( isinstance(other, Triangulation) )

        return (self.issubset(other)) and (other.issubset(self))

    # TODO
    def tostring(): pass

    __str__ = tostring
    __repr__ = tostring

#
### Coxeter Graph
#
class CoxeterGraph:
    def __init__(self, N):
        self.N = N
        # yields the most simple orientation
        self.edges = [ (i, i + 1) for i in inrange(1, N - 1) ]
        # set of Ups and Downs
        self.U = [ i for i in inrange(N) if self.is_Up(i) ]
        self.D = [ i for i in inrange(N) if self.is_Down(i) ]

    def is_Up(self, i):
        return not self.is_Down(i)

    def is_Down(self, i):
        if i in [1, self.N]:
            return True
        else:
            return (i - 1, i) in self.edges

#####
####
### Utilities
##
#

def inrange(a, b=None): # [a, ..., b] inclusive
    if not b: a, b = 1, a
    return [i for i in range(a, b + 1)]

#####
####
### Construction
##
#

N = 3
coxeter_graph = CoxeterGraph(N)
polygon = Polygon(N, coxeter_graph)

print("triangulations:", polygon.get_all_triangulations(1) )

# TODO
def get_imbedded_point(self): pass