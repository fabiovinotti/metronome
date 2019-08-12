export const store = {
  audioContext: new ( window.AudioContext || webkit.AudioContext )()
};
