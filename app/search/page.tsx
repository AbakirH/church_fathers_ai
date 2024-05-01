"use client";
import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import { db } from '../helpers/firebase';
import addData from '../helpers/addData';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

let church_father_texts: any = [];
let currentIndex: number = 0;

const Search = () => {

    return (
        <>
            <Navbar />
            <div className='p-2 flex justify-center items-center flex-col'>
               
            </div>
        </>
    );
}

export default Search;
