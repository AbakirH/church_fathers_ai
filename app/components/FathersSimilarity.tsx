"use client";
import React, { useState } from 'react';
import addData from '../helpers/addData';

export default function FathersSimilarity() {
    const [fileContent, setFileContent] = useState('');

    const handleFileChange = async (event: any) => {
        const file = event.target.files[0];
        console.log(file);
        if (file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const fileTarget = e.target ?? {} as any;
                const text = fileTarget.result ?? '' as string;
                await addData(text);
            };

            reader.readAsText(file);
        } else {
            alert('Please upload a valid JSON file.');
        }
    };

    return (
        <>
            <div>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Submit</button>
            </div>
        </>
    );
}
