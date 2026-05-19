from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def ask_groq(prompt):

    response = client.chat.completions.create(

        # Updated active Groq model
        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.3,
        max_tokens=500
    )

    return response.choices[0].message.content