const html = document.documentElement;

const botaoMenu = document.getElementById('botaoMenu');
const menuPrincipal = document.getElementById('menuPrincipal');
const botaoTema = document.getElementById('botaoTema');
const botaoAcessibilidade = document.getElementById('botaoAcessibilidade');
const painelAcessibilidade = document.getElementById('painelAcessibilidade');
const statusAcessibilidade = document.getElementById('statusAcessibilidade');
const botaoRestaurarAcessibilidade = document.getElementById('botaoRestaurarAcessibilidade');
const linksMenu = Array.from(menuPrincipal.querySelectorAll('a[href^="#"]'));

const opcoes = {
    altoContraste: document.getElementById('opcaoAltoContraste'),
    reduzirMovimento: document.getElementById('opcaoReduzirMovimento'),
    textoMaior: document.getElementById('opcaoTextoMaior'),
    focoReforcado: document.getElementById('opcaoFocoReforcado'),
    linksSublinhados: document.getElementById('opcaoLinksSublinhados')
};

const CHAVE_TEMA = 'theme';
const CHAVE_ACESSIBILIDADE = 'a11y-settings';
const MEDIA_TEMA_SISTEMA = window.matchMedia('(prefers-color-scheme: dark)');

const PADRAO_ACESSIBILIDADE = {
    altoContraste: false,
    reduzirMovimento: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    textoMaior: false,
    focoReforcado: false,
    linksSublinhados: false
};

const MAPA_ATRIBUTOS = {
    altoContraste: ['data-contrast', 'high'],
    reduzirMovimento: ['data-motion', 'reduced'],
    textoMaior: ['data-font', 'large'],
    focoReforcado: ['data-focus', 'strong'],
    linksSublinhados: ['data-links', 'underlined']
};

function storageGet(chave) {
    return localStorage.getItem(chave);
}

function storageSet(chave, valor) {
    localStorage.setItem(chave, valor);
}

function anunciar(mensagem) {
    statusAcessibilidade.textContent = '';
    requestAnimationFrame(() => {
        statusAcessibilidade.textContent = mensagem;
    });
}

function aplicarTema(tema) {
    html.setAttribute('data-theme', tema);
    storageSet(CHAVE_TEMA, tema);
    botaoTema.textContent = tema === 'dark' ? '☀️' : '🌙';
    botaoTema.setAttribute('aria-label', `Tema atual: ${tema}. Clique para alternar.`);
}

function fecharMenu() {
    menuPrincipal.classList.remove('aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
}

function abrirPainel(abrir) {
    painelAcessibilidade.hidden = !abrir;
    botaoAcessibilidade.setAttribute('aria-expanded', String(abrir));
    if (abrir) {
        opcoes.altoContraste.focus();
    }
}

function aplicarAcessibilidade(configuracao) {
    Object.entries(MAPA_ATRIBUTOS).forEach(([nome, [atributo, valor]]) => {
        if (configuracao[nome]) {
            html.setAttribute(atributo, valor);
        } else {
            html.removeAttribute(atributo);
        }
    });
}

function lerConfiguracaoSalva() {
    try {
        const salvo = JSON.parse(storageGet(CHAVE_ACESSIBILIDADE) || '{}');
        return {
            ...PADRAO_ACESSIBILIDADE,
            altoContraste: Boolean(salvo.altoContraste),
            reduzirMovimento: Boolean(salvo.reduzirMovimento ?? PADRAO_ACESSIBILIDADE.reduzirMovimento),
            textoMaior: Boolean(salvo.textoMaior),
            focoReforcado: Boolean(salvo.focoReforcado),
            linksSublinhados: Boolean(salvo.linksSublinhados)
        };
    } catch {
        return { ...PADRAO_ACESSIBILIDADE };
    }
}

function lerConfiguracaoDoPainel() {
    return {
        altoContraste: opcoes.altoContraste.checked,
        reduzirMovimento: opcoes.reduzirMovimento.checked,
        textoMaior: opcoes.textoMaior.checked,
        focoReforcado: opcoes.focoReforcado.checked,
        linksSublinhados: opcoes.linksSublinhados.checked
    };
}

function preencherPainel(configuracao) {
    Object.entries(opcoes).forEach(([nome, campo]) => {
        campo.checked = Boolean(configuracao[nome]);
    });
}

function atualizarLinkAtivo(idSecao) {
    linksMenu.forEach((link) => {
        link.classList.remove('link-ativo');
        link.removeAttribute('aria-current');

        if (link.getAttribute('href') === `#${idSecao}`) {
            link.classList.add('link-ativo');
            link.setAttribute('aria-current', 'page');
        }
    });
}

function iniciarMarcacaoNavegacaoAtiva() {
    const secoesObservaveis = linksMenu
        .map((link) => {
            const id = link.getAttribute('href').slice(1);
            const elemento = document.getElementById(id);
            return elemento ? { id, elemento } : null;
        })
        .filter(Boolean);

    if (!secoesObservaveis.length) {
        return;
    }

    const hashAtual = window.location.hash.replace('#', '');
    if (hashAtual) {
        atualizarLinkAtivo(hashAtual);
    } else {
        atualizarLinkAtivo(secoesObservaveis[0].id);
    }

    const obterOffsetAtivacao = () => {
        const cabecalho = document.querySelector('.cabecalho');
        return (cabecalho ? cabecalho.offsetHeight : 0) + 24;
    };

    const atualizarPorScroll = () => {
        const referencia = window.scrollY + obterOffsetAtivacao();
        let idAtual = secoesObservaveis[0].id;

        secoesObservaveis.forEach(({ id, elemento }) => {
            if (referencia >= elemento.offsetTop) {
                idAtual = id;
            }
        });

        atualizarLinkAtivo(idAtual);
    };

    let scrollAgendado = false;
    window.addEventListener('scroll', () => {
        if (scrollAgendado) {
            return;
        }

        scrollAgendado = true;
        requestAnimationFrame(() => {
            atualizarPorScroll();
            scrollAgendado = false;
        });
    });

    window.addEventListener('resize', atualizarPorScroll);

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            atualizarLinkAtivo(hash);
        } else {
            atualizarPorScroll();
        }
    });

    atualizarPorScroll();
}

