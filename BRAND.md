# HUB Corretores Litoral SC — Brand Guide

## Contexto
O HUB Corretores Litoral SC centraliza oportunidades, pedidos, anúncios, patrocinadores, negócios e conexões do mercado imobiliário e de serviços do litoral catarinense.

## Logos
- Logo azul: `/brand/logoazul.png`
  Usar em fundos claros.
- Logo branca: `/brand/logobranca.png`
  Usar em fundos escuros, azul navy ou sobre imagens.
- Logo com fundo: `/brand/logocomfundo.png`
  Usar apenas quando precisar preservar contraste ou em materiais institucionais.

## Paleta
- Laranja: `#F9A12B`
- Laranja escuro: `#E88D18`
- Azul: `#244F9E`
- Azul escuro: `#183B7A`
- Navy: `#082B3A`
- Navy escuro: `#051C28`
- Branco: `#FFFFFF`
- Fundo: `#F6F8FA`
- Surface: `#FFFFFF`
- Surface soft: `#F1F5F9`
- Texto: `#102433`
- Muted: `#607586`
- Borda: `#DCE6EF`
- Sucesso: `#16A34A`
- Aviso: `#F59E0B`
- Perigo: `#DC2626`
- Info: `#2563EB`

## Direção visual
A marca deve transmitir:
- confiança
- regionalidade
- oportunidade
- comunidade
- negócios
- tecnologia própria
- profissionalismo

Evitar:
- visual genérico de SaaS
- excesso de verde/água
- cores fora da identidade
- botões sem contraste
- muitas cores competindo entre si

## Uso recomendado
- Fundo escuro institucional: navy
- Destaques e CTAs: laranja
- Links e elementos de navegação: azul
- Cards e áreas de formulário: branco
- Textos principais: `brand-text`
- Textos secundários: `brand-muted`

## Arquivos de marca
- Tokens CSS globais: `src/styles/brand.css`
- Referência TypeScript: `src/config/brand.ts`
- Configuração Tailwind: `tailwind.config.js`

## Exemplos de uso das logos
Use os caminhos centralizados em `src/config/brand.ts`.

```tsx
import { brand } from './config/brand';

export function HeaderLogo() {
  return (
    <img
      className="brand-logo brand-logo-md"
      src={brand.logos.blue}
      alt={brand.name}
    />
  );
}
```

Para fundo escuro:

```tsx
<img className="brand-logo brand-logo-sm" src={brand.logos.white} alt={brand.name} />
```

## Exemplos de uso das classes globais
As classes em `src/styles/brand.css` servem para novas telas e componentes simples.

```tsx
<section className="brand-page-bg">
  <div className="brand-card">
    <p className="brand-eyebrow">Oportunidades</p>
    <h1 className="brand-section-title">Negócios do litoral em um só lugar</h1>
    <a className="brand-link" href="/dashboard">Acessar painel</a>
  </div>
</section>
```

Botões e campos:

```tsx
<button className="brand-button-primary">Salvar</button>
<button className="brand-button-secondary">Cancelar</button>
<input className="brand-input" placeholder="Buscar oportunidade" />
```

## Como aplicar branding em novas telas
- Prefira tokens de `src/styles/brand.css`, como `var(--brand-orange)` e `var(--brand-text)`.
- Em Tailwind, use classes como `bg-brand-bg`, `text-brand-text`, `text-brand-muted`, `border-brand-border`, `bg-brand-orange` e `text-brand-blue`.
- Use `shadow-brand-sm`, `shadow-brand-md` e `shadow-brand-lg` para profundidade consistente.
- Use `rounded-brand-sm`, `rounded-brand-md`, `rounded-brand-lg` e `rounded-brand-xl` para bordas padronizadas.
- Para logos, importe `brand` de `src/config/brand.ts` e escolha a versão adequada ao contraste do fundo.

## Regra para futuras telas
Toda nova tela ou componente deve reutilizar os tokens definidos em src/styles/brand.css ou no Tailwind config. Evite cores hardcoded diretamente nos componentes. Quando precisar de logo, use os caminhos definidos em src/config/brand.ts.
