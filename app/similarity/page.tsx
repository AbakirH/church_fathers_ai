"use client";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import { db } from '../helpers/firebase';
import addData from '../helpers/addData';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

let church_father_texts: any = [];
let currentIndex: number = 0;

// eslint-disable-next-line @next/next/no-async-client-component
const FathersSimilarity = async () => {

    const fatherNames = await getChurchFathers();

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
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
            <Navbar />
            <div className='p-2 flex justify-center items-center flex-col'>

                <div>
                    <input type="file" onChange={handleFileChange} />
                    <button type="submit">Submit</button>
                </div>
                <h1 className='text-4xl font-bold mt-5'>Choose a Church Father</h1>
                <div className='flex-row p-3'>
                    {fatherNames.map((name) => (
                        <button onClick={async () => await getChurchFatherTexts(name)} key={name} type="button" className="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{name}</button>
                    ))}
                </div>
                <div id="text_results" className='flex flex-row p-2 justify-center items-center'>
                    <button onClick={() => {
                        currentIndex <= 0 ? currentIndex = church_father_texts.length - 1 : currentIndex -= 1;
                        rerenderText();
                    }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-10">
                        Previous
                    </button>
                    <div id="TextComparison" className='flex flex-col p-3 justify-center items-center'>
                        <div id="church_father_text"></div>
                        <div id="bible_verse_results" className='p-3 flex flex-row'></div>
                    </div>
                    <button onClick={() => {
                        currentIndex >= church_father_texts.length - 1 ? currentIndex = 0 : currentIndex += 1;
                        rerenderText();
                    }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-10">
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}

const getChurchFathers = async () => {
    const querySnapshot = await getDocs(collection(db, 'church-fathers'));
    const churchFatherNames = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.id);
    return churchFatherNames;
};

const getChurchFatherTexts = async (church_father_name: string) => {
    const querySnapshot = await getDocs(collection(db, 'church-fathers', church_father_name, "texts"));
    church_father_texts = [];
    querySnapshot.docs.forEach((doc) => {
        const docId = doc.id;
        const data = doc.data();
        church_father_texts.push(data);
    });
    console.log(church_father_texts);
    rerenderText();
    return "churchFatherTexts";
};

const rerenderText = () => {

    const churchFatherText = document.getElementById('church_father_text');
    console.log(currentIndex);
    if (churchFatherText && churchFatherText.innerHTML !== '') {
        churchFatherText.innerHTML = '';
    }
    if (churchFatherText) {
        const panel = document.createElement('div');
        const header = document.createElement('h2');
        header.classList.add('text-2xl', 'font-bold');
        header.textContent = "Church Father Text";
        panel.appendChild(header);
        // Apply Tailwind CSS classes to style the box
        const textWrapper = document.createElement('p');

        // Set the text content inside the wrapper div
        textWrapper.textContent = church_father_texts[currentIndex].text;
        panel.classList.add('bg-gray-100', 'p-4', 'rounded', 'shadow-md');
        panel.appendChild(textWrapper);

        // Append the wrapper div to the churchFatherText div
        churchFatherText.appendChild(panel);
    }

    const bibleVerse = document.getElementById('bible_verse_results');
    if (bibleVerse && bibleVerse.querySelectorAll('div').length > 0) {
        bibleVerse.innerHTML = '';
    }
    if (bibleVerse && church_father_texts[currentIndex].verses) {
        church_father_texts[currentIndex].verses.forEach((verse: any) => {
            console.log(verse);
            const bible_verse_result = document.createElement('div');
            bible_verse_result.classList.add('bg-gray-100', 'p-4', 'm-5', 'rounded', 'shadow-md', 'flex', 'flex-col');

            const verseElement = document.createElement('h3');
            verseElement.classList.add('text-2xl', 'font-bold');

            verseElement.innerHTML = "Bible Reference: " + verse.book + " " + verse.chapter + ":" + verse.single_verse;
            bible_verse_result.appendChild(verseElement);
            const verseTextElement = document.createElement('p');
            verseTextElement.innerHTML = verse.nkjv_verse;
            verseTextElement.classList.add('p-2');
            bible_verse_result.appendChild(verseTextElement);

            const similarityElement = document.createElement('p');
            similarityElement.innerHTML = "<strong>Similarity:</strong> " + verse.similarity_score;
            bible_verse_result.appendChild(similarityElement);

            const directReferenceElement = document.createElement('p');
            directReferenceElement.innerHTML = "<strong>Reference Type:</strong> " + verse.direct_reference_response;
            bible_verse_result.appendChild(directReferenceElement);

            bibleVerse.appendChild(bible_verse_result);
        });
    }
}

interface Props {
    churchFatherNames: string[];
}

export default FathersSimilarity;
