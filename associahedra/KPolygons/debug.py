column_widths = [20, 50]
column_buffer_string = "  "

def get_column_width(col_i):
    if col_i < len(column_widths):
        return column_widths[col_i]
    else:
        return column_widths[-1]

def buffer_column_right(s, col_i):
    column_width = get_column_width(col_i)
    while len(s) < column_width:
        s += " "
    return s

def format_column(o, col_i):
    column_width = get_column_width(col_i)
    s = str(o)
    lines = [""]
    for w in s.split():
        if len(lines[-1] + w) < column_width:
            lines[-1] += w + " "
        else:
            lines.append(w + " ")
    return lines


def log(*xs):
    """
    the organization format is like so:

    columns         : [column]
    columns[i]      : [line of column]

    columns =
    [
        ["fits on a single line"],  # column 1
        ["doesn't quite fit on a"   # column 2
        ,"single line, so had to go and"
        ,"make it three lines"]
    ]

    """
    columns = [None for _ in range(len(xs))]
    for i in range(len(xs)):
        columns[i] = format_column(xs[i], i)

    lines_max = max([ len(col) for col in columns])

    for line_i in range(lines_max):
        for col_i in range(len(columns)):
            col = columns[col_i]
            col = col[line_i] if line_i < len(col) else ""
            print(buffer_column_right(col, col_i)
                + column_buffer_string, end="")
        print()
    print()