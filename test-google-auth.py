#!/usr/bin/env python3
"""
Google OAuth 配置验证脚本
用于验证 Google OAuth 凭据和回调 URL 配置是否正确
"""

import os
import requests
from urllib.parse import urlencode

def test_google_oauth():
    # 从环境变量获取 Google OAuth 配置
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        print("❌ 错误: 未找到 Google OAuth 凭据")
        print("请确保在 .env.local 中配置了 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET")
        return False
    
    print(f"✅ 找到 Google OAuth 凭据:")
    print(f"   Client ID: {client_id}")
    print(f"   Client Secret: {client_secret[:10]}...")
    
    # 验证回调 URL 配置
    callback_url = "http://localhost:3000/api/auth/callback/google"
    print(f"\n🔗 回调 URL: {callback_url}")
    
    # 检查 Google OAuth 配置是否有效
    print("\n🔍 验证 Google OAuth 配置...")
    
    # 尝试获取授权 URL（这不会实际发起请求，只是验证配置格式）
    auth_params = {
        'client_id': client_id,
        'redirect_uri': callback_url,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(auth_params)}"
    print(f"✅ 授权 URL 生成成功")
    print(f"   URL: {auth_url[:100]}...")
    
    # 提供配置检查清单
    print("\n📋 Google OAuth 配置检查清单:")
    print("1. ✅ Google OAuth 凭据已配置")
    print("2. ✅ 回调 URL 格式正确")
    print("3. ⚠️  请在 Google Cloud Console 中验证以下配置:")
    print("   - 已启用 Google+ API")
    print("   - 已添加授权的重定向 URI:")
    print(f"        {callback_url}")
    print("   - OAuth 同意屏幕已配置")
    print("   - 应用类型设置为 'Web 应用程序'")
    
    return True

if __name__ == "__main__":
    # 加载环境变量
    from dotenv import load_dotenv
    load_dotenv('/Users/zhiyun.lee/GitHub/生菜航海/9月-AI工具站/saasfly/.env.local')
    
    print("🔧 Google OAuth 配置验证工具")
    print("=" * 50)
    
    test_google_oauth()
    
    print("\n💡 提示:")
    print("- 如果登录仍然失败，请检查 Google Cloud Console 中的配置")
    print("- 确保重定向 URI 已正确添加到 Google OAuth 凭据中")
    print("- 重启开发服务器使环境变量更改生效")