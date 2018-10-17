import itertools as it
from geometry import *
from mathematica import *

# n : as in K(n)
# d : dimension of faces

class K:

    def __init__(self, n):
        self.n = n
        self.polygon = PolygonRegular( self.n+3 )

    def vertex_distance(self, x):
        x = sorted(x)
        dist1 = x[1] - x[0]
        dist2 = x[0]+self.n+3 - x[1]
        return min(dist1, dist2)

    def vertex_between(self, v1, v2):
        for i in range(self.n+3):
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
            i = (i+1) % (self.n+3)

        side2 = [a,b]
        i = b+1
        while i != a:
            side2.append(i)
            i = (i+1) % (self.n+3)

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

    # find all the valid faces with
    # (n-dim) divides.
    def get_faces(self, dim):
        # possible divides (non-adjacents)
        divides = [ [d[0],d[1]]
            for d in it.combinations(range(self.n+3),2)
            if not self.is_adjacent(d) ]

        faces = [ [d] for d in divides ]
        for i in range( self.n - dim - 1 ):
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

    def is_inner_triangle(self, d1, d2):
        shared = None
        for d in (d1 + d2):
            if d in d1 and d in d2:
                shared = d
                break
        v1 = d1[(d1.index(shared) + 1) % 2]
        v2 = d2[(d2.index(shared) + 1) % 2]
        return 1 == self.vertex_distance([v1,v2])

    def is_outer_triangle(self, d):
        return 2 == self.vertex_distance(d)

    # convert vertices ([divides]) to
    # points in R^(n+3)
    def get_vertices_points(self, dim):
        faces = self.get_faces(dim)

        points = []

        for ds in faces:

            triangle_inds = []
            # inner triangles
            for d1,d2 in it.combinations(ds,2):
                if self.is_inner_triangle(d1, d2):
                    shared = None
                    for d in (d1 + d2):
                        if d in d1 and d in d2:
                            shared = d
                            break
                    v1 = d1[(d1.index(shared) + 1) % 2]
                    v2 = d2[(d2.index(shared) + 1) % 2]
                    vs = sorted([v1, v2, shared])
                    triangle_inds.append(vs)
            # outer triangles
            for d in ds:
                if self.is_outer_triangle(d):
                    v = self.vertex_between(d[0], d[1])
                    vs = sorted([d[0], d[1], v])
                    triangle_inds.append(vs)
            #
            triangles = [ Triangle([ self.polygon[i] for i in t_inds ])
                for t_inds in triangle_inds ]
            areas = [ t.area() for t in triangles ]
            #
            point = []
            for i in range(self.n+3):
                total = 0
                for j in range(len(triangle_inds)):
                    t_inds = triangle_inds[j]
                    if i in t_inds:
                        total += areas[j]
                point.append(total)

            points.append(point)

        return points

k = K(1)
vertices = k.get_vertices_points(0)
print(to_table(vertices))