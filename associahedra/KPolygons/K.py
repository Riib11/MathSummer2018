import itertools as it
from geometry import *
from mathematica import *

# n : as in K(n)
# d : dimension of faces

class K:

    def __init__(self, n):
        self.n = n
        self.polygon = PolygonRegular( self.n+3 )

    class Face:
        def __init__(self, ds):
            self.ds = ds # divides
            # a divide is a pair of
            # integers in [0,n+2]

        def is_valid(self, k, x):
            if k.is_adjacent(x): return False
            return all([ k.is_valid(d,x) for d in self.ds])

        def __eq__(self, other):
            ds1 = [str(d) for d in self.ds]
            ds2 = [str(d) for d in other.ds]
            return ds1[0] in ds2 and ds1[1] in ds2

        def tostring(self): return str(self.ds)
        __str__ = tostring; __repr__ = tostring

    def is_adjacent(self, x):
        return (
            (x[0]-1) % (self.n+3) == x[1] or
            (x[0]+1) % (self.n+3) == x[1] )


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

    def is_valid(self, x1,x2):
        side1, side2 = self.get_divided_sides(x1)
        return not (
            # intersecting
            not ((x2[0] in side1) and (x2[1] in side1) or
                ( x2[0] in side2) and (x2[1] in side2))
            # same
            or (x1[0] in x2 and x1[1] in x2)
            # adjacent
            or (self.is_adjacent(x1) or self.is_adjacent(x2))
        )

    # d : dimension of faces
    def get_faces_raw(self, d):    
        faces = []
        options = [ [o[0],o[1]] for o in
            it.combinations([i for i in range(self.n+3)], 2)]
        faces = [self.Face([opt]) for opt in options]
        for _ in range(1,d+1):
            new_faces = []
            for f in faces:
                for opt in options:
                    if f.is_valid(self,opt):
                        ds = [ d for d in f.ds ] + [ opt ]
                        new_faces.append(self.Face(ds))
            faces = new_faces

        # remove duplicates
        faces_new = []
        for f in faces:
            do_add = True
            for fn in faces_new:
                if f == fn:
                    do_add = False
                    break
            if do_add: faces_new.append(f)
        faces = faces_new

        return faces

    def get_vertices(self, debug=False):
        faces = self.get_faces_raw(0)
        vertices = []
        for f in faces:
            corner_areas = [ [] for _ in range(self.n+3) ]
            areas_indecies = []

            def is_unique(area):
                for a in areas_indecies:
                    if all(x in area for x in a):
                        return False
                return True

            # inner areas (bounded by two divides)
            for combo in it.combinations(f.ds, 2):
                d0, d1 = combo
                for perm in it.permutations(d0 + d1, 4):
                    if (self.is_adjacent(perm[:-2]) and
                        perm[2] == perm[3]
                    ):
                        area = [ perm[i] for i in range(3) ]
                        if is_unique(area):
                            areas_indecies.append(area)
                            # link area to vertices it touches
                            for i in area: corner_areas[i].append(len(areas_indecies)-1)

            # outer areas (bounded by one divide and hull)
            for i in range(self.n+3):
                # if not attached to any divides,
                # is the center of an outer area
                if not any([i in d for d in f.ds]):
                    area = [ (i-1)%(self.n+3), i, (i+1)%(self.n+3) ]
                    if is_unique(area):
                        areas_indecies.append(area)
                        for i in area: corner_areas[i].append(len(areas_indecies)-1)

            # make vertex coordinates
            areas = [
                Triangle([
                    self.polygon.ps[i]
                    for i in a_inds
                ]).area()
                for a_inds in areas_indecies ]
            # print(corner_areas)
            vertices.append([
                sum([areas[i] for i in indecies])
                for indecies in corner_areas ])

            if debug:
                print("------------------------------")
                print("face:",f)
                print("areas indecies:",areas_indecies)
                print("vertex adjacents:",corner_areas)
                print("areas:",to_table(areas))

        return vertices



k = K(2)
vertices = k.get_vertices(0)
print(to_table(vertices))