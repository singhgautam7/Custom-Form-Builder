(function () {
  // Mapping must mirror strings. Keep in sync with backend/strings.py
  const HELP = {
    dropdown: 'Options must be a JSON list. Each item can be a string or an object with {"label": "Display", "value": "stored_value"}. Example: ["Red", "Green"] or [{"label": "Red", "value": "red"}]',
    radio: 'Same as dropdown: options must be a JSON list of choices (string or {label,value}).',
    checkbox: 'Options must be a JSON list for multi-choice. Store selections as a list of values. Example: ["a", "b"].',
    multiselect: 'Options must be a JSON list for multi-select. Example: [{"label":"One","value":1}, {"label":"Two","value":2}]',
    date: 'Date options must be a JSON object: {"allow_past": true|false, "min_date": "YYYY-MM-DD", "max_date": "YYYY-MM-DD"}.',
    email: 'Email options may contain {"pattern": "regex"} (optional).',
    number: 'Number fields can use min_value / max_value on the model; options JSON is ignored.',
    text: 'No options required for text.',
    textarea: 'No options required for textarea.',
  };

  function setOptionsHelp() {
    const typeField = document.querySelector('#id_question_type');
    const optionsLabel = document.querySelector('label[for="id_options"]');
    const helpEl = document.querySelector('#id_options_help');
    // Django places help text inside <p class="help"> after the field, but it's safer to recreate
    let helpPara = document.querySelector('#id_options_help');
    if (!helpPara) {
      const fieldRow = document.querySelector('#id_options').closest('.form-row');
      if (fieldRow) {
        helpPara = document.createElement('p');
        helpPara.id = 'id_options_help';
        helpPara.className = 'help';
        const input = document.querySelector('#id_options');
        input.parentNode.appendChild(helpPara);
      }
    }
    if (!typeField || !helpPara) return;
    const val = typeField.value;
    helpPara.textContent = HELP[val] || '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    setOptionsHelp();
    const typeField = document.querySelector('#id_question_type');
    if (typeField) {
      typeField.addEventListener('change', setOptionsHelp);
    }
  });
})();
