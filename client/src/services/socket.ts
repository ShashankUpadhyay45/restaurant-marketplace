import { SocketEventType, OrderStatus } from '../types';

type EventHandler = (payload: any) => void;

class RealtimeEventBus {
  private listeners: Map<SocketEventType, Set<EventHandler>> = new Map();

  // Subscribe to real-time events
  on(event: SocketEventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unbind function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off(event: SocketEventType, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  // Emit event internally (simulating incoming WebSocket frame from backend)
  emit(event: SocketEventType, payload: any): void {
    console.log(`[Realtime Socket Event: ${event}]`, payload);
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(fn => {
        try {
          fn(payload);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }

  // Simulated delivery progression helper:
  // Progresses an order through the lifecycle and emits socket events to update UI
  simulateOrderProgression(
    orderId: string, 
    onStatusChange?: (status: OrderStatus) => void
  ): () => void {
    const states: OrderStatus[] = [
      'CONFIRMED', 
      'PREPARING', 
      'READY_FOR_PICKUP', 
      'RIDER_ASSIGNED', 
      'PICKED_UP', 
      'OUT_FOR_DELIVERY', 
      'DELIVERED'
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < states.length) {
        const nextStatus = states[currentIndex];
        this.emit('order:statusChanged', { orderId, status: nextStatus });
        
        if (nextStatus === 'RIDER_ASSIGNED') {
          this.emit('order:assigned', {
            orderId,
            rider: {
              id: 'rider_01',
              name: 'Rajesh Kumar',
              phone: '+919822334455',
              vehicleNumber: 'UK 07 AF 4821',
              rating: 4.9
            }
          });
        } else if (nextStatus === 'PICKED_UP') {
          this.emit('delivery:pickedUp', { orderId });
        } else if (nextStatus === 'OUT_FOR_DELIVERY') {
          this.emit('delivery:locationUpdated', {
            orderId,
            lat: 30.3340 + Math.random() * 0.005,
            lng: 78.0580 + Math.random() * 0.005
          });
        } else if (nextStatus === 'DELIVERED') {
          this.emit('delivery:delivered', { orderId });
        }

        if (onStatusChange) {
          onStatusChange(nextStatus);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15000); // 15-second simulation ticks

    return () => clearInterval(interval);
  }
}

// Global Singleton instance
export const socketBus = new RealtimeEventBus();

// Legacy Socket.io wrapper compatibility:
// In production with a Node/Express backend, connect to window.location.origin
export function getClientSocket() {
  // TODO: Backend Integration Point: Real Socket.io Client
  // return io(window.location.origin, { reconnection: true });
  return {
    on: (event: string, cb: any) => socketBus.on(event as SocketEventType, cb),
    off: (event: string, cb: any) => socketBus.off(event as SocketEventType, cb),
    emit: (event: string, data: any) => socketBus.emit(event as SocketEventType, data),
    connected: true,
    id: 'mock_socket_client_001'
  };
}
