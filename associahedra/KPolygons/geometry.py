from mathematica import *

#
#
class Point:
    def __init__(self, xs):
        self.xs = xs

    def __getitem__(self, i): return self.xs[i]

    def tostring(self): return to_table(self.xs)
    __str__ = tostring; __repr__ = tostring

def P(xs): return Point(xs)

#
#
class Polygon:
    def __init__(self, ps):
        self.ps = ps

    def __getitem__(self, i): return self.ps[i]

    def tostring(self): return to_table(self.ps)
    __str__ = tostring; __repr__ = tostring

#
#
class Triangle(Polygon):
    def __init__(self, ps):
        assert len(ps)==3
        super().__init__(ps)

    def area(self):
        [x1, y1] = self.ps[0].xs
        [x2, y2] = self.ps[1].xs
        [x3, y3] = self.ps[2].xs
        return Abs((
            x1*(y2-y3) +
            x2*(y3-y1) +
            x3*(y1-y2)
            )/2 )

#
#
class Constant:
    def __init__(self, name):
        self.name = name
    def tostring(self): return str(self.name)
    __str__ = tostring; __repr__ = tostring

    def __mul__     (self, other): return Constant(f"({self.name} * {other})")
    def __truediv__ (self, other): return Constant(f"({self.name} / {other})")
    def __add__     (self, other): return Constant(f"({self.name} + {other})")
    def __sub__     (self, other): return Constant(f"({self.name} - {other})")
    def __rmul__    (self, other): return Constant(f"({other} * {self.name})")
    def __rtruediv__(self, other): return Constant(f"({other} / {self.name})")
    def __radd__    (self, other): return Constant(f"({other} + {self.name})")
    def __rsub__    (self, other): return Constant(f"({other} - {self.name})")

Pi = Constant("Pi")

#
#
class Rational:
    def __init__(self, num, den):
        self.num = num
        self.den = den

    def __mul__(self, other):
        return Rational(self.num*other.num,
            self.den*other.den)

    def __truediv__(self, other):
        return Rational(self.num*other.den,
            self.den*other.num)

    def __add__(self, other):
        return Rational(self.num*other.den + self.den*other.num,
            self.den*other.den)

    def __sub__(self, other):
        return -1 * self + other

    def tostring(self): return f"{self.num}/{self.den}"
    __str__ = tostring; __repr__ = tostring

def R(n,d): return Rational(n,d)

#
#
class Unary:
    name = ""
    def __init__(self, x): self.x = x
    def tostring(self): return f"{self.name}[{self.x}]"
    __str__ = tostring; __repr__ = tostring

    def __mul__     (self, other): return Constant(f"({self} * {other})")
    def __truediv__ (self, other): return Constant(f"({self} / {other})")
    def __add__     (self, other): return Constant(f"({self} + {other})")
    def __sub__     (self, other): return Constant(f"({self} - {other})")
    def __rmul__    (self, other): return Constant(f"({other} * {self})")
    def __rtruediv__(self, other): return Constant(f"({other} / {self})")
    def __radd__    (self, other): return Constant(f"({other} + {self})")
    def __rsub__    (self, other): return Constant(f"({other} - {self})")

class Sin(Unary): name = "Sin"
class Cos(Unary): name = "Cos"
class Abs(Unary): name = "Abs"

#
#
def circle_point(r):
    return Point([ Cos(r) , Sin(r) ])

#
#
class PolygonRegular(Polygon):
    def __init__(self, n):
        super().__init__([ circle_point(2*Pi * R(i,n))
            for i in range(n)])

#
#
def product(xs):
    prod = 1
    for x in xs: prod *= x
    return prod