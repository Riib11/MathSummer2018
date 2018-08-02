from tree import *

vertices = [
    
    # a
    [   
        1,
        [
            [2,3],
            [4,5]
        ]
    ],

    # b
    [
        1,
        [
            2,
            [
                3,
                [4,5]
            ]
        ]
    ],

    # c
    [
        [
            1,
            [2,3]
        ],
        [4,5]
    ],

    # d
    [
        1,
        [
            [
                [2,3],
                4
            ],
            5
        ]
    ],

    # e
    [
        1,
        [
            [
                2,
                [3,4]
            ],
            5
        ]
    ],

    # f
    [
        1,
        [
            2,
            [
                [3,4],
                5
            ]
        ]
    ],

    # g
    [
        [1,2],
        [
            3,
            [4,5]
        ]
    ],

    # h
    [
        [
            [1,2],
            3
        ],
        [4,5]
    ],

    # i
    [
        [
            [
                1,
                [2,3]
            ],
            4
        ],
        5
    ],

    # j
    [
        [
            1,
            [
                [2,3],
                4
            ]
        ],
        5
    ],

    # k
    [
        [
            1,
            [
                2,
                [3,4]
            ]
        ],
        5
    ],

    # l
    [
        [1,2],
        [
            [3,4],
            5
        ]
    ],

    # m
    [
        [
            [
                [1,2],
                3
            ],
            4
        ],
        5
    ],

    # n
    [
        [
            [1,2],
            [3,4]
        ],
        5
    ]

]

vertices = [Tree.from_list(v) for v in vertices]
points = [v.get_point(5) for v in vertices]

for i in range(len(vertices)):
    # print(vertices[i],"//",points[i],"//",sum(points[i]))
    print(str(points[i]).replace("[","{").replace("]","},"))