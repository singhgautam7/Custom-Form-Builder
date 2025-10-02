QUESTION_OPTIONS_HELP = {
    'dropdown': 'Options must be a JSON list. Each item can be a string or an object with {"label": "Display", "value": "stored_value"}. Example: ["Red", "Green"] or [{"label": "Red", "value": "red"}]',
    'radio': 'Same as dropdown: options must be a JSON list of choices (string or {label,value}).',
    'checkbox': 'Options must be a JSON list for multi-choice. Store selections as a list of values. Example: ["a", "b"].',
    'multiselect': 'Options must be a JSON list for multi-select. Example: [{"label":"One","value":1}, {"label":"Two","value":2}]',
    'date': 'Date options must be a JSON object: {"allow_past": true|false, "min_date": "YYYY-MM-DD", "max_date": "YYYY-MM-DD"}.',
    'email': 'Email options may contain {"pattern": "regex"} (optional).',
    'number': 'Number fields can use min_value / max_value on the model; options JSON is ignored.',
    'text': 'No options required for text.',
    'textarea': 'No options required for textarea.',
}
