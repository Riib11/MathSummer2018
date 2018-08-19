class T_Node:

    def __init__(self, value, left, right, swings):
        self.value = value
        self.left = left
        self.right = right
        self.swings = swings

class T_Tree:

    def __init__(self, root, N=None):
        self.root = root
        self.N = N