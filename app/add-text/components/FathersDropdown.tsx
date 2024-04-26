"use client";
import React, { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, QueryDocumentSnapshot, DocumentData, doc } from 'firebase/firestore';
import { db } from '../../helpers/firebase';

const FathersDropdown = ({ setChurchFather }: any) => {
    const [churchFathers, setChurchFathers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFather, setSelectedFather] = useState(""); // State to hold the selected church father

    useEffect(() => {
        async function fetchChurchFathers() {
            try {
                const response: any = await getChurchFathers();
                setChurchFathers(response);
            } catch (error) {
                console.error('Error fetching church fathers:', error);
            }
        }
        fetchChurchFathers();
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectFather = (name: string) => {
        setChurchFather(name);
        setSelectedFather(name); // Update selected church father
        setIsOpen(false); // Close the dropdown
    };

    return (
        <div className="relative">
            <button
                id="dropdownDefaultButton"
                onClick={toggleDropdown}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button"
            >
                {selectedFather || "Church Father"} {/* Display selected church father name or default */}
                <svg
                    className={`w-2.5 h-2.5 ms-3 ${isOpen ? 'transform rotate-180' : ''}`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>

            {isOpen && (
                <div
                    id="dropdown"
                    className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
                >
                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                        {churchFathers.map((name) => (
                            <li key={name}>
                                <button className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => selectFather(name)}>
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const getChurchFathers = async (): Promise<string[]> => {
    const querySnapshot = await getDocs(collection(db, 'church-fathers'));
    const churchFatherNames = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => doc.id);
    return churchFatherNames;
};

export default FathersDropdown;
