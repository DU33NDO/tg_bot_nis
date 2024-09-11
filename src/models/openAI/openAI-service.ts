import Configuration, {OpenAI} from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

// ... existing code ...

class OpenAIService {
    getAIResponse = async (
      temperature: number = 0.7,
      razdel: string,
      grade: number,
      template_tasks: string,
    ) => {
      try {
        const prompt = `You're the world's best math prep assignment writer. 
        For the ${grade} grade level exams for the ${razdel} section. Your goal is to take inspiration from assignments 
        that other teachers have already created: ${template_tasks}. Based on these examples, create similar tasks (10 tasks with 'easy', 'medium', 'hard' difficulties), answer, and solution. Think about and write a difficulty level for the ${grade} class. You should write in russian.
        Submit it in JSON format. Ensure your response is a valid JSON array of objects. Example of your answer: 
        [
          {
            "description": "2x + 8 = 10",
            "solution": "x = 1",
            "explanation": "2x = 10 - 8 => x = 2 / 2 => x = 1",
            "difficulty": "easy"
          }
        ]`;
  
        const aiResponse: any = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are the best creator of math tasks for school students. Always respond with valid JSON." },
            { role: "user", content: prompt },
          ],
          max_tokens: 2000,
          temperature: temperature,
        });
  
        const content = aiResponse.choices[0].message.content.trim();
  
        let tasks;
        try {
          tasks = JSON.parse(content);
          if (!Array.isArray(tasks)) {
            throw new Error("The response is not an array");
          }
        } catch (error) {
          console.error("Error parsing AI response as JSON:", error);
          console.error("Raw AI response:", content);
          
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              tasks = JSON.parse(jsonMatch[0]);
              if (!Array.isArray(tasks)) {
                throw new Error("The extracted content is not an array");
              }
            } catch (extractError) {
              console.error("Error parsing extracted JSON:", extractError);
              throw new Error("Invalid JSON format received from OpenAI");
            }
          } else {
            throw new Error("Invalid JSON format received from OpenAI");
          }
        }
  
        return tasks;
      } catch (error) {
        console.error("Error with OpenAI API:", error);
        throw error;
      }
    };
  }
  
  

export default new OpenAIService