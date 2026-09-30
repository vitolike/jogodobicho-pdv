import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL ?? "http://localhost";
const browser = await chromium.launch({ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true });

const medidas = async (largura, altura, nome) => {
  const page = await browser.newPage({ viewport: { width: largura, height: altura } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const grupo = await page.evaluate(() => {
    const box = (b) => b?.getBoundingClientRect();
    const byText = (t) => [...document.querySelectorAll("button")].find((b) => b.textContent?.includes(t));
    const tiles = [...document.querySelectorAll('[aria-labelledby="bichos-title"] button')].map((b) => b.getBoundingClientRect());
    const section = document.querySelector('[aria-labelledby="bichos-title"]');
    const grade = section?.querySelector("div.grid");
    return {
      scrollY: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      scrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      header: box(document.querySelector("header")),
      section: box(section),
      sectionOverflow: section ? section.scrollHeight - section.clientHeight : 0,
      grade: box(grade),
      gradeOverflow: grade ? grade.scrollHeight - grade.clientHeight : 0,
      bicho: tiles[0],
      menorTile: Math.min(...tiles.map((t) => t.height)),
      dentroDaTela: tiles.every((t) => t.bottom <= window.innerHeight && t.top >= 0),
      aside: box(document.querySelector("aside")),
      asideSoma: [...document.querySelectorAll("aside > section")].map((s) => Math.round(s.getBoundingClientRect().height)),
      emitir: box(byText("EMITIR PULE")),
      limpar: box(byText("Limpar")),
    };
  });
  await page.screenshot({ path: `.artifacts/${nome}.png` });
  // grupo + toque real
  await page.locator('[aria-pressed]').first().click();
  const marcado = await page.locator('[aria-pressed="true"]').count();
  await page.getByRole("button", { name: "DEZENA" }).click();
  await page.waitForTimeout(150);
  const numerica = await page.evaluate(() => {
    const byText = (t) => [...document.querySelectorAll("button")].find((b) => b.textContent?.includes(t));
    const teclas = [...document.querySelectorAll('button[aria-label="1"], button[aria-label="2"], button[aria-label="3"]')].map((b) => b.getBoundingClientRect());
    return {
      scrollY: document.documentElement.scrollHeight - document.documentElement.clientHeight,
      aside: Math.round(document.querySelector("aside")?.getBoundingClientRect().height ?? 0),
      asideSoma: [...document.querySelectorAll("aside > section")].map((s) => Math.round(s.getBoundingClientRect().height)),
      numpad: document.querySelector('button[aria-label="1"]')?.getBoundingClientRect(),
      teclasVisiveis: teclas.every((t) => t.bottom <= window.innerHeight && t.top >= 0),
      emitir: byText("EMITIR PULE")?.getBoundingClientRect(),
    };
  });
  await page.screenshot({ path: `.artifacts/${nome}-dezena.png` });
  await page.close();
  const r = (b) => (b ? `${Math.round(b.width)}x${Math.round(b.height)}@${Math.round(b.y)}` : "ausente");
  console.log(nome, JSON.stringify({ grupo: { scrollY: grupo.scrollY, scrollX: grupo.scrollX, overflow: grupo.sectionOverflow + grupo.gradeOverflow, header: r(grupo.header), section: r(grupo.section), bicho: r(grupo.bicho), menorTile: grupo.menorTile, todosNaTela: grupo.dentroDaTela, marcado, aside: r(grupo.aside), asideSoma: grupo.asideSoma, emitir: r(grupo.emitir), limpar: r(grupo.limpar) }, dezena: { scrollY: numerica.scrollY, teclasVisiveis: numerica.teclasVisiveis, aside: numerica.aside, asideSoma: numerica.asideSoma, numpad: r(numerica.numpad), emitir: r(numerica.emitir) } }));
};

await medidas(360, 640, "mobile-360x640");
await medidas(390, 844, "mobile-390x844");
await medidas(320, 568, "mobile-320x568");
await browser.close();
