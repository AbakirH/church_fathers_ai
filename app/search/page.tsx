"use client";
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Navbar from "../components/Navbar";
import addData from '../helpers/addData';
import { collection, getDocs, setDoc, QueryDocumentSnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from '../helpers/firebase';
import { Pinecone } from '@pinecone-database/pinecone';

let church_father_texts: any = [];
let currentIndex: number = 0;
let API_KEY = process.env.GOOGLE_GEMINI_API_KEY;


const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as any
});

const Search = () => {
    const [searchScope, setSearchScope] = useState('church-fathers'); // Default search scope

    const handleSearch = async () => {
        // Execute search based on selected scope
        if (searchScope === 'bible') {
            await searchTerm("bible-data");
        } else if (searchScope === 'church-fathers') {
            await searchTerm('church-fathers-texts');
        }
    };
    return (
        <>
            <Navbar />
            <div className='p-2 flex justify-center items-center flex-col'>
                <div className="flex items-center border border-gray-300 rounded-md">
                    <input id="searchQuery" type="text" className="px-4 py-2 w-full rounded-l-md focus:outline-none" placeholder="Enter your search query..." />
                    <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none">Search</button>
                </div>
                <div className="mt-4">
                    <select value={searchScope} onChange={(e) => setSearchScope(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none">
                        <option value="bible">Search in Bible</option>
                        <option value="church-fathers">Search in Church Father Writings</option>
                    </select>
                </div>
                <div id="searchResults" className="p-6">
                    {/* Search results will be displayed here */}
                </div>
            </div>
        </>
    );
}

const createGeminiEmbedding = (text:string) => {
    return new Promise((resolve, reject) => {
        if (!API_KEY) {
            reject(new Error("API_KEY is undefined"));
        }

        const genAI = new GoogleGenerativeAI(API_KEY as any);
        const embedModel = genAI.getGenerativeModel({
            model: "models/text-embedding-004",
        });

        embedModel.embedContent([text, "SEMANTIC_SIMILARITY"])
            .then((response) => {
                resolve(response.embedding);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}


function normalizeVector(vector:any) {
    // Convert to array if it's not already
    const vectorArray = Array.from(vector);
    
    // Calculate the Euclidean norm of the vector
    const norm = Math.sqrt((vectorArray as number[]).reduce((acc, val) => acc + Math.pow(val, 2), 0));
    
    // Divide each element of the vector by its norm
    const normalizedVector = vectorArray.map(val => val as any / norm);

    return normalizedVector;
}

const searchTerm = async (pinecone_namespace:string) => {
    const searchQueryElement = document.getElementById('searchQuery') as HTMLInputElement;
    if(!searchQueryElement) {
        return;
    }
    const searchQuery = searchQueryElement.value;
    const searchResultsElement = document.getElementById('searchResults');
    if (searchResultsElement) {
        searchResultsElement.innerHTML = `
            <div class="flex items-center justify-center h-48">
                <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>`;
    } else {
        console.error("Element with id 'searchResults' not found.");
    }
    createGeminiEmbedding(searchQuery).then(async (searchQueryEmbedding:any) => {
        const index = pc.index("church-fathers-ai");
        const normalizedEmbedding = normalizeVector(searchQueryEmbedding.values);
        const stats = await index.describeIndexStats();
        const queryResponse = await index.namespace(pinecone_namespace).query({
            vector: normalizedEmbedding,
            topK: 15,
            includeValues: true,
        });
        const matches = queryResponse.matches;
        let topTenTexts:string[] = [];
        const promises:any[] = [];

        matches.forEach((match) => {
            let churchFatherTextDocRef:any;
            let textId:string;
            if(pinecone_namespace==='bible-data') {
                textId = match.id.toString();
                churchFatherTextDocRef = doc(db, 'bible-data', "nkjv-bible", 'bible-labels', textId);
            }else{
                const churchFatherList = match.id.split('_text_');
                const churchFatherId = churchFatherList[0].replace(/_/g, " ");
                textId = "text_" + churchFatherList[1];
                churchFatherTextDocRef = doc(db, 'church-fathers', churchFatherId, 'texts', textId);
            }

            // Add promise to the promises array
            promises.push(
                getDoc(churchFatherTextDocRef).then(textDocSnapshot => {
                    if (textDocSnapshot.exists()) {
                        const textData:any = textDocSnapshot.data();
                        if(pinecone_namespace==='bible-data') {
                            topTenTexts.push(textData.verse);
                        }
                        else{
                            topTenTexts.push(textData.text);

                        }
                    } else {
                        console.log(textId, 'not found');
                    }
                }).catch(error => {
                    console.error('Error getting document:', error);
                })
            );
        });

        // Wait for all promises to resolve
        Promise.all(promises).then(() => {
            // Generate HTML once all promises are resolved
            const topTenHTML = topTenTexts.map(textObject => `
                <div class="bg-gray-100 p-4 rounded-md mb-4">
                    <h2 class="text-xl font-semibold mb-2">Result</h2>
                    <p>${textObject}</p>
                </div>
            `).join('');


            const searchResultsElement = document.getElementById('searchResults');
            if (searchResultsElement) {
                // Update the searchResults div with the top ten results HTML
                searchResultsElement.innerHTML = topTenHTML;
            } else {
                console.error("Element with id 'searchResults' not found.");
            }
        }).catch(error => {
            console.error('Error fetching documents:', error);
        });
    });
}

export default Search;
