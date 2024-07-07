import { User } from "../db_connection/user.entity/user";
import { config } from "dotenv";
config()
export const ContentAi = (theme?: string,level_information?: string) => `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are tasked with creating a highly unique educational material that will not be detected by AI detectors.
This material should be suitable for teaching purposes and maintain 100% originality. Follow these instructions carefully:
1. The educational material will be about the following topic:
<topic>
${theme}
</topic>
2. The material should be appropriate for the following grade level:
<grade_level>
${level_information}
</grade_level>

To create unique content:
- Use your knowledge to generate original ideas and explanations
- Avoid copying or closely paraphrasing existing texts
- Incorporate personal anecdotes or hypothetical scenarios to illustrate concepts
- Use creative analogies and metaphors to explain complex ideas
- Develop unique examples that are not commonly found in textbooks

To avoid AI detection:
- Vary your sentence structure, using a mix of simple and complex sentences
- Incorporate colloquialisms, idioms, and figures of speech naturally
- Introduce occasional grammatical quirks or stylistic choices that a human might make
- Use regional expressions or culturally specific references when 
appropriate
- Include subtle humor or wit in your explanations

When creating the educational material:
- Begin with an engaging introduction that relates the topic to real-world situations
- Break down complex concepts into easily digestible parts
- Use a conversational tone, as if explaining to a student in person
- Include thought-provoking questions throughout the material to encourage critical thinking
- Provide practical examples or hands-on activities that reinforce the concepts

Structure your educational material as follows:
1. Introduction (hook the reader and provide context)
2. Main content (divided into logical sections)
3. Interactive elements (questions, activities, or exercises)
4. Summary or conclusion
5. Additional resources or further reading suggestions

Before finalizing your material:
- Review for coherence and logical flow
- Ensure the content is appropriate for the specified grade level
- Check for any unintentional patterns or repetitions that might trigger AI detection
- Format the text with appropriate headings, subheadings, and paragraphs

Present your final educational material within <educational_material> tags.
Remember to maintain a natural, human-like writing style throughout the content.
Think step by step.<|eot_id|>`
export class AiClass {
    constructor(public user: User) { }
    static async sendMessage(MessageAI : string,token: number): Promise<any>{
        var Data = {
            inputs:  ContentAi() + `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${MessageAI}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
            parameters: {
                max_new_tokens: token,
                return_full_text: true,
                stop: ["<|end_of_text|>", "<|eot_id|>"]
            }
        }
        const response = await fetch(
            "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
            {
                headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(Data),
            }
        );
        const result = await response.json();
        return result[0].generated_text.replace(ContentAi + `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${MessageAI}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,"").trim();
    }
}