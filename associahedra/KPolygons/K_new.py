import math
import itertools as it
from mathematica import *

#####
####
### Structures
##
#

#
#
#
class Associahedron:
    def __init__(self, N):
        self.N = N

#
#
#
class Polygon:
    def __init__(self, N):
        self.N = N
        self.V = N + 2
        self.vertices = [None for _ in nrange(self.V)]

    # the minimum number of vertices, 
    # along the permimeter of the polygon,
    # between two vertices
    # [input] d : Divide
    # [output] num >= 0
    def get_perimeter_distance(self, d):
        dist1 = abs(d.v1 - d.v2) % self.V
        dist2 = abs(d.v1 - d.v2 + self.V) % self.V 
        return min(dist1, dist2)

    def get_vertex_between(self, v1, v2): pass

    # are two vertices adjacent on the polygon?
    # [input] d : Divide
    # [output] Boolean
    def are_adjacent_vertices(self, d):
        return self.get_perimeter_distance(d.v1, d.v2) == 1

    # get the two sets of vertices that are
    # seperated via the divide across the polygon
    # note: each side includes the divide's vertices
    # [input] d : Divide
    # [output] [vertex], [vertex]
    def get_partitioned_vertices(self, d):
        side1 = [d.v1, d.v2]
        v = v1 + 1
        while v != d.v2:
            side1.append(v)
            i = (v + 1) % self.V

        side2 = [d.v1, d.v2]
        v = v1 - 1
        while v != d.v2:
            side1.append(v)
            v = (v - 1) % self.V

        return side1, side2

    # will the addition of the new
    # divide `d_new` be valid given the
    # existent divide `d`?
    # [input] d, d_new : Divide
    # [output] Boolean
    def valid_new_divide(self, d, d_new):
        side1, side2 = self.get_partitioned_vertices(d)
        return (
            # divides do not intersect

        )

#
#
#
class Divide:
    def __init__(self, v1, v2):
        [self.v1, self.v2] = sorted([v1, v2])

    # 
    def contained_in_vertices(self, vs):
        

#
#
#
class CoxeterGraph:
    def __init__(self, n):
        self.n = n
        # yields the most simple orientation
        self.edges = [ (i,i+1) for i in nrange(1,n-1) ]
        # set of Ups and Downs
        self.U = [ i for i in nrange(1,n) if self.is_Up(i) ]
        self.D = [ i for i in nrange(1,n) if self.is_Down(i) ]

    def is_Up(self, i):
        return not self.is_Down(i)

    def is_Down(self, i):
        if i in [1, self.n]:
            return True
        else:
            return any([ (i - 1, i) == e for e in self.edges ])

#####
####
### Construction
##
#

#####
####
### Utilities
##
#

def nrange(n): # [1, ..., n]
    return [i for i in range(1,n+1)]
