const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(num) {
  let shortCode = "";
  while (num > 0) {
    shortCode = chars[num % 62] + shortCode;
    num = Math.floor(num / 62);
  }
  return shortCode;
}

module.exports = encodeBase62;
