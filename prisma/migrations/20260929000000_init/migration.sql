CREATE TYPE "Modalidade" AS ENUM ('GRUPO', 'DEZENA', 'CENTENA', 'MILHAR', 'DUQUE', 'TERNO');
CREATE TYPE "StatusPule" AS ENUM ('PENDENTE', 'PREMIADA', 'PERDIDA');

CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Pule" (
  "id" TEXT NOT NULL,
  "codigo" TEXT NOT NULL,
  "modalidade" "Modalidade" NOT NULL,
  "numeros" TEXT[],
  "valorPago" DECIMAL(12,2) NOT NULL,
  "valorRecebido" DECIMAL(12,2) NOT NULL,
  "troco" DECIMAL(12,2) NOT NULL,
  "multiplicador" DECIMAL(10,2) NOT NULL,
  "valorPremio" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "StatusPule" NOT NULL DEFAULT 'PENDENTE',
  "sorteioId" TEXT,
  CONSTRAINT "Pule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sorteio" (
  "id" TEXT NOT NULL,
  "data" DATE NOT NULL,
  "primeiro" INTEGER NOT NULL,
  "segundo" INTEGER NOT NULL,
  "terceiro" INTEGER NOT NULL,
  "quarto" INTEGER NOT NULL,
  "quinto" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sorteio_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Pule_codigo_key" ON "Pule"("codigo");
CREATE INDEX "Pule_dataHora_idx" ON "Pule"("dataHora");
CREATE INDEX "Pule_status_idx" ON "Pule"("status");
CREATE UNIQUE INDEX "Sorteio_data_key" ON "Sorteio"("data");
ALTER TABLE "Pule" ADD CONSTRAINT "Pule_sorteioId_fkey" FOREIGN KEY ("sorteioId") REFERENCES "Sorteio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
