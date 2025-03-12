'use client';
import React from "react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuITEM from './menuItem';
import { MenuItem } from "@/types"

interface SidebarProps {
  menuItems:MenuItem[]
}


export const Sidebar = ({menuItems}:SidebarProps) => {
    const [activeItem, setActiveItem] = useState('');
    const [currentUser, setCurrentUser] = useState<string>("")
    const router = useRouter()


    const confirmUser = () => {
      const org = sessionStorage.getItem("user")
      if (!org){
        router.push("/auth")
      } else {
        setCurrentUser(org)
      }
    }

    useEffect(() => {
      confirmUser()
    }, [currentUser])

    return (
      <div className="w-64 bg-slate-50 h-screen shadow-lg py-6 px-3 fixed left-0 top-0">
        <div className="flex items-center justify-center mb-8">

        </div>
        
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <MenuITEM 
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
  