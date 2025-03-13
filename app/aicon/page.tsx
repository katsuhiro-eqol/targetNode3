import { Suspense } from 'react';
import AICon from "../components/aiconChat"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AICon />
    </Suspense>
  );
}