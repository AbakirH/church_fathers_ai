"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nkjv from "../../../public/bible_data/nkjv.json";
import bible_book_abbreviations from "../../../public/bible_data/bible_book_abbreviations.json";
import { collection, getDocs, setDoc, QueryDocumentSnapshot, DocumentData, doc } from 'firebase/firestore';
import { db } from '../../helpers/firebase';

const SubmitGeminiButton = ({ churchFather, churchText, GeminiAPIKey }: { churchFather: string, churchText: string, GeminiAPIKey: string }) => {

    let API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

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
        let NKJVText = '';
        for (let i = startingVerse - 1; i < endingVerse; i++) {
            const verseText = nkjv[bible_book_abbreviations[book]][String(chapter)][String(i)];
            NKJVText += verseText;
        }

        const verseObject: VerseReference = {
            book: book,
            chapter: chapter,
            startingVerse: startingVerse,
            endingVerse: endingVerse,
            NKJVText: NKJVText
        };
        return verseObject;
    }

    const createGeminiEmbedding = (text) => {
        return new Promise((resolve, reject) => {
            if (!API_KEY && GeminiAPIKey !== '' && GeminiAPIKey !== undefined) {
                API_KEY = GeminiAPIKey;
            }
            if (!API_KEY) {
                reject(new Error("API_KEY is undefined"));
            }

            const genAI = new GoogleGenerativeAI(API_KEY);
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

    const checkIfVerseIsDirectReference = (churchFatherText:string, nkjvText:string, reference:string) => {
        return new Promise((resolve, reject) => {
            if (!API_KEY && GeminiAPIKey !== '' && GeminiAPIKey !== undefined) {
                API_KEY = GeminiAPIKey;
            }
            if (!API_KEY) {
                reject(new Error("API_KEY is undefined"));
            }

            const genAI = new GoogleGenerativeAI(API_KEY);
            const embedModel = genAI.getGenerativeModel({
                model: "models/gemini-1.0-pro-latest",
            });
            let prompt = "Father Text: " +
                     churchFatherText + " Bible Verse: " + nkjvText + " " + reference +
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




    return (
        <button id="submit_button"
            onClick={async () => {
                if(churchFather === '' || churchText === '') {
                    alert('Please select a church father and input text that this person wrote');
                }
                let churchFatherTextStore = {
                    text: churchText,
                    embedding: null,
                    verses: []
                }
                churchFatherTextStore.embedding = await createGeminiEmbedding(churchText);

                const verses = verseExtractor(churchText);
                verses.forEach(async verse => {
                    verse.embedding =  await createGeminiEmbedding(verse.NKJVText);
                    verse.similarity = cosineSimilarity(verse.embedding.values, churchFatherTextStore.embedding.values);
                    let reference = verse.book + " " + verse.chapter + ":" + verse.startingVerse + "-" + verse.endingVerse;
                    verse.direct_reference_response = await checkIfVerseIsDirectReference(churchText, verse.NKJVText, reference);
                });
                churchFatherTextStore.verses = verses;
                const textsInDatabase = await getDocs(collection(db, 'church-fathers', churchFather, "texts"));
                const textKey = 'text_' + String(parseInt(textsInDatabase.size + 1));
                const response = await addTextAIDataToDatabase(churchFather, churchText, textKey, churchFatherTextStore); 
            }}
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

interface VerseReference {
    book: string;
    chapter: number;
    startingVerse: number;
    endingVerse: number;
    NKJVText: string;
    embedding?: any;
    similarity?: number;
    direct_reference_response?: string;
}

export default SubmitGeminiButton;
