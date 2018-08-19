from K6_edges import edges

with open("K6_edges.csv", "w+") as file:
    file.write("S;T\n")
    for e in edges:
        s = str(e[0]) + ";"
        s += str(e[1]) + "\n"
        file.write(s)

# i = 0
# def next_name():
#     global i
#     i += 1
#     return i

# # make names for each edge
# names_dict = {}
# for e in edges:
#     for v in e:
#         if str(v) not in names_dict:
#             names_dict[str(v)] = next_name()

