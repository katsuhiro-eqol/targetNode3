import { Home, Users, HardDriveUpload, BriefcaseBusiness, LogOut, NotebookText } from 'lucide-react';
import { MenuItem } from "@/types"


export const menuItems: MenuItem[] = [
    {
      title: 'ホーム',
      icon: Home,
      path: '/user',
      submenu: false,
      submenuItems:null
    },
    {
        title: 'データ新規登録',
        icon: BriefcaseBusiness,
        path: null,
        submenu: true,
        submenuItems: [
          { title: 'イベント登録', path: '/user/createEvent' },
          { title: 'Q&Aデータ登録', path: '/user/createQA2' },
        ]
      },
    {
      title: 'データ更新・削除',
      icon: BriefcaseBusiness,
      path: null,
      submenu: true,
      submenuItems: [
        { title: 'イベント設定更新', path: '/user/updateEvent' },
        { title: 'Q&Aデータ更新', path: '/user/updateQA' }
      ]
    },
    {
      title: 'イベント管理',
      icon: HardDriveUpload,
      path: null,
      submenu: true,
      submenuItems: [
        { title: '登録情報一覧', path: '/user/eventList' },
        { title: 'イベント複製', path: '/user/copyEvent' },
        { title: 'イベント削除', path: '/user/deleteEvent' },
        { title: 'QRコード発行', path: '/user/qrCodeGenerator' },
        { title: '進捗確認・分析', path: '/user/eventInspector' },
        { title: 'メッセージ管理', path: '/user/messageManager' }
      ]
    },
    {
      title: '手順書・マニュアル',
      icon: NotebookText,
      path: null,
      submenu: true,
      submenuItems: [
        { title: '管理者用マニュアル', path: '/user/manual' },
        { title: 'Q&Aテンプレート・記入例', path: '/user/template' },
        { title: 'AIコンユーザーマニュアル', path: '/aicon/manual' }
      ]
    },
    {
      title: 'アカウント',
      icon: Users,
      path: '/user/account',
      submenu: false,
      submenuItems: null
    }
  ];

  export const staffItems:MenuItem[] = [
    {
      title: 'ホーム',
      icon: Home,
      path: '/staff',
      submenu: false,
      submenuItems: null
    },
    {
      title: 'メッセージ対応',
      icon: Home,
      path: '/staff/messageManager',
      submenu: false,
      submenuItems: null
    },
  ];



  export const adminItems:MenuItem[] = [
    {
      title: 'ホーム',
      icon: Home,
      path: '/admin',
      submenu: false,
      submenuItems: null
    },
    {
      title: 'ユーザー管理',
      icon: BriefcaseBusiness,
      path: null,
      submenu: true,
      submenuItems: [
        { title: 'ユーザー登録', path: '/admin/userRegistration' },
        { title: 'ユーザー設定', path: ''}
      ]
    },
    {
        title: 'AdminFunctions',
        icon: BriefcaseBusiness,
        path: null,
        submenu: true,
        submenuItems: [
            { title: '空Conversation削除', path: '/admin/deleteEmptyConversation' },
            { title: 'ユーザー設定', path: ''}
          ]
      },
    {
      title: '手順書・マニュアル',
      icon: NotebookText,
      path: null,
      submenu: true,
      submenuItems: [
        { title: '管理者用マニュアル', path: '/user/manual' },
        { title: 'AIコンユーザーマニュアル', path: '/aicon/manual' }
      ]
    },
    {
      title: 'アカウント',
      icon: Users,
      path: '/',
      submenu: false,
      submenuItems: null
    },
    {
      title: 'ログアウト',
      icon: LogOut,
      path: '/',
      submenu: false,
      submenuItems: null
    }
  ];
