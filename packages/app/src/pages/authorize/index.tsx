import { View, Text, Image, Input, Button } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useAuth } from '../../context/AuthContext';
import { uploadApi } from '../../api/upload';
import { AgreementCheckbox } from '../../components/agreement';
import { storage, STORAGE_KEYS } from '../../adapters/storage';
import './index.scss';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNUYwRUI4Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMjAiIGZpbGw9IiNENUE1QTYiLz48cGF0aCBkPSJNNTAsMzBjMTYuNTc3LDkuMjY3LDI2LjQ2NywyMCwyNi40NjcsNDBzLTkuODksMzAuNzMzLTI2LjQ2NywzMEMzMy40MjMsNjkuNzMzLDIzLjUzMyw2MCw1MCw2MHMxNi41NzctOS4yNjcsMjYuNDY3LTIwLTI2LjQ2Ny0zMHptMCwzMGMyNS41NzMsMTUuMjY3LDQxLjQ2NywyNS41NzMsNDEuNDY3LDQwcy0xNS44OSwyNC43MzMtNDEuNDY3LDQwYy0yNS41NzMtMTUuMjY3LTQxLjQ2Ny0yNS41NzMtNDEuNDY3LTQwUzI0LjQyNyw2NC43MzMsNTAsNzBzMjUuNTczLTE1LjI2NywyNi40NjctNDBTMzMuNDIzLDQ1LjI2Nyw1MCw1MHoiIGZpbGw9InVybCgjY29sb3IxKSIvPjx1cmwgaWQ9ImNvbG9yMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0Q1QTVBNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U2NjY2NiIvPjwvdXJsPjwvc3ZnPg==';

function getFullAvatarUrl(avatar: string): string {
  if (!avatar) return DEFAULT_AVATAR;
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

  // 如果已登录且已完善资料，直接跳转首页
  useEffect(() => {
    if (isLoggedIn && hasProfile) {
      Taro.switchTab({ url: '/pages/home/index' });
    }
  }, [isLoggedIn, hasProfile]);

  const handleChooseAvatar = (e: any) => {
    const { avatarUrl } = e.detail;
    setAvatar(avatarUrl);
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
      
      // 保存协议同意状态
      storage.set(STORAGE_KEYS.AGREEMENT_ACCEPTED, {
        accepted: true,
        acceptedAt: new Date().toISOString(),
      });
      
      if (!isLoggedIn) {
        await loginWithWeapp();
      }
      
      const finalNickname = nickname.trim() || '易友' + Math.floor(Math.random() * 10000);
      let finalAvatar = avatar;
      
      // 如果是临时文件，需要先上传
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
      
      // 保存协议同意状态
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

  return (
    <View className="authorize-page">
      <View className="authorize-page__brand">
        <Text className="authorize-page__logo">易伴</Text>
        <Text className="authorize-page__subtitle">设置你的专属形象</Text>
      </View>

      <View className="authorize-page__form">
        <Button
          className="authorize-page__avatar-btn"
          openType="chooseAvatar"
          onChooseAvatar={handleChooseAvatar}
        >
          <Image className="authorize-page__avatar" src={getFullAvatarUrl(avatar)} mode="aspectFill" />
          <Text className="authorize-page__avatar-hint">点击选择头像</Text>
        </Button>
 
        <Input
          className="authorize-page__input"
          type="nickname"
          placeholder="请输入昵称（可选）"
          value={nickname}
          onInput={handleNicknameInput}
          maxlength={20}
        />
      </View>

      <View className="authorize-page__agreement">
        <AgreementCheckbox checked={agreementChecked} onChange={setAgreementChecked} />
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
    </View>
  );
}
