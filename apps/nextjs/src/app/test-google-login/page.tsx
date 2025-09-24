"use client";

import { useState, useEffect } from "react";
import { signIn, SignInResponse } from "next-auth/react";

export default function TestGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SignInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);

  useEffect(() => {
    // 检查环境变量
    setEnvInfo({
      clientId: process.env.GOOGLE_CLIENT_ID ? '已设置' : '未设置',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '未设置',
      proxy: {
        http: process.env.HTTP_PROXY,
        https: process.env.HTTPS_PROXY,
        all: process.env.ALL_PROXY
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log("开始Google登录测试...");
      console.log("环境信息:", envInfo);
      
      const res = await signIn("google", {
        callbackUrl: "/zh/dashboard",
        redirect: false
      });
      
      console.log("登录结果:", res);
      setResult(res || null);
      
      if (!res) {
        setError("登录函数返回 undefined，可能是网络连接问题或配置错误");
        return;
      }
      
      if (res?.error) {
        setError(`登录错误: ${res.error}`);
      } else if (res?.url) {
        // 成功获取URL，可以重定向
        window.location.href = res.url;
      } else {
        setError("登录过程异常：未返回错误也未返回重定向URL");
      }
    } catch (err: any) {
      console.error("登录异常:", err);
      setError(`异常: ${err.message || "未知错误"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Google登录测试页面</h1>
      
      <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0" }}>
        <h2>环境信息</h2>
        {envInfo ? (
          <pre>{JSON.stringify(envInfo, null, 2)}</pre>
        ) : (
          <p>正在加载环境信息...</p>
        )}
      </div>
      
      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "登录中..." : "测试Google登录"}
      </button>
      
      {error && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#ffebee", color: "#c62828" }}>
          <h2>错误信息:</h2>
          <pre>{error}</pre>
        </div>
      )}
      
      {result && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
          <h2>登录结果:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}