import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import AgreementCheckbox from './AgreementCheckbox';
import './AgreementModal.scss';

interface AgreementModalProps {
  visible: boolean;
  onConfirm: () => void;
}

export default function AgreementModal({ visible, onConfirm }: AgreementModalProps) {
  const [checked, setChecked] = useState(false);

  const handleConfirm = () => {
    if (!checked) {
      Taro.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }
    onConfirm();
  };

  if (!visible) return null;

  return (
    <View className="agreement-modal">
      <View className="agreement-modal__mask" />
      <View className="agreement-modal__container">
        <Text className="agreement-modal__title">用户协议与隐私政策</Text>
        <Text className="agreement-modal__desc">
          欢迎使用易伴·卦象神兽！在使用我们的服务前，请您仔细阅读并同意以下协议：
        </Text>
        <View className="agreement-modal__content">
          <AgreementCheckbox checked={checked} onChange={setChecked} />
        </View>
        <View 
          className={`agreement-modal__btn ${checked ? 'agreement-modal__btn--active' : ''}`}
          onClick={handleConfirm}
        >
          <Text className="agreement-modal__btn-text">同意并继续</Text>
        </View>
      </View>
    </View>
  );
}
