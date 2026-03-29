-- CreateEnum
CREATE TYPE "OcorrenciaStatus" AS ENUM ('ABERTA', 'RESOLVIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "NotificacaoCanal" AS ENUM ('SMS', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificacaoStatus" AS ENUM ('PENDENTE', 'ENVIADA', 'FALHA');

-- CreateTable
CREATE TABLE "proprietarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "telefone" VARCHAR(20),
    "email" VARCHAR(150),
    "endereco" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "proprietarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animais" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" VARCHAR(80) NOT NULL,
    "raca" VARCHAR(80),
    "porte" VARCHAR(30),
    "sexo" VARCHAR(20),
    "cor" VARCHAR(50),
    "data_nascimento" TIMESTAMP(3),
    "proprietario_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "animais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identificacoes" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "animal_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "identificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentes" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" VARCHAR(30) NOT NULL,
    "telefone" VARCHAR(20),
    "email" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "agentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" UUID NOT NULL,
    "animal_id" UUID NOT NULL,
    "agente_id" UUID NOT NULL,
    "local" VARCHAR(255) NOT NULL,
    "descricao" VARCHAR(500) NOT NULL,
    "data_ocorrencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OcorrenciaStatus" NOT NULL DEFAULT 'ABERTA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ocorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" UUID NOT NULL,
    "ocorrencia_id" UUID NOT NULL,
    "proprietario_id" UUID NOT NULL,
    "mensagem" VARCHAR(500) NOT NULL,
    "canal" "NotificacaoCanal" NOT NULL DEFAULT 'SMS',
    "status" "NotificacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "data_envio" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proprietarios_cpf_key" ON "proprietarios"("cpf");

-- CreateIndex
CREATE INDEX "animais_proprietario_id_idx" ON "animais"("proprietario_id");

-- CreateIndex
CREATE UNIQUE INDEX "identificacoes_codigo_key" ON "identificacoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "identificacoes_animal_id_key" ON "identificacoes"("animal_id");

-- CreateIndex
CREATE UNIQUE INDEX "agentes_matricula_key" ON "agentes"("matricula");

-- CreateIndex
CREATE INDEX "ocorrencias_animal_id_idx" ON "ocorrencias"("animal_id");

-- CreateIndex
CREATE INDEX "ocorrencias_agente_id_idx" ON "ocorrencias"("agente_id");

-- CreateIndex
CREATE INDEX "notificacoes_ocorrencia_id_idx" ON "notificacoes"("ocorrencia_id");

-- CreateIndex
CREATE INDEX "notificacoes_proprietario_id_idx" ON "notificacoes"("proprietario_id");

-- AddForeignKey
ALTER TABLE "animais" ADD CONSTRAINT "animais_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identificacoes" ADD CONSTRAINT "identificacoes_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_agente_id_fkey" FOREIGN KEY ("agente_id") REFERENCES "agentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_ocorrencia_id_fkey" FOREIGN KEY ("ocorrencia_id") REFERENCES "ocorrencias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "proprietarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
