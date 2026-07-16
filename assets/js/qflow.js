
(function () {
  const gsapReady = () => window.gsap;

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  class QFlowEngine {
    constructor() {
      this.root = null;
      this.rail = null;
      this.topbarSteps = null;
      this.currentCard = null;
      this.answeredCount = 0;
      this.totalSteps = 1;
    }

    
    init(opts) {
      opts = opts || {};
      this.root = document.getElementById('qflow-root');
      if (!this.root) {
        this.root = el('div');
        this.root.id = 'qflow-root';
        this.root.className = 'qflow-stage';
        document.body.appendChild(this.root);
      }
      this.root.classList.add('qflow-stage');

      this.rail = document.querySelector('.progress-rail');
      if (!this.rail) {
        this.rail = el('div', 'progress-rail');
        this.rail.appendChild(el('div', 'progress-fill'));
        document.body.appendChild(this.rail);
      }
      this.fill = this.rail.querySelector('.progress-fill');

      // step dots (optional, injected into .steps if present)
      this.stepsMount = document.querySelector('.steps');
      if (this.stepsMount && Array.isArray(opts.steps)) {
        this.stepsMount.innerHTML = '';
        opts.steps.forEach((s) => {
          const dot = el('span', 'step-dot');
          if (s.key === opts.current) dot.classList.add('active');
          else if (s.done) dot.classList.add('done');
          dot.title = s.label || '';
          this.stepsMount.appendChild(dot);
        });
        const activeIdx = opts.steps.findIndex((s) => s.key === opts.current);
        const label = document.querySelector('.step-label');
        if (label && activeIdx > -1) {
          label.textContent = `Étape ${activeIdx + 1} / ${opts.steps.length} · ${opts.steps[activeIdx].label}`;
        }
      }

      this._questionCounter = 0;
      this._estimatedTotal = opts.estimatedTotal || 10;
      this._updateRail(0);

      return this;
    }

    _updateRail(pct) {
      if (this.fill) this.fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }

    _bumpProgress() {
      this._questionCounter++;
      const pct = Math.min(96, (this._questionCounter / this._estimatedTotal) * 100);
      this._updateRail(pct);
    }

    
    async _swap(buildFn) {
      const old = this.currentCard;
      if (old) {
        if (gsapReady()) {
          await new Promise((res) => {
            gsap.to(old, {
              opacity: 0, y: -18, scale: 0.97, filter: 'blur(4px)',
              duration: 0.28, ease: 'power2.in', onComplete: res
            });
          });
        } else {
          old.classList.add('qcard-exit');
          await new Promise((r) => setTimeout(r, 300));
        }
        old.remove();
      }
      const card = buildFn();
      this.root.appendChild(card);
      this.currentCard = card;

      if (gsapReady()) {
        gsap.fromTo(card,
          { opacity: 0, y: 26, scale: 0.97, filter: 'blur(6px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }
        );
      } else {
        card.classList.add('qcard-enter');
      }
      return card;
    }

    _baseCard(eyebrow, question) {
      const card = el('div', 'qcard');
      const head = el('div', 'qcard-head');
      const orb = el('div', 'orb thinking');
      const titles = el('div');
      const eyebrowEl = el('p', 'qcard-eyebrow');
      eyebrowEl.textContent = eyebrow || 'Assistant IA';
      const questionEl = el('h2', 'qcard-question');
      questionEl.textContent = question;
      titles.appendChild(eyebrowEl);
      titles.appendChild(questionEl);
      head.appendChild(orb);
      head.appendChild(titles);
      card.appendChild(head);
      // stop "thinking" spin shortly after appearing
      setTimeout(() => orb.classList.remove('thinking'), 650);
      return card;
    }

    
    ask(question, options) {
      options = options || {};
      this._bumpProgress();
      return new Promise((resolve) => {
        this._swap(() => {
          const card = this._baseCard(options.eyebrow, question);
          const body = el('div', 'qcard-body');

          const field = document.createElement(options.long ? 'textarea' : 'input');
          field.placeholder = options.placeholder || 'Votre réponse…';
          if (!options.long) field.type = options.password ? 'password' : 'text';
          body.appendChild(field);
          card.appendChild(body);

          const actions = el('div', 'qcard-actions');
          const hint = el('span', 'qcard-hint', options.long
            ? '<kbd>Ctrl</kbd> + <kbd>Enter</kbd> pour continuer'
            : '<kbd>Enter</kbd> pour continuer');
          const btn = el('button', 'pill', options.optional ? 'Passer / Continuer →' : 'Continuer →');
          btn.style.width = 'auto';
          actions.appendChild(hint);
          actions.appendChild(btn);
          card.appendChild(actions);

          const submit = () => {
            const value = field.value.trim();
            if (!value && !options.optional) {
              field.classList.add('shake');
              if (gsapReady()) {
                gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' });
              }
              return;
            }
            resolve(value);
          };

          btn.addEventListener('click', submit);
          field.addEventListener('keydown', (e) => {
            if (options.long) {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
            } else if (e.key === 'Enter') {
              e.preventDefault(); submit();
            }
          });

          setTimeout(() => field.focus(), 250);
          return card;
        });
      });
    }

    
    askChoice(question, choices, options) {
      options = options || {};
      this._bumpProgress();
      return new Promise((resolve) => {
        this._swap(() => {
          const card = this._baseCard(options.eyebrow, question);
          const body = el('div', 'qcard-body');
          const row = el('div', 'chip-row');
          choices.forEach((c, i) => {
            const chip = el('button', 'chip' + (i === 0 ? ' primary' : ''), c.label);
            chip.type = 'button';
            chip.style.width = 'auto';
            chip.addEventListener('click', () => resolve(c.value));
            row.appendChild(chip);
          });
          body.appendChild(row);
          card.appendChild(body);
          return card;
        });
      });
    }

    askYesNo(question, options) {
      return this.askChoice(question, [
        { label: 'Oui, continuer', value: true },
        { label: 'Non, terminer', value: false }
      ], options);
    }

    askMultiChoice(question, choices, options) {
      options = options || {};
      this._bumpProgress();
      return new Promise((resolve) => {
        this._swap(() => {
          const card = this._baseCard(options.eyebrow, question);
          const body = el('div', 'qcard-body');
          const row = el('div', 'chip-row');
          const selected = new Set();

          choices.forEach((c) => {
            const chip = el('button', 'chip', c.label);
            chip.type = 'button';
            chip.style.width = 'auto';
            chip.addEventListener('click', () => {
              if (selected.has(c.value)) {
                selected.delete(c.value);
                chip.classList.remove('primary');
              } else {
                selected.add(c.value);
                chip.classList.add('primary');
              }
            });
            row.appendChild(chip);
          });
          body.appendChild(row);
          card.appendChild(body);

          const actions = el('div', 'qcard-actions');
          const hint = el('span', 'qcard-hint', options.hint || 'Cliquez pour sélectionner, puis continuez (ou continuez sans rien choisir)');
          const btn = el('button', 'pill', options.buttonText || 'Continuer →');
          btn.style.width = 'auto';
          actions.appendChild(hint);
          actions.appendChild(btn);
          card.appendChild(actions);

          btn.addEventListener('click', () => resolve(Array.from(selected)));
          return card;
        });
      });
    }

    
    say(text) {
      if (!this.currentCard) return;
      const bubble = el('div', 'qbubble', `✨ ${text}`);
      this.currentCard.parentNode && this.currentCard.parentNode.insertBefore(bubble, this.currentCard);
      if (gsapReady()) {
        gsap.to(bubble, { opacity: 0, y: -8, duration: 0.5, delay: 2.2, onComplete: () => bubble.remove() });
      } else {
        setTimeout(() => bubble.remove(), 2600);
      }
    }

    finish(options) {
      options = options || {};
      this._updateRail(100);
      return this._swap(() => {
        const card = el('div', 'qcard');
        card.style.textAlign = 'center';
        const check = el('div', 'success-check', '✓');
        check.style.color = '#05060f';
        check.style.fontSize = '28px';
        check.style.fontWeight = '700';
        card.appendChild(check);
        card.appendChild(el('h2', 'qcard-question', options.title || 'Section terminée'));
        if (options.subtitle) {
          const sub = el('p', '', options.subtitle);
          sub.style.marginTop = '6px';
          card.appendChild(sub);
        }
        const btn = el('button', 'pill', options.buttonText || 'Continuer →');
        btn.style.marginTop = '22px';
        btn.style.width = 'auto';
        btn.addEventListener('click', () => {
          if (typeof options.onNext === 'function') options.onNext();
        });
        card.appendChild(btn);
        return card;
      });
    }

 
    custom(buildFn) {
      return this._swap(buildFn);
    }

   
    loading(show, text, sub) {
      let overlay = document.querySelector('.loader-overlay');
      if (!overlay) {
        overlay = el('div', 'loader-overlay');
        const box = el('div', 'loader-box');
        box.appendChild(el('div', 'loader-ring'));
        box.appendChild(el('div', 'loader-title', text || 'Génération en cours…'));
        box.appendChild(el('div', 'loader-sub', sub || 'Merci de patienter quelques instants'));
        overlay.appendChild(box);
        document.body.appendChild(overlay);
      } else {
        if (text) overlay.querySelector('.loader-title').textContent = text;
        if (sub) overlay.querySelector('.loader-sub').textContent = sub;
      }
      overlay.classList.toggle('show', !!show);
    }
  }

  window.QFlow = new QFlowEngine();
})();
