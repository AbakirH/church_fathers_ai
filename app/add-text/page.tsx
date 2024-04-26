"use client";
import { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import FathersDropdown from "./components/FathersDropdown";
import SubmitGeminiButton from "./components/SubmitGeminiButton";

export default function AddText  () {
    const [selectedFather, setSelectedFather] = useState<string | null>(null);
    const [churchText, setChurchText] = useState('');
    const [api_key, setAPIKey] = useState('');

    const handleFatherSelect = (father: string) => {
        setSelectedFather(father);
    };

    const handleChurchTextChange = (event: any) => {
        setChurchText(event.target.value);
    };
    return (
        <>
            <Navbar></Navbar>
            <div className='p-2 flex justify-center items-center flex-col'>
                <div className='flex-row flex justify-center items-center pb-5 w-5/6'>
                    <h1 className='text-2xl font-bold pr-3'>Choose Church Father: </h1>
                    <FathersDropdown setChurchFather={handleFatherSelect} />
                </div>
                <div className='flex-row flex justify-center items-center pb-5 w-5/6'>
                    <h1 className='text-2xl font-bold pr-3'>Input Church Text: </h1>
                    <textarea id="church_text" className="h-60 w-5/6 border-2 border-gray-300 bg-white  px-5 py-3 rounded-lg text-sm focus:outline-none" value={churchText}
                        onChange={handleChurchTextChange} ></textarea>
                </div >
                <div className='flex-row flex justify-center items-center pb-5 w-5/6'>
                    <h1 className='text-2xl font-bold pr-3'>Optional Gemini API KEY: </h1>
                    <p>Use if you do not have </p>
                    <input
                        id="api_key"
                        onChange={(e) => setAPIKey(e.target.value)}
                        className="h-10 w-5/6 border-2 border-gray-300 bg-white px-5 py-3 rounded-lg text-sm focus:outline-none"
                    />                </div>
                <div className='flex-row flex justify-center items-center pb-5 w-5/6'>
                    <SubmitGeminiButton churchFather={selectedFather || ''} churchText={churchText} GeminiAPIKey={api_key} />
                </div>
            </div >
        </>
    );
}
