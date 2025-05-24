import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { BASE_API_URL } from '../api/api.constant';

type EventCallback = (event: MessageEvent) => void;

interface EventHandlers {
  [key: string]: EventCallback;
}

interface UseSSEOptions {
  handlers: EventHandlers;
  onError?: (error: Event) => void;
}

export const useSSE = ({ handlers, onError }: UseSSEOptions) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const location = useLocation();

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_API_URL}/api/sse`, {
      withCredentials: true,
    });
    eventSourceRef.current = eventSource;

    // 각 이벤트 타입별로 리스너 등록
    Object.entries(handlers).forEach(([eventType, callback]) => {
      eventSource.addEventListener(eventType, callback);
    });

    if (onError) {
      eventSource.onerror = onError;
    }

    return () => {
      // 등록된 모든 이벤트 리스너 제거
      Object.entries(handlers).forEach(([eventType, callback]) => {
        eventSource.removeEventListener(eventType, callback);
      });

      if (onError) {
        eventSource.onerror = null;
      }
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [handlers, location.pathname]); // handlers가 변경되거나 페이지 이동 시 재연결

  // 수동으로 연결을 종료할 수 있는 함수 제공
  const closeConnection = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return {
    closeConnection,
    eventSource: eventSourceRef.current,
  };
};
