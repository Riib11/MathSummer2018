import math
import itertools as it

from mathematica import *
import debug

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

        # initialize divides_index
        Divide.init_divides_indexing(self.V)

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
        v = (d.v1 + 1) % self.V
        while v != d.v2:
            side1.append(v)
            v = (v + 1) % self.V

        side2 = [d.v1, d.v2]
        v = (d.v1 - 1) % self.V
        while v != d.v2:
            side2.append(v)
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

        if non_intersecting and distinct and d == Divide(1,4) and d_new == Divide(0,3):
            debug.log("valid divide", str(d)+", "+str(d_new))
            debug.log("sides", str(side1)+", "+str(side2))

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

        if divides_count < 0: return []
        if divides_count == 0:
            return [Triangulation(self.N, [], self, self.coxeter_graph)]

        all_divides = [ Divide(d1, d2)
            for d1, d2 in it.combinations(inrange(0, self.V - 1), 2)
            if not self.is_on_perimeter(Divide(d1, d2)) ]

        debug.log("all_divides", all_divides)

        # proto-triangulations
        prototris = [ [d] for d in all_divides ]
        for _ in range(divides_count-1):
            prototris_new = []
            for tri in prototris:
                for d in all_divides:
                    tri_new = tri[:] + [d]
                    if self.is_valid_triangulation(tri_new):
                        prototris_new.append(tri_new)
            prototris = prototris_new

        debug.log("prototris:", prototris)

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

    def tostring(self):
        return "d("+str(self.v1)+","+str(self.v2)+")"
    __str__ = tostring
    __repr__ = tostring

    @classmethod
    def init_divides_indexing(cls, V):
        divides_ordering = [ Divide(v1, v2)
            for v1, v2 in it.combinations(inrange(0, V - 1), 2) ]

        # uses custom Divide equality
        def get_divide_index(d):
            assert ( isinstance(d, Divide) )
            assert ( d in divides_ordering )
            return divides_ordering.index(d)

        cls.get_divide_index = get_divide_index


#
### Triangulation
#
class Triangulation:
    def __init__(self, N, ds, polygon, coxeter_graph):
        assert ( polygon.is_valid_triangulation(ds) )

        self.N = N
        self.ds = sorted(ds, key=Divide.get_divide_index)
        self.polygon = polygon
        self.coxeter_graph = coxeter_graph

    def tostring(self): return "Tri"+str(self.ds)
    __str__ = tostring
    __repr__ = tostring

    def issubset(self, other):
        assert ( isinstance(other, Triangulation) )
        return all([ d in other.ds for d in self.ds ])

    def __eq__(self, other):
        assert ( isinstance(other, Triangulation) )
        return (self.issubset(other)) and (other.issubset(self))

    def mu(self, i, j):
        if   i >  j: return i - j
        elif i <= j: return j - i

    def L(self, i):
        return [ a for a in inrange(0, i - 1)
            if Divide(a, i) in self.ds ]

    def R(self, i):
        return [ b for b in inrange(i + 1, self.N + 1)
            if Divide(b, i) in self.ds ]

    def p_L(self, i):
        return safemax([ self.mu(i, a) for a in self.L(i) ])

    def p_R(self, i):
        return safemax([ self.mu(i, b) for b in self.R(i) ])

    def w(self, i):
        return self.p_L(i) * self.p_R(i)

    def x(self, i):
        if self.coxeter_graph.is_Down(i):
            return self.w(i)
        else:
            return self.N + 1 - self.w(i)

    def get_embedded_point(self):
        return [ self.x(i) for i in inrange(1, self.N) ]

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

def safemax(xs): return max(xs) if len(xs) > 0 else 1

#####
####
### Construction
##
#

N   = 3
dim = 1

coxeter_graph  = CoxeterGraph(N)
polygon        = Polygon(N, coxeter_graph)
triangulations = polygon.get_all_triangulations(dim)

debug.log("triangulations", triangulations)
debug.log("len = ", len(triangulations))
debug.log("embedded points", to_table([tri.get_embedded_point()
    for tri in triangulations]))