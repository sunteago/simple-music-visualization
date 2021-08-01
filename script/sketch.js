let song, fft, analyzer;
const MAX_FFT_VOLUME = 255;
const MAX_TRIANGLES = 5;
const TRANSITION_STEP = 0.001;
let offsets = new Array(MAX_TRIANGLES).fill(0);

function setup() {
  createCanvas(1280, 720);
  song = loadSound("assets/music.mp3", onLoad);

  fft = new p5.FFT();
  fft.setInput(song);

  analyzer = new p5.Amplitude();
  analyzer.setInput(song);

  // Set random offsets for noise
  offsets = offsets.map(() => new Array(5).fill(0).map(Math.random));
}

function onLoad() {
  song.play();
}

function draw() {
  background(20);

  // Update offsets
  offsets.forEach((offset, index) => {
    offsets[index] = offset.map((o) => (o += TRANSITION_STEP));
  });

  const amplitude = analyzer.getLevel();
  const spectrum = simplify(fft.analyze());
  const pitchDistribution = getPitchDistribution(spectrum);

  noStroke();
  for (let i = 0; i < MAX_TRIANGLES; i++) {
    const [o1, o2, o3, o4, o5] = offsets[i];

    const n1 = noise(o1) * width;
    const n2 = noise(o2) * width;
    const n3 = noise(o3) * height;
    const n4 = noise(o4) * height;

    colorMode(HSB, 360, 100, 100);
    const colorToPaint = pitchDistribution * noise(o5) * 600 * (1 / (i + 1));

    const triangleColor = color(colorToPaint, 60, 60, amplitude * 80);
    fill(triangleColor);

    // Triangle from centre
    triangle(width / 2, height / 2, n1, n3, n2, n4);
  }
}
function touchStarted() {
  getAudioContext().resume();
}

function simplify(spectrum) {
  const step = 10;
  const newSpectrum = [];

  for (let i = 0; i < spectrum.length / step; i++) {
    newSpectrum.push(spectrum[i]);
  }

  return newSpectrum;
}

// returns number between 0 and 1 indicating which pitch is more present
// being 0 low notes, and 1 high notes
function getPitchDistribution(spectrum) {
  let energy = 0;
  const maxEnergy = MAX_FFT_VOLUME * spectrum.length; // 10000

  for (const entry of spectrum) {
    energy += entry;
  }

  return energy / maxEnergy;
}
