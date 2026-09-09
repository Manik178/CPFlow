import asyncio
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from prompts import OverviewOutput, OVERVIEW_SYSTEM_PROMPT

async def main():
    model = ChatGroq(model_name="openai/gpt-oss-120b", temperature=0.2).bind(response_format={"type": "json_object"})
    parser = JsonOutputParser(pydantic_object=OverviewOutput)
    
    sys_prompt = OVERVIEW_SYSTEM_PROMPT + "\n\n" + parser.get_format_instructions()
    
    res = await model.ainvoke([
        {"role": "system", "content": sys_prompt},
        {"role": "user", "content": "Problem Title: Two Sum\nPlatform: LeetCode\nTags: array, hash table\nStatement: Given an array of integers, return indices of the two numbers such that they add up to a specific target."}
    ])
    
    print(res.content)
    
    parsed = parser.invoke(res)
    print("Parsed successfully:", parsed)

if __name__ == "__main__":
    asyncio.run(main())
