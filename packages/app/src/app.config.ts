export default {
  pages: [
    'pages/authorize/index',
    'pages/home/index',
    'pages/collection/index',
    'pages/study/index',
    'pages/settings/index',
    'pages/agreement/index',
    'pages/privacy/index',
    'pages/report/index',
    'pages/report/detail',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F5F0E8',
    navigationBarTitleText: '易伴',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#C73E3A',
    backgroundColor: '#F5F0E8',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '今日',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/collection/index',
        text: '收藏',
        iconPath: 'assets/icons/collection.png',
        selectedIconPath: 'assets/icons/collection-active.png',
      },
      {
        pagePath: 'pages/study/index',
        text: '书斋',
        iconPath: 'assets/icons/study.png',
        selectedIconPath: 'assets/icons/study-active.png',
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置',
        iconPath: 'assets/icons/settings.png',
        selectedIconPath: 'assets/icons/settings-active.png',
      },
    ],
  },
};
