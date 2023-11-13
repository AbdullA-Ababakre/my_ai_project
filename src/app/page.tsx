"use client";
import { toString } from "lodash";
import { useState } from "react";

export default function Home() {
  const [apiRes, setApiRes] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      fetch("/api/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: "who is Abdulla" }),
      })
        .then((res) => res.json())
        .then((data) => {
          setApiRes(toString(data.message.value));
          console.log("response from submit", toString(data.result));
        });
    } catch (error) {
      console.log("Error from HandleSubmit: ", toString(error));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <p>Welcome to my AI chatbot</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSubmit}
      >
        Who is Abdulla?
      </button>
      <p>{apiRes}</p>
    </main>
  );
}
