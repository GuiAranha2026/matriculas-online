import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

interface Matricula {
  nomeCompleto: string;
  email: string;
  curso: string;
}

const cursos = [
  { id: 1, nome: "Desenvolvimento Web" },
  { id: 2, nome: "Banco de Dados" },
  { id: 3, nome: "Programação em JavaScript" }
];

const matriculas: Matricula[] = [];

// GET /cursos
app.get("/cursos", (req: Request, res: Response) => {
  res.status(200).json(cursos);
});

// POST /matricula
app.post("/matricula", (req: Request, res: Response) => {
  const { nomeCompleto, email, curso } = req.body as Matricula;

  if (!nomeCompleto || !email || !curso) {
    return res.status(400).json({
      mensagem: "Todos os campos são obrigatórios."
    });
  }

  matriculas.push({ nomeCompleto, email, curso });

  return res.status(201).json({
    mensagem: "Matrícula realizada com sucesso!"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});