// Estado inicial.
const temaSalvo = storageGet(CHAVE_TEMA);
aplicarTema(temaSalvo || (MEDIA_TEMA_SISTEMA.matches ? 'dark' : 'light'));

const configuracaoInicial = lerConfiguracaoSalva();
preencherPainel(configuracaoInicial);
aplicarAcessibilidade(configuracaoInicial);
abrirPainel(false);

// Menu.
botaoMenu.addEventListener('click', () => {
    menuPrincipal.classList.toggle('aberto');
    botaoMenu.setAttribute('aria-expanded', String(menuPrincipal.classList.contains('aberto')));
});

menuPrincipal.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', fecharMenu);
});

iniciarMarcacaoNavegacaoAtiva();

// Tema.
botaoTema.addEventListener('click', () => {
    const temaAtual = html.getAttribute('data-theme');
    const proximoTema = temaAtual === 'dark' ? 'light' : 'dark';
    aplicarTema(proximoTema);
    anunciar(`Tema alterado para ${proximoTema === 'dark' ? 'escuro' : 'claro'}.`);
});

const onTemaSistemaChange = (evento) => {
    if (!storageGet(CHAVE_TEMA)) {
        aplicarTema(evento.matches ? 'dark' : 'light');
    }
};

MEDIA_TEMA_SISTEMA.addEventListener('change', onTemaSistemaChange);

// Painel de acessibilidade.
botaoAcessibilidade.addEventListener('click', () => {
    abrirPainel(painelAcessibilidade.hidden);
});

Object.values(opcoes).forEach((campo) => {
    campo.addEventListener('change', () => {
        const configuracao = lerConfiguracaoDoPainel();
        aplicarAcessibilidade(configuracao);
        storageSet(CHAVE_ACESSIBILIDADE, JSON.stringify(configuracao));
        anunciar('Preferencias de acessibilidade atualizadas.');
    });
});

botaoRestaurarAcessibilidade.addEventListener('click', () => {
    preencherPainel(PADRAO_ACESSIBILIDADE);
    aplicarAcessibilidade(PADRAO_ACESSIBILIDADE);
    storageSet(CHAVE_ACESSIBILIDADE, JSON.stringify(PADRAO_ACESSIBILIDADE));
    anunciar('Preferencias de acessibilidade restauradas para o padrao.');
});

// Comportamentos globais.
document.addEventListener('click', (evento) => {
    const clicouNoMenu = menuPrincipal.contains(evento.target) || botaoMenu.contains(evento.target);
    if (!clicouNoMenu) {
        fecharMenu();
    }

    const clicouNoPainel = painelAcessibilidade.contains(evento.target) || botaoAcessibilidade.contains(evento.target);
    if (!clicouNoPainel && !painelAcessibilidade.hidden) {
        abrirPainel(false);
    }
});

document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
        abrirPainel(false);
        fecharMenu();
        botaoAcessibilidade.focus();
    }

    if (evento.altKey && evento.key.toLowerCase() === 'a') {
        evento.preventDefault();
        abrirPainel(painelAcessibilidade.hidden);
        anunciar('Painel de acessibilidade alternado.');
    }
});
