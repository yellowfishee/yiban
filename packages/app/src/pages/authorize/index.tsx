import { View, Text, Image, Input, Button } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/AuthContext';
import { uploadApi } from '../../api/upload';
import { AgreementCheckbox } from '../../components/agreement';
import { storage, STORAGE_KEYS } from '../../adapters/storage';
import './index.scss';

const DEFAULT_AVATAR = '';

const isH5 = process.env.TARO_ENV === 'h5';

function getFullAvatarUrl(avatar: string): string {
  if (!avatar) return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUYwRUI4Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9IiNENUE1QTYiLz48L3N2Zz4=';
  if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('wxfile:')) return avatar;
  const baseUrl = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000';
  return baseUrl + avatar;
}

export default function AuthorizePage() {
  const { loginWithWeapp, updateProfile, isLoggedIn, hasProfile } = useAuth();
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn && hasProfile) {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  }, [isLoggedIn, hasProfile]);

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setAvatar(avatarUrl);
  };

  const handleH5AvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleNicknameInput = (e: any) => {
    setNickname(e.detail.value);
  };

  const handleComplete = async () => {
    if (!agreementChecked) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    
    try {
      setLoading(true);
      
      storage.set(STORAGE_KEYS.AGREEMENT_ACCEPTED, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
      });
      
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      
      const finalNickname = nickname.trim() || '易友' + Math.floor(Math.random() * 10000);
      let finalAvatar = avatar;
      
      if (avatar.startsWith('http://tmp') || avatar.startsWith('wxfile://')) {
        try {
          const uploadResult = await uploadApi.avatar(avatar);
          finalAvatar = uploadResult.url;
        } catch (e) {
          console.warn('Avatar upload failed, using default:', e);
          finalAvatar = DEFAULT_AVATAR;
        }
      }
      
      await updateProfile(finalNickname, finalAvatar);
      
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!agreementChecked) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    
    try {
      setLoading(true);
      
      storage.set(STORAGE_KEYS.AGREEMENT_ACCEPTED, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
      });
      
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      
      const randomNickname = '易友' + Math.floor(Math.random() * 10000);
      await updateProfile(randomNickname, DEFAULT_AVATAR);
      
      Taro.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderAvatarPicker = () => {
    if (isH5) {
      return (
        <View className="authorize-page__avatar-btn" onClick={() => fileInputRef.current?.click()}>
          <Image className="authorize-page__avatar" src={getFullAvatarUrl(avatar)} mode="aspectFill" />
          <Text className="authorize-page__avatar-hint">点击选择头像</Text>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleH5AvatarChange}
          />
        </View>
      );
    }
    
    return (
      <Button
        className="authorize-page__avatar-btn"
        openType="chooseAvatar"
        onChooseAvatar={handleChooseAvatar}
      >
        <Image className="authorize-page__avatar" src={getFullAvatarUrl(avatar)} mode="aspectFill" />
        <Text className="authorize-page__avatar-hint">点击选择头像</Text>
      </Button>
    );
  };

  return (
    <View className="authorize-page">
      <View className="authorize-page__brand">
        <Text className="authorize-page__logo">易伴</Text>
        <Text className="authorize-page__subtitle">设置你的专属形象</Text>
      </View>

      <View className="authorize-page__form">
        {renderAvatarPicker()}

        <Input
          className="authorize-page__input"
          type={isH5 ? 'text' : 'nickname'}
          placeholder="请输入昵称（可选）"
          value={nickname}
          onInput={handleNicknameInput}
          maxlength={20}
        />
      </View>

      <View className="authorize-page__actions">
        <Button
          className="authorize-page__btn authorize-page__btn--primary"
          onClick={handleComplete}
          disabled={loading || !agreementChecked}
        >
          完成
        </Button>
        <Button
          className="authorize-page__btn authorize-page__btn--skip"
          onClick={handleSkip}
          disabled={loading || !agreementChecked}
        >
          跳过
        </Button>
      </View>

      <View className="authorize-page__agreement">
        <AgreementCheckbox checked={agreementChecked} onChange={setAgreementChecked} />
      </View>
    </View>
  );
}
