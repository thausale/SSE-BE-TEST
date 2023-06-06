import express from "express";
import morgan from "morgan";
import cors from "cors";
import { nanoid } from "nanoid";

const app = express();
app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

const stuff = [
  {
    id: nanoid(),
    from: "David",
    text: "handdoeken",
  },
  {
    id: nanoid(),
    from: "Mehdi",
    text: "vape",
  },
  {
    id: nanoid(),
    from: "Mehdi",
    text: "Badmuts",
  },
];

app.post("/stuff", (req, res) => {
  stuff.push({
    id: nanoid(),
    ...req.body,
  });
  res.json({ status: "ok" });
  sendToAllClients();
});

app.get("/stuff", (req, res) => {
  res.json(stuff);
});
app.get("/", (req, res) => {
  "Hello World";
});

const clients = [];
app.get("/sse", (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };

  const client = {
    time: Date.now(),
    name: req.query.name,
  };
  clients.push({
    ...client,
    res: res,
  });

  const clientsNumber = clients.length;

  res.writeHead(200, headers);

  sendToAllClients();

  const heartbeatInterval = setInterval(() => {
    res.write(": heartbeat\n");
  }, 5000);

  req.on("close", () => {
    console.log(`Connection closed from ${client.name}.`);
    clients.splice(
      clients.findIndex((c) => c.time === client.time),
      1
    );
    clearInterval(heartbeatInterval); // Clear the heartbeat interval when the connection is closed
  });
});

function sendToAllClients() {
  const clientsNumber = clients.length;

  clients.forEach((c) =>
    c.res.write(`data: ${JSON.stringify({ stuff, number: clientsNumber })}\n\n`)
  );
}

app.listen("1234", function () {
  console.log("🚀 Server is listening on localhost:1234");
});
