'use client';
import React from "react";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem } from "@/types"

interface MenuProps {
  item: MenuItem;
  isActive: string;
  setActiveItem: (activeItem: string) => void;
}

export default function MenuITEM({ item, isActive, setActiveItem }: MenuProps){
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter()
  
    // サブメニューの開閉を切り替える
    const toggleSubmenu = () => {
      if (item.submenu) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setActiveItem(item.title);
        }
      } else {
        setActiveItem(item.title);
        router.push(item.path!);
      }
    };
  
    return (
      <div className="mb-2">
        {/* メインメニュー項目 */}
        <div 
          onClick={toggleSubmenu}
          className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer 
            ${isActive === item.title ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <div className="flex items-center">
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.title}</span>
          </div>
          {item.submenu ? (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ):(
            <div></div>
          )}
        </div>
  
        {/* サブメニュー */}
        {item.submenu && isOpen && (
          <div className="ml-6 mt-2 space-y-2">
            {item.submenuItems?.map((subItem, index) => (
              <Link href={subItem.path} key={index}>
                <div className="text-sm px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-100">
                  {subItem.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };