import ast

class Node:

    def __init__(self, *args):
        if len(args) == 2:
            self.value = None
            self.left, self.right = args[0], args[1]
            self.is_leaf = False
        elif len(args) == 1:
            self.value = args[0]
            self.left, self.right = None, None
            self.is_leaf = True

    def tostring(self):
        s = ""
        if self.is_leaf:
            s += str(self.value) if self.value else "*"
        else:
            s += "( " + str(self.left) + " " + str(self.right) + " )"
        return s

    __str__ = tostring
    __repr__ = tostring

    @classmethod
    def make_full_node_to_level(cls, lvl):
        # base case
        if lvl == 0: return None
        # recursive case
        else: return cls( cls.make_full_node_to_level(lvl-1)
            , cls.make_full_node_to_level(lvl-1))

    def get_nodes_at_level(self, lvl):
        # base case
        if lvl == 0: return [self]
        # inductive step
        else:
            return (
                (self.left.get_nodes_at_level(lvl-1) if self.left else [])
                + (self.right.get_nodes_at_level(lvl-1) if self.right else [])
            )

    def get_children_count(self):
        # base case
        if self.is_leaf: return 1
        # induction step
        else: return self.left.get_children_count() + self.right.get_children_count()

    def get_nodes(self):
        # base case        
        if self.is_leaf: return []
        # induction step
        else: return [self] + self.left.get_nodes() + self.right.get_nodes()

    @classmethod
    def from_list(cls, arr):
        # base case
        if not isinstance(arr,list): return cls(arr)
        # inductive step
        else:
            return cls( cls.from_list(arr[0]),
                cls.from_list(arr[1]) )

    def get_path_to_node(self, v):
        # base case
        if self.value == v: return []
        # induction step
        else:
            if self.left or self.right:
                if self.left:
                    path_left = self.left.get_path_to_node(v)
                    if path_left != None: return ["left"] + path_left
                if self.right:
                    path_right = self.right.get_path_to_node(v)
                    if path_right != None: return ["right"] + path_right
            else:
                return None

    def get_node_at_path(self, path):
        # base case
        if len(path) == 0: return self
        # inductive step
        else:
            if "left"==path[0]: return self.left.get_node_at_path(path[1:])
            if "right"==path[0]: return self.right.get_node_at_path(path[1:])

    def rotate_right(self):
        left_new  = self.left.left
        right_new = Node( self.left.right , self.right )
        self.left = left_new
        self.right = right_new

class Tree:

    def __init__(self, root, N=None):
        self.root = root

    def tostring(self): return str(self.root)
    __str__ = tostring
    __repr__ = tostring

    @classmethod
    def make_full_tree_to_level(cls, lvl):
        return cls( Node.make_full_node_to_level(lvl) )

    def get_nodes_at_level(self, lvl):
        return self.root.get_nodes_at_level(lvl)

    def get_nodes(self):
        return self.root.get_nodes()

    @classmethod
    def from_list(cls, arr):
        return cls(Node( Node.from_list(arr[0]),
            Node.from_list(arr[1]) ))

    def get_earliest_ancestor(self, v1, v2):
        p1 = self.root.get_path_to_node(v1)
        p2 = self.root.get_path_to_node(v2)
        p = None
        for i in range(0,len(p1)):
            s1 = p1[i]
            s2 = p2[i] if i<len(p2) else False
            if s1 != s2:
                p = p1[:i]
                break
        return self.root.get_node_at_path(p)

    def vl(self, i): return self.get_earliest_ancestor( i , i+1 ).left.get_children_count()
    def vr(self, i): return self.get_earliest_ancestor( i , i+1 ).right.get_children_count()

    def get_point(self, n):
        return [ self.vl(i)*self.vr(i) for i in range(1,n) ]

def alltrees(leaves):
    if leaves == 1:
        yield "*"
    else:
        for i in range(1, leaves):
            for l in alltrees(leaves-i):
                for r in alltrees(i):
                    yield f"[{l},{r}]"

def number_leaves(s):
    result = ""
    x = 1
    for c in s:
        if c == "*":
            result += str(x)
            x += 1
        else:
            result += c
    return result

def generate_all_trees(leaves):
    ts = [number_leaves(t) for t in alltrees(leaves)]
    ts = [ast.literal_eval(t) for t in ts]
    return [Tree.from_list(t) for t in ts]

# n = 5
# print(len([ t for t in generate_all_trees(n) ]))
# print(str([t.get_point(n) for t in generate_all_trees(n)]))
# print(str([t.get_point(n) for t in generate_all_trees(n)]).replace("[","{").replace("]","}"))
  
#    /\
#   /\ \
#  / /\ \
# 1 2  3 4

# ( 1 ( ( 2 3 ) 4 ) )

#    /\
#   / /\
#  / /\ \
# 1 2  3 4