export function getClientIp(req) {
  const trustProxy = req.app.get("trust proxy");

  // Only trust headers if proxy is trusted
  if (trustProxy) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const first = forwarded.split(",")[0].trim();
      if (first) return normalizeIp(first);
    }

    const realIp = req.headers["x-real-ip"];
    if (realIp) {
      return normalizeIp(realIp.trim());
    }

    // Express already resolves IP correctly when trust proxy is ON
    if (req.ip) {
      return normalizeIp(req.ip);
    }
  }

  // No proxy → only trust direct socket
  const socketAddr = req.socket?.remoteAddress;
  if (socketAddr) {
    return normalizeIp(socketAddr);
  }

  return "unknown";
}

function normalizeIp(ip) {
  return ip.replace(/^::ffff:/, "");
}