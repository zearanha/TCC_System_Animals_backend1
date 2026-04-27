-- AlterTable
ALTER TABLE "proprietarios"
ADD COLUMN "foto_perfil_url" VARCHAR(500);

-- CreateTable
CREATE TABLE "identificacao_imagens" (
    "id" UUID NOT NULL,
    "identificacao_id" UUID NOT NULL,
    "imagem_url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "identificacao_imagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "identificacao_imagens_identificacao_id_idx"
ON "identificacao_imagens"("identificacao_id");

-- AddForeignKey
ALTER TABLE "identificacao_imagens"
ADD CONSTRAINT "identificacao_imagens_identificacao_id_fkey"
FOREIGN KEY ("identificacao_id") REFERENCES "identificacoes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
