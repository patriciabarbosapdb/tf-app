// =====================================================
// NOSSO LUGAR — CONFIGURAÇÕES
// =====================================================

async function loadSettings() {

  const user =
    await getCurrentUser();

  if (!user) return;


  const nameInput =
    document.getElementById(
      "settingsName"
    );

  const emailInput =
    document.getElementById(
      "settingsEmail"
    );


  if (nameInput) {

    nameInput.value =
      user.user_metadata?.name ||
      "";

  }


  if (emailInput) {

    emailInput.value =
      user.email ||
      "";

  }

}


// =====================================================
// GUARDAR PERFIL
// =====================================================

function setupSaveProfile() {

  const button =
    document.getElementById(
      "saveProfile"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const name =
        document
          .getElementById("settingsName")
          .value
          .trim();


      if (!name) {

        notify(
          "Escreve o teu nome."
        );

        return;
      }


      button.disabled = true;


      try {

        const {
          error
        } =
          await db.auth.updateUser({
            data: {
              name
            }
          });


        if (error) {
          throw error;
        }


        // Atualiza também o nome
        // mostrado na barra lateral.

        document
          .querySelectorAll(
            ".sister-card strong"
          )
          .forEach(
            element => {
              element.textContent =
                name;
            }
          );


        notify(
          "Perfil atualizado ♡"
        );


      } catch (error) {

        console.error(
          "Erro ao atualizar perfil:",
          error
        );


        alert(
          "Não foi possível atualizar o perfil:\n\n" +
          (error.message || error)
        );


      } finally {

        button.disabled = false;

      }

    }
  );

}


// =====================================================
// ALTERAR SENHA
// =====================================================

function setupChangePassword() {

  const button =
    document.getElementById(
      "changePassword"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const password =
        document
          .getElementById("newPassword")
          .value;


      if (!password || password.length < 6) {

        notify(
          "A senha precisa ter pelo menos 6 caracteres."
        );

        return;
      }


      button.disabled = true;


      try {

        const {
          error
        } =
          await db.auth.updateUser({
            password
          });


        if (error) {
          throw error;
        }


        document
          .getElementById(
            "newPassword"
          )
          .value = "";


        notify(
          "Senha alterada com sucesso ♡"
        );


      } catch (error) {

        console.error(
          "Erro ao alterar senha:",
          error
        );


        alert(
          "Não foi possível alterar a senha:\n\n" +
          (error.message || error)
        );


      } finally {

        button.disabled = false;

      }

    }
  );

}


// =====================================================
// TERMINAR SESSÃO
// =====================================================

function setupLogout() {

  const button =
    document.getElementById(
      "logoutButton"
    );

  if (!button) return;


  button.addEventListener(
    "click",
    async () => {

      const confirmed =
        confirm(
          "Queres mesmo terminar a sessão?"
        );


      if (!confirmed) return;


      try {

        const {
          error
        } =
          await db.auth.signOut();


        if (error) {
          throw error;
        }


      } catch (error) {

        console.error(
          "Erro ao terminar sessão:",
          error
        );


        alert(
          "Não foi possível terminar a sessão:\n\n" +
          (error.message || error)
        );

      }

    }
  );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupSaveProfile();

    setupChangePassword();

    setupLogout();

    await loadSettings();

  }
);
