import app from "./app";
import { migrate } from "./db/migrate";

const PORT: number = 3000;

async function bootstrap(): Promise<void> {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});