(() => {
  const domain = document.querySelector('meta[name="analytics-domain"]')?.content?.trim();
  const production = location.protocol === 'https:' && domain && location.hostname === domain;
  window.plausible = window.plausible || function () {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

  if (production) {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.append(script);
  }

  window.nydhTrack = (name, props = {}) => {
    window.plausible(name, { props });
    document.dispatchEvent(new CustomEvent('nydh:analytics', { detail: { name, props } }));
  };

  document.addEventListener('click', event => {
    const enquiry = event.target.closest('#contact a');
    if (enquiry) window.nydhTrack('Enquiry click', { channel: enquiry.href.includes('instagram') ? 'Instagram' : 'LinkedIn' });
  });
})();
