/**
 * Application principale pour CHRONIQUES D'OCCIDENT
 * Gestion des interactions, du filtrage des articles, du lecteur immersif,
 * du baromètre de risque et du menu sticky.
 */

import { ARTICLES, STRATEGIC_INDICATORS, CRISIS_SCENARIOS } from './data.js';

class StrategicApp {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.readerFontSize = 100; // pourcentage
    this.activeArticleId = null;

    this.initElements();
    this.initEvents();
    this.renderAll();
  }

  initElements() {
    // Navigation & Sticky
    this.header = document.getElementById('site-header');
    this.progressBar = document.getElementById('scroll-progress-bar');
    this.mobileToggle = document.getElementById('mobile-nav-toggle');
    this.mainNav = document.getElementById('main-nav');
    this.themeToggle = document.getElementById('theme-toggle-btn');

    // Hero Section
    this.heroContainer = document.getElementById('hero-featured-container');
    this.gaugeSidebar = document.getElementById('hero-gauge-container');

    // Articles & Filtres
    this.articlesGrid = document.getElementById('articles-grid');
    this.categoryPills = document.querySelectorAll('.category-pill');
    this.searchInput = document.getElementById('filter-search-input');
    this.articleCountLabel = document.getElementById('articles-count-label');

    // Baromètre & Scénarios
    this.barometerGrid = document.getElementById('barometer-grid');
    this.scenariosGrid = document.getElementById('scenarios-grid');

    // Modal Lecteur
    this.readerModal = document.getElementById('reader-modal');
    this.readerCloseBtn = document.getElementById('reader-close-btn');
    this.readerContainer = document.getElementById('reader-content-body');
    this.readerTitle = document.getElementById('reader-top-title');
    this.fontIncreaseBtn = document.getElementById('font-increase');
    this.fontDecreaseBtn = document.getElementById('font-decrease');
    this.shareArticleBtn = document.getElementById('share-article-btn');

    // Modal Recherche Globale
    this.searchModal = document.getElementById('search-modal');
    this.searchModalInput = document.getElementById('search-modal-input');
    this.searchResultsContainer = document.getElementById('search-results-container');
    this.searchTriggerBtn = document.getElementById('search-trigger-btn');
    this.searchModalClose = document.getElementById('search-modal-close');

    // Newsletter
    this.newsletterForm = document.getElementById('newsletter-form');
    this.toastContainer = document.getElementById('toast-container');
  }

  initEvents() {
    // Défilement (Sticky Header & Progress Bar)
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });

    // Menu Mobile
    if (this.mobileToggle && this.mainNav) {
      this.mobileToggle.addEventListener('click', () => {
        this.mainNav.classList.toggle('open');
      });
    }

    // Changement de Thème (Dark Obsidian / Editorial Clair)
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'editorial-light' ? 'dark' : 'editorial-light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        this.themeToggle.innerHTML = nextTheme === 'editorial-light' 
          ? '<i class="fas fa-moon"></i>' 
          : '<i class="fas fa-sun"></i>';
        this.showToast(nextTheme === 'editorial-light' ? 'Mode Éditorial Clair activé' : 'Mode Nocturne Tactique activé');
      });
    }

    // Filtrage par catégorie
    this.categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.categoryPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentCategory = e.currentTarget.dataset.category;
        this.renderArticles();
      });
    });

    // Recherche en temps réel
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderArticles();
      });
    }

    // Raccourci Clavier Ctrl + K pour la recherche
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    if (this.searchTriggerBtn) {
      this.searchTriggerBtn.addEventListener('click', () => this.openSearchModal());
    }
    if (this.searchModalClose) {
      this.searchModalClose.addEventListener('click', () => this.closeAllModals());
    }
    if (this.searchModal) {
      this.searchModal.addEventListener('click', (e) => {
        if (e.target === this.searchModal) this.closeAllModals();
      });
    }
    if (this.searchModalInput) {
      this.searchModalInput.addEventListener('input', (e) => {
        this.handleGlobalSearch(e.target.value);
      });
    }

    // Lecteur Modal Close & Actions
    if (this.readerCloseBtn) {
      this.readerCloseBtn.addEventListener('click', () => this.closeAllModals());
    }
    if (this.readerModal) {
      this.readerModal.addEventListener('click', (e) => {
        if (e.target === this.readerModal) this.closeAllModals();
      });
    }
    if (this.fontIncreaseBtn) {
      this.fontIncreaseBtn.addEventListener('click', () => {
        if (this.readerFontSize < 130) {
          this.readerFontSize += 10;
          this.readerContainer.style.fontSize = `${this.readerFontSize}%`;
        }
      });
    }
    if (this.fontDecreaseBtn) {
      this.fontDecreaseBtn.addEventListener('click', () => {
        if (this.readerFontSize > 85) {
          this.readerFontSize -= 10;
          this.readerContainer.style.fontSize = `${this.readerFontSize}%`;
        }
      });
    }
    if (this.shareArticleBtn) {
      this.shareArticleBtn.addEventListener('click', () => {
        const article = ARTICLES.find(a => a.id === this.activeArticleId);
        const baseUrl = window.location.origin + window.location.pathname;
        const articleUrl = article ? `${baseUrl}#${article.slug}` : window.location.href;
        navigator.clipboard?.writeText(articleUrl);
      });
    }

    // Formulaire Newsletter (Intégration Réelle Web3Forms / Formspree)
    if (this.newsletterForm) {
      this.newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const submitBtn = document.getElementById('newsletter-submit-btn');
        const accessKeyInput = document.getElementById('web3forms-access-key');
        
        if (!emailInput || !emailInput.value) return;

        const email = emailInput.value.trim();
        const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';

        // Si la clé est encore le placeholder de démonstration
        if (!accessKey || accessKey === 'VOTRE_CLE_WEB3FORMS_ICI') {
          this.showToast('ℹ️ Clé Web3Forms requise : obtenez votre clé gratuite sur web3forms.com');
          alert("Pour recevoir les emails dans votre vraie boîte personnelle :\n\n1. Allez sur https://web3forms.com (100% gratuit, sans inscription complexe)\n2. Saisissez votre adresse email pour recevoir votre 'Access Key'\n3. Collez votre clé dans index.html à la place de 'VOTRE_CLE_WEB3FORMS_ICI'\n\nToutes les inscriptions arriveront alors directement dans votre boîte email !");
          return;
        }

        // État de chargement
        const originalContent = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmission...';
        }

        try {
          const formData = new FormData(this.newsletterForm);
          const endpoint = this.newsletterForm.action || 'https://api.web3forms.com/submit';
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });

          const data = await response.json();

          if (response.ok && (data.success || data.status === 'success')) {
            this.showToast(`✅ Inscription confirmée ! ${email} a été enregistré.`);
            emailInput.value = '';
          } else {
            this.showToast(`❌ Erreur : ${data.message || 'Échec de transmission'}`);
          }
        } catch (err) {
          console.error('Erreur transmission Web3Forms / Formspree:', err);
          this.showToast('❌ Erreur de connexion avec le service de réception.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
          }
        }
      });
    }
  }

  handleScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }

    if (scrollTop > 40) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
  }

  renderAll() {
    this.renderHero();
    this.renderSidebarGauges();
    this.renderArticles();
    this.renderBarometer();
    this.renderScenarios();
  }

  renderHero() {
    const featured = ARTICLES.find(a => a.featured) || ARTICLES[0];
    if (!this.heroContainer) return;

    this.heroContainer.innerHTML = `
      <div class="hero-main-card">
        <div class="hero-img-wrap">
          <img src="${featured.heroImage}" alt="${featured.title}">
        </div>
        <div class="hero-overlay-gradient"></div>
        <div class="hero-content">
          <div class="hero-tag-row">
            <span class="badge-threat threat-critical">
              <i class="fas fa-radiation"></i> Risque ${featured.dangerLevel} (${featured.dangerScore})
            </span>
            <span class="badge-category">${featured.category}</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
              <i class="far fa-clock"></i> ${featured.readTime}
            </span>
          </div>
          <h1 class="hero-title">${featured.title}</h1>
          <p class="hero-subtitle">${featured.subtitle}</p>
          
          <div class="hero-meta-row">
            <div class="hero-author">
              <img src="${featured.author.avatar}" alt="${featured.author.name}" class="author-avatar">
              <div class="author-info">
                <div class="author-name">${featured.author.name}</div>
                <div class="author-role">${featured.author.role}</div>
              </div>
            </div>
            
            <div class="hero-cta-buttons">
              <button class="btn-primary" data-article-id="${featured.id}">
                <i class="fas fa-book-open"></i> Lire l'analyse intégrale
              </button>
              <a href="#barometre" class="btn-secondary">
                <i class="fas fa-chart-line"></i> Consulter le baromètre
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attacher l'événement de lecture
    this.heroContainer.querySelector('.btn-primary')?.addEventListener('click', () => {
      this.openReader(featured.id);
    });
  }

  renderSidebarGauges() {
    if (!this.gaugeSidebar) return;

    const gaugesHtml = STRATEGIC_INDICATORS.slice(0, 4).map(ind => {
      const percentage = (ind.score / 10) * 100;
      let colorClass = 'fill-amber';
      let scoreClass = 'med';
      if (ind.score >= 7.5) {
        colorClass = 'fill-crimson';
        scoreClass = 'high';
      } else if (ind.score < 6.5) {
        colorClass = 'fill-blue';
        scoreClass = 'med';
      }

      return `
        <div class="gauge-item">
          <div class="gauge-label-row">
            <span class="gauge-name">${ind.zone}</span>
            <span class="gauge-score ${scoreClass}">${ind.score}/10</span>
          </div>
          <div class="gauge-bar-track">
            <div class="gauge-bar-fill ${colorClass}" style="width: ${percentage}%"></div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem;">
            ${ind.type}
          </div>
        </div>
      `;
    }).join('');

    this.gaugeSidebar.innerHTML = gaugesHtml;
  }

  renderArticles() {
    if (!this.articlesGrid) return;

    const filtered = ARTICLES.filter(art => {
      const matchCat = this.currentCategory === 'all' || art.category === this.currentCategory;
      const matchSearch = !this.searchQuery || 
        art.title.toLowerCase().includes(this.searchQuery) ||
        art.subtitle.toLowerCase().includes(this.searchQuery) ||
        art.excerpt.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (this.articleCountLabel) {
      this.articleCountLabel.textContent = `${filtered.length} analyse${filtered.length > 1 ? 's' : ''} stratégique${filtered.length > 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
      this.articlesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-dim);"></i>
          <p>Aucune analyse ne correspond à vos critères de recherche.</p>
        </div>
      `;
      return;
    }

    this.articlesGrid.innerHTML = filtered.map(art => {
      let threatStyle = 'background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5);';
      if (art.dangerLevel === 'Critique') {
        threatStyle = 'background: rgba(230, 57, 70, 0.2); color: #ff6b77; border: 1px solid rgba(230, 57, 70, 0.5);';
      }

      return `
        <article class="article-card" data-id="${art.id}">
          <div class="card-img-wrap">
            <img src="${art.heroImage}" alt="${art.title}" loading="lazy">
            <span class="card-threat-badge" style="${threatStyle}">
              <i class="fas fa-triangle-exclamation"></i> ${art.dangerLevel}
            </span>
            <span class="card-category-badge">${art.category}</span>
          </div>
          
          <div class="card-body">
            <div class="card-meta-top">
              <span><i class="far fa-calendar-alt"></i> ${art.date}</span>
              <span>•</span>
              <span><i class="far fa-clock"></i> ${art.readTime}</span>
            </div>
            
            <h3 class="card-title">${art.title}</h3>
            <p class="card-excerpt">${art.excerpt}</p>
            
            <div class="card-footer">
              <div class="card-author-inline">
                <img src="${art.author.avatar}" alt="${art.author.name}" class="author-avatar-sm">
                <span class="author-name-sm">${art.author.name}</span>
              </div>
              
              <button class="read-btn" data-article-id="${art.id}">
                Lire <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attacher les clics d'ouverture
    this.articlesGrid.querySelectorAll('.read-btn, .card-title, .card-img-wrap').forEach(el => {
      el.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.article-card');
        if (card) {
          this.openReader(card.dataset.id);
        }
      });
    });
  }

  renderBarometer() {
    if (!this.barometerGrid) return;

    this.barometerGrid.innerHTML = STRATEGIC_INDICATORS.map(ind => {
      return `
        <div class="barometer-card">
          <div class="barometer-header">
            <div>
              <div class="barometer-zone">${ind.zone}</div>
              <div class="barometer-type">${ind.type}</div>
            </div>
            <div class="barometer-score-badge">${ind.score}</div>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.85rem; line-height: 1.5;">
            ${ind.summary}
          </p>

          <div class="barometer-factors">
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">
              Facteurs aggravants majeurs :
            </div>
            ${ind.aggravators.map(agg => `
              <div class="factor-item">
                <i class="fas fa-circle-exclamation"></i>
                <span>${agg}</span>
              </div>
            `).join('')}

            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 0.5rem;">
              Facteurs de résilience :
            </div>
            ${ind.resilience.map(res => `
              <div class="factor-item">
                <i class="fas fa-shield-halved"></i>
                <span>${res}</span>
              </div>
            `).join('')}
          </div>

          <div class="barometer-footer-meta">
            <span>Tendance : <strong>${ind.trend.toUpperCase()}</strong></span>
            <span>Horizon : <strong>${ind.timeHorizon}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderScenarios() {
    if (!this.scenariosGrid) return;

    this.scenariosGrid.innerHTML = CRISIS_SCENARIOS.map(sc => {
      return `
        <div class="scenario-card">
          <div class="scenario-code">${sc.code} • ${sc.category.toUpperCase()}</div>
          <h3 class="scenario-title">${sc.title}</h3>
          
          <div class="scenario-metrics">
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Probabilité estimée</span>
              <span class="scenario-metric-val">${sc.probability}</span>
            </div>
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Impact systémique</span>
              <span class="scenario-metric-val" style="color: var(--accent-crimson);">${sc.impact}</span>
            </div>
            <div class="scenario-metric-item">
              <span class="scenario-metric-label">Horizon critique</span>
              <span class="scenario-metric-val" style="color: var(--accent-cyan);">${sc.horizon}</span>
            </div>
          </div>

          <p class="scenario-desc">${sc.description}</p>
          
          <div class="scenario-trigger">
            <strong>Déclencheur modélisé :</strong> ${sc.trigger}
          </div>
        </div>
      `;
    }).join('');
  }

  openReader(articleId) {
    const article = ARTICLES.find(a => a.id === articleId);
    if (!article || !this.readerModal) return;

    this.activeArticleId = articleId;
    this.readerTitle.textContent = `${article.category} • ${article.title}`;

    this.readerContainer.innerHTML = `
      <div class="reader-header">
        <div class="hero-tag-row">
          <span class="badge-threat threat-critical">
            <i class="fas fa-biohazard"></i> Indice de Risque ${article.dangerScore}
          </span>
          <span class="badge-category">${article.category}</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
            <i class="far fa-clock"></i> ${article.readTime}
          </span>
        </div>

        <h1 class="reader-headline">${article.title}</h1>
        <p class="reader-subline">${article.subtitle}</p>

        <div class="reader-author-bar">
          <img src="${article.author.avatar}" alt="${article.author.name}" class="author-avatar">
          <div class="author-info">
            <div class="author-name">${article.author.name}</div>
            <div class="author-role">${article.author.role} • Publié le ${article.date}</div>
          </div>
        </div>
      </div>

      <div class="reader-key-takeaways">
        <h4><i class="fas fa-crosshairs"></i> Points Clés de l'Évaluation Stratégique</h4>
        <ul>
          ${article.keyTakeaways.map(pt => `<li>${pt}</li>`).join('')}
        </ul>
      </div>

      <div class="reader-body-content">
        ${article.contentHtml}
      </div>
    `;

    this.readerModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const scrollable = this.readerModal.querySelector('.reader-scroll-content');
    if (scrollable) scrollable.scrollTop = 0;
  }

  openSearchModal() {
    if (!this.searchModal) return;
    this.searchModal.classList.add('open');
    if (this.searchModalInput) {
      this.searchModalInput.value = '';
      setTimeout(() => this.searchModalInput.focus(), 100);
    }
    this.handleGlobalSearch('');
  }

  handleGlobalSearch(query) {
    if (!this.searchResultsContainer) return;
    const cleanQuery = query.toLowerCase().trim();

    const matches = ARTICLES.filter(art => {
      if (!cleanQuery) return true;
      return art.title.toLowerCase().includes(cleanQuery) ||
             art.subtitle.toLowerCase().includes(cleanQuery) ||
             art.category.toLowerCase().includes(cleanQuery) ||
             art.excerpt.toLowerCase().includes(cleanQuery);
    });

    if (matches.length === 0) {
      this.searchResultsContainer.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Aucun résultat pour "${query}"
        </div>
      `;
      return;
    }

    this.searchResultsContainer.innerHTML = matches.map(art => `
      <div class="search-result-item" data-id="${art.id}">
        <span class="search-result-category">${art.category} • ${art.readTime}</span>
        <div class="search-result-title">${art.title}</div>
      </div>
    `).join('');

    this.searchResultsContainer.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        this.closeAllModals();
        this.openReader(id);
      });
    });
  }

  closeAllModals() {
    if (this.readerModal) this.readerModal.classList.remove('open');
    if (this.searchModal) this.searchModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas fa-bell" style="color: var(--accent-crimson);"></i>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Initialisation dès chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.strategicApp = new StrategicApp();
});
