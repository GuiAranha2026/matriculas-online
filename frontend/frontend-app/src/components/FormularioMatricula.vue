<template>
  <main class="page">
    <section class="card" aria-labelledby="titulo">
      <header class="header">
        <h1 id="titulo">Matrícula em Cursos Online</h1>
        <p class="subtitle">Preencha seus dados e escolha um curso para se matricular.</p>
      </header>

      <form class="form" @submit.prevent="enviar">
        <!-- Nome -->
        <div class="field">
          <label for="nome">Nome completo</label>
          <input
            id="nome"
            v-model.trim="form.nomeCompleto"
            type="text"
            autocomplete="name"
            placeholder="Ex.: Guilherme Edmar Pereira Aranha"
            :aria-invalid="!!errors.nomeCompleto"
            :aria-describedby="errors.nomeCompleto ? 'err-nome' : undefined"
            @blur="validarNome()"
            @input="validarNome()"
          />
          <p v-if="errors.nomeCompleto" id="err-nome" class="error" role="alert">
            {{ errors.nomeCompleto }}
          </p>
        </div>

        <!-- Email -->
        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            autocomplete="email"
            placeholder="ex.: guilherme@email.com"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'err-email' : undefined"
            @blur="validarEmail()"
            @input="validarEmail()"
          />
          <p v-if="errors.email" id="err-email" class="error" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <!-- Curso -->
        <div class="field">
          <label for="curso">Curso</label>
          <select
            id="curso"
            v-model="form.curso"
            :disabled="loadingCursos"
            :aria-invalid="!!errors.curso"
            :aria-describedby="errors.curso ? 'err-curso' : undefined"
            @change="validarCurso()"
            @blur="validarCurso()"
          >
            <option value="" disabled>Selecione um curso</option>
            <option v-for="c in cursos" :key="c.id" :value="c.nome">
              {{ c.nome }}
            </option>
          </select>

          <p v-if="loadingCursos" class="hint" aria-live="polite">Carregando cursos…</p>

          <p v-if="errors.curso" id="err-curso" class="error" role="alert">
            {{ errors.curso }}
          </p>
        </div>

        <!-- Mensagens -->
        <div v-if="alert.message" class="alert" :class="alert.type" role="status" aria-live="polite">
          {{ alert.message }}
        </div>

        <!-- Botão -->
        <button class="btn" type="submit" :disabled="submitting || !podeEnviar">
          <span v-if="submitting">Enviando…</span>
          <span v-else>Realizar matrícula</span>
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import axios from "axios";

type Curso = { id: number; nome: string };

const API_BASE = "http://localhost:3000";

const cursos = ref<Curso[]>([]);
const loadingCursos = ref(false);
const submitting = ref(false);

const form = reactive({
  nomeCompleto: "",
  email: "",
  curso: ""
});

const errors = reactive({
  nomeCompleto: "",
  email: "",
  curso: ""
});

const alert = reactive<{ type: "success" | "error"; message: string }>({
  type: "success",
  message: ""
});

function limparAlert() {
  alert.message = "";
}

function validarNome() {
  if (!form.nomeCompleto) errors.nomeCompleto = "Informe seu nome completo.";
  else if (form.nomeCompleto.length < 3) errors.nomeCompleto = "Nome muito curto (mínimo 3 caracteres).";
  else errors.nomeCompleto = "";
}

function validarEmail() {
  if (!form.email) {
    errors.email = "Informe um e-mail válido.";
    return;
  }
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  errors.email = ok ? "" : "Formato de e-mail inválido (ex.: nome@dominio.com).";
}

function validarCurso() {
  errors.curso = form.curso ? "" : "Selecione um curso para continuar.";
}

const podeEnviar = computed(() => {
  return (
    form.nomeCompleto.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    !!form.curso &&
    !errors.nomeCompleto &&
    !errors.email &&
    !errors.curso
  );
});

async function carregarCursos() {
  loadingCursos.value = true;
  limparAlert();
  try {
    const resp = await axios.get<Curso[]>(`${API_BASE}/cursos`);
    cursos.value = resp.data;
  } catch (e) {
    alert.type = "error";
    alert.message = "Não foi possível carregar os cursos. Verifique se o backend está rodando.";
  } finally {
    loadingCursos.value = false;
  }
}

async function enviar() {
  // valida tudo antes de enviar
  validarNome();
  validarEmail();
  validarCurso();
  limparAlert();

  if (!podeEnviar.value) {
    alert.type = "error";
    alert.message = "Revise os campos destacados antes de enviar.";
    return;
  }

  submitting.value = true;
  try {
    const resp = await axios.post(`${API_BASE}/matricula`, {
      nomeCompleto: form.nomeCompleto,
      email: form.email,
      curso: form.curso
    });

    alert.type = "success";
    alert.message = resp.data?.mensagem ?? "Matrícula realizada com sucesso!";

    // limpa o formulário
    form.nomeCompleto = "";
    form.email = "";
    form.curso = "";
  } catch (err: any) {
    const msg = err?.response?.data?.mensagem;
    alert.type = "error";
    alert.message = msg || "Erro ao realizar matrícula. Tente novamente.";
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  carregarCursos();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #0b1220;
  color: #e8eefc;
}

.card {
  width: 100%;
  max-width: 520px;
  background: #121a2c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.header h1 {
  margin: 0 0 6px 0;
  font-size: 22px;
}
.subtitle {
  margin: 0 0 18px 0;
  opacity: 0.85;
  font-size: 14px;
}

.form {
  display: grid;
  gap: 14px;
}

.field {
  display: grid;
  gap: 6px;
}

label {
  font-size: 13px;
  opacity: 0.9;
}

input,
select {
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #0f1729;
  color: #e8eefc;
  outline: none;
}

input:focus,
select:focus {
  border-color: rgba(66, 184, 131, 0.8);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.18);
}

.error {
  margin: 0;
  font-size: 12px;
  color: #ff8a8a;
}

.hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.alert {
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.alert.success {
  background: rgba(66, 184, 131, 0.14);
  border-color: rgba(66, 184, 131, 0.35);
}
.alert.error {
  background: rgba(255, 90, 90, 0.12);
  border-color: rgba(255, 90, 90, 0.35);
}

.btn {
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: #42b883;
  color: #071321;
  font-weight: 700;
  transition: transform 0.06s ease, opacity 0.2s ease;
}
.btn:active {
  transform: translateY(1px);
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
