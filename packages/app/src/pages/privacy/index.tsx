import { View, Text } from '@tarojs/components';
import './index.scss';

export default function PrivacyPolicy() {
  return (
    <View className="agreement-page">
      <Text className="agreement-page__title">隐私政策</Text>
      <Text className="agreement-page__update">更新日期：2026年4月16日</Text>
      
      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">一、引言</Text>
        <Text className="agreement-page__section-content">
          易伴·卦象神兽（以下简称"我们"）非常重视用户隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。请您在使用我们的服务前仔细阅读本政策。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">二、信息收集</Text>
        <Text className="agreement-page__section-content">
          2.1 我们收集的信息类型：{'\n'}
          （1）账号信息：微信小程序登录时获取的 openid，用于标识用户身份；{'\n'}
          （2）使用记录：您的打卡记录、卦象记录等，用于提供服务功能；{'\n'}
          （3）设备信息：设备型号、操作系统版本等，用于优化服务体验。{'\n'}
          2.2 信息收集方式：{'\n'}
          我们通过您主动提供和自动收集的方式获取上述信息。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">三、信息使用</Text>
        <Text className="agreement-page__section-content">
          我们将收集的信息用于以下目的：{'\n'}
          3.1 提供、维护和改进我们的服务；{'\n'}
          3.2 向您提供个性化的内容和服务体验；{'\n'}
          3.3 保障服务的安全性和稳定性；{'\n'}
          3.4 遵守法律法规的要求。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">四、信息存储</Text>
        <Text className="agreement-page__section-content">
          4.1 存储地点：您的个人信息存储在中华人民共和国境内的服务器上。{'\n'}
          4.2 存储期限：我们在为您提供服务的期间内保留您的个人信息，当您注销账号或服务终止后，我们将删除或匿名化处理您的个人信息。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">五、信息保护</Text>
        <Text className="agreement-page__section-content">
          5.1 我们采用业界标准的安全措施保护您的个人信息，包括但不限于数据加密、访问控制等。{'\n'}
          5.2 如发生个人信息安全事件，我们将及时向您告知事件的基本情况、可能的影响、已采取或将要采取的处置措施等。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">六、用户权利</Text>
        <Text className="agreement-page__section-content">
          您对您的个人信息享有以下权利：{'\n'}
          6.1 访问权：您有权访问我们持有的您的个人信息；{'\n'}
          6.2 更正权：您有权要求我们更正不准确的个人信息；{'\n'}
          6.3 删除权：您有权要求我们删除您的个人信息；{'\n'}
          6.4 注销账号：您可以通过应用内的设置页面注销账号。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">七、未成年人保护</Text>
        <Text className="agreement-page__section-content">
          7.1 我们非常重视对未成年人个人信息的保护。{'\n'}
          7.2 如您是未成年人，请在监护人的陪同下阅读本政策，并在取得监护人同意后使用我们的服务。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">八、隐私政策更新</Text>
        <Text className="agreement-page__section-content">
          我们可能适时修订本隐私政策。修订后的政策将在本页面公示，建议您定期查阅。如您在政策更新后继续使用我们的服务，即表示您同意接受修订后的政策。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">九、联系我们</Text>
        <Text className="agreement-page__section-content">
          如您对本隐私政策有任何疑问或建议，可以通过应用内的反馈功能联系我们。
        </Text>
      </View>
    </View>
  );
}
