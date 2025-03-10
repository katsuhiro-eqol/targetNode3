import { Home, Users, HardDriveUpload, BriefcaseBusiness, LogOut, NotebookText } from 'lucide-react';

export const menuItems = [
    {
      title: 'ホーム',
      icon: Home,
      path: '/user',
      submenu: false
    },
    {
      title: 'イベント管理',
      icon: BriefcaseBusiness,
      submenu: true,
      submenuItems: [
        { title: 'イベント情報一覧', path: '/user/eventList' },
        { title: '新規登録', path: '/user/createEvent' },
        { title: 'オプション設定', path: '/user/eventOption' },
        { title: '進捗状況', path: '/user/eventInspector' }
      ]
    },
    {
      title: 'Q&Aデータ管理',
      icon: HardDriveUpload,
      submenu: true,
      submenuItems: [
        { title: '新規登録', path: '/user/createQA' },
        { title: 'Q&Aデータ回答修正', path: '/user/updateQA' },
        { title: 'Q&Aデータ追加', path: '/user/addQA' },
        { title: 'Q&A添付書類修正', path: '/user/updateFile' },
        { title: 'Q&Aデータ初期化', path: '/user/deleteQA' }
      ]
    },
    {
      title: '手順書・マニュアル',
      icon: NotebookText,
      submenu: true,
      submenuItems: [
        { title: '管理者用マニュアル', path: '/user/manual' },
        { title: 'AIコンユーザーマニュアル', path: '/aicon/manual' }
      ]
    },
    {
      title: 'アカウント',
      icon: Users,
      path: '/user/account',
      submenu: false
    },
    {
      title: 'ログアウト',
      icon: LogOut,
      path: '/user/logout',
      submenu: false
    }
  ];

  export const adminItems = [
    {
      title: 'ホーム',
      icon: Home,
      path: '/user',
      submenu: false
    },
    {
      title: 'ユーザー管理',
      icon: BriefcaseBusiness,
      submenu: true,
      submenuItems: [
        { title: 'ユーザー登録', path: '/admin/userRegistration' },
        { title: 'ユーザー設定', path: ''}
      ]
    },
    {
      title: '手順書・マニュアル',
      icon: NotebookText,
      submenu: true,
      submenuItems: [
        { title: '管理者用マニュアル', path: '/user/manual' },
        { title: 'AIコンユーザーマニュアル', path: '/aicon/manual' }
      ]
    },
    {
      title: 'アカウント',
      icon: Users,
      path: '/user/account',
      submenu: false
    },
    {
      title: 'ログアウト',
      icon: LogOut,
      path: '/user/logout',
      submenu: false
    }
  ];