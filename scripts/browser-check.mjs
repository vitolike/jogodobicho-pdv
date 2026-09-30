import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";

const inicio = new Date();
process.loadEnvFile(".env");
const output = ".artifacts";
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const sorteioData = new Date(`${hoje}T12:00:00.000Z`);
const premios = [1234, 5678, 9012, 3456, 7890];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true });
const prisma = new PrismaClient();
const errors = [];
const checks = {};
let testCode;

function check(nome, valor) {
  checks[nome] = valor;
  if (!valor) throw new Error(`Falhou: ${nome}`);
}

try {
  if (await prisma.sorteio.findUnique({ where: { data: sorteioData } })) throw new Error(`Já existe sorteio em ${hoje}; a verificação destrutiva foi abortada para não apagar dados reais.`);

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("console", (message) => { if (message.type() === "error" || message.type() === "warning") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const grupos = page.locator("button[aria-pressed]");
  check("gradeCom25Grupos", await grupos.count() === 25);
  await grupos.first().click();
  check("toqueSelecionaGrupo", await grupos.first().getAttribute("aria-pressed") === "true");
  check("limparTemAreaDeToque", await page.getByRole("button", { name: /Limpar/ }).boundingBox().then((b) => b.height >= 44));
  await page.screenshot({ path: `${output}/pdv-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 320, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  check("semRolagemHorizontal320", !await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth));
  await page.getByRole("button", { name: "DEZENA" }).click();
  check("gradeOcultaEmModalidadeNumerica", await page.locator("button[aria-pressed]").count() === 0);
  const numpad = page.getByRole("button", { name: "1", exact: true });
  check("numpadAcimaDaDobra", await numpad.boundingBox().then((b) => b.y < 844));
  check("numpadTemAreaDeToque", await numpad.boundingBox().then((b) => b.height >= 44));
  await numpad.click();
  await page.getByRole("button", { name: "2", exact: true }).click();
  check("numpadMontaDezena", (await page.locator("output").innerText()).trim() === "12");
  await page.getByRole("button", { name: "EMITIR PULE" }).click();
  const dialog = page.getByRole("dialog", { name: "Pule emitida" });
  await dialog.waitFor();
  testCode = (await dialog.innerText()).match(/JB-\d{6}-[A-Z0-9]{6}/)?.[0];
  check("puleComCodigoUnico", Boolean(testCode));
  check("focoInicialNoDialogo", await page.evaluate(() => document.activeElement?.textContent?.trim()) === "Voltar");
  await page.keyboard.press("Escape");
  await dialog.waitFor({ state: "hidden" });
  await page.screenshot({ path: `${output}/pdv-mobile.png`, fullPage: true });

  check("apiAdminExigeLogin", (await page.request.get(`${baseUrl}/api/admin/resumo?data=${hoje}`)).status() === 401);

  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("E-mail").fill(process.env.ADMIN_EMAIL);
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "ENTRAR" }).click();
  await page.waitForURL("**/admin");
  await page.getByRole("heading", { name: "Resultado do dia" }).waitFor();
  check("loginAdmin", true);
  check("dataDeCalendarioInvalidaRejeitada", (await page.request.get(`${baseUrl}/api/admin/resumo?data=2026-02-31`)).status() === 400);

  for (const [i, premio] of premios.entries()) await page.getByLabel(`${i + 1}º prêmio`).fill(String(premio));
  await page.getByRole("button", { name: "APURAR PULES" }).click();
  // sortear() chama carregar(), que limpa a mensagem; o sinal de sucesso é o painel.
  await page.getByRole("heading", { name: "Pules premiadas" }).waitFor();
  const vencedora = page.locator("li", { hasText: testCode });
  check("listaPulesPremiadas", await vencedora.isVisible());
  check("premioPagoNaApuracao", (await vencedora.innerText()).replace(/\s+/g, " ").includes("R$ 300,00"));

  const posterior = await page.request.post(`${baseUrl}/api/pules`, { data: { modalidade: "GRUPO", numeros: ["1"], valorPago: 5, valorRecebido: 5 } });
  check("apostaAposSorteioRecusada", posterior.status() === 409 && (await posterior.json()).error === "O movimento de hoje já foi encerrado.");

  const resumo = await (await page.request.get(`${baseUrl}/api/admin/resumo?data=${hoje}`)).json();
  // a pule criada aqui é a única PREMIADA; o total pode incluir pules de outros testes do mesmo dia.
  check("caixaConfere", resumo.totalPules >= 1 && resumo.arrecadado >= 5 && resumo.premios === 300 && resumo.resultado === resumo.arrecadado - 300);  await page.screenshot({ path: `${output}/admin-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Pules premiadas" }).waitFor();
  check("diaEncerradoNoPainel", await page.getByRole("button", { name: "SORTEIO JÁ FECHADO" }).isVisible());
  await page.screenshot({ path: `${output}/admin-desktop.png`, fullPage: true });

  check("consoleLimpo", errors.length === 0);
  if (errors.length) throw new Error(`Console: ${errors.join(" | ")}`);
  console.log(JSON.stringify({ ...checks, data: hoje, pule: testCode }, null, 2));
} finally {
  // limpa tudo que este teste criou, mesmo se falhou no meio; o anchor é o instante de início.
  await prisma.pule.deleteMany({ where: { dataHora: { gte: inicio } } });
  await prisma.sorteio.deleteMany({ where: { data: sorteioData } });
  await prisma.$disconnect();
  await browser.close();
}
