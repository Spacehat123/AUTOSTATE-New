    import "dotenv/config";
    import { defineConfig } from "prisma/config";

    export default defineConfig({
      schema: "prisma/schema.prisma",
      migrations: {
        path: "prisma/migrations",
        seed: "tsx seed.ts", // <-- Add this line
      },
      datasource: {
        url: process.env["DATABASE_URL"],
      },
    });