const compute = ({leftChannel, width, height, lines}) => {
  const length = leftChannel.length;
  const arr = []

  const blocks = Math.floor(length / lines);
  const between = width / lines;

  height = (height / 2) - (height / 4);
  for (var i = 0; i <= lines; i++) {
    const audioKey = Math.floor(blocks * i)
    const x = i * between;
    const y = leftChannel[audioKey] * height;
    arr.push([[x, y], [x, (y * -1)]]);
  }
  return arr;
}

onmessage = message => {
  postMessage(compute(message.data))
}
