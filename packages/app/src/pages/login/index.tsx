import { View, Text, Input, Button } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../context/AuthContext';
import { AgreementCheckbox } from '../../components/agreement';
import './index.scss';

/**
 * 检测是否在微信浏览器中
 */
function isWechatBrowser(): boolean {
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
  }
  return false;
}

/**
 * 检测是否在小程序环境
 */
function isMiniProgram(): boolean {
  return Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
}

export default function LoginPage() {
  const {
    loginWithWechatH5,
    loginWithPhone,
    sendPhoneCode,
    isLoggedIn,
  } = useAuth();
  
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const showWechatLogin = isWechatBrowser() && !isMiniProgram();
  
  // 处理微信 H5 登录回调
  useEffect(() => {
    const { code: wechatCode } = router.params;
    if (wechatCode && showWechatLogin) {
      // 微信授权回调，自动登录
      handleWechatCallback(wechatCode);
    }
  }, [router.params]);
  
  // 已登录则跳转到首页
  useEffect(() => {
    if (isLoggedIn) {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  }, [isLoggedIn]);
  
  // 清理倒计时
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  /**
   * 处理微信登录
   */
  const handleWechatLogin = async () => {
    try {
      setLoading(true);
      await loginWithWechatH5();
      // loginWithWechatH5 会自动跳转到微信授权页
    } catch (error) {
      Taro.showToast({
        title: '微信登录失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 处理微信 H5 回调
   */
  const handleWechatCallback = async (code: string) => {
    try {
      setLoading(true);
      const { authApi } = await import('../../api/auth');
      const response = await authApi.wechatH5Callback(code);
      
      // 保存 token
      const { storage, STORAGE_KEYS } = await import('../../adapters/storage');
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.USER_ID, response.user.id);
      
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
      });
      
      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: '登录失败',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    if (countdown > 0) return;
    
    // 验证手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
      });
      return;
    }
    
    try {
      await sendPhoneCode(phone);
      Taro.showToast({
        title: '验证码已发送',
        icon: 'success',
      });
      
      // 开始倒计时
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: '发送失败，请重试',
        icon: 'error',
      });
    }
  };
  
  /**
   * 手机号登录
   */
  const handlePhoneLogin = async () => {
    if (!phone || !code) {
      Taro.showToast({
        title: '请输入手机号和验证码',
        icon: 'none',
      });
      return;
    }
    
    try {
      setLoading(true);
      await loginWithPhone(phone, code);
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
      });
      
      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' });
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="login-page">
      {/* 品牌区域 */}
      <View className="login-page__brand">
        <Text className="login-page__logo">易伴·卦象神兽</Text>
        <Text className="login-page__tagline">☯ 梅花易数 · 今日灵感</Text>
      </View>

      {/* 微信登录 */}
      {showWechatLogin && (
        <View className="login-page__wechat">
          <Button
            className="login-page__btn login-page__btn--wechat"
            onClick={handleWechatLogin}
            disabled={loading || !agreementChecked}
          >
            微信登录
          </Button>
        </View>
      )}

      {/* 分隔线 */}
      {showWechatLogin && (
        <View className="login-page__divider">
          <View className="login-page__divider-line" />
          <Text className="login-page__divider-text">或</Text>
          <View className="login-page__divider-line" />
        </View>
      )}

      {/* 协议勾选 */}
      <View className="login-page__agreement">
        <AgreementCheckbox checked={agreementChecked} onChange={setAgreementChecked} />
      </View>

      {/* 手机号登录 */}
      <View className="login-page__form">
        <Text className="login-page__form-title">手机号登录</Text>
        
        <Input
          className="login-page__input"
          type="number"
          placeholder="请输入手机号"
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
          maxlength={11}
        />
        
        <View className="login-page__code-row">
          <Input
            className="login-page__input login-page__input--code"
            type="number"
            placeholder="验证码"
            value={code}
            onInput={(e) => setCode(e.detail.value)}
            maxlength={6}
          />
          <Button
            className="login-page__btn login-page__btn--code"
            onClick={handleSendCode}
            disabled={countdown > 0 || loading}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </Button>
        </View>

        <Button
          className="login-page__btn login-page__btn--primary"
          onClick={handlePhoneLogin}
          disabled={loading || !agreementChecked}
        >
          登录
        </Button>
      </View>
    </View>
  );
}
