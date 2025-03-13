export interface Image {
    [key: string]: string;
};

export interface Foreign {
    [key: string]: string;
};

export interface Modal {
    name:string;
    type:string;
    size:number;
    path:string;
    url:string;
};

export interface FILE extends File {
    preview?: string;
}

export interface ModalFile {
    [key: string]: string;
}

export interface EventData {
    image:Image;
    languages:string[];
    voice:string;
    embedding:string;
    qaData: boolean;
}

interface ForeignAnswer {
    [key: string]:string
}
export interface ForeignAnswers {
    [key: string]:ForeignAnswer[]
}
export interface CsvData {
    [key: string]: string;
}
export type Message = {
    id: string;
    text: string;
    sender: 'user' | 'AIcon';
    modalUrl: string | null;
    modalFile: string | null;
}
export interface EmbeddingsData {
    vector: number[];
    question: string;
    answer: string;
    modalUrl: string;
    modalFile: string;
    foreign: Foreign;
    voiceUrl: string;
    frame: number;
}

/*
export interface EventData {
    image:Image;
    languages:string[];
    voice:string;
    embedding:string;
}
*/

 export interface Event {
    id: string;
    name: string;
    code: string;
    image: string;
    voice: string;
    langString:string;
    languages: string[];
    period: string;
    qaData: boolean;
    [key: string]: string | boolean | string[]; 
}

export interface MenuItem {
    title: string;
    icon: any;
    path: string|null;
    submenu: boolean;
    submenuItems: SubmenuItem[]|null;
}

export interface SubmenuItem {
title: string;
path: string;
}

export interface QaData {
    id: string;
    code: string;
    question: string;
    answer: string;
    modalFile: string;
    modalUrl: string;
    voiceId: string;
    voiceUrl: string;
    foreignStr: string;
    foreign: Foreign[];
    vector: string;
    [key: string]: string | Foreign[];
}

export interface ModalData {
    name:string;
    type:string;
    size:number;
    path:string;
    url:string;
}
