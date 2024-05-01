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


    async function processVerses(verses, churchFather, churchText, churchFatherTextStore) {
        const processedVerses = await Promise.all(verses.map(async (verse) => {
            verse.embedding = await createGeminiEmbedding(verse.nkjv_verse);
            verse.similarity_score = cosineSimilarity(verse.embedding.values, churchFatherTextStore.embedding.values);
            let reference = `${verse.book} ${verse.chapter}:${verse.startingVerse}-${verse.endingVerse}`;
            verse.direct_reference_response = await checkIfVerseIsDirectReference(churchText, verse.nkjv_verse, reference);
            return verse;
        }));

        churchFatherTextStore.verses = processedVerses;

        const textsInDatabase = await getDocs(collection(db, 'church-fathers', churchFather, "texts"));
        const textKey = 'text_' + String(parseInt(textsInDatabase.size + 1));
        const response = await addTextAIDataToDatabase(churchFather, churchText, textKey, churchFatherTextStore);

        return response;
    }


    return (
        <button id="submit_button"
            onClick={async () => {
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
                processVerses(verses, churchFather, churchText, churchFatherTextStore);
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
    nkjv_verse: string;
    embedding?: any;
    similarity?: number;
    direct_reference_response?: string | unknown;
}

export default SubmitGeminiButton;
