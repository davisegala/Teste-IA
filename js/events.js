export const EventBus = {
    listeners: {},
    on(eventName, callback) {
        (this.listeners[eventName] ??= []).push(callback);
    },
    emit(eventName, payload) {
        (this.listeners[eventName] || []).forEach(cb => cb(payload));
    }
};