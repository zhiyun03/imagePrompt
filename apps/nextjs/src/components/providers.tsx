"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // 每5分钟自动刷新session
      refetchOnWindowFocus={true} // 窗口聚焦时刷新session
      keepAlive={true} // 保持session活跃
    >
      <SessionDebugger />
      {children}
    </SessionProvider>
  );
}

// 添加session调试组件
function SessionDebugger() {
  useEffect(() => {
    // 监听session变化
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nextauth.message') {
        console.log('🔄 Session updated from storage event');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}