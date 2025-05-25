"use client"
import UserSupportChat from "./components/userSupportChat."

export default function Home() {
  return (
    <div>
      ユーザーサポート
      <UserSupportChat userId="228" username="youko" />
    </div>
  );
}
