class TreeNode:

    def __init__(self, parent):
        self.parent = parent
        self.children = []

    def tostring(self): return f"{self.children}"
    __str__ = tostring; __repr__ = tostring

    def get_depth(self):
        if len(self.children) > 0 and isinstance(self.children[0], TreeNode):
            return 1 + self.children[0].get_depth()
        else:
            return 1

    def __getitem__(self, i): return self.children[i]

def nestedlist_to_tree(ls, parent=None):
    # induction step
    if isinstance(ls, list):
        t = TreeNode(parent)
        f = lambda ls: nestedlist_to_tree(ls, t)
        t.children = list(map(f,ls))
        return t
    # base case
    else:
        return ls

def tree_to_nestedlist(t):
    if isinstance(t, TreeNode):
        return list(map(tree_to_nestedlist,t.children))
    else:
        return t

# t = nestedlist_to_tree([
#     [1,2],
#     [3,4]
# ])
# print(tree_to_nestedlist(t))
# print(t)