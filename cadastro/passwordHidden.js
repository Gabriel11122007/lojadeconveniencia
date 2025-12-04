function toggleSenha(idInput, btn) {
  const input = document.getElementById(idInput);
  const icon = btn.querySelector('img');

  if (input.type === 'password') {
    input.type = 'text';
    icon.src = 'https://img.icons8.com/?size=100&id=121539&format=png&color=000000'; // link olho aberto
  } else {
    input.type = 'password';
    icon.src = 'https://img.icons8.com/?size=100&id=85028&format=png&color=000000'; // link olho fechado
  }
}
