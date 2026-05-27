

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Бекенд запущено!');
});

app.listen(port, () => {
  console.log(`Сервер працює на http://localhost:${port}`);
});