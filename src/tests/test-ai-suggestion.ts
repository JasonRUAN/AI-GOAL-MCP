async function testAiSuggestion() {
    const title = "Learn TypeScript";
    const description = "I want to master TypeScript programming language";

    try {
        console.log("Testing AI suggestion with:");
        console.log("Title:", title);
        console.log("Description:", description);

        const response = await fetch(
            `https://c46307fd94aaf26c0e093e1c12e615f2badc1192-5050.dstack-prod5.phala.network/deepseek/get_ai_suggestion`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: `${title}\n${description || ""}`,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("\nResponse data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error testing AI suggestion:", error);
    }
}

// 执行测试
testAiSuggestion().catch(console.error); 