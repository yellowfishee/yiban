import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './AgreementCheckbox.scss';

interface AgreementCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function AgreementCheckbox({ checked, onChange }: AgreementCheckboxProps) {
  const handleToggle = () => {
    onChange(!checked);
  };

  const goToAgreement = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    Taro.navigateTo({ url: '/pages/agreement/index' });
  };

  const goToPrivacy = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    Taro.navigateTo({ url: '/pages/privacy/index' });
  };

  return (
    <View className="agreement-checkbox" onClick={handleToggle}>
      <View className={`agreement-checkbox__box ${checked ? 'agreement-checkbox__box--checked' : ''}`}>
        {checked && <Text className="agreement-checkbox__check">✓</Text>}
      </View>
      <Text className="agreement-checkbox__text">
        我已阅读并同意
        <Text className="agreement-checkbox__link" onClick={goToAgreement}>《用户服务协议》</Text>
        和
        <Text className="agreement-checkbox__link" onClick={goToPrivacy}>《隐私政策》</Text>
      </Text>
    </View>
  );
}
