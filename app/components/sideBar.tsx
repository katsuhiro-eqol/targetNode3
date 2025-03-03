'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { MenuItem } from './menuItem';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Home, Users, HardDriveUpload, BriefcaseBusiness, LogOut } from 'lucide-react';

const menuItems = [
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
      { title: 'イベント一覧', path: '/user/eventList' },
      { title: '新規登録', path: '/user/createEvent' },
      { title: 'オプション設定', path: '/user/eventOption' }
    ]
  },
  {
    title: 'Q&Aデータ管理',
    icon: HardDriveUpload,
    submenu: true,
    submenuItems: [
      { title: 'Q&Aデータ一覧', path: '/user/qaList' },
      { title: '新規登録', path: '/user/createQA' },
      { title: 'Q&Aデータ回答修正', path: '/user/updateQA' },
      { title: 'Q&Aデータ追加', path: '/user/addQA' },
      { title: 'Q&A添付書類修正', path: '/user/updateFile' },
      { title: 'Q&Aデータ初期化', path: '/user/deleteQA' }
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

export const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('');
    const [currentUser, setCurrentUser] = useState<string>("")

    return (
      <div className="w-64 bg-slate-50 h-screen shadow-lg py-6 px-3 fixed left-0 top-0">
        <div className="flex items-center justify-center mb-8">

        </div>
        
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <MenuItem 
              key={index} 
              item={item}
              isActive={activeItem} 
              setActiveItem={setActiveItem} 
            />
          ))}
        </div>
      </div>
    );
  };
  