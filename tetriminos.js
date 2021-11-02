let tetriminos = [ // source: https://static.wikia.nocookie.net/tetrisconcept/images/3/3d/SRS-pieces.png/revision/latest/scale-to-width-down/336?cb=20060626173148
  [
    [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false],
      [false, false, true, false]
    ],
    [
      [false, false, false, false],
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, true, false, false]
    ]
  ],
  [
    [
      [true, false, false, false],
      [true, true, true, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, true, true, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, false, false, false]
    ],
    [
      [false, false, false, false],
      [true, true, true, false],
      [false, false, true, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [false, true, false, false],
      [true, true, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [false, false, true, false],
      [true, true, true, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [false, true, false, false],
      [false, true, true, false],
      [false, false, false, false]
    ],
    [
      [false, false, false, false],
      [true, true, true, false],
      [true, false, false, false],
      [false, false, false, false]
    ],
    [
      [true, true, false, false],
      [false, true, false, false],
      [false, true, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [true, true, false, false],
      [true, true, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [false, true, true, false],
      [true, true, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [false, true, true, false],
      [false, false, true, false],
      [false, false, false, false]
    ],
    [
      [false, false, false, false],
      [false, true, true, false],
      [true, true, false, false],
      [false, false, false, false]
    ],
    [
      [true, false, false, false],
      [true, true, false, false],
      [false, true, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [false, true, false, false],
      [true, true, true, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [false, true, true, false],
      [false, true, false, false],
      [false, false, false, false]
    ],
    [
      [false, false, false, false],
      [true, true, true, false],
      [false, true, false, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [true, true, false, false],
      [false, true, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [true, true, false, false],
      [false, true, true, false],
      [false, false, false, false],
      [false, false, false, false]
    ],
    [
      [false, false, true, false],
      [false, true, true, false],
      [false, true, false, false],
      [false, false, false, false]
    ],
    [
      [false, false, false, false],
      [true, true, false, false],
      [false, true, true, false],
      [false, false, false, false]
    ],
    [
      [false, true, false, false],
      [true, true, false, false],
      [true, false, false, false],
      [false, false, false, false]
    ]
  ],
]
