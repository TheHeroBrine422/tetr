let tetriminos = [ // source: https://static.wikia.nocookie.net/tetrisconcept/images/3/3d/SRS-pieces.png/revision/latest/scale-to-width-down/336?cb=20060626173148
  [
    [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false]
    ]
  ],
  [
    [
      [true, false, false],
      [true, true, true],
      [false, false, false]
    ]
  ],
  [
    [
      [false, false, true],
      [true, true, true],
      [false, false, false]
    ]
  ],
  [
    [
      [true, true],
      [true, true]
    ]
  ],
  [
    [
      [false, true, true],
      [true, true, false],
      [false, false, false]
    ]
  ],
  [
    [
      [false, true, false],
      [true, true, true],
      [false, false, false]
    ]
  ],
  [
    [
      [true, true, false],
      [false, true, true],
      [false, false, false]
    ]
  ],
]


function rotateArr(arr) {
  out = arr[0].map((_, colIndex) => arr.map(row => row[colIndex]));
  for (var i = 0; i < out.length; i++) {
		out[i] = out[i].reverse()
  }
  return out
}

for (var i = 0; i < tetriminos.length; i++) {
  for (var j = 1; j < 4; j++) {
    temp = JSON.parse(JSON.stringify(tetriminos[i][0]))
    for (var k = 0; k < j; k++) {
      temp = rotateArr(temp)
    }
    tetriminos[i].push(temp)
  }
}
