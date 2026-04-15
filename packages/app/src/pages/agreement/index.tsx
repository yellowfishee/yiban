import { View, Text } from '@tarojs/components';
import './index.scss';

export default function UserAgreement() {
  return (
    <View className="agreement-page">
      <Text className="agreement-page__title">用户服务协议</Text>
      <Text className="agreement-page__update">更新日期：2026年4月16日</Text>
      
      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">一、总则</Text>
        <Text className="agreement-page__section-content">
          1.1 欢迎您使用易伴·卦象神兽服务（以下简称"本服务"）。本服务由易伴团队提供，旨在为用户提供基于国学文化的灵感启发内容。{'\n'}
          1.2 您在使用本服务前，应当认真阅读并遵守本协议。一旦您使用本服务，即视为您已充分理解并同意接受本协议的全部内容。{'\n'}
          1.3 我们有权在必要时修改本协议，修改后的协议将在本页面公示。继续使用本服务即表示您同意修改后的协议。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">二、账号注册与使用</Text>
        <Text className="agreement-page__section-content">
          2.1 您理解并承诺，您所设置的账号不得违反国家法律法规及平台规则，账号名称、头像和简介等注册信息中不得出现违法和不良信息。{'\n'}
          2.2 您需妥善保管账号信息，因您保管不当可能导致的账号被盗、密码泄露等后果由您自行承担。{'\n'}
          2.3 您不得将账号转让、出借给他人使用。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">三、用户行为规范</Text>
        <Text className="agreement-page__section-content">
          3.1 您不得利用本服务从事以下活动：{'\n'}
          （1）反对宪法所确定的基本原则的；{'\n'}
          （2）危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；{'\n'}
          （3）损害国家荣誉和利益的；{'\n'}
          （4）煽动民族仇恨、民族歧视，破坏民族团结的；{'\n'}
          （5）破坏国家宗教政策，宣扬邪教和封建迷信的；{'\n'}
          （6）散布谣言，扰乱社会秩序，破坏社会稳定的。{'\n'}
          3.2 您不得对本服务进行逆向工程、反向编译或反汇编，不得破解、修改应用或服务。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">四、服务内容</Text>
        <Text className="agreement-page__section-content">
          4.1 本服务提供基于梅花易数的卦象解读和灵感启发内容。{'\n'}
          4.2 您理解并同意，本服务内容基于国学文化视角的灵感启发，仅供娱乐参考，不构成任何决策建议。本服务不预测命运，不提供占卜算命服务。{'\n'}
          4.3 我们保留随时修改、中断或终止部分或全部服务的权利。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">五、知识产权</Text>
        <Text className="agreement-page__section-content">
          5.1 本服务的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、版面设计等的知识产权归易伴团队所有。{'\n'}
          5.2 未经我们书面许可，您不得复制、转载、链接、传播或以其他方式使用上述内容。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">六、免责声明</Text>
        <Text className="agreement-page__section-content">
          6.1 我们对因不可抗力或非我方原因导致的服务中断或终止不承担责任。{'\n'}
          6.2 您使用本服务所产生的风险由您自行承担。{'\n'}
          6.3 我们不对第三方链接的内容负责。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">七、协议终止</Text>
        <Text className="agreement-page__section-content">
          7.1 如您违反本协议规定，我们有权终止向您提供服务。{'\n'}
          7.2 如您希望终止使用本服务，可以联系我们注销账号。
        </Text>
      </View>

      <View className="agreement-page__section">
        <Text className="agreement-page__section-title">八、联系我们</Text>
        <Text className="agreement-page__section-content">
          如您对本协议有任何疑问，可以通过应用内的反馈功能联系我们。
        </Text>
      </View>
    </View>
  );
}
