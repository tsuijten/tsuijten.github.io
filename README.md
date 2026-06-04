# suijten.nl

De persoonlijke website van Thijs Suijten — engineer die z'n code inzet voor
iets groters. Gebouwd met [Jekyll](https://jekyllrb.com/) en meertalig (NL/EN)
via [jekyll-polyglot](https://github.com/untra/polyglot).

## Lokaal draaien

```bash
bundle install
bundle exec jekyll serve
```

De site draait dan op <http://localhost:4000>.

> Let op: tijdens `jekyll serve` wijzen de links in de taalwisselaar naar het
> productiedomein, niet naar localhost. Dat is gewenst gedrag.

## Bouwen

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

Output komt in `_site/`.

## Structuur

```
_config.yml              # site- en polyglot-configuratie (NL = standaard, EN = /en/)
_data/
  nl/                    # Nederlandse content (bron van waarheid)
    common.yml           # navigatie, footer, labels
    home.yml             # alle teksten van de homepage
    talks.yml            # alle teksten van de talks-pagina
  en/                    # Engelse content — NOG TE VERTALEN (placeholder = NL)
_includes/
  head.html              # <head>: SEO, hreflang, Open Graph, fonts, thema
  header.html            # navigatie + taalwisselaar + themaknop
  footer.html
  lang-switcher.html     # taalwisselaar (gebruikt polyglots `ferh`-attribuut)
  pages/                 # paginacontent (taalonafhankelijk, leest uit _data)
    home.html
    talks.html
_layouts/default.html
assets/css/main.scss     # design: "field notes / explorer", aardse tinten
assets/js/main.js        # thematoggle, mobiel menu, header-scroll
index.html / index.en.html   # wrappers -> /  en  /en/
talks.html / talks.en.html   # wrappers -> /talks/  en  /en/talks/
```

## Vertaling toevoegen (Engels)

De Engelse datafiles in `_data/en/` zijn nu kopieën van het Nederlands. Vertaal
de tekstwaarden en houd de structuur (sleutels) exact gelijk aan `_data/nl/`.

## Content aanpassen

Alle teksten staan in `_data/<taal>/*.yml`. Pas die aan; de HTML hoeft niet
aangeraakt te worden voor tekstwijzigingen.

## Deploy

GitHub Pages bouwt jekyll-polyglot niet zelf, daarom bouwt en publiceert
`.github/workflows/deploy.yml` de site via GitHub Actions bij elke push naar
`main`. Zet in de repo-instellingen **Pages -> Build and deployment -> Source**
op **GitHub Actions**.
