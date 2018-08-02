#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
# Installed Imports
#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
#
#
from copy import deepcopy

#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
# Relative Imports
#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
#
#
import binary

"""**********************************************

    _Defining_ the (binary) Tree

**********************************************"""

#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
# Node
#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
#
#
class Node:
    def __init__(self, value=None, left=None, right=None):
        self.value = value
        self.left = left
        if left: left.parent = self
        self.right = right
        if right: right.parent = self

    def tostring(self):
        if not (self.left or self.right):
            return str(self.value) if self.value else "()"
        else:
            s = "( "
            s += str(self.left) if self.left else ""
            s += " , " if (self.left and self.right) else ""
            s += str(self.right) if self.right else ""
            return s + " )"
    __str__ = tostring
    __repr__ = tostring

    # number of descendants
    def length(self):
        if not (self.left or self.right): return 1
        else: return len(self.left) + len(self.right)
    __len__ = length

    def leaves(self):
        if self.value: return 1
        else:
            return ( (self.left.leaves() if self.left else 0) +
                (self.right.leaves() if self.right else 0) )

    def get_node_at_path(self, path):
        if len(path) == 0: return self
        step = path[0]
        path = path[1:]
        if step and self.left:
            return self.left.get_node_at_path(path)
        elif self.right:
            return self.right.get_node_at_path(path)

    @classmethod
    def make_full_node_to_level(cls, lvl):
        if lvl >= 0: return cls(None,
            cls.make_full_node_to_level(lvl-1),
            cls.make_full_node_to_level(lvl-1))

#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
# Tree
#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
#
#
class Tree:
    def __init__(self, root):
        self.root = root

    @classmethod
    def fromstring(cls, string):
        string = string.replace(" ","")
        parent = Node()
        side = [True]
        i = 1
        lvl = 0
        for c in string:
            if c == "|":
                node = Node()
                node.parent = parent
                if side[lvl]: parent.left = node
                else: parent.right = node
                side[lvl] = not side[lvl]
            if c == "*":
                node = Node(i)
                node.parent = parent
                if side[lvl]: parent.left = node
                else: parent.right = node
                i += 1
                side[lvl] = not side[lvl]
            elif c == "(":
                node = Node()
                node.parent = parent
                if side[-1]: parent.left = node
                else: parent.right = node
                parent = node
                side.append(True)
                lvl += 1
            elif c == ")":
                parent = parent.parent
                lvl -= 1
                side[lvl] = not side[lvl]

        return Tree(parent)
    
    def tostring(self):
        return str(self.root)
    __str__ = tostring
    __repr__ = tostring
    
    def length(self):
        return len(self.root)
    __len__ = length

    def leaves(self):
        return self.root.leaves()

    def get_path_to(self, v):
        def helper(n):
            if n.value == v:
                return [n]
            elif n.left or n.right:
                if n.left:
                    p = helper(n.left)
                    if p: return [n] + p
                if n.right:
                    p = helper(n.right)
                    if p: return [n] + p
        return helper(self.root)

    def get_earliest_ancestor(self, v1, v2):
        p1 = self.get_path_to(v1)
        p2 = self.get_path_to(v2)
        for i in range(1,len(p1)):
            s1 = p1[i]
            s2 = p2[i] if i<len(p2) else False
            if s1 != s2: return p1[i-1]

    def vl(self, i): return len(self.get_earliest_ancestor(i, i+1).left)
    def vr(self, i): return len(self.get_earliest_ancestor(i, i+1).right)

    def get_point(self):
        return [ self.vl(i)*self.vr(i) for i in range(1,self.leaves()) ]

    def get_node_at_path(self, path):
        return self.root.get_node_at_path(path)

    def get_nodes_at_level(self, lvl):
        if lvl == 0: return [self.root]
        paths = [ binary.dec_to_binarr(i,lvl) for i in range(2**lvl) ]
        print(paths)
        return [ self.get_node_at_path(path)
            for path in paths
            if self.get_node_at_path(path) ]

    @classmethod
    def make_full_tree_to_level(cls, lvl):
        return cls(Node.make_full_node_to_level(lvl))


t = Tree.fromstring("( * ( * ( * * ) ) )")
ns = t.get_nodes_at_level(3)
print("tree:",t)
print("nodes:",ns)

"""**********************************************

    _Generating_ all possible Trees

**********************************************"""

# def generate_trees_at_level(lvl):
#     ts = []
#     choices = [ binary.dec_to_binarr(i) for i in range(2**lvl) ]
#     for arr in choices:
#         t = Tree.make_full_tree_to_level(lvl-1)
#         ns = t.get_nodes_at_level(lvl-1)
#         for i in arr:
#             m = 
#             if i 

#     return ts