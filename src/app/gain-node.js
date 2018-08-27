export default class GainNode {
  constructor(deck) {
    if (!deck) return console.warn('Expected deck to be defined');
    const audioContext = deck.audioContext;
    const node = audioContext.createGain()

    deck.gainNode.connect(node)
    node.connect(audioContext.destination);

    node.gain.value = 0.5;

    return node;
  }
}
