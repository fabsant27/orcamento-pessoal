import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) {
    return "Please add some transactions to receive AI-powered insights.";
  }

  // Prepare data for the model to minimize token usage while maximizing context
  const transactionSummary = transactions.map(t => 
    `${t.date}: ${t.type} - ${t.category} - $${t.amount} (${t.description})`
  ).join('\n');

  const prompt = `
    You are an expert personal financial advisor. 
    Analyze the following list of transactions for the user:
    
    ${transactionSummary}

    Please provide a response in Markdown format covering:
    1. A brief analysis of spending habits.
    2. Identify the biggest expense category.
    3. Three specific, actionable tips to save money or improve financial health based strictly on this data.
    
    Keep the tone encouraging but professional. concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Sorry, I encountered an error while analyzing your finances. Please try again later.";
  }
};
