"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nkjv from "../../../public/bible_data/nkjv.json";
import bible_book_abbreviations from "../../../public/bible_data/bible_book_abbreviations.json";
import { collection, getDocs, setDoc, QueryDocumentSnapshot, DocumentData, doc } from 'firebase/firestore';
import { db } from '../../helpers/firebase';
import { Pinecone } from '@pinecone-database/pinecone';

const SubmitGeminiButton = ({ churchFather, churchText, GeminiAPIKey }: { churchFather: string, churchText: string, GeminiAPIKey: string }) => {

    let API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    let Pinecone_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY as any
    });

    const verseExtractor = (text: string) => {
        const verseRegex = [
            /((?:\d+?\s+?)?\w+) (\d+):(\d+)(?:-(\d+))?/g
        ];
        const allVerses: Set<string> = new Set();
        for (const pattern of verseRegex) {
            const matches: string[] = text.match(pattern) || [];
            matches.forEach((match) => {
                allVerses.add(match);
            });
        }
        const formattedVerses: any = [];
        allVerses.forEach((verse) => {
            const formattedVerse: VerseReference = formatReference(verse);
            formattedVerses.push(formattedVerse);
        });
        return formattedVerses;
    }

    const formatReference = (verseText: string): VerseReference => {
        const pattern: RegExp = /((?:\d+?\s+?)?\w+) (\d+):(\d+\s?-?\s?\d?)/;
        const verseGroups: RegExpMatchArray | null = verseText.match(pattern);
        if (!verseGroups) {
            throw new Error("Invalid verse text format");
        }
        const book: string = verseGroups[1];
        const chapter: number = parseInt(verseGroups[2]);
        const startingVerse: number = parseInt(verseGroups[3].split('-')[0]);
        const endingVerse: number = Number.isNaN(parseInt(verseGroups[3].split('-')[1])) ? startingVerse : parseInt(verseGroups[3].split('-')[1]);
        let nkjv_verse = '';
        const nkjvJSON:any = nkjv;
        const bible_book_abbreviations_json:any = bible_book_abbreviations;
        for (let i = startingVerse - 1; i < endingVerse; i++) {
            const verseText = nkjvJSON[bible_book_abbreviations_json[book]][String(chapter)][String(i)];
            nkjv_verse += verseText;
        }

        const verseObject: VerseReference = {
            book: book,
            chapter: chapter,
            startingVerse: startingVerse,
            endingVerse: endingVerse,
            nkjv_verse: nkjv_verse
        };
        return verseObject;
    }

    const createGeminiEmbedding = (text:string) => {
        return new Promise((resolve, reject) => {
            if (!API_KEY && GeminiAPIKey !== '' && GeminiAPIKey !== undefined) {
                API_KEY = GeminiAPIKey;
            }
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

    const checkIfVerseIsDirectReference = (churchFatherText:string, nkjv_verse:string, reference:string) => {
        return new Promise((resolve, reject) => {
            if (!API_KEY && GeminiAPIKey !== '' && GeminiAPIKey !== undefined) {
                API_KEY = GeminiAPIKey;
            }
            if (!API_KEY) {
                reject(new Error("API_KEY is undefined"));
            }

            const genAI = new GoogleGenerativeAI(API_KEY as any);
            const embedModel = genAI.getGenerativeModel({
                model: "models/gemini-1.0-pro-latest",
            });
            let prompt = "Father Text: " +
                     churchFatherText + " Bible Verse: " + nkjv_verse + " " + reference +
                    "\n Between these two options, tell me if the Bible verse is a direct " + 
                    "reference or an indirect reference in the church father's text. " +
                    "Two word response max based on the options.";
            let response = embedModel.generateContent(prompt).then((result) => {
                    resolve(result.response.text());
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }

    const checkIfVerseIsValid = (churchFatherText:string, nkjv_verse:string, reference:string) => {
        return new Promise((resolve, reject) => {
            if (!API_KEY && GeminiAPIKey !== '' && GeminiAPIKey !== undefined) {
                API_KEY = GeminiAPIKey;
            }
            if (!API_KEY) {
                reject(new Error("API_KEY is undefined"));
            }

            const genAI = new GoogleGenerativeAI(API_KEY as any);
            const embedModel = genAI.getGenerativeModel({
                model: "models/gemini-1.0-pro-latest",
            });
            let prompt = "Father Text: " +
                     churchFatherText + " Bible Verse: " + nkjv_verse + " " + reference +
                    "\n Between these two options, tell me if the Bible verse correlates " + 
                    "to the church father's text or not by using yes or no. " +
                    "One word response max based on the options.";
            let response = embedModel.generateContent(prompt).then((result) => {
                    resolve(result.response.text());
                })
                .catch((error) => {
                    console.error(error);
                    reject(error);
                });
        });
    }

    function cosineSimilarity(v1: number[], v2: number[]): number {
        const v1Norm = vectorNorm(v1);
        const v2Norm = vectorNorm(v2);
        // Handle potential division by zero for normalized vectors
        if (v1Norm === 0 || v2Norm === 0) {
            return 0;
        }
        const similarity = dotProduct(v1, v2) / (v1Norm * v2Norm);
        return similarity;
    }

    // Helper function to calculate vector norm (L2 norm)
    function vectorNorm(vec: number[]): number {
        let sum = 0;
        for (const value of vec) {
            sum += value * value;
        }
        return Math.sqrt(sum);
    }

    // Helper function to calculate dot product of two vectors
    function dotProduct(vec1: number[], vec2: number[]): number {
        let product = 0;
        for (let i = 0; i < vec1.length; i++) {
            product += vec1[i] * vec2[i];
        }
        return product;
    }


    async function processVerses(verses: any, churchFather: any, churchText: any, churchFatherTextStore: any): Promise<any> {
        const processedVerses = await Promise.all(verses.map(async (verse:any) => {
            verse.embedding = await createGeminiEmbedding(verse.nkjv_verse);
            verse.similarity_score = cosineSimilarity(verse.embedding.values, churchFatherTextStore.embedding.values);
            let reference = `${verse.book} ${verse.chapter}:${verse.startingVerse}-${verse.endingVerse}`;
            verse.direct_reference_response = await checkIfVerseIsDirectReference(churchText, verse.nkjv_verse, reference);
            return verse;
        }));

        churchFatherTextStore.verses = processedVerses;
        
    }

    async function fetchAndClassifyText(classifier_versions:any, data:any) {
    const fetchPromises = classifier_versions.map((version:any) => {
        const url = `https://church-fathers-ai.onrender.com/${version}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error('No success in response data');
            }
            const [book, chapter, startingVerse] = data.predicted_label.split('_');
            const nkjvJSON:any = nkjv;
            const verseText = nkjvJSON[book][chapter][startingVerse];
            return {
                version,
                book,
                chapter,
                startingVerse,
                endingVerse: startingVerse,
                nkjv_verse: verseText
            };
        })
        .catch(error => {
            console.error('Error fetching data for version', version, error.message);
            return null;
        });
    });
    return Promise.all(fetchPromises);
}

    async function processAndClassifyVerses(validResults:any, churchFatherTextStore:any, verses:any) {
        const processedVerses = [];

        for (const verse of validResults) {
            verse.embedding = await createGeminiEmbedding(verse.nkjv_verse);
            verse.similarity_score = cosineSimilarity(verse.embedding.values, churchFatherTextStore.embedding.values);

            let reference = `${verse.book} ${verse.chapter}:${verse.startingVerse}`;
            verse.direct_reference_response = await checkIfVerseIsDirectReference(churchFatherTextStore.text, verse.nkjv_verse, reference);
            verse.is_valid = await checkIfVerseIsValid(churchFatherTextStore.text, verse.nkjv_verse, reference);
            processedVerses.push(verse);
            if(verse.is_valid.toLowerCase() === 'yes'){
                verses.push(verse);
            }
        }

        // After all verses are processed, render them
        renderClassifiedVerses(processedVerses);
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


    return (
        <button id="submit_button"
            onClick={async () => {
                const bibleVerse = document.getElementById('classified_bible_verse_results');
                if (bibleVerse && bibleVerse.querySelectorAll('div').length > 0) {
                    bibleVerse.innerHTML = '';
                }
                if(churchFather === '' || churchText === '') {
                    alert('Please select a church father and input text that this person wrote');
                }
                let churchFatherTextStore:any = {
                    text: churchText,
                    embedding: null,
                    verses: []
                }
                churchFatherTextStore.embedding = await createGeminiEmbedding(churchText);
                const verses = verseExtractor(churchText);
                await processVerses(verses, churchFather, churchText, churchFatherTextStore);

                renderParsedVerses(verses);
                // Data to be sent in the POST request
                const text_vector_data = {
                    text_vector: churchFatherTextStore.embedding.values,
                };
                const classifier_versions = ['v1', 'v2', 'v3', 'v4'];
                // Make the POST request
                try {
                    const classifiedVerses = await fetchAndClassifyText(classifier_versions,text_vector_data);
                    // Filter out any nulls if there were errors
                    const validResults = classifiedVerses.filter(result => result !== null);

                    processAndClassifyVerses(validResults, churchFatherTextStore, verses);

                    console.log('Classified verses:', validResults);                    
                } catch (error) {
                    console.error('An error occurred while processing classifications:', error);
                }

                const textsInDatabase = await getDocs(collection(db, 'church-fathers', churchFather, "texts"));
                const textKey = 'text_' + (textsInDatabase.size + 1).toString();
                const response = await addTextAIDataToDatabase(churchFather, churchText, textKey, churchFatherTextStore);

                const index = pc.index("church-fathers-ai");
                const churchFather_underscore = churchFather.replace(/ /g, "_");
                const normalizedEmbedding = normalizeVector(churchFatherTextStore.embedding.values);
                console.log(normalizedEmbedding);
                console.log(churchFather_underscore+"_"+textKey);
                await index.namespace("church-fathers-texts").upsert([
                    {
                        "id": churchFather_underscore+"_"+textKey, 
                        "values": normalizedEmbedding
                    }
                ]);

                return response;     
                }
            }

            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
    );
};


const addTextAIDataToDatabase = async (churchFather: string, churchText: string, textKey:string , churchFatherTextStore: any) => {

        // Get the paragraphs data from the data object

        // Reference to the document where you want to add the subcollection
        const fatherDocRef = doc(db, 'church-fathers', churchFather);

        await setDoc(fatherDocRef, {});

        // Reference to the subcollection within the father's document
        const subcollectionRef = collection(fatherDocRef, 'texts');
        
        const churchFatherTextDocRef = doc(subcollectionRef, textKey);
        await setDoc(churchFatherTextDocRef, churchFatherTextStore);
};


const renderParsedVerses = (verses: any) => {
    const bibleVerse = document.getElementById('bible_verse_results');
    if (bibleVerse && bibleVerse.querySelectorAll('div').length > 0) {
        bibleVerse.innerHTML = '';
    }
        const verses_found_in_text = document.getElementById('verses_found_in_text');
        if(verses_found_in_text){
            verses_found_in_text.classList.remove('hidden');
        }
        if (bibleVerse && verses) {
            verses.forEach((verse: any) => {
                const bible_verse_result = document.createElement('div');
                bible_verse_result.classList.add('bg-gray-100', 'p-4', 'm-5', 'rounded', 'shadow-md', 'flex', 'flex-col', 'w-60');

                const verseElement = document.createElement('h3');
                verseElement.classList.add('text-2xl', 'font-bold');

                let bookVerses = '';
                if(!verse.single_verse){
                    if(verse.startingVerse === verse.endingVerse){
                        bookVerses = verse.startingVerse;
                    } else{
                        bookVerses = verse.startingVerse + "-" + verse.endingVerse;
                    }
                }else{
                    bookVerses = verse.single_verse;
                }

                if(!verse.similarity_score){
                    verse.similarity_score = verse.similarity;
                }

                verseElement.innerHTML = "Bible Reference: " + verse.book + " " + verse.chapter + ":" + bookVerses;
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
};


const renderClassifiedVerses = (verses: any) => {
    const classified_bible_verse_results = document.getElementById('classified_bible_verse_results');

    if (classified_bible_verse_results && classified_bible_verse_results.querySelectorAll('div').length > 0) {
            classified_bible_verse_results.innerHTML = '';
    }
    const classified_verses_found_in_text = document.getElementById('classified_verses_found_in_text');
    if(classified_verses_found_in_text){
        classified_verses_found_in_text.classList.remove('hidden');
    }
        if (classified_bible_verse_results && verses) {
            verses.forEach((verse: any) => {
                const bible_verse_result = document.createElement('div');
                bible_verse_result.classList.add('bg-gray-100', 'p-4', 'm-5', 'rounded', 'shadow-md', 'flex', 'flex-col', 'w-60');

                const verseElement = document.createElement('h3');
                verseElement.classList.add('text-2xl', 'font-bold');

                let bookVerses = '';
                if(!verse.single_verse){
                    if(verse.startingVerse === verse.endingVerse){
                        bookVerses = verse.startingVerse;
                    } else{
                        bookVerses = verse.startingVerse + "-" + verse.endingVerse;
                    }
                }else{
                    bookVerses = verse.single_verse;
                }

                if(!verse.similarity_score){
                    verse.similarity_score = verse.similarity;
                }

                verseElement.innerHTML = "Bible Reference: " + verse.book + " " + verse.chapter + ":" + bookVerses;
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

                const is_valid = document.createElement('p');
                is_valid.innerHTML = "<strong>Is Verse related to text:</strong> " + verse.is_valid;
                bible_verse_result.appendChild(is_valid);

                classified_bible_verse_results.appendChild(bible_verse_result);
            });
        }
};

interface VerseReference {
    book: string;
    chapter: number;
    startingVerse: number;
    endingVerse: number;
    nkjv_verse: string;
    embedding?: any;
    similarity?: number;
    direct_reference_response?: string | unknown;
    is_valid?: string | unknown;
    version?: string| unknown;
}

export default SubmitGeminiButton;