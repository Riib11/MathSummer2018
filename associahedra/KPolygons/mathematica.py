def to_table(x):
    if isinstance(x, list):
        s = "{"
        s += ",".join([ to_table(xi) for xi in x ])
        s += "}"
        return s
    else:
        return str(x)