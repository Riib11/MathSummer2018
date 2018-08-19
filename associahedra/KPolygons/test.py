from geometry import *

h = PolygonRegular(5)
f = Triangle([ h[i] for i in [0,2,3] ])


# print(h)

print(f.area())