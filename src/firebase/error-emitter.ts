
// A simple event emitter for handling specific application-wide errors,
// like Firestore permission denied errors.

type EventMap = {
  'permission-error': (error: any) => void;
  // Add other custom event types here
};

type EventName = keyof EventMap;

class Emitter {
  private listeners: { [K in EventName]?: Array<EventMap[K]> } = {};

  on<E extends EventName>(event: E, callback: EventMap[E]) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  off<E extends EventName>(event: E, callback: EventMap[E]) {
    if (!this.listeners[event]) return;
    const index = this.listeners[event]!.indexOf(callback);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
    }
  }

  emit<E extends EventName>(event: E, ...args: Parameters<EventMap[E]>) {
    if (!this.listeners[event]) return;
    // @ts-ignore
    this.listeners[event]!.forEach(callback => callback(...args));
  }
}

export const errorEmitter = new Emitter();
