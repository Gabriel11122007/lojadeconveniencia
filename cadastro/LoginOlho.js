function toggleSenhaCadastro() {
    const input = document.getElementById('senha-cadastro');
    input.type = input.type === 'password' ? 'text' : 'password';
}
function toggleSenhaConfirmar() {
    const input = document.getElementById('confirmar-senha');
    input.type = input.type === 'password' ? 'text' : 'password';
}
function toggleSenhaLogin() {
    const input = document.getElementById('senha-Login');
    input.type = input.type === 'password' ? 'text' : 'password';
}