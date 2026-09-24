(() => {
  'use strict';

  const body = document.getElementById('challengeBody');
  if (!body) return;

  function enhanceLock6() {
    const cards = [...body.querySelectorAll('.question-card')];
    if (!cards.length) return;

    cards.forEach(card => {
      if (card.dataset.buttonEnhanced === 'true') return;

      const input = card.querySelector('input[type="checkbox"]');
      const label = card.querySelector('label');
      if (!input || !label) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'question-button';
      button.textContent = label.textContent;
      button.setAttribute('aria-pressed', String(input.checked));

      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        input.checked = !input.checked;
        button.classList.toggle('selected', input.checked);
        button.setAttribute('aria-pressed', String(input.checked));
      });

      input.classList.add('lock6-state-input');
      input.tabIndex = -1;
      label.hidden = true;
      card.appendChild(button);
      card.dataset.buttonEnhanced = 'true';
    });
  }

  const observer = new MutationObserver(enhanceLock6);
  observer.observe(body, { childList: true, subtree: true });
  enhanceLock6();
})();
