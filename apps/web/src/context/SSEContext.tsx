import React, { createContext, useContext, useCallback, useRef, ReactNode } from 'react';
import { BASE_API_URL } from '../api/api.constant';

type EventCallback = (event: MessageEvent) => void;

interface SSEContextType {
  subscribe: (eventType: string, callback: EventCallback) => void;
  unsubscribe: (eventType: string, callback: EventCallback) => void;
  isConnected: boolean;
}

const SSEContext = createContext<SSEContextType | null>(null);

interface SSEProviderProps {
  children: ReactNode;
}

export const SSEProvider = ({ children }: SSEProviderProps) => {
  // 이벤트 핸들러들을 저장할 ref
  const handlersRef = useRef<{ [key: string]: Set<EventCallback> }>({});
  const eventSourceRef = useRef<EventSource | null>(null);

  // 이벤트 발생 시 해당 타입의 모든 콜백 실행
  const handleEvent = useCallback((eventType: string, event: MessageEvent) => {
    const handlers = handlersRef.current[eventType];
    if (handlers) {
      handlers.forEach((callback) => callback(event));
    }
  }, []);

  // 각 이벤트 타입별 핸들러를 메모이제이션
  const handleChatTitle = useCallback((event: MessageEvent) => handleEvent('chatTitle', event), [handleEvent]);
  const handleChatMessage = useCallback((event: MessageEvent) => handleEvent('chatMessage', event), [handleEvent]);

  // SSE 연결 설정
  React.useEffect(() => {
    const eventSource = new EventSource(`${BASE_API_URL}/api/sse`, {
      withCredentials: true,
    });
    eventSourceRef.current = eventSource;

    // 이벤트 리스너 등록
    eventSource.addEventListener('chatTitle', handleChatTitle);
    eventSource.addEventListener('chatMessage', handleChatMessage);

    eventSource.onerror = (error) => {
      console.error('SSE 연결 에러:', error);
    };

    return () => {
      // 이벤트 리스너 해제
      eventSource.removeEventListener('chatTitle', handleChatTitle);
      eventSource.removeEventListener('chatMessage', handleChatMessage);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [handleChatTitle, handleChatMessage]); // 메모이제이션된 핸들러를 의존성 배열에 추가

  // 이벤트 구독
  const subscribe = useCallback((eventType: string, callback: EventCallback) => {
    if (!handlersRef.current[eventType]) {
      handlersRef.current[eventType] = new Set();
    }
    handlersRef.current[eventType].add(callback);
  }, []);

  // 구독 해제
  const unsubscribe = useCallback((eventType: string, callback: EventCallback) => {
    const handlers = handlersRef.current[eventType];
    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        delete handlersRef.current[eventType];
      }
    }
  }, []);

  return (
    <SSEContext.Provider
      value={{
        subscribe,
        unsubscribe,
        isConnected: !!eventSourceRef.current,
      }}
    >
      {children}
    </SSEContext.Provider>
  );
};

// 커스텀 훅으로 Context 사용을 편리하게 만듦
export const useSSEEvent = (eventType: string, callback: EventCallback) => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSEEvent must be used within SSEProvider');
  }

  React.useEffect(() => {
    context.subscribe(eventType, callback);
    return () => {
      context.unsubscribe(eventType, callback);
    };
  }, [eventType, callback, context]);

  return context.isConnected;
};
