/* Inquiry attribution: first identifiable source in the current browser tab.
 * No advertising IDs, full referring URLs or personal form data are stored here.
 */
(function () {
  'use strict';
  var key = 'zarex.inquiry-source.v1';
  var params = new URLSearchParams(window.location.search);
  function clean(value) {
    return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 120);
  }
  function hostMatches(host, domain) {
    return host === domain || host.endsWith('.' + domain);
  }
  var referringHost = '';
  try { referringHost = new URL(document.referrer).hostname.toLowerCase(); } catch (_) {}
  var ownHost = function (host) { return host === 'zarex.si' || host === 'www.zarex.si'; };
  var source = clean(params.get('utm_source')).toLowerCase();
  var medium = clean(params.get('utm_medium')).toLowerCase();
  var campaign = clean(params.get('utm_campaign'));
  var paid = /^(cpc|ppc|paid|paid_social|paid-social|paid_search|paid-search|display)$/.test(medium);
  var current = {
    vir: 'Neposredno / vir ni znan',
    utm_source: source,
    utm_medium: medium,
    kampanja: campaign,
    vstopna_stran: window.location.pathname,
    napotitvena_domena: ownHost(referringHost) ? '' : referringHost
  };
  var googleClick = ['gclid', 'gbraid', 'wbraid'].some(function (name) { return !!params.get(name); });
  if (googleClick || (source === 'google' && paid)) {
    current.vir = 'Google Ads';
  } else if (/^(facebook|fb|instagram|ig|meta)$/.test(source) && paid) {
    current.vir = 'Meta oglasi (Facebook / Instagram)';
  } else if (source) {
    current.vir = source + (medium ? ' / ' + medium : '');
  } else if (hostMatches(referringHost, 'facebook.com') || hostMatches(referringHost, 'instagram.com') || params.get('fbclid')) {
    current.vir = 'Facebook / Instagram – vrsta obiska ni potrjena';
  } else if (/^(www\.)?google\.[a-z.]+$/.test(referringHost)) {
    current.vir = 'Google iskanje – brez oznake oglasa';
  } else if (referringHost && !ownHost(referringHost)) {
    current.vir = 'Napotitev: ' + referringHost;
  }
  var stored;
  try { stored = JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
  var identifiable = current.vir !== 'Neposredno / vir ni znan';
  // Keep the initial known source through internal navigation; upgrade an unknown arrival.
  if (!stored || !stored.vir || (stored.vir === 'Neposredno / vir ni znan' && identifiable)) {
    stored = current;
    try { sessionStorage.setItem(key, JSON.stringify(stored)); } catch (_) {}
  }
  var form = document.getElementById('offerForm');
  if (!form) return;
  Object.keys(current).forEach(function (name) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = clean(stored[name]);
    form.appendChild(input);
  });
}());
