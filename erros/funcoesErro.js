export default function trataErros(erro) {

    const errosConhecidos = {
        ENOENT: 'Arquivo não encontrado.',
        EACCES: 'Permissão negada para acessar o arquivo.',
        EISDIR: 'O caminho informado corresponde a um diretório.',
        ENOTDIR: 'Um componente do caminho não é um diretório.',
        EEXIST: 'O arquivo ou diretório já existe.',
        EMFILE: 'Limite de arquivos abertos atingido.',
        ENOSPC: 'Espaço insuficiente no dispositivo.'
    };

    // Verifica se o erro é válido.
    if (!erro || typeof erro !== 'object') {
        return 'Erro desconhecido na aplicação.';
    }

    // Identifica erros conhecidos.
    if (erro.code && errosConhecidos[erro.code]) {
        throw new Error(errosConhecidos[erro.code]);
    }

    // Registra erros inesperados.
    console.error('Erro inesperado:', erro);

    return 'Erro inesperado na aplicação.';

}
