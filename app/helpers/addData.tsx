import { doc, addDoc, setDoc, collection } from "firebase/firestore";
import { db } from "./firebase";


export default async function addDataFromJSON(jsonFileString: string) {
    try {
        // Read the JSON file
        const data = JSON.parse(jsonFileString);
        console.log(data);
        // Get the father's name from the data
        const fatherName = data.father;

        // Get the paragraphs data from the data object
        const subcollectionData = data.paragraphs;

        // Reference to the document where you want to add the subcollection
        const fatherDocRef = doc(db, 'church-fathers', fatherName);

        await setDoc(fatherDocRef, {});

        // Reference to the subcollection within the father's document
        const subcollectionRef = collection(fatherDocRef, 'texts');

        // Loop through the paragraphs data and add documents to the subcollection
        for (const [textKey, textData] of Object.entries(subcollectionData)) {
            const churchFatherTextDocRef = doc(subcollectionRef, textKey);
            await setDoc(churchFatherTextDocRef, textData);
        }
        console.log('Data added successfully!');
    } catch (error) {
        console.error('Error adding data:', error);
    }
}