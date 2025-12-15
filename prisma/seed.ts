import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_QUICK_PROMPTS = [
  {
    key: "summarize",
    title: "Summarize",
    prompt: "Summarize the following text in 5 bullet points.",
    description: "Turn long text into a short summary.",
  },
  {
    key: "rewrite-friendly",
    title: "Rewrite (friendly)",
    prompt: "Rewrite the following text in a friendly, professional tone.",
    description: "Rephrase content with a friendlier tone.",
  },
  {
    key: "brainstorm-ideas",
    title: "Brainstorm ideas",
    prompt:
      "Brainstorm 10 ideas related to the following topic. Provide a short explanation for each idea.",
    description: "Generate idea lists quickly.",
  },
] as const;

async function main() {
  for (const prompt of DEFAULT_QUICK_PROMPTS) {
    await prisma.quickPrompt.upsert({
      where: { key: prompt.key },
      update: {
        title: prompt.title,
        prompt: prompt.prompt,
        description: prompt.description,
        deletedAt: null,
      },
      create: {
        key: prompt.key,
        title: prompt.title,
        prompt: prompt.prompt,
        description: prompt.description,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
