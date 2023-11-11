"use client"
import React,{useState} from 'react';
import Image from 'next/image';
import axios from "axios";

export default function Home() {
  const [data,setData] = useState("");

  const handleClick = async () => {
    const response = await fetch('/api/click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: "who is Abdulla" }),
    });
    const data = await response.json();
    setData(data.message);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={handleClick} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>click this get API</button>
      <p>11-{data}</p>
    </main>
  )
}
