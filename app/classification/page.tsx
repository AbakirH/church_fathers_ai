"use client";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import { db } from '../helpers/firebase';
import addData from '../helpers/addData';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

let church_father_texts: any = [];
let currentIndex: number = 0;

const Classification = () => {

    return (
        <>
            <Navbar />
            <div className="max-w-screen-lg mx-auto text-center text-white p-4 border-2 border-white rounded-lg bg-black ">
                <h1 className="text-5xl font-bold mb-4 shadow">Find out about the different Classifications Models</h1>
                <h2 className="text-xl font-semibold shadow-md">Find out how the models were trained and what data was used to train them.</h2>
                <a href="https://github.com/AbakirH/church_fathers_ai/tree/flash-api" className="hover:text-white text-blue-700">Github Branch with all models</a>
            </div>
            <div className="max-w-screen-lg mx-auto mt-8 p-5">
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Bible Label Keras Model Version 1</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Trained on All verses in New King James Version of the Bible and 1000 text commentaries</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Bible Label Keras Model Version 2
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Trained on All verses in New King James Version of the Bible and 60,000 commentaries that I borrowed from a nonprofit called Catena, that I had to parse and organize.</p>
                    <p className="text-sm text-gray-600">Through the use of Google's model text-embedding-004, and semantic search techniques, allows you to search the Bible for what you are searching for through the meaning of the phrase instead of finding the exact order of the phrase</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Bible Label Keras Model Version 3
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Trained on 60,000 commentaries that I borrowed from a nonprofit called Catena, that I had to parse and organize.</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">
                    Bible Label Keras Model Version 4
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Trained on All verses in New King James Version of the Bible Only</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default Classification;
