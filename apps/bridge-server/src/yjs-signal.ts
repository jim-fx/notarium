import { setIfUndefined } from "@notarium/common";
import type WebSocket from "ws";

const wsReadyStateConnecting = 0;
const wsReadyStateOpen = 1;

const pingTimeout = 30000;

/**
 * Map froms topic-name to set of subscribed clients.
 */
const topics: Map<string, Set<any>> = new Map();

const send = (conn: WebSocket, message: object) => {
  if (
    conn.readyState !== wsReadyStateConnecting &&
    conn.readyState !== wsReadyStateOpen
  ) {
    conn.close();
  }
  try {
    conn.send(JSON.stringify(message));
  } catch (e) {
    conn.close();
  }
};

/**
 * Setup a new client
 */
export const handleConnection = (conn: WebSocket) => {
  const subscribedTopics: Set<string> = new Set();
  let closed = false;
  // Check if connection is still alive
  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      conn.close();
      clearInterval(pingInterval);
    } else {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        conn.close();
      }
    }
  }, pingTimeout);
  conn.on("pong", () => {
    pongReceived = true;
  });
  conn.on("close", () => {
    subscribedTopics.forEach((topicName) => {
      const subs = topics.get(topicName) || new Set();
      subs.delete(conn);
      if (subs.size === 0) {
        topics.delete(topicName);
      }
    });
    subscribedTopics.clear();
    closed = true;
  });
  conn.on("message", (msg: Buffer) => {

    const message = JSON.parse(msg.toString("utf-8"));

    if (message && message.type && !closed) {
      switch (message.type) {
        case "subscribe":
          ((message.topics || []) as string[]).forEach(
            (topicName) => {
              if (typeof topicName === "string") {
                // add conn to topic
                const topic = setIfUndefined(
                  topics,
                  topicName,
                  () => new Set()
                );
                topic.add(conn);
                // add topic to conn
                subscribedTopics.add(topicName);
              }
            }
          );
          break;
        case "unsubscribe":
          /** @type {Array<string>} */ (message.topics || []).forEach(
          (topicName) => {
            const subs = topics.get(topicName);
            if (subs) {
              subs.delete(conn);
            }
          }
        );
          break;
        case "publish":
          if (message.topic) {
            const receivers = topics.get(message.topic);
            if (receivers) {
              receivers.forEach((receiver) => send(receiver, message));
            }
          }
          break;
        case "ping":
          send(conn, { type: "pong" });
      }
    }
  });
};

