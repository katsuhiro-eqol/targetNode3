import { LoaderCircle } from 'lucide-react';

export default function Loading(){
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle />
            <p>loading...</p>
        </div>
    )
}