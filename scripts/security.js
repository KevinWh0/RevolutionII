function mulberry32(a) {
  var t = (a += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function generateSeededPassword() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var seed = Math.floor(diff / oneDay) * 9550234;
  var s = "";
  for (var i = 0; i < 10 + (mulberry32(seed * 944) % 32); i++) {
    s += String.fromCharCode(
      97 + ((mulberry32(seed * 95051 * (i + 1)) * 100) % 26)
    );
  }
  console.log(s);
  return s;
}
