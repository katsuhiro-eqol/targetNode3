import { Suspense } from 'react';
import AIChat from "../../components/aiconChat"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIChat />
    </Suspense>
  );
}