// Metrics module disabled for production builds due to prom-client import issues
// This module is only used at runtime and should not be imported at build time

export async function getRegister() {
  throw new Error("Metrics not available in this build");
}

export async function getHttpRequestDuration() {
  throw new Error("Metrics not available in this build");
}

export async function getHttpRequestTotal() {
  throw new Error("Metrics not available in this build");
}

export async function getActiveConnections() {
  throw new Error("Metrics not available in this build");
}

export async function getDatabaseQueryDuration() {
  throw new Error("Metrics not available in this build");
}

export async function getSocketConnections() {
  throw new Error("Metrics not available in this build");
}